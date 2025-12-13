import { Otp } from "../models/otp.models.js";
import bcrypt from "bcrypt";
import { sendOtpEmail } from "./SendMail.js";

const sendOtp = async (email, fullName) => {
  await Otp.deleteOne({ email });

  const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(generatedOTP, 12);
  const expireIn = Date.now() + 5 * 60 * 1000; // 5 min

  await Otp.create({
    otp: hashedOtp,
    expireIn,
    email,
  });
  await sendOtpEmail({ to: email, name: fullName, otp: generatedOTP });
};
const verifyOtp = async (email, userEnteredOTP) => {
  const otpModel = await Otp.findOne({ email });

  if (Date.now() > otpModel.expireIn) {
    console.log("OTP Expired !!");
    await Otp.findByIdAndDelete(otpModel._id);
    return false;
  } else {
    const userOtp = userEnteredOTP.toString();
    const isOtpValid = otpModel.isOtpCorrect(userOtp);
    if (isOtpValid) {
      console.log("OTP Verified");
      await Otp.findByIdAndDelete(otpModel._id);
      return true;
    } else {
      console.log("OTP Does not matched");
      return false;
    }
  }
};

export { sendOtp, verifyOtp };
