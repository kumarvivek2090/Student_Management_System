import axios from 'axios';

const TOKEN_KEY = 'student_report_auth_token';

// Normalize API base URL: ensure it always points to the backend /api endpoint
// even if Vercel environment variable is set without trailing /api
const getBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl || !envUrl.trim()) {
    return '/api';
  }
  let url = envUrl.trim().replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

// Retrieve any persisted token from localStorage
let inMemoryToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true, // Send credentials when available
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(inMemoryToken ? { 'Authorization': `Bearer ${inMemoryToken}` } : {}),
  },
});

export const setAuthToken = (token) => {
  inMemoryToken = token;
  if (token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
    delete api.defaults.headers.common['Authorization'];
  }
};

api.interceptors.request.use(
  (config) => {
    // Ensure token is attached even across tab refreshes
    const activeToken = inMemoryToken || (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null);
    if (activeToken) {
      config.headers['Authorization'] = `Bearer ${activeToken}`;
    }
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
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/') {
          // Token expired or invalid
          setAuthToken(null);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
