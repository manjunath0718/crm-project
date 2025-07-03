import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent long waits
  timeout: 10000,
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('Request timeout - backend might be sleeping');
      // You could show a user-friendly message here
    }
    return Promise.reject(error);
  }
);

// Function to wake up backend and retry request
export const wakeUpBackend = async () => {
  try {
    // Simple ping to wake up the backend
    await api.get('/');
    console.log('Backend is awake');
    return true;
  } catch (error) {
    console.error('Failed to wake up backend:', error);
    return false;
  }
};

// Enhanced API functions with retry logic
export const getEmployeesWithRetry = async (retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await api.get('/employees');
    } catch (error) {
      if (i === retries) throw error;
      console.log(`Attempt ${i + 1} failed, trying to wake up backend...`);
      await wakeUpBackend();
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

export const getLeadsWithRetry = async (retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await api.get('/leads');
    } catch (error) {
      if (i === retries) throw error;
      console.log(`Attempt ${i + 1} failed, trying to wake up backend...`);
      await wakeUpBackend();
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

// Employee CRUD
export const getEmployees = () => api.get('/employees');
export const addEmployee = (employeeData) => api.post('/employees', employeeData);
export const updateEmployee = (id, employeeData) => api.put(`/employees/${id}`, employeeData);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);
export const logoutEmployee = (email) => api.post('/employees/logout', { email });
export const updateEmployeeStatus = (id, status) => api.put(`/employees/${id}/status`, { status });

// Leads
export const getLeads = () => api.get('/leads');
export const updateLeadStatus = (id, data) => api.patch(`/leads/${id}`, data);
export const getLeadDistribution = () => api.get('/leads/distribution');

// Profile
export const getProfile = (id) => api.get(`/profile/${id}`);
export const updateProfile = (id, data) => api.put(`/profile/${id}`, data);

export default api; 