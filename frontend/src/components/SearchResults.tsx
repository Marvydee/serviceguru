import React from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Globe, Mail, ChevronRight, Star, Image } from "lucide-react";
import styles from "../styles/SearchResults.module.css";

export interface ServiceProvider {
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

interface SearchResultsProps {
  results: ServiceProvider[];
  isLoading: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isLoading,
}) => {
  const navigate = useNavigate();

  const handleViewDetails = (providerId: string) => {
    navigate(`/provider/${providerId}`);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Searching for providers in your area...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={styles.emptyResults}>
        <div className={styles.emptyIcon}>🔍</div>
        <h3>No service providers found</h3>
        <p>Try adjusting your search criteria or location</p>
      </div>
    );
  }

  return (
    <div className={styles.resultsContainer}>
      <h2 className={styles.resultsTitle}>
        Found <span className={styles.highlightText}>{results.length}</span>{" "}
        service providers near you
      </h2>

      <div className={styles.resultsList}>
        {results.map((provider) => (
          <div key={provider.id} className={styles.resultCard}>
            <div className={styles.cardHeader}>
              {provider.image ? (
                <div className={styles.providerImageContainer}>
                  <img
                    src={provider.image}
                    alt={`${provider.name}`}
                    className={styles.providerImage}
                  />
                </div>
              ) : (
                <div className={styles.providerImagePlaceholder}>
                  <Image size={32} />
                </div>
              )}

              <div className={styles.headerInfo}>
                <h3 className={styles.providerName}>{provider.name}</h3>
                {provider.service && (
                  <span className={styles.providerService}>
                    {provider.service}
                  </span>
                )}

                {provider.rating !== undefined && (
                  <div className={styles.ratingContainer}>
                    <Star size={16} className={styles.starIcon} />
                    <span className={styles.ratingScore}>
                      {provider.rating.toFixed(1)}
                    </span>
                    {provider.reviewCount && (
                      <span className={styles.reviewCount}>
                        ({provider.reviewCount} reviews)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.cardBody}>
              {provider.bio && (
                <p className={styles.providerBio}>{provider.bio}</p>
              )}

              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <Phone size={16} className={styles.contactIcon} />
                  <span>{provider.phone}</span>
                </div>

                {provider.email && (
                  <div className={styles.contactItem}>
                    <Mail size={16} className={styles.contactIcon} />
                    <span>{provider.email}</span>
                  </div>
                )}

                {provider.website && (
                  <div className={styles.contactItem}>
                    <Globe size={16} className={styles.contactIcon} />
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.websiteLink}
                    >
                      {provider.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.cardFooter}>
              {provider.distance !== undefined && (
                <span className={styles.distance}>
                  {provider.distance < 1
                    ? `${(provider.distance * 1000).toFixed(0)}m away`
                    : `${provider.distance.toFixed(1)}km away`}
                </span>
              )}

              <button
                className={styles.viewDetailsButton}
                onClick={() => handleViewDetails(provider.id)}
              >
                View Details
                <ChevronRight size={16} className={styles.buttonIcon} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
