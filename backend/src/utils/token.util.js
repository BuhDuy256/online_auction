import jwt from "jsonwebtoken";

/**
 * Tạo Access Token (sống ngắn)
 * @param {object} user - Payload chứa thông tin user (ví dụ: { id, username })
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" } // 15 phút
  );
};

/**
 * Tạo Refresh Token (sống dài)
 * @param {object} user - Payload chỉ cần ID
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" } // 7 ngày
  );
};

/**
 * (Tùy chọn, dùng sau) Xác thực Refresh Token
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};
