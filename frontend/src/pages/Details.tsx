import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Phone,
  Globe,
  Mail,
  MapPin,
  Star,
  ArrowLeft,
  Loader,
  Image,
  MessageCircle,
  Share2,
} from "lucide-react";
import styles from "../styles/Details.module.css";

interface ServiceProvider {
  id: string;
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

const ServiceProviderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviderDetails = async () => {
      if (!id) {
        setError("Provider ID is required");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `https://serviceguru-qlng.onrender.com/providers/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch provider details");
        }

        setProvider(data.provider);
      } catch (error) {
        console.error("Failed to fetch provider details:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load provider details. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviderDetails();
  }, [id]);

  const handleCallProvider = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmailProvider = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleVisitWebsite = (website: string) => {
    const url = website.startsWith("http") ? website : `https://${website}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShare = async () => {
    const shareData = {
      title: provider?.name || "Service Provider",
      text: `Check out ${provider?.name} - ${
        provider?.service || "Service Provider"
      }`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log("Share failed:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingContainer}>
          <Loader className={styles.spinner} size={48} />
          <h2 className={styles.loadingTitle}>Loading provider details...</h2>
          <p className={styles.loadingText}>
            Please wait while we fetch the information
          </p>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>❌</div>
          <h2 className={styles.errorTitle}>Oops! Something went wrong</h2>
          <p className={styles.errorText}>{error || "Provider not found"}</p>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header Section */}
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <ArrowLeft size={20} />
          Back to Results
        </button>

        <button onClick={handleShare} className={styles.shareButton}>
          <Share2 size={20} />
          Share
        </button>
      </div>

      {/* Main Content */}
      <div className={styles.contentContainer}>
        {/* Provider Card */}
        <div className={styles.providerCard}>
          <div className={styles.providerHeader}>
            <div className={styles.providerImageSection}>
              {provider.image ? (
                <img
                  src={provider.image}
                  alt={provider.name}
                  className={styles.providerImage}
                />
              ) : (
                <div className={styles.providerImagePlaceholder}>
                  <Image size={64} />
                </div>
              )}
            </div>

            <div className={styles.providerInfo}>
              <h1 className={styles.providerName}>{provider.name}</h1>

              {provider.service && (
                <div className={styles.serviceTag}>{provider.service}</div>
              )}

              {provider.rating !== undefined && (
                <div className={styles.ratingSection}>
                  <div className={styles.ratingDisplay}>
                    <Star size={20} className={styles.starIcon} />
                    <span className={styles.ratingScore}>
                      {provider.rating.toFixed(1)}
                    </span>
                  </div>
                  {provider.reviewCount && (
                    <span className={styles.reviewCount}>
                      Based on {provider.reviewCount} reviews
                    </span>
                  )}
                </div>
              )}

              {provider.distance !== undefined && (
                <div className={styles.distanceInfo}>
                  <MapPin size={16} className={styles.locationIcon} />
                  <span>
                    {provider.distance < 1
                      ? `${(provider.distance * 1000).toFixed(0)}m away`
                      : `${provider.distance.toFixed(1)}km away`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {provider.bio && (
            <div className={styles.bioSection}>
              <h3 className={styles.sectionTitle}>About</h3>
              <p className={styles.bioText}>{provider.bio}</p>
            </div>
          )}

          {/* Services Section */}
          {provider.services && provider.services.length > 0 && (
            <div className={styles.servicesSection}>
              <h3 className={styles.sectionTitle}>Services Offered</h3>
              <div className={styles.servicesList}>
                {provider.services.map((service, index) => (
                  <div key={index} className={styles.serviceItem}>
                    {service}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className={styles.contactSection}>
            <h3 className={styles.sectionTitle}>Contact Information</h3>

            <div className={styles.contactGrid}>
              <div className={styles.contactItem}>
                <div className={styles.contactHeader}>
                  <Phone size={20} className={styles.contactIcon} />
                  <span className={styles.contactLabel}>Phone</span>
                </div>
                <span className={styles.contactValue}>{provider.phone}</span>
              </div>

              {provider.email && (
                <div className={styles.contactItem}>
                  <div className={styles.contactHeader}>
                    <Mail size={20} className={styles.contactIcon} />
                    <span className={styles.contactLabel}>Email</span>
                  </div>
                  <span className={styles.contactValue}>{provider.email}</span>
                </div>
              )}

              {provider.website && (
                <div className={styles.contactItem}>
                  <div className={styles.contactHeader}>
                    <Globe size={20} className={styles.contactIcon} />
                    <span className={styles.contactLabel}>Website</span>
                  </div>
                  <span className={styles.contactValue}>
                    {provider.website.replace(/^https?:\/\//, "")}
                  </span>
                </div>
              )}

              {provider.address && (
                <div className={styles.contactItem}>
                  <div className={styles.contactHeader}>
                    <MapPin size={20} className={styles.contactIcon} />
                    <span className={styles.contactLabel}>Address</span>
                  </div>
                  <span className={styles.contactValue}>
                    {provider.address}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionSection}>
          <button
            onClick={() => handleCallProvider(provider.phone)}
            className={`${styles.actionButton} ${styles.primaryAction}`}
          >
            <Phone size={20} />
            Call Now
          </button>

          {provider.email && (
            <button
              onClick={() => handleEmailProvider(provider.email as string)}
              className={`${styles.actionButton} ${styles.secondaryAction}`}
            >
              <Mail size={20} />
              Send Email
            </button>
          )}

          {provider.website && (
            <button
              onClick={() => handleVisitWebsite(provider.website!)}
              className={`${styles.actionButton} ${styles.secondaryAction}`}
            >
              <Globe size={20} />
              Visit Website
            </button>
          )}

          <button
            className={`${styles.actionButton} ${styles.secondaryAction}`}
          >
            <MessageCircle size={20} />
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviderDetails;
