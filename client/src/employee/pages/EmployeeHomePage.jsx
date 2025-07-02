import React, { useEffect } from 'react';
import styles from './EmployeeHomePage.module.css';
import Header from '../components/home/Header';
import TimingsCard from '../components/home/TimingsCard';
import RecentActivityCard from '../components/home/RecentActivityCard';
import BottomNav from '../components/common/BottomNav';
import { updateEmployeeStatus, logoutEmployee } from '../../services/api';

const EmployeeHomePage = () => {
  // Get employee name from sessionStorage (set after login)
  const employeeName = sessionStorage.getItem('employeeName') || 'Employee';
  const employeeEmail = sessionStorage.getItem('employeeEmail') || '';
  const employeeId = sessionStorage.getItem('employeeId') || '';

  const handleLogout = async () => {
    try {
      if (employeeEmail) {
        await logoutEmployee(employeeEmail);
      }
      localStorage.setItem('employeeLogout', Date.now());
      sessionStorage.clear();
      window.location.replace('/employee/login');
    } catch (err) {
      sessionStorage.clear();
      localStorage.setItem('employeeLogout', Date.now());
      window.location.replace('/employee/login');
    }
  };

  useEffect(() => {
    // Keep employee status as Active while logged in
    const keepStatusActive = async () => {
      // Only update status if user is actually logged in
      if (employeeId && sessionStorage.getItem('employeeName')) {
        try {
          await updateEmployeeStatus(employeeId, 'Active');
        } catch (error) {
          console.error('Failed to update employee status:', error);
        }
      }
    };

    // Update status immediately when component mounts
    keepStatusActive();

    // Set up periodic status updates every 5 minutes
    const intervalId = setInterval(keepStatusActive, 5 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [employeeId]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'employeeLogout') {
        sessionStorage.clear();
        window.location.replace('/employee/login');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <Header name={employeeName} onLogout={handleLogout} />
      <main className={styles.mainContent}>
        <TimingsCard email={employeeEmail} />
        <RecentActivityCard />
      </main>
      <BottomNav />
    </div>
  );
};

export default EmployeeHomePage; 