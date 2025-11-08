import prisma from "../database/prisma.js";

export const getUserById = async (userId) => {
  const user = await prisma.User.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      fullName: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

/**
 * Tìm kiếm user bằng username hoặc fullName, loại trừ user hiện tại
 * @param {string} query - Chuỗi tìm kiếm
 * @param {BigInt} selfUserId - ID của user đang tìm kiếm (để loại trừ)
 */
export const searchUsers = async (query, selfUserId) => {
  const users = await prisma.User.findMany({
    where: {
      id: { not: selfUserId },
      OR: [
        { username: { contains: query, mode: "insensitive" } },
        { fullName: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 10,
    select: {
      id: true,
      username: true,
      fullName: true,
    },
  });

  return users;
};
