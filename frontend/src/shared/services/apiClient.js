import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api/v1`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken') || localStorage.getItem('examinerToken') || localStorage.getItem('uploaderToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for unified error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request - Token may be expired.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
