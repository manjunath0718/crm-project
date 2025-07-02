const mongoose = require('mongoose');
const Employee = require('../models/Employee');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-app';

async function setAllInactive() {
  await mongoose.connect(MONGODB_URI);
  const result = await Employee.updateMany({}, { status: 'Inactive' });
  console.log(`Updated ${result.nModified || result.modifiedCount} employees to Inactive.`);
  await mongoose.disconnect();
}

setAllInactive().catch(err => {
  console.error('Error updating employees:', err);
  process.exit(1);
}); 