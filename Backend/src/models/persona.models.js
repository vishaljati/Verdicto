import mongoose from "mongoose";

const personaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    systemPromt: {
      type: String,
      required: true
    },
    isDefault: {
      type: Boolean,
      required: true
    },

  },
  {
    timestamps: true,
  }
);

export const Persona = mongoose.model("Persona", personaSchema);
