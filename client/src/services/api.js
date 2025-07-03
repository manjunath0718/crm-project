import axios from 'axios';

// Use environment variable for production, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increase timeout for backend wake-up scenarios
  timeout: 30000, // 30 seconds
});

// Retry logic for backend wake-up scenarios
const retryRequest = async (config, retries = 2, delay = 3000) => {
  try {
    return await api(config);
  } catch (error) {
    if (retries > 0 && (error.code === 'ECONNABORTED' || error.response?.status >= 500)) {
      console.log(`Request failed, retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(config, retries - 1, delay * 1.5); // Exponential backoff
    }
    throw error;
  }
};

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
    if (error.code === 'ECONNABORTED') {
      console.warn('Request timed out - backend might be waking up');
    }
    return Promise.reject(error);
  }
);

// Employee CRUD with retry logic
export const getEmployees = () => retryRequest({ method: 'GET', url: '/employees' });
export const addEmployee = (employeeData) => retryRequest({ method: 'POST', url: '/employees', data: employeeData });
export const updateEmployee = (id, employeeData) => retryRequest({ method: 'PUT', url: `/employees/${id}`, data: employeeData });
export const deleteEmployee = (id) => retryRequest({ method: 'DELETE', url: `/employees/${id}` });
export const logoutEmployee = (email) => retryRequest({ method: 'POST', url: '/employees/logout', data: { email } });
export const updateEmployeeStatus = (id, status) => retryRequest({ method: 'PUT', url: `/employees/${id}/status`, data: { status } });

// Leads with retry logic
export const getLeads = () => retryRequest({ method: 'GET', url: '/leads' });
export const updateLeadStatus = (id, data) => retryRequest({ method: 'PATCH', url: `/leads/${id}`, data });
export const getLeadDistribution = () => retryRequest({ method: 'GET', url: '/leads/distribution' });

// Profile with retry logic
export const getProfile = (id) => retryRequest({ method: 'GET', url: `/profile/${id}` });
export const updateProfile = (id, data) => retryRequest({ method: 'PUT', url: `/profile/${id}`, data });

export default api; 