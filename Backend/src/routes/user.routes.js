import { Router } from "express";
import {
  getUserById,
  getUserProfile,
  updateProfile,
  deleteAccount,
  updatePassword,
} from "../controllers/user.controllers.js";

import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/id/:userId").get(verifyJWT, getUserById);
router.route("/me").get(verifyJWT, getUserProfile);
router
  .route("/update-profile")
  .patch(verifyJWT, upload.single("avatar"), updateProfile);

router.route("/delete-account").delete(verifyJWT, deleteAccount);
router.route("/update-password").post(verifyJWT, updatePassword);

export default router;
