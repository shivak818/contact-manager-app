import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/signup.css';
import api from '../api/api'; // Import Axios instance

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password) => /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/.test(password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!validateEmail(email)) {
            setErrorMessage('Please enter a valid email address');
            return;
        }
        if (!validatePassword(password)) {
            setErrorMessage('Password must be 8+ characters with at least one uppercase letter and one number');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage('Password and Confirm Password must match');
            return;
        }

        setIsLoading(true);
        try {
             await api.post('/users/signup', { email, password });
            setIsLoading(false);
            navigate('/login');
        } catch (error) {
            setIsLoading(false);
            const message = error.response?.data?.message || 'An error occurred. Please try again.';
            setErrorMessage(message);
            console.error('Error during signup:', error);
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
        <div className="signup-container">
            <div className="decor-circle circle-top-left"></div>
            <div className="decor-circle circle-bottom-right"></div>
            <div className="dotted-grid grid-top-right">{renderDots()}</div>
            <div className="dotted-grid grid-bottom-left">{renderDots()}</div>
            <div className="signup-card">
                <h2 className="signup-title">Logo</h2>
                <p className="signup-subtitle">Create New Account</p>
                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="input-wrapper">
                        <input
                            type="email"
                            id="email"
                            placeholder="Mail ID"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input-field"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="input-wrapper">
                        <input
                            type="password"
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="input-field"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="input-wrapper">
                        <input
                            type="password"
                            id="confirmPassword"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="input-field"
                            disabled={isLoading}
                        />
                    </div>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    <button type="submit" className="btn signup-btn" disabled={isLoading}>
                        {isLoading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Signup;