const crypto = require("crypto");
const bcrypt = require("bcryptjs"); // Added missing import
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const ServiceProvider = require("../models/ServiceProvider");

// Email configuration (singleton pattern for better performance)
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: "Gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Add additional security options
    secure: true,
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Enhanced validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Use findOne instead of findByEmail (more standard)
    const provider = await ServiceProvider.findOne({
      email: email.toLowerCase().trim(),
    });

    // Security: Don't reveal if email exists or not
    // Always return success to prevent email enumeration attacks
    if (!provider) {
      return res.json({
        success: true,
        message:
          "If an account with that email exists, a reset link has been sent",
      });
    }

    // Check if reset was recently requested (rate limiting)
    const recentReset =
      provider.passwordResetExpires &&
      provider.passwordResetExpires > Date.now() - 5 * 60 * 1000; // 5 minutes

    if (recentReset) {
      return res.status(429).json({
        success: false,
        message:
          "Password reset already requested. Please check your email or try again in 5 minutes",
      });
    }

    // Generate secure token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token and expiry (30 minutes instead of 15 for better UX)
    provider.passwordResetToken = hashedToken;
    provider.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    await provider.save({ validateBeforeSave: false });

    // Build reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Enhanced email template
    const transporter = createTransporter();
    const mailOptions = {
      from: `"ServiceGuru Support" <${process.env.SMTP_USER}>`,
      to: provider.email,
      subject: "Password Reset Request - ServiceGuru",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { 
              display: inline-block; 
              background-color: #007bff; 
              color: white; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
            }
            .footer { padding: 20px; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>ServiceGuru</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello ${provider.name || "User"},</p>
              <p>We received a request to reset your password for your ServiceGuru account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p>Or copy and paste this link in your browser:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <p><strong>This link will expire in 30 minutes.</strong></p>
              <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 ServiceGuru. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      // Add plain text version for better compatibility
      text: `
        Hello ${provider.name || "User"},
        
        We received a request to reset your password for your ServiceGuru account.
        
        Please visit the following link to reset your password:
        ${resetUrl}
        
        This link will expire in 30 minutes.
        
        If you didn't request this password reset, please ignore this email.
        
        Best regards,
        ServiceGuru Team
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message:
        "If an account with that email exists, a reset link has been sent",
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);

    // Clean up on error
    if (req.body.email) {
      try {
        await ServiceProvider.updateOne(
          { email: req.body.email.toLowerCase().trim() },
          {
            $unset: {
              passwordResetToken: 1,
              passwordResetExpires: 1,
            },
          }
        );
      } catch (cleanupErr) {
        console.error("Cleanup Error:", cleanupErr);
      }
    }

    // Handle specific errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided",
      });
    }

    res.status(500).json({
      success: false,
      message:
        "Unable to process password reset request. Please try again later.",
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    // Enhanced validation
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    // Password confirmation check
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Password strength validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Additional password strength checks
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find provider with valid token
    const provider = await ServiceProvider.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!provider) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired",
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset fields
    provider.password = hashedPassword;
    provider.passwordResetToken = undefined;
    provider.passwordResetExpires = undefined;

    // Optional: Update password changed timestamp
    provider.passwordChangedAt = new Date();

    await provider.save();

    // Optional: Send confirmation email
    try {
      const transporter = createTransporter();
      const confirmationEmail = {
        from: `"ServiceGuru Security" <${process.env.SMTP_USER}>`,
        to: provider.email,
        subject: "Password Successfully Reset - ServiceGuru",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Successful</h2>
            <p>Hello ${provider.name || "User"},</p>
            <p>Your password has been successfully reset for your ServiceGuru account.</p>
            <p>If you did not make this change, please contact our support team immediately.</p>
            <p>For security reasons, you may need to log in again on all your devices.</p>
            <p>Best regards,<br>ServiceGuru Security Team</p>
          </div>
        `,
      };

      await transporter.sendMail(confirmationEmail);
    } catch (emailErr) {
      console.error("Confirmation email error:", emailErr);
      // Don't fail the request if confirmation email fails
    }

    res.json({
      success: true,
      message:
        "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (err) {
    console.error("Reset Password Error:", err);

    // Handle specific MongoDB errors
    if (err.name === "ValidationError") {
      const validationErrors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid token format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to reset password. Please try again later.",
    });
  }
};

// Optional: Utility function to check if password reset is available
exports.checkResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const provider = await ServiceProvider.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!provider) {
      return res.status(400).json({
        success: false,
        message: "Token is invalid or has expired",
      });
    }

    res.json({
      success: true,
      message: "Token is valid",
      expiresAt: provider.passwordResetExpires,
    });
  } catch (err) {
    console.error("Check Reset Token Error:", err);
    res.status(500).json({
      success: false,
      message: "Unable to verify token",
    });
  }
};
