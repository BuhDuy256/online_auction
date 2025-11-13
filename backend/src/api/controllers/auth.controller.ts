import * as authService from "../../services/auth.service";
import { Request, Response, NextFunction } from "express";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await authService.signupUser(req.body);

    res.status(201).json({ message: "User created successfully", data: user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: any, res: any, next: any) => {};
