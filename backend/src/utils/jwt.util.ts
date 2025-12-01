import jwt from "jsonwebtoken";
import crypto from "crypto";
import { envConfig } from "../config/env.config";

const ACCESS_SECRET = envConfig.JWT_ACCESS_SECRET;
const REFRESH_SECRET = envConfig.JWT_REFRESH_SECRET;

const ACCESS_EXPIRES_IN = "15m"; // 15 minutes
const REFRESH_EXPIRES_IN = "7d"; // 7 days

interface TokenPayload {
  id: number;
  email: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ACCESS_SECRET as string, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET as string, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ACCESS_SECRET as string) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, REFRESH_SECRET as string) as TokenPayload;
};

// Hash token for secure storage
export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Get refresh token expiry date
export const getRefreshTokenExpiry = (): Date => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7); // 7 days
  return expiryDate;
};

// Decode token without verification (to check expiry)
export const decodeToken = (token: string): any => {
  return jwt.decode(token);
};
