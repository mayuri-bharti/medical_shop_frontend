import axios from 'axios';

// ✅ Get default API URL dynamically - improved for Vercel and mobile
const getDefaultApiUrl = () => {
  // Check if we're in development (localhost)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
      return 'http://localhost:4000/api';
    }
  }
  
  // Production: Use Vercel backend URL
  // Check environment variable first, then fallback to default Vercel URL
  return 'https://medical-shop-backend.vercel.app/api';
};

// ✅ Use environment variable if available, else fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || getDefaultApiUrl();

console.log('API Base URL:', API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for mobile networks (increased from 30s)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ✅ Add Authorization token - check both localStorage and sessionStorage
api.interceptors.request.use(
  (config) => {
    // Check both localStorage and sessionStorage for token
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('accessToken') ||
                  sessionStorage.getItem('token') ||
                  sessionStorage.getItem('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging (only in development)
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params || '');
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// ✅ Handle responses and errors - improved for mobile
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Enhanced error handling
    const errorMessage = error.response?.data?.message || error.message || 'Network error';
    const errorStatus = error.response?.status;
    
    // Log error details
    console.error('API Error:', {
      message: errorMessage,
      status: errorStatus,
      url: error.config?.url,
      code: error.code,
    });
    
    // Handle 401 Unauthorized
    if (errorStatus === 401) {
      // Clear tokens from both storages
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('accessToken');
      // Redirect to login only if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Handle network errors (common on mobile)
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      console.warn('Network error detected - this may be due to slow mobile connection');
    }
    
    return Promise.reject(error);
  }
);

export default api;
