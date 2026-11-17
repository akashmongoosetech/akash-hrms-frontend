import { io, Socket } from 'socket.io-client';

const baseUrl =
  (import.meta as any).env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

// The connection is authenticated with the JWT, so it must not be opened before
// login. `autoConnect: false` + connectSocket() lets the app control that.
const socket: Socket = io(baseUrl, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  withCredentials: true,
  timeout: 5000,
  auth: { token: localStorage.getItem('token') || '' },
});

export const connectSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) return;
  socket.auth = { token };
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
