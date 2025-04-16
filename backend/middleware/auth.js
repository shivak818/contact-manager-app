// middleware/auth.js
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Unauthorized - No token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};