import db from "../database/db";

export type otp_purpose_enum = 'signup' | 'reset_password';

export const createOTP = async (
  userId: number,
  otp: string,
  expiresAt: Date,
  purpose: otp_purpose_enum
) => {
  await db("user_otps")
    .where({
      user_id: userId,
      purpose: purpose,
      consumed_at: null,
    })
    .update({
      consumed_at: new Date(),
    });

  const [newOtp] = await db("user_otps")
    .insert({
      user_id: userId,
      otp_code: otp,
      purpose: purpose,
      expires_at: expiresAt,
      created_at: new Date(),
      consumed_at: null,
    })
    .returning("*");

  return newOtp;
};

export const findValidOTP = async (
  userId: number,
  otp: string,
  purpose: otp_purpose_enum
) => {
  return db("user_otps")
    .where({
      user_id: userId,
      otp_code: otp,
      purpose: purpose,
      consumed_at: null,
    })
    .where("expires_at", ">", new Date())
    .orderBy("created_at", "desc")
    .first();
};

export const markOTPAsUsed = async (otpId: number) => {
  const [updatedOtp] = await db("user_otps")
    .where({ otp_id: otpId })
    .update({ consumed_at: new Date() })
    .returning("*");
  return updatedOtp;
};

export const deleteUserOTPs = async (userId: number) => {
  return db("user_otps").where({ user_id: userId }).del();
};
