import React, { useState, useEffect, useRef } from 'react';
import {
  FaSearch,
  FaUserCircle,
  FaEdit,
  FaKey,
  FaCheck,
  FaTimes,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa'; // Removed FaSignOutAlt
import api from '../api/api';
import '../styles/header.css';

const Header = ({ setFilters }) => {
  const [emailInput, setEmailInput] = useState('');
  const [allEmails, setAllEmails] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchEmails = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/contacts/emails');
        const emailList = res.data.emails.map((item) => item.Email);
        setAllEmails(emailList);
      } catch (err) {
        console.error('Failed to fetch emails:', err);
        setErrorMessage('Failed to load emails');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmails();
  }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setLoggedInEmail(storedEmail);
      setEditedEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownVisible(false);
        setIsEditing(false);
        setShowChangePasswordForm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timeout = setTimeout(() => setErrorMessage(''), 4000);
      return () => clearTimeout(timeout);
    }
  }, [errorMessage]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setEmailInput(value);
    setFilters((prev) => ({ ...prev, email: value }));
    if (value.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
    } else {
      const matches = allEmails.filter((email) =>
        email.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(matches.slice(0, 5));
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (email) => {
    setEmailInput(email);
    setFilters((prev) => ({ ...prev, email }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/.test(password);

  const handleEmailSave = async () => {
    if (!validateEmail(editedEmail)) {
      setErrorMessage('Invalid email format');
      return;
    }

    if (editedEmail === loggedInEmail) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await api.put(`/users/update-email`, {
        oldEmail: loggedInEmail,
        newEmail: editedEmail,
      });
      setLoggedInEmail(editedEmail);
      localStorage.setItem('userEmail', editedEmail);
      setIsEditing(false);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedEmail(loggedInEmail);
    setIsEditing(false);
    setErrorMessage('');
  };

  const handleChangePassword = async () => {
    if (!validatePassword(newPassword)) {
      setErrorMessage('Password must be 8+ chars with uppercase and number');
      return;
    }

    setIsLoading(true);
    try {
      await api.put(`/users/change-password`, {
        email: loggedInEmail,
        oldPassword,
        newPassword,
      });
      setShowChangePasswordForm(false);
      setOldPassword('');
      setNewPassword('');
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1>Total Contacts</h1>
      </div>
      <div className="header-right">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by Email Id..."
            className="search-bar"
            value={emailInput}
            onChange={handleSearch}
            onFocus={() =>
              emailInput && suggestions.length > 0 && setShowSuggestions(true)
            }
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            disabled={isLoading}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {suggestions.map((email, idx) => (
                <li key={idx} onClick={() => handleSuggestionClick(email)}>
                  <FaSearch className="suggestion-icon" />
                  {email}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="user-dropdown-container" ref={dropdownRef}>
          <FaUserCircle
            className="profile-upload-icon"
            onClick={() => setDropdownVisible((prev) => !prev)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setDropdownVisible((prev) => !prev)}
          />
          {dropdownVisible && (
            <ul className="user-dropdown">
              <li className="email-edit-row">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      className="edit-email-input"
                      disabled={isLoading}
                    />
                    <FaCheck className="save-icon" onClick={handleEmailSave} />
                    <FaTimes className="cancel-icon" onClick={handleCancelEdit} />
                  </>
                ) : (
                  <>
                    <span className="logged-email">{loggedInEmail}</span>
                    <FaEdit className="edit-icon" onClick={() => setIsEditing(true)} />
                  </>
                )}
              </li>
              <li onClick={() => setShowChangePasswordForm((prev) => !prev)}>
                <FaKey className="dropdown-icon" />
                <span>Change Password</span>
              </li>
              {showChangePasswordForm && (
                <li className="password-change-form">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    placeholder="Old Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="password-input"
                    disabled={isLoading}
                  />
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="password-input"
                    disabled={isLoading}
                  />
                  <div className="password-actions">
                    <button onClick={handleChangePassword} disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setShowChangePasswordForm(false);
                        setOldPassword('');
                        setNewPassword('');
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    {showPasswords ? (
                      <FaEyeSlash
                        className="eye-icon"
                        onClick={() => setShowPasswords(false)}
                      />
                    ) : (
                      <FaEye
                        className="eye-icon"
                        onClick={() => setShowPasswords(true)}
                      />
                    )}
                  </div>
                </li>
              )}
              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </ul>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;