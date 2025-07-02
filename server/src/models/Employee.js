const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
  name: { 
    type: String,
     required: true 
    },
  email: { 
    type: String,
     required: true,
      unique: true
     },
  phone: {
    type: String,
    required: true
  },
  employeeId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: {
     type: String,
      required: true
     },
  role: { 
    type: String, 
    enum: ['Admin', 'Employee'], 
    default: 'Employee' 
  },
  status: { 
    type: String,
    enum: ['Active', 'Inactive', 'On Break'],
    default: 'Inactive'
  },
  location: { 
    type: String 
  },
  language: { 
    type: String 
  },
  assignedLeads: { 
    type: Number, 
    default: 0
   },
  closedLeads: { 
    type: Number, 
    default: 0 
  },
  breaks: [
    {
      start: { type: Date },
      end: { type: Date },
      date: { type: Date },
    }
  ],
});

// Hash password before saving
employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
employeeSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Employee', employeeSchema); 