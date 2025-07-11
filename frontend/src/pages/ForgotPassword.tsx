import React, { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import styles from "../styles/ForgotPassword.module.css";
import Logo from "../components/Logo";

// Types
interface ApiResponse {
  success: boolean;
  message: string;
  errors?: string[];
  expiresAt?: number;
}

interface PasswordRequirements {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

const ForgotPasswordPage: React.FC = () => {
  // State management
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [tokenValid, setTokenValid] = useState<boolean>(false);

  // Password validation
  const passwordRequirements: PasswordRequirements = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[@$!%*?&]/.test(newPassword),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch =
    newPassword === confirmPassword && confirmPassword !== "";

  // Get token from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken =
      urlParams.get("token") || window.location.pathname.split("/").pop();

    if (resetToken && resetToken !== "forgot-password") {
      setToken(resetToken);
      setCurrentStep(2);
      checkTokenValidity(resetToken);
    }
  }, []);

  // API call to check token validity
  const checkTokenValidity = async (resetToken: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://serviceguru-qlng.onrender.com/check-reset-token/${resetToken}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data: ApiResponse = await response.json();

      if (data.success) {
        setTokenValid(true);
        setError("");
      } else {
        setError(
          "This reset link is invalid or has expired. Please request a new one."
        );
        setCurrentStep(1);
      }
    } catch (err) {
      console.error("Token validation error:", err);
      setError("Unable to verify reset link. Please try again.");
      setCurrentStep(1);
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password form submission
  const handleForgotPassword = async (
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.KeyboardEvent<HTMLInputElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!email || loading) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "https://serviceguru-qlng.onrender.com/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data: ApiResponse = await response.json();

      if (data.success) {
        setMessage(data.message);
        setEmail(""); // Clear email for security
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle reset password form submission
  const handleResetPassword = async (
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.KeyboardEvent<HTMLInputElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!isPasswordValid) {
      setError("Please ensure your password meets all requirements.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    if (loading) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `https://serviceguru-qlng.onrender.com/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newPassword,
            confirmPassword,
          }),
        }
      );

      const data: ApiResponse = await response.json();

      if (data.success) {
        setMessage(data.message);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Navigate back to forgot password step
  const goBack = (): void => {
    setCurrentStep(1);
    setToken("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setMessage("");
    setTokenValid(false);
  };

  // Handle keyboard events
  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    callback: () => void
  ): void => {
    if (e.key === "Enter") {
      callback();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Step Indicator */}
        <div className={styles.stepIndicator}>
          <div
            className={`${styles.step} ${
              currentStep === 1 ? styles.stepActive : ""
            }`}
          />
          <div
            className={`${styles.step} ${
              currentStep === 2 ? styles.stepActive : ""
            }`}
          />
        </div>

        {/* Header */}
        <div className={styles.header}>
          <Logo />
          <h1 className={styles.title}>
            {currentStep === 1 ? "Forgot Password?" : "Reset Password"}
          </h1>
          <p className={styles.subtitle}>
            {currentStep === 1
              ? "No worries! Enter your email and we'll send you a reset link."
              : "Enter your new password below to complete the reset process."}
          </p>
        </div>

        {/* Back Button for Reset Step */}
        {currentStep === 2 && !message && (
          <button onClick={goBack} className={styles.backButton}>
            <ArrowLeft size={16} />
            Back to forgot password
          </button>
        )}

        {/* Alert Messages */}
        {message && (
          <div className={`${styles.alert} ${styles.alertSuccess}`}>
            <CheckCircle
              size={20}
              style={{ marginTop: "1px", flexShrink: 0 }}
            />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className={`${styles.alert} ${styles.alertError}`}>
            <AlertCircle
              size={20}
              style={{ marginTop: "1px", flexShrink: 0 }}
            />
            <span>{error}</span>
          </div>
        )}

        {/* Progress Bar */}
        {loading && (
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: currentStep === 1 ? "50%" : "100%" }}
            />
          </div>
        )}

        {/* Forgot Password Form */}
        {currentStep === 1 && !message && (
          <div className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <div className={styles.inputWrapper}>
                <Mail size={20} className={styles.inputIcon} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                  className={`${styles.input} ${
                    error && email ? styles.inputError : ""
                  }`}
                  onKeyPress={(e) =>
                    handleKeyPress(e, () => handleForgotPassword(e))
                  }
                />
              </div>
            </div>

            <button
              onClick={handleForgotPassword}
              disabled={loading || !email}
              className={styles.button}
            >
              {loading ? "Sending Reset Link..." : "Send Reset Link"}
            </button>
          </div>
        )}

        {/* Reset Password Form */}
        {currentStep === 2 && tokenValid && !message && (
          <div className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="newPassword" className={styles.label}>
                New Password
              </label>
              <div className={styles.inputWrapper}>
                <Lock size={20} className={styles.inputIcon} />
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  disabled={loading}
                  className={`${styles.input} ${
                    error && newPassword ? styles.inputError : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.togglePassword}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Requirements */}
              {newPassword && (
                <div className={styles.passwordRequirements}>
                  <p
                    style={{ margin: "0.5rem 0 0.25rem 0", fontWeight: "500" }}
                  >
                    Password Requirements:
                  </p>
                  <ul className={styles.requirementsList}>
                    {Object.entries({
                      "At least 8 characters": passwordRequirements.length,
                      "One uppercase letter": passwordRequirements.uppercase,
                      "One lowercase letter": passwordRequirements.lowercase,
                      "One number": passwordRequirements.number,
                      "One special character (@$!%*?&)":
                        passwordRequirements.special,
                    }).map(([requirement, met]) => (
                      <li
                        key={requirement}
                        className={`${styles.requirement} ${
                          met ? styles.requirementMet : styles.requirementUnmet
                        }`}
                      >
                        <CheckCircle size={12} />
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm Password
              </label>
              <div className={styles.inputWrapper}>
                <Lock size={20} className={styles.inputIcon} />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  disabled={loading}
                  className={`${styles.input} ${
                    error && confirmPassword ? styles.inputError : ""
                  } ${
                    confirmPassword && !passwordsMatch ? styles.inputError : ""
                  }`}
                  onKeyPress={(e) =>
                    handleKeyPress(e, () => handleResetPassword(e))
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={styles.togglePassword}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p
                  className={styles.passwordRequirements}
                  style={{ color: "#ef4444", marginTop: "0.5rem" }}
                >
                  Passwords do not match
                </p>
              )}
              {confirmPassword && passwordsMatch && (
                <p
                  className={styles.passwordRequirements}
                  style={{ color: "#059669", marginTop: "0.5rem" }}
                >
                  ✓ Passwords match
                </p>
              )}
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading || !isPasswordValid || !passwordsMatch}
              className={styles.button}
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </div>
        )}

        {/* Login Link */}
        {(message || currentStep === 1) && (
          <div className={styles.loginLink}>
            <p className={styles.loginLinkText}>
              Remember your password?{" "}
              <Link to="/login" className={styles.loginLinkAnchor}>
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
