import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from "lucide-react";
import styles from "../styles/Verification.module.css";

interface VerificationData {
  email: string;
  code: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
}

const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get email from location state (passed from registration page)
  const email = location.state?.email || "";

  useEffect(() => {
    // Redirect to registration if no email provided
    if (!email) {
      navigate("/register");
      return;
    }

    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    // Cooldown timer for resend button
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleInputChange = (index: number, value: string): void => {
    // Only allow single digit
    if (value.length > 1) return;

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Clear error when user starts typing
    if (error) setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (value && index === 5 && newCode.every((digit) => digit !== "")) {
      handleVerification(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent): void => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle paste
    if (e.key === "Enter") {
      handleVerification(code.join(""));
    }
  };

  const handlePaste = (e: React.ClipboardEvent): void => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").replace(/\D/g, "");

    if (pastedText.length === 6) {
      const newCode = pastedText.split("").slice(0, 6);
      setCode(newCode);

      // Focus last input
      inputRefs.current[5]?.focus();

      // Auto-submit
      setTimeout(() => {
        handleVerification(newCode.join(""));
      }, 100);
    }
  };

  const handleVerification = async (
    verificationCode: string
  ): Promise<void> => {
    if (verificationCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://serviceguru-qlng.onrender.com/verify-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            code: verificationCode,
          }),
        }
      );

      const data: ApiResponse = await response.json();

      if (data.success) {
        setSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login", {
            state: {
              message: "Email verified successfully! You can now log in.",
              email: email,
            },
          });
        }, 2000);
      } else {
        setError(data.message || "Invalid verification code");
        // Clear the code inputs on error
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async (): Promise<void> => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://serviceguru-qlng.onrender.com/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email }),
        }
      );

      const data: ApiResponse = await response.json();

      if (data.success) {
        setResendCooldown(60); // 60 second cooldown
        // Clear current code
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.message || "Failed to resend verification code");
      }
    } catch (error) {
      console.error("Resend error:", error);
      setError("Network error. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const maskEmail = (email: string): string => {
    const [localPart, domain] = email.split("@");
    const maskedLocal =
      localPart.charAt(0) +
      "*".repeat(localPart.length - 2) +
      localPart.charAt(localPart.length - 1);
    return `${maskedLocal}@${domain}`;
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h1 className={styles.successTitle}>Email Verified!</h1>
            <p className={styles.successMessage}>
              Your email has been successfully verified. Redirecting you to
              login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <Link to="/register" className={styles.backButton}>
            <ArrowLeft className="w-5 h-5" />
            Back to Registration
          </Link>
        </div>

        {/* Verification Form */}
        <div className={styles.formCard}>
          <div className={styles.formContainer}>
            {/* Mail Icon */}
            <div className={styles.iconContainer}>
              <Mail className={styles.mailIcon} />
            </div>

            {/* Title and Description */}
            <div className={styles.textSection}>
              <h1 className={styles.title}>Verify Your Email</h1>
              <p className={styles.description}>
                We've sent a 6-digit verification code to
              </p>
              <p className={styles.email}>{maskEmail(email)}</p>
              <p className={styles.subDescription}>
                Enter the code below to verify your account
              </p>
            </div>

            {/* Code Input */}
            <div className={styles.codeSection}>
              <div className={styles.codeInputs} onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`${styles.codeInput} ${
                      error ? styles.codeInputError : ""
                    }`}
                    maxLength={1}
                    disabled={loading}
                  />
                ))}
              </div>

              {error && <p className={styles.errorMessage}>{error}</p>}
            </div>

            {/* Verify Button */}
            <button
              onClick={() => handleVerification(code.join(""))}
              disabled={loading || code.some((digit) => digit === "")}
              className={styles.verifyButton}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            {/* Resend Section */}
            <div className={styles.resendSection}>
              <p className={styles.resendText}>Didn't receive the code?</p>
              <button
                onClick={handleResendCode}
                disabled={resendLoading || resendCooldown > 0}
                className={styles.resendButton}
              >
                {resendLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  "Resend Code"
                )}
              </button>
            </div>

            {/* Help Text */}
            <div className={styles.helpSection}>
              <p className={styles.helpText}>
                Make sure to check your spam folder if you don't see the email.
                The verification code expires in 15 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
