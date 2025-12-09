import bootstrap from "./app.controller.js";
import express from "express";
import { createServer } from "http";
import config from "../config/dev.config.js";
import { initializeSocket } from "./socket/socket.js";
import { setupSocketHandlers } from "./socket/socket.handler.js";

const app = express();
const httpServer = createServer(app);
const port = config.PORT || 3000;

// Initialize Socket.IO
const io = initializeSocket(httpServer);
setupSocketHandlers(io);

// Make io accessible to routes
app.set("io", io);

bootstrap(app, express);

httpServer.listen(port, () => {
    console.log(`Server is running on " http://localhost:${port} "`);
});

// Export for Vercel serverless
export default httpServer;