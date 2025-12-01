import db from "../database/db";

export const createUser = async (userData: {
  full_name: string;
  email: string;
  password?: string | null;
  address?: string | null;
  is_verified?: boolean;
  status?: any;
}) => {
  const [user] = await db("users")
    .insert(userData)
    .returning("*");
  return user;
};

export const findByEmail = async (email: string) => {
  return await db("users").where({ email }).first();
};

export const verifyUser = async (userId: number) => {
  const [user] = await db("users")
    .where({ id: userId })
    .update({ is_verified: true, status: "active" })
    .returning("*");
  return user;
};

export const findByIdWithOTP = async (userId: number) => {
  const user = await db("users").where({ id: userId }).first();

  if (!user) return null;

  const otpVerifications = await db("otp_verifications")
    .where({ user_id: userId, is_used: false })
    .orderBy("created_at", "desc")
    .limit(1);

  return {
    ...user,
    otpVerifications,
  };
};

export const findById = async (userId: number) => {
  return await db("users").where({ id: userId }).first();
};

export const getPositiveNegativeReviewsById = async (userId: number) => {
  const user = await db("users")
    .where({ id: userId })
    .select("positive_reviews", "negative_reviews")
    .first();

  return user;
};

export const updatePassword = async (
  userId: number,
  hashedPassword: string
) => {
  const [user] = await db("users")
    .where({ id: userId })
    .update({ password: hashedPassword })
    .returning("*");
  return user;
};

export const findByIdWithRoles = async (userId: number) => {
  const user = await db("users").where({ id: userId }).first();
  if (!user) return null;

  const roles = await db("users_roles")
    .join("roles", "users_roles.role_id", "roles.role_id")
    .where({ user_id: userId })
    .select("roles.name");

  return {
    ...user,
    usersRoles: roles.map((r) => ({ roles: { name: r.name } })),
  };
};
