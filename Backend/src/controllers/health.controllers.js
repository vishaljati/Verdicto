import mongoose from "mongoose";

export const healthCheck = (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

export const readinessCheck = async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    // 1 = connected
    if (dbState !== 1) {
      return res.status(503).json({
        ready: false,
        reason: "Database not connected",
      });
    }

    res.status(200).json({
      ready: true,
      services: {
        database: "connected",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      reason: "Readiness check failed",
    });
  }
};

