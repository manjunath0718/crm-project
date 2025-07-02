const express = require('express');
const { getDashboardStats, getSalesAnalytics, getRecentActivityFeed, getActiveEmployeesList } = require('../controllers/dashboard.controller');
const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/sales-analytics', getSalesAnalytics);
router.get('/recent-activity', getRecentActivityFeed);
router.get('/active-employees', getActiveEmployeesList);

module.exports = router; 