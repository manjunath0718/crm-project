import React from "react";
import styles from "./ScheduleHeader.module.css";

const ScheduleHeader = ({ onBack, onLogout }) => (
  <header className={styles.header}>
    <div className={styles.brand}>Canova<span>CRM</span></div>
    <div className={styles.titleRow}>
      <button className={styles.backBtn} onClick={onBack}>
        <i className="bx bx-chevron-left"></i>
      </button>
      <span className={styles.title}>Schedule</span>
      <button className={styles.logoutBtn} onClick={onLogout}>
        <i className="bx bx-log-out"></i>
      </button>
    </div>
  </header>
);

export default ScheduleHeader; 