import { useAuthStore } from '@/lib/store/auth-store';
import { wsClient } from '@/lib/websocket-client';

/**
 * There are three places a token/session can live in this app: the
 * `access_token` cookie (read by middleware.ts for route gating), the
 * `access_token`/`user`/`refresh_token` keys in localStorage (read by
 * api-client.ts for the Authorization header), and the zustand
 * `auth-storage` persisted store (read by React components). Logging out
 * must clear all three, and disconnect the live WebSocket — a partial
 * clear leaves stale state that can let a user see a protected page shell
 * with no valid token behind it.
 */
export function performLogout() {
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
