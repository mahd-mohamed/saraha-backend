import multer, { diskStorage } from "multer";
import { nanoid } from "nanoid";
import fs from "fs";

export const fileUpload = ({folder, allowedTypes=["image/jpeg", "image/png", "image/jpg"]}) => {

    const storage = diskStorage({
        destination: (req, file, cb) => {
            let destination = `uploads/${req.user.id}/${folder}`;
            if (!fs.existsSync(destination)) {
                fs.mkdirSync(destination, { recursive: true });
            }
            cb(null, destination);
        },
        filename: (req, file, cb) => {
            cb(null, nanoid(10) + "_" + file.originalname);
        },
    });

    const fileFilter = (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type", { cause: 406 }), false);
        }
    };

    return multer({ storage, fileFilter });
};
