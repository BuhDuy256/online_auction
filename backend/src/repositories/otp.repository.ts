import prisma from "../database/prisma";

export const createOTP = async (userId: number, otp: string) => {
  return prisma.otp_verifications.create({
    data: {
      user_id: userId,
      otp,
    },
  });
};

export const findValidOTP = async (userId: number, otp: string) => {
  return prisma.otp_verifications.findFirst({
    where: {
      user_id: userId,
      otp,
      is_used: false,
    },
    orderBy: {
      created_at: "desc",
    },
  });
};

export const markOTPAsUsed = async (otpId: number) => {
  return prisma.otp_verifications.update({
    where: { id: otpId },
    data: { is_used: true },
  });
};

export const deleteUserOTPs = async (userId: number) => {
  return prisma.otp_verifications.deleteMany({
    where: { user_id: userId },
  });
};
