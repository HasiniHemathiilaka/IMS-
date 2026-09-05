import axios from 'axios';

// Base API instance
const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token (skip for auth endpoints)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Don't attach a stale token to sign-in requests — it causes
    // the JWTFilter to run the wrong user context on the backend.
    const isAuthEndpoint = config.url?.includes('/auth/');
    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log out on 401. A 403 means the user is logged in but lacks a specific role.
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
