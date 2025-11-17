import React, { createContext, useState, useEffect, useMemo } from "react";
import * as authService from "../services/authService";
import { useNavigate } from "react-router-dom";
import type { User } from "../types/user";

export interface SignupData {
  full_name: string;
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
  ) => Promise<any>; // Trả về Awaited<AxiosResponse<any>>
  signup: (formData: SignupData) => Promise<any>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await authService.getMe();
          setUser(response.data);
        } catch (error) {
          console.error("Token verification failed:", error);
          authService.logout();
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    verifyUser();
  }, []);

  const login = async (
    email: string,
    password: string,
    recaptchaToken: string
  ): Promise<any> => {
    // 1. Gọi service. Nếu thất bại (401, 500), nó sẽ tự động throw lỗi
    // và LoginPage sẽ bắt được.
    const loginResponse = await authService.login(
      email,
      password,
      recaptchaToken
    );

    // 2. Nếu thành công, LƯU TOKEN NGAY LẬP TỨC
    localStorage.setItem("token", loginResponse.data.accessToken);

    // 3. Cập nhật user state (nếu không cần verify)
    // Nếu cần verify, backend sẽ không gửi token,
    // nhưng để an toàn, chúng ta kiểm tra cả ở đây.
    if (!loginResponse.data.requiresVerification) {
      try {
        const userResponse = await authService.getMe();
        setUser(userResponse.data);
      } catch (error) {
        console.error("Failed to fetch user data after login:", error);
        authService.logout(); // Dọn dẹp token hỏng
        setUser(null);
        throw new Error("Login succeeded but failed to verify user.");
      }
    }

    // 4. TRẢ VỀ KẾT QUẢ LOGIN GỐC (quan trọng nhất)
    // Để LoginPage có thể kiểm tra 'requiresVerification'
    return loginResponse;
  };

  const signup = async (formData: SignupData): Promise<any> => {
    return authService.signup(formData);
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

  const forgotPassword = async (email: string): Promise<any> => {
    return authService.forgotPassword(email);
  };

  const resetPassword = async (
    email: string,
    otp: string,
    newPassword: string
  ): Promise<any> => {
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
