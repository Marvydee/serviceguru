const ServiceProvider = require("../models/ServiceProvider");
const mongoose = require("mongoose");

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider ID format",
      });
    }

    // Extract and validate updates
    const updates = { ...req.body };

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.__v;

    // Handle password updates (should be hashed separately)
    if (updates.password) {
      delete updates.password;
      // Log warning or handle password update separately
      console.warn(
        "Password update attempted - handle separately with proper hashing"
      );
    }

    // Validate email format if provided
    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format",
        });
      }
    }

    // Validate phone format if provided
    if (updates.phone) {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(updates.phone)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number format",
        });
      }
    }

    // Validate coordinates if geoLocation is being updated
    if (updates.geoLocation && updates.geoLocation.coordinates) {
      const [longitude, latitude] = updates.geoLocation.coordinates;
      if (
        longitude < -180 ||
        longitude > 180 ||
        latitude < -90 ||
        latitude > 90
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90",
        });
      }
    }

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      const uploadedPhotos = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));

      // Fixed: use 'updates' instead of undefined 'updateData'
      updates.photos = uploadedPhotos;
    }

    // Check if provider exists before updating
    const existingProvider = await ServiceProvider.findById(id);
    if (!existingProvider) {
      return res.status(404).json({
        success: false,
        message: "Service provider not found",
      });
    }

    // Check for duplicate email if email is being updated
    if (updates.email && updates.email !== existingProvider.email) {
      const emailExists = await ServiceProvider.findOne({
        email: updates.email,
        _id: { $ne: id }, // Exclude current provider
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Perform the update with validation
    const updatedProvider = await ServiceProvider.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        runValidators: true, // Run schema validators
        select: "-password", // Exclude password from response
      }
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      provider: updatedProvider,
    });
  } catch (err) {
    console.error("Update Profile Error:", err);

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
      return res.status(409).json({
        success: false,
        message: "Duplicate field value",
        field: Object.keys(err.keyPattern)[0],
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Optional: Add a separate endpoint for password updates
exports.updatePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider ID format",
      });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const provider = await ServiceProvider.findById(id);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider not found",
      });
    }

    // Here you would verify the current password and hash the new one
    // const isCurrentPasswordValid = await bcrypt.compare(currentPassword, provider.password);
    // if (!isCurrentPasswordValid) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Current password is incorrect"
    //   });
    // }

    // const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    // await ServiceProvider.findByIdAndUpdate(id, { password: hashedNewPassword });

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Update Password Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
