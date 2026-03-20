import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
  (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:8000');

class SocketService {
  constructor() {
    this.socket = null;
  }

  /**
   * Connect to the WebSocket server.
   * Uses `userId` as a query param so the server can place
   * this client in the correct per-user room on every
   * connect AND reconnect automatically.
   */
  connect(userId) {
    if (this.socket?.connected) return this.socket;

    this.socket = io(SOCKET_URL, {
      query: { userId },
      // Socket.IO defaults: reconnection=true, attempts=Infinity
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,       // start at 1s
      reconnectionDelayMax: 10000,   // cap at 10s
      // Let Socket.IO use its default transport strategy:
      // starts with HTTP long-polling (always works), then upgrades to WebSocket.
      // Forcing 'websocket' only causes repeated failures if the WS handshake drops.
    });

    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`[Socket] Reconnected after ${attemptNumber} attempt(s)`);
      // The server re-adds the client to the room automatically
      // because userId is always present in socket.handshake.query
    });

    return this.socket;
  }

  /**
   * Subscribe to live verdict updates for the current user.
   * @param {(data: {submissionId, userId, verdict, status}) => void} callback
   */
  onSubmissionUpdate(callback) {
    if (!this.socket) return;
    this.socket.on('submission_update', callback);
  }

  /** Remove the submission_update listener */
  offSubmissionUpdate(callback) {
    if (!this.socket) return;
    this.socket.off('submission_update', callback);
  }

  /** Gracefully close the socket (called on logout) */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('[Socket] Manually disconnected.');
    }
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }
}

// Export a singleton — one socket for the entire app
export const socketService = new SocketService();
