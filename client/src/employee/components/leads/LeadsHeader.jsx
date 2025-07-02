import React from 'react';
import styles from './LeadsHeader.module.css';

const LeadsHeader = ({ onLogout }) => {
    return (
        <header className={styles.header}>
            <div className={styles.brand}>CanovaCRM</div>
            <div className={styles.titleRow}>
                <div className={styles.pageTitleContainer}>
                    <i className='bx bx-chevron-left'></i>
                    <h1 className={styles.pageTitle}>Leads</h1>
                </div>
                <button className={styles.logoutBtn} onClick={onLogout}>
                    <i className="bx bx-log-out"></i>
                </button>
            </div>
        </header>
    );
};

export default LeadsHeader; 