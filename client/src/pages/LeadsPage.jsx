import React, { useState, useEffect, useMemo } from 'react';
import styles from './LeadsPage.module.css';
import LeadsTable from '../components/leads/LeadsTable';
import CsvUploadModal from '../components/leads/CsvUploadModal';
import api, { getLeads } from '../services/api';

const LeadsPage = ({ searchTerm = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    // Fetch initial leads when component mounts
    const fetchLeads = async () => {
      try {
        const response = await getLeads(); 
        setLeads(response.data);
      } catch (error) {
        console.error("Failed to fetch leads:", error);
        // Set empty array on error to avoid crashes
        setLeads([]);
      }
    };
    fetchLeads();
  }, []);

  const handleUploadSuccess = () => {
    // After upload, fetch the latest leads from the backend
    getLeads().then(res => setLeads(res.data)).catch(() => {});
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