import * as userRepo from "../repositories/user.repository";
import * as otpRepo from "../repositories/otp.repository";
import * as tokenRepo from "../repositories/token.repository";
import * as socialRepo from "../repositories/socialAccount.repository";
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
import * as googleService from "./google.service";
import * as facebookService from "./facebook.service";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../errors";
import {
  SignupData,
  LoginData,
  SignupResponse,
  LoginResponse,
  VerificationRequiredResponse,
  UserWithRoles,
  RefreshTokenResponse,
} from "../types/auth.types";
import { OTP_EXPIRY_MINUTES } from "../utils/constant.util";

export const signupUser = async (
  userData: SignupData
): Promise<SignupResponse> => {
  const { /* recaptchaToken, */ fullName, email, password, address } = userData;

  const existingUser = await userRepo.findByEmail(email);
  if (existingUser) {
    throw new BadRequestError("Email already in use");
  }

  const hashedPassword = await hashPassword(password);
  const newUser = {
    full_name: fullName,
    email,
    password: hashedPassword,
    address: address || null,
  };

  const user = await userRepo.createUser(newUser);

  if (!user) {
    throw new BadRequestError("Failed to create user");
  }

  const otp = generateOTP(6);
  await otpRepo.createOTP(
    user.id,
    otp,
    new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    "signup"
  );
  await sendOTPEmail(user.email, otp, user.fullName);

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    isVerified: user.isVerified,
    message: "OTP sent to your email. Please verify to continue.",
  };
};

export const loginUser = async (
  loginData: LoginData,
  deviceInfo?: string,
  ipAddress?: string
): Promise<LoginResponse | VerificationRequiredResponse> => {
  const { email, password } = loginData;

  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(
    password,
    user.password as string
  );
  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (!user.isVerified) {
    await otpRepo.deleteUserOTPs(user.id);
    const otp = generateOTP(6);
    await otpRepo.createOTP(
      user.id,
      otp,
      new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      "signup"
    );
    await sendOTPEmail(user.email, otp, user.fullName);

    return {
      requiresVerification: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isVerified: false,
      },
      message: "Please verify your email. A new OTP has been sent.",
    };
  }

  const userPayload = {
    id: user.id,
    email: user.email,
  };

  const accessToken = generateAccessToken(userPayload);
  const refreshToken = generateRefreshToken(userPayload);

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
    accessToken: accessToken,
    refreshToken: refreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isVerified: true,
    },
  };
};

export const requestPasswordReset = async (
  email: string
): Promise<{ message: string }> => {
  const user = await userRepo.findByEmail(email);

  if (!user || !user.isVerified) {
    return {
      message: "If an account with that email exists, an OTP has been sent.",
    };
  }

  const otp = generateOTP(6);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await otpRepo.createOTP(user.id, otp, expiresAt, "reset_password");
  await sendOTPEmail(user.email, otp, user.fullName);

  return { message: "An OTP has been sent to your email." };
};

export const resetPasswordWithOTP = async (
  email: string,
  otp: string,
  newPassword: string
): Promise<{ message: string }> => {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const validToken = await otpRepo.findValidOTP(user.id, otp, "reset_password");
  if (!validToken) {
    throw new BadRequestError("Invalid or expired OTP");
  }

  const hashedPassword = await hashPassword(newPassword);
  await userRepo.updatePassword(user.id, hashedPassword);

  await otpRepo.markOTPAsUsed(validToken.otp_id);

  return { message: "Password has been reset successfully" };
};

export const refreshAccessToken = async (
  refreshToken: string
): Promise<RefreshTokenResponse> => {
  const decoded = verifyRefreshToken(refreshToken);

  const tokenHash = hashToken(refreshToken);
  const storedToken = await tokenRepo.findRefreshToken(tokenHash);

  if (!storedToken) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  await tokenRepo.updateLastUsed(storedToken.token_id);

  const userPayload = {
    id: decoded.id,
    email: decoded.email,
  };

  const newAccessToken = generateAccessToken(userPayload);

  return {
    accessToken: newAccessToken,
    user: {
      id: storedToken.users.id,
      email: storedToken.users.email,
      fullName: storedToken.users.full_name,
      isVerified: storedToken.users.is_verified,
    },
  };
};

export const logoutUser = async (
  refreshToken: string
): Promise<{ message: string }> => {
  const tokenHash = hashToken(refreshToken);
  await tokenRepo.deleteRefreshToken(tokenHash);
  return { message: "Logged out successfully" };
};

export const logoutAllDevices = async (
  userId: number
): Promise<{ message: string }> => {
  await tokenRepo.deleteUserTokens(userId);
  return { message: "Logged out from all devices" };
};

export const verifyOTP = async (
  userId: number,
  otp: string
): Promise<LoginResponse> => {
  const otpRecord = await otpRepo.findValidOTP(userId, otp, "signup");

  if (!otpRecord) {
    throw new BadRequestError("Invalid OTP code");
  }

  if (!otpRecord.created_at || isOTPExpired(new Date(otpRecord.created_at))) {
    throw new BadRequestError("OTP has expired. Please request a new one");
  }

  await otpRepo.markOTPAsUsed(otpRecord.otp_id);

  const verifiedUser = await userRepo.verifyUser(userId);

  if (!verifiedUser) {
    throw new NotFoundError("User not found");
  }

  await sendWelcomeEmail(verifiedUser.email, verifiedUser.fullName);

  const userPayload = {
    id: verifiedUser.id,
    email: verifiedUser.email,
  };

  const accessToken = generateAccessToken(userPayload);
  const refreshToken = generateRefreshToken(userPayload);

  const tokenHash = hashToken(refreshToken);
  const expiresAt = getRefreshTokenExpiry();

  await tokenRepo.createRefreshToken(verifiedUser.id, tokenHash, expiresAt);

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    user: {
      id: verifiedUser.id,
      email: verifiedUser.email,
      fullName: verifiedUser.fullName,
      isVerified: true,
    },
  };
};

export const resendOTP = async (
  userId: number
): Promise<{ message: string }> => {
  const user = await userRepo.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.isVerified) {
    throw new BadRequestError("Email is already verified");
  }

  await otpRepo.deleteUserOTPs(userId);

  const otp = generateOTP(6);
  await otpRepo.createOTP(
    userId,
    otp,
    new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    "signup"
  );
  await sendOTPEmail(user.email, otp, user.fullName);

  return { message: "New OTP sent to your email" };
};

export const getAuthenticatedUser = async (
  userId: number
): Promise<UserWithRoles> => {
  const user = await userRepo.findByIdWithRoles(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const roles = user.usersRoles.map((ur: any) => ur.roles.name);

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    address: user.address,
    isVerified: user.isVerified,
    status: user.status,
    positiveReviews: user.positiveReviews,
    negativeReviews: user.negativeReviews,
    roles: roles,
    createdAt: user.createdAt,
  };
};

export const loginWithGoogle = async (
  code: string,
  deviceInfo?: string,
  ipAddress?: string
): Promise<LoginResponse> => {
  const googlePayload = await googleService.verifyGoogleToken(code);

  if (!googlePayload || !googlePayload.email) {
    throw new BadRequestError("Google account invalid or missing email");
  }

  const { email, name, picture, sub: googleId } = googlePayload;

  const user = await socialRepo.findOrCreateUserFromSocial(
    "google",
    googleId,
    email,
    name || null,
    picture || null
  );

  if (!user) {
    throw new BadRequestError("Failed to create user from Google account");
  }

  const userPayload = { id: user.id, email: user.email, roles: [] };
  const accessToken = generateAccessToken(userPayload);
  const refreshToken = generateRefreshToken(userPayload);

  await tokenRepo.createRefreshToken(
    user.id,
    hashToken(refreshToken),
    getRefreshTokenExpiry(),
    deviceInfo,
    ipAddress
  );

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isVerified: true,
    },
  };
};

export const loginWithFacebook = async (
  accessToken: string,
  deviceInfo?: string,
  ipAddress?: string
): Promise<LoginResponse> => {
  const fbPayload = await facebookService.verifyFacebookToken(accessToken);

  if (!fbPayload.email) {
    throw new BadRequestError("Facebook account must have an email to sign up");
  }

  const { email, name, picture, sub: facebookId } = fbPayload;

  const user = await socialRepo.findOrCreateUserFromSocial(
    "facebook",
    facebookId,
    email,
    name || null,
    picture || null
  );

  if (!user) {
    throw new BadRequestError("Failed to create user from Facebook account");
  }

  const userPayload = { id: user.id, email: user.email, roles: [] };
  const jwtAccessToken = generateAccessToken(userPayload);
  const jwtRefreshToken = generateRefreshToken(userPayload);

  await tokenRepo.createRefreshToken(
    user.id,
    hashToken(jwtRefreshToken),
    getRefreshTokenExpiry(),
    deviceInfo,
    ipAddress
  );

  return {
    accessToken: jwtAccessToken,
    refreshToken: jwtRefreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isVerified: true,
    },
  };
};
