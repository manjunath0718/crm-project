import React from 'react';
// import { Paper, Typography, Box, List, ListItem, ListItemText } from '@mui/material'; // Removed MUI imports
import styles from './RecentActivityFeed.module.css'; // Import the CSS module

function RecentActivityFeed({ activities }) {
  return (
    <div className={styles.activityCard}> {/* Replaced Paper with div */}
      <h6 className={styles.activityTitle}>Recent Activity Feed</h6> {/* Replaced Typography with h6 */}
      <div className={styles.activityFeedBox}>
        <ul className={styles.activityList}> {/* Replaced List with ul */}
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <li key={index} className={styles.activityItem}> {/* Replaced ListItem with li */}
                <p className={styles.activityText}> {/* Replaced ListItemText with p */}
                  {activity}
                </p>
              </li>
            ))
          ) : (
            <p className={styles.noActivityText}>No recent activity.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default RecentActivityFeed; 