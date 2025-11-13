import bcrypt from "bcryptjs";

// Số vòng lặp (salt rounds), 10 hoặc 12 là tiêu chuẩn
const saltRounds = 10;

/**
 * Băm mật khẩu
 * @param {string} password - Mật khẩu gốc
 * @returns {Promise<string>} - Mật khẩu đã băm
 */
export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

/**
 * So sánh mật khẩu
 * @param {string} password - Mật khẩu gốc (từ req.body)
 * @param {string} hashedPassword - Mật khẩu đã băm (từ CSDL)
 * @returns {Promise<boolean>} - True nếu khớp
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
) => {
  return bcrypt.compare(password, hashedPassword);
};
