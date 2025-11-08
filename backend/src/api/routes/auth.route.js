import * as authController from "../controllers/auth.controller.js";
import { signupSchema, loginSchema } from "../schemas/auth.schema.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth.middleware.js";

const router = Router();

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", requireAuth, authController.logout);

export default router;
