import axios from "axios";

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

interface RecaptchaV2Response {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  "error-codes"?: string[];
}

export const verifyRecaptchaV2 = async (
  token: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    if (!RECAPTCHA_SECRET_KEY) {
      console.warn(
        "RECAPTCHA_SECRET_KEY not configured, skipping verification"
      );
      return { success: true };
    }

    if (!token) {
      return {
        success: false,
        message: "reCAPTCHA token is required",
      };
    }

    const response = await axios.post<RecaptchaV2Response>(
      RECAPTCHA_VERIFY_URL,
      null,
      {
        params: {
          secret: RECAPTCHA_SECRET_KEY,
          response: token,
        },
      }
    );

    const data = response.data;

    // Check if verification was successful
    if (!data.success) {
      const errorCodes = data["error-codes"] || [];
      let message = "reCAPTCHA verification failed";

      if (errorCodes.includes("timeout-or-duplicate")) {
        message =
          "reCAPTCHA token has expired or already been used. Please try again.";
      } else if (errorCodes.includes("invalid-input-response")) {
        message = "Invalid reCAPTCHA token. Please try again.";
      } else if (errorCodes.length > 0) {
        message = `reCAPTCHA error: ${errorCodes.join(", ")}`;
      }

      return {
        success: false,
        message,
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("reCAPTCHA verification error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to verify reCAPTCHA",
    };
  }
};
