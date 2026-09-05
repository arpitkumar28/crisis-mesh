import { useAuthStore } from '@/lib/store/auth-store';
import { wsClient } from '@/lib/websocket-client';
import { apiClient } from '@/lib/api-client';

/**
 * There are three places a token/session can live in this app: the
 * `access_token` cookie (read by middleware.ts for route gating), the
 * `access_token`/`user`/`refresh_token` keys in localStorage (read by
 * api-client.ts for the Authorization header), and the zustand
 * `auth-storage` persisted store (read by React components). Logging out
 * must clear all three, and disconnect the live WebSocket — a partial
 * clear leaves stale state that can let a user see a protected page shell
 * with no valid token behind it.
 *
 * It must also tell the backend, so the real refresh token is revoked
 * (see POST /v1/auth/logout in services/api/src/auth) — otherwise a
 * "logged out" session's refresh token stays valid until it naturally
 * expires. Revocation is best-effort: if the network call fails, local
 * state is still cleared so the user is signed out of this browser
 * either way.
 */
export async function performLogout() {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
  try {
    await apiClient.post('/auth/logout', refreshToken ? { refresh_token: refreshToken } : {});
  } catch (error) {
    console.error('Backend logout call failed (clearing local session anyway):', error);
  }

  if (typeof document !== 'undefined') {
    document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
  wsClient.disconnect();
  useAuthStore.getState().logout();
}
