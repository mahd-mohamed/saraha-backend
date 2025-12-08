import mongoose from "mongoose";

const connectDB = async (DB_URI) => {
    await mongoose.connect(DB_URI).then(() => {
        console.log("MongoDB connected successfully ");
    }).catch((err) => {
        console.log("MongoDB connection error ", err);
    });
};

export default connectDB;
