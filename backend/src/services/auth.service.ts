import * as userRepo from "../repositories/user.repository";
import * as otpRepo from "../repositories/otp.repository";
import { hashPassword } from "../utils/hash.util";
import { generateOTP, isOTPExpired } from "../utils/otp.util";
import { sendOTPEmail, sendWelcomeEmail } from "./email.service";

export const signupUser = async (userData: any) => {
  const existingUser = await userRepo.findByEmail(userData.email);
  if (existingUser) {
    throw new Error("Email already in use");
  }

  const hashedPassword = await hashPassword(userData.password);
  const newUser = {
    ...userData,
    password: hashedPassword,
  };

  const user = await userRepo.createUser(newUser);

  // Generate and send OTP
  const otp = generateOTP(6);
  await otpRepo.createOTP(user.id, otp);
  await sendOTPEmail(user.email, otp, user.full_name);

  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    is_verified: user.is_verified,
    message: "OTP sent to your email. Please verify to continue.",
  };
};

export const verifyOTP = async (userId: number, otp: string) => {
  const otpRecord = await otpRepo.findValidOTP(userId, otp);

  if (!otpRecord) {
    throw new Error("Invalid OTP code");
  }

  if (!otpRecord.created_at || isOTPExpired(otpRecord.created_at)) {
    throw new Error("OTP has expired. Please request a new one.");
  }

  // Mark OTP as used
  await otpRepo.markOTPAsUsed(otpRecord.id);

  // Verify user
  const verifiedUser = await userRepo.verifyUser(userId);

  // Send welcome email
  await sendWelcomeEmail(verifiedUser.email, verifiedUser.full_name);

  return verifiedUser;
};

export const resendOTP = async (userId: number) => {
  const user = await userRepo.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.is_verified) {
    throw new Error("Email is already verified");
  }

  // Delete old OTPs
  await otpRepo.deleteUserOTPs(userId);

  // Generate and send new OTP
  const otp = generateOTP(6);
  await otpRepo.createOTP(userId, otp);
  await sendOTPEmail(user.email, otp, user.full_name);

  return { message: "New OTP sent to your email" };
};
