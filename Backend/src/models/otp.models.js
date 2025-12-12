import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema({
  otp: {
    type: String,
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

otpSchema.methods.isOtpCorrect = async function (userOtp) {
  return await bcrypt.compare(userOtp, this.otp);
};

export const Otp = mongoose.model("Otp", otpSchema);
