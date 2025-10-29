import crypto from "crypto";
import axios from "axios";
import nodemailer from "nodemailer";

// Generate OTP code
export const generateOTP = (length: number = 6): string => {
  const digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

// Generate email verification token
export const generateEmailToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

// Generate token expiration (10 minutes for OTP, 24 hours for email)
export const getTokenExpiration = (type: "otp" | "email"): Date => {
  const now = new Date();
  if (type === "otp") {
    return new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
  }
  return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
};

// Send SMS OTP using Termii API (Nigerian SMS provider)
export const sendSMSOTP = async (
  phone: string,
  code: string
): Promise<boolean> => {
  try {
    // Clean phone number (remove spaces, dashes, +)
    const cleanPhone = phone.replace(/[\s\-+]/g, "");

    // Format for Termii (ensure it's in international format)
    let formattedPhone = cleanPhone;
    if (!cleanPhone.startsWith("234")) {
      // If starts with 0, replace with 234
      if (cleanPhone.startsWith("0")) {
        formattedPhone = "234" + cleanPhone.substring(1);
      } else {
        formattedPhone = "234" + cleanPhone;
      }
    }

    const termiiApiKey = process.env.TERMII_API_KEY;
    const termiiSenderId = process.env.TERMII_SENDER_ID || "TajaShop";

    if (!termiiApiKey) {
      // Fallback to console log if API key not configured
      console.log(
        `[SMS OTP] Code ${code} for ${phone} (Termii API key not configured)`
      );
      return true;
    }

    // Use Termii OTP API (recommended for verification)
    const response = await axios.post(
      "https://api.termii.com/api/sms/otp/send",
      {
        api_key: termiiApiKey,
        message_type: "NUMERIC",
        to: formattedPhone,
        from: termiiSenderId,
        channel: "generic",
        pin_attempts: 3,
        pin_time_to_live: 10, // minutes
        pin_length: 6,
        pin_placeholder: code,
        message_text: `Your Taja.Shop verification code is: ${code}. Valid for 10 minutes.`,
      }
    );

    if (response.data.code === "ok") {
      console.log(`[SMS] OTP sent successfully to ${formattedPhone}`);
      return true;
    } else {
      console.error(`[SMS] Failed to send OTP:`, response.data);
      return false;
    }
  } catch (error: any) {
    console.error(`[SMS] Error sending OTP to ${phone}:`, error.message);
    // Log OTP for development/testing
    console.log(`[DEV] OTP Code for ${phone}: ${code}`);
    // Return true to not block registration in dev
    return process.env.NODE_ENV === "production" ? false : true;
  }
};

// Send verification email using nodemailer
export const sendVerificationEmail = async (
  email: string,
  token: string,
  name: string
): Promise<boolean> => {
  try {
    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/verify-email/${token}`;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    // Configure email transporter
    // Option 1: SMTP (Gmail, custom SMTP)
    let transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      // Use SMTP configuration
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    } else {
      // Development fallback - log email
      console.log(`[EMAIL] Verification email for ${email}`);
      console.log(`Verification URL: ${verificationUrl}`);
      return true;
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - Taja.Shop</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Welcome to Taja.Shop!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #1F2937; margin-top: 0;">Hi ${name}!</h2>
    
    <p style="color: #4B5563; font-size: 16px;">
      Thank you for joining Taja.Shop! To get started, please verify your email address by clicking the button below:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" 
         style="background-color: #10B981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px;">
        Verify Email Address
      </a>
    </div>
    
    <p style="color: #6B7280; font-size: 14px; margin-top: 30px;">
      Or copy and paste this link into your browser:
    </p>
    <p style="color: #10B981; font-size: 12px; word-break: break-all; background: #F3F4F6; padding: 10px; border-radius: 4px;">
      ${verificationUrl}
    </p>
    
    <p style="color: #9CA3AF; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
      This verification link will expire in 24 hours. If you didn't create an account with Taja.Shop, please ignore this email.
    </p>
    
    <p style="color: #9CA3AF; font-size: 12px; margin-top: 20px;">
      Need help? Contact us at <a href="mailto:support@taja.shop" style="color: #10B981;">support@taja.shop</a>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #9CA3AF; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} Taja.Shop. All rights reserved.</p>
    <p>From WhatsApp chaos to your own shop 🛍️</p>
  </div>
</body>
</html>
    `;

    const mailOptions = {
      from: `"Taja.Shop" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify Your Taja.Shop Email Address",
      html: emailHtml,
      text: `Welcome to Taja.Shop, ${name}!\n\nPlease verify your email by clicking this link:\n${verificationUrl}\n\nThis link expires in 24 hours.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Verification email sent to ${email}:`, info.messageId);
    return true;
  } catch (error: any) {
    console.error(
      `[EMAIL] Error sending verification email to ${email}:`,
      error.message
    );
    // Log for development
    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/verify-email/${token}`;
    console.log(`[DEV] Verification URL for ${email}: ${verificationUrl}`);
    // Return true to not block registration in dev
    return process.env.NODE_ENV === "production" ? false : true;
  }
};
