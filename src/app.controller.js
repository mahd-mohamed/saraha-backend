import cors from "cors";
import rateLimit from "express-rate-limit";
import config from "../config/dev.config.js";
import { connectDB } from "./DB/index.js";
import { logger } from "./middleware/index.js";
import * as appRoutes from "./modules/index.js";
import { globalErrorHandler } from "./utils/index.js";

export default async function bootstrap(app, express) {

    app.set('trust proxy', 1);
    app.use(cors({
        origin: config.FRONTEND_URLs,
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
    if (!config.DB_URI) {
        throw new Error("Missing DB_URI environment variable");
    }

    await connectDB(config.DB_URI);

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