import React from 'react';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import styles from './Header.module.css';

function Header({ searchTerm, onSearchChange }) {
  return (
    <div className={styles.header}>
      <div className={styles.searchContainer}>
        <SearchIcon className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search here..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export default Header;