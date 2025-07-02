const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  description: {
     type: String,
      required: true
     },
  timestamp: { 
    type: Date,
     default: Date.now
     },
  performedBy: {
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'Employee' 
    },
  lead: { type: mongoose.Schema.Types.ObjectId,
     ref: 'Lead' 
    },
  activityType: { type: String,
     enum: ['Lead Assignment', 'Deal Closed', 'Employee Check-in', 'Employee Check-out', 'Break Start', 'Break End'], 
     required: true 
    },
});

module.exports = mongoose.model('Activity', activitySchema); 