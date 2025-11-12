import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";

// Import trang template
import NotFoundPage from "../pages/NotFoundPage";

// (Import các page thật của bạn ở đây khi code)
// import HomePage from "../pages/HomePage";
// import LoginPage from "../pages/LoginPage";
// import RegisterPage from "../pages/RegisterPage";
// import ProfilePage from "../pages/ProfilePage";

/**
 * Nơi định nghĩa tất cả các tuyến đường của ứng dụng
 */
const AppRouter = () => {
  return (
    <Routes>
      {/* ============================================== */}
      {/* TUYẾN ĐƯỜNG CÔNG KHAI */}
      {/* ============================================== */}

      {/* Tương lai: Thay thế bằng <HomePage /> */}
      <Route path="/" element={<NotFoundPage />} />

      {/* Tương lai:
      <Route path="/auction/:id" element={<AuctionDetailPage />} /> 
      */}

      {/* ============================================== */}
      {/* TUYẾN ĐƯỜNG CÔNG KHAI (CHỈ CHO KHÁCH) */}
      {/* ============================================== */}
      <Route element={<PublicOnlyRoute />}>
        {/* Tương lai: Thay thế bằng <LoginPage /> */}
        <Route path="/login" element={<NotFoundPage />} />
        {/* Tương lai: Thay thế bằng <RegisterPage /> */}
        <Route path="/register" element={<NotFoundPage />} />
      </Route>

      {/* ============================================== */}
      {/* TUYẾN ĐƯỜG ĐƯỢC BẢO VỆ (PHẢI LOGIN) */}
      {/* ============================================== */}
      <Route element={<ProtectedRoute />}>
        {/* Tương lai: Thay thế bằng <ProfilePage /> */}
        <Route path="/profile" element={<NotFoundPage />} />

        {/* Tương lai: 
        <Route path="/create-auction" element={<CreateAuctionPage />} /> 
        */}
      </Route>

      {/* ============================================== */}
      {/* TUYẾN ĐƯỜNG 404 (BẮT TẤT CẢ) */}
      {/* ============================================== */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
