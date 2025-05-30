import React, { useState, ChangeEvent } from "react";
import {
  Eye,
  EyeOff,
  MapPin,
  Phone,
  Mail,
  User,
  Briefcase,
  Globe,
  FileText,
  Upload,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Registration.module.css";

// Types and Interfaces
interface FormData {
  name: string;
  phone: string;
  service: string;
  email: string;
  password: string;
  confirmPassword: string;
  latitude: string;
  longitude: string;
  bio: string;
  website: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  service?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  latitude?: string;
  longitude?: string;
  website?: string;
  location?: string;
  coordinates?: string;
  submit?: string;
}

interface PhotoUpload {
  file: File;
  preview: string;
  id: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
}

type ServiceOption =
  | "Plumbing"
  | "Electrical"
  | "Carpentry"
  | "Painting"
  | "Cleaning"
  | "Landscaping"
  | "HVAC"
  | "Roofing"
  | "Flooring"
  | "Appliance Repair"
  | "Home Security"
  | "Interior Design"
  | "Moving Services"
  | "Pest Control"
  | "Photography"
  | "Catering"
  | "Event Planning"
  | "Tutoring"
  | "Pet Care"
  | "Fitness Training"
  | "Beauty Services"
  | "Auto Repair"
  | "Computer Repair"
  | "Legal Services"
  | "Accounting"
  | "Other";

const RegistrationPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    service: "",
    email: "",
    password: "",
    confirmPassword: "",
    latitude: "",
    longitude: "",
    bio: "",
    website: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const serviceOptions: ServiceOption[] = [
    "Plumbing",
    "Electrical",
    "Carpentry",
    "Painting",
    "Cleaning",
    "Landscaping",
    "HVAC",
    "Roofing",
    "Flooring",
    "Appliance Repair",
    "Home Security",
    "Interior Design",
    "Moving Services",
    "Pest Control",
    "Photography",
    "Catering",
    "Event Planning",
    "Tutoring",
    "Pet Care",
    "Fitness Training",
    "Beauty Services",
    "Auto Repair",
    "Computer Repair",
    "Legal Services",
    "Accounting",
    "Other",
  ];

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password: string): boolean => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateCoordinates = (
    longitude: string,
    latitude: string
  ): boolean => {
    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);
    return (
      !isNaN(lon) &&
      !isNaN(lat) &&
      lon >= -180 &&
      lon <= 180 &&
      lat >= -90 &&
      lat <= 90
    );
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const getCurrentLocation = (): void => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
          setLocationLoading(false);
        },
        (error: GeolocationPositionError) => {
          console.error("Error getting location:", error);
          setErrors((prev) => ({
            ...prev,
            location:
              "Unable to get current location. Please enter coordinates manually.",
          }));
          setLocationLoading(false);
        }
      );
    } else {
      setErrors((prev) => ({
        ...prev,
        location: "Geolocation is not supported by this browser.",
      }));
      setLocationLoading(false);
    }
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    const newPhotos: PhotoUpload[] = filesArray.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (id: string): void => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.service) newErrors.service = "Service is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm password";
    if (!formData.latitude.trim()) newErrors.latitude = "Latitude is required";
    if (!formData.longitude.trim())
      newErrors.longitude = "Longitude is required";

    // Format validations
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    if (formData.password && !validatePassword(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters with uppercase, lowercase, and number";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (
      formData.longitude &&
      formData.latitude &&
      !validateCoordinates(formData.longitude, formData.latitude)
    ) {
      newErrors.coordinates = "Invalid coordinates";
    }

    if (formData.website) {
      try {
        new URL(formData.website);
      } catch {
        newErrors.website = "Invalid website URL format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Add form fields
      Object.keys(formData).forEach((key) => {
        const typedKey = key as keyof FormData;
        if (key !== "confirmPassword" && formData[typedKey]) {
          formDataToSend.append(key, formData[typedKey]);
        }
      });

      // Add photos
      photos.forEach((photo) => {
        formDataToSend.append("photos", photo.file);
      });

      const response = await fetch(
        "https://serviceguru-qlng.onrender.com/register",
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const data: ApiResponse = await response.json();

      if (data.success) {
        // Redirect to email verification page with email in state
        navigate("/verify-email", {
          state: { email: formData.email },
        });
        // Reset form or redirect
        setFormData({
          name: "",
          phone: "",
          service: "",
          email: "",
          password: "",
          confirmPassword: "",
          latitude: "",
          longitude: "",
          bio: "",
          website: "",
        });
      } else {
        setErrors({ submit: data.message || "Registration failed" });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            Join <span className={styles.titleHighlight}>ServiceGuru</span>
          </h1>
          <p className={styles.subtitle}>
            Connect with customers and grow your service business
          </p>
        </div>

        {/* Registration Form */}
        <div className={styles.formCard}>
          <div className={styles.formContainer}>
            {/* Personal Information Section */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Personal Information</h2>

              <div className={`${styles.grid} ${styles.gridCols2}`}>
                {/* Name */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <User className={styles.labelIcon} />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`${styles.input} ${
                      errors.name ? styles.inputError : ""
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className={styles.errorMessage}>{errors.name}</p>
                  )}
                </div>

                {/* Phone */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <Phone className={styles.labelIcon} />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`${styles.input} ${
                      errors.phone ? styles.inputError : ""
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && (
                    <p className={styles.errorMessage}>{errors.phone}</p>
                  )}
                </div>

                {/* Email */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <Mail className={styles.labelIcon} />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`${styles.input} ${
                      errors.email ? styles.inputError : ""
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className={styles.errorMessage}>{errors.email}</p>
                  )}
                </div>

                {/* Service */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <Briefcase className={styles.labelIcon} />
                    Service Type *
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className={`${styles.select} ${
                      errors.service ? styles.selectError : ""
                    }`}
                  >
                    <option value="">Select a service</option>
                    {serviceOptions.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                  {errors.service && (
                    <p className={styles.errorMessage}>{errors.service}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Security</h2>

              <div className={`${styles.grid} ${styles.gridCols2}`}>
                {/* Password */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Password *</label>
                  <div className={styles.inputContainer}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`${styles.input} ${styles.inputWithIcon} ${
                        errors.password ? styles.inputError : ""
                      }`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.iconButton}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className={styles.errorMessage}>{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Confirm Password *</label>
                  <div className={styles.inputContainer}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`${styles.input} ${styles.inputWithIcon} ${
                        errors.confirmPassword ? styles.inputError : ""
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className={styles.iconButton}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className={styles.errorMessage}>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Location</h2>

              <div className={styles.locationSection}>
                <div className={styles.locationHeader}>
                  <div className={styles.locationInfo}>
                    <MapPin className={styles.labelIcon} />
                    <p className={styles.locationText}>
                      We need your location to connect you with nearby customers
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                    className={styles.locationButton}
                  >
                    {locationLoading
                      ? "Getting Location..."
                      : "Use Current Location"}
                  </button>
                </div>

                <div className={`${styles.grid} ${styles.gridCols2}`}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      className={`${styles.input} ${
                        errors.latitude ? styles.inputError : ""
                      }`}
                      placeholder="40.7128"
                    />
                    {errors.latitude && (
                      <p className={styles.errorMessage}>{errors.latitude}</p>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      className={`${styles.input} ${
                        errors.longitude ? styles.inputError : ""
                      }`}
                      placeholder="-74.0060"
                    />
                    {errors.longitude && (
                      <p className={styles.errorMessage}>{errors.longitude}</p>
                    )}
                  </div>
                </div>

                {errors.location && (
                  <p className={styles.errorMessage}>{errors.location}</p>
                )}
                {errors.coordinates && (
                  <p className={styles.errorMessage}>{errors.coordinates}</p>
                )}
              </div>
            </div>

            {/* Additional Information Section */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Additional Information</h2>

              <div className={`${styles.grid} ${styles.gridCols2}`}>
                {/* Website */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <Globe className={styles.labelIcon} />
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className={`${styles.input} ${
                      errors.website ? styles.inputError : ""
                    }`}
                    placeholder="https://yourwebsite.com"
                  />
                  {errors.website && (
                    <p className={styles.errorMessage}>{errors.website}</p>
                  )}
                </div>

                {/* Photo Upload */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    <Upload className={styles.labelIcon} />
                    Photos (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className={styles.fileInput}
                  />
                </div>
              </div>

              {/* Bio */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  <FileText className={styles.labelIcon} />
                  Bio (Optional)
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className={styles.textarea}
                  placeholder="Tell customers about your experience, specialties, and what makes your service unique..."
                />
              </div>

              {/* Photo Previews */}
              {photos.length > 0 && (
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Photo Previews</label>
                  <div className={`${styles.grid} ${styles.gridCols4}`}>
                    {photos.map((photo) => (
                      <div key={photo.id} className={styles.photoPreview}>
                        <img
                          src={photo.preview}
                          alt="Preview"
                          className={styles.photoImage}
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          className={styles.removePhotoButton}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className={styles.errorAlert}>
                <p className={styles.errorAlertText}>{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className={styles.submitSection}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>

            {/* Login Link */}
            <div className={styles.loginSection}>
              <p className={styles.loginText}>
                Already have an account?{" "}
                <Link to="/login" className={styles.loginLink}>
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
