import db from "../database/db";
import * as userRepo from "./user.repository";

export const findSocialAccount = async (
  provider: string,
  providerId: string
) => {
  const socialAccount = await db("social_accounts")
    .where({
      provider,
      provider_id: providerId,
    })
    .first();

  if (!socialAccount) return null;

  const user = await db("users").where({ id: socialAccount.user_id }).first();

  return {
    ...socialAccount,
    users: user,
  };
};

export const createSocialAccount = async (data: {
  userId: number;
  provider: string;
  providerId: string;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
}) => {
  const [newAccount] = await db("social_accounts")
    .insert({
      user_id: data.userId,
      provider: data.provider,
      provider_id: data.providerId,
      email: data.email,
      name: data.name,
      avatar_url: data.avatarUrl,
    })
    .returning("*");
  return newAccount;
};

export const findOrCreateUserFromSocial = async (
  provider: string,
  providerId: string,
  email: string,
  name: string | null,
  avatarUrl: string | null
) => {
  let socialAccount = await findSocialAccount(provider, providerId);

  if (socialAccount) {
    return socialAccount.users;
  }

  let user = await userRepo.findByEmail(email);

  if (!user) {
    const newUser = {
      email,
      full_name: name || "New User",
      is_verified: true,
      status: "active",
    };
    user = await userRepo.createUser(newUser);
  }

  if (!user) {
    return null;
  }

  await createSocialAccount({
    userId: user.id,
    provider,
    providerId,
    email,
    name,
    avatarUrl,
  });

  return user;
};
