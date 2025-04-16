import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'; // Add this
import userRoutes from './Routes/userRoute.js';
import contactRoutes from './Routes/contactRoute.js';

dotenv.config();

console.log('MONGO_URI:', process.env.MONGO_URI); // Debug: Verify URI

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser()); // Add this to parse cookies

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));