import React, { useRef } from 'react';
import styles from './EmployeesTable.module.css';

function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const EMPLOYEES_PER_PAGE = 8;

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'employeeId', label: 'Employee ID' },
  { key: 'assigned', label: 'Assigned Leads' },
  { key: 'closed', label: 'Closed Leads' },
  { key: 'status', label: 'Status' },
];

function compare(a, b, key, direction) {
  let valA = a[key] || '';
  let valB = b[key] || '';
  if (key === 'assigned' || key === 'closed') {
    valA = Number(valA) || 0;
    valB = Number(valB) || 0;
  } else {
    valA = String(valA).toLowerCase();
    valB = String(valB).toLowerCase();
  }
  if (valA < valB) return direction === 'asc' ? -1 : 1;
  if (valA > valB) return direction === 'asc' ? 1 : -1;
  return 0;
}

const EmployeesTable = ({ employees, onEdit, onDelete, firstMatchRef, highlightFirstMatch }) => {
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [menuOpenId, setMenuOpenId] = React.useState(null);
  const menuRef = useRef();
  const [sortCol, setSortCol] = React.useState('name');
  const [sortDir, setSortDir] = React.useState('asc');

  const totalPages = Math.ceil((employees?.length || 0) / EMPLOYEES_PER_PAGE);
  let sortedEmployees = [...employees];
  if (sortCol) {
    sortedEmployees.sort((a, b) => compare(a, b, sortCol, sortDir));
  }
  const paginatedEmployees = sortedEmployees?.slice(
    (page - 1) * EMPLOYEES_PER_PAGE,
    page * EMPLOYEES_PER_PAGE
  ) || [];

  const allSelected =
    paginatedEmployees.length > 0 &&
    paginatedEmployees.every((emp) => selected.includes(emp.id));

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected((prev) => [
        ...prev,
        ...paginatedEmployees
          .map((emp) => emp.id)
          .filter((id) => !prev.includes(id)),
      ]);
    } else {
      setSelected((prev) => prev.filter((id) => !paginatedEmployees.some((emp) => emp.id === id)));
    }
  };

  const handleSelectOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  // Pagination numbers logic (show 1,2,3,...,n)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  // Ellipsis menu logic
  const handleEllipsisClick = (id) => {
    setMenuOpenId(id);
  };
  const handleCloseMenu = () => setMenuOpenId(null);

  // Close menu on outside click
  React.useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    if (menuOpenId !== null) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpenId]);

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const getSortIcon = (col) => {
    if (sortCol !== col) return null;
    return sortDir === 'asc' ? '↑' : '↓';
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                aria-label="Select all employees"
              />
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                {col.label} {getSortIcon(col.key)}
              </th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {paginatedEmployees.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', color: '#888', padding: '32px 0' }}>
                No employees found.
              </td>
            </tr>
          ) : (
            paginatedEmployees.map((emp, idx) => (
              <tr
                key={emp.employeeId || emp._id}
                className={
                  styles.tableRow +
                  (highlightFirstMatch && idx === 0 ? ' ' + styles.highlightRow : '')
                }
                ref={highlightFirstMatch && idx === 0 ? firstMatchRef : null}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(emp.id)}
                    onChange={() => handleSelectOne(emp.id)}
                    aria-label={`Select ${emp.name}`}
                  />
                </td>
                <td>
                  <div className={styles.nameCell}>
                    {emp.avatar ? (
                      <img src={emp.avatar} alt={emp.name} className={styles.avatar} />
                    ) : (
                      <span className={styles.initialsAvatar}>{getInitials(emp.name)}</span>
                    )}
                    <div className={styles.nameEmail}>
                      <span className={styles.empName}>{emp.name}</span>
                      <span className={styles.empEmail}>{emp.email}</span>
                    </div>
                  </div>
                </td>
                <td>{emp.employeeId || '-'}</td>
                <td>{emp.assignedLeads ?? 0}</td>
                <td>{emp.closedLeads ?? 0}</td>
                <td>
                  <span
                    className={
                      styles.statusDot +
                      ' ' +
                      (emp.status === 'Active' ? styles.active : styles.inactive)
                    }
                  ></span>
                  <span className={styles.statusLabel}>{emp.status || 'Inactive'}</span>
                </td>
                <td style={{ position: 'relative' }}>
                  <button className={styles.ellipsisBtn} onClick={() => handleEllipsisClick(emp.employeeId || emp._id)}>
                    <span className={styles.ellipsis}>⋮</span>
                  </button>
                  {menuOpenId === (emp.employeeId || emp._id) && (
                    <div className={styles.menuPopover} ref={menuRef}>
                      <button className={styles.menuItem} onClick={() => onEdit && onEdit(emp)}>
                        <span className={styles.menuIcon} role="img" aria-label="edit">✏️</span> Edit
                      </button>
                      <button className={styles.menuItem + ' ' + styles.menuDelete} onClick={() => onDelete && onDelete(emp)}>
                        <span className={styles.menuIcon} role="img" aria-label="delete">🗑️</span> Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className={styles.pagination}>
        <button
          className={styles.pageBtn}
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          &larr; Previous
        </button>
        {getPageNumbers().map((num, idx) =>
          num === '...' ? (
            <span key={idx} className={styles.ellipsisPage}>...</span>
          ) : (
            <button
              key={num}
              className={
                styles.pageBtn + (page === num ? ' ' + styles.activePage : '')
              }
              onClick={() => handlePageChange(num)}
            >
              {num}
            </button>
          )
        )}
        <button
          className={styles.pageBtn}
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
};

export default EmployeesTable; 