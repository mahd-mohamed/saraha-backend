import {Schema , model}from "mongoose";

const messageSchema = new Schema({

    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    content: {
        type: String,
        required: true
    },

    attachments: {
        type: Array,
        required: false
    },

    
},{
    timestamps: true
})

const Message = model("Message", messageSchema);

export default Message;
