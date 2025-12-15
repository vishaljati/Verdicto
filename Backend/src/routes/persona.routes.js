import { Router } from "express";
import {
  listPersonas,
  getPersona,
  createPersona,
  updatePersona,
  deletePersona,
} from "../controllers/persona.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT);

router.route("/").get(listPersonas).post(createPersona);

router
  .route("/:personaId")
  .get(getPersona)
  .patch(updatePersona)
  .delete(deletePersona);

export default router;
