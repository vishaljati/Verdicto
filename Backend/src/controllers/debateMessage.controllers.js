import { DebateSession } from "../models/debateSession.models.js";
import { ApiError, AsyncHandler, ApiResponse } from "../utils/index.js";
import { DebateMessage } from "../models/debateMessage.models.js";

//List debate messages for a session (paginated)
const listMessages = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Ensure session belongs to user
    const session = await DebateSession.findOne({
      _id: sessionId,
      user: userId,
    });

    if (!session) {
      throw new ApiError(404, "Session Not found");
    }

    const [messages, total] = await Promise.all([
      DebateMessage.find({ debateSession: sessionId })
        .sort({ roundNumber: 1, createdAt: 1 })
        .skip(skip)
        .limit(limit),
      DebateMessage.countDocuments({ debateSession: sessionId }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          success: true,
          page,
          limit,
          total,
          messages,
          sessionStatus: session.status,
        },
        "Messages listed Successfully"
      )
    );
  } catch (error) {
    console.error("List messages error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
});

//Fetch only messages created after a timestamp (polling optimization)
const getLatestMessages = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;
    const since = req.query.since; // ISO timestamp

    if (!since) {
      return res.status(400).json({
        success: false,
        message: "Missing 'since' query param",
      });
    }

    const session = await DebateSession.findOne({
      _id: sessionId,
      user: userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const messages = await DebateMessage.find({
      debateSession: sessionId,
      createdAt: { $gt: new Date(since) },
    }).sort({ createdAt: 1 });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          messages,
          sessionStatus: session.status,
          serverTime: new Date().toISOString(),
        },
        "Message fetched successfully"
      )
    );
  } catch (error) {
    console.error("Get latest messages error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch latest messages",
    });
  }
});

//Fetch a single debate message (rare use, mostly debugging)
const getMessageById = AsyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId, messageId } = req.params;

    const session = await DebateSession.findOne({
      _id: sessionId,
      user: userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    const message = await DebateMessage.findOne({
      _id: messageId,
      debateSession: sessionId,
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { message }, "Message fetched successfully"));
  } catch (error) {
    console.error("Get message error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch message",
    });
  }
});

export { listMessages, getMessageById, getLatestMessages };
