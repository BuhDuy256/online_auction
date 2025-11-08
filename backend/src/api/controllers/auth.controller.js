import * as authService from "../../services/auth.service.js";

export const signup = async (req, res, next) => {
  try {
    const user = await authService.signupUser(req.body);

    res.status(201).json({
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await authService.loginUser(req.body);

    res.cookie("refreshToken", user.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "User logged in successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logoutUser(req.user.id);

    res.cookie("refreshToken", req.user.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1, // Expire the cookie immediately
    });

    res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
