import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { transformRequest, transformResponse } from '../utils/caseTransform';
// Get API base URL from environment or default to local API endpoint prefix
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Create Axios Instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}` : '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach JWT / Supabase Bearer Token + transform request to snake_case
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('kafaas_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data) {
      console.log('[apiClient] Request URL:', config.url);
      console.log('[apiClient] Request data before transform:', JSON.stringify(config.data));
      config.data = transformRequest(config.data);
      console.log('[apiClient] Request data after transform:', JSON.stringify(config.data));
    }
    if (config.params) {
      config.params = transformRequest(config.params);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401s, standardize API errors, transform response to camelCase
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.data) {
      response.data = transformResponse(response.data);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired
      // localStorage.removeItem('kafaas_auth_token');
    }
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Simulated latency helper for local dev mock fallback
export const mockDelay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms));
