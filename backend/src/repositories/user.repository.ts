import prisma from "../database/prisma";

const mapUserToResponse = (user: any) => {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    address: user.address,
    isVerified: user.is_verified,
    status: user.status,
    positiveReviews: user.positive_reviews,
    negativeReviews: user.negative_reviews,
    password: user.password,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
};

export const createUser = async (userData: {
  full_name: string;
  email: string;
  password?: string | null;
  address?: string | null;
  is_verified?: boolean;
  status?: any;
}) => {
  const user = await prisma.users.create({
    data: userData as any,
  });
  return mapUserToResponse(user);
};

export const findByEmail = async (email: string) => {
  const user = await prisma.users.findUnique({
    where: { email },
  });
  return mapUserToResponse(user);
};

export const verifyUser = async (userId: number) => {
  const user = await prisma.users.update({
    where: { id: userId },
    data: { is_verified: true, status: "active" },
  });
  return mapUserToResponse(user);
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
  return user
    ? {
        ...mapUserToResponse(user),
        otpVerifications: user.otp_verifications,
      }
    : null;
};

export const findById = async (userId: number) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
  });
  return mapUserToResponse(user);
};

export const getPositiveNegativeReviewsById = async (userId: number) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      positive_reviews: true,
      negative_reviews: true,
    },
  });
  return user
    ? {
        positiveReviews: user.positive_reviews,
        negativeReviews: user.negative_reviews,
      }
    : null;
};

export const findByIdWithRoles = async (userId: number) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: {
      users_roles: {
        include: {
          roles: true,
        },
      },
    },
  });
  return user
    ? {
        ...mapUserToResponse(user),
        usersRoles: user.users_roles,
      }
    : null;
};

export const updatePassword = async (
  userId: number,
  hashedPassword: string
) => {
  const user = await prisma.users.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
  return mapUserToResponse(user);
};
