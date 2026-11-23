import { io, Socket } from 'socket.io-client';

const baseUrl =
  (import.meta as any).env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// A stable id per browser tab. It is sent during the handshake so the server
// can distinguish tabs/devices belonging to the same user. sessionStorage is
// intentional: a new tab gets a new id, while a refresh keeps the same one.
const DEVICE_SESSION_KEY = 'hrms.deviceSessionId';

export const getDeviceSessionId = () => {
  if (typeof window === 'undefined') return '';
  try {
    let id = window.sessionStorage.getItem(DEVICE_SESSION_KEY);
    if (!id) {
      const random =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      id = random;
      window.sessionStorage.setItem(DEVICE_SESSION_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
};

// The connection is authenticated with the JWT, so it must not be opened before
// login. `autoConnect: false` + connectSocket() lets the app control that.
const socket: Socket = io(baseUrl, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  withCredentials: true,
  timeout: 10000,
  auth: {
    token: localStorage.getItem('token') || '',
    deviceSessionId: getDeviceSessionId(),
  },
});

export const connectSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) return;
  socket.auth = {
    token,
    deviceSessionId: getDeviceSessionId(),
  };
  if (!socket.connected) socket.connect();
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};

socket.on('connect_error', (error) => {
  console.log('Socket connection error:', error.message);
});

socket.on('error', (error) => {
  console.log('Socket error:', error);
});

export default socket;
