import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthLayout.css"; // We'll create this next

// This layout receives a title and 'children' (which is your form)
interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, children }) => {
  const navigate = useNavigate();

  // General effect: Add 'no-scroll' class to the body
  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  return (
    <div className="auth-page-container">
      <main className="auth-main-content">
        <div className="auth-box">
          <img
            src="/assets/auctionary_logo.png" // Change logo here
            alt="Auctionary Logo"
            className="auth-logo"
          />
          <h1 className="auth-title">{title}</h1>

          {/* Form content (Login or Signup) will be injected here */}
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
