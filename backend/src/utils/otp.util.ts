import crypto from "crypto";

export const generateOTP = (length: number = 6): string => {
  const digits = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length);
    otp += digits[randomIndex];
  }

  return otp;
};

export const isOTPExpired = (createdAt: Date): boolean => {
  const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || "10");
  const expiryTime = new Date(createdAt.getTime() + expiryMinutes * 60000);
  return new Date() > expiryTime;
};
