import prisma from "../database/prisma";

export const createUser = async (userData: any) => {
  const user = await prisma.users.create({
    data: userData,
  });
  return user;
};

export const findByEmail = async (email: string) => {
  const user = await prisma.users.findUnique({
    where: { email },
  });
  return user;
};

export const verifyUser = async (userId: number) => {
  const user = await prisma.users.update({
    where: { id: userId },
    data: { is_verified: true },
  });
  return user;
};

export const findByIdWithOTP = async (userId: number) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: {
      otp_verifications: {
        where: { is_used: false },
        orderBy: { created_at: "desc" },
        take: 1,
      },
    },
  });
  return user;
};

export const findById = async (userId: number) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
  });
  return user;
};
