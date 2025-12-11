import mongoose from "mongoose";

const debateMessageSchema=new mongoose.Schema({},{})

export const DebateMessage=mongoose.model("DebateMessage",debateMessageSchema)