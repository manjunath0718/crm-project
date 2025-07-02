import React from "react";
import styles from "./SearchAndFilterBar.module.css";

const SearchAndFilterBar = ({ value, onChange, onFilter }) => (
  <div className={styles.searchBar}>
    <i className="bx bx-search"></i>
    <input
      type="text"
      placeholder="Search"
      value={value}
      onChange={onChange}
      className={styles.input}
    />
    <button className={styles.filterBtn} onClick={onFilter}>
      <i className="bx bx-filter-alt"></i>
    </button>
  </div>
);

export default SearchAndFilterBar; 