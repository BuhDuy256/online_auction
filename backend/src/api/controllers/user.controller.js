import * as userService from "../../services/user.service.js";

export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await userService.getUserById(userId);

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const selfUserId = req.user.id;

    const users = await userService.searchUsers(q, selfUserId);

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};
