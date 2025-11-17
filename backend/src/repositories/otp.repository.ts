import prisma from "../database/prisma";
import { otp_purpose_enum } from "@prisma/client"; // Import enum từ Prisma

/**
 * Tạo một OTP mới trong bảng user_otps.
 * Nó sẽ tự động VÔ HIỆU HÓA các OTP cũ cùng mục đích (purpose)
 * @param userId - ID của người dùng
 * @param otp - Mã OTP (chuỗi 6 số)
 * @param expiresAt - Thời gian hết hạn
 * @param purpose - 'signup' hoặc 'reset_password'
 */
export const createOTP = async (
  userId: number,
  otp: string,
  expiresAt: Date,
  purpose: otp_purpose_enum
) => {
  // Bước 1: Vô hiệu hóa (đánh dấu đã dùng) tất cả OTP cũ CÙNG MỤC ĐÍCH
  // Việc này để đảm bảo chỉ có 1 OTP active cho mỗi 'purpose'
  await prisma.user_otps.updateMany({
    where: {
      user_id: userId,
      purpose: purpose,
      consumed_at: null, // Chỉ vô hiệu hóa các OTP đang active
    },
    data: {
      consumed_at: new Date(), // Đánh dấu là đã "tiêu thụ"
    },
  });

  // Bước 2: Tạo OTP mới
  return prisma.user_otps.create({
    data: {
      user_id: userId,
      otp_code: otp, // Lưu mã OTP (chưa hash)
      purpose: purpose,
      expires_at: expiresAt,
      created_at: new Date(),
      consumed_at: null, // Đảm bảo nó là active
    },
  });
};

/**
 * Tìm một OTP hợp lệ (chưa dùng, chưa hết hạn, đúng mục đích)
 * @param userId - ID của người dùng
 * @param otp - Mã OTP (chuỗi 6 số)
 * @param purpose - 'signup' hoặc 'reset_password'
 */
export const findValidOTP = async (
  userId: number,
  otp: string,
  purpose: otp_purpose_enum
) => {
  return prisma.user_otps.findFirst({
    where: {
      user_id: userId,
      otp_code: otp,
      purpose: purpose,
      consumed_at: null, // Phải chưa được sử dụng
      expires_at: {
        gt: new Date(), // Phải còn hạn (lớn hơn thời gian hiện tại)
      },
    },
    orderBy: {
      created_at: "desc", // Lấy cái mới nhất
    },
  });
};

/**
 * Đánh dấu một OTP là đã sử dụng (consumed)
 * @param otpId - ID của bản ghi OTP (từ 'otp_id' trong schema)
 */
export const markOTPAsUsed = async (otpId: number) => {
  return prisma.user_otps.update({
    where: { otp_id: otpId },
    data: { consumed_at: new Date() },
  });
};

/**
 * Xóa TẤT CẢ OTP của một người dùng (dọn dẹp)
 * @param userId - ID của người dùng
 */
export const deleteUserOTPs = async (userId: number) => {
  return prisma.user_otps.deleteMany({
    where: { user_id: userId },
  });
};
