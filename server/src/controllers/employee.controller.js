const Employee = require('../models/Employee');
const { v4: uuidv4 } = require('uuid');
const Lead = require('../models/Lead');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select('-password');
    // For each employee, count assigned and closed leads
    const employeesWithCounts = await Promise.all(employees.map(async (emp) => {
      const assignedLeads = await Lead.countDocuments({ assignedTo: emp._id });
      const closedLeads = await Lead.countDocuments({ assignedTo: emp._id, status: 'Closed' });
      return {
        ...emp.toObject(),
        assignedLeads,
        closedLeads,
      };
    }));
    res.json(employeesWithCounts);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Helper to generate random Employee ID
function generateEmployeeId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '#';
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Create a new employee
exports.createEmployee = async (req, res) => {
  try {
    console.log('Received createEmployee request body:', req.body);
    const { firstName, lastName, email, phone, location, language } = req.body;
    const employeeId = generateEmployeeId();
    const password = lastName;
    const name = `${firstName} ${lastName}`;
    const employee = new Employee({
      name,
      email,
      phone,
      employeeId,
      password,
      role: 'Employee',
      location,
      language,
    });
    await employee.save();
    const { password: _, ...empData } = employee.toObject();
    res.status(201).json({ success: true, employee: empData, message: 'Employee created successfully' });
  } catch (err) {
    console.error('Error creating employee:', err);
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(400).json({ error: err.message });
  }
};

// Update an employee
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };
    if (update.password) delete update.password; // Don't allow password update here
    const employee = await Employee.findByIdAndUpdate(id, update, { new: true }).select('-password');
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete an employee
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    
    // Distribute unclosed leads before responding
    const distributionResult = await distributeUnclosedLeads(id);
    
    res.json({ 
      message: 'Employee deleted successfully',
      leadDistribution: distributionResult
    });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(400).json({ error: err.message });
  }
};

// Employee login (email + last name as password)
exports.loginEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // Split name into first and last name
    const [firstName, ...rest] = employee.name.split(' ');
    const lastName = rest.join(' ');
    if (!lastName || password.trim().toLowerCase() !== lastName.trim().toLowerCase()) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Update employee status to Active
    employee.status = 'Active';
    await employee.save();
    
    return res.json({ _id: employee._id, firstName, lastName, email: employee.email });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Employee logout - update status to Inactive
exports.logoutEmployee = async (req, res) => {
  try {
    const { email } = req.body;
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Update employee status to Inactive
    employee.status = 'Inactive';
    await employee.save();
    
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update employee status (for admin use)
exports.updateEmployeeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['Active', 'Inactive', 'On Break'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const employee = await Employee.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    ).select('-password');
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Add a break session to an employee
exports.addBreakSession = async (req, res) => {
  try {
    const { email, start, end, date } = req.body;
    const employee = await Employee.findOne({ email });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    employee.breaks.unshift({ start, end, date });
    if (employee.breaks.length > 7) employee.breaks = employee.breaks.slice(0, 7);
    await employee.save();
    res.json({ success: true, breaks: employee.breaks });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get break sessions for an employee by email
exports.getBreakSessions = async (req, res) => {
  try {
    const { email } = req.query;
    const employee = await Employee.findOne({ email });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json({ breaks: employee.breaks || [] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}; 

// Helper function to distribute unclosed leads fairly among remaining employees
async function distributeUnclosedLeads(deletedEmployeeId) {
  try {
    // Get the deleted employee's unclosed leads
    const unclosedLeads = await Lead.find({ 
      assignedTo: deletedEmployeeId, 
      status: { $ne: 'Closed' } 
    });
    
    if (unclosedLeads.length === 0) {
      return { message: 'No unclosed leads to distribute' };
    }

    // Get all remaining employees (excluding the deleted one)
    const remainingEmployees = await Employee.find({ 
      _id: { $ne: deletedEmployeeId },
      role: 'Employee'
    });

    if (remainingEmployees.length === 0) {
      return { message: 'No remaining employees to distribute leads to' };
    }

    // Get current lead counts for all remaining employees
    const employeesWithCounts = await Promise.all(
      remainingEmployees.map(async (emp) => {
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

    const unclosedLeadsCount = unclosedLeads.length;
    const remainingEmployeesCount = remainingEmployees.length;
    
    console.log(`Distributing ${unclosedLeadsCount} unclosed leads among ${remainingEmployeesCount} remaining employees`);

    // Distribution logic
    let distributionMap = {};
    
    if (unclosedLeadsCount === remainingEmployeesCount) {
      // Assign one lead to each employee
      for (let i = 0; i < unclosedLeadsCount; i++) {
        const employeeId = employeesWithCounts[i].employeeId;
        const leadId = unclosedLeads[i]._id;
        
        await Lead.findByIdAndUpdate(leadId, { assignedTo: employeeId });
        
        if (!distributionMap[employeeId]) {
          distributionMap[employeeId] = {
            name: employeesWithCounts[i].name,
            assignedLeads: 0
          };
        }
        distributionMap[employeeId].assignedLeads++;
      }
    } else if (unclosedLeadsCount < remainingEmployeesCount) {
      // Assign one lead to the unclosedLeadsCount number of employees with fewest leads
      for (let i = 0; i < unclosedLeadsCount; i++) {
        const employeeId = employeesWithCounts[i].employeeId;
        const leadId = unclosedLeads[i]._id;
        
        await Lead.findByIdAndUpdate(leadId, { assignedTo: employeeId });
        
        if (!distributionMap[employeeId]) {
          distributionMap[employeeId] = {
            name: employeesWithCounts[i].name,
            assignedLeads: 0
          };
        }
        distributionMap[employeeId].assignedLeads++;
      }
    } else {
      // unclosedLeadsCount > remainingEmployeesCount
      // Round-robin distribution starting with employees who have the least leads
      for (let i = 0; i < unclosedLeadsCount; i++) {
        const employeeIndex = i % remainingEmployeesCount;
        const employeeId = employeesWithCounts[employeeIndex].employeeId;
        const leadId = unclosedLeads[i]._id;
        
        await Lead.findByIdAndUpdate(leadId, { assignedTo: employeeId });
        
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
      message: `Successfully distributed ${unclosedLeadsCount} unclosed leads`,
      distribution: finalDistribution
    };

  } catch (error) {
    console.error('Error distributing unclosed leads:', error);
    throw error;
  }
} 