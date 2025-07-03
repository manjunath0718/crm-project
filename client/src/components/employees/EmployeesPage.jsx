import React, { useState, useEffect, useMemo, useRef } from 'react';
import styles from './EmployeesPage.module.css';
import EmployeesTable from './EmployeesTable';
import AddEmployeeModal from './AddEmployeeModal';
import { getEmployeesWithRetry, addEmployee, updateEmployee, deleteEmployee, wakeUpBackend } from '../../services/api';

const EmployeesPage = ({ searchTerm = '' }, ref) => {
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const firstMatchRef = useRef(null);
  const [searchActive, setSearchActive] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEmployees = async () => {
    try {
      setError(null);
      const { data } = await getEmployeesWithRetry();
      setEmployees(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      setError('Failed to load employees. Please try refreshing the page.');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      // Try to wake up backend first
      await wakeUpBackend();
      await fetchEmployees();
    } catch (error) {
      console.error("Failed to refresh employees:", error);
      setError('Failed to refresh employees. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchEmployees();

    // Set up polling to refresh employee data every 30 seconds (increased from 10)
    const intervalId = setInterval(async () => {
      try {
        await fetchEmployees();
      } catch (error) {
        console.error("Polling failed:", error);
      }
    }, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  const filteredEmployees = useMemo(() => {
    const lowercasedFilter = (searchTerm || '').toLowerCase();
    if (!lowercasedFilter) {
      setSearchActive(false);
      return employees;
    }
    setSearchActive(true);
    return (employees || []).filter(employee => {
      const fields = [
        employee.name,
        employee.employeeId,
        employee.email,
        employee.location,
        employee.status,
        employee.language,
        employee.phone
      ];
      return fields.some(field =>
        field && field.toString().toLowerCase().includes(lowercasedFilter)
      );
    });
  }, [employees, searchTerm]);

  // Handle Enter key to scroll to first match (from global search)
  useEffect(() => {
    const handleGlobalEnter = (e) => {
      if (e.key === 'Enter' && filteredEmployees.length > 0) {
        setTimeout(() => {
          if (firstMatchRef.current) {
            firstMatchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 0);
      }
      if (e.key === 'Backspace' && e.target.value === '') {
        setSearchActive(false);
      }
    };
    window.addEventListener('keydown', handleGlobalEnter);
    return () => window.removeEventListener('keydown', handleGlobalEnter);
  }, [filteredEmployees]);

  const handleSave = async (form) => {
    try {
      if (editingEmployee) {
        // Edit mode
        const payload = {
          ...form,
          name: `${form.firstName} ${form.lastName}`.trim(),
        };
        const res = await updateEmployee(editingEmployee._id, payload);
        setEmployees((prev) => prev.map(e => e._id === editingEmployee._id ? res.data : e));
      } else {
        // Add mode
        const payload = {
          ...form,
          name: `${form.firstName} ${form.lastName}`.trim(),
        };
        const res = await addEmployee(payload);
        // Add new employee to the top
        const newEmployee = res.data?.employee || res.data;
        setEmployees((prev) => [newEmployee, ...prev]);
        setSuccessMessage('Employee created successfully.');
        setTimeout(() => setSuccessMessage(''), 2500);
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
    } catch (err) {
      alert('Failed to save employee');
    }
  };

  const handleEdit = (emp) => {
    // Split name into first and last for modal
    const [firstName, ...lastArr] = (emp.name || '').split(' ');
    const lastName = lastArr.join(' ');
    setEditingEmployee({ ...emp, firstName, lastName });
    setIsModalOpen(true);
  };

  const handleDelete = async (emp) => {
    if (!window.confirm(`Are you sure you want to delete ${emp.name}?`)) return;
    try {
      const response = await deleteEmployee(emp._id);
      setEmployees((prev) => prev.filter((e) => e._id !== emp._id));
      
      // Show distribution information if leads were redistributed
      if (response.data?.leadDistribution?.distribution) {
        const distribution = response.data.leadDistribution;
        const distributionDetails = distribution.distribution
          .map(emp => `${emp.name}: +${emp.newlyAssignedLeads} leads (Total: ${emp.totalAssignedLeads})`)
          .join('\n');
        
        alert(`${distribution.message}\n\nLead Distribution:\n${distributionDetails}`);
      } else if (response.data?.leadDistribution?.message) {
        alert(response.data.leadDistribution.message);
      }
    } catch (err) {
      alert('Failed to delete employee');
    }
  };

  const formatLastUpdated = (date) => {
    if (!date) return '';
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return date.toLocaleTimeString();
  };

  // Add a public refresh function for parent components (e.g., after CSV upload)
  React.useImperativeHandle(ref, () => ({
    refresh: fetchEmployees
  }));

  if (loading) {
    return (
      <div className={styles.employeesPageContainer}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading employees...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.employeesPageContainer}>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.employeesPageContainer}>
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <div className={styles.breadcrumbs}>Home &gt; Employees</div>
          {lastUpdated && (
            <div className={styles.lastUpdated}>
              Last updated: {formatLastUpdated(lastUpdated)}
            </div>
          )}
        </div>
        <div className={styles.headerButtons}>
          <button 
            className={styles.refreshBtn} 
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh employee list"
          >
            {isRefreshing ? '⟳' : '↻'}
          </button>
          <button className={styles.addEmployeesBtn} onClick={() => setIsModalOpen(true)}>
            Add Employees
          </button>
        </div>
      </div>
      <EmployeesTable
        employees={filteredEmployees}
        onDelete={handleDelete}
        onEdit={handleEdit}
        firstMatchRef={firstMatchRef}
        highlightFirstMatch={searchActive && searchTerm.length > 0}
      />
      {isModalOpen && (
        <AddEmployeeModal onClose={() => { setIsModalOpen(false); setEditingEmployee(null); }} onSave={handleSave} initialData={editingEmployee} />
      )}
      {successMessage && (
        <div style={{
          position: 'fixed',
          top: 32,
          right: 32,
          background: '#43a047',
          color: '#fff',
          padding: '16px 32px',
          borderRadius: 12,
          fontWeight: 600,
          fontSize: '1.1rem',
          zIndex: 3000,
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)'
        }}>
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default React.forwardRef(EmployeesPage); 