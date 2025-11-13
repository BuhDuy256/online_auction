import jwt from "jsonwebtoken";

/**
 * Tạo Access Token (sống ngắn)
 * @param {object} user - Payload chứa thông tin user (ví dụ: { id, username })
 */
export const generateAccessToken = (user: any) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_ACCESS_SECRET as any,
    { expiresIn: "15m" } // 15 phút
  );
};

/**
 * Tạo Refresh Token (sống dài)
 * @param {object} user - Payload chỉ cần ID
 */
export const generateRefreshToken = (user: any) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET as any,
    { expiresIn: "7d" } // 7 ngày
  );
};

/**
 * (Tùy chọn, dùng sau) Xác thực Refresh Token
 */
export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET as any);
  } catch (error) {
    return null;
  }
};
