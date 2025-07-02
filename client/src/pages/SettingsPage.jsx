import React, { useState, useEffect } from 'react';
import styles from './SettingsPage.module.css';
import { getProfile, updateProfile } from '../services/api'; // Assuming api service exists

const SettingsPage = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  // Hardcoded user ID for now. This should come from auth context.
  const userId = '60d0fe4f5311236168a109ca'; // Example ID

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // This is a placeholder, as the backend might not be ready
        // const { data } = await getProfile(userId);
        // const [firstName, ...lastName] = data.name.split(' ');
        // setProfile({ firstName, lastName: lastName.join(' '), email: data.email });
        
        // Using mock data for now to build the UI
        setProfile({
          firstName: 'Manju',
          lastName: 'Reddy',
          email: 'manju@gmail.com',
        });

      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        name: `${profile.firstName} ${profile.lastName}`,
        email: profile.email,
      };
      // const { data } = await updateProfile(userId, updatedData);
      // console.log('Profile updated', data);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('Failed to update profile.');
    }
  };

  return (
    <div className={styles.settingsPage}>
      <div className={styles.breadcrumbs}>
        <span>Home</span> &gt; <span>Settings</span>
      </div>
      <div className={styles.editProfileCard}>
        <h2 className={styles.formTitle}>Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName">First name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={profile.firstName}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="lastName">Last name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={profile.lastName}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage; 