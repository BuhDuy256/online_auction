import { NextFunction, Request, Response } from "express";
import * as authService from "../../services/auth.service";
import { formatResponse } from "../../utils/response.util";
import { logger } from "../../utils/logger.util";
import { AUTH_CONSTANTS } from "../../utils/constant.util";
import { envConfig } from "../../config/env.config";

export const verifyOTP = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, otp } = request.body;

    const result = await authService.verifyOTP(userId, otp);

    response.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: envConfig.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_MAX_AGE,
    });

    formatResponse(
      response,
      200,
      {
        accessToken: result.accessToken,
        user: result.user,
      },
      "Email verified successfully"
    );
  } catch (error) {
    logger.error("OTPController", "Failed to verify OTP", error);
    next(error);
  }
};

export const resendOTP = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = request.body;

    const result = await authService.resendOTP(userId);

    formatResponse(response, 200, null, result.message);
  } catch (error) {
    logger.error("OTPController", "Failed to resend OTP", error);
    next(error);
  }
};
