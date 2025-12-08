import fs from "fs";
import { fileTypeFromBuffer } from "file-type";

export const fileValidation = (allowedTypes=["image/jpeg", "image/png"]) => {
    return async (req, res, next) => {
      // get the file path
      if (!req.file) {
        return next(new Error("No file uploaded", { cause: 400 }));
      }
      const filePath = req.file.path;
      // read the file and return buffer
      const buffer = fs.readFileSync(filePath);
      // get the file type
      const type = await fileTypeFromBuffer(buffer);
      // validate
      if (!type || !allowedTypes.includes(type.mime))
        return next(new Error("Invalid file type", { cause: 406 }));
  
      return next();
    };
};