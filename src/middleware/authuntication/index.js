import { verifyToken } from "../../utils/index.js";
import { userModel, tokenModel } from "../../DB/index.js";

//Authorization middleware
export const isAuthenticated = async(req, res, next) => {
    try {
        const token = req.headers.authorization;
        //check if token exists
        if (!token) {
            console.log("Authentication failed: No token provided");
            throw new Error("Unauthorized, token is required", { cause: 401 });
        }

        console.log("Verifying token, length:", token.length);

        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            console.error("Token verification error:", error.message);
            // Handle JWT verification errors
            if (error.message === "jwt expired") {
                throw new Error("Unauthorized, token expired", { cause: 401 });
            }
            throw new Error("Unauthorized, invalid token", { cause: 401 });
        }

        const {payload, iat} = decoded;
        console.log("Token decoded successfully, user ID:", payload._id);
        console.log("Token iat (issued at):", iat, "Date:", iat ? new Date(iat * 1000) : 'N/A');
        
        //check if token is blocked (only check for access tokens that were explicitly blocked)
        // Note: We don't store access tokens in DB, only refresh tokens, so this check may not be needed
        // But keeping it for security if tokens are blocked in the future
        const blockedToken = await tokenModel.findOne({token, type: "access"});
        if (blockedToken) {
            console.log("Token is blocked");
            throw new Error("Unauthorized, blocked token", { cause: 401 });
        }

        const userExists = await userModel.findById(payload._id);
        //check if user exists
        if (!userExists) {
            console.log("User not found in database");
            throw new Error("User not found", { cause: 404 });
        }

        console.log("User found:", userExists.email);
        console.log("User credentialsUpdatedAt:", userExists.credentialsUpdatedAt);
        
        //check if user updated credentials >>> logout from all devices
        // Only check if credentials were updated significantly after token was issued (more than 1 second)
        // This accounts for timing differences when creating new users
        if (userExists.credentialsUpdatedAt && iat) {
            const tokenIssuedAt = new Date(iat * 1000);
            const credentialsUpdated = new Date(userExists.credentialsUpdatedAt);
            const timeDiff = credentialsUpdated.getTime() - tokenIssuedAt.getTime();
            
            console.log("Comparing dates - Token issued:", tokenIssuedAt, "Credentials updated:", credentialsUpdated);
            console.log("Time difference (ms):", timeDiff);
            
            // Only expire token if credentials were updated more than 1 second after token was issued
            // This prevents false positives due to timing issues during user creation
            if (timeDiff > 1000) {
                console.log("Token expired because credentials were updated after token was issued");
                throw new Error("Unauthorized, token expired", { cause: 401 });
            } else {
                console.log("Time difference is acceptable, token is valid");
            }
        }
        req.user = userExists;
        next();
    } catch (error) {
        next(error);
    }
};
