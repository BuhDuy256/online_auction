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
  SignupResponse,
  LoginResponse,
  VerificationRequiredResponse,
  UserWithRoles,
  RefreshTokenResponse,
} from "../types/auth.types";
import { OTP_EXPIRY_MINUTES } from "../utils/constant.util";
import {
  SignupSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  GoogleLoginSchema,
  FacebookLoginSchema,
} from "../api/schemas/auth.schema";

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

export const signupUser = async (userData: SignupSchema): Promise<SignupResponse> => {
  const { fullName, email, password, address } = userData;

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

  const mappedUser = mapUserToResponse(user)!;

  const otp = generateOTP(6);
  await otpRepo.createOTP(
    mappedUser.id,
    otp,
    new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    "signup"
  );
  await sendOTPEmail(mappedUser.email, otp, mappedUser.fullName);

  return {
    id: mappedUser.id,
    email: mappedUser.email,
    fullName: mappedUser.fullName,
    isVerified: mappedUser.isVerified,
    message: "OTP sent to your email. Please verify to continue.",
  };
};

export const loginUser = async (
  loginData: LoginSchema,
  deviceInfo?: string,
  ipAddress?: string
): Promise<LoginResponse | VerificationRequiredResponse> => {
  const { email, password } = loginData;

  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const mappedUser = mapUserToResponse(user)!;

  const isPasswordValid = await comparePassword(
    password,
    mappedUser.password as string
  );
  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (!mappedUser.isVerified) {
    await otpRepo.deleteUserOTPs(mappedUser.id);
    const otp = generateOTP(6);
    await otpRepo.createOTP(
      mappedUser.id,
      otp,
      new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      "signup"
    );
    await sendOTPEmail(mappedUser.email, otp, mappedUser.fullName);

    return {
      requiresVerification: true,
      user: {
        id: mappedUser.id,
        email: mappedUser.email,
        fullName: mappedUser.fullName,
        isVerified: false,
      },
      message: "Please verify your email. A new OTP has been sent.",
    };
  }

  const userPayload = {
    id: mappedUser.id,
    email: mappedUser.email,
  };

  const accessToken = generateAccessToken(userPayload);
  const refreshToken = generateRefreshToken(userPayload);

  const tokenHash = hashToken(refreshToken);
  const expiresAt = getRefreshTokenExpiry();

  await tokenRepo.createRefreshToken(
    mappedUser.id,
    tokenHash,
    expiresAt,
    deviceInfo,
    ipAddress
  );

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    user: {
      id: mappedUser.id,
      email: mappedUser.email,
      fullName: mappedUser.fullName,
      isVerified: true,
    },
  };
};

export const requestPasswordReset = async (
  data: ForgotPasswordSchema
): Promise<{ message: string }> => {
  const { email } = data;
  const user = await userRepo.findByEmail(email);

  if (!user || !user.is_verified) {
    return {
      message: "If an account with that email exists, an OTP has been sent.",
    };
  }

  const mappedUser = mapUserToResponse(user)!;

  const otp = generateOTP(6);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await otpRepo.createOTP(mappedUser.id, otp, expiresAt, "reset_password");
  await sendOTPEmail(mappedUser.email, otp, mappedUser.fullName);

  return { message: "An OTP has been sent to your email." };
};

export const resetPasswordWithOTP = async (
  data: ResetPasswordSchema
): Promise<{ message: string }> => {
  const { email, otp, newPassword } = data;
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

  const mappedUser = mapUserToResponse(verifiedUser)!;

  await sendWelcomeEmail(mappedUser.email, mappedUser.fullName);

  const userPayload = {
    id: mappedUser.id,
    email: mappedUser.email,
  };

  const accessToken = generateAccessToken(userPayload);
  const refreshToken = generateRefreshToken(userPayload);

  const tokenHash = hashToken(refreshToken);
  const expiresAt = getRefreshTokenExpiry();

  await tokenRepo.createRefreshToken(mappedUser.id, tokenHash, expiresAt);

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    user: {
      id: mappedUser.id,
      email: mappedUser.email,
      fullName: mappedUser.fullName,
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

  if (user.is_verified) {
    throw new BadRequestError("Email is already verified");
  }

  const mappedUser = mapUserToResponse(user)!;

  await otpRepo.deleteUserOTPs(userId);

  const otp = generateOTP(6);
  await otpRepo.createOTP(
    userId,
    otp,
    new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    "signup"
  );
  await sendOTPEmail(mappedUser.email, otp, mappedUser.fullName);

  return { message: "New OTP sent to your email" };
};

export const getAuthenticatedUser = async (
  userId: number
): Promise<UserWithRoles> => {
  const user = await userRepo.findByIdWithRoles(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const mappedUser = mapUserToResponse(user)!;
  // @ts-ignore
  const roles = user.usersRoles.map((ur: any) => ur.roles.name);

  return {
    id: mappedUser.id,
    email: mappedUser.email,
    fullName: mappedUser.fullName,
    address: mappedUser.address,
    isVerified: mappedUser.isVerified,
    status: mappedUser.status,
    positiveReviews: mappedUser.positiveReviews,
    negativeReviews: mappedUser.negativeReviews,
    roles: roles,
    createdAt: mappedUser.createdAt,
  };
};

export const loginWithGoogle = async (
  data: GoogleLoginSchema,
  deviceInfo?: string,
  ipAddress?: string
): Promise<LoginResponse> => {
  const { code } = data;
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

  const mappedUser = mapUserToResponse(user)!;

  const userPayload = { id: mappedUser.id, email: mappedUser.email, roles: [] };
  const accessToken = generateAccessToken(userPayload);
  const refreshToken = generateRefreshToken(userPayload);

  await tokenRepo.createRefreshToken(
    mappedUser.id,
    hashToken(refreshToken),
    getRefreshTokenExpiry(),
    deviceInfo,
    ipAddress
  );

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    user: {
      id: mappedUser.id,
      email: mappedUser.email,
      fullName: mappedUser.fullName,
      isVerified: true,
    },
  };
};

export const loginWithFacebook = async (
  data: FacebookLoginSchema,
  deviceInfo?: string,
  ipAddress?: string
): Promise<LoginResponse> => {
  const { accessToken } = data;
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

  const mappedUser = mapUserToResponse(user)!;

  const userPayload = { id: mappedUser.id, email: mappedUser.email, roles: [] };
  const jwtAccessToken = generateAccessToken(userPayload);
  const jwtRefreshToken = generateRefreshToken(userPayload);

  await tokenRepo.createRefreshToken(
    mappedUser.id,
    hashToken(jwtRefreshToken),
    getRefreshTokenExpiry(),
    deviceInfo,
    ipAddress
  );

  return {
    accessToken: jwtAccessToken,
    user: {
      id: mappedUser.id,
      email: mappedUser.email,
      fullName: mappedUser.fullName,
      isVerified: true,
    },
  };
};
