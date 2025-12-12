import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String, //cloudinary url
      required: true,
    },
    avatarPublicId: {
      type: String, //cloudinary public id
      required: true,
    },
    refreshToken: {
      type: String,
    },
    debateHistory: [
      {
        type: mongoose.Schema.Types.ObjectId, // debateHistory id
        ref: "DebateSession",
      },
    ],
  },
  {
    timestamps: true,
  }
);

//Encrypting the password
userSchema.pre("save", async function () {

  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);

})

//compare password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generating access token

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
