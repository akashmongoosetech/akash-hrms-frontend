// import { io, Socket } from 'socket.io-client';

// const socket: Socket = io('https://akash-hrms-backend.onrender.com');

// export default socket;

import { io, Socket } from 'socket.io-client';

const socket: Socket = io((import.meta as any).env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 3,
  reconnectionDelay: 1000,
  withCredentials: true,
  timeout: 5000
});

// Handle connection errors gracefully
socket.on('connect_error', (error) => {
  console.log('Socket connection error:', error.message);
});

socket.on('error', (error) => {
  console.log('Socket error:', error);
});

export default socket;