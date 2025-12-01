import db from "../database/db";

export const createRefreshToken = async (
  userId: number,
  tokenHash: string,
  expiresAt: Date,
  deviceInfo?: string,
  ipAddress?: string
) => {
  const [token] = await db("refresh_tokens")
    .insert({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      device_info: deviceInfo,
      ip_address: ipAddress,
    })
    .returning("*");
  return token;
};

export const findRefreshToken = async (tokenHash: string) => {
  const token = await db("refresh_tokens")
    .where({ token_hash: tokenHash })
    .where("expires_at", ">", new Date()) // Token must not be expired
    .first();

  if (!token) return null;

  const user = await db("users")
    .where({ id: token.user_id })
    .select("id", "email", "full_name", "is_verified")
    .first();

  return {
    ...token,
    users: user,
  };
};

export const updateLastUsed = async (tokenId: number) => {
  const [updatedToken] = await db("refresh_tokens")
    .where({ token_id: tokenId })
    .update({ last_used_at: new Date() })
    .returning("*");
  return updatedToken;
};

export const deleteRefreshToken = async (tokenHash: string) => {
  return db("refresh_tokens").where({ token_hash: tokenHash }).del();
};

export const deleteUserTokens = async (userId: number) => {
  return db("refresh_tokens").where({ user_id: userId }).del();
};

export const deleteExpiredTokens = async () => {
  return db("refresh_tokens")
    .where("expires_at", "<", new Date())
    .del();
};

export const getUserTokens = async (userId: number) => {
  return db("refresh_tokens")
    .where({ user_id: userId })
    .orderBy("created_at", "desc");
};
