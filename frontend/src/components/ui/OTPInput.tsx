import React, {
  useRef,
  useState,
  useEffect,
  KeyboardEvent,
  ClipboardEvent,
} from "react";
import "./OTPInput.css"; // Đảm bảo bạn đã import file CSS

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onComplete?: (value: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
  onComplete,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 1. Khởi tạo mảng bằng KHOẢNG TRẮNG
  const [otp, setOtp] = useState<string[]>(Array(length).fill(" ")); // Update internal state when value prop changes

  useEffect(() => {
    // 2. SỬA LỖI LOGIC: Dùng " " (khoảng trắng) để đệm.
    // Điều này sẽ tạo ra mảng 6 phần tử
    const newOtp = value.padEnd(length, " ").slice(0, length).split("");
    setOtp(newOtp);
  }, [value, length]); // Kích hoạt lại useEffect // Handle input change

  const handleChange = (index: number, digit: string) => {
    if (disabled) return;

    // Chỉ cho phép 1 chữ số cuối cùng
    const finalDigit = digit.length > 1 ? digit.slice(-1) : digit;
    if (finalDigit && !/^\d$/.test(finalDigit)) return;

    const newOtp = [...otp];
    // Nếu người dùng nhập số, điền, nếu không (xóa) thì điền khoảng trắng
    newOtp[index] = finalDigit || " ";
    setOtp(newOtp);

    // Dùng trim() để xóa khoảng trắng khi gửi đi
    const otpString = newOtp.join("").trim();
    onChange(otpString); // Auto-focus next input

    if (finalDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    } // Call onComplete if all digits are filled

    if (otpString.length === length) {
      onComplete?.(otpString);
    }
  }; // 3. SỬA LỖI BACKSPACE: Logic xóa dây chuyền mượt hơn

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault(); // Ngăn trình duyệt tự động lùi trang

      if (otp[index] !== " ") {
        // 1. Nếu ô hiện tại CÓ SỐ: Chỉ xóa nó (thành khoảng trắng)
        handleChange(index, " ");
      } else if (index > 0) {
        // 2. Nếu ô hiện tại RỖNG: Di chuyển và xóa ô TRƯỚC ĐÓ
        inputRefs.current[index - 1]?.focus();
        handleChange(index - 1, " ");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }; // Handle paste (cập nhật để dùng khoảng trắng)

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, length).split("");
    const newOtp = Array(length).fill(" "); // Khởi tạo bằng khoảng trắng

    digits.forEach((digit, index) => {
      if (index < length) {
        newOtp[index] = digit;
      }
    });

    setOtp(newOtp);
    const otpString = newOtp.join("").trim();
    onChange(otpString);

    const nextEmptyIndex = newOtp.findIndex((digit) => digit === " ");
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();

    if (otpString.length === length) {
      onComplete?.(otpString);
    }
  }; // Focus first input on mount

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="otp-input-container">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit.trim()} // Dùng trim() để hiển thị (loại bỏ khoảng trắng)
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          disabled={disabled}
          className={`otp-input ${digit.trim() ? "filled" : ""} ${
            disabled ? "disabled" : ""
          }`}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OTPInput;
