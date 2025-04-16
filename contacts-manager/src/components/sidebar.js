import React from 'react';
import { FaTachometerAlt, FaUsers, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/sidebar.css';
import api from '../api/api'; // Import Axios instance

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await api.post('/users/logout');
      localStorage.removeItem('userEmail'); // Clear stored email
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login'); // Navigate even if logout fails
    }
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <h3>Logo</h3>
      </div>
      <ul className="nav">
        <li
          className={location.pathname === '/login' ? 'active' : ''}
          onClick={() => navigate('/login')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/login')}
        >
          <span className="icon"><FaTachometerAlt /></span> Dashboard
        </li>
        <li
          className={location.pathname === '/contacts' ? 'active' : ''}
          onClick={() => navigate('/contacts')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/contacts')}
        >
          <span className="icon"><FaUsers /></span> Total contacts
        </li>
      </ul>
      <div
        className="logout"
        onClick={handleLogout}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleLogout()}
      >
        <span className="icon"><FaSignOutAlt /></span> Log out
      </div>
    </div>
  );
};

export default Sidebar;