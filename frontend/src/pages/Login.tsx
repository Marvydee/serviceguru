import React, { useState } from "react";
import styles from "../styles/Login.module.css";
import { Link, useNavigate } from "react-router-dom";

// Type definitions
interface FormData {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  provider?: {
    id: string;
    name: string;
    email: string;
    // Add other provider properties as needed
  };
}

// interface ApiError {
//   message: string;
// }

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://serviceguru-qlng.onrender.com/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data: LoginResponse = await response.json();

      if (data.success) {
        // Store token and provider data
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        if (data.provider) {
          localStorage.setItem("provider", JSON.stringify(data.provider));
        }

        // Redirect to dashboard or handle successful login
        navigate("/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError("Network error. Please check your connection and try again.");
      console.error("Login error:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <h1>ServiceGuru</h1>
            <div className={styles.logoIcon}>🔧</div>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to your service provider account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
              <span className={styles.inputIcon}>📧</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.inputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={togglePasswordVisibility}
                disabled={loading}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !formData.email || !formData.password}
          >
            {loading ? (
              <div className={styles.loadingSpinner}>
                <div className={styles.spinner}></div>
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <Link to="/forgot-password" className={styles.forgotPassword}>
            Forgot your password?
          </Link>
          <div className={styles.signupPrompt}>
            Don't have an account?{" "}
            <Link to="/register" className={styles.signupLink}>
              Sign up here
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.backgroundPattern}></div>
    </div>
  );
};

export default Login;
