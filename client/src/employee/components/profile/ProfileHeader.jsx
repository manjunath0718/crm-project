import React from "react";
import styles from "./ProfileHeader.module.css";

const ProfileHeader = ({ onBack, onLogout }) => (
  <header className={styles.header}>
    <div className={styles.brand}>Canova<span>CRM</span></div>
    <div className={styles.titleRow}>
      <button className={styles.backBtn} onClick={onBack}>
        <i className="bx bx-chevron-left"></i>
      </button>
      <span className={styles.title}>Profile</span>
      <button className={styles.logoutBtn} onClick={onLogout}>
        <i className="bx bx-log-out"></i>
      </button>
    </div>
  </header>
);

export default ProfileHeader; 