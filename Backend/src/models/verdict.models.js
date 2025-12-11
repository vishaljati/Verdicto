import mongoose from "mongoose";

const verdictSchema=new mongoose.Schema({},{})

export const Verdict=mongoose.model("Verdict",verdictSchema)