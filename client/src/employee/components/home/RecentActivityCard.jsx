import React, { useEffect, useState } from 'react';
import styles from './RecentActivityCard.module.css';

const RecentActivityCard = () => {
    const [activities, setActivities] = useState([]);
    const employeeId = sessionStorage.getItem('employeeId') || '';
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        async function fetchActivities() {
            if (!employeeId) return;
            try {
                const res = await fetch(`${API_URL}/api/employees/${employeeId}/activity`);
                const data = await res.json();
                setActivities(data);
            } catch (err) {
                setActivities([]);
            }
        }
        fetchActivities();
    }, [employeeId]);

    // Format activity message and time
    const formatActivity = (activity) => {
        if (activity.activityType === 'Lead Assignment') {
            return { main: 'You were assigned a new lead', time: timeAgo(activity.timestamp) };
        } else if (activity.activityType === 'Deal Closed') {
            return { main: 'You closed a deal', time: timeAgo(activity.timestamp) };
        }
        return { main: activity.description, time: timeAgo(activity.timestamp) };
    };

    // Helper to format time ago
    function timeAgo(date) {
        const now = Date.now();
        const diff = (now - new Date(date).getTime()) / 1000;
        if (diff < 60) return `${Math.floor(diff)} seconds ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return `${Math.floor(diff / 86400)} days ago`;
    }

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader}>Recent Activity</div>
            <div className={styles.activityFeedBox}>
                {activities.length === 0 ? (
                    <div className={styles.noActivityText}>No recent activity.</div>
                ) : (
            <ul className={styles.recentActivityList}>
                        {activities.map((a, index) => {
                            const { main, time } = formatActivity(a);
                            return (
                    <li key={index}>
                        <span className={styles.activityDot}></span>
                        <span className={styles.activityText}>
                                        <span className={styles.main}>{main}</span>
                                        <span className={styles.timeAgo}>{time}</span>
                        </span>
                    </li>
                            );
                        })}
            </ul>
                )}
            </div>
        </div>
    );
};

export default RecentActivityCard; 