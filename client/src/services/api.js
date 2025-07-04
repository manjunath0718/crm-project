import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
fetch(`${API_URL}/api/dashboard/stats`)

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Employee CRUD
export const getEmployees = () => api.get('/api/employees');
export const addEmployee = (employeeData) => api.post('/api/employees', employeeData);
export const updateEmployee = (id, employeeData) => api.put(`/api/employees/${id}`, employeeData);
export const deleteEmployee = (id) => api.delete(`/api/employees/${id}`);
export const logoutEmployee = (email) => api.post('/api/employees/logout', { email });
export const updateEmployeeStatus = (id, status) => api.put(`/api/employees/${id}/status`, { status });

// Leads
export const getLeads = () => api.get('/api/leads');
export const updateLeadStatus = (id, data) => api.patch(`/api/leads/${id}`, data);
export const getLeadDistribution = () => api.get('/api/leads/distribution');

// Profile
export const getProfile = (id) => api.get(`/profile/${id}`);
export const updateProfile = (id, data) => api.put(`/profile/${id}`, data);

export default api; 