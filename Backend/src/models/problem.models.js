import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        enum: ["open", "resolved", "failed"],
        default: "open"
    },
}, { timestamps: true })

export const Problem = mongoose.model("Problem", problemSchema)