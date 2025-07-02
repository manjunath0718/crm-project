import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './BottomNav.module.css';

const BottomNav = () => {
    const location = useLocation();
    const { pathname } = location;

    return (
        <nav className={styles.bottomNav}>
            <Link to="/employee/home" className={`${styles.navItem} ${pathname.includes('/employee/home') ? styles.active : ''}`}>
                <i className='bx bxs-home-alt-2'></i>
                <span>Home</span>
            </Link>
            <Link to="/employee/leads" className={`${styles.navItem} ${pathname.includes('/employee/leads') ? styles.active : ''}`}>
                <i className='bx bxs-user-detail'></i>
                <span>Leads</span>
            </Link>
            <Link to="/employee/schedule" className={`${styles.navItem} ${pathname.includes('/employee/schedule') ? styles.active : ''}`}>
                <i className='bx bxs-calendar'></i>
                <span>Schedule</span>
            </Link>
            <Link to="/employee/profile" className={`${styles.navItem} ${pathname.includes('/employee/profile') ? styles.active : ''}`}>
                <i className='bx bxs-user-circle'></i>
                <span>Profile</span>
            </Link>
        </nav>
    );
};

export default BottomNav; 