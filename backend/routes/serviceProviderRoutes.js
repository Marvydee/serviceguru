const express = require("express");
const router = express.Router();
const registerProvider = require("../controllers/registerProvider");
const loginProvider = require("../controllers/loginProvider");
const updateProvider = require("../controllers/updateProfile");
const {
  searchProviders,
  getServiceSuggestions,
  getProvidersByIds,
} = require("../controllers/searchProviders");
const deleteServicePhoto = require("../controllers/deleteServicePhoto");
const { verifyToken } = require("../middlewares/authMiddleware");
const {
  forgotPassword,
  resetPassword,
  checkResetToken,
} = require("../controllers/resetPassword");

// ROUTES
router.post(
  "/register",
  upload.array("photos"),
  registerProvider.registerProvider
);
router.post("/verify-email", registerProvider.verifyEmail);
router.post("/resend-verification", registerProvider.resendVerification);
router.post("/login", loginProvider);
router.put(
  "/:id",
  verifyToken,
  upload.array("photos"),
  updateProvider.updateProfile
);
router.put("/:id/password", verifyToken, updateProvider.updatePassword);
router.post("/search-services", searchProviders);
router.get("/providers/:id", getProvidersByIds);
router.get("/service-suggestions", getServiceSuggestions);
router.post("/delete-photo", deleteServicePhoto);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/check-reset-token/:token", checkResetToken);

module.exports = router;
