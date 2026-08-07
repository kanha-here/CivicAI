import { Server } from 'socket.io';

let io = null;

export function initializeRealtime(httpServer, allowedOrigins) {
  io = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin.trim().replace(/\/+$/, ''))) {
          return callback(null, true);
        }

        return callback(new Error(`Origin ${origin} is not allowed by Socket.IO CORS`));
      },
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('join:complaint', (complaintId) => {
      if (complaintId) socket.join(`complaint:${complaintId}`);
    });

    socket.on('join:dashboard', (scope = 'operations') => {
      socket.join(`dashboard:${scope}`);
    });
  });

  return io;
}

export function emitRealtime(event, payload) {
  if (!io) return;
  io.emit(event, payload);

  if (payload?.complaintId) {
    io.to(`complaint:${payload.complaintId}`).emit(event, payload);
  }

  if (payload?.scope) {
    io.to(`dashboard:${payload.scope}`).emit(event, payload);
  }
}
