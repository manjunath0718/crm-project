const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const Activity = require('../models/Activity');
const Lead = require('../models/Lead');

router.get('/', employeeController.getAllEmployees);
router.post('/', employeeController.createEmployee);
router.post('/login', employeeController.loginEmployee);
router.post('/logout', employeeController.logoutEmployee);
router.put('/:id/status', employeeController.updateEmployeeStatus);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);
router.post('/break', employeeController.addBreakSession);
router.get('/breaks', employeeController.getBreakSessions);

// Get recent activity for a specific employee
router.get('/:employeeId/activity', async (req, res) => {
  try {
    const { employeeId } = req.params;
    // Activities where performedBy is the employee (e.g., closed a deal)
    // or where the employee was assigned a lead (activityType: 'Lead Assignment', lead.assignedTo == employeeId)
    const closedActivities = await Activity.find({
      activityType: 'Deal Closed',
      performedBy: employeeId
    }).sort({ timestamp: -1 }).limit(10);

    // Find all lead IDs assigned to this employee
    const assignedLeads = await Lead.find({ assignedTo: employeeId }).select('_id');
    const assignedLeadIds = assignedLeads.map(l => l._id);
    const assignedActivities = await Activity.find({
      activityType: 'Lead Assignment',
      lead: { $in: assignedLeadIds }
    }).sort({ timestamp: -1 }).limit(10);

    // Combine and sort by timestamp
    const allActivities = [...closedActivities, ...assignedActivities].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
    res.json(allActivities);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch employee activity.' });
  }
});

module.exports = router; 