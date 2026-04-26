import axios from 'axios';

const api = axios.create({
  baseURL: 'https://crm-project-one-ruddy.vercel.app/api/v1',
});

// Add interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
