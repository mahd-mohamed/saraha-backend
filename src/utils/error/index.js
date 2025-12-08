import fs from "fs";
import {generateToken, verifyToken} from "../token/index.js";
import {tokenModel} from "../../DB/index.js";

export const asyncHandler = (fn) => {

    const handler = (req, res, next) => {
        fn(req, res, next).catch( err => next(err));
    };
    
    return handler;
};


export const globalErrorHandler = async(err, req, res, next) => {

    //rollback file upload
    if (req.file) {
        console.log("File");
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
    }

    //handle jwt expired
    if (err.message == "jwt expired" || err.message == "Unauthorized, token expired") {
        
        const {refreshtoken} = req.headers;
        
        if (!refreshtoken) {
            return res.status(401).json({
                message: "Unauthorized, token expired",
                success: false,
            });          
        }
        
        try{
            const {payload} = verifyToken(refreshtoken);
            const refreshTokenExists = await tokenModel.findOneAndDelete({
                token: refreshtoken, 
                userId: payload._id, 
                type: "refresh"
            });
            
            if (!refreshTokenExists) {
                return res.status(401).json({
                    message: "Unauthorized, token expired",
                    success: false,
                });          
            }
            
            const accessToken = generateToken(payload);
            const refreshToken = generateToken(payload, "7d");
            //save refresh token to db
            await tokenModel.create({
                userId: payload._id,
                token: refreshToken,
                type: "refresh"
            });
            //send response
            return res.status(200).json({ 
                message: "refresh token" ,
                data:{
                    accessToken,
                    refreshToken,
                },
                success: true
            });

        }catch(refreshError){
            return res.status(401).json({
                message: "Unauthorized, token expired",
                success: false,
            });
        }
    }

    console.error(err.stack);

    res.status(err.cause || 500).json({
        message: err.message,
        success: false,
    });

}; 
