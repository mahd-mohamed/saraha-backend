import CryptoJS from "crypto-js";
import config from "../../../config/dev.config.js";

export const encrypt = (data) => {
    return CryptoJS.AES.encrypt(data, config.CRYPTO_SECRET).toString();
};

export const decrypt = (data) => {
    return CryptoJS.AES.decrypt(data, config.CRYPTO_SECRET).toString(CryptoJS.enc.Utf8);
};