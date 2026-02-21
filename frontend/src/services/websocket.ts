import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect() {
    if (this.socket?.connected) {
      console.log('✅ WebSocket already connected:', this.socket.id);
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      // Re-register all event listeners after reconnect
      this.setupEventRelay();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect manually
        this.socket?.connect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 WebSocket reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Attempting to reconnect...', attemptNumber);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 WebSocket connection error:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('WebSocket disconnected');
    }
  }

  joinQuizRoom(quizId: string) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket not connected, connecting first...');
      this.connect();
      // Wait for connection before joining
      setTimeout(() => {
        if (this.socket?.connected) {
          this.socket.emit('joinQuizRoom', { quizId }, (response: any) => {
            console.log('📍 Joined quiz room response:', response);
          });
          console.log(`📍 Joined quiz room: ${quizId}`);
        }
      }, 500);
      return;
    }
    
    this.socket.emit('joinQuizRoom', { quizId }, (response: any) => {
      console.log('📍 Joined quiz room response:', response);
    });
    console.log(`📍 Joined quiz room: ${quizId}`);
  }

  leaveQuizRoom(quizId: string) {
    if (!this.socket) return;
    this.socket.emit('leaveQuizRoom', { quizId });
    console.log(`🚪 Left quiz room: ${quizId}`);
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  off(event: string, callback?: Function) {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
      if (this.socket) {
        this.socket.off(event, callback as any);
      }
    } else {
      this.listeners.delete(event);
      if (this.socket) {
        this.socket.off(event);
      }
    }
  }

  private setupEventRelay() {
    if (!this.socket) return;

    // Set up listeners for all registered events
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.on(event, callback as any);
      });
    });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
