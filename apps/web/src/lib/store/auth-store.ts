import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
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
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');
        
        // Also check cookies as fallback for middleware-based auth
        const cookieToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('access_token='))
          ?.split('=')[1];
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            set({ user, token, isAuthenticated: true, hasHydrated: true });
          } catch (e) {
            console.error('Failed to parse user from localStorage', e);
            set({ hasHydrated: true });
          }
        } else if (cookieToken) {
          // Fallback: if cookie exists but localStorage doesn't, use cookie token
          // This handles cases where middleware validated auth but client storage is empty
          set({ token: cookieToken, isAuthenticated: true, hasHydrated: true });
        } else {
          set({ hasHydrated: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
        // Set isAuthenticated based on stored token after hydration
        if (state?.token && !state.isAuthenticated) {
          state.isAuthenticated = true;
        }
      },
    }
  )
);
