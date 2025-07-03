import React, { useState, useEffect } from "react";
import styles from "./EmployeeSchedulePage.module.css";
import ScheduleHeader from "../components/schedule/ScheduleHeader";
import SearchAndFilterBar from "../components/schedule/SearchAndFilterBar";
import ScheduleCard from "../components/schedule/ScheduleCard";
import BottomNav from "../components/common/BottomNav";
import { updateEmployeeStatus, getLeads, logoutEmployee } from '../../services/api';
import { format } from 'date-fns';

const STORAGE_KEY = 'employee_leads';
const PLACEHOLDER_AVATAR = 'https://randomuser.me/api/portraits/lego/1.jpg';
const API_URL = import.meta.env.VITE_API_URL;

const EmployeeSchedulePage = () => {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState('all'); // 'all' or 'today'
  const [showFilterMenu, setShowFilterMenu] = useState(false);
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

  // Keep employee status as Active while logged in
  useEffect(() => {
    const keepStatusActive = async () => {
      // Only update status if user is actually logged in
      if (employeeId && sessionStorage.getItem('employeeName')) {
        try {
          await updateEmployeeStatus(employeeId, 'Active');
        } catch (error) {
          console.error('Failed to update employee status:', error);
        }
      }
    };

    // Update status immediately when component mounts
    keepStatusActive();

    // Set up periodic status updates every 5 minutes
    const intervalId = setInterval(keepStatusActive, 5 * 60 * 1000);

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [employeeId]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'employeeLogout') {
        sessionStorage.clear();
        window.location.href = '/employee/login';
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Listen for changes to localStorage to update in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLeads(JSON.parse(stored));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom events when localStorage is updated in the same tab
    window.addEventListener('leadsUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('leadsUpdated', handleStorageChange);
    };
  }, []);

  // Fetch leads assigned to this employee from backend
  useEffect(() => {
    async function fetchLeads() {
      if (!employeeId) return;
      try {
        const res = await fetch(`${API_URL}/api/leads/assigned-to/${employeeId}`);
        const data = await res.json();
        setLeads(data.map(lead => ({
          id: lead._id,
          name: lead.name,
          phone: lead.phone,
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

  // Only show leads with a scheduledDate and status not 'Closed'
  let scheduledLeads = leads.filter(l => l.scheduledDate && l.status !== 'Closed');

  // Filter by Today or All
  if (filter === 'today') {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    scheduledLeads = scheduledLeads.filter(l => l.scheduledDate && l.scheduledDate.slice(0, 10) === todayStr);
  }

  // Optionally filter by search
  const filtered = scheduledLeads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.phone && l.phone.includes(search))
  );

  // Map leads to ScheduleCard format (new design)
  const activities = filtered.map(lead => ({
    type: lead.type || 'Referral',
    phone: lead.phone || '',
    name: lead.name,
    scheduledDate: lead.scheduledDate ? new Date(lead.scheduledDate).toLocaleString('en-US', { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }) : '',
    avatar: lead.avatar || PLACEHOLDER_AVATAR,
    highlight: false,
    id: lead.id,
    status: lead.status,
  }));

  return (
    <div className={styles.page}>
      <ScheduleHeader onBack={() => window.history.back()} onLogout={handleLogout} />
      <div className={styles.content}>
        <div style={{ position: 'relative' }}>
          <SearchAndFilterBar
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFilter={() => setShowFilterMenu(v => !v)}
          />
          {showFilterMenu && (
            <div style={{ position: 'absolute', right: 0, top: 40, background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', zIndex: 10 }}>
              <button style={{ display: 'block', width: '100%', padding: 10, background: filter === 'today' ? '#f0f0f0' : '#fff', border: 'none', borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={() => { setFilter('today'); setShowFilterMenu(false); }}>Today</button>
              <button style={{ display: 'block', width: '100%', padding: 10, background: filter === 'all' ? '#f0f0f0' : '#fff', border: 'none', cursor: 'pointer' }} onClick={() => { setFilter('all'); setShowFilterMenu(false); }}>All</button>
            </div>
          )}
        </div>
        <div className={styles.cardsList}>
          {activities.map((a, i) => (
            <ScheduleCard key={a.id} activity={a} highlight={a.highlight} />
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default EmployeeSchedulePage; 