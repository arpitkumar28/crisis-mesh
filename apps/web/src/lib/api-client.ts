import axios from 'axios';

let apiClientInstance: ReturnType<typeof axios.create> | null = null;

function getApiClient() {
  if (!apiClientInstance) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.trim();

    if (!API_BASE_URL) {
      throw new Error('Missing required environment variable: NEXT_PUBLIC_API_URL');
    }

    apiClientInstance = axios.create({
      baseURL: `${API_BASE_URL.replace(/\/+$/, '')}/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    apiClientInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle errors
    apiClientInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear token and redirect to login
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
  return apiClientInstance;
}

export const apiClient = new Proxy({} as ReturnType<typeof axios.create>, {
  get(_target, prop) {
    return (getApiClient() as any)[prop];
  },
});

export default apiClient;
