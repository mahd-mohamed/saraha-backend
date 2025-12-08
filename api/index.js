import bootstrap from "./app.controller.js";
import express from "express";

const app = express();

// Bootstrap the app (routes, middleware, etc.)
bootstrap(app, express);

// Export for Vercel serverless
export default app;
