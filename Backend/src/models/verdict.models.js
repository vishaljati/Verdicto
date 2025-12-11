import mongoose from "mongoose";

const verdictSchema=new mongoose.Schema({
     debateSession:{
        unique:true,
        type:mongoose.Schema.Types.ObjectId,
        ref:DebateSession
     },
     finalVerdict:{
        type:String,
        required:true
     },
     confidenceScore:{
        type:Number,
         required:true
     },
     pros:[{
        type:String
     }],
     cons:[{
        type:String
     }],
     risks:[{
        type:String
     }],
     nextActions:[{
        type:String
     }],
},{
    timestamps:true
})

export const Verdict=mongoose.model("Verdict",verdictSchema)