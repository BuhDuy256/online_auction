export interface User {
  id: number;
  email: string;
  fullName: string;
  address: string | null;
  isVerified: boolean;
  status: string;
  positiveReviews: number;
  negativeReviews: number;
  createdAt: Date;
}

export interface UserWithRoles extends User {
  roles: string[];
}

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
  address?: string | null;
  recaptchaToken: string;
}

export interface LoginData {
  email: string;
  password: string;
  recaptchaToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  isVerified: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: UserResponse;
}

export interface SignupResponse {
  id: number;
  email: string;
  fullName: string;
  isVerified: boolean;
}

export interface VerificationRequiredResponse {
  requiresVerification: true;
  user: UserResponse;
}

export interface GoogleLoginData {
  code: string;
}

export interface FacebookLoginData {
  accessToken: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    isVerified: boolean;
  };
}
