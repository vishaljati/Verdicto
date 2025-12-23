import {Router} from "express";
import { healthCheck , readinessCheck } from "../controllers/health.controllers.js"


const router = Router();

router.route("/healthcheck").get( healthCheck ) 
router.route("/ready").get( readinessCheck )

export default router;
