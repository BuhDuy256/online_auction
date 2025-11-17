import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as authService from "../../services/authService";
import AuthLayout from "../../layouts/AuthLayout";
import OTPInput from "../../components/ui/OTPInput";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import "./VerifyOTPPage.css";

interface LocationState {
  email?: string;
  user_id?: number;
  message?: string;
}

const VerifyOTPPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get email, user_id and message from navigation state
  const state = location.state as LocationState;
  const email = state?.email;
  const userId = state?.user_id;
  const customMessage = state?.message;

  // Form state
  const [otp, setOtp] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Resend OTP state
  const [isResending, setIsResending] = useState<boolean>(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);

  // Redirect if no email or user_id provided
  useEffect(() => {
    if (!email || !userId) {
      toast.error("No email provided. Please start from signup or login.");
      navigate("/login");
    }
  }, [email, userId, navigate]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [cooldownSeconds]);

  // Handle OTP verification
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError("Please enter a complete 6-digit code");
      return;
    }

    if (!userId) {
      setError("User ID is missing. Please try logging in again.");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // Verify OTP - now returns tokens
      const response = await authService.verifyOTP(userId, otp);

      // Success: Save token and log user in
      const { accessToken } = response.data;
      localStorage.setItem("token", accessToken);

      toast.success("Account verified successfully! 🎉");

      // Navigate to homepage
      setTimeout(() => {
        navigate("/", { replace: true });
        window.location.reload();
      }, 500);
    } catch (err: any) {
      console.error("OTP verification failed:", err);
      const errorMessage =
        err.message || "Invalid or expired OTP. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      setOtp(""); // Clear OTP input
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle OTP auto-complete
  const handleOTPComplete = (value: string) => {
    // Automatically submit when all 6 digits are entered
    setOtp(value);
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!canResend || isResending || !userId) return;

    setIsResending(true);
    setError("");

    try {
      await authService.resendOTP(userId);

      toast.success("A new verification code has been sent to your email! 📧");

      // Reset cooldown
      setCooldownSeconds(60);
      setCanResend(false);
      setOtp(""); // Clear current OTP input
    } catch (err: any) {
      console.error("Resend OTP failed:", err);
      const errorMessage =
        err.message || "Failed to resend code. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  // Handle back to login
  const handleBackToLogin = () => {
    navigate("/login");
  };

  if (!email || !userId) {
    return null; // Will redirect in useEffect
  }

  return (
    <AuthLayout title="Verify Your Account">
      <div className="verify-otp-container">
        {/* Info Message */}
        <div className="otp-info-message">
          {customMessage ? (
            <p className="custom-message">{customMessage}</p>
          ) : (
            <p>
              We've sent a 6-digit verification code to <strong>{email}</strong>
            </p>
          )}
          <p className="secondary-text">
            Please check your inbox and enter the code below.
          </p>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleVerify} className="otp-form">
          <OTPInput
            length={6}
            value={otp}
            onChange={setOtp}
            onComplete={handleOTPComplete}
            disabled={isVerifying}
          />

          {/* Error Message */}
          {error && (
            <div className="error-message-box">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Verify Button */}
          <Button
            type="submit"
            variant="primary"
            disabled={otp.length !== 6 || isVerifying}
            className="verify-button"
          >
            {isVerifying ? (
              <>
                <span className="spinner"></span>
                Verifying...
              </>
            ) : (
              "Verify Account"
            )}
          </Button>
        </form>

        {/* Resend OTP Section */}
        <div className="resend-section">
          <p className="resend-text">Didn't receive the code?</p>

          {canResend ? (
            <button
              onClick={handleResendOTP}
              disabled={isResending}
              className="resend-button"
            >
              {isResending ? "Sending..." : "Resend Code"}
            </button>
          ) : (
            <p className="cooldown-text">
              Resend code in{" "}
              <span className="countdown">{cooldownSeconds}s</span>
            </p>
          )}
        </div>

        {/* Back to Login */}
        <div className="back-to-login">
          <button onClick={handleBackToLogin} className="text-button">
            ← Back to Login
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyOTPPage;
