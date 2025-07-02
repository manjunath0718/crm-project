import React from 'react';
// import { Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Box, Divider } from '@mui/material'; // Removed MUI imports
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css'; // Import the CSS module

// const drawerWidth = 240; // No longer needed as a JS variable for direct styling

function Sidebar() {
  return (
    <div className={styles.drawerPaper}> {/* Replaced Drawer */}
      <div className={styles.branding}> {/* Replaced Box */}
        <h6 className={styles.brandingText}>CanovaCRM</h6> {/* Replaced Typography */}
      </div>
      <ul className={styles.navList}> {/* Replaced List */}
        <li>
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              isActive ? styles.listItemActive : styles.listItem
            }
          >
            <div className={styles.listItemIcon}> {/* Replaced ListItemIcon */}
              <DashboardIcon className={styles.icon} />
            </div>
            <span className={styles.listItemText}>Dashboard</span> {/* Replaced ListItemText */}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/leads"
            className={({ isActive }) =>
              isActive ? styles.listItemActive : styles.listItem
            }
          >
            <div className={styles.listItemIcon}>
              <AssignmentIcon className={styles.icon} />
            </div>
            <span className={styles.listItemText}>Leads</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/employees"
            className={({ isActive }) =>
              isActive ? styles.listItemActive : styles.listItem
            }
          >
            <div className={styles.listItemIcon}>
              <PeopleIcon className={styles.icon} />
            </div>
            <span className={styles.listItemText}>Employees</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              isActive ? styles.listItemActive : styles.listItem
            }
          >
            <div className={styles.listItemIcon}>
              <SettingsIcon className={styles.icon} />
            </div>
            <span className={styles.listItemText}>Settings</span>
          </NavLink>
        </li>
      </ul>
      {/* The spacer and the second list containing Profile/Logout will be removed */}
    </div>
  );
}

export default Sidebar; 