import { Router } from "express";
import {
  createProblem,
  listProblems,
  getProblem,
  updateProblem,
  deleteDecision,
} from "../controllers/problem.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { creditLimit } from "../middlewares/ratelimit.middlewares.js"

const router = Router();

router.use(verifyJWT);

router.route("/").post(creditLimit,createProblem).get(listProblems);
router
  .route("/:problemId")
  .get(getProblem)
  .patch(updateProblem)
  .delete(deleteDecision);

export default router;
