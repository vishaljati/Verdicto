import { Router } from "express";
import {
  listPersonas,
  getPersona,
  createPersona,
  updatePersona,
  deletePersona,
} from "../controllers/persona.controllers";

import { verifyJWT } from "../middlewares/auth.middlewares";

const router = Router();
router.use(verifyJWT);

router.route("/").get(listPersonas).post(createPersona);

router
  .route("/:personaId")
  .get(getPersona)
  .patch(updatePersona)
  .delete(deletePersona);

export default router;
