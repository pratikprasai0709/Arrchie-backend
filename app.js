import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env variables early
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/auth.route.js';
import userroutes from './routes/user.route.js';
import productRoutes from './routes/product.route.js';
import orderRoutes from './routes/order.route.js';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://arrchie-frontend.vercel.app',
  credentials: true
}));

app.use(express.json());

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userroutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// test route
app.get("/", (req, res) => {
  res.send("API is running");
});

export default app;

