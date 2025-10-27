import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import userRoutes from './Routes/userRoute.js';
import contactRoutes from './Routes/contactRoute.js';

dotenv.config();

console.log('MONGO_URI:', process.env.MONGO_URI); // Debug: Verify URI

const app = express();

// ✅ 1️⃣ Update CORS for your deployed Netlify frontend
app.use(cors({
  origin: 'https://contacts-manager6.netlify.app', // your live frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// ✅ 2️⃣ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ✅ 3️⃣ Add a root route to avoid "Cannot GET /"
app.get('/', (req, res) => {
  res.send('Backend server is running successfully 🚀');
});

// ✅ Your existing routes
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
