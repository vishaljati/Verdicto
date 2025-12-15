import express from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  listMessages,
  getLatestMessages,
  getMessageById,
} from "../controllers/debateMessage.controllers.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/:sessionId").get(listMessages);
router.route("/:sessionId/latest").get(getLatestMessages);
router.route("/:sessionId/:messageId").get(getMessageById);

export default router;
