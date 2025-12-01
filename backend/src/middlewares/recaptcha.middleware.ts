import { Request, Response, NextFunction } from "express";
import { verifyRecaptchaV2 } from "../services/recaptcha.service";
import { envConfig } from "../config/env.config";

export const validateRecaptchaV2 = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Bypass in development if no token provided
    if (envConfig.NODE_ENV === "development" && !req.body.recaptchaToken) {
      console.warn("⚠️  reCAPTCHA bypassed in development mode");
      return next();
    }

    const recaptchaToken =
      req.body.recaptchaToken || req.headers["x-recaptcha-token"];

    if (!recaptchaToken) {
      return res.status(400).json({
        message: "Please complete the reCAPTCHA verification",
      });
    }

    const result = await verifyRecaptchaV2(recaptchaToken);

    if (!result.success) {
      return res.status(400).json({
        message:
          result.message || "reCAPTCHA verification failed. Please try again.",
      });
    }

    next();
  } catch (error) {
    console.error("reCAPTCHA middleware error:", error);
    return res.status(500).json({
      message: "Failed to validate reCAPTCHA. Please try again.",
    });
  }
};
