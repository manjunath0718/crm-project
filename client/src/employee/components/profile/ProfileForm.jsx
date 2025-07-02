import React, { useState, useEffect } from "react";
import styles from "./ProfileForm.module.css";

const ProfileForm = ({ profile: initialProfile, onSave, error: backendError }) => {
  // Pre-fill all fields except password fields
  const [profile, setProfile] = useState({
    firstName: initialProfile?.firstName || '',
    lastName: initialProfile?.lastName || '',
    email: initialProfile?.email || '',
    password: '',
    confirmPassword: '',
  });
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setProfile({
      firstName: initialProfile?.firstName || '',
      lastName: initialProfile?.lastName || '',
      email: initialProfile?.email || '',
      password: '',
      confirmPassword: '',
    });
    setPasswordChanged(false);
    setError("");
  }, [initialProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    if (name === 'password' || name === 'confirmPassword') setPasswordChanged(true);
  };

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation
    if (!profile.firstName || !profile.lastName || !profile.email) {
      setError("All fields are required.");
      return;
    }
    if (!validateEmail(profile.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (passwordChanged) {
      if (!profile.password || !profile.confirmPassword) {
        setError("Please enter and confirm your password.");
        return;
      }
      if (profile.password !== profile.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }
    setError("");
    const data = { ...profile };
    if (!passwordChanged) {
      delete data.password;
      delete data.confirmPassword;
    }
    onSave(data);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fieldGroup}>
        <label htmlFor="firstName">First name</label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          value={profile.firstName}
          onChange={handleChange}
          autoComplete="given-name"
        />
      </div>
      <div className={styles.fieldGroup}>
        <label htmlFor="lastName">Last name</label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          value={profile.lastName}
          onChange={handleChange}
          autoComplete="family-name"
        />
      </div>
      <div className={styles.fieldGroup}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={profile.email}
          onChange={handleChange}
          autoComplete="email"
        />
      </div>
      <div className={styles.fieldGroup}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={profile.password}
          onChange={handleChange}
          autoComplete="new-password"
        />
      </div>
      <div className={styles.fieldGroup}>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={profile.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
        />
      </div>
      <div style={{fontSize: '0.95rem', color: '#888', marginBottom: 8}}>
        Password fields are only needed if you want to change your password.
      </div>
      {(error || backendError) && <div style={{color: 'red', textAlign: 'center', marginTop: 8}}>{error || backendError}</div>}
      <button className={styles.saveBtn} type="submit">Save</button>
    </form>
  );
};

export default ProfileForm; 