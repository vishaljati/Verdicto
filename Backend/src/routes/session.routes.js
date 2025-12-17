import express from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  startSession,
  getSession,
  listSessionsForDecision,
  abortSession,
} from "../controllers/debateSession.controllers.js";
import { creditLimit } from "../middlewares/ratelimit.middlewares.js"

const router = express.Router();

router.use(verifyJWT);

router
  .route("/decision/:problemId")
  .post(creditLimit,startSession)
  .get(listSessionsForDecision);

router.route("/:sessionId").get(getSession).patch(abortSession);

export default router;
