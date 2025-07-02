const Lead = require('../models/Lead');
const Employee = require('../models/Employee');
const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Activity = require('../models/Activity');

// Helper: Find employee by name (case-insensitive, trims)
async function findEmployeeByName(name) {
  if (!name) return null;
  return Employee.findOne({
    name: { $regex: new RegExp('^' + name.trim() + '$', 'i') }
  });
}

// Helper function to distribute leads fairly based on current lead counts
async function distributeLeadsFairly(leadsToDistribute, excludeEmployeeId = null) {
  try {
    // Get all employees (excluding the specified one if provided)
    const query = { role: 'Employee' };
    if (excludeEmployeeId) {
      query._id = { $ne: excludeEmployeeId };
    }
    
    const employees = await Employee.find(query);
    
    if (employees.length === 0) {
      return { message: 'No employees available for lead distribution' };
    }

    // Get current lead counts for all employees
    const employeesWithCounts = await Promise.all(
      employees.map(async (emp) => {
        const assignedLeads = await Lead.countDocuments({ assignedTo: emp._id });
        return {
          employeeId: emp._id,
          name: emp.name,
          currentAssignedLeads: assignedLeads
        };
      })
    );

    // Sort employees by current lead count (ascending)
    employeesWithCounts.sort((a, b) => a.currentAssignedLeads - b.currentAssignedLeads);

    const leadsCount = leadsToDistribute.length;
    const employeesCount = employees.length;
    
    console.log(`Distributing ${leadsCount} leads among ${employeesCount} employees`);

    // Distribution logic
    let distributionMap = {};
    
    if (leadsCount === employeesCount) {
      // Assign one lead to each employee
      for (let i = 0; i < leadsCount; i++) {
        const employeeId = employeesWithCounts[i].employeeId;
        const lead = leadsToDistribute[i];
        
        if (!distributionMap[employeeId]) {
          distributionMap[employeeId] = {
            name: employeesWithCounts[i].name,
            assignedLeads: 0
          };
        }
        distributionMap[employeeId].assignedLeads++;
      }
    } else if (leadsCount < employeesCount) {
      // Assign one lead to the leadsCount number of employees with fewest leads
      for (let i = 0; i < leadsCount; i++) {
        const employeeId = employeesWithCounts[i].employeeId;
        const lead = leadsToDistribute[i];
        
        if (!distributionMap[employeeId]) {
          distributionMap[employeeId] = {
            name: employeesWithCounts[i].name,
            assignedLeads: 0
          };
        }
        distributionMap[employeeId].assignedLeads++;
      }
    } else {
      // leadsCount > employeesCount
      // Round-robin distribution starting with employees who have the least leads
      for (let i = 0; i < leadsCount; i++) {
        const employeeIndex = i % employeesCount;
        const employeeId = employeesWithCounts[employeeIndex].employeeId;
        const lead = leadsToDistribute[i];
        
        if (!distributionMap[employeeId]) {
          distributionMap[employeeId] = {
            name: employeesWithCounts[employeeIndex].name,
            assignedLeads: 0
          };
        }
        distributionMap[employeeId].assignedLeads++;
      }
    }

    // Get final lead counts for all employees
    const finalDistribution = await Promise.all(
      Object.keys(distributionMap).map(async (employeeId) => {
        const totalAssignedLeads = await Lead.countDocuments({ assignedTo: employeeId });
        return {
          employeeId,
          name: distributionMap[employeeId].name,
          newlyAssignedLeads: distributionMap[employeeId].assignedLeads,
          totalAssignedLeads
        };
      })
    );

    return {
      message: `Successfully distributed ${leadsCount} leads`,
      distribution: finalDistribution
    };

  } catch (error) {
    console.error('Error distributing leads fairly:', error);
    throw error;
  }
}

// Helper: Fair distribution of leads among employees
function distributeLeads(leads, employees) {
  // Group employees by language and location
  const byLangLoc = {};
  const byLang = {};
  const byLoc = {};
  employees.forEach(emp => {
    if (emp.language && emp.location) {
      const key = emp.language + '|' + emp.location;
      if (!byLangLoc[key]) byLangLoc[key] = [];
      byLangLoc[key].push(emp);
    }
    if (emp.language) {
      if (!byLang[emp.language]) byLang[emp.language] = [];
      byLang[emp.language].push(emp);
    }
    if (emp.location) {
      if (!byLoc[emp.location]) byLoc[emp.location] = [];
      byLoc[emp.location].push(emp);
    }
  });

  // Track how many leads each employee gets
  const empLeadCounts = {};
  employees.forEach(emp => { empLeadCounts[emp._id.toString()] = 0; });

  // Assign leads
  const assignments = [];
  leads.forEach(lead => {
    let candidates = [];
    // 1. Match by both language and location
    if (lead.language && lead.location) {
      const key = lead.language + '|' + lead.location;
      candidates = byLangLoc[key] || [];
    }
    // 2. If none, match by language
    if (candidates.length === 0 && lead.language) {
      candidates = byLang[lead.language] || [];
    }
    // 3. If none, match by location
    if (candidates.length === 0 && lead.location) {
      candidates = byLoc[lead.location] || [];
    }
    // 4. If still none, use all employees
    if (candidates.length === 0) {
      candidates = employees;
    }
    // Find the candidate with the fewest leads assigned so far
    let minCount = Infinity;
    let chosen = null;
    candidates.forEach(emp => {
      const count = empLeadCounts[emp._id.toString()];
      if (count < minCount) {
        minCount = count;
        chosen = emp;
      }
    });
    if (chosen) {
      empLeadCounts[chosen._id.toString()]++;
      assignments.push({ lead, employee: chosen });
    } else {
      assignments.push({ lead, employee: null });
    }
  });
  return assignments;
}

exports.uploadCsv = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const results = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        console.log('Parsed CSV rows:', results);
        
        // Fetch all employees once
        const employees = await Employee.find({ role: 'Employee' });
        if (!employees.length) {
          fs.unlinkSync(filePath);
          return res.status(400).json({ message: 'No employees found in the system. Cannot assign leads.' });
        }
        
        const employeeNameMap = {};
        employees.forEach(emp => {
          employeeNameMap[emp.name.trim().toLowerCase()] = emp;
        });

        // Prepare leads
        const leadsToInsert = [];
        const unassignedLeads = [];
        let assignedCount = 0;
        let skippedRows = 0;

        // Process each row
        for (const row of results) {
          // Skip empty rows
          if (!row.Name || !row.Email || !row.Phone) {
            skippedRows++;
            continue;
          }

          // Create lead object with proper validation
          const lead = {
            name: row.Name.trim(),
            email: row.Email.trim(),
            phone: row.Phone.trim(),
            status: row.Status || 'Open',
            type: row.Type || 'Warm',
            language: row.Language || 'English',
            location: row.Location || 'Unknown',
            leadDate: row['Received Date'] ? new Date(row['Received Date']) : new Date(),
          };

          // Validate required fields
          if (!lead.email || !lead.phone || !lead.language || !lead.location) {
            skippedRows++;
            continue;
          }

          let assignedTo = null;
          
          // Check if employee is already assigned
          if (row['Assigned Employee'] && row['Assigned Employee'].trim()) {
            const empName = row['Assigned Employee'].trim();
            const emp = employeeNameMap[empName.toLowerCase()];
            if (emp) {
              assignedTo = emp._id;
              assignedCount++;
            }
          }

          if (assignedTo) {
            lead.assignedTo = assignedTo;
            leadsToInsert.push(lead);
          } else {
            unassignedLeads.push(lead);
          }
        }

        console.log('Valid leads to insert:', leadsToInsert.length);
        console.log('Unassigned leads:', unassignedLeads.length);
        console.log('Skipped rows:', skippedRows);

        if (!results.length || (!leadsToInsert.length && !unassignedLeads.length)) {
          fs.unlinkSync(filePath);
          return res.status(400).json({ message: 'No valid leads found in the CSV file.' });
        }

        // Distribute unassigned leads
        if (unassignedLeads.length > 0) {
          const assignments = distributeLeads(unassignedLeads, employees);
          assignments.forEach(({ lead, employee }) => {
            if (employee) {
              lead.assignedTo = employee._id;
              assignedCount++;
            }
            leadsToInsert.push(lead);
          });
        }

        // Insert all leads into database
        if (leadsToInsert.length > 0) {
          const insertedLeads = await Lead.insertMany(leadsToInsert, { ordered: false });
          console.log('Successfully inserted', insertedLeads.length, 'leads');
          
          // Log activities for assignments
          for (const lead of insertedLeads) {
            if (lead.assignedTo) {
              const emp = employees.find(e => e._id.equals(lead.assignedTo));
              await Activity.create({
                description: `You assigned a lead to ${emp ? emp.name : 'an employee'}`,
                activityType: 'Lead Assignment',
                performedBy: null, // System/admin
                lead: lead._id,
                timestamp: new Date(),
              });
            }
            if (lead.status === 'Closed' && lead.assignedTo) {
              const emp = employees.find(e => e._id.equals(lead.assignedTo));
              await Activity.create({
                description: `${emp ? emp.name : 'An employee'} closed a deal`,
                activityType: 'Deal Closed',
                performedBy: lead.assignedTo,
                lead: lead._id,
                timestamp: new Date(),
              });
            }
          }

          // Update employee lead counts
          const allEmployees = await Employee.find({ role: 'Employee' });
          for (const emp of allEmployees) {
            const assignedLeadsCount = await Lead.countDocuments({ assignedTo: emp._id });
            const closedLeadsCount = await Lead.countDocuments({ assignedTo: emp._id, status: 'Closed' });
            emp.assignedLeads = assignedLeadsCount;
            emp.closedLeads = closedLeadsCount;
            await emp.save();
          }
        }

        fs.unlinkSync(filePath); // Clean up uploaded file

        const totalLeads = leadsToInsert.length;
        const assignedLeads = assignedCount;
        const unassignedLeadsCount = totalLeads - assignedLeads;

        res.status(201).json({
          message: 'File uploaded and leads saved successfully.',
          totalLeads,
          assignedLeads,
          unassignedLeads: unassignedLeadsCount,
          skippedRows
        });
      } catch (error) {
        // Clean up file even if error occurs
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        console.error('CSV upload error:', error);
        res.status(500).json({ 
          message: 'Failed to save leads to database.', 
          error: error.message 
        });
      }
    })
    .on('error', (error) => {
      // Clean up file on stream error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      console.error('CSV parsing error:', error);
      res.status(500).json({ 
        message: 'Failed to parse CSV file.', 
        error: error.message 
      });
    });
};

exports.getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find().populate('assignedTo', 'name');
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leads.' });
  }
};

// Update lead status (and optionally scheduledDate)
exports.updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, scheduledDate, performedBy } = req.body;

    const update = {};
    if (status) update.status = status;
    if (scheduledDate) update.scheduledDate = scheduledDate;

    if (status === 'Closed') {
      update.closedDate = new Date();
    }

    const updatedLead = await Lead.findByIdAndUpdate(id, update, { new: true });
    
    // Log this as an activity
    if (status && performedBy) {
      await Activity.create({
        description: `Deal closed`,
        activityType: 'Deal Closed',
        performedBy: performedBy || updatedLead.assignedTo,
        lead: updatedLead._id,
        timestamp: new Date(),
      });
    }

    // Update employee stats
    if (updatedLead.assignedTo) {
      const emp = await Employee.findById(updatedLead.assignedTo);
      if (emp) {
        emp.assignedLeads = await Lead.countDocuments({ assignedTo: emp._id });
        emp.closedLeads = await Lead.countDocuments({ assignedTo: emp._id, status: 'Closed' });
        await emp.save();
      }
    }

    res.json({ message: 'Lead updated', lead: updatedLead });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update lead', error: err.message });
  }
};

// Get current lead distribution status for all employees
exports.getLeadDistribution = async (req, res) => {
  try {
    const employees = await Employee.find({ role: 'Employee' });
    
    const distributionStatus = await Promise.all(
      employees.map(async (emp) => {
        const assignedLeads = await Lead.countDocuments({ assignedTo: emp._id });
        const closedLeads = await Lead.countDocuments({ assignedTo: emp._id, status: 'Closed' });
        const unclosedLeads = assignedLeads - closedLeads;
        
        return {
          employeeId: emp._id,
          name: emp.name,
          email: emp.email,
          assignedLeads,
          closedLeads,
          unclosedLeads,
          status: emp.status
        };
      })
    );

    // Sort by assigned leads (ascending) to show who has the most/least
    distributionStatus.sort((a, b) => a.assignedLeads - b.assignedLeads);

    const totalAssigned = distributionStatus.reduce((sum, emp) => sum + emp.assignedLeads, 0);
    const totalClosed = distributionStatus.reduce((sum, emp) => sum + emp.closedLeads, 0);
    const totalUnclosed = totalAssigned - totalClosed;

    res.json({
      employees: distributionStatus,
      summary: {
        totalEmployees: employees.length,
        totalAssignedLeads: totalAssigned,
        totalClosedLeads: totalClosed,
        totalUnclosedLeads: totalUnclosed,
        averageLeadsPerEmployee: employees.length > 0 ? (totalAssigned / employees.length).toFixed(2) : 0
      }
    });
  } catch (err) {
    console.error('Error getting lead distribution:', err);
    res.status(500).json({ message: 'Failed to fetch lead distribution.' });
  }
}; 