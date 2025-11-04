import axios from 'axios';

// Remove any trailing slashes from the base URL
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/').replace(/\/+$/, '');

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for sending cookies
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

// Add a response interceptor to handle errors and token refresh
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is not 401 or it's a retry request, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    
    try {
      // Try to refresh the token
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/auth/token/refresh/`,
        { refresh: refreshToken },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      const { access } = response.data;
      
      // Store the new token
      localStorage.setItem('authToken', access);
      
      // Update the Authorization header
      originalRequest.headers.Authorization = `Bearer ${access}`;
      
      // Retry the original request
      return axiosClient(originalRequest);
    } catch (error) {
      // If refresh token fails, clear auth and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }
  }
);

// Request interceptor to add auth token to requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and refresh token
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is not 401 or it's a retry request, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    
    try {
      // Try to refresh the token
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/auth/token/refresh/`,
        { refresh: refreshToken },
        { withCredentials: true }
      );
      
      const { access } = response.data;
      
      // Store the new token
      localStorage.setItem('authToken', access);
      
      // Update the Authorization header
      originalRequest.headers.Authorization = `Bearer ${access}`;
      
      // Retry the original request
      return axiosClient(originalRequest);
    } catch (error) {
      // If refresh token fails, clear auth and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }
  }
);

export default axiosClient;
