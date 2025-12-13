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
import personaRouter from "./routes/persona.routes.js";
import problemRouter from "./routes/problem.routes.js";
import sessionRouter from "./routes/session.routes.js"

//implement routes
app.use("/api/v1/auth", authRouter);
//protected routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/personas", personaRouter);
app.use("/api/v1/decisions", problemRouter);
app.use("/api/v1/sessions", sessionRouter);

export default app;
