const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const leadController = require('../controllers/lead.controller');

// CSV upload endpoint
router.post('/upload-csv', upload.single('file'), leadController.uploadCsv);

router.get('/', leadController.getAllLeads);

// Get leads assigned to a specific employee
router.get('/assigned-to/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    let leads = await require('../models/Lead').find({ assignedTo: employeeId }).populate('assignedTo', 'name email');
    // Map status 'Open' to 'Ongoing' for employee view
    leads = leads.map(lead => {
      const obj = lead.toObject();
      if (obj.status === 'Open') obj.status = 'Ongoing';
      return obj;
    });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch assigned leads.' });
  }
});

// TEMP: Delete all leads (for admin/testing only)
router.delete('/delete-all', async (req, res) => {
  console.log('DELETE /api/leads/delete-all endpoint hit');
  try {
    const result = await require('../models/Lead').deleteMany({});
    res.json({ message: 'All leads deleted', deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete leads', error: err.message });
  }
});

// Update lead status or scheduledDate
router.patch('/:id', leadController.updateLeadStatus);

// Get lead distribution status for all employees
router.get('/distribution', leadController.getLeadDistribution);

module.exports = router; 