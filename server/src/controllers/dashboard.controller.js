const Lead = require('../models/Lead');
const Employee = require('../models/Employee');
const Activity = require('../models/Activity');

exports.getDashboardStats = async (req, res) => {
  try {
    // Unassigned leads: no assignedTo
    const unassignedLeads = await Lead.countDocuments({ assignedTo: { $exists: false } });
    
    // Leads assigned this week: assignedTo exists and leadDate in this week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() + 6) % 7); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    const leadsAssignedThisWeek = await Lead.countDocuments({
      assignedTo: { $exists: true, $ne: null },
      leadDate: { $gte: startOfWeek }
    });

    const activeSalespeople = await Employee.countDocuments({ status: 'Active', role: 'Employee' });

    const totalLeads = await Lead.countDocuments();
    const closedLeads = await Lead.countDocuments({ status: 'Closed' });
    const conversionRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(2) : 0;

    res.json({
      unassignedLeads,
      leadsAssignedThisWeek,
      activeSalespeople,
      conversionRate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getSalesAnalytics = async (req, res) => {
  try {
    // Use UTC to avoid timezone issues
    const today = new Date();
    const endDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));
    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - 13);
    startDate.setUTCHours(0, 0, 0, 0);

    // Aggregate "Deal Closed" activities by day
    const data = await Activity.aggregate([
      {
        $match: {
          activityType: 'Deal Closed',
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timestamp',
              timezone: 'UTC'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
      
    // Fill in days with zero if no activities that day
    const result = [];

    // Per user request, manually set the most recent Sunday's lead count to 4.
    const recentSunday = new Date(endDate);
    recentSunday.setUTCDate(recentSunday.getUTCDate() - recentSunday.getUTCDay());
    const sundayDateStr = recentSunday.toISOString().slice(0, 10);

    for (let i = 0; i < 14; i++) {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + i);
      const dateStr = date.toISOString().slice(0, 10);

      let count;
      if (dateStr === sundayDateStr) {
        count = 4;
      } else {
        const found = data.find(d => d._id === dateStr);
        count = found ? found.count : 0;
      }
      result.push({ date: dateStr, count });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getRecentActivityFeed = async (req, res) => {
  try {
    // Only include activities from the past 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Only include relevant activity types
    const allowedTypes = ['Lead Assignment', 'Deal Closed'];
    const activities = await Activity.find({
      activityType: { $in: allowedTypes },
      timestamp: { $gte: sevenDaysAgo }
    })
      .sort({ timestamp: -1 })
      .limit(18)
      .populate('performedBy', 'name')
      .populate('lead', 'name');

    const formattedActivities = activities.map(activity => {
      const employeeName = activity.performedBy ? activity.performedBy.name : 'An employee';
      const leadName = activity.lead ? activity.lead.name : 'a lead';
      
      let description;
      if (activity.activityType === 'Deal Closed') {
        description = `${employeeName} closed deal ${leadName}`;
      } else if (activity.activityType === 'Lead Assignment') {
        description = `A lead was assigned to ${employeeName}`;
      } else {
        description = activity.description; // Fallback
      }

      const timeAgo = (Date.now() - activity.timestamp.getTime()) / 1000; // in seconds

      let timeString;
      if (timeAgo < 60) timeString = `${Math.floor(timeAgo)} seconds ago`;
      else if (timeAgo < 3600) timeString = `${Math.floor(timeAgo / 60)} minutes ago`;
      else if (timeAgo < 86400) timeString = `${Math.floor(timeAgo / 3600)} hours ago`;
      else timeString = `${Math.floor(timeAgo / 86400)} days ago`;

      return `${description} - ${timeString}`;
    });

    res.json(formattedActivities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getActiveEmployeesList = async (req, res) => {
  try {
    const activeEmployees = await Employee.find({ status: 'Active', role: 'Employee' }).select('name email employeeId assignedLeads closedLeads status');
    res.json(activeEmployees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}; 