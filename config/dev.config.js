import { config } from "dotenv"
config();

export default {
    PORT : process.env.PORT,

    DB_URI : process.env.DB_URI,

    CLOUDINARY_CLOUD_NAME : process.env.CLOUDINARY_CLOUD_NAME ,
    CLOUDINARY_API_KEY : process.env.CLOUDINARY_API_KEY ,
    CLOUDINARY_API_SECRET : process.env.CLOUDINARY_API_SECRET ,

    TOKEN_SECRET : process.env.TOKEN_SECRET ,

    CRYPTO_SECRET : process.env.CRYPTO_SECRET ,

    HASHED_PASSWORD : process.env.HASHED_PASSWORD ,

    EMAIL_USER : process.env.EMAIL_USER ,
    EMAIL_PASSWORD : process.env.EMAIL_PASSWORD ,
    EMAIL_HOST : process.env.EMAIL_HOST ,
    EMAIL_PORT : process.env.EMAIL_PORT ,

    FRONTEND_URLs : [process.env.FE_URL],
}