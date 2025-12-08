import {Router} from "express";
import * as userService from "./user.service.js";
import {asyncHandler, fileUpload, fileCloudUpload} from "../../utils/index.js";
import {isAuthenticated, fileValidation} from "../../middleware/index.js";

const router = Router();

router.get("/profile", asyncHandler(isAuthenticated), asyncHandler(userService.profile));

router.delete("/delete-profile", asyncHandler(isAuthenticated), asyncHandler(userService.deleteProfile));

router.post("/upload-profile-picture",
    asyncHandler(isAuthenticated),
    fileUpload({folder: "profile"}).single("profilePicture"),
    asyncHandler(fileValidation(["image/jpeg", "image/png", "image/jpg"])),
    asyncHandler(userService.uploadProfileImage));

router.post("/upload-profile-cloud",
    asyncHandler(isAuthenticated),
    fileCloudUpload().single("profilePicture"),
    asyncHandler(fileValidation(["image/jpeg", "image/png", "image/jpg"])),
    asyncHandler(userService.uploadProfileCloudImage));

router.post("/logout", asyncHandler(isAuthenticated), asyncHandler(userService.logout));

export default router;