import JoiPoy from "joi";

export const sendMessageSchema = JoiPoy.object({
    content: JoiPoy.string().required(),
});

