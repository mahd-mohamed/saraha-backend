import JoiPoy from "joi";
export const isValid = (schema) => {
    return async (req, res, next) => {
        let { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            error = error.details.map((detail) => detail.message).join("\n");
            throw new Error(error, { cause: 406 });
        }

        next();
    };
};


export const generateFields = {
    name: JoiPoy.string(),
    email: JoiPoy.string().email(),
    phone: JoiPoy.string().min(9).max(15),
    password: JoiPoy.string().min(6),
    otp: JoiPoy.string().length(6),
};