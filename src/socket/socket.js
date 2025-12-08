import { Server } from "socket.io";
import config from "../../config/dev.config.js";

// Store connected users: userId -> socketId
export const connectedUsers = new Map();

export const initializeSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: config.FRONTEND_URLs,
            credentials: true,
            methods: ["GET", "POST"]
        }
    });

    console.log("Socket.IO server initialized");

    return io;
};

export const getReceiverSocketId = (receiverId) => {
    return connectedUsers.get(receiverId);
};
