import React, { useState } from 'react';
import styles from './LeadsTable.module.css';

const columns = [
  { key: 'no', label: 'No.' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'leadDate', label: 'Received Date' },
  { key: 'status', label: 'Status' },
  { key: 'type', label: 'Type' },
  { key: 'language', label: 'Language' },
  { key: 'location', label: 'Location' },
  { key: 'assignedTo', label: 'Assigned Employee' },
];

function getValue(lead, key, idx) {
  if (key === 'no') return idx;
  if (key === 'assignedTo') return lead.assignedTo ? lead.assignedTo.name : '';
  if (key === 'leadDate') return lead.leadDate ? new Date(lead.leadDate) : null;
  return lead[key] || '';
}

function compare(a, b, key, direction, idxA, idxB) {
  if (key === 'no') {
    // Sort by original index
    return direction === 'asc' ? idxA - idxB : idxB - idxA;
  }
  const valA = getValue(a, key, idxA);
  const valB = getValue(b, key, idxB);

  // Null/missing values always at the bottom
  if (valA === '' || valA === null || typeof valA === 'undefined') return 1;
  if (valB === '' || valB === null || typeof valB === 'undefined') return -1;

  if (key === 'leadDate') {
    // Date comparison
    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  }
  if (key === 'phone') {
    // Numeric comparison (if possible)
    const numA = parseInt(valA.replace(/\D/g, '')) || 0;
    const numB = parseInt(valB.replace(/\D/g, '')) || 0;
    if (numA < numB) return direction === 'asc' ? -1 : 1;
    if (numA > numB) return direction === 'asc' ? 1 : -1;
    return 0;
  }
  // String comparison
  if (valA.toLowerCase() < valB.toLowerCase()) return direction === 'asc' ? -1 : 1;
  if (valA.toLowerCase() > valB.toLowerCase()) return direction === 'asc' ? 1 : -1;
  return 0;
}

const LeadsTable = ({ leads = [], searchTerm = '' }) => {
  const [sortCol, setSortCol] = useState('no');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  // Global search filter
  const lowercasedFilter = searchTerm.toLowerCase();
  let filteredLeads = leads.map((lead, idx) => ({ ...lead, _originalIdx: idx }));
  if (lowercasedFilter) {
    const matching = [];
    const nonMatching = [];
    filteredLeads.forEach(lead => {
      const leadDataString = `
        ${lead.name || ''}
        ${lead.email || ''}
        ${lead.phone || ''}
        ${lead.location || ''}
        ${lead.status || ''}
        ${lead.type || ''}
        ${lead.language || ''}
        ${(lead.assignedTo && lead.assignedTo.name) || ''}
      `.toLowerCase();
      if (leadDataString.includes(lowercasedFilter)) {
        matching.push(lead);
      } else {
        nonMatching.push(lead);
      }
    });
    filteredLeads = [...matching, ...nonMatching];
  }
  let sortedLeads = filteredLeads;
  if (sortCol) {
    sortedLeads.sort((a, b) => compare(a, b, sortCol, sortDir, a._originalIdx, b._originalIdx));
  }

  const getSortIcon = (col) => {
    if (sortCol !== col) return null;
    return sortDir === 'asc' ? '↑' : '↓';
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={styles.sortableHeader}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                {col.label} {getSortIcon(col.key)}
              </th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sortedLeads.length > 0 ? (
            sortedLeads.map((lead, idx) => (
              <tr key={lead.id || idx} className={styles.tableRow}>
                <td>{String(idx + 1).padStart(2, '0')}</td>
                <td>{lead.name}</td>
                <td>{lead.email || '-'}</td>
                <td>{lead.phone || '-'}</td>
                <td>{lead.leadDate ? new Date(lead.leadDate).toLocaleDateString() : '-'}</td>
                <td>{lead.status}</td>
                <td>{lead.type}</td>
                <td>{lead.language}</td>
                <td>{lead.location}</td>
                <td>{lead.assignedTo ? lead.assignedTo.name : 'Unassigned'}</td>
                <td>
                  <button className={styles.ellipsisBtn}>
                    <span className={styles.ellipsis}>⋮</span>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" className={styles.noLeadsRow}>
                No leads yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeadsTable; 