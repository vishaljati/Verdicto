import mongoose from "mongoose";

const debateSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    status: {
      enum: ["running", "completed", "failed"],
      default: "running",
    },
    model: {
      type: String,
      required: true,
    },
    rounds: {
      type: Number,
    },
    verdict: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Verdict",
    },
    setting: {
      type: Object,
    },
  },
  { timestamps: true }
);

export const DebateSession = mongoose.model(
  "DebateSession",
  debateSessionSchema
);
