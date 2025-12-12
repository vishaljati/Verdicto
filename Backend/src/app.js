import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.REACT_CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

//routes import

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";

//implement routes
app.use("/api/v1/auth",authRouter);
app.use("/api/v1/user",userRouter);

export default app;
