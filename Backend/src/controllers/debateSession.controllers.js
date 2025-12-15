import { DebateSession } from "../models/debateSession.models.js";
import mongoose from "mongoose";
import { ApiError, AsyncHandler, ApiResponse } from "../utils/index.js";
import { Problem } from "../models/problem.models.js";
import { DebateMessage } from "../models/debateMessage.models.js";
import { Verdict } from "../models/verdict.models.js";
import { Persona } from "../models/persona.models.js";
import { runDebateRounds, generateVerdict } from "../services/aiService.js";

//user ,problem ,status ,model , rounds,verdict, setting (op)
const runSessionAsync = async ({ sessionId, problem, userId }) => {
  try {
    const session = await DebateSession.findById(sessionId);
    if (!session) return;

    // 1. Load personas (global + user custom)
    const personas = await Persona.find({
      $or: [{ user: null }, { user: userId }],
    });

    if (!personas.length) {
      throw new Error("No personas available");
    }

    // 2. Run debate rounds (AI service)
    const debateResult = await runDebateRounds({
      problem,
      personas,
      session,
    });

    // 3. Persist messages
    for (const msg of debateResult.messages) {
      await DebateMessage.create({
        debateSession: session._id,
        personaName: msg.personaName,
        roundNumber: msg.roundNumber,
        role: "assistant",
        content: msg.content,
      });
    }

    // 4. Generate verdict
    const verdictData = await generateVerdict({
      problem,
      messages: debateResult.messages,
    });

    const verdict = await Verdict.create({
      user: userId,
      debateSession: session._id,
      summary: verdictData.summary,
      recommendation: verdictData.recommendation,
      confidenceScore: verdictData.confidenceScore,
      pros: verdictData.pros,
      cons: verdictData.cons,
      risks: verdictData.risks,
      nextActions: verdictData.nextActions,
    });
    if (!verdict) {
      throw new ApiError(500, "Verdict generation failed!");
    }

    // 5. Mark session completed
    session.status = "completed";
    session.rounds = debateResult.rounds;
    session.verdict = verdict._id;
    await session.save();
  } catch (error) {
    console.error("Async session execution failed:", error);

    await DebateSession.findByIdAndUpdate(sessionId, {
      status: "failed",
    });
  }
};

//TODO: Subscription logic
const startSession = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { problemId } = req.params;
    const { settings, rounds } = req.body;

    // 1. Validate decision ownership
    const problem = await Problem.findOne({
      _id: problemId,
      user: userId,
    });

    if (!problem) {
      throw new ApiError(404, "Problem not found");
    }

    /**
     * 🔒 SUBSCRIPTION LIMIT CHECK (IMPORTANT)
     * Count sessions this billing period
     * Block if over plan limit
     */

    // 2. Create session
    const session = await DebateSession.create({
      user: userId,
      problem: problemId,
      model: "gemini-2.5-flash-lite",
      settings: settings || { maxRounds: 3 },
      rounds: settings || 1,
      status: "running",
    });
    if (!session) {
      throw new ApiError(500, "Session creation failed");
    }

    // 3. Respond immediately (do NOT block request)
    res.status(201).json(
      new ApiResponse(
        201,
        {
          sessionId: session._id,
          status: session.status,
        },
        "Session created successfully"
      )
    );

    // 4. Run debate async (critical)
    runSessionAsync({
      sessionId: session._id,
      problem,
      userId,
    });
  } catch (error) {
    console.error("Start session error:", error);
    return null;
  }
});

//Get session metadata
const getSession = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;

    const session = await DebateSession.findOne({
      _id: sessionId,
      user: userId,
    });

    if (!session) {
      throw new ApiError(403, "Session not exist");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { session }, "Session fetched successfully"));
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
});

//List all sessions for a decision
const listSessionsForDecision = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { problemId } = req.params;

    const problem = await Problem.findOne({
      _id: problemId,
      user: userId,
    });

    if (!problem) {
      throw new ApiError(404, "Problem not found");
    }

    const sessions = await DebateSession.find({
      decision: problemId,
      user: userId,
    }).sort({ createdAt: -1 });

    return res
      .status(200)
      .json(
        new ApiResponse(200, { sessions }, "Sessions fetched successfully")
      );
  } catch (error) {
    console.error("List sessions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sessions",
    });
  }
});

// Abort a running session
//Todo: check abort func in all controller
const abortSession = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;

    const session = await DebateSession.findOne({
      _id: sessionId,
      user: userId,
      status: "running",
    });

    if (!session) {
      throw new ApiError(404, "Session not found");
    }

    session.status = "failed";
    await session.save({ validateBeforeSave: false });
    return res.status(200).json(new ApiResponse(200, {}, "Session stopped"));
  } catch (error) {
    console.error("Abort session error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to abort session",
    });
  }
});

export { startSession, getSession, listSessionsForDecision, abortSession };
