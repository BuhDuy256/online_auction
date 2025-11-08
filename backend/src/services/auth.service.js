import prisma from "../database/prisma.js";
import bcrypt from "bcryptjs";

export const signupUser = async (userData) => {
  const { username, password, fullName } = userData;

  const existingUser = await prisma.User.findUnique({
    where: { username: username },
  });

  if (existingUser) {
    throw new Error("Username already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

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
