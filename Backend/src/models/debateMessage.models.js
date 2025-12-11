import mongoose from "mongoose";

const debateMessageSchema = new mongoose.Schema({
    debateSession: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DebateSession",
        required: true
    },
    personaName: {
        type: String,
        required: true
    },
    roundNo: {
        type: Number,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    role:{
        enum:["assistant","user"]
    }

}, { timestamps: true })

export const DebateMessage = mongoose.model("DebateMessage", debateMessageSchema )