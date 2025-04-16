import express from 'express';
import Contact from '../Models/contacts.js';
import { body, validationResult } from 'express-validator';
import { createObjectCsvWriter } from 'csv-writer';
import { authenticate } from '../middleware/auth.js'; // Import from new file

const router = express.Router();

// Add a new contact
router.post('/', authenticate, [
  body('Name').notEmpty().trim(),
  body('Designation').notEmpty().trim(),
  body('Company').notEmpty().trim(),
  body('Industry').notEmpty().trim(),
  body('Email').isEmail().normalizeEmail(),
  body('Phonenumber').matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number'),
  body('Country').notEmpty().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { Name, Designation, Company, Industry, Email, Phonenumber, Country, addedDate } = req.body;

    const contactExists = await Contact.findOne({ Email });
    if (contactExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newContact = new Contact({ 
      Name, 
      Designation, 
      Company, 
      Industry, 
      Email, 
      Phonenumber, 
      Country, 
      addedDate: addedDate || new Date(),
      userId: req.user.userId
    });

    await newContact.save();
    res.status(201).json({ message: 'Contact added successfully', contact: newContact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a contact by ID
router.put('/update/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { Name, Designation, Company, Industry, Email, Phonenumber, Country } = req.body;

  try {
    if (Email) {
      const contactExists = await Contact.findOne({ Email, _id: { $ne: id } });
      if (contactExists) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { Name, Designation, Company, Industry, Email, Phonenumber, Country },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json(updatedContact);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error while updating contact.' });
  }
});

// Fetch contacts with pagination and filters
router.get('/', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 11;
    const email = req.query.email;
    const addedDate = req.query.addedDate;
    const designation = req.query.designation; 

    let query = { userId: req.user.userId }; // Tie contacts to authenticated user

    if (email) {
      query.Email = { $regex: email, $options: 'i' };
    }

    if (addedDate) {
      const startOfDay = new Date(addedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(addedDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.addedDate = { $gte: startOfDay, $lte: endOfDay };
    }

    if (designation) {
      query.Designation = designation;
    }

    const contacts = await Contact.find(query)
      .limit(limit)
      .skip((page - 1) * limit);

    const totalContacts = await Contact.countDocuments(query);
    const totalPages = Math.ceil(totalContacts / limit);

    res.json({
      contacts,
      totalPages,
      total: totalContacts,
      page
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Import contacts
router.post('/import', authenticate, async (req, res) => {
  try {
    const { contacts } = req.body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ message: "Invalid contact data" });
    }

    const existingEmails = (await Contact.find({}, 'Email')).map(c => c.Email);
    const duplicates = contacts.filter(c => existingEmails.includes(c.Email));
    if (duplicates.length > 0) {
      return res.status(400).json({ message: "Duplicate emails found", duplicates });
    }

    const contactsWithUserId = contacts.map(contact => ({
      ...contact,
      userId: req.user.userId 
    }));

    await Contact.insertMany(contactsWithUserId);
    res.status(201).json({ message: "Contacts imported successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Export contacts as CSV
router.get('/export', async (req, res) => {
  try {
    const contacts = await Contact.find({});

    const csvWriter = createObjectCsvWriter({
      path: 'contacts.csv',
      header: [
        { id: 'Name', title: 'Name' },
        { id: 'Designation', title: 'Designation' },
        { id: 'Company', title: 'Company' },
        { id: 'Industry', title: 'Industry' },
        { id: 'Email', title: 'Email' },
        { id: 'Phonenumber', title: 'Phonenumber' },
        { id: 'Country', title: 'Country' },
        { id: 'addedDate', title: 'addedDate' }
      ]
    });

    const records = contacts.map(contact => ({
      Name: contact.Name,
      Designation: contact.Designation,
      Company: contact.Company,
      Industry: contact.Industry,
      Email: contact.Email,
      Phonenumber: contact.Phonenumber,
      Country: contact.Country,
      addedDate: contact.addedDate.toISOString()
    }));

    await csvWriter.writeRecords(records);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="contacts.csv"');
    res.status(200).sendFile('contacts.csv', { root: '.' });
  } catch (error) {
    res.status(500).json({ message: "Error exporting contacts", error });
  }
});

// Fetch all emails with pagination
router.get('/emails', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const emails = await Contact.find({}, 'Email')
      .limit(limit)
      .skip((page - 1) * limit);

    const totalEmails = await Contact.countDocuments();
    const totalPages = Math.ceil(totalEmails / limit);

    res.json({ emails, totalPages, page });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete multiple contacts
router.post('/delete', authenticate, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No contacts selected for deletion" });
    }
    await Contact.deleteMany({ _id: { $in: ids }, userId: req.user.userId }); // Restrict to user's contacts
    res.status(200).json({ message: "Contacts deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting contacts", error });
  }
});

// Fetch unique designations
router.get('/designations', async (req, res) => {
  try {
    const designations = await Contact.distinct('Designation');
    res.json({ designations });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching designations', error: error.message });
  }
});


export default router;