import fs from "node:fs";
import path from "node:path";

export const logger = (req, res, next) => {
    // Capture start time
    const start = Date.now();
    const { method, url, ip, headers } = req;

    // Use process.cwd() to get the root directory of the project
    const logFile = path.join(process.cwd(), "logs", "access.log");

    // Extract directory path
    const logDir = path.dirname(logFile);

    // Create directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    // Wait for the response to finish to capture user context and status
    res.on('finish', () => {
        const duration = Date.now() - start;
        const timestamp = new Date().toISOString();
        const userAgent = headers["user-agent"] || "Unknown";
        const status = res.statusCode;

        // Determine Identity
        let identity = "Anonymous";
        if (req.user && req.user.email) {
            identity = `User:${req.user.email}`;
        } else if (req.body && req.body.email) {
            identity = `Visitor:${req.body.email}`;
        }

        // Log format: Timestamp | Status | Identity | Method | URL | IP | Duration | UserAgent
        const logEntry = `${timestamp} | ${status} | ${identity} | ${method} ${url} | ${ip} | ${duration}ms | ${userAgent}\n`;

        fs.appendFileSync(logFile, logEntry);
    });

    next();
};
