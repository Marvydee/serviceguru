const bcrypt = require("bcryptjs");
const ServiceProvider = require("../models/ServiceProvider");
const { cloudinary } = require("../config/cloudinary");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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

// Helper function to delete uploaded images from Cloudinary
const deleteCloudinaryImages = async (publicIds) => {
  try {
    if (publicIds && publicIds.length > 0) {
      await cloudinary.api.delete_resources(publicIds);
    }
  } catch (error) {
    console.error("Error deleting images from Cloudinary:", error);
  }
};

// Email transporter
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send verification email
const sendVerificationEmail = async (email, name, verificationCode) => {
  const transporter = createEmailTransporter();

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
          <div style="background-color: #f8f9fa; border: 2px dashed #007bff; border-radius: 10px; padding: 20px; display: inline-block;">
            <p style="margin: 0; color: #666; font-size: 14px;">Your verification code is:</p>
            <h1 style="margin: 10px 0; color: #007bff; font-size: 32px; letter-spacing: 5px; font-weight: bold;">${verificationCode}</h1>
          </div>
        </div>
        <p style="color: #666; font-size: 14px;">
          Enter this code in the verification form to complete your registration.
        </p>
        <p style="color: #666; font-size: 12px;">
          This verification code will expire in 10 minutes. If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Generate verification code helper
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// REGISTER PROVIDER
const registerProvider = async (req, res) => {
  let uploadedImageIds = [];

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
      if (req.files && req.files.length > 0) {
        uploadedImageIds = req.files.map((file) => file.public_id);
        await deleteCloudinaryImages(uploadedImageIds);
      }

      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missingFields,
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      if (req.files && req.files.length > 0) {
        uploadedImageIds = req.files.map((file) => file.public_id);
        await deleteCloudinaryImages(uploadedImageIds);
      }

      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate phone format
    if (!validatePhone(phone)) {
      if (req.files && req.files.length > 0) {
        uploadedImageIds = req.files.map((file) => file.public_id);
        await deleteCloudinaryImages(uploadedImageIds);
      }

      return res.status(400).json({
        success: false,
        message: "Invalid phone number format",
      });
    }

    // Validate password strength
    if (!validatePassword(password)) {
      if (req.files && req.files.length > 0) {
        uploadedImageIds = req.files.map((file) => file.public_id);
        await deleteCloudinaryImages(uploadedImageIds);
      }

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
      if (req.files && req.files.length > 0) {
        uploadedImageIds = req.files.map((file) => file.public_id);
        await deleteCloudinaryImages(uploadedImageIds);
      }

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
        if (req.files && req.files.length > 0) {
          uploadedImageIds = req.files.map((file) => file.public_id);
          await deleteCloudinaryImages(uploadedImageIds);
        }

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
      if (req.files && req.files.length > 0) {
        uploadedImageIds = req.files.map((file) => file.public_id);
        await deleteCloudinaryImages(uploadedImageIds);
      }

      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Check if phone already exists
    const existingPhone = await ServiceProvider.findOne({
      phone: sanitizedData.phone,
    });

    if (existingPhone) {
      if (req.files && req.files.length > 0) {
        uploadedImageIds = req.files.map((file) => file.public_id);
        await deleteCloudinaryImages(uploadedImageIds);
      }

      return res.status(409).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Handle Cloudinary uploaded files
    let photos = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      photos = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));

      uploadedImageIds = req.files.map((file) => file.filename);
    }

    // Generate email verification code
    const emailVerificationCode = generateVerificationCode();

    console.log(
      "Generated verification code for",
      sanitizedData.email,
      ":",
      emailVerificationCode
    );

    // Create new provider
    const providerData = {
      ...sanitizedData,
      password: hashedPassword,
      geoLocation: {
        type: "Point",
        coordinates: [numLongitude, numLatitude],
      },
      emailVerified: false,
      emailVerificationCode,
      emailVerificationCodeCreatedAt: Date.now(),
    };

    if (photos.length > 0) {
      providerData.photos = photos;
    }

    const provider = new ServiceProvider(providerData);
    await provider.save();

    console.log(
      "Saved verification code to DB:",
      provider.emailVerificationCode
    );

    // Send verification email
    try {
      await sendVerificationEmail(
        sanitizedData.email,
        sanitizedData.name,
        emailVerificationCode
      );
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    // Remove sensitive fields from response
    const {
      password: _,
      emailVerificationCode: __,
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

    if (uploadedImageIds.length > 0) {
      await deleteCloudinaryImages(uploadedImageIds);
    }

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

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// VERIFY EMAIL
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    console.log("Verification request:", { email, code });

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Verification code must be 6 digits",
      });
    }

    const provider = await ServiceProvider.findOne({
      email: email.toLowerCase().trim(),
    });

    console.log("Found provider:", provider ? "Yes" : "No");

    if (!provider) {
      return res.status(400).json({
        success: false,
        message: "Email not found",
      });
    }

    console.log("Stored code:", provider.emailVerificationCode);
    console.log("Received code:", code);

    if (provider.emailVerificationCode !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    if (provider.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Check if code has expired (10 minutes)
    const codeAge = Date.now() - provider.emailVerificationCodeCreatedAt;
    const tenMinutes = 10 * 60 * 1000;

    if (codeAge > tenMinutes) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    // Update provider as verified
    await ServiceProvider.findByIdAndUpdate(provider._id, {
      emailVerified: true,
      emailVerificationCode: null,
      emailVerificationCodeCreatedAt: null,
      emailVerifiedAt: new Date(),
    });

    console.log("Email verified successfully for:", email);

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

// RESEND VERIFICATION
const resendVerification = async (req, res) => {
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

    // Check rate limiting (1 minute cooldown)
    if (provider.emailVerificationCodeCreatedAt) {
      const timeSinceLastRequest =
        Date.now() - provider.emailVerificationCodeCreatedAt;
      const oneMinute = 60 * 1000;

      if (timeSinceLastRequest < oneMinute) {
        return res.status(429).json({
          success: false,
          message:
            "Please wait at least 1 minute before requesting another verification code",
        });
      }
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();

    // Update provider with new code
    await ServiceProvider.findByIdAndUpdate(provider._id, {
      emailVerificationCode: verificationCode,
      emailVerificationCodeCreatedAt: Date.now(),
    });

    // Send verification email
    await sendVerificationEmail(
      provider.email,
      provider.name,
      verificationCode
    );

    res.json({
      success: true,
      message: "Verification code sent successfully",
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

// EXPORT ALL FUNCTIONS
module.exports = {
  registerProvider,
  verifyEmail,
  resendVerification,
};
