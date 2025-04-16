import React, { useState, useEffect, useCallback } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import api from '../api/api';
import '../styles/contacts.css';

const ContactsTable = ({ onDelete, page, setTotalPages, filters, onSelectContacts, setError }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editContactId, setEditContactId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const limit = 11;

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (filters.email) params.email = filters.email;
      if (filters.addedDate) params.addedDate = filters.addedDate;
      if (filters.designation) params.designation = filters.designation;

      const response = await api.get('/contacts', { params });

      if (!response.data.contacts) {
        throw new Error('Invalid response structure: "contacts" key missing');
      }

      setContacts(response.data.contacts);
      setTotalPages(response.data.totalPages || 1);
      setError(null);
    } catch (err) {
      setError('Failed to fetch contacts: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [page, filters, setTotalPages, setError]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(contacts.map((contact) => contact._id));
    } else {
      setSelectedIds([]);
    }
  };

  useEffect(() => {
    onSelectContacts(selectedIds);
  }, [selectedIds, onSelectContacts]);

  const handleDelete = async (id) => {
    if (editContactId) return; // Disable delete during edit
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await api.post('/contacts/delete', { ids: [id] });
        onDelete();
        fetchContacts();
      } catch (err) {
        console.error('Error deleting contact:', err);
        setError('Failed to delete contact');
      }
    }
  };

  const handleEditClick = (contact) => {
    setEditContactId(contact._id);
    setEditFormData({
      Name: contact.Name,
      Designation: contact.Designation,
      Company: contact.Company,
      Industry: contact.Industry,
      Email: contact.Email,
      Phonenumber: contact.Phonenumber,
      Country: contact.Country,
    });
  };

  const handleEditChange = (e, field) => {
    setEditFormData({ ...editFormData, [field]: e.target.value });
  };

  const handleSaveEdit = async (id) => {
    try {
      await api.put(`/contacts/update/${id}`, editFormData);
      setEditContactId(null); // Exit edit mode after saving
      fetchContacts(); // Refresh the contact list
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update contact');
    }
  };

  if (loading) return <div className="loading">Loading contacts...</div>;
  if (contacts.length === 0) return <div>No contacts found.</div>;

  return (
    <div className="contacts-table">
      <table>
        <thead>
          <tr>
            <th scope="col">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedIds.length === contacts.length && contacts.length > 0}
              />
            </th>
            <th scope="col">Name</th>
            <th scope="col">Designation</th>
            <th scope="col">Company</th>
            <th scope="col">Industry</th>
            <th scope="col">Email</th>
            <th scope="col">Phone number</th>
            <th scope="col">Country</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact._id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(contact._id)}
                  onChange={() => handleCheckboxChange(contact._id)}
                  disabled={editContactId === contact._id}
                />
              </td>
              {['Name', 'Designation', 'Company', 'Industry', 'Email', 'Phonenumber', 'Country'].map(
                (field) => (
                  <td key={field}>
                    {editContactId === contact._id ? (
                      <input
                        value={editFormData[field] || ''}
                        onChange={(e) => handleEditChange(e, field)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit(contact._id);
                          }
                        }}
                      />
                    ) : field === 'Email' ? (
                      <span className="email-cell" title={contact[field]}>
                        {contact[field]}
                      </span>
                    ) : (
                      contact[field]
                    )}
                  </td>
                )
              )}
              <td>
                <div className="action-icons">
                  {editContactId === contact._id ? (
                    <></> // Empty fragment to remove "Save" and "Cancel" buttons
                  ) : (
                    <>
                      <span
                        className={`action-icon ${editContactId ? 'disabled' : ''}`}
                        onClick={() => handleEditClick(contact)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleEditClick(contact)}
                      >
                        <FaEdit />
                      </span>
                      <span
                        className={`action-icon ${editContactId ? 'disabled' : ''}`}
                        onClick={() => handleDelete(contact._id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleDelete(contact._id)}
                      >
                        <FaTrash />
                      </span>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactsTable;