import React, { useState, useRef, useEffect } from 'react';
import styles from './SearchAndFilterBar.module.css';

const FILTERS = [
  { label: 'Ongoing', value: 'Ongoing' },
  { label: 'Closed', value: 'Closed' },
];

const SearchAndFilterBar = ({ onFilterChange }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const dropdownRef = useRef(null);
    const filterBtnRef = useRef(null);

    useEffect(() => {
      if (!dropdownOpen) return;
      const handleClick = (e) => {
        if (
          dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          filterBtnRef.current && !filterBtnRef.current.contains(e.target)
        ) {
          setDropdownOpen(false);
          setSelected(null);
          onFilterChange && onFilterChange(null);
        }
      };
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }, [dropdownOpen, onFilterChange]);

    const handleSelect = (value) => {
      setSelected(value);
      setDropdownOpen(false);
      onFilterChange && onFilterChange(value);
    };

    return (
        <div className={styles.searchContainer}>
            <div className={styles.searchInputWrapper}>
                <i className='bx bx-search'></i>
                <input type="text" placeholder="Search" className={styles.searchInput} />
            </div>
            <button ref={filterBtnRef} className={styles.filterButton} onClick={() => setDropdownOpen((v) => !v)}>
                <i className='bx bx-filter-alt'></i>
            </button>
            {dropdownOpen && (
              <div className={styles.filterDropdown} ref={dropdownRef}>
                {FILTERS.map(f => (
                  <button
                    key={f.value}
                    className={styles.filterOption + (selected === f.value ? ' ' + styles.active : '')}
                    onClick={() => handleSelect(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
        </div>
    );
};

export default SearchAndFilterBar; 