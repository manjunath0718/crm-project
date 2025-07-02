const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const dashboardRoutes = require('./src/routes/dashboard.routes');
const employeeRoutes = require('./src/routes/employees.routes');
const profileRoutes = require('./src/routes/profile.routes');
const leadRoutes = require('./src/routes/leads.routes');
// const leadRoutes = require('./src/routes/leads.routes');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/JUN25')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/leads', leadRoutes);
// app.use('/api/leads', leadRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MERN Stack API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 