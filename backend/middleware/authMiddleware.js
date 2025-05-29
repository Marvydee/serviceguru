const jwt = require("jsonwebtoken");
const ServiceProvider = require("../models/ServiceProvider");

exports.verifyToken = async (req, res, next) => {
  try {
    // Extract token from multiple possible sources
    let token = null;

    // Check Authorization header (Bearer token)
    if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove "Bearer " prefix
      }
    }

    // Fallback: Check cookies if no Authorization header
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // Fallback: Check query parameter (use sparingly, mainly for WebSocket connections)
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No authentication token provided.",
        code: "NO_TOKEN",
      });
    }

    // Verify JWT token with comprehensive options
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.JWT_ISSUER || "your-app-name",
      audience: process.env.JWT_AUDIENCE || "service-providers",
      algorithms: ["HS256"], // Explicitly specify allowed algorithms
    });

    // Validate token payload structure
    if (!decoded.id || !decoded.email) {
      return res.status(401).json({
        success: false,
        message: "Invalid token structure",
        code: "INVALID_TOKEN_STRUCTURE",
      });
    }

    // Fetch current user data from database
    const provider = await ServiceProvider.findById(decoded.id).select(
      "-password"
    );

    if (!provider) {
      return res.status(401).json({
        success: false,
        message: "Token valid but user not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Check if account is still active and not blocked
    if (!provider.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
        code: "ACCOUNT_DEACTIVATED",
      });
    }

    if (provider.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Account is blocked",
        code: "ACCOUNT_BLOCKED",
      });
    }

    // Check if email is still verified (in case it gets revoked)
    if (!provider.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Email verification required",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    // Optional: Check if password was changed after token was issued
    // This would require storing passwordChangedAt in your model
    // if (provider.passwordChangedAt && decoded.iat < provider.passwordChangedAt.getTime() / 1000) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Token invalid due to password change",
    //     code: "PASSWORD_CHANGED"
    //   });
    // }

    // Attach both decoded token and fresh user data to request
    req.token = decoded;
    req.provider = provider;

    next();
  } catch (err) {
    console.error("Token verification error:", err);

    // Handle specific JWT errors
    let message = "Invalid or expired token";
    let code = "TOKEN_ERROR";

    if (err.name === "JsonWebTokenError") {
      message = "Invalid token format";
      code = "INVALID_TOKEN_FORMAT";
    } else if (err.name === "TokenExpiredError") {
      message = "Token has expired";
      code = "TOKEN_EXPIRED";
    } else if (err.name === "NotBeforeError") {
      message = "Token not active yet";
      code = "TOKEN_NOT_ACTIVE";
    }

    return res.status(401).json({
      success: false,
      message,
      code,
      ...(process.env.NODE_ENV === "development" && {
        error: err.message,
        tokenPayload:
          err.name === "TokenExpiredError"
            ? jwt.decode(req.headers.authorization?.split(" ")[1])
            : null,
      }),
    });
  }
};

// Optional: Middleware for optional authentication (doesn't fail if no token)
exports.optionalAuth = async (req, res, next) => {
  try {
    // Use the same logic but don't fail if no token
    let token = null;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.substring(7);
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      // No token provided, but that's okay for optional auth
      req.provider = null;
      req.token = null;
      return next();
    }

    // If token exists, verify it
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.JWT_ISSUER || "your-app-name",
      audience: process.env.JWT_AUDIENCE || "service-providers",
      algorithms: ["HS256"],
    });

    const provider = await ServiceProvider.findById(decoded.id).select(
      "-password"
    );

    // Only attach if provider exists and is active
    if (
      provider &&
      provider.isActive &&
      !provider.isBlocked &&
      provider.emailVerified
    ) {
      req.token = decoded;
      req.provider = provider;
    } else {
      req.provider = null;
      req.token = null;
    }

    next();
  } catch (err) {
    // For optional auth, ignore token errors and continue
    req.provider = null;
    req.token = null;
    next();
  }
};

// Middleware to check specific roles or permissions
exports.requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.provider) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    const userRole = req.token?.role || "service_provider";

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        code: "INSUFFICIENT_PERMISSIONS",
        required: allowedRoles,
        current: userRole,
      });
    }

    next();
  };
};

// Middleware to check if user can access specific resource
exports.requireOwnership = (resourceIdParam = "id") => {
  return (req, res, next) => {
    if (!req.provider) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    const resourceId = req.params[resourceIdParam];
    const userId = req.provider._id.toString();

    if (resourceId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only access your own resources.",
        code: "OWNERSHIP_REQUIRED",
      });
    }

    next();
  };
};
