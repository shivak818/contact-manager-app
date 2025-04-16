import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login';
import Signup from './components/signup';
import Logout from './components/logout';
import TotalContacts from './pages/totalcontacts';
import api from './api/api';
import './App.css';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  console.log('PrivateRoute - Loading:', loading, 'Authenticated:', isAuthenticated);
  if (loading) return <div>Loading authentication status...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/users/me');
        console.log('Auth check success:', response.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.log('Auth check failed:', err.response?.status, err.response?.data || err.message);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, loading }}>
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/contacts"
            element={<PrivateRoute><TotalContacts /></PrivateRoute>}
          />
          <Route
            path="/dashboard"
            element={<PrivateRoute><TotalContacts /></PrivateRoute>}
          />
          <Route
            path="/logout"
            element={<PrivateRoute><Logout /></PrivateRoute>}
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;