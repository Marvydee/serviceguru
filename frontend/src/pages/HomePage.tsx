// Fixed HomePage.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/HomePage.module.css";
import Hero from "../components/Hero";
import SearchResults, { ServiceProvider } from "../components/SearchResults";

const HomePage: React.FC = () => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // This function would be called from the Hero component when a search is performed
  const handleSearch = async (
    service: string,
    latitude: number,
    longitude: number
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        "https://serviceguru-p23f.vercel.app/search-services",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            service,
            latitude,
            longitude,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to search for service providers"
        );
      }

      setProviders(data.providers);

      // Scroll to results
      document
        .getElementById("searchResults")
        ?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("Search failed:", err);
      setError((err as Error).message || "An unexpected error occurred");
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (providerId: string) => {
    // Implement navigation to the provider details page
    // Example: router.push(/provider/${providerId});
    console.log(`Viewing details for provider: ${providerId}`);
  };

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🔧</span>
            <span className={styles.logoText}>ServiceGuru</span>
          </div>
          <nav className={styles.nav}>
            <a href="#" className={styles.navLink}>
              How It Works
            </a>
            <a href="#" className={styles.navLink}>
              For Providers
            </a>
            <a href="#" className={styles.navLink}>
              About Us
            </a>
            <Link to="/login" className={styles.loginButton}>
              Log In
            </Link>
            <Link to="/register" className={styles.signupButton}>
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero section with search functionality */}
        <Hero onSearch={handleSearch} />

        {/* Results section */}
        <section id="searchResults" className={styles.resultsSection}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Searching for providers in your area...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>⚠️</div>
              <h3>Error</h3>
              <p>{error}</p>
              <button
                onClick={() => setError(null)}
                className={styles.tryAgainButton}
              >
                Try Again
              </button>
            </div>
          ) : providers.length > 0 ? (
            <SearchResults results={providers} isLoading={false} />
          ) : null}
        </section>

        {/* How it works section */}
        <section className={styles.howItWorksSection}>
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>How ServiceGuru Works</h2>
            <div className={styles.stepsContainer}>
              <div className={styles.step}>
                <div className={styles.stepIcon}>🔍</div>
                <h3>Search</h3>
                <p>
                  Enter your service need and location to find providers near
                  you
                </p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepIcon}>👥</div>
                <h3>Compare</h3>
                <p>
                  Browse profiles, reviews, and pricing to find your perfect
                  match
                </p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepIcon}>📱</div>
                <h3>Connect</h3>
                <p>Contact providers directly and schedule your service</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepIcon}>⭐</div>
                <h3>Review</h3>
                <p>Rate your experience and help others find great service</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>ServiceGuru</h3>
            <p className={styles.footerDescription}>
              Connecting you with trusted local service providers in seconds.
            </p>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerSectionTitle}>Quick Links</h4>
            <ul className={styles.footerLinks}>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="#">How It Works</a>
              </li>
              <li>
                <a href="#">For Providers</a>
              </li>
              <li>
                <a href="#">About Us</a>
              </li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerSectionTitle}>Services</h4>
            <ul className={styles.footerLinks}>
              <li>
                <a href="#">Plumbing</a>
              </li>
              <li>
                <a href="#">Electrical</a>
              </li>
              <li>
                <a href="#">Cleaning</a>
              </li>
              <li>
                <a href="#">Home Repair</a>
              </li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerSectionTitle}>Contact Us</h4>
            <ul className={styles.footerLinks}>
              <li>support@serviceguru.com</li>
              <li>(555) 123-4567</li>
              <li>123 Service St, City, ST 12345</li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>
            &copy; {new Date().getFullYear()} ServiceGuru. All rights reserved.
          </p>
          <div className={styles.footerLegal}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
