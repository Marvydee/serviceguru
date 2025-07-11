// Enhanced HomePage.tsx with Real Icons
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Wrench,
  Zap,
  Sparkles,
  Home,
  Trees,
  Paintbrush,
  Snowflake,
  BrushCleaning,
  Search,
  Users,
  Smartphone,
  Star,
  Shield,
  DollarSign,
  Rocket,
  Lock,
  CheckCircle,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import styles from "../styles/HomePage.module.css";
import Logo from "../components/Logo";
import Hero from "../components/Hero";

const HomePage: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Logo />

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav}>
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

          {/* Mobile Hamburger Button */}
          <button
            className={styles.hamburgerButton}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </button>

          {/* Mobile Navigation Menu */}
          <nav
            className={`${styles.mobileNav} ${
              isMobileMenuOpen ? styles.mobileNavOpen : ""
            }`}
          >
            <div className={styles.mobileNavContent}>
              <button
                className={styles.mobileNavClose}
                onClick={closeMobileMenu}
                aria-label="Close mobile menu"
              >
                ×
              </button>

              <div className={styles.mobileNavLinks}>
                <a
                  href="#"
                  className={styles.mobileNavLink}
                  onClick={closeMobileMenu}
                >
                  How It Works
                </a>
                <a
                  href="#"
                  className={styles.mobileNavLink}
                  onClick={closeMobileMenu}
                >
                  For Providers
                </a>
                <a
                  href="#"
                  className={styles.mobileNavLink}
                  onClick={closeMobileMenu}
                >
                  About Us
                </a>
                <Link
                  to="/login"
                  className={styles.mobileNavLink}
                  onClick={closeMobileMenu}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className={styles.mobileNavButton}
                  onClick={closeMobileMenu}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </nav>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div
              className={styles.mobileNavOverlay}
              onClick={closeMobileMenu}
            ></div>
          )}
        </div>
      </header>

      <main>
        {/* Hero section with search functionality */}
        <Hero />

        {/* Popular Services Section */}
        <section className={styles.popularServicesSection}>
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>Popular Services</h2>
            <p className={styles.sectionSubtitle}>
              Find trusted professionals for the services you need most
            </p>
            <div className={styles.servicesGrid}>
              <div className={styles.serviceCard}>
                <div className={styles.serviceIcon}>
                  <Wrench size={32} />
                </div>
                <h3>Plumbing</h3>
                <p>Emergency repairs, installations, and maintenance</p>
                <span className={styles.serviceProviderCount}>
                  250+ providers
                </span>
              </div>
              <div className={styles.serviceCard}>
                <div className={styles.serviceIcon}>
                  <Zap size={32} />
                </div>
                <h3>Electrical</h3>
                <p>Wiring, lighting, and electrical installations</p>
                <span className={styles.serviceProviderCount}>
                  180+ providers
                </span>
              </div>
              <div className={styles.serviceCard}>
                <div className={styles.serviceIcon}>
                  <Sparkles size={32} />
                </div>
                <h3>House Cleaning</h3>
                <p>Deep cleaning, regular maintenance, and move-in/out</p>
                <span className={styles.serviceProviderCount}>
                  320+ providers
                </span>
              </div>
              <div className={styles.serviceCard}>
                <div className={styles.serviceIcon}>
                  <Home size={32} />
                </div>
                <h3>Home Repair</h3>
                <p>Handyman services, repairs, and maintenance</p>
                <span className={styles.serviceProviderCount}>
                  200+ providers
                </span>
              </div>
              <div className={styles.serviceCard}>
                <div className={styles.serviceIcon}>
                  <Trees size={32} />
                </div>
                <h3>Landscaping</h3>
                <p>Lawn care, garden design, and outdoor maintenance</p>
                <span className={styles.serviceProviderCount}>
                  150+ providers
                </span>
              </div>
              <div className={styles.serviceCard}>
                <div className={styles.serviceIcon}>
                  <Paintbrush size={32} />
                </div>
                <h3>Painting</h3>
                <p>Interior and exterior painting services</p>
                <span className={styles.serviceProviderCount}>
                  120+ providers
                </span>
              </div>
              <div className={styles.serviceCard}>
                <div className={styles.serviceIcon}>
                  <Snowflake size={32} />
                </div>
                <h3>HVAC</h3>
                <p>Heating, cooling, and ventilation services</p>
                <span className={styles.serviceProviderCount}>
                  90+ providers
                </span>
              </div>
              <div className={styles.serviceCard}>
                <div className={styles.serviceIcon}>
                  <BrushCleaning size={32} />
                </div>
                <h3>Carpet Cleaning</h3>
                <p>Deep cleaning and stain removal</p>
                <span className={styles.serviceProviderCount}>
                  85+ providers
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Providers Section */}
        <section className={styles.featuredProvidersSection}>
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>Top-Rated Service Providers</h2>
            <p className={styles.sectionSubtitle}>
              Meet some of our highest-rated professionals
            </p>
            <div className={styles.providersGrid}>
              <div className={styles.providerCard}>
                <div className={styles.providerAvatar}>
                  <img src="/api/placeholder/80/80" alt="Mike Johnson" />
                </div>
                <h3>Mike Johnson</h3>
                <p className={styles.providerService}>Licensed Plumber</p>
                <div className={styles.providerRating}>
                  <span className={styles.stars}>
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                  </span>
                  <span className={styles.ratingText}>4.9 (127 reviews)</span>
                </div>
                <p className={styles.providerDescription}>
                  15+ years of experience in residential and commercial plumbing
                </p>
                <div className={styles.providerBadges}>
                  <span className={styles.badge}>Licensed</span>
                  <span className={styles.badge}>Insured</span>
                </div>
              </div>

              <div className={styles.providerCard}>
                <div className={styles.providerAvatar}>
                  <img src="/api/placeholder/80/80" alt="Sarah Chen" />
                </div>
                <h3>Sarah Chen</h3>
                <p className={styles.providerService}>House Cleaning Expert</p>
                <div className={styles.providerRating}>
                  <span className={styles.stars}>
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                  </span>
                  <span className={styles.ratingText}>4.8 (89 reviews)</span>
                </div>
                <p className={styles.providerDescription}>
                  Eco-friendly cleaning services with attention to detail
                </p>
                <div className={styles.providerBadges}>
                  <span className={styles.badge}>Eco-Friendly</span>
                  <span className={styles.badge}>Bonded</span>
                </div>
              </div>

              <div className={styles.providerCard}>
                <div className={styles.providerAvatar}>
                  <img src="/api/placeholder/80/80" alt="David Martinez" />
                </div>
                <h3>David Martinez</h3>
                <p className={styles.providerService}>Master Electrician</p>
                <div className={styles.providerRating}>
                  <span className={styles.stars}>
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                    <Star size={16} fill="currentColor" />
                  </span>
                  <span className={styles.ratingText}>4.9 (156 reviews)</span>
                </div>
                <p className={styles.providerDescription}>
                  Certified electrician specializing in smart home installations
                </p>
                <div className={styles.providerBadges}>
                  <span className={styles.badge}>Master Certified</span>
                  <span className={styles.badge}>Smart Home</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works section */}
        <section className={styles.howItWorksSection}>
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>How ServiceGuru Works</h2>
            <div className={styles.stepsContainer}>
              <div className={styles.step}>
                <div className={styles.stepIcon}>
                  <Search size={48} />
                </div>
                <h3>Search</h3>
                <p>
                  Enter your service need and location to find providers near
                  you
                </p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepIcon}>
                  <Users size={48} />
                </div>
                <h3>Compare</h3>
                <p>
                  Browse profiles, reviews, and pricing to find your perfect
                  match
                </p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepIcon}>
                  <Smartphone size={48} />
                </div>
                <h3>Connect</h3>
                <p>Contact providers directly and schedule your service</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepIcon}>
                  <Star size={48} />
                </div>
                <h3>Review</h3>
                <p>Rate your experience and help others find great service</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className={styles.whyChooseUsSection}>
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>Why Choose ServiceGuru?</h2>
            <div className={styles.benefitsGrid}>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>
                  <Shield size={48} />
                </div>
                <h3>Verified Professionals</h3>
                <p>
                  All service providers are background-checked and verified for
                  your safety and peace of mind
                </p>
              </div>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>
                  <DollarSign size={48} />
                </div>
                <h3>Competitive Pricing</h3>
                <p>
                  Compare quotes from multiple providers to ensure you get the
                  best value for your money
                </p>
              </div>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>
                  <Rocket size={48} />
                </div>
                <h3>Quick Response</h3>
                <p>
                  Get responses from providers within hours, not days. Many
                  offer same-day service
                </p>
              </div>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>
                  <Lock size={48} />
                </div>
                <h3>Secure Payments</h3>
                <p>
                  Safe and secure payment processing with buyer protection and
                  satisfaction guarantee
                </p>
              </div>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>
                  <CheckCircle size={48} />
                </div>
                <h3>Quality Assurance</h3>
                <p>
                  Real customer reviews and ratings help you make informed
                  decisions
                </p>
              </div>
              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>
                  <Phone size={48} />
                </div>
                <h3>24/7 Support</h3>
                <p>
                  Our customer support team is available around the clock to
                  help you
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className={styles.reviewsSection}>
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>What Our Customers Say</h2>
            <div className={styles.reviewsGrid}>
              <div className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewerInfo}>
                    <img
                      src="/api/placeholder/50/50"
                      alt="Jennifer Wilson"
                      className={styles.reviewerAvatar}
                    />
                    <div>
                      <h4>Jennifer Wilson</h4>
                      <p className={styles.reviewerLocation}>Austin, TX</p>
                    </div>
                  </div>
                  <div className={styles.reviewRating}>
                    <span className={styles.stars}>
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                    </span>
                  </div>
                </div>
                <p className={styles.reviewText}>
                  "Found an amazing plumber through ServiceGuru who fixed my
                  emergency leak within 2 hours. Professional, affordable, and
                  saved my kitchen from flooding!"
                </p>
                <p className={styles.reviewService}>Plumbing Service</p>
              </div>

              <div className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewerInfo}>
                    <img
                      src="/api/placeholder/50/50"
                      alt="Robert Kim"
                      className={styles.reviewerAvatar}
                    />
                    <div>
                      <h4>Robert Kim</h4>
                      <p className={styles.reviewerLocation}>Seattle, WA</p>
                    </div>
                  </div>
                  <div className={styles.reviewRating}>
                    <span className={styles.stars}>
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                    </span>
                  </div>
                </div>
                <p className={styles.reviewText}>
                  "The house cleaning service I booked was exceptional. They
                  were thorough, used eco-friendly products, and my home has
                  never looked better. Highly recommend!"
                </p>
                <p className={styles.reviewService}>House Cleaning</p>
              </div>

              <div className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewerInfo}>
                    <img
                      src="/api/placeholder/50/50"
                      alt="Maria Rodriguez"
                      className={styles.reviewerAvatar}
                    />
                    <div>
                      <h4>Maria Rodriguez</h4>
                      <p className={styles.reviewerLocation}>Phoenix, AZ</p>
                    </div>
                  </div>
                  <div className={styles.reviewRating}>
                    <span className={styles.stars}>
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                    </span>
                  </div>
                </div>
                <p className={styles.reviewText}>
                  "ServiceGuru made finding an electrician so easy! Got multiple
                  quotes, read reviews, and chose the perfect professional for
                  my smart home installation."
                </p>
                <p className={styles.reviewService}>Electrical Work</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className={styles.ctaSection}>
          <div className={styles.sectionContainer}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
              <p className={styles.ctaSubtitle}>
                Join thousands of satisfied customers who found their perfect
                service provider
              </p>
              <div className={styles.ctaButtons}>
                <Link to="/search" className={styles.ctaPrimary}>
                  Find a Service Provider
                </Link>
                <Link to="/provider-signup" className={styles.ctaSecondary}>
                  Become a Provider
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={styles.statsSection}>
          <div className={styles.sectionContainer}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>10,000+</div>
                <div className={styles.statLabel}>Happy Customers</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>1,500+</div>
                <div className={styles.statLabel}>Verified Providers</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>50+</div>
                <div className={styles.statLabel}>Service Categories</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>
                  4.8
                  <Star
                    size={20}
                    fill="currentColor"
                    style={{ display: "inline", marginLeft: "2px" }}
                  />
                </div>
                <div className={styles.statLabel}>Average Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <div className={styles.sectionContainer}>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
            <div className={styles.faqGrid}>
              <div className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>
                  How do I know if a service provider is trustworthy?
                </h3>
                <p className={styles.faqAnswer}>
                  All providers on ServiceGuru are background-checked and
                  verified. You can also read reviews from real customers and
                  check their ratings before making a decision.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>
                  What if I'm not satisfied with the service?
                </h3>
                <p className={styles.faqAnswer}>
                  We offer a satisfaction guarantee. If you're not happy with
                  the service, contact our support team within 24 hours and
                  we'll help resolve the issue or provide a refund.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>
                  How much does it cost to use ServiceGuru?
                </h3>
                <p className={styles.faqAnswer}>
                  It's completely free for customers to search and connect with
                  service providers. You only pay the provider directly for
                  their services.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>
                  Can I get same-day service?
                </h3>
                <p className={styles.faqAnswer}>
                  Many of our providers offer same-day or emergency services.
                  You can filter your search to show only providers who offer
                  immediate availability.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>
                  How do I become a service provider?
                </h3>
                <p className={styles.faqAnswer}>
                  Click "Become a Provider" to start the application process.
                  You'll need to provide business credentials, insurance
                  information, and pass our background check.
                </p>
              </div>
              <div className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>What areas do you serve?</h3>
                <p className={styles.faqAnswer}>
                  ServiceGuru operates in major cities across the United States
                  and is expanding rapidly. Enter your location to see available
                  providers in your area.
                </p>
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
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink}>
                <Facebook size={20} />
              </a>
              <a href="#" className={styles.socialLink}>
                <Twitter size={20} />
              </a>
              <a href="#" className={styles.socialLink}>
                <Instagram size={20} />
              </a>
              <a href="#" className={styles.socialLink}>
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerSectionTitle}>Quick Links</h4>
            <ul className={styles.footerLinks}>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="#how-it-works">How It Works</a>
              </li>
              <li>
                <a href="#for-providers">For Providers</a>
              </li>
              <li>
                <a href="#about">About Us</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
              <li>
                <a href="#careers">Careers</a>
              </li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerSectionTitle}>Popular Services</h4>
            <ul className={styles.footerLinks}>
              <li>
                <a href="#">Plumbing</a>
              </li>
              <li>
                <a href="#">Electrical</a>
              </li>
              <li>
                <a href="#">House Cleaning</a>
              </li>
              <li>
                <a href="#">Home Repair</a>
              </li>
              <li>
                <a href="#">Landscaping</a>
              </li>
              <li>
                <a href="#">HVAC</a>
              </li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerSectionTitle}>Customer Care</h4>
            <ul className={styles.footerLinks}>
              <li>
                <a href="#help">Help Center</a>
              </li>
              <li>
                <a href="#safety">Safety</a>
              </li>
              <li>
                <a href="#guarantee">Service Guarantee</a>
              </li>
              <li>
                <a href="#support">24/7 Support</a>
              </li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4 className={styles.footerSectionTitle}>Contact Info</h4>
            <ul className={styles.footerLinks}>
              <li>
                <Mail
                  size={16}
                  style={{ display: "inline", marginRight: "8px" }}
                />
                support@serviceguru.com
              </li>
              <li>
                <Phone
                  size={16}
                  style={{ display: "inline", marginRight: "8px" }}
                />
                (555) 123-4567
              </li>
              <li>
                <MapPin
                  size={16}
                  style={{ display: "inline", marginRight: "8px" }}
                />
                123 Service St, City, ST 12345
              </li>
              <li>
                <Clock
                  size={16}
                  style={{ display: "inline", marginRight: "8px" }}
                />
                Available 24/7
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>
            &copy; {new Date().getFullYear()} ServiceGuru. All rights reserved.
          </p>
          <div className={styles.footerLegal}>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#cookies">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
