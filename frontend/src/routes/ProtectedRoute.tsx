import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Component gác cổng cho các route cần đăng nhập.
 * Kiểm tra xem người dùng đã đăng nhập chưa.
 * Nếu chưa, điều hướng về /login.
 */
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Nếu đang kiểm tra token, hiển thị loading
  if (isLoading) {
    return <div>Đang tải...</div>; // Hoặc một Spinner toàn màn hình
  }

  // Nếu kiểm tra xong và *chưa* đăng nhập
  if (!isAuthenticated) {
    // Điều hướng về trang login
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập, cho phép render component con
  return <Outlet />;
};

export default ProtectedRoute;
