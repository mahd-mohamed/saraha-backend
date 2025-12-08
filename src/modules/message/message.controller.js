import {Router} from "express";
import * as messageService from "./message.service.js";
import {asyncHandler, fileCloudUpload} from "../../utils/index.js";
import {isAuthenticated, isValid} from "../../middleware/index.js";
import {sendMessageSchema} from "./message.validation.js";

const router = Router();

//Send anonymous Message
router.post(
    "/:receiverId",
    isValid(sendMessageSchema),
    fileCloudUpload().array("attachments", 10),
    asyncHandler(messageService.sendMessage)
);

//Send Message
router.post(
    "/:receiverId/sender", 
    isValid(sendMessageSchema),
    asyncHandler(isAuthenticated), 
    fileCloudUpload().array("attachments", 10),
    asyncHandler(messageService.sendMessage)
);

//Get Messages
router.get(
    "/", 
    asyncHandler(isAuthenticated), 
    asyncHandler(messageService.getMessages)
);



export default router;