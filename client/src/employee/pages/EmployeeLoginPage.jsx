import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EmployeeLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/employees/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const text = await res.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error('Invalid server response');
        }
      } else {
        throw new Error('Empty server response');
      }
      if (!res.ok) throw new Error(data.error || 'Login failed');
      const fullName = `${data.firstName} ${data.lastName}`;
      sessionStorage.setItem('employeeName', fullName);
      sessionStorage.setItem('employeeEmail', email);
      if (data._id) sessionStorage.setItem('employeeId', data._id);
      navigate('/employee/home');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Employee Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 16 }}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Password (Last Name)</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: 10, borderRadius: 6, background: '#3b4890', color: '#fff', border: 'none', fontWeight: 600 }}>Login</button>
      </form>
    </div>
  );
};

export default EmployeeLoginPage; 