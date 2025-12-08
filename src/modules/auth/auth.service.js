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
    //get idToken from req
    const { idToken } = req.body;
    //create client
    const client = new OAuth2Client("283113959654-2e506m15udir05v41vbb7evp97cv4b3c.apps.googleusercontent.com");
    //verify idToken
    const ticket = await client.verifyIdToken({
        idToken,
        audience: "283113959654-2e506m15udir05v41vbb7evp97cv4b3c.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    // const userId = payload.sub;
    //check if user exists
    let userExists = await userModel.findOne({ email: payload.email });
    if (!userExists) {
        userExists = await userModel.create({
            email: payload.email,
            name: payload.given_name,
            phone: payload.phone_number,
            isVerified: true,
            userAgent: "google",
        });
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


