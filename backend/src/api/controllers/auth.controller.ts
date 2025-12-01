import { Request, Response, NextFunction } from "express";
import * as authService from "../../services/auth.service";
import { formatResponse } from "../../utils/response.util";
import { logger } from "../../utils/logger.util";
import { AUTH_CONSTANTS } from "../../utils/constant.util";
import {
  SignupSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  GoogleLoginSchema,
  FacebookLoginSchema,
} from "../schemas/auth.schema";
import { envConfig } from "../../config/env.config";

export const signup = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = request.body as SignupSchema;
    const result = await authService.signupUser(body);
    formatResponse(response, 201, result, "User created successfully");
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
      formatResponse(
        response,
        200,
        {
          requiresVerification: true,
          user: result.user,
        },
        result.message
      );
      return;
    }

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
      "Login successful"
    );
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
      formatResponse(response, 401, null, "Refresh token not provided");
      return;
    }

    const result = await authService.refreshAccessToken(refreshToken);
    formatResponse(response, 200, result, "Token refreshed successfully");
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
    formatResponse(response, 200, null, "Logged out successfully");
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
    formatResponse(
      response,
      200,
      null,
      "Logged out from all devices successfully"
    );
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
    formatResponse(response, 200, user, "User data retrieved successfully");
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
    formatResponse(response, 200, null, result.message);
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
    formatResponse(response, 200, null, result.message);
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

    formatResponse(
      response,
      200,
      {
        accessToken: result.accessToken,
        user: result.user,
      },
      "Google login successful"
    );
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

    formatResponse(
      response,
      200,
      {
        accessToken: result.accessToken,
        user: result.user,
      },
      "Facebook login successful"
    );
  } catch (error) {
    logger.error("AuthController", "Failed to login with Facebook", error);
    next(error);
  }
};
