import jwt from "jsonwebtoken";
import config from "../../../config/dev.config.js";

export const generateToken = (payload, expiresIn = "1h") => {
    return jwt.sign({payload}, config.TOKEN_SECRET, { expiresIn });
};

export const verifyToken = (token, secretKey = config.TOKEN_SECRET) => {
    return jwt.verify(token, secretKey);
};

