import React, { useState } from 'react';
// import { Box, Paper, TextField, InputAdornment } from '@mui/material'; // Removed MUI component imports
import SearchIcon from '@mui/icons-material/SearchOutlined';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header'; // Assuming Header is created
import styles from './AdminLayout.module.css'; // Import the CSS module

const drawerWidth = 240; // Should match Sidebar's width
const headerHeight = 80; // Approximate height of the search bar area

function AdminLayout({ children }) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className={styles.adminLayoutContainer}> {/* Replaced Box with div */}
      <Sidebar />
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <div className={styles.mainContent}> {/* Replaced Box with div */}
        {/* Pass searchTerm to children */}
        {React.cloneElement(children, { searchTerm })}
      </div>
    </div>
  );
}

export default AdminLayout; 