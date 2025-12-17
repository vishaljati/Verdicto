import mongoose from "mongoose";
import { AsyncHandler } from "../utils/AsyncHandler.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js";


const creditLimit = AsyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const user = User.findById(userId)
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    let credits = user.credits;

    if (credits === 0) {
        throw new ApiError(401, "Credit is zero , Please upgrade your plan");
    } else {
        credits--;
        User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    credits: credits
                }
            }
        )
    }
    next();
})

export { creditLimit }