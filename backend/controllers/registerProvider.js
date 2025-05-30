// Email verification endpoint - Fixed version
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Log the incoming request for debugging
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

    // Validate code format (should be 6 digits)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Verification code must be 6 digits",
      });
    }

    // First, find the provider by email
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

    // Log the stored verification code for debugging (remove in production)
    console.log("Stored code:", provider.emailVerificationCode);
    console.log("Received code:", code);

    // Check if the codes match
    if (provider.emailVerificationCode !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    // Check if already verified
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

// Also fix the registration function to ensure proper code generation
exports.registerProvider = async (req, res) => {
  let uploadedImageIds = []; // Track uploaded images for cleanup

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

    // ... (all your existing validation code remains the same)

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
      // Clean up any uploaded images
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

    // ... (all your existing validation code)

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Handle Cloudinary uploaded files
    let photos = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      photos = req.files.map((file) => ({
        url: file.path, // Cloudinary URL
        public_id: file.filename, // Cloudinary public_id
      }));

      // Store uploaded IDs for potential cleanup
      uploadedImageIds = req.files.map((file) => file.filename);
    }

    // Generate email verification code (6-digit) - FIXED
    const generateVerificationCode = () => {
      return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const emailVerificationCode = generateVerificationCode();

    // Log the generated code for debugging (remove in production)
    console.log(
      "Generated verification code for",
      email,
      ":",
      emailVerificationCode
    );

    // Create new provider with geolocation
    const providerData = {
      ...sanitizedData,
      password: hashedPassword,
      geoLocation: {
        type: "Point",
        coordinates: [numLongitude, numLatitude],
      },
      emailVerified: false,
      emailVerificationCode, // Make sure this is the 6-digit code
      emailVerificationCodeCreatedAt: Date.now(),
    };

    // Only add photos if there are valid ones
    if (photos.length > 0) {
      providerData.photos = photos;
    }

    const provider = new ServiceProvider(providerData);
    await provider.save();

    // Log what was saved to database (remove in production)
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
      console.log("Verification email sent to:", sanitizedData.email);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails, just log the error
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

    // Clean up uploaded images on error
    if (uploadedImageIds.length > 0) {
      await deleteCloudinaryImages(uploadedImageIds);
    }

    // ... (rest of your error handling remains the same)
  }
};
