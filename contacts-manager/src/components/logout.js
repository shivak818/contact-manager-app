import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import api from '../api/api';

function Logout() {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const clickHandler = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/users/logout');
      localStorage.removeItem('userEmail');
      setIsAuthenticated(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={clickHandler} disabled={isLoading} aria-label="Logout">
        {isLoading ? 'Logging out...' : 'Logout'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Logout;