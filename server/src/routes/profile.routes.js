const express = require('express');
const router = express.Router();
const {
  getProfile,
  getProfileByEmail,
  updateProfile,
} = require('../controllers/profile.controller');

// For now, these routes are not protected.
// In a real app, you would add authentication middleware.
router.route('/:id').get(getProfile).put(updateProfile);
router.route('/email/:email').get(getProfileByEmail);

module.exports = router; 