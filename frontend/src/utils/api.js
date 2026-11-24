import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true, // Send HttpOnly cookies automatically
  timeout: 15000, // 15-second request timeout to avoid endless pending requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

let inMemoryToken = null;

export const setAuthToken = (token) => {
  inMemoryToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

api.interceptors.request.use(
  (config) => {
    // Attach lightweight request tracking
    if (!config.headers['X-Correlation-ID']) {
      config.headers['X-Correlation-ID'] = 'req_' + Math.random().toString(36).substring(2, 10);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.userMessage = 'The request timed out. Please check your network and try again.';
    } else if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        // Session expired or unauthenticated
      }
    }
    return Promise.reject(error);
  }
);

export default api;
