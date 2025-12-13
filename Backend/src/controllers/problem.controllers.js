import mongoose from "mongoose";
import { ApiError, AsyncHandler, ApiResponse } from "../utils/index.js";
import { Problem } from "../models/problem.models.js";

//Create a new decision (enforce plan limits here)
//TODO: Add subs logic
const createProblem = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, description } = req.body;

    if (!(title && description)) {
      throw new ApiError(400, "Title and Description is required");
    }

    /**
     * 🔒 SUBSCRIPTION LIMIT CHECK (IMPORTANT)
     * Example (pseudo):
     * const decisionCount = await Decision.countDocuments({
     *   user: userId,
     *   createdAt: { $gte: billingPeriodStart }
     * });
     * if (decisionCount >= planLimit) throw error
     */

    const problem = await Problem.create({
      user: userId,
      title,
      description,
      status: "open",
    });
    if (!problem) {
      throw new ApiError(500, "Problem creation failed");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, { problem }, "Problem created successfully"));
  } catch (error) {
    console.error("Create Problem error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create decision",
    });
  }
});

// List decisions for logged-in user (paginated)

const listProblems = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      user: userId,
      status: { $ne: "archived" }, // hide archived by default
    };

    const [problems, total] = await Promise.all([
      Problem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Problem.countDocuments(filter),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          page,
          limit,
          total,
          problems,
        },
        "Problems fetched successfully"
      )
    );
  } catch (error) {
    console.error("List decisions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch decisions",
    });
  }
});

//Get single decision (must belong to user)
const getProblem = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { problemId } = req.params;

    if (mongoose.isValidObjectId(problemId) || !problemId) {
      throw new ApiError(404, "Problem not found");
    }

    const problem = await Problem.findOne({
      _id: decisionId,
      user: userId,
    });

    if (!problem) {
      return res.status(404).json(new ApiResponse(404, {}, "No Problem found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { problem }, "Problem fetched successfully"));
  } catch (error) {
    console.error("Get decision error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch decision",
    });
  }
});

// Update decision fields

const updateProblem = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { problemId } = req.params;

    if (mongoose.isValidObjectId(problemId) || !problemId) {
      throw new ApiError(404, "Problem not found");
    }
    const { title, description } = req.body;

    const problem = await Problem.findOne({
      _id: problemId,
      user: userId,
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Decision not found",
      });
    }

    if (title !== undefined) problem.title = title;
    if (description !== undefined) problem.description = description;

    await problem.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json(new ApiResponse(200, { problem }, "Problem updated successfully"));
  } catch (error) {
    console.error("Update decision error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update decision",
    });
  }
});

//Delete
//Todo : soft delete, hard delete
const deleteDecision = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { problemId } = req.params;
    if (mongoose.isValidObjectId(problemId)) {
      throw new ApiError(404, "Problem not found");
    }

    const problem = await Problem.findOne({
      _id: problemId,
      user: userId,
    });

    if (!problem) {
      return res.status(404).json(new ApiResponse(404, {}, "No problem found"));
    }

    await Problem.findByIdAndDelete(problem._id);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Problem deleted successfully"));
  } catch (error) {
    console.error("Delete decision error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete decision",
    });
  }
});

export {
  createProblem,
  listProblems,
  getProblem,
  updateProblem,
  deleteDecision,
};
