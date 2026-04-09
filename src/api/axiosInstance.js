import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:5000/api',
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle unified error messages
api.interceptors.response.use((response) => {
  return response.data; // automatically unpack data
}, (error) => {
  const message = error.response?.data?.error || error.message || 'An error occurred';
  return Promise.reject(new Error(message));
});

export default api;
