import axios from 'axios';

let apiClientInstance: ReturnType<typeof axios.create> | null = null;

// A 401 triggers at most one silent refresh attempt via the real
// POST /v1/auth/refresh endpoint before giving up and redirecting to
// login. This is tracked per-request (not globally) via a retry flag on
// the request config, so concurrent requests each get one fair attempt
// without an infinite loop if the refresh itself fails.
let refreshInFlight: Promise<string | null> | null = null;

function clearSessionAndRedirect() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
  window.location.href = '/login';
}

async function refreshAccessToken(baseURL: string): Promise<string | null> {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
  if (!refreshToken) return null;

  if (!refreshInFlight) {
    refreshInFlight = axios
      .post(`${baseURL}/auth/refresh`, { refresh_token: refreshToken })
      .then((res) => {
        const data = res.data?.data;
        if (data?.access_token) {
          localStorage.setItem('access_token', data.access_token);
          document.cookie = `access_token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;
          if (data.refresh_token) {
            localStorage.setItem('refresh_token', data.refresh_token);
          }
          return data.access_token as string;
        }
        return null;
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

function getApiClient() {
  if (!apiClientInstance) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.trim();

    if (!API_BASE_URL) {
      throw new Error('Missing required environment variable: NEXT_PUBLIC_API_URL');
    }

    // Accept NEXT_PUBLIC_API_URL in any of the shapes people reasonably
    // set it to — the bare origin, origin+/api, or origin+/api/v1 — and
    // always land on origin+/api/v1. Stripping only a trailing /api (not
    // /api/v1) meant a value that already included /v1 doubled up to
    // .../api/v1/api/v1 on every request, a real deployment-config trap.
    const normalizedBaseUrl = API_BASE_URL.replace(/\/api(\/v1)?\/?$/, '').replace(/\/+$/, '');
    const apiBaseURL = `${normalizedBaseUrl}/api/v1`;

    apiClientInstance = axios.create({
      baseURL: apiBaseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to attach the auth token. Never log request
    // bodies here — login/register calls carry plaintext credentials.
    apiClientInstance.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Response interceptor: on 401, try exactly one silent refresh via
    // the real refresh endpoint before clearing the session. Never log
    // response bodies — they can carry tokens or PII.
    apiClientInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as (typeof error.config & { _retried?: boolean }) | undefined;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retried && typeof window !== 'undefined') {
          originalRequest._retried = true;
          const newToken = await refreshAccessToken(apiBaseURL);
          if (newToken) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClientInstance!.request(originalRequest);
          }
          clearSessionAndRedirect();
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
