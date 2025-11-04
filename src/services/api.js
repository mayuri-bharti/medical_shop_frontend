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
  // IMPORTANT: Always use the full backend URL, never relative
  return 'https://medical-shop-backend.vercel.app/api';
};

// ✅ Use environment variable if available, else fallback
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || getDefaultApiUrl();

// Clean up the API URL - remove quotes and whitespace
if (API_BASE_URL) {
  API_BASE_URL = String(API_BASE_URL).trim();
  
  // Remove surrounding quotes if present (common issue with Vercel env vars)
  if ((API_BASE_URL.startsWith('"') && API_BASE_URL.endsWith('"')) || 
      (API_BASE_URL.startsWith("'") && API_BASE_URL.endsWith("'"))) {
    API_BASE_URL = API_BASE_URL.slice(1, -1).trim();
  }
  
  // Remove any leading/trailing slashes that might cause issues
  API_BASE_URL = API_BASE_URL.replace(/\/+$/, ''); // Remove trailing slashes
}

// Validate and ensure API_BASE_URL is always absolute
if (!API_BASE_URL || (!API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://'))) {
  // If not a valid absolute URL, use default
  console.warn('⚠️ Invalid API_BASE_URL, using default:', API_BASE_URL);
  API_BASE_URL = getDefaultApiUrl();
}

// Log API configuration for debugging
console.log('🔧 API Configuration:', {
  baseURL: API_BASE_URL,
  env: import.meta.env.VITE_API_BASE_URL || 'not set',
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
  mode: import.meta.env.MODE
});

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
    // Ensure URL is always absolute
    if (config.url && !config.url.startsWith('http://') && !config.url.startsWith('https://')) {
      // URL is relative, baseURL will handle it
      const fullUrl = config.baseURL 
        ? `${config.baseURL}${config.url.startsWith('/') ? '' : '/'}${config.url}`
        : config.url;
      console.log(`🌐 API Request URL: ${fullUrl}`);
    }
    
    // Check both localStorage and sessionStorage for token
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('accessToken') ||
                  sessionStorage.getItem('token') ||
                  sessionStorage.getItem('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging (always log in production for troubleshooting)
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
      params: config.params || {},
      headers: { ...config.headers, Authorization: token ? 'Bearer ***' : 'none' }
    });
    
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
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
    
    // Log error details with full URL
    const fullUrl = error.config?.baseURL 
      ? `${error.config.baseURL}${error.config.url || ''}`
      : error.config?.url || 'unknown';
    
    console.error('❌ API Error:', {
      message: errorMessage,
      status: errorStatus,
      url: fullUrl,
      baseURL: error.config?.baseURL,
      relativeURL: error.config?.url,
      code: error.code,
      response: error.response?.data
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
