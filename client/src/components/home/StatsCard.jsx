import React from 'react';
// import { Paper, Typography, Box } from '@mui/material'; // Removed MUI imports
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import PercentIcon from '@mui/icons-material/Percent';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'; // For unassigned leads
import styles from './StatsCard.module.css'; // Import the CSS module

function StatsCard({ icon, label, value }) {
  const getIcon = () => {
    switch (icon) {
      case 'unassigned':
        return <VisibilityOffIcon className={styles.icon} />;
      case 'assigned':
        return <AssignmentIcon className={styles.icon} />;
      case 'active':
        return <GroupIcon className={styles.icon} />;
      case 'conversion':
        return <PercentIcon className={styles.icon} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.statsCard}> {/* Replaced Paper with div */}
      <div className={styles.iconContainer}> {/* Replaced Box with div */}
        {getIcon()}
      </div>
      <p className={styles.label}>{label}</p> {/* Replaced Typography with p */}
      <div className={styles.value}> {/* Replaced Typography with div */}
        {value}
      </div>
    </div>
  );
}

export default StatsCard; 