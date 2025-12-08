import multer, { diskStorage } from "multer";

export const fileCloudUpload = (allowedTypes=["image/jpeg", "image/png", "image/jpg"]) => {

    const storage = diskStorage({});//stor in temp folder

    const fileFilter = (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type", { cause: 406 }), false);
        }
    };

    return multer({ storage, fileFilter });
};
