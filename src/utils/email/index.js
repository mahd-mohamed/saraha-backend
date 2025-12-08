import {OTPTemplate} from "./email.page.js";
import nodemailer from "nodemailer";
import config from "../../../config/dev.config.js";

const sendEmail = async ({to, subject, html}) => {
    const transporter = nodemailer.createTransport({
        host: config.EMAIL_HOST,
        port: config.EMAIL_PORT,
        auth: {
            user: config.EMAIL_USER,
            pass: config.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: "sara7a <ziadnassar565@gmail.com>",
        to,
        subject,
        html,
    };

    await transporter.sendMail(mailOptions);
};


export const sendOtpMail = async (email, otp) => {
    await sendEmail({
        to: email,
        subject: "Otp Verification",
        html: OTPTemplate(otp),
    });
};
