import { Router } from "express";
import {
  userSignUp,
  userLogIn,
  userLogout,
  refreshAccessToken,
} from "../controllers/auth.controllers.js";

import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

//routes for authentication

router.route("/signup").post(upload.single("avatar"), userSignUp);
router.route("/login").post(userLogIn);
router.route("/logout").post(verifyJWT, userLogout);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
