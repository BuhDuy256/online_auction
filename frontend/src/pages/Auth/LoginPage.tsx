import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "react-toastify";
import AuthLayout from "../../layouts/AuthLayout"; // 1. Import layout
import Button from "../../components/ui/Button"; // Assuming Button/Input are in ui/
import Input from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth"; // Assuming hook is in contexts/
import "./AuthForms.css"; // 7. Import common CSS for forms
import { useGoogleLogin } from "@react-oauth/google";
import FacebookLogin from "@greatsumini/react-facebook-login";

// 2. Get Site Key from .env (Vite)
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;

export default function LoginPage() {
  const navigate = useNavigate();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { login, loginWithGoogle, loginWithFacebook } = useAuth();

  // 3. Update state according to schema: username -> email
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Get reCAPTCHA token
    const recaptchaToken = recaptchaRef.current?.getValue();
    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA.");
      setIsLoading(false);
      return;
    }

    try {
      // Call login with the new schema
      const response = await login(email, password, recaptchaToken);

      // Check if user requires verification
      if (response.data.requiresVerification) {
        toast.error("Please verify your account first.");
        navigate("/verify-otp", {
          state: {
            email: email,
            userId: response.data.user.id, // Pass userId for OTP verification
            message:
              "Your account is not verified. A new verification code has been sent to your email.",
          },
        });
        return;
      }

      // Verified user - save token and login
      localStorage.setItem("token", response.data.accessToken);

      try {
        toast.success("Welcome back!");
        navigate("/");
      } catch (error) {
        console.error("Failed to fetch user data after login:", error);
        toast.error("Login succeeded but failed to verify user.");
      }
    } catch (err: any) {
      setError(err.message || "Login failed.");
      recaptchaRef.current?.reset();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    flow: "auth-code", // <--- THAY ĐỔI QUAN TRỌNG NHẤT
    onSuccess: async (codeResponse) => {
      try {
        setIsLoading(true);
        await loginWithGoogle(codeResponse.code);

        toast.success("Login with Google successful!");
        navigate("/");
      } catch (err: any) {
        setError(err.message || "Google login failed.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error("Google login failed.");
    },
  });

  const responseFacebook = async (response: any) => {
    if (response.accessToken) {
      try {
        setIsLoading(true);
        // Gửi Token xuống Backend
        await loginWithFacebook(response.accessToken);

        toast.success("Login with Facebook successful!");
        navigate("/");
      } catch (err: any) {
        console.error("FB Login Failed:", err);
        toast.error("Facebook login failed.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // User hủy login hoặc lỗi
      console.log("FB Login cancelled or failed");
    }
  };

  return (
    // 6. Use AuthLayout, pass in the title
    <AuthLayout title="Log in to Auctionary">
      <form className="auth-form" onSubmit={handleLogin}>
        <Input
          type="email" // 3. Update
          placeholder="Email" // 3. Update
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />

        <div className="recaptcha-container">
          <ReCAPTCHA
            theme="dark"
            ref={recaptchaRef}
            sitekey={RECAPTCHA_SITE_KEY}
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <div className="button-group">
          <Button
            type="submit"
            variant="default"
            isLoading={isLoading}
            size="lg"
          >
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
        </div>
      </form>
      <Button
        variant="secondary"
        size="lg"
        onClick={() => navigate("/signup")}
        disabled={isLoading}
        className="switch-auth-button"
      >
        Don't have an account? Sign Up
      </Button>
      <a
        href="#"
        className="auth-link" // 7. Use common CSS class
        onClick={(e) => {
          e.preventDefault();
          navigate("/forgot-password");
        }}
      >
        Forgot password?
      </a>
      <div className="divider">
        <span>OR Continue with</span>
      </div>
      <div className="social-button-group">
        <Button
          variant="secondary"
          onClick={() => handleGoogleLogin()} // Gọi hàm của hook
          disabled={isLoading}
        >
          <img
            src="/assets/Google__G__logo.svg.webp"
            alt="G"
            style={{ width: 18, height: 18, marginRight: 8 }}
          />
          Google
        </Button>
        <div style={{ marginTop: "8px" }}></div> {/* Khoảng cách */}
        {/* NÚT FACEBOOK */}
        <FacebookLogin
          appId={FACEBOOK_APP_ID}
          onSuccess={responseFacebook}
          onFail={(error) => {
            console.log("FB Login Failed:", error);
            toast.error("Facebook login failed.");
          }}
          render={({ onClick, logout }) => (
            <Button variant="secondary" onClick={onClick} disabled={isLoading}>
              <img
                src="/assets/2023_Facebook_icon.svg.png"
                alt="F"
                style={{ width: 18, height: 18, marginRight: 8 }}
              />
              <span>Facebook</span>
            </Button>
          )}
        />
      </div>
    </AuthLayout>
  );
}
