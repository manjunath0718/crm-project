const cron = require('node-cron');
const mongoose = require('mongoose');
const Employee = require('../models/Employee');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/JUN25';

async function autoLogoutEmployees() {
  await mongoose.connect(MONGODB_URI);
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  // Find employees who are still Active
  const employees = await Employee.find({ status: 'Active' });

  for (const emp of employees) {
    // Assuming emp.breaks[0] is today's session (adjust if needed)
    if (emp.breaks && emp.breaks.length > 0) {
      const lastSession = emp.breaks[0];
      // If checked in today but not checked out
      if (lastSession.start && !lastSession.end) {
        // Set status to Inactive
        emp.status = 'Inactive';
        // Set check-out time to 11:55 PM
        lastSession.end = `${today}T23:55:00.000Z`;
        await emp.save();
        console.log(`Auto-logged out: ${emp.name} at 11:55 PM`);
      }
    }
  }
  await mongoose.disconnect();
}

// Schedule to run every day at 11:55 PM
cron.schedule('55 23 * * *', autoLogoutEmployees);

console.log('Auto-logout cron job scheduled for 11:55 PM daily.'); 