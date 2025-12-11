import mongoose from "mongoose";

const debateSessionSchema=new mongoose.Schema({},{})

export const DebateSession=mongoose.model("DebateSession",debateSessionSchema)