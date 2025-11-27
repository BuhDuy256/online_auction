import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; // 1. Import hook useAuth
import "./Header.css";
import Button from "../ui/Button";

const Header: React.FC = () => {
  // 3. Lấy trạng thái xác thực, user, và hàm logout từ Context
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Xóa token và user state
    navigate("/login"); // Điều hướng về trang login
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* 4. Logo (bên trái) - Nhấn vào sẽ về trang chủ */}
        <Link to="/" className="header-logo">
          <img
            src="/assets/auctionary_logo.svg" // Bạn cần có logo ở public/assets
            alt="Auctionary Logo"
            onError={(e) =>
              (e.currentTarget.src =
                "https://placehold.co/40x40/007bff/FFF?text=A")
            }
          />
          <span>Auctionary</span>
        </Link>

        {/* 5. Điều hướng (bên phải) */}
        <nav className="header-nav">
          {isAuthenticated ? (
            // === 6. ĐÃ ĐĂNG NHẬP ===
            <div className="user-menu">
              <span className="welcome-message">
                Chào, {user?.fullName || user?.email}
              </span>
              <Button
                variant="secondary"
                className="header-button"
                onClick={() => navigate("/profile")}
              >
                View Profile
              </Button>
              <Button
                variant="secondary"
                className="header-button"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            // === 7. CHƯA ĐĂNG NHẬP (GUEST) ===
            <div className="guest-menu">
              <Button
                variant="default"
                size="md"
                className="header-button"
                onClick={() => navigate("/login")}
              >
                Log In
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="header-button"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
