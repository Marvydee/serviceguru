const bcrypt = require("bcryptjs");
const ServiceProvider = require("../models/ServiceProvider");

// Validation helper functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const validateCoordinates = (longitude, latitude) => {
  return (
    typeof longitude === "number" &&
    typeof latitude === "number" &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  );
};

exports.registerProvider = async (req, res) => {
  try {
    const {
      name,
      phone,
      service,
      email,
      password,
      latitude,
      longitude,
      bio,
      website,
    } = req.body;

    // Input validation
    const requiredFields = {
      name,
      phone,
      service,
      email,
      password,
      latitude,
      longitude,
    };
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missingFields,
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate phone format
    if (!validatePhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format",
      });
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
      });
    }

    // Validate coordinates
    const numLatitude = parseFloat(latitude);
    const numLongitude = parseFloat(longitude);

    if (!validateCoordinates(numLongitude, numLatitude)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90",
      });
    }

    // Validate website URL if provided
    if (website) {
      try {
        new URL(website);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid website URL format",
        });
      }
    }

    // Sanitize inputs
    const sanitizedData = {
      name: name.trim(),
      phone: phone.trim(),
      service: service.trim(),
      email: email.toLowerCase().trim(),
      bio: bio ? bio.trim() : undefined,
      website: website ? website.trim() : undefined,
    };

    // Check if email already exists
    const existingProvider = await ServiceProvider.findOne({
      email: sanitizedData.email,
    });

    if (existingProvider) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Check if phone already exists (optional - depending on business requirements)
    const existingPhone = await ServiceProvider.findOne({
      phone: sanitizedData.phone,
    });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    // Hash password with higher salt rounds for better security
    const hashedPassword = await bcrypt.hash(password, 12);

    // Handle file uploads if present
    let photos = [];
    if (req.files && req.files.length > 0) {
      photos = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    // Generate email verification token
    const emailVerificationToken = generateVerificationToken();

    // Create new provider with geolocation
    const providerData = {
      ...sanitizedData,
      password: hashedPassword,
      photos,
      geoLocation: {
        type: "Point",
        coordinates: [numLongitude, numLatitude],
      },
      emailVerified: false,
      emailVerificationToken,
      emailVerificationTokenCreatedAt: Date.now(),
    };

    const provider = new ServiceProvider(providerData);
    await provider.save();

    // Send verification email
    try {
      await sendVerificationEmail(
        sanitizedData.email,
        sanitizedData.name,
        emailVerificationToken
      );
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails, just log the error
    }

    // Remove sensitive fields from response
    const {
      password: _,
      emailVerificationToken: __,
      ...providerResponse
    } = provider.toObject();

    res.status(201).json({
      success: true,
      message:
        "Service provider registered successfully. Please check your email to verify your account.",
      provider: providerResponse,
    });
  } catch (err) {
    console.error("Register Provider Error:", err);

    // Handle specific MongoDB errors
    if (err.name === "ValidationError") {
      const validationErrors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${duplicateField} already exists`,
        field: duplicateField,
      });
    }

    // Handle bcrypt errors
    if (err.message.includes("bcrypt") || err.message.includes("hash")) {
      return res.status(500).json({
        success: false,
        message: "Error processing password",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Email transporter configuration
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Send verification email
const sendVerificationEmail = async (email, name, verificationToken) => {
  const transporter = createEmailTransporter();

  const verificationUrl = `${
    process.env.FRONTEND_URL
  }/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: `"${process.env.APP_NAME || "Service Provider App"}" <${
      process.env.SMTP_FROM || process.env.SMTP_USER
    }>`,
    to: email,
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome ${name}!</h2>
        <p>Thank you for registering as a service provider. Please verify your email address to complete your registration.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${verificationUrl}">${verificationUrl}</a>
        </p>
        <p style="color: #666; font-size: 12px;">
          This verification link will expire in 24 hours. If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Email verification endpoint
exports.verifyEmail = async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({
        success: false,
        message: "Email and verification token are required",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const provider = await ServiceProvider.findOne({
      email: email.toLowerCase().trim(),
      emailVerificationToken: token,
    });

    if (!provider) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token or email",
      });
    }

    // Check if token has expired (24 hours)
    const tokenAge = Date.now() - provider.emailVerificationTokenCreatedAt;
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (tokenAge > twentyFourHours) {
      return res.status(400).json({
        success: false,
        message: "Verification token has expired. Please request a new one.",
      });
    }

    // Update provider as verified
    await ServiceProvider.findByIdAndUpdate(provider._id, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenCreatedAt: null,
      emailVerifiedAt: new Date(),
    });

    res.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (err) {
    console.error("Email Verification Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Resend verification email endpoint
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    const provider = await ServiceProvider.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    if (provider.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Check rate limiting (prevent spam)
    if (provider.emailVerificationTokenCreatedAt) {
      const timeSinceLastRequest =
        Date.now() - provider.emailVerificationTokenCreatedAt;
      const oneMinute = 60 * 1000;

      if (timeSinceLastRequest < oneMinute) {
        return res.status(429).json({
          success: false,
          message:
            "Please wait at least 1 minute before requesting another verification email",
        });
      }
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();

    // Update provider with new token
    await ServiceProvider.findByIdAndUpdate(provider._id, {
      emailVerificationToken: verificationToken,
      emailVerificationTokenCreatedAt: Date.now(),
    });

    // Send verification email
    await sendVerificationEmail(
      provider.email,
      provider.name,
      verificationToken
    );

    res.json({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (err) {
    console.error("Resend Verification Error:", err);

    if (err.message.includes("SMTP") || err.message.includes("nodemailer")) {
      return res.status(500).json({
        success: false,
        message: "Failed to send email. Please try again later.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
