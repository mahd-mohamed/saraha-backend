
export const generateOtp = () => {
    //6 digits otp
    return Math.floor(100000 + Math.random() * 900000);
}