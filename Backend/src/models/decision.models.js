import mongoose from "mongoose";

const decisionSchema=new mongoose.Schema({},{})

export const Decision=mongoose.model("Decision",decisionSchema)