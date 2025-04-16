import React, { useState, useEffect, useRef } from 'react';
import {
  FaCalendarAlt,
  FaFilter,
  FaTrash,
  FaFileImport,
  FaFileExport,
  FaChevronDown,
  FaCloudUploadAlt,
} from 'react-icons/fa';
import api from '../api/api';
import '../styles/toolbar.css';

const Toolbar = ({ setFilters, selectedContactIds, onDelete, resetFilters }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [designations, setDesignations] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchDesignations = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/contacts/designations');
        setDesignations(response.data.designations || []);
      } catch (err) {
        console.error('Error fetching designations:', err);
        setErrorMessage('Failed to load designations');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDesignations();
  }, []);

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setFilters((prev) => ({ ...prev, addedDate: date }));
  };

  const handleDesignationSelect = (designation) => {
    setFilters((prev) => ({ ...prev, designation: designation || undefined }));
    setIsDropdownOpen(false);
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(Boolean);
        const [headerLine, ...rows] = lines;
        const headers = headerLine.split(',').map((h) => h.trim());

        const requiredHeaders = ['Name', 'Designation', 'Company', 'Industry', 'Email', 'Phonenumber', 'Country'];
        const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
        if (missingHeaders.length > 0) {
          setErrorMessage(`Missing required headers: ${missingHeaders.join(', ')}`);
          return;
        }

        const contacts = rows.map((row) => {
          const values = row.split(',').map((v) => v.trim());
          const contact = {};
          headers.forEach((header, index) => {
            contact[header] = values[index];
          });
          return contact;
        });

        await api.post('/contacts/import', { contacts });
        setImportSuccess(true);
        setTimeout(() => {
          setIsImportModalOpen(false);
          setImportSuccess(false);
          window.location.reload();
        }, 2000);
      } catch (err) {
        console.error('Error importing contacts:', err);
        setErrorMessage(err.response?.data?.message || 'Failed to import contacts');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleExport = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await api.get('/contacts/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'contacts.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting contacts:', err);
      setErrorMessage('Failed to export contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContactIds.length === 0) {
      setErrorMessage('No contacts selected for deletion');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedContactIds.length} contact(s)?`)) {
      setIsLoading(true);
      setErrorMessage('');
      try {
        await api.post('/contacts/delete', { ids: selectedContactIds });
        onDelete();
      } catch (err) {
        console.error('Error deleting contacts:', err);
        setErrorMessage('Failed to delete selected contacts');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDateButtonClick = () => {
    document.getElementById('date-input').click();
  };

  return (
    <>
      <div className={`toolbar ${isLoading ? 'loading' : ''}`}>
        <div className="toolbar-left">
          <div
            className="btn date-picker"
            onClick={handleDateButtonClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleDateButtonClick()}
          >
            <FaCalendarAlt />
            <span>Select Date</span>
            <FaChevronDown />
            <input
              id="date-input"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
              aria-label="Select date"
            />
          </div>
          <div className="btn filter-dropdown">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} disabled={isLoading}>
              <FaFilter /> Filter <FaChevronDown />
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div
                  onClick={() => handleDesignationSelect('')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleDesignationSelect('')}
                >
                  All Designations
                </div>
                {designations.map((designation) => (
                  <div
                    key={designation}
                    onClick={() => handleDesignationSelect(designation)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleDesignationSelect(designation)}
                  >
                    {designation}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="btn" onClick={resetFilters} disabled={isLoading}>
            Reset Filters
          </button>
        </div>
        <div className="toolbar-right">
          <button className="btn" onClick={handleBulkDelete} disabled={isLoading}>
            <FaTrash /> Delete
          </button>
          <button className="btn" onClick={() => setIsImportModalOpen(true)} disabled={isLoading}>
            <FaFileImport /> Import
          </button>
          <button className="btn" onClick={handleExport} disabled={isLoading}>
            <FaFileExport /> Export
          </button>
        </div>
      </div>
      {isImportModalOpen && (
        <div className="import-modal-overlay">
          <div className="import-modal">
            <div
              className="import-icon"
              onClick={handleFileClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleFileClick()}
            >
              <FaCloudUploadAlt size={40} />
            </div>
            <p>Import File</p>
            <span
              className="subtext"
              onClick={handleFileClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleFileClick()}
            >
              Drag & Drop a CSV File to <strong>Upload</strong>
            </span>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImport}
            />
            {importSuccess && <p className="success-message">Contacts imported successfully!</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button
              className="cancel-btn"
              onClick={() => setIsImportModalOpen(false)}
              disabled={isLoading}
            >
              {isLoading ? 'Uploading...' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
      {importSuccess && !isImportModalOpen && (
        <div className="import-success-message">Contacts imported successfully!</div>
      )}
    </>
  );
};

export default Toolbar;