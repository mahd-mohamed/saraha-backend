import {Schema, model} from "mongoose";

const tokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    token: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["access", "refresh"],
        default: "access"
    }
},{
    timestamps: true,
});

const Token = model("Token", tokenSchema);

export default Token;
