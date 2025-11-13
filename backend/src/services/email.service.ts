import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendOTPEmail = async (
  email: string,
  otp: string,
  userName: string
) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Email Verification - OTP Code",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
          .footer { text-align: center; margin-top: 20px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Thank you for signing up. Please use the following OTP code to verify your email address:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            
            <p><strong>This code will expire in ${
              process.env.OTP_EXPIRY_MINUTES || 10
            } minutes.</strong></p>
            
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send verification email");
  }
};

export const sendWelcomeEmail = async (email: string, userName: string) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Welcome to Our Platform!",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #667eea;">Welcome ${userName}! 🎉</h1>
          <p>Your email has been successfully verified!</p>
          <p>You can now enjoy all features of our platform.</p>
          <p>Thank you for joining us!</p>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
