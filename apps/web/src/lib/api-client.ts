import axios from 'axios';

let apiClientInstance: ReturnType<typeof axios.create> | null = null;

function getApiClient() {
  if (!apiClientInstance) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.trim();

    if (!API_BASE_URL) {
      throw new Error('Missing required environment variable: NEXT_PUBLIC_API_URL');
    }

    const normalizedBaseUrl = API_BASE_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '');

    apiClientInstance = axios.create({
      baseURL: `${normalizedBaseUrl}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token and logging
    apiClientInstance.interceptors.request.use((config) => {
      console.log(`🚀 [API REQUEST] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Response interceptor to handle errors and logging
    apiClientInstance.interceptors.response.use(
      (response) => {
        console.log(`✅ [API RESPONSE] ${response.status} ${response.config.url}`, response.data);
        return response;
      },
      (error) => {
        console.error(`❌ [API ERROR] ${error.response?.status || 'NETWORK'} ${error.config?.url}`, error.response?.data || error.message);
        if (error.response?.status === 401) {
          // Clear token and redirect to login
          localStorage.removeItem('access_token');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
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
