import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./EmployeeProfilePage.module.css";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileForm from "../components/profile/ProfileForm";
import BottomNav from "../components/common/BottomNav";
import { getProfile, updateProfile, logoutEmployee, updateEmployeeStatus } from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL;

// Helper: fetch by email (assumes backend supports /profile/email/:email)
async function getProfileByEmail(email) {
  if (!email) return null;
  try {
    const res = await fetch(`${API_URL}/api/profile/email/${encodeURIComponent(email)}`);
    if (!res.ok) throw new Error('Not found');
    return await res.json();
  } catch {
    return null;
  }
}

const EmployeeProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const employeeId = sessionStorage.getItem('employeeId');
  const employeeEmail = sessionStorage.getItem('employeeEmail');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError("");
      try {
        let data = null;
        if (employeeId) {
          console.log('Fetching profile by ID:', employeeId);
          const res = await getProfile(employeeId);
          data = res.data;
        } else if (employeeEmail) {
          console.log('Fetching profile by email:', employeeEmail);
          data = await getProfileByEmail(employeeEmail);
        }
        if (!data) throw new Error('Profile not found');
        // Split name into firstName and lastName for the form
        let firstName = '', lastName = '';
        if (data.name) {
          const parts = data.name.trim().split(' ');
          firstName = parts[0] || '';
          lastName = parts.slice(1).join(' ') || '';
        }
        setProfile({ ...data, firstName, lastName });
      } catch (err) {
        setError("Profile not found or failed to load.");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [employeeId, employeeEmail]);

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

  // Listen for logout in other tabs
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

  const handleSave = async (updatedProfile) => {
    try {
      if (!employeeId && !employeeEmail) return;
      let id = employeeId;
      if (!id && profile && profile._id) id = profile._id;
      if (!id) throw new Error('No employee ID');
      await updateProfile(id, updatedProfile);
      setProfile(updatedProfile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError("Failed to update profile.");
    }
  };

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

  return (
    <div className={styles.page}>
      <ProfileHeader onBack={() => window.history.back()} onLogout={handleLogout} />
      <div className={styles.content}>
        {loading && <div style={{textAlign: 'center', marginTop: 40}}>Loading profile...</div>}
        {error && !loading && <div style={{color: 'red', textAlign: 'center', marginTop: 16}}>{error}</div>}
        <ProfileForm profile={profile || {}} onSave={handleSave} />
        {success && <div style={{color: '#2563eb', textAlign: 'center', marginTop: 16}}>Profile updated!</div>}
      </div>
      <BottomNav />
    </div>
  );
};

export default EmployeeProfilePage; 