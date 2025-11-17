import { Routes, Route } from "react-router-dom";

// 1. Import các "gác cổng"
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";

// 2. Import các vai trò (ROLES)
import { ROLES } from "../constants/roles";

// 3. Import các trang
import UnderDevelopmentPage from "../pages/UnderDevelopmentPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import NotFoundPage from "../pages/NotFoundPage";
import SignupPage from "../pages/Auth/SignupPage";
import LoginPage from "../pages/Auth/LoginPage";
import VerifyOTPPage from "../pages/Auth/VerifyOTPPage"; // Add this

const AppRouter = () => {
  return (
    <Routes>
      {/* ============================================== */}
      {/* TUYẾN ĐƯỜNG CÔNG KHAI (Guest, Bidder, Seller, Admin) */}
      {/* ============================================== */}
      <Route path="/" element={<UnderDevelopmentPage />} />
      <Route path="/auction/:id" element={<UnderDevelopmentPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />

      {/* ============================================== */}
      {/* TUYẾN ĐƯỜNG CÔNG KHAI (CHỈ CHO KHÁCH) */}
      {/* ============================================== */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />{" "}
        {/* Add this */}
      </Route>

      {/* ============================================== */}
      {/* TUYẾN ĐƯỜG ĐƯỢC BẢO VỆ (RBAC) */}
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
        <Route path="/admin/dashboard" element={<UnderDevelopmentPage />} />
        <Route path="/admin/users" element={<UnderDevelopmentPage />} />
        <Route path="/admin/categories" element={<UnderDevelopmentPage />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
