import bcrypt from "bcrypt";

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

// Compare user-supplied password to stored hash; fail closed if hash is missing
export const comparePassword = async (password, hashedPassword) => {
    if (!hashedPassword) return false;
    return bcrypt.compare(password, hashedPassword);
};