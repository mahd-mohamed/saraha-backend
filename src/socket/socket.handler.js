import { verifyToken } from "../utils/index.js";
import { userModel } from "../DB/index.js";
import { connectedUsers } from "./socket.js";

export const setupSocketHandlers = (io) => {
    io.on("connection", async (socket) => {
        console.log("New socket connection:", socket.id);

        // Authenticate user on connection
        const token = socket.handshake.auth.token;

        if (!token) {
            console.log("No token provided, disconnecting socket");
            socket.disconnect();
            return;
        }

        try {
            // Verify JWT token
            const decoded = verifyToken(token);
            const { payload } = decoded;

            // Check if user exists
            const user = await userModel.findById(payload._id);
            if (!user) {
                console.log("User not found, disconnecting socket");
                socket.disconnect();
                return;
            }

            // Store user connection
            const userId = user._id.toString();
            connectedUsers.set(userId, socket.id);
            socket.userId = userId;

            console.log(`User ${user.name} (${userId}) connected with socket ${socket.id}`);
            console.log(`Total connected users: ${connectedUsers.size}`);

            // Handle disconnection
            socket.on("disconnect", () => {
                console.log(`User ${userId} disconnected`);
                connectedUsers.delete(userId);
                console.log(`Total connected users: ${connectedUsers.size}`);
            });

            // Handle errors
            socket.on("error", (error) => {
                console.error("Socket error:", error);
            });

        } catch (error) {
            console.error("Authentication error:", error.message);
            socket.disconnect();
        }
    });
};
