import { Request, Response, NextFunction } from "express";
import * as authService from "../../services/auth.service";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.signupUser(req.body);
    res.status(201).json({
      message: "User created successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deviceInfo = req.headers["user-agent"] || "Unknown";
    const ipAddress = req.ip || req.socket.remoteAddress || "Unknown";

    const result = await authService.loginUser(req.body, deviceInfo, ipAddress);

    // Check if user requires verification
    if (result.requiresVerification) {
      return res.status(200).json({
        message: result.message,
        data: {
          requiresVerification: true,
          user: result.user,
        },
      });
    }

    // Set refresh token as httpOnly cookie for verified users
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token not provided",
      });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      message: "Token refreshed successfully",
      data: result,
    });
  } catch (error: any) {
    return next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      await authService.logoutUser(refreshToken);
    }

    res.clearCookie("refreshToken");

    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error: any) {
    next(error);
  }
};

export const logoutAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user.id; // From auth middleware

    await authService.logoutAllDevices(userId);

    res.clearCookie("refreshToken");

    res.status(200).json({
      message: "Logged out from all devices successfully",
    });
  } catch (error: any) {
    next(error);
  }
};

// Add this new function
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // req.user is set by the requireAuth middleware
    const userId = (req as any).user.id;

    const user = await authService.getAuthenticatedUser(userId);

    res.status(200).json({
      message: "User data retrieved successfully",
      data: user,
    });
  } catch (error: any) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, new_password } = req.body;
    const result = await authService.resetPasswordWithOTP(
      email,
      otp,
      new_password
    );
    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
