import React, { useState, useEffect } from 'react';
import styles from './EmployeeLeadsPage.module.css';
import LeadsHeader from '../components/leads/LeadsHeader';
import SearchAndFilterBar from '../components/leads/SearchAndFilterBar';
import BottomNav from '../components/common/BottomNav';
import LeadCard from '../components/leads/LeadCard';
import { updateEmployeeStatus, updateLeadStatus, logoutEmployee } from '../../services/api';

const EmployeeLeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState(null);
  const employeeId = sessionStorage.getItem('employeeId') || '';
  const employeeEmail = sessionStorage.getItem('employeeEmail') || '';

  const handleLogout = async () => {
    try {
      if (employeeEmail) {
        await logoutEmployee(employeeEmail);
      }
      localStorage.setItem('employeeLogout', Date.now());
      sessionStorage.clear();
      window.location.replace('/employee/login');
    } catch (err) {
      sessionStorage.clear();
      localStorage.setItem('employeeLogout', Date.now());
      window.location.replace('/employee/login');
    }
  };

  // Fetch leads assigned to this employee from backend
  useEffect(() => {
    async function fetchLeads() {
      if (!employeeId) return;
      try {
        const res = await fetch(`/api/leads/assigned-to/${employeeId}`);
        const data = await res.json();
        // Map backend fields to LeadCard fields if needed
        setLeads(data.map(lead => ({
          id: lead._id,
          name: lead.name,
          email: lead.email,
          date: new Date(lead.leadDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' }),
          status: lead.status,
          type: lead.type,
          scheduledDate: lead.scheduledDate,
        })));
      } catch (err) {
        setLeads([]);
      }
    }
    fetchLeads();
  }, [employeeId]);

  useEffect(() => { setFilter(null); }, []);

  // Keep employee status as Active while logged in
  useEffect(() => {
    const keepStatusActive = async () => {
      if (employeeId && sessionStorage.getItem('employeeName')) {
        try {
          await updateEmployeeStatus(employeeId, 'Active');
        } catch (error) {
          console.error('Failed to update employee status:', error);
        }
      }
    };
    keepStatusActive();
    const intervalId = setInterval(keepStatusActive, 5 * 60 * 1000);
    return () => { clearInterval(intervalId); };
  }, [employeeId]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'employeeLogout') {
        sessionStorage.clear();
        window.location.replace('/employee/login');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const filteredLeads = filter ? leads.filter(l => l.status === filter) : leads;

  // The handlers below are for UI only; backend updates would need API calls
  const handleTypeChange = (id, newType) => {
    const updatedLeads = leads.map(lead => lead.id === id ? { ...lead, type: newType } : lead);
    setLeads(updatedLeads);
    
    // Save to localStorage
    localStorage.setItem('employee_leads', JSON.stringify(updatedLeads));
    
    // Dispatch custom event to notify other components (like Schedule page) of the update
    window.dispatchEvent(new CustomEvent('leadsUpdated'));
  };
  const handleDateChange = async (id, newDate, jsDate) => {
    console.log('handleDateChange called:', { id, newDate, jsDate });
    // Update backend
    try {
      const resp = await updateLeadStatus(id, { scheduledDate: newDate, status: 'Ongoing' });
      console.log('updateLeadStatus response:', resp.data);
    } catch (err) {
      console.error('updateLeadStatus error:', err);
    }
    // Refresh leads from backend
    const res = await fetch(`/api/leads/assigned-to/${employeeId}`);
    const data = await res.json();
    console.log('Fetched leads after update:', data);
    setLeads(data.map(lead => ({
      id: lead._id,
      name: lead.name,
      email: lead.email,
      date: new Date(lead.leadDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' }),
      status: lead.status,
      type: lead.type,
      scheduledDate: lead.scheduledDate,
    })));
    window.dispatchEvent(new CustomEvent('leadsUpdated'));
  };
  const handleStatusChange = async (id, newStatus) => {
    await updateLeadStatus(id, { status: newStatus, performedBy: employeeId });
    const res = await fetch(`/api/leads/assigned-to/${employeeId}`);
    const data = await res.json();
    setLeads(data.map(lead => ({
      id: lead._id,
      name: lead.name,
      email: lead.email,
      date: new Date(lead.leadDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' }),
      status: lead.status,
      type: lead.type,
      scheduledDate: lead.scheduledDate,
    })));
    window.dispatchEvent(new CustomEvent('leadsUpdated'));
  };

  return (
    <div className={styles.pageContainer}>
      <LeadsHeader onLogout={handleLogout} />
      <SearchAndFilterBar onFilterChange={setFilter} />
      <div className={styles.leadsContainer}>
        {filteredLeads.map(lead => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onTypeChange={handleTypeChange}
            onDateChange={handleDateChange}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
      <BottomNav />
    </div>
  );
};

export default EmployeeLeadsPage; 