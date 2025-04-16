import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../App';
import api from '../api/api';
import '../styles/login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/users/login', { email, password });
      console.log('Login response:', response.data); // Debug log
      if (response.status === 200) {
        localStorage.setItem('userEmail', response.data.user.email);
        setIsAuthenticated(true);
        navigate('/contacts');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'An error occurred. Please try again.';
      setErrorMessage(message);
      console.error('Login error:', error.response?.status, error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDots = () => {
    const dots = [];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 6; col++) {
        dots.push(<div key={`${row}-${col}`}></div>);
      }
    }
    return dots;
  };

  return (
    <div className={`login-container ${isLoading ? 'loading' : ''}`}>
      <div className="decor-circle circle-top-left"></div>
      <div className="decor-circle circle-bottom-right"></div>
      <div className="dotted-grid grid-top-right">{renderDots()}</div>
      <div className="dotted-grid grid-bottom-left">{renderDots()}</div>
      <div className="login-card">
        <h2 className="login-title">Logo</h2>
        <p className="login-subtitle">Enter your credentials to access your account</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-wrapper">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
              disabled={isLoading}
            />
          </div>
          <div className="input-wrapper password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
              disabled={isLoading}
            />
            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit" className="btn signin-btn" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
          <p className="signup-link">
            Don’t have an account?{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => navigate('/signup')}
              disabled={isLoading}
            >
              Sign Up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login