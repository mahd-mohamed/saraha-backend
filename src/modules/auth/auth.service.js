import { userModel, tokenModel } from "../../DB/index.js";
import { hashPassword, generateOtp, generateToken, comparePassword, sendOtpMail, encrypt } from "../../utils/index.js";
import { OAuth2Client } from "google-auth-library";

export const register = async (req, res) => {
    //get data from req.body
    const { email, name, phone, password } = req.body;


    //check if user exists
    const userExists = await userModel.findOne({ email });

    if (userExists) {
        throw new Error("User already exists", { cause: 409 });
    }

    //hash password & encrypt phone
    const hashedPassword = await hashPassword(password);
    const encryptedPhone = encrypt(phone);

    //create user
    const newUser = await userModel.create({
        email,
        name,
        password: hashedPassword,
        phone: encryptedPhone,
    });

    //send response
    res.status(201).json({
        message: "User registered successfully",
        data: {
            id: newUser._id,
            email, name, phone,
        },
        success: true
    });
};

export const login = async (req, res) => {
    //get data from req
    const { email, password } = req.body;

    //check if user exists
    const userExists = await userModel.findOne({ email });

    if (!userExists) {
        throw new Error("User not found", { cause: 404 });
    }

    if (!userExists.isVerified) {
        throw new Error("User not verified", { cause: 401 });
    }
    //check if password is correct
    const passwordMatch = await comparePassword(password, userExists.password);
    if (!passwordMatch) {
        throw new Error("Invalid password", { cause: 401 });
    }
    //generate token
    const accessToken = generateToken(userExists);
    const refreshToken = generateToken(userExists, "7d");
    //save refresh token to db
    await tokenModel.create({
        userId: userExists._id,
        token: refreshToken,
        type: "refresh"
    });
    //send response
    res.status(200).json({
        message: "User logged in successfully",
        data: {
            accessToken,
            refreshToken,
        },
        success: true
    });
};

export const verifyAccount = async (req, res) => {
    //get data from req
    const { email, otp } = req.body;

    //check if user exists
    const userExists = await userModel.findOne({ email });

    if (!userExists) {
        throw new Error("Invalid otp", { cause: 401 });
    }

    if (userExists.otp !== otp) {
        throw new Error("Invalid otp", { cause: 401 });
    }

    if (userExists.otpExpiry < Date.now()) {
        throw new Error("Otp expired", { cause: 401 });
    }
    //update user
    userExists.isVerified = true;
    userExists.otp = undefined;
    userExists.otpExpiry = undefined;

    await userExists.updateOne({
        isVerified: true,
        $unset: {
            otp: "",
            otpExpiry: "",
        },
    });

    //send response
    res.status(201).json({
        message: "User verified successfully",
        success: true
    });
};

export const resendOtp = async (req, res) => {
    //get data from req
    const { email } = req.body;

    //check if user exists
    const userExists = await userModel.findOne({ email });

    if (!userExists) {
        throw new Error("User not found", { cause: 404 });
    }

    //generate otp
    const otp = generateOtp();
    //send email verification (sendOtp)
    await sendOtpMail(email, otp);

    //update user
    userExists.otp = otp;
    userExists.otpExpiry = Date.now() + 10 * 60 * 1000;//10 minutes

    await userExists.save();

    //send response
    res.status(200).json({
        message: "Otp sent successfully",
        success: true
    });
};

export const googleLogin = async (req, res) => {
    try {
        //get idToken from req
        const { idToken } = req.body;
        
        console.log("Google login request received");
        console.log("Request body keys:", Object.keys(req.body || {}));
        console.log("idToken present:", !!idToken);
        console.log("idToken length:", idToken ? idToken.length : 0);
        
        if (!idToken) {
            throw new Error("ID token is required", { cause: 400 });
        }
        
        if (typeof idToken !== 'string' || idToken.trim().length === 0) {
            throw new Error("Invalid ID token format", { cause: 400 });
        }

        //create client
        const client = new OAuth2Client("283113959654-2e506m15udir05v41vbb7evp97cv4b3c.apps.googleusercontent.com");
        
        let ticket;
        let payload;
        
        try {
            //verify idToken
            ticket = await client.verifyIdToken({
                idToken,
                audience: "283113959654-2e506m15udir05v41vbb7evp97cv4b3c.apps.googleusercontent.com",
            });
            
            payload = ticket.getPayload();
        } catch (verifyError) {
            console.error("Google token verification error:", verifyError);
            console.error("Error details:", {
                message: verifyError.message,
                code: verifyError.code,
                stack: verifyError.stack
            });
            
            // Handle specific Google OAuth errors
            const errorMessage = verifyError.message || verifyError.toString() || '';
            
            if (errorMessage.includes('Token used too early') || 
                errorMessage.includes('Token used too late') ||
                errorMessage.includes('Invalid token') ||
                errorMessage.includes('Wrong number of segments') ||
                errorMessage.includes('Invalid signature') ||
                errorMessage.includes('Token expired') ||
                errorMessage.includes('Invalid audience')) {
                throw new Error("Invalid or expired Google token", { cause: 401 });
            }
            
            // Generic error for any other Google OAuth verification failure
            throw new Error("Failed to verify Google token. Please try again.", { cause: 401 });
        }
        
        if (!payload || !payload.email) {
            throw new Error("Invalid Google token payload - email not found", { cause: 401 });
        }

        // Extract name from Google payload
        // Google can return either 'name' (full name) or 'given_name' + 'family_name'
        let fullName = payload.name;
        if (!fullName && (payload.given_name || payload.family_name)) {
            fullName = [payload.given_name, payload.family_name].filter(Boolean).join(' ').trim();
        }
        // Fallback to email if no name is available
        if (!fullName) {
            fullName = payload.email.split('@')[0];
        }

        //check if user exists
        let userExists = await userModel.findOne({ email: payload.email });
        
        if (!userExists) {
            // Create new user for Google registration
            // Set credentialsUpdatedAt to a time slightly before now to avoid token expiration issues
            const now = new Date();
            const credentialsTime = new Date(now.getTime() - 1000); // 1 second before now
            
            userExists = await userModel.create({
                email: payload.email,
                name: fullName,
                // phone is optional and Google OAuth doesn't provide it
                isVerified: true,
                userAgent: "google",
                credentialsUpdatedAt: credentialsTime
            });
        } else {
            // User exists - if logging in with Google, always mark as verified
            // Update name if it's different
            if (userExists.name !== fullName) {
                userExists.name = fullName;
            }
            // Google login always means verified email
            userExists.isVerified = true;
            // Update userAgent to google if not already set
            if (userExists.userAgent !== "google") {
                userExists.userAgent = "google";
            }
            await userExists.save();
        }

        //generate token
        console.log("Generating token for user:", {
            _id: userExists._id,
            email: userExists.email,
            name: userExists.name,
            isVerified: userExists.isVerified,
            userAgent: userExists.userAgent
        });
        
        const accessToken = generateToken(userExists);
        const refreshToken = generateToken(userExists, "7d");
        
        console.log("Tokens generated:", {
            accessTokenLength: accessToken.length,
            refreshTokenLength: refreshToken.length
        });
        
        //save refresh token to db
        await tokenModel.create({
            userId: userExists._id,
            token: refreshToken,
            type: "refresh"
        });

        //send response
        res.status(200).json({
            message: "User logged in successfully",
            data: {
                accessToken,
                refreshToken,
                id: userExists._id,
                name: userExists.name,
                email: userExists.email,
            },
            success: true
        });
    } catch (error) {
        // Log the error for debugging
        console.error("Google login error:", error);
        
        // If error already has a cause (status code), re-throw it
        if (error.cause) {
            throw error;
        }
        
        // Handle other errors - default to 401 for authentication issues
        throw new Error(error.message || "Google authentication failed", { cause: 401 });
    }
};

export const resetPassword = async (req, res) => {
    //get data from req
    const { email, password, otp } = req.body;

    //check if user exists
    const userExists = await userModel.findOne({ email });

    if (!userExists) {
        throw new Error("User not found", { cause: 404 });
    }
    //check if otp is valid
    if (userExists.otp !== otp) {
        throw new Error("Invalid otp", { cause: 401 });
    }
    //check if otp is expired
    if (userExists.otpExpiry < Date.now()) {
        throw new Error("Otp expired", { cause: 401 });
    }

    //hash password
    const hashedPassword = await hashPassword(password);

    //update user
    userExists.password = hashedPassword;
    userExists.credentialsUpdatedAt = Date.now();

    await userExists.updateOne({
        password: hashedPassword,
        credentialsUpdatedAt: Date.now(),
        $unset: {
            otp: "",
            otpExpiry: "",
        },
    });

    //delete old refresh token
    await tokenModel.deleteMany({ userId: userExists._id, type: "refresh" });

    //send response
    res.status(200).json({
        message: "Password reset successfully",
        success: true
    });
};


