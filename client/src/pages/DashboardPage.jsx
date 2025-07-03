import React, { useState, useEffect } from 'react';
// import { Box, Typography, Grid, Paper } from '@mui/material'; // Removed MUI imports
import api from '../services/api';
import StatsCard from '../components/home/StatsCard';
import SalesAnalyticsChart from '../components/home/SalesAnalyticsChart';
import RecentActivityFeed from '../components/home/RecentActivityFeed';
import ActiveEmployeesList from '../components/home/ActiveEmployeesList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import styles from './DashboardPage.module.css'; // Import the CSS module

function DashboardPage() {
  const [stats, setStats] = useState({
    unassignedLeads: 0,
    leadsAssignedThisWeek: 0,
    activeSalespeople: 0,
    conversionRate: '0.00',
  });
  const [salesAnalytics, setSalesAnalytics] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [statsRes, salesRes, activityRes, employeesRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/sales-analytics'),
          api.get('/dashboard/recent-activity'),
          api.get('/dashboard/active-employees'),
        ]);
        setStats(statsRes.data);
        setSalesAnalytics(salesRes.data);
        setRecentActivity(activityRes.data);
        setActiveEmployees(employeesRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <LoadingSpinner message="Loading dashboard data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#d32f2f', marginBottom: '1rem' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}> {/* Replaced Box with div */}
      <h6 className={styles.breadcrumbs}>Home &gt; Dashboard</h6> {/* Replaced Typography with h6 */}

      <div className={styles.statsGrid}> {/* Replaced Grid container with div */}
        <div className={styles.statsGridCol}> {/* For responsive grid item styling */}
          <StatsCard icon="unassigned" label="Unassigned Leads" value={stats.unassignedLeads} />
        </div>
        <div className={styles.statsGridCol}>
          <StatsCard icon="assigned" label="Leads Assigned This Week" value={stats.leadsAssignedThisWeek} />
        </div>
        <div className={styles.statsGridCol}>
          <StatsCard icon="active" label="Active Salespeople" value={stats.activeSalespeople} />
        </div>
        <div className={styles.statsGridCol}>
          <StatsCard icon="conversion" label="Conversion Rate" value={`${stats.conversionRate}%`} />
        </div>
      </div>

      <div className={styles.mainContentGrid}> {/* Replaced Grid container with div */}
        <div className={styles.salesAnalyticsCol}> {/* For responsive grid item styling */}
          <SalesAnalyticsChart data={salesAnalytics} />
        </div>
        <div className={styles.recentActivityCol}> {/* For responsive grid item styling */}
          <RecentActivityFeed activities={recentActivity} />
        </div>
      </div>

      <ActiveEmployeesList employees={activeEmployees} />

    </div>
  );
}

export default DashboardPage; 