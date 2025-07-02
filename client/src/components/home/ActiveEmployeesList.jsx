import React from 'react';
// import {
//   Paper, Typography, Box,
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
//   Avatar, Checkbox,
// } from '@mui/material'; // Removed MUI imports
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import styles from './ActiveEmployeesList.module.css'; // Import the CSS module

function ActiveEmployeesList({ employees }) {
  return (
    <div className={styles.employeeListCard}> {/* Replaced Paper with div */}
      <h6 className={styles.listTitle}>List of Active Employees</h6> {/* Replaced Typography with h6 */}
      <div className={styles.tableContainer}> {/* Replaced TableContainer with div */}
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr><th className={`${styles.tableHeaderCell} ${styles.checkbox}`}> {/* Replaced TableCell with th */}
                <input type="checkbox" className={styles.checkboxInput} /> {/* Replaced Checkbox with input */}
              </th>
              <th className={styles.tableHeaderCell}>Name</th>
              <th className={styles.tableHeaderCell}>Employee ID</th>
              <th className={`${styles.tableHeaderCell} ${styles.rightAlign}`}>Assigned Leads</th>
              <th className={`${styles.tableHeaderCell} ${styles.rightAlign}`}>Closed Leads</th>
              <th className={styles.tableHeaderCell}>Status</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>{employees.length > 0 ? (
              employees.map((employee) => (
                <tr
                  key={employee._id}
                  className={styles.tableRow}
                >
                  <td className={`${styles.tableCell} ${styles.checkbox}`}> {/* Replaced TableCell with td */}
                    <input type="checkbox" className={styles.checkboxInput} /> {/* Replaced Checkbox with input */}
                  </td>
                  <td className={styles.tableCell}> {/* Replaced TableCell with td */}
                    <div className={styles.employeeInfo}> {/* Replaced Box with div */}
                      <div className={styles.avatar}> {/* Replaced Avatar with div */}
                        {employee.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={styles.employeeName}>{employee.name}</p> {/* Replaced Typography with p */}
                        <p className={styles.employeeEmail}>{employee.email}</p> {/* Replaced Typography with p */}
                      </div>
                    </div>
                  </td>
                  <td className={styles.tableCell}>{employee.employeeId}</td>
                  <td className={`${styles.tableCell} ${styles.rightAlign}`}>{employee.assignedLeads}</td>
                  <td className={`${styles.tableCell} ${styles.rightAlign}`}>{employee.closedLeads}</td>
                  <td className={styles.tableCell}>
                    <div className={styles.statusContainer}> {/* Replaced Box with div */}
                      <FiberManualRecordIcon 
                        className={`${styles.statusDot} ${employee.status === 'Active' ? styles.statusActive : styles.statusWarning}`}
                      />
                      <span className={styles.statusText}>{employee.status}</span> {/* Replaced Typography with span */}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className={styles.noEmployeesText}> {/* Replaced TableCell with td and applied text styles */}
                  No active employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ActiveEmployeesList; 