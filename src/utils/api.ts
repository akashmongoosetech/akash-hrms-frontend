import axios from 'axios';

const API = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || 'http://localhost:5000',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
