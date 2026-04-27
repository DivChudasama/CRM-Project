const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Route files
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const activityRoutes = require('./routes/activities');
const userRoutes = require('./routes/users');

const app = express();

// Body parser — 10mb limit to support base64 avatar uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enable CORS for frontend
app.use(cors());

// ============================================================
// Home Route (Added for Health Check)
// ============================================================
app.get('/', (req, res) => {
  res.status(200).send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h1 style="color: #10b981;">🚀 CRM Backend is Live!</h1>
      <p>The Enterprise CRM API server is running successfully.</p>
      <p>Mode: <b>${process.env.NODE_ENV || 'development'}</b></p>
      <hr style="width: 200px; margin: 20px auto;">
      <p style="font-size: 0.8rem; color: #6b7280;">Deployed by Divyesh Chudasama</p>
    </div>
  `);
});

// ============================================================
// Mount API Routers
// ============================================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use('/api/v1/users', userRoutes);

const PORT = process.env.PORT || 5000;

const connectToDB = require('./config/db');

// ============================================================
// MongoDB Database Connection
// ============================================================
connectToDB();

app.listen(PORT, () => {
  console.log(`🌐 CRM Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;