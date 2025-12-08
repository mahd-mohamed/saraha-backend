import bcrypt from "bcrypt";
import config from "../../../config/dev.config.js";

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

export const comparePassword = (password, hashedPassword=config.HASHED_PASSWORD) => {
    return bcrypt.compare(password, hashedPassword);
};
