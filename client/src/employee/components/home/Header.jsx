import React, { useState, useEffect } from 'react';
import styles from './Header.module.css';

const Header = ({ name = 'Employee', onLogout }) => {
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const setGreetingText = () => {
            const hour = new Date().getHours();
            if (hour < 12) {
                setGreeting('Good Morning');
            } else if (hour < 18) {
                setGreeting('Good Afternoon');
            } else {
                setGreeting('Good Evening');
            }
        };
        setGreetingText();
    }, []);

    return (
        <header className={styles.header}>
            <div className={styles.leftContainer}>
            <div className={styles.brand}>CanovaCRM</div>
            <div className={styles.greeting}>{greeting}</div>
            <div className={styles.employeeName}>{name}</div>
            </div>
            <button className={styles.logoutBtn} onClick={onLogout}>
                <i className="bx bx-log-out"></i>
            </button>
        </header>
    );
};

export default Header; 