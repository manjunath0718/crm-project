import React, { useState, useEffect } from 'react';
import styles from './TimingsCard.module.css';

const ToggleSwitch = ({ id, checked, onChange, isRed }) => (
    <label className={styles.toggleSwitch}>
        <input type="checkbox" id={id} checked={checked} onChange={onChange} />
        <span className={`${styles.slider} ${isRed ? styles.red : ''}`}></span>
    </label>
);

const TimingsCard = ({ email }) => {
    // Check-In/Check-Out State
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [checkInTime, setCheckInTime] = useState('--:--');
    const [checkOutTime, setCheckOutTime] = useState('--:--');
    const [isCheckOutRed, setIsCheckOutRed] = useState(false);

    // Break State
    const [isOnBreak, setIsOnBreak] = useState(false);
    const [breakStartTime, setBreakStartTime] = useState('--:--');
    const [breakEndTime, setBreakEndTime] = useState('--:--');
    const [breakStartTimestamp, setBreakStartTimestamp] = useState(null);
    const [breakHistory, setBreakHistory] = useState([]); // Only add when toggle is used
    const [breakSaveStatus, setBreakSaveStatus] = useState(''); // '', 'success', 'error'
    const [breakSaveMsg, setBreakSaveMsg] = useState('');

    // Utility Functions
    const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    };

    const API_URL = import.meta.env.VITE_API_URL;

    // Fetch break history from backend on mount
    useEffect(() => {
        if (!email) return;
        fetch(`${API_URL}/api/employees/breaks?email=${encodeURIComponent(email)}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data.breaks)) {
                    setBreakHistory(data.breaks.map(b => ({
                        start: b.start ? formatTime(new Date(b.start)) : '--:--',
                        end: b.end ? formatTime(new Date(b.end)) : '--:--',
                        date: b.date ? new Date(b.date) : new Date(),
                    })));
                }
            });
    }, [email]);

    // Check-in/Check-out Logic
    const handleCheckInOut = () => {
        const now = new Date();
        if (!isCheckedIn) { // Checking IN
            setIsCheckedIn(true);
            setCheckInTime(formatTime(now));
            setCheckOutTime('--:--');
            setIsCheckOutRed(false);
        } else { // Checking OUT
            setIsCheckedIn(false);
            setCheckOutTime(formatTime(now));
            setIsCheckOutRed(true);
        }
    };

    // Break Logic
    const handleBreak = async () => {
        const now = new Date();
        if (!isOnBreak) { // Starting Break
            setIsOnBreak(true);
            setBreakStartTimestamp(now);
            setBreakStartTime(formatTime(now));
            setBreakEndTime('--:--');
            setBreakSaveStatus('');
            setBreakSaveMsg('');
        } else { // Ending Break
            setIsOnBreak(false);
            const formattedBreakEndTime = formatTime(now);
            setBreakEndTime(formattedBreakEndTime);
            if (breakStartTimestamp && email) {
                // POST to backend
                try {
                    const res = await fetch(`${API_URL}/api/employees/break`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email,
                            start: breakStartTimestamp,
                            end: now,
                            date: breakStartTimestamp,
                        })
                    });
                    const data = await res.json();
                    if (res.ok && Array.isArray(data.breaks)) {
                        setBreakHistory(data.breaks.map(b => ({
                            start: b.start ? formatTime(new Date(b.start)) : '--:--',
                            end: b.end ? formatTime(new Date(b.end)) : '--:--',
                            date: b.date ? new Date(b.date) : new Date(),
                        })));
                        setBreakSaveStatus('success');
                        setBreakSaveMsg('Break saved!');
                    } else {
                        setBreakSaveStatus('error');
                        setBreakSaveMsg(data.error || 'Failed to save break.');
                    }
                } catch (err) {
                    setBreakSaveStatus('error');
                    setBreakSaveMsg('Network error: could not save break.');
                }
            }
        }
    };

    // Auto-logout effect
    useEffect(() => {
        const scheduleAutoLogout = () => {
            const now = new Date();
            const logoutTime = new Date(now);
            logoutTime.setHours(23, 55, 0, 0);

            if (now < logoutTime) {
                const timeToLogout = logoutTime.getTime() - now.getTime();
                const timer = setTimeout(() => {
                    if (isCheckedIn) {
                        setCheckOutTime(formatTime(logoutTime));
                        setIsCheckedIn(false);
                        setIsCheckOutRed(true);
                    }
                }, timeToLogout);
                return () => clearTimeout(timer);
            }
        };
        scheduleAutoLogout();
    }, [isCheckedIn]);

    // Prepare break history for display (last 7 days only)
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6); // 7 days including today
    const sortedHistory = [...breakHistory].sort((a, b) => b.date - a.date);
    const filteredHistory = sortedHistory.filter(b => b.date >= sevenDaysAgo && b.date <= now);

    return (
        <div>
            {/* Check-In/Check-Out Block */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>Check-In / Check-Out</div>
                <div className={`${styles.timingSection} ${isCheckedIn && !isCheckOutRed ? styles.active : ''}`}>
                    <div className={styles.timeDisplay}>
                        <div className={styles.label}>Checked-In</div>
                        <div className={styles.time}>{checkInTime}</div>
                    </div>
                    <div className={styles.timeDisplay}>
                        <div className={styles.label}>Check Out</div>
                        <div className={styles.time}>{checkOutTime}</div>
                    </div>
                    <ToggleSwitch id="checkInOutToggle" checked={isCheckedIn} onChange={handleCheckInOut} isRed={isCheckOutRed && !isCheckedIn} />
                </div>
            </div>

            {/* Break Block */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>Break</div>
                <div className={`${styles.timingSection} ${isOnBreak ? styles.active : ''}`}>
                    <div className={styles.timeDisplay}>
                        <div className={styles.label}>Break</div>
                        <div className={styles.time}>{breakStartTime}</div>
                    </div>
                    <div className={styles.timeDisplay}>
                        <div className={styles.label}>Ended</div>
                        <div className={styles.time}>{breakEndTime}</div>
                    </div>
                    <ToggleSwitch id="breakToggle" checked={isOnBreak} onChange={handleBreak} />
                </div>
                {/* Break History Table */}
                {filteredHistory.length > 0 && (
                    <div className={styles.breakHistoryBlock}>
                        <div className={styles.breakScrollableFull}>
                            <table className={styles.breakTable}>
                                <thead>
                                    <tr>
                                        <th className={styles.stickyHeader}>Break</th>
                                        <th className={styles.stickyHeader}>Ended</th>
                                        <th className={styles.stickyHeader}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHistory.map((b, idx) => (
                                        <tr key={idx}>
                                            <td>{b.start}</td>
                                            <td>{b.end}</td>
                                            <td>{formatDate(b.date)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimingsCard; 