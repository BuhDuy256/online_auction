import express from "express";
import * as authController from "../controllers/auth.controller";
import * as otpController from "../controllers/otp.controller";
import { validate } from "../../middlewares/validate.middleware";
import { validateRecaptchaV2 } from "../../middlewares/recaptcha.middleware";
import { signupSchema, loginSchema } from "../schemas/auth.schema";
import { verifyOTPSchema, resendOTPSchema } from "../schemas/otp.schema";
import { requireAuth } from "../../middlewares/requireAuth.middleware";

const router = express.Router();

// Public routes with reCAPTCHA v2
router.post(
  "/signup",
  validate(signupSchema),
  validateRecaptchaV2,
  authController.signup
);

router.post(
  "/login",
  validate(loginSchema),
  validateRecaptchaV2,
  authController.login
);

router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);

// OTP routes
router.post("/verify-otp", validate(verifyOTPSchema), otpController.verifyOTP);
router.post("/resend-otp", validate(resendOTPSchema), otpController.resendOTP);

// Protected routes
router.post("/logout-all", requireAuth, authController.logoutAll);

export default router;
