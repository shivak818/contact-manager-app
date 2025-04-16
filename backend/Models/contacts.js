import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  Name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  Designation: { 
    type: String, 
    required: true, 
    trim: true 
  },
  Company: { 
    type: String, 
    required: true, 
    trim: true 
  },
  Industry: { 
    type: String, 
    required: true, 
    trim: true 
  },
  Email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true, 
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'] 
  },
  Phonenumber: { 
    type: String, 
    required: true, 
    trim: true, 
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']

  },
  Country: { 
    type: String, 
    required: true, 
    trim: true 
  },
  addedDate: { 
    type: Date, 
    default: Date.now 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, {
  timestamps: true
});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;