import prisma from "../database/prisma.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.util.js";
import { hashPassword, comparePassword } from "../utils/hash.util.js";

export const signupUser = async (userData) => {
  const { username, password, fullName } = userData;

  const existingUser = await prisma.User.findUnique({
    where: { username: username },
  });

  if (existingUser) {
    throw new Error("Username already exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.User.create({
    data: {
      username,
      password: hashedPassword,
      fullName,
    },
    select: {
      id: true,
      username: true,
      fullName: true,
      createdAt: true,
    },
  });

  return user;
};

export const loginUser = async (loginData) => {
  const { username, password } = loginData;

  const user = await prisma.User.findUnique({
    where: { username: username },
  });

  if (!user) {
    throw new Error("Invalid username");
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Wrong password");
  }

  const userPayload = {
    id: user.id,
    username: user.username,
  };

  const accessToken = generateAccessToken(userPayload);
  const refreshToken = generateRefreshToken(userPayload);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
    },
  };
};

export const logoutUser = async (userId) => {
  // delete refresh token from database or cache if stored
};
