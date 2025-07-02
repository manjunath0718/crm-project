import React, { useState } from 'react';
import styles from './LeadsPage.module.css';
import LeadsTable from './LeadsTable';
import CsvUploadModal from './CsvUploadModal';

const LeadsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className={styles.leadsPageContainer}>
      <div className={styles.headerRow}>
        <div className={styles.breadcrumbs}>Home &gt; Leads</div>
        <input
          type="text"
          placeholder="Search leads..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ marginLeft: 24, flex: 1, maxWidth: 320, padding: '8px 14px', borderRadius: 8, border: '1px solid #ddd' }}
        />
        <button className={styles.addLeadsBtn} onClick={() => setIsModalOpen(true)}>
          Add Leads
        </button>
      </div>
      <LeadsTable searchTerm={searchTerm} />
      {isModalOpen && (
        <CsvUploadModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default LeadsPage; 