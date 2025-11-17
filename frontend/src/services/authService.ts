import apiClient from "./apiClient";

// --- NEW ---
// Define the shape of signup data based on your schema
// This matches the interface in AuthContext
export interface SignupData {
  full_name: string;
  email: string;
  password: string;
  address?: string;
  recaptchaToken: string;
}

/**
 * Handles the login API call.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @param {string} recaptchaToken - The token from reCAPTCHA.
 * @returns {Promise<object>} The user data and token.
 * @throws {Error} If login fails.
 */
export const login = async (
  email: string,
  password: string,
  recaptchaToken: string
) => {
  // POST /auth/login, sends the new body, no auth required
  // This will return { access_token: "..." }
  return apiClient.post(
    "/auth/login",
    { email, password, recaptchaToken },
    false
  );
};

/**
 * Handles the signup API call.
 * @param {SignupData} signupData - An object matching the SignupData interface.
 * @returns {Promise<object>} The success message or data.
 * @throws {Error} If signup fails.
 */
export const signup = async (signupData: SignupData) => {
  // apiService.post(endpoint, body, requiresAuth)
  // The body now matches the new schema
  return apiClient.post("/auth/signup", signupData, false);
};

/**
 * Verifies the token from localStorage and returns user data.
 * @returns {Promise<object>} The user data.
 * @throws {Error} If token is invalid or request fails.
 */
export const getMe = async () => {
  // GET /auth/me, no body, *auth is required*
  return apiClient.get("/auth/me", true);
};

/**
 * Logs the user out on the server and clears local token.
 */
export const logout = async () => {
  try {
    // POST /auth/logout, no body, *auth is required*
    // This invalidates the token on the server
    await apiClient.post("/auth/logout", {}, true);
  } catch (error) {
    // Log the error but proceed to clear local data
    console.error("Server logout failed, clearing local token anyway:", error);
  } finally {
    // Always remove the token from local storage
    localStorage.removeItem("token");
  }
};

/**
 * Verifies the OTP code sent to user's email
 * @param {number} userId - User's ID
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<object>} Auth tokens and user data
 * @throws {Error} If verification fails
 */
export const verifyOTP = async (userId: number, otp: string) => {
  return apiClient.post("/auth/verify-otp", { user_id: userId, otp }, false);
};

/**
 * Resends OTP code to user's email
 * @param {number} userId - User's ID
 * @returns {Promise<object>} Success message
 * @throws {Error} If request fails
 */
export const resendOTP = async (userId: number) => {
  return apiClient.post("/auth/resend-otp", { user_id: userId }, false);
};
