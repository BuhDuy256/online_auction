import express from "express";
import * as authController from "../controllers/auth.controller";
import * as otpController from "../controllers/otp.controller";
import { validate } from "../../middlewares/validate.middleware";
import { signupSchema, loginSchema } from "../schemas/auth.schema";
import { verifyOTPSchema, resendOTPSchema } from "../schemas/otp.schema";

const router = express.Router();

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.post("/verify-otp", validate(verifyOTPSchema), otpController.verifyOTP);
router.post("/resend-otp", validate(resendOTPSchema), otpController.resendOTP);

export default router;
