import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

function hasValidJwt(token?: string | null) {
  if (!token) return false;

  try {
    const parts = token.split('.');
    if (parts.length < 2) return false;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));

    if (typeof payload.exp !== 'number') return true;
    return Date.now() / 1000 < payload.exp;
  } catch {
    return false;
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setHydrated: () => void;
  initializeFromStorage: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,
      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),
      setHydrated: () => set({ hasHydrated: true }),
      initializeFromStorage: () => {
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');

        const cookieToken = document.cookie
          .split('; ')
          .find((row) => row.startsWith('access_token='))
          ?.split('=')
          .slice(1)
          .join('=');

        const activeToken = token || cookieToken;

        if (!activeToken || !hasValidJwt(activeToken)) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
          set({ user: null, token: null, isAuthenticated: false, hasHydrated: true });
          return;
        }

        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            set({ user, token: activeToken, isAuthenticated: true, hasHydrated: true });
          } catch (e) {
            console.error('Failed to parse user from localStorage', e);
            set({ user: null, token: activeToken, isAuthenticated: true, hasHydrated: true });
          }
        } else {
          set({ user: null, token: activeToken, isAuthenticated: true, hasHydrated: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
        if (state?.token && !state.isAuthenticated) {
          state.isAuthenticated = true;
        }
      },
    }
  )
);
