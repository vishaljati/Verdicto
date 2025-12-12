import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema({
  otp: {
    type: Number,
    required: true,
  },
  expireIn: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

export const Otp = mongoose.model("Otp", otpSchema);
