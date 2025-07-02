import React from "react";
import styles from "./ScheduleCard.module.css";

const ScheduleCard = ({ activity, highlight }) => (
  <div className={`${styles.card} ${highlight ? styles.active : ""}`}>  
    <div className={styles.topRow}>
      <span className={styles.type}>{activity.type}</span>
    </div>
    <div className={styles.phone}>{activity.phone}</div>
    <div className={styles.personRow}>
      <span>{activity.name}</span>
    </div>
    <div className={styles.scheduledDate}>{activity.scheduledDate}</div>
  </div>
);

export default ScheduleCard; 