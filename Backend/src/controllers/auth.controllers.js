import { User } from "../models/user.models.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadCloudinary, deleteCloudinary } from "../utils/Cloudinary.js";
import { sendMail, sendWelcomeEmail, sendOtpEmail } from "../utils/SendMail.js";
import jwt from "jsonwebtoken";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { sendOtp, verifyOtp } from "../utils/OtpUtils.js";

//TODO:Include OTP , OAuth callback

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken ();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };

  } catch (error) {
    console.log("ERROR :", error);
    throw new ApiError(
      500,
      "Something went wrong while generating Access and Refresh Token"
    );
  }
};

const userSignUp = AsyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!(fullName || email || password)) {
    throw new ApiError(401, "Email and Password are required");
  }
  const existedUser = await User.findOne({ email: email });
  if (existedUser) {
    throw new ApiError(409, "User Already existed");
  }

  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(401, "Avatar is required");
  }
  const avatar = await uploadCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(500, "Avatar Upload failed");
  }

  //TODO:OTP
  // await sendOtp(email, fullName);
  // const { userEnteredOTP } = req.body;
  // const isOtpValid = await verifyOtp(email, userEnteredOTP);

  // if (!isOtpValid) {
  //   throw new ApiError(401, "OTP does not matched or expired");
  // }

  await User.create({
    fullName,
    email,
    avatar: avatar.url,
    avatarPublicId: avatar.public_id,
    password,
  });

  const createdUser = await User.findOne({
    email,
  }).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "User sign up failed");
  }
  const welcomeMail = await sendWelcomeEmail({ to: email, name: fullName });
  if (!welcomeMail) {
    throw new ApiError(500, "Welcome mail sending failed");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, { createdUser }, "User signed up successfully"));
});

const userLogIn = AsyncHandler(async (req, res) => {
  if (!req.body) {
    throw new ApiError(400, "Request body is required");
  }
  const { email, password } = req.body;
  if (!(email && password)) {
    throw new ApiError(409, "Email and Password are required");
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { accessToken, refreshToken } =await generateAccessAndRefreshToken(user._id);
  
  
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { user, accessToken, refreshToken },
        "User Logged In Successfully"
      )
    );
});

const userLogout = AsyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  if (!user) {
    throw new ApiError(500, "Logout updatetion failed");
  }
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged out"));
});

const refreshAccessToken = AsyncHandler(async (req, res) => {
  const cookies = req.cookies || {};
  const body = req.body || {};

  const incomingRefreshToken = cookies.refreshToken || body.refreshToken;

  if (
    !incomingRefreshToken ||
    typeof incomingRefreshToken !== "string" ||
    !incomingRefreshToken.trim()
  ) {
    throw new ApiError(
      401,
      "Unauthorized request: Refresh token missing or invalid"
    );
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodedToken) {
      throw new ApiError(401, "Invalid Refresh Token or expired");
    }

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken: accessToken,
            refreshToken: newRefreshToken,
          },
          "Access Token Refreshed Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

export { userSignUp, userLogIn, userLogout, refreshAccessToken };
