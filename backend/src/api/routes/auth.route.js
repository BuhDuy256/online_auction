import * as authController from "../controllers/auth.controller.js";
import { signupSchema } from "../schemas/auth.schema.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { Router } from "express";

const router = Router();

router.post("/signup", validate(signupSchema), authController.signup);

export default router;
