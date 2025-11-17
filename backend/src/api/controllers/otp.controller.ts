import { NextFunction, Request, Response } from "express";
import * as authService from "../../services/auth.service";

export const verifyOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user_id, otp } = req.body;

    const result = await authService.verifyOTP(user_id, otp);

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Email verified successfully",
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const resendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user_id } = req.body;

    const result = await authService.resendOTP(user_id);

    res.status(200).json(result);
  } catch (error: any) {
    next(error);
  }
};
