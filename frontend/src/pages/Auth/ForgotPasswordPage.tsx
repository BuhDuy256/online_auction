import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import OTPInput from "../../components/ui/OTPInput"; // 1. Import OTPInput
import "./AuthForms.css";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  // 2. Lấy cả hai hàm từ context
  const { forgotPassword, resetPassword } = useAuth();

  // 3. Thêm 'step' để chuyển UI
  const [step, setStep] = useState<"request_email" | "submit_otp">(
    "request_email"
  );
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 4. Hàm này (dùng cho OTPInput) cần tên khác
  const handleOtpChange = (otpValue: string) => {
    setFormData({ ...formData, otp: otpValue });
  };

  // === Bước 1: Xử lý Yêu cầu OTP ===
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await forgotPassword(formData.email);
      toast.success("An OTP has been sent to your email.");
      setStep("submit_otp"); // 5. Chuyển sang bước 2
    } catch (error: any) {
      setError(error.message || "An error occurred");
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // === Bước 2: Xử lý Gửi OTP + Mật khẩu mới ===
  const handleSubmitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await resetPassword(formData.email, formData.otp, formData.newPassword);
      toast.success("Password reset successfully! Please log in.");
      navigate("/login"); // Xong! Về trang đăng nhập
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP or failed to reset.");
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot Password">
      {/* --- GIAI ĐOẠN 1: YÊU CẦU EMAIL (Bước 1) --- */}
      {step === "request_email" && (
        <form className="auth-form" onSubmit={handleRequestOTP}>
          <p className="auth-subtext">
            Enter your email to receive a 6-digit code.
          </p>
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          {error && <p className="auth-error">{error}</p>}
          <div className="button-group">
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Sending...
                </>
              ) : (
                "Send Reset OTP"
              )}
            </Button>
          </div>
        </form>
      )}
      {/* --- GIAI ĐOẠN 2: NHẬP OTP VÀ PASS MỚI (Bước 2) --- */}
      {step === "submit_otp" && (
        <form className="auth-form" onSubmit={handleSubmitNewPassword}>
          <p className="auth-subtext">
            An OTP was sent to <strong>{formData.email}</strong>.
          </p>

          <label className="auth-label">Enter 6-Digit OTP</label>
          <OTPInput
            length={6}
            value={formData.otp}
            onChange={handleOtpChange} // Dùng hàm mới
            disabled={isLoading}
          />

          <label className="auth-label">Enter New Password</label>
          <Input
            type="password"
            name="newPassword" // Sửa name
            placeholder="New Password (min 8 characters)"
            value={formData.newPassword}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          <Input
            type="password"
            name="confirmPassword" // Sửa name
            placeholder="Confirm New Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            required
          />

          {error && <p className="auth-error">{error}</p>}
          <div className="button-group">
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </div>
        </form>
      )}
      <Button
        variant="secondary"
        onClick={() => {
          if (step === "submit_otp")
            setStep("request_email"); // Quay lại bước 1
          else navigate("/login"); // Quay lại trang Login
        }}
        disabled={isLoading}
        className="switch-auth-button"
      >
        Back to Login
      </Button>
    </AuthLayout>
  );
}
