const Employee = require('../models/Employee');

// @desc    Get user profile
// @route   GET /api/profile/:id
// @access  Private
const getProfile = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile by email
// @route   GET /api/profile/email/:email
// @access  Private
const getProfileByEmail = async (req, res) => {
  try {
    const employee = await Employee.findOne({ email: req.params.email }).select('-password');
    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile/:id
// @access  Private
const updateProfile = async (req, res) => {
  try {
    // Use upsert: true to create if not exists
    const update = { ...req.body };
    if (update.firstName && update.lastName) {
      update.name = `${update.firstName} ${update.lastName}`;
    }
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).select('-password');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProfile,
  getProfileByEmail,
  updateProfile,
}; 