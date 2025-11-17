import * as userRepo from "../repositories/user.repository";
import * as otpRepo from "../repositories/otp.repository";
import * as tokenRepo from "../repositories/token.repository";
import { hashPassword, comparePassword } from "../utils/hash.util";
import { generateOTP, isOTPExpired } from "../utils/otp.util";
import { sendOTPEmail, sendWelcomeEmail } from "./email.service";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  getRefreshTokenExpiry,
} from "../utils/jwt.util";

export const signupUser = async (userData: any) => {
  const { recaptchaToken, ...restUserData } = userData;

  const existingUser = await userRepo.findByEmail(restUserData.email);
  if (existingUser) {
    throw new Error("Email already in use");
  }

  const hashedPassword = await hashPassword(restUserData.password);
  const newUser = {
    ...restUserData,
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

export const loginUser = async (
  loginData: any,
  deviceInfo?: string,
  ipAddress?: string
) => {
  const { email, password } = loginData;

  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new Error("Invalid email");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  // CHANGED: Allow unverified users to "login" but return different response
  if (!user.is_verified) {
    // Resend OTP for unverified users
    await otpRepo.deleteUserOTPs(user.id);
    const otp = generateOTP(6);
    await otpRepo.createOTP(user.id, otp);
    await sendOTPEmail(user.email, otp, user.full_name);

    // Return user info without tokens
    return {
      requiresVerification: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        is_verified: false,
      },
      message: "Please verify your email. A new OTP has been sent.",
    };
  }

  const userPayload = {
    id: user.id,
    email: user.email,
  };

  // Generate tokens for verified users
  const accessToken = generateAccessToken(userPayload);
  const refreshToken = generateRefreshToken(userPayload);

  // Hash and save refresh token to database
  const tokenHash = hashToken(refreshToken);
  const expiresAt = getRefreshTokenExpiry();

  await tokenRepo.createRefreshToken(
    user.id,
    tokenHash,
    expiresAt,
    deviceInfo,
    ipAddress
  );

  return {
    requiresVerification: false,
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      is_verified: true,
    },
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    // Verify the refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if token exists in database and is valid
    const tokenHash = hashToken(refreshToken);
    const storedToken = await tokenRepo.findRefreshToken(tokenHash);

    if (!storedToken) {
      throw new Error("Invalid refresh token");
    }

    // Update last used time
    await tokenRepo.updateLastUsed(storedToken.token_id);

    // Generate new access token
    const userPayload = {
      id: decoded.id,
      email: decoded.email,
    };

    const newAccessToken = generateAccessToken(userPayload);

    return {
      accessToken: newAccessToken,
      user: storedToken.users,
    };
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

export const logoutUser = async (refreshToken: string) => {
  const tokenHash = hashToken(refreshToken);
  await tokenRepo.deleteRefreshToken(tokenHash);
  return { message: "Logged out successfully" };
};

export const logoutAllDevices = async (userId: number) => {
  await tokenRepo.deleteUserTokens(userId);
  return { message: "Logged out from all devices" };
};

export const verifyOTP = async (userId: number, otp: string) => {
  const otpRecord = await otpRepo.findValidOTP(userId, otp);

  if (!otpRecord) {
    throw new Error("Invalid OTP code");
  }

  if (!otpRecord.created_at || isOTPExpired(new Date(otpRecord.created_at))) {
    throw new Error("OTP has expired. Please request a new one.");
  }

  // Mark OTP as used
  await otpRepo.markOTPAsUsed(otpRecord.id);

  // Verify user
  const verifiedUser = await userRepo.verifyUser(userId);

  // Send welcome email
  await sendWelcomeEmail(verifiedUser.email, verifiedUser.full_name);

  // Generate tokens for newly verified user
  const userPayload = {
    id: verifiedUser.id,
    email: verifiedUser.email,
  };

  const accessToken = generateAccessToken(userPayload);
  const refreshToken = generateRefreshToken(userPayload);

  // Save refresh token
  const tokenHash = hashToken(refreshToken);
  const expiresAt = getRefreshTokenExpiry();

  await tokenRepo.createRefreshToken(verifiedUser.id, tokenHash, expiresAt);

  return {
    accessToken,
    refreshToken,
    user: {
      id: verifiedUser.id,
      email: verifiedUser.email,
      full_name: verifiedUser.full_name,
      is_verified: true,
    },
  };
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

export const getAuthenticatedUser = async (userId: number) => {
  const user = await userRepo.findByIdWithRoles(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Extract role names from the users_roles relation
  const roles = user.users_roles.map((ur) => ur.roles.name);

  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    address: user.address,
    is_verified: user.is_verified,
    status: user.status,
    positive_reviews: user.positive_reviews,
    negative_reviews: user.negative_reviews,
    roles: roles, // ['bidder', 'seller', 'admin']
    created_at: user.created_at,
  };
};
