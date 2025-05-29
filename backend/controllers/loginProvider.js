const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ServiceProvider = require("../models/ServiceProvider");

exports.loginProvider = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find provider by email using the static method
    const provider = await ServiceProvider.findByEmail(email);
    if (!provider) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if account is active and not blocked
    if (!provider.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Please contact support.",
      });
    }

    if (provider.isBlocked) {
      return res.status(403).json({
        success: false,
        message: `Account is blocked. Reason: ${
          provider.blockedReason || "Contact support for details"
        }`,
      });
    }

    // Check if email is verified
    if (!provider.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address before logging in",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login timestamp
    provider.lastLoginAt = new Date();
    await provider.save();

    // Generate JWT token with more comprehensive payload
    const tokenPayload = {
      id: provider._id,
      email: provider.email,
      role: "service_provider",
      emailVerified: provider.emailVerified,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      issuer: process.env.JWT_ISSUER || "your-app-name",
      audience: process.env.JWT_AUDIENCE || "service-providers",
    });

    // Prepare response data (password and sensitive fields are already excluded by toJSON transform)
    const providerData = provider.toJSON();

    res.json({
      success: true,
      message: "Login successful",
      token,
      provider: {
        id: providerData._id,
        name: providerData.name,
        email: providerData.email,
        phone: providerData.phone,
        service: providerData.service,
        bio: providerData.bio,
        website: providerData.website,
        photos: providerData.photos,
        geoLocation: providerData.geoLocation,
        emailVerified: providerData.emailVerified,
        isActive: providerData.isActive,
        lastLoginAt: providerData.lastLoginAt,
        createdAt: providerData.createdAt,
        updatedAt: providerData.updatedAt,
      },
      loginTimestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Login Error:", err);

    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === "development";

    res.status(500).json({
      success: false,
      message: "An error occurred during login. Please try again.",
      ...(isDevelopment && { error: err.message, stack: err.stack }),
    });
  }
};
