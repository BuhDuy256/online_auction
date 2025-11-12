import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Component gác cổng cho các route chỉ dành cho khách (chưa login).
 * Ví dụ: Trang Login, Register.
 * Nếu người dùng đã đăng nhập, điều hướng họ về trang chủ "/".
 */
const PublicOnlyRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Nếu đang kiểm tra token, hiển thị loading
  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  // Nếu kiểm tra xong và *đã* đăng nhập
  if (isAuthenticated) {
    // Điều hướng về trang chủ
    return <Navigate to="/" replace />;
  }

  // Nếu chưa đăng nhập, cho phép render component con (Login/Register)
  return <Outlet />;
};

export default PublicOnlyRoute;
