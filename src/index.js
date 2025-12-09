import express from "express";
import { createServer } from "http";
import bootstrap from "./app.controller.js";
import config from "../config/dev.config.js";
import { initializeSocket } from "./socket/socket.js";
import { setupSocketHandlers } from "./socket/socket.handler.js";

const app = express();
bootstrap(app, express);

let server;

// Vercel serverless functions expect the Express app itself as the handler.
// WebSocket support is not available on Vercel serverless, so only attach
// Socket.IO when running in a traditional server environment (local/long-lived).
if (process.env.VERCEL) {
    server = app;
} else {
    const httpServer = createServer(app);
    const io = initializeSocket(httpServer);
    setupSocketHandlers(io);
    app.set("io", io);

    const port = config.PORT || 3000;
    httpServer.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });

    server = httpServer;
}

export default server;