import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material'
// import CssBaseline from '@mui/material/CssBaseline' // Removed CssBaseline import
import { useState, useEffect } from 'react'

import './App.css'
import DashboardPage from './pages/DashboardPage'
import AdminLayout from './layouts/AdminLayout'
import LeadsPage from './pages/LeadsPage'
import Employees from './pages/Employees'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import EmployeeHomePage from './employee/pages/EmployeeHomePage';
import EmployeeLeadsPage from './employee/pages/EmployeeLeadsPage';
import EmployeeSchedulePage from './employee/pages/EmployeeSchedulePage';
import EmployeeProfilePage from './employee/pages/EmployeeProfilePage';
import EmployeeLoginPage from './employee/pages/EmployeeLoginPage';
import { logoutEmployee } from './services/api';
import backendWakeUpService from './services/backendWakeUp';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#343a40', // A dark grey, good for primary text
    },
    secondary: {
      main: '#6c757d', // A lighter grey for secondary elements
    },
    background: {
      default: '#f4f7fa',
      paper: '#ffffff',
    }
  },
})

// Protected route for employee pages
function EmployeeProtectedRoute() {
  const isLoggedIn = !!sessionStorage.getItem('employeeName');
  return isLoggedIn ? <Outlet /> : <Navigate to="/employee/login" replace />;
}

function App() {
  useEffect(() => {
    let visibilityTimeout;

    // Start backend wake-up service to prevent sleep
    backendWakeUpService.start(5); // Wake up every 5 minutes

    // Handle automatic logout when browser is closed or page is refreshed
    const handleBeforeUnload = async (event) => {
      const employeeEmail = sessionStorage.getItem('employeeEmail');
      if (employeeEmail) {
        try {
          // Send logout request to update status to Inactive
          await logoutEmployee(employeeEmail);
        } catch (error) {
          console.error('Failed to update employee status on logout:', error);
        }
      }
    };

    // Handle page visibility change (when user switches tabs or minimizes browser)
    const handleVisibilityChange = async () => {
      const employeeEmail = sessionStorage.getItem('employeeEmail');
      
      if (document.hidden && employeeEmail) {
        // Clear any existing timeout
        if (visibilityTimeout) {
          clearTimeout(visibilityTimeout);
        }
        
        // Set a timeout to logout after 5 minutes of being hidden
        // This prevents immediate logout when just switching tabs
        visibilityTimeout = setTimeout(async () => {
          try {
            await logoutEmployee(employeeEmail);
          } catch (error) {
            console.error('Failed to update employee status on visibility change:', error);
          }
        }, 5 * 60 * 1000); // 5 minutes
      } else if (!document.hidden) {
        // Page is visible again, clear the timeout
        if (visibilityTimeout) {
          clearTimeout(visibilityTimeout);
          visibilityTimeout = null;
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup event listeners and timeout
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (visibilityTimeout) {
        clearTimeout(visibilityTimeout);
      }
      // Stop backend wake-up service
      backendWakeUpService.stop();
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      {/* Removed <CssBaseline /> */}
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/employee/login" element={<EmployeeLoginPage />} />
          <Route element={<EmployeeProtectedRoute />}>
            <Route path="/employee/home" element={<EmployeeHomePage />} />
            <Route path="/employee/leads" element={<EmployeeLeadsPage />} />
            <Route path="/employee/schedule" element={<EmployeeSchedulePage />} />
            <Route path="/employee/profile" element={<EmployeeProfilePage />} />
          </Route>
          <Route
            path="/"
            element={
              <AdminLayout>
                <DashboardPage />
              </AdminLayout>
            }
          />
          <Route
            path="admin/dashboard"
            element={
              <AdminLayout>
                <DashboardPage />
              </AdminLayout>
            }
          />
          <Route
            path="admin/leads"
            element={
              <AdminLayout>
                <LeadsPage />
              </AdminLayout>
            }
          />
          <Route
            path="admin/employees"
            element={
              <AdminLayout>
                <Employees />
              </AdminLayout>
            }
          />
          <Route
            path="admin/settings"
            element={
              <AdminLayout>
                <SettingsPage />
              </AdminLayout>
            }
          />
          {/* Add more routes here for Leads, Employees, Settings, Profile */}
        </Routes>
      </Router>
      
      
      
    </ThemeProvider>
  )
}

export default App
