const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/farm', require('./routes/farmRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));

// Routes Placeholder
app.get('/', (req, res) => {
  res.json({ message: "Welcome to AgroSmart API 🌾" });
});

// Database Sync & Server Start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Ensure PostGIS extension exists for GEOMETRY support
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('🌍 PostGIS Extension Verified');

    await sequelize.sync({ alter: true });
    console.log('✅ PostgreSQL Database Connected & Synced');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Unable to connect to the database:', err);
    process.exit(1);
  }
};

startServer();
