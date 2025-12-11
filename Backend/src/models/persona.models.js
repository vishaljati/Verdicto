import mongoose from "mongoose";

const personaSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    name:{

        type:String,
        required:true,
        trim:true
    },
    description:{

        type:String,
        required:true,
        
    },
    
    model:{

        type:String,
        required:true,
        
    },
    rounds:{

        type:Number,
        required:true,
        default:1
        
    }



},{
    timestamps:true
})

export const Persona=mongoose.model("Persona",personaSchema)