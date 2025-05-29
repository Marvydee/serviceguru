const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  registerProvider,
  verifyEmail,
  resendVerification,
} = require("../controllers/registerProvider");
const { loginProvider } = require("../controllers/loginProvider");
const {
  updateProfile,
  updatePassword,
} = require("../controllers/updateProfile");
const {
  searchProviders,
  getServiceSuggestions,
  getProvidersByIds,
} = require("../controllers/searchProviders");
const { deleteServicePhoto } = require("../controllers/deleteServicePhoto");
const { verifyToken } = require("../middleware/authMiddleware");
const {
  forgotPassword,
  resetPassword,
  checkResetToken,
} = require("../controllers/resetPassword");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ROUTES
router.post("/register", upload.array("photos"), registerProvider);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/login", loginProvider);
router.put("/:id", verifyToken, upload.array("photos"), updateProfile);
router.put("/:id/password", verifyToken, updatePassword);
router.post("/search-services", searchProviders);
router.get("/providers/:id", getProvidersByIds);
router.get("/service-suggestions", getServiceSuggestions);
router.post("/delete-photo", deleteServicePhoto);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/check-reset-token/:token", checkResetToken);

module.exports = router;
