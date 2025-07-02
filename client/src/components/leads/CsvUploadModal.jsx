import React, { useState, useEffect, useCallback } from 'react';
import styles from './CsvUploadModal.module.css';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import api from '../../services/api'; // Assuming api.js is in src/services
import axios from 'axios';

const CsvUploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState('select'); // select, verifying, success, error
  const [progress, setProgress] = useState(0);
  
  // Use a ref to hold the interval id
  const intervalRef = React.useRef(null);

  const resetState = useCallback(() => {
    setFile(null);
    setError('');
    setStep('select');
    setProgress(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError('');
      } else {
        setFile(null);
        setError('Invalid file type. Please upload a .csv file.');
      }
    }
  };
  
  const handleUpload = async () => {
    if (!file) return;

    setStep('verifying'); // Or 'uploading'
    setProgress(0);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${api.defaults.baseURL}/leads/upload-csv`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(percent);
            }
          },
        }
      );

      // Only show success if backend returns 201 and leads were saved
      if (response.status === 201 && response.data && response.data.totalLeads > 0) {
      setProgress(100);
      setStep('success');
      if (onUploadSuccess) {
          onUploadSuccess();
        }
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setStep('error');
        setError(response.data?.message || 'No leads were saved. Please check your CSV file.');
      }
    } catch (err) {
      setStep('error');
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    }
  };
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  }, [handleClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      resetState();
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen, handleKeyDown, resetState]);

  if (!isOpen) return null;
  
  const renderContent = () => {
    switch(step) {
      case 'verifying':
        return (
          <div className={styles.progressContainer}>
            <div className={styles.circularProgress}>
              <svg width="80" height="80">
                <circle className={styles.progressCircleBg} cx="40" cy="40" r="36" />
                <circle 
                  className={styles.progressCircleFg} 
                  cx="40" 
                  cy="40" 
                  r="36" 
                  style={{ strokeDashoffset: 226 * (1 - progress / 100) }}
                />
              </svg>
              <span className={styles.progressText}>{progress > 0 ? `${progress}%` : <span className={styles.spinner}></span>}</span>
            </div>
            <p className={styles.statusText}>Uploading...</p>
          </div>
        );
      case 'success':
        return (
          <div className={styles.successContainer}>
            <p className={styles.successText}>File uploaded successfully</p>
          </div>
        );
      case 'error':
         return (
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>Failed to upload</p>
            <p className={styles.errorMessage}>{error}</p>
          </div>
        );
      case 'select':
      default:
        return (
          <>
            <p className={styles.subtitle}>Add your documents here</p>
            <div 
              className={styles.dropzone}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFileSelect(e.dataTransfer.files[0]); }}
            >
              <InsertDriveFileOutlinedIcon className={styles.fileIcon} />
              <p className={styles.dropzoneText}>Drag your file(s) to start uploading</p>
              <p className={styles.orText}>OR</p>
              <label htmlFor="file-upload" className={styles.browseButton}>
                Browse files
              </label>
              <input id="file-upload" type="file" accept=".csv" onChange={(e) => handleFileSelect(e.target.files[0])} style={{ display: 'none' }} />
            </div>
            {file && <div className={styles.filePreview}><p className={styles.fileName}>{file.name}</p></div>}
            {error && <p className={styles.errorMessage}>{error}</p>}
          </>
        );
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>
            {step === 'select' && 'CSV Upload'}
            {step === 'verifying' && 'Uploading...'}
            {step === 'success' && 'Success'}
            {step === 'error' && 'Upload Failed'}
          </h2>
          <button className={styles.closeButton} onClick={handleClose}>&times;</button>
        </div>
        
        {renderContent()}

        <div className={styles.footer}>
          {step === 'select' && (
            <>
              <button className={styles.cancelButton} onClick={handleClose}>Cancel</button>
              <button className={styles.uploadButton} disabled={!file} onClick={handleUpload}>Upload</button>
            </>
          )}
           {(step === 'verifying') && (
            <button className={styles.cancelButton} onClick={handleClose}>Cancel</button>
          )}
          {step === 'success' && (
            <button className={styles.doneButton} onClick={handleClose}>Done</button>
          )}
           {step === 'error' && (
            <button className={styles.doneButton} onClick={resetState}>Try Again</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CsvUploadModal; 