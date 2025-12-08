import { isValid} from "../../middleware/index.js";
import {asyncHandler} from "../../utils/index.js";
import * as authService from "./auth.service.js";
import {Router} from "express";
import * as authValidation from "./auth.validation.js";
import { rateLimit } from "express-rate-limit";

const router = Router();

// limit login attempts & register
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per 15 minutes
    message: "Too many login attempts, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // limit password reset
const resetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 requests per hour
    message: "Too many password reset requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
});


  //verify otp & resend otp
const otpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per hour
    message: "Too many requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
});
  

router.post(
    "/register", 
    loginLimiter,
    asyncHandler(isValid(authValidation.registerSchema)), 
    asyncHandler(authService.register));
router.post(
    "/login", 
    loginLimiter,
    asyncHandler(isValid(authValidation.loginSchema)), 
    asyncHandler(authService.login));
router.post(
    "/verify",
    otpLimiter,
    asyncHandler(isValid(authValidation.verifySchema)), 
    asyncHandler(authService.verifyAccount));
router.post(
    "/resend-otp",
    otpLimiter,
    asyncHandler(isValid(authValidation.resendSchema)), 
    asyncHandler(authService.resendOtp));
router.post(
    "/google-login", 
    asyncHandler(isValid(authValidation.googleLoginSchema)), 
    asyncHandler(authService.googleLogin));
router.post(
    "/reset-password", 
    resetLimiter,
    asyncHandler(isValid(authValidation.resetPasswordSchema)), 
    asyncHandler(authService.resetPassword));

export default router;
