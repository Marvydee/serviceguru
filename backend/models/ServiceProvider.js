const mongoose = require("mongoose");

const serviceProviderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^\+?[\d\s\-\(\)]{10,}$/.test(v);
        },
        message: "Invalid phone number format",
      },
    },
    service: {
      type: String,
      required: [true, "Service type is required"],
      trim: true,
      maxlength: [100, "Service description cannot exceed 100 characters"],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, "Bio cannot exceed 1000 characters"],
    },
    website: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Optional field
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        message: "Invalid website URL",
      },
    },
    photos: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
    },

    // Email verification fields
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationTokenCreatedAt: {
      type: Date,
      default: null,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    // Password reset fields
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetTokenCreatedAt: {
      type: Date,
      default: null,
    },

    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedReason: {
      type: String,
      default: null,
    },
    blockedAt: {
      type: Date,
      default: null,
    },

    // Geolocation
    geoLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, "Location coordinates are required"],
        validate: {
          validator: function (coords) {
            return (
              coords.length === 2 &&
              coords[0] >= -180 &&
              coords[0] <= 180 && // longitude
              coords[1] >= -90 &&
              coords[1] <= 90
            ); // latitude
          },
          message: "Invalid coordinates",
        },
      },
    },

    // Timestamps
    lastLoginAt: {
      type: Date,
      default: null,
    },
    profileCompletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: {
      transform: function (doc, ret) {
        // Remove sensitive fields when converting to JSON
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.passwordResetToken;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
serviceProviderSchema.index({ geoLocation: "2dsphere" });
serviceProviderSchema.index({ email: 1 }, { unique: true });
serviceProviderSchema.index({ phone: 1 }, { unique: true });
serviceProviderSchema.index({ emailVerificationToken: 1 });
serviceProviderSchema.index({ passwordResetToken: 1 });
serviceProviderSchema.index({ createdAt: -1 });

// Pre-save middleware to clean up expired tokens
serviceProviderSchema.pre("save", function (next) {
  const twentyFourHours = 24 * 60 * 60 * 1000;

  // Clean up expired email verification tokens
  if (
    this.emailVerificationTokenCreatedAt &&
    Date.now() - this.emailVerificationTokenCreatedAt > twentyFourHours
  ) {
    this.emailVerificationToken = null;
    this.emailVerificationTokenCreatedAt = null;
  }

  // Clean up expired password reset tokens
  if (
    this.passwordResetTokenCreatedAt &&
    Date.now() - this.passwordResetTokenCreatedAt > twentyFourHours
  ) {
    this.passwordResetToken = null;
    this.passwordResetTokenCreatedAt = null;
  }

  next();
});

// Instance methods
serviceProviderSchema.methods.isEmailVerificationTokenValid = function () {
  if (!this.emailVerificationToken || !this.emailVerificationTokenCreatedAt) {
    return false;
  }
  const twentyFourHours = 24 * 60 * 60 * 1000;
  return Date.now() - this.emailVerificationTokenCreatedAt < twentyFourHours;
};

serviceProviderSchema.methods.isPasswordResetTokenValid = function () {
  if (!this.passwordResetToken || !this.passwordResetTokenCreatedAt) {
    return false;
  }
  const oneHour = 60 * 60 * 1000;
  return Date.now() - this.passwordResetTokenCreatedAt < oneHour;
};

// Static methods
serviceProviderSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

serviceProviderSchema.statics.findVerifiedProviders = function () {
  return this.find({ emailVerified: true, isActive: true, isBlocked: false });
};

module.exports = mongoose.model("ServiceProvider", serviceProviderSchema);
