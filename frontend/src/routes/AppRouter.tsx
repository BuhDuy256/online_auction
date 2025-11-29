import { Routes, Route } from "react-router-dom";

// 1. Import các "gác cổng"
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";

// 2. Import các vai trò (ROLES)
import { ROLES } from "../constants/roles";

// 3. Import các trang
import UnderDevelopmentPage from "../pages/Error/UnderDevelopmentPage";
import UnauthorizedPage from "../pages/Error/Forbidden";
import NotFoundPage from "../pages/Error/NotFoundPage";
import SignupPage from "../pages/Auth/SignupPage";
import LoginPage from "../pages/Auth/LoginPage";
import VerifyOTPPage from "../pages/Auth/VerifyOTPPage";
import HomePage from "../pages/Home/HomePage";
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage";
import UIKitPage from "../pages/Dev/UIKitPage";
import ProductListPage from "../pages/Product/ProductListPage";
import ProductDetailPage from "../pages/Product/ProductDetailPage";
import UserProfilePage from "../pages/Account/UserProfilePage";
import SellerDashboardPage from "../pages/Seller/SellerDashboardPage";
import TransactionRoomPage from "../pages/Product/TransactionRoomPage";
import AdminDashboardPage from "../pages/Admin/AdminDashboardPage";

const AppRouter = () => {
  return (
    <Routes>
      {/* ============================================== */}
      {/* TUYẾN ĐƯỜNG CÔNG KHAI (Guest, Bidder, Seller, Admin) */}
      {/* ============================================== */}
      <Route path="/" element={<HomePage />} />
      <Route path="/auction/:id" element={<UnderDevelopmentPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />

      {/* ============================================== */}
      {/* TUYẾN ĐƯỜNG CÔNG KHAI (DEV) */}
      {/* ============================================== */}
      <Route path="/dev/ui-kit" element={<UIKitPage />} />
      <Route path="/products" element={<ProductListPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/profile" element={<UserProfilePage />} />
      <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
      <Route path="/transaction-room" element={<TransactionRoomPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

      {/* ============================================== */}
      {/* TUYẾN ĐƯỜNG CÔNG KHAI (CHỈ CHO KHÁCH) */}
      {/* ============================================== */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />{" "}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        {/* Add this */}
      </Route>

      {/* ============================================== */}
      {/* TUYẾN ĐƯỜNG ĐƯỢC BẢO VỆ (RBAC) */}
      {/* ============================================== */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={[ROLES.BIDDER, ROLES.SELLER, ROLES.ADMIN]}
          />
        }
      >
        <Route path="/profile" element={<UnderDevelopmentPage />} />
      </Route>

      <Route
        element={<ProtectedRoute allowedRoles={[ROLES.SELLER, ROLES.ADMIN]} />}
      >
        <Route path="/my-auctions" element={<UnderDevelopmentPage />} />
        <Route path="/auctions/new" element={<UnderDevelopmentPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        {/* <Route path="/admin/dashboard" element={<UnderDevelopmentPage />} /> */}
      </Route>
    </Routes>
  );
};

export default AppRouter;
