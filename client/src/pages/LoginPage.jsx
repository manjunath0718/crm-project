import React from 'react';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  return (
    <div className={styles.loginPage}>
      <div className={styles.loginFormContainer}>
        <h1 className={styles.title}>CanovaCRM</h1>
        <h2 className={styles.subtitle}>Welcome back! Please login to your account.</h2>
        <form>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit" className={styles.loginButton}>Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 