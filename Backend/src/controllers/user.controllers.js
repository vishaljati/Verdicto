import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { uploadCloudinary, deleteCloudinary } from "../utils/Cloudinary.js";
import { sendOtp, verifyOtp } from "../utils/OtpUtils.js";

//Purpose: User profile, settings, basic account operations

const getUserById = AsyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "UserId is invalid");
  }

  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

const getUserProfile = AsyncHandler(async (req, res) => {
  const user = req.user;
  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "User Account fetched successfully"));
});

const updateProfile = AsyncHandler(async (req, res) => {
  const { fullName } = req.body;

  const user = req.user;
  const avatarFilePath = req.file?.path || null;
  let avatar;
  if (avatarFilePath) {
    avatar = await uploadCloudinary(avatarFilePath);
    if (!avatar) {
      throw new ApiError(500, "Avatar upload failed");
    }
    await deleteCloudinary(user.avatarPublicId);
  }

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        avatar: avatar?.url,
        avatarPublicId: avatar?.public_id,
        fullName:fullName || user.fullName,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, { updatedUser }, "User details updated successfully")
    );
});

const deleteAccount = AsyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(401, "Unauthorize request");
  }

  //send otp
  // await sendOtp(user.email, user.fullName);
  // const { userEnteredOTP } = req.body;
  // const isOtpValid = await verifyOtp(user.email, userEnteredOTP);

  // if (!isOtpValid) {
  //   throw new ApiError(401, "OTP does not matched or expired");
  // }

  const deletedUser = await User.findByIdAndDelete(user._id);
  if (!deletedUser) {
    throw new ApiError(500, "Account deletion failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Account deleted successfully"));
});

const updatePassword = AsyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password) {
    throw new ApiError(404, "Password is required");
  }
  const user = req.user;

  const ispasswordSame = await user.isPasswordCorrect(password);
  console.log(ispasswordSame);
  
  if (ispasswordSame) {
    throw new ApiError(401, "Password can not be same");
  }

  //sent otp
  // await sendOtp(user.email, user.fullName);
  // const { userEnteredOTP } = req.body;
  // const isOtpValid = await verifyOtp(user.email, userEnteredOTP);

  // if (!isOtpValid) {
  //   throw new ApiError(401, "OTP does not matched or expired");
  // }

  const update = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        password,
      },
    },
    { new: true }
  );
  if (!update) {
    throw new ApiError(500, "Password update failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Updated Successfully"));
});

//TODO:usage stats (decisions/sessions count)

export {
  getUserById,
  getUserProfile,
  updateProfile,
  deleteAccount,
  updatePassword,
};
