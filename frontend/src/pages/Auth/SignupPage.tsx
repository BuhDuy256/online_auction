import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "react-toastify";
import AuthLayout from "../../layouts/AuthLayout"; // 1. Import layout
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import "./AuthForms.css"; // 7. Import common CSS
import { useAuth } from "../../hooks/useAuth";

// 2. Get Site Key
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export default function SignupPage() {
  const navigate = useNavigate();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { signup } = useAuth();

  // 3. Update state according to new schema
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "", // Still needed for UI validation
    address: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 4. Get reCAPTCHA token
    const recaptchaToken = recaptchaRef.current?.getValue();

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (!recaptchaToken) {
      setError("Please complete the reCAPTCHA.");
      setIsLoading(false);
      return;
    }

    try {
      // 5. Prepare data, remove 'confirm_password'
      const { confirm_password, ...signupData } = formData;

      // 6. Send new payload, including token
      const response = await signup({
        ...signupData,
        recaptchaToken,
      });

      const newUserData = response.data;

      toast.success(
        newUserData.message || "Account created! Please verify your email."
      );

      // Navigate to OTP verification page with email
      navigate("/verify-otp", {
        state: {
          email: newUserData.email,
          user_id: newUserData.id,
          message: "Account created successfully! Please verify your email.",
        },
      });
    } catch (err: any) {
      setError(err.message || "Signup failed.");
      recaptchaRef.current?.reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 7. Use AuthLayout
    <AuthLayout title="Sign up for Auctionary">
      <form className="auth-form" onSubmit={handleSignup}>
        {/* 8. Update fields according to new schema */}
        <Input
          name="full_name"
          placeholder="Full Name"
          value={formData.full_name}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        <Input
          type="password"
          name="password"
          placeholder="Password (min 8 characters)"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        <Input
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
          value={formData.confirm_password}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        <Input
          name="address"
          placeholder="Address (Optional)"
          value={formData.address}
          onChange={handleChange}
          disabled={isLoading}
        />

        <div className="recaptcha-container">
          <ReCAPTCHA ref={recaptchaRef} sitekey={RECAPTCHA_SITE_KEY} />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <div className="button-group">
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Signing up...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </div>
      </form>

      <Button
        variant="secondary"
        onClick={() => navigate("/login")}
        disabled={isLoading}
        className="switch-auth-button"
      >
        Already have an account? Log In
      </Button>
    </AuthLayout>
  );
}
