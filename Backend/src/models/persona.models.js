import mongoose from "mongoose";

const personaSchema=new mongoose.Schema({},{})

export const Persona=mongoose.model("Persona",personaSchema)