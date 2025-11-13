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

// Single response interceptor: only attempt refresh if a refresh token exists.
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;
    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      // Unauthenticated user accessing a public endpoint: don't redirect; let caller handle it.
      return Promise.reject(error);
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/token/refresh/`,
        { refresh: refreshToken },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const { access } = response.data;
      localStorage.setItem('authToken', access);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${access}`;
      return axiosClient(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      // Do not redirect automatically; allow route guards to handle protected routes.
      return Promise.reject(refreshError);
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

// Removed duplicate response interceptor.

export default axiosClient;
