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
