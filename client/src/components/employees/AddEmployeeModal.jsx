import React, { useState, useEffect } from 'react';
import styles from './AddEmployeeModal.module.css';


const locationOptions = ["Pune", "Hyderabad", "Delhi"];
const languageOptions = ["Hindi", "English", "Bengali", "Tamil"];

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  language: '',
};

const AddEmployeeModal = ({ onClose, onSave, initialData }) => {
  const [form, setForm] = useState(initialData || initialForm);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        <h2 className={styles.title}>{initialData ? 'Edit Employee' : 'Add New Employee'}</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            First name
            <input name="firstName" value={form.firstName} onChange={handleChange} required />
          </label>
          <label>
            Last name
            <input name="lastName" value={form.lastName} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Phone Number
            <input name="phone" type="tel" pattern="[0-9]{10}" maxLength="10" value={form.phone} onChange={handleChange} required placeholder="10-digit number" />
          </label>
          <label>
            Location
            <select name="location" value={form.location} onChange={handleChange} required disabled={!!initialData}>
              <option value="" disabled>Select Location</option>
              {locationOptions.map(state => <option key={state} value={state}>{state}</option>)}
            </select>
          </label>
          <label>
            Preferred Language
            <select name="language" value={form.language} onChange={handleChange} required disabled={!!initialData}>
              <option value="" disabled>Select Language</option>
              {languageOptions.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
          </label>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.saveBtn}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal; 