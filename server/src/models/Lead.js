const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  status: { type: String, enum: ['Open', 'Closed', 'Ongoing', 'Pending'], default: 'Open' },
  type: { type: String, enum: ['Hot', 'Warm', 'Cold'], default: 'Warm', required: true },
  leadDate: { type: Date, default: Date.now },
  language: { type: String, required: true },
  location: { type: String, required: true },
  scheduledDate: { type: Date },
  closedDate: { type: Date },
});

leadSchema.pre('validate', function(next) {
  if (!this.email && !this.phone) {
    next(new Error('Either email or phone number is required.'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Lead', leadSchema); 