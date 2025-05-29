import React, { useState, useRef, ChangeEvent } from "react";
import {
  User,
  Camera,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  //   X,
  Plus,
  Trash2,
} from "lucide-react";
import styles from "../styles/ServiceProviderDashboard.module.css";

// Type definitions
interface GeoLocation {
  coordinates: [number, number];
}

interface Photo {
  url: string;
  public_id: string;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  service: string;
  description: string;
  address: string;
  geoLocation: GeoLocation;
  photos: Photo[];
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type TabType = "profile" | "photos" | "password";

const ServiceProviderDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+234 801 234 5678",
    service: "Plumbing",
    description: "Professional plumber with 5+ years of experience",
    address: "123 Lagos Street, Victoria Island",
    geoLocation: {
      coordinates: [3.3792, 6.5244],
    },
    photos: [
      { url: "/api/placeholder/300/200", public_id: "photo1" },
      { url: "/api/placeholder/300/200", public_id: "photo2" },
    ],
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileUpdate = async (): Promise<void> => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert("Profile updated successfully!");
    }, 1500);
  };

  const handlePasswordUpdate = async (): Promise<void> => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      alert("Password updated successfully!");
    }, 1500);
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    fileArray.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          const newPhoto: Photo = {
            url: result,
            public_id: `photo_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
          };
          setProfileData((prev) => ({
            ...prev,
            photos: [...prev.photos, newPhoto],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoDelete = (public_id: string): void => {
    setProfileData((prev) => ({
      ...prev,
      photos: prev.photos.filter((photo) => photo.public_id !== public_id),
    }));
  };

  const handleInputChange =
    (field: keyof ProfileData) =>
    (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ): void => {
      setProfileData((prev) => ({ ...prev, [field]: e.target.value }));
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

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <div className={styles.logo}>
              <span>SG</span>
            </div>
            <div className={styles.logoText}>
              <h1>ServiceGuru</h1>
              <p>Provider Dashboard</p>
            </div>
          </div>
          <div className={styles.userSection}>
            <div className={styles.userAvatar}>
              <User />
            </div>
            <span className={styles.userName}>{profileData.name}</span>
          </div>
        </div>
      </header>

      <main className={styles.main}>
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
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Service Type</label>
                    <select
                      value={profileData.service}
                      onChange={handleInputChange("service")}
                      className={styles.select}
                    >
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Carpentry">Carpentry</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Gardening">Gardening</option>
                    </select>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Service Description</label>
                  <textarea
                    value={profileData.description}
                    onChange={handleInputChange("description")}
                    rows={4}
                    className={styles.textarea}
                    placeholder="Describe your services and experience"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Address</label>
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
                  >
                    <Plus />
                    <span>Add Photos</span>
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
                        >
                          Upload Your First Photo
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
