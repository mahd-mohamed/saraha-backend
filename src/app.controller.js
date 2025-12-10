import cors from "cors";
import rateLimit from "express-rate-limit";
import config from "../config/dev.config.js";
import { connectDB } from "./DB/index.js";
import { logger } from "./middleware/index.js";
import * as appRoutes from "./modules/index.js";
import { globalErrorHandler } from "./utils/index.js";

export default function bootstrap(app, express) {

    app.set('trust proxy', 1);
    
    // CORS configuration
    const allowedOrigins = Array.isArray(config.FRONTEND_URLs) 
        ? config.FRONTEND_URLs 
        : [config.FRONTEND_URLs].filter(Boolean);
    
    console.log('CORS allowed origins:', allowedOrigins);
    
    app.use(cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) {
                console.log('CORS: No origin, allowing request');
                return callback(null, true);
            }
            
            // Check if origin is in allowed list
            const isAllowed = allowedOrigins.some(allowed => {
                return origin === allowed || origin.startsWith(allowed);
            });
            
            if (isAllowed) {
                console.log('CORS: Allowing origin:', origin);
                callback(null, true);
            } else {
                console.log('CORS: Blocking origin:', origin);
                console.log('CORS: Allowed origins:', allowedOrigins);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "refreshtoken"],
    }));

    const apiLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 50, // limit each IP to 50 requests per windowMs
        handler: (req, res, next, options) => {
            throw new Error(options.message, { cause: options.statusCode });
        }
    });

    app.use(apiLimiter);
    
    app.use(express.json());
    app.use("/uploads", express.static("uploads"));
    app.use(logger);
    connectDB(config.DB_URI);

    //Routes
    app.use("/auth", appRoutes.authRouter);
    app.use("/user", appRoutes.userRouter);
    app.use("/message", appRoutes.messageRouter);

    app.get("/", (req, res) => {
        res.send("Hello World!");
    });

    //global error handler
    app.use(globalErrorHandler);

}