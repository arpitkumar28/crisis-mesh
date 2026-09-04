import { io, Socket } from 'socket.io-client';

function getWsUrl() {
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (!WS_URL) {
    throw new Error('Missing required environment variable: NEXT_PUBLIC_WS_URL');
  }
  return WS_URL;
}

class WebSocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private connectionListeners = new Set<(state: string) => void>();

  private notifyConnection(state: string) {
    this.connectionListeners.forEach((listener) => listener(state));
  }

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    const WS_URL = getWsUrl();
    this.socket = io(`${WS_URL}/ws`, {
      auth: { token },
      path: '/ws',
      transports: ['websocket'],
      reconnection: true,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.notifyConnection('connected');
    });

    this.socket.io.on('reconnect_attempt', () => this.notifyConnection('reconnecting'));
    this.socket.io.on('reconnect', () => this.notifyConnection('reconnected'));

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.notifyConnection('disconnected');
    });

    // The gateway's auth middleware rejects an expired/invalid token
    // with `next(new Error('Unauthorized'))` (see
    // services/api/src/websocket/websocket.gateway.ts), which surfaces
    // here as connect_error, not disconnect. Retrying with the same bad
    // token forever would just loop silently — stop retrying and tell
    // listeners explicitly so the app can react (e.g. re-auth or prompt
    // login) instead of leaving the operator on a dead live feed with no
    // signal why.
    this.socket.on('connect_error', (err: Error) => {
      console.log('WebSocket connect_error:', err.message);
      if (err.message === 'Unauthorized') {
        this.socket?.disconnect();
        this.notifyConnection('auth_error');
      }
    });

    this.socket.on('connection.established', (data) => {
      console.log('Connection established:', data);
    });

    // Set up event listeners for all registered events
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.on(event, callback);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback: (data: any) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (this.socket) {
        this.socket.off(event, callback);
      }
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  onConnectionChange(listener: (state: string) => void) {
    this.connectionListeners.add(listener);
    listener(this.isConnected() ? 'connected' : 'disconnected');
    return () => this.connectionListeners.delete(listener);
  }
}

export const wsClient = new WebSocketClient();
