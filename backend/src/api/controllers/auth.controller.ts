import { Request, Response, NextFunction } from "express";
import * as authService from "../../services/auth.service";
import { logger } from "../../utils/logger.util";
import { AUTH_CONSTANTS } from "../../configs/constants.config";
import {
  SignupSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  GoogleLoginSchema,
  FacebookLoginSchema,
} from "../dtos/requests/auth.schema";
import { envConfig } from "../../configs/env.config";

export const signup = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = request.body as SignupSchema;
    const result = await authService.signupUser(body);

    response
      .status(201)
      .message("User created successfully")
      .json(result);
  } catch (error) {
    logger.error("AuthController", "Failed to signup user", error);
    next(error);
  }
};

export const login = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deviceInfo = request.headers["user-agent"] || "Unknown";
    const ipAddress = request.ip || request.socket.remoteAddress || "Unknown";
    const body = request.body as LoginSchema;

    const result = await authService.loginUser(
      body,
      deviceInfo,
      ipAddress
    );

    if ("requiresVerification" in result) {
      response
        .status(200)
        .message("Please verify your email. A new OTP has been sent.")
        .json({
          requiresVerification: true,
          user: result.user,
        });
      return;
    }

    response.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: envConfig.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_MAX_AGE,
    });

    response
      .status(200)
      .message("Login successful")
      .json({
        accessToken: result.accessToken,
        user: result.user,
      });
  } catch (error) {
    logger.error("AuthController", "Failed to login user", error);
    next(error);
  }
};

export const refreshToken = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken =
      request.cookies.refreshToken || request.body.refreshToken;

    if (!refreshToken) {
      response
        .status(401)
        .message("Refresh token not provided")
        .json(null);
      return;
    }

    const result = await authService.refreshAccessToken(refreshToken);

    response
      .status(200)
      .message("Token refreshed successfully")
      .json(result);
  } catch (error) {
    logger.error("AuthController", "Failed to refresh token", error);
    next(error);
  }
};

export const logout = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken =
      request.cookies.refreshToken || request.body.refreshToken;

    if (refreshToken) {
      await authService.logoutUser(refreshToken);
    }

    response.clearCookie("refreshToken");

    response
      .status(200)
      .message("Logged out successfully")
      .json(null);
  } catch (error) {
    logger.error("AuthController", "Failed to logout user", error);
    next(error);
  }
};

export const logoutAll = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (request as any).user.id;

    await authService.logoutAllDevices(userId);

    response.clearCookie("refreshToken");

    response
      .status(200)
      .message("Logged out from all devices successfully")
      .json(null);
  } catch (error) {
    logger.error("AuthController", "Failed to logout from all devices", error);
    next(error);
  }
};

export const getMe = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (request as any).user.id;
    const user = await authService.getAuthenticatedUser(userId);

    response
      .status(200)
      .message("User data retrieved successfully")
      .json(user);
  } catch (error) {
    logger.error("AuthController", "Failed to get user data", error);
    next(error);
  }
};

export const forgotPassword = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = request.body as ForgotPasswordSchema;
    const result = await authService.requestPasswordReset(body);

    response
      .status(200)
      .message(result.message)
      .json(null);
  } catch (error) {
    logger.error("AuthController", "Failed to process forgot password", error);
    next(error);
  }
};

export const resetPassword = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = request.body as ResetPasswordSchema;
    const result = await authService.resetPasswordWithOTP(body);

    response
      .status(200)
      .message(result.message)
      .json(null);
  } catch (error) {
    logger.error("AuthController", "Failed to reset password", error);
    next(error);
  }
};

export const googleLogin = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = request.body as GoogleLoginSchema;
    const result = await authService.loginWithGoogle(
      body,
      request.headers["user-agent"],
      request.ip
    );

    response.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: envConfig.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_MAX_AGE,
    });

    response
      .status(200)
      .message("Google login successful")
      .json({
        accessToken: result.accessToken,
        user: result.user,
      });
  } catch (error) {
    logger.error("AuthController", "Failed to login with Google", error);
    next(error);
  }
};

export const facebookLogin = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = request.body as FacebookLoginSchema;
    const result = await authService.loginWithFacebook(
      body,
      request.headers["user-agent"],
      request.ip
    );

    response.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: envConfig.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: AUTH_CONSTANTS.REFRESH_TOKEN_COOKIE_MAX_AGE,
    });

    response
      .status(200)
      .message("Facebook login successful")
      .json({
        accessToken: result.accessToken,
        user: result.user,
      });
  } catch (error) {
    logger.error("AuthController", "Failed to login with Facebook", error);
    next(error);
  }
};
