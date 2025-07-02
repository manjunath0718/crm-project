try {
  const mongoose = require('mongoose');
  const Lead = require('../models/Lead');

  const MONGODB_URI = 'mongodb://localhost:27017/JUN25';

  async function deleteAllLeads() {
    try {
      await mongoose.connect(MONGODB_URI);
      const result = await Lead.deleteMany({});
      console.log(`Deleted ${result.deletedCount} leads.`);
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('Error deleting leads:', err);
      process.exit(1);
    }
  }

  deleteAllLeads();
} catch (outerErr) {
  console.error('Script failed to start:', outerErr);
  process.exit(1);
} 