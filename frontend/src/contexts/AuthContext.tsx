import React, { createContext, useState, useEffect, useMemo } from "react";
import * as authService from "../services/authService";
import { useNavigate } from "react-router-dom";
import type { User } from "../types/user";
import type {
  LoginResponse,
  SignupResponse,
  AuthResponse,
  GenericResponse,
} from "../types/auth";

export interface SignupData {
  fullName: string;
  email: string;
  password: string;
  address?: string;
  recaptchaToken: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: string) => boolean;

  login: (
    email: string,
    password: string,
    recaptchaToken: string
  ) => Promise<LoginResponse>;

  signup: (formData: SignupData) => Promise<SignupResponse>;
  logout: () => Promise<void>;

  forgotPassword: (email: string) => Promise<GenericResponse>;
  resetPassword: (
    email: string,
    otp: string,
    newPassword: string
  ) => Promise<GenericResponse>;

  loginWithGoogle: (credential: string) => Promise<AuthResponse>;
  loginWithFacebook: (accessToken: string) => Promise<AuthResponse>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        // No token, skip API call
        setIsLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        setUser(response.data);
      } catch (error) {
        console.error("Token verification failed:", error);
        // Clear invalid token
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    verifyUser();
  }, []);

  const login = async (
    email: string,
    password: string,
    recaptchaToken: string
  ): Promise<LoginResponse> => {
    try {
      // 1. Call service
      const loginResponse = await authService.login(
        email,
        password,
        recaptchaToken
      );

      // 2. If successful, save token immediately
      localStorage.setItem("token", loginResponse.data.accessToken);

      // 3. Update user state if verification is not required
      if (!loginResponse.data.requiresVerification) {
        try {
          const userResponse = await authService.getMe();
          setUser(userResponse.data);
        } catch (error) {
          console.error("Failed to fetch user data after login:", error);
          authService.logout();
          setUser(null);
          throw new Error("Login succeeded but failed to verify user.");
        }
      }

      // 4. Return original response
      return loginResponse;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const signup = async (formData: SignupData): Promise<SignupResponse> => {
    try {
      return await authService.signup(formData);
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const loginWithGoogle = async (code: string): Promise<AuthResponse> => {
    try {
      const response = await authService.loginWithGoogle(code);
      localStorage.setItem("token", response.data.accessToken);
      setUser(response.data.user);
      return response;
    } catch (error) {
      console.error("Google login error in context:", error);
      throw error;
    }
  };

  const loginWithFacebook = async (
    accessToken: string
  ): Promise<AuthResponse> => {
    try {
      const response = await authService.loginWithFacebook(accessToken);
      localStorage.setItem("token", response.data.accessToken);
      setUser(response.data.user);
      return response;
    } catch (error) {
      console.error("Facebook login error in context:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  const forgotPassword = async (email: string): Promise<GenericResponse> => {
    return authService.forgotPassword(email);
  };

  const resetPassword = async (
    email: string,
    otp: string,
    newPassword: string
  ): Promise<GenericResponse> => {
    return authService.resetPasswordWithOTP(email, otp, newPassword);
  };

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role as any) || false;
  };

  const value: AuthContextType = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      hasRole,
      login,
      signup,
      forgotPassword,
      resetPassword,
      loginWithGoogle,
      loginWithFacebook,
      logout,
    }),
    [user, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {!isLoading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
}
