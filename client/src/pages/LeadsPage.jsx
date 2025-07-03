import React, { useState, useEffect, useMemo } from 'react';
import styles from './LeadsPage.module.css';
import LeadsTable from '../components/leads/LeadsTable';
import CsvUploadModal from '../components/leads/CsvUploadModal';
import api, { getLeadsWithRetry, wakeUpBackend } from '../services/api';

const LeadsPage = ({ searchTerm = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch initial leads when component mounts
    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to wake up backend first
        await wakeUpBackend();
        
        const response = await getLeadsWithRetry(); 
        setLeads(response.data);
      } catch (error) {
        console.error("Failed to fetch leads:", error);
        setError('Failed to load leads. Please try refreshing the page.');
        // Set empty array on error to avoid crashes
        setLeads([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const handleUploadSuccess = async () => {
    // After upload, fetch the latest leads from the backend
    try {
      const response = await getLeadsWithRetry();
      setLeads(response.data);
    } catch (error) {
      console.error("Failed to refresh leads after upload:", error);
    }
    // Do NOT close the modal here; let the modal close itself after showing success
  };

  const filteredLeads = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    
    if (!lowercasedFilter) {
      return leads;
    }

    const matching = [];
    const nonMatching = [];

    (leads || []).forEach(lead => {
      // Simple search across all lead properties
      const leadDataString = `${lead.name || ''} ${lead.email || ''} ${lead.phone || ''} ${lead.status || ''} ${lead.type || ''} ${lead.language || ''} ${lead.location || ''} ${lead.assignedTo?.name || ''}`.toLowerCase();
      if (leadDataString.includes(lowercasedFilter)) {
        matching.push(lead);
      } else {
        nonMatching.push(lead);
      }
    });

    return [...matching, ...nonMatching];
  }, [leads, searchTerm]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  if (loading) {
    return (
      <div className={styles.leadsContainer}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading leads...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.leadsContainer}>
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.leadsContainer}>
      <div className={styles.headerRow}>
        <div className={styles.breadcrumbs}>Home &gt; Leads</div>
        <div className={styles.actions}>
          <button className={styles.addLeadsButton} onClick={handleOpenModal}>Add Leads</button>
        </div>
      </div>
      <LeadsTable leads={filteredLeads} />
      <CsvUploadModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        onUploadSuccess={handleUploadSuccess} 
      />
    </div>
  );
};

export default LeadsPage; 