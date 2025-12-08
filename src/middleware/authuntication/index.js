import { verifyToken } from "../../utils/index.js";
import { userModel, tokenModel } from "../../DB/index.js";

//Authorization middleware
export const isAuthenticated = async(req, res, next) => {
    try {
        const token = req.headers.authorization;
        //check if token exists
        if (!token) {
            throw new Error("Unauthorized, token is required", { cause: 401 });
        }

        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            // Handle JWT verification errors
            if (error.message === "jwt expired") {
                throw new Error("Unauthorized, token expired", { cause: 401 });
            }
            throw new Error("Unauthorized, invalid token", { cause: 401 });
        }

        const {payload, iat} = decoded;
        
        //check if token is blocked
        const blochedToken = await tokenModel.findOne({token, type: "access"});
        if (blochedToken) {
            throw new Error("Unauthorized, blocked token", { cause: 401 });
        }

        const userExists = await userModel.findById(payload._id);
        //check if user exists
        if (!userExists) {
            throw new Error("User not found", { cause: 404 });
        }

        //check if user updated credentials >>> logout from all devices
        if (userExists.credentialsUpdatedAt && iat && userExists.credentialsUpdatedAt > new Date(iat * 1000)) {
            throw new Error("Unauthorized, token expired", { cause: 401 });
        }
        req.user = userExists;
        next();
    } catch (error) {
        next(error);
    }
};
