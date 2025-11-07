// import { io, Socket } from 'socket.io-client';

// const socket: Socket = io('https://akash-hrms-backend.onrender.com');

// export default socket;

import { io, Socket } from 'socket.io-client';

const socket: Socket = io((import.meta as any).env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');

export default socket;