import { Request, Response } from "express";
import * as authService from "../../services/auth.service";

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { user_id, otp } = req.body;

    const user = await authService.verifyOTP(user_id, otp);

    res.status(200).json({
      message: "Email verified successfully",
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        is_verified: user.is_verified,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Failed to verify OTP",
    });
  }
};

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.body;

    const result = await authService.resendOTP(user_id);

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Failed to resend OTP",
    });
  }
};
