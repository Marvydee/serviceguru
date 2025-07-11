import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import {
  User,
  Camera,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  Plus,
  Trash2,
  Globe,
} from "lucide-react";
import styles from "../styles/ServiceProviderDashboard.module.css";
import Logo from "../components/Logo";

// Type definitions matching your backend
interface ServiceProvider {
  _id: string;
  name: string;
  phone: string;
  service?: string;
  bio?: string;
  website?: string;
  email?: string;
  distance?: number;
  rating?: number;
  reviewCount?: number;
  address?: string;
  image?: string;
  services?: string[];
}

interface Photo {
  url: string;
  public_id: string;
}

interface ProfileData
  extends Omit<ServiceProvider, "id" | "distance" | "rating" | "reviewCount"> {
  photos: Photo[];
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type TabType = "profile" | "photos" | "password";

// API service functions
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://serviceguru-qlng.onrender.com";

const apiService = {
  // Get provider profile
  getProfile: async (providerId: string): Promise<ServiceProvider> => {
    const response = await fetch(`${API_BASE_URL}/provider/${providerId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    const data = await response.json();
    return data.provider || data;
  },

  // Update provider profile
  updateProfile: async (
    providerId: string,
    profileData: Partial<ProfileData>
  ): Promise<ServiceProvider> => {
    const formData = new FormData();

    // Add text fields
    Object.keys(profileData).forEach((key) => {
      if (
        key !== "photos" &&
        profileData[key as keyof ProfileData] !== undefined
      ) {
        const value = profileData[key as keyof ProfileData];
        if (key === "services" && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await fetch(`${API_BASE_URL}/${providerId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update profile");
    }

    const data = await response.json();
    return data.provider || data;
  },

  // Update password
  updatePassword: async (
    providerId: string,
    passwordData: PasswordData
  ): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${providerId}/password`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update password");
    }
  },

  // Upload photos
  uploadPhotos: async (providerId: string, files: File[]): Promise<Photo[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("photos", file);
    });

    const response = await fetch(`${API_BASE_URL}/${providerId}/photos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload photos");
    }

    const data = await response.json();
    return data.photos || [];
  },

  // Delete photo
  deletePhoto: async (providerId: string, photoId: string): Promise<void> => {
    const response = await fetch(
      `${API_BASE_URL}/${providerId}/photos/${encodeURIComponent(photoId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete photo");
    }
  },
};

const ServiceProviderDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [profileData, setProfileData] = useState<ProfileData>({
    _id: "",
    name: "",
    email: "",
    phone: "",
    service: "",
    bio: "",
    website: "",
    address: "",
    image: "",
    services: [],
    photos: [],
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("provider");
    window.location.href = "/login"; // Adjust based on your route setup
  };

  // Get provider ID from localStorage, URL params, or context
  const provider = JSON.parse(localStorage.getItem("provider") || "{}");
  const providerId = provider.id || provider._id;

  // Load initial data
  useEffect(() => {
    const loadProfile = async () => {
      if (!providerId) {
        setError("Provider ID not found");
        setIsInitialLoading(false);
        return;
      }

      try {
        const provider = await apiService.getProfile(providerId);
        setProfileData({
          _id: provider._id,
          name: provider.name || "",
          email: provider.email || "",
          phone: provider.phone || "",
          service: provider.service || "",
          bio: provider.bio || "",
          website: provider.website || "",
          address: provider.address || "",
          image: provider.image || "",
          services: provider.services || [],
          photos: [], // Photos would be loaded separately if your backend supports it
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadProfile();
  }, [providerId]);

  const handleProfileUpdate = async (): Promise<void> => {
    if (!providerId) {
      setError("Provider ID not found");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Prepare data for backend (excluding photos which are handled separately)
      const updateData = {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        service: profileData.service,
        bio: profileData.bio,
        website: profileData.website,
        address: profileData.address,
        services: profileData.services,
      };

      await apiService.updateProfile(providerId, updateData);
      alert("Profile updated successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (): Promise<void> => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      alert("Please fill in all password fields!");
      return;
    }

    if (!providerId) {
      setError("Provider ID not found");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await apiService.updatePassword(providerId, passwordData);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      alert("Password updated successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update password";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = e.target.files;
    if (!files || !providerId) return;

    const fileArray = Array.from(files);
    setIsLoading(true);

    try {
      const uploadedPhotos = await apiService.uploadPhotos(
        providerId,
        fileArray
      );
      setProfileData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...uploadedPhotos],
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload photos";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoDelete = async (public_id: string): Promise<void> => {
    if (!providerId) return;

    try {
      await apiService.deletePhoto(providerId, public_id);
      setProfileData((prev) => ({
        ...prev,
        photos: prev.photos.filter((photo) => photo.public_id !== public_id),
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete photo";
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  const handleInputChange =
    (field: keyof ProfileData) =>
    (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ): void => {
      setProfileData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleServicesChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const services = e.target.value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    setProfileData((prev) => ({ ...prev, services }));
  };

  const handlePasswordChange =
    (field: keyof PasswordData) =>
    (e: ChangeEvent<HTMLInputElement>): void => {
      setPasswordData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const renderTabButton = (tabKey: TabType, label: string): JSX.Element => (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`${styles.tabButton} ${
        activeTab === tabKey ? styles.activeTab : ""
      }`}
    >
      {label}
    </button>
  );

  if (isInitialLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner} />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <div className={styles.logoText}>
              <Logo />
              <p>Provider Dashboard</p>
            </div>
          </div>
          <div className={styles.userSection}>
            <div className={styles.userAvatar}>
              {profileData.image ? (
                <img src={profileData.image} alt="Profile" />
              ) : (
                <User />
              )}
            </div>
            <span className={styles.userName}>
              {profileData.name || "Provider"}
            </span>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {error && (
          <div className={styles.errorMessage}>
            <p>{error}</p>
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        <div className={styles.card}>
          {/* Tab Navigation */}
          <nav className={styles.tabNavigation}>
            {renderTabButton("profile", "Profile Information")}
            {renderTabButton("photos", "Service Photos")}
            {renderTabButton("password", "Security")}
          </nav>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === "profile" && (
              <div className={styles.profileSection}>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Full Name</label>
                    <div className={styles.inputWrapper}>
                      <User className={styles.inputIcon} />
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={handleInputChange("name")}
                        className={styles.input}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Email Address</label>
                    <div className={styles.inputWrapper}>
                      <Mail className={styles.inputIcon} />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={handleInputChange("email")}
                        className={styles.input}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Phone Number</label>
                    <div className={styles.inputWrapper}>
                      <Phone className={styles.inputIcon} />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={handleInputChange("phone")}
                        className={styles.input}
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Primary Service</label>
                    <select
                      value={profileData.service}
                      onChange={handleInputChange("service")}
                      className={styles.select}
                    >
                      <option value="">Select a service</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Carpentry">Carpentry</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Gardening">Gardening</option>
                      <option value="Painting">Painting</option>
                      <option value="HVAC">HVAC</option>
                      <option value="Roofing">Roofing</option>
                    </select>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Website (Optional)</label>
                    <div className={styles.inputWrapper}>
                      <Globe className={styles.inputIcon} />
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={handleInputChange("website")}
                        className={styles.input}
                        placeholder="https://your-website.com"
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      Additional Services (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={profileData.services?.join(", ") || ""}
                      onChange={handleServicesChange}
                      className={styles.input}
                      placeholder="e.g., Emergency repairs, Installations, Maintenance"
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Bio / Service Description
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={handleInputChange("bio")}
                    rows={4}
                    className={styles.textarea}
                    placeholder="Describe your services, experience, and what makes you unique"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Service Address</label>
                  <div className={styles.inputWrapper}>
                    <MapPin className={styles.inputIcon} />
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={handleInputChange("address")}
                      className={styles.input}
                      placeholder="Enter your service address"
                    />
                  </div>
                </div>

                <div className={styles.buttonContainer}>
                  <button
                    type="button"
                    onClick={handleProfileUpdate}
                    disabled={isLoading}
                    className={`${styles.primaryButton} ${
                      isLoading ? styles.loading : ""
                    }`}
                  >
                    {isLoading ? <div className={styles.spinner} /> : <Save />}
                    <span>{isLoading ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === "photos" && (
              <div className={styles.photosSection}>
                <div className={styles.photosHeader}>
                  <h3>Service Photos</h3>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={styles.addButton}
                    disabled={isLoading}
                  >
                    <Plus />
                    <span>{isLoading ? "Uploading..." : "Add Photos"}</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className={styles.hiddenInput}
                />

                <div className={styles.photosGrid}>
                  {profileData.photos.map((photo: Photo) => (
                    <div key={photo.public_id} className={styles.photoCard}>
                      <img
                        src={photo.url}
                        alt="Service"
                        className={styles.photoImage}
                      />
                      <button
                        onClick={() => handlePhotoDelete(photo.public_id)}
                        className={styles.deleteButton}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  ))}

                  {profileData.photos.length === 0 && (
                    <div className={styles.emptyPhotos}>
                      <div className={styles.emptyPhotosContent}>
                        <Camera className={styles.emptyIcon} />
                        <p>No service photos uploaded yet</p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className={styles.uploadButton}
                          disabled={isLoading}
                        >
                          {isLoading
                            ? "Uploading..."
                            : "Upload Your First Photo"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "password" && (
              <div className={styles.passwordSection}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Current Password</label>
                  <div className={styles.inputWrapper}>
                    <Lock className={styles.inputIcon} />
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange("currentPassword")}
                      className={styles.input}
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>New Password</label>
                  <div className={styles.inputWrapper}>
                    <Lock className={styles.inputIcon} />
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange("newPassword")}
                      className={styles.input}
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Confirm New Password</label>
                  <div className={styles.inputWrapper}>
                    <Lock className={styles.inputIcon} />
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange("confirmPassword")}
                      className={styles.input}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>

                <div className={styles.buttonContainer}>
                  <button
                    type="button"
                    onClick={handlePasswordUpdate}
                    disabled={isLoading}
                    className={`${styles.successButton} ${
                      isLoading ? styles.loading : ""
                    }`}
                  >
                    {isLoading ? <div className={styles.spinner} /> : <Lock />}
                    <span>{isLoading ? "Updating..." : "Update Password"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceProviderDashboard;
