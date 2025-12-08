import JoiPoy from "joi";
import { generateFields } from "../../middleware/index.js";

export const registerSchema = JoiPoy.object({
    name: generateFields.name.required(),
    email: generateFields.email.required(),
    phone: generateFields.phone.optional(),
    password: generateFields.password.required(),
});


export const loginSchema = JoiPoy.object({
    email: generateFields.email.required(),
    password: generateFields.password.required(),
});

export const verifySchema = JoiPoy.object({
    otp: generateFields.otp.required(),
    email: generateFields.email.required(),
});

export const resendSchema = JoiPoy.object({
    email: generateFields.email.required(),
});

export const googleLoginSchema = JoiPoy.object({
    idToken: JoiPoy.string().required(),
});

export const resetPasswordSchema = JoiPoy.object({
    email: generateFields.email.required(),
    password: generateFields.password.required(),
    otp: generateFields.otp.required(),
});
