import React, { useState, useEffect, useCallback } from "react";
import { Search, MapPin, ArrowRight, Loader, X } from "lucide-react";
import styles from "../styles/Hero.module.css";
import SearchResults from "../components/SearchResults";

interface HeroProps {
  onSearch: (service: string, latitude: number, longitude: number) => void;
}

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
}

interface ServiceSuggestion {
  id: string;
  name: string;
  category: string;
}

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

const Hero: React.FC<HeroProps> = ({ onSearch }) => {
  const [service, setService] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] =
    useState<boolean>(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<ServiceProvider[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);

  // New states for predictive search
  const [serviceSuggestions, setServiceSuggestions] = useState<
    ServiceSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] =
    useState<boolean>(false);

  const popularCategories: ServiceCategory[] = [
    { id: "1", name: "Plumbing", icon: "🔧" },
    { id: "2", name: "Electrical", icon: "⚡" },
    { id: "3", name: "Cleaning", icon: "🧹" },
    { id: "4", name: "Landscaping", icon: "🌱" },
    { id: "5", name: "Home Repair", icon: "🏠" },
  ];

  // Comprehensive service suggestions database
  const allServices: ServiceSuggestion[] = [
    // Plumbing
    { id: "1", name: "Plumbing Repair", category: "Plumbing" },
    { id: "2", name: "Pipe Installation", category: "Plumbing" },
    { id: "3", name: "Drain Cleaning", category: "Plumbing" },
    { id: "4", name: "Water Heater Repair", category: "Plumbing" },
    { id: "5", name: "Toilet Repair", category: "Plumbing" },
    { id: "6", name: "Faucet Installation", category: "Plumbing" },

    // Electrical
    { id: "7", name: "Electrical Wiring", category: "Electrical" },
    { id: "8", name: "Electrical Panel Upgrade", category: "Electrical" },
    { id: "9", name: "Light Installation", category: "Electrical" },
    { id: "10", name: "Outlet Installation", category: "Electrical" },
    { id: "11", name: "Ceiling Fan Installation", category: "Electrical" },
    { id: "12", name: "Electrical Troubleshooting", category: "Electrical" },

    // Cleaning
    { id: "13", name: "House Cleaning", category: "Cleaning" },
    { id: "14", name: "Deep Cleaning", category: "Cleaning" },
    { id: "15", name: "Carpet Cleaning", category: "Cleaning" },
    { id: "16", name: "Window Cleaning", category: "Cleaning" },
    { id: "17", name: "Office Cleaning", category: "Cleaning" },
    { id: "18", name: "Move-in Cleaning", category: "Cleaning" },

    // Landscaping
    { id: "19", name: "Lawn Mowing", category: "Landscaping" },
    { id: "20", name: "Tree Trimming", category: "Landscaping" },
    { id: "21", name: "Garden Design", category: "Landscaping" },
    { id: "22", name: "Hedge Trimming", category: "Landscaping" },
    { id: "23", name: "Sprinkler Installation", category: "Landscaping" },
    { id: "24", name: "Lawn Care", category: "Landscaping" },

    // Home Repair
    { id: "25", name: "Handyman Services", category: "Home Repair" },
    { id: "26", name: "Drywall Repair", category: "Home Repair" },
    { id: "27", name: "Painting", category: "Home Repair" },
    { id: "28", name: "Door Repair", category: "Home Repair" },
    { id: "29", name: "Window Repair", category: "Home Repair" },
    { id: "30", name: "Flooring Installation", category: "Home Repair" },

    // Additional services
    { id: "31", name: "HVAC Repair", category: "HVAC" },
    { id: "32", name: "Air Conditioning", category: "HVAC" },
    { id: "33", name: "Heating Repair", category: "HVAC" },
    { id: "34", name: "Appliance Repair", category: "Appliances" },
    { id: "35", name: "Refrigerator Repair", category: "Appliances" },
    { id: "36", name: "Roofing", category: "Construction" },
    { id: "37", name: "Gutter Cleaning", category: "Maintenance" },
    { id: "38", name: "Pressure Washing", category: "Cleaning" },
    { id: "39", name: "Pest Control", category: "Pest Control" },
    { id: "40", name: "Locksmith", category: "Security" },
  ];

  // Debounced function to fetch service suggestions from API
  const fetchServiceSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length === 0) {
        setServiceSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoadingSuggestions(true);

      try {
        const response = await fetch(
          `/api/service-suggestions?query=${encodeURIComponent(query)}&limit=8`
        );
        const data = await response.json();

        if (data.success && data.suggestions) {
          setServiceSuggestions(data.suggestions);
          setShowSuggestions(data.suggestions.length > 0);
        } else {
          // Fallback to local suggestions if API fails
          const filtered = allServices
            .filter(
              (service) =>
                service.name.toLowerCase().includes(query.toLowerCase()) ||
                service.category.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 8);

          setServiceSuggestions(filtered);
          setShowSuggestions(filtered.length > 0);
        }
      } catch (error) {
        console.error("Suggestions API error:", error);
        // Fallback to local suggestions
        const filtered = allServices
          .filter(
            (service) =>
              service.name.toLowerCase().includes(query.toLowerCase()) ||
              service.category.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 8);

        setServiceSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300),
    []
  );

  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Handle service input change with predictive search
  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setService(value);
    fetchServiceSuggestions(value);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: ServiceSuggestion) => {
    setService(suggestion.name);
    setShowSuggestions(false);
    setServiceSuggestions([]);
  };

  // Clear suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`.${styles.inputWrapper}`)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCurrentLocation = () => {
    setIsUsingCurrentLocation(true);
    setSearchError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLatitude(latitude);
          setLongitude(longitude);
          setLocation("Current Location");
          setIsUsingCurrentLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setSearchError(
            "Could not access your location. Please enter it manually."
          );
          setLocation("");
          setIsUsingCurrentLocation(false);
        }
      );
    } else {
      setSearchError("Geolocation is not supported by your browser");
      setIsUsingCurrentLocation(false);
    }
  };

  // Modified handleSearch function to use only backend data
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!latitude || !longitude) {
      setSearchError("Please provide your location");
      return;
    }

    if (!service.trim()) {
      setSearchError("Please specify what service you need");
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);
      setShowSuggestions(false);

      // API call to backend
      const response = await fetch(
        "https://serviceguru-p23f.vercel.app/search-services",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            service: service.trim(),
            latitude,
            longitude,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      // Check if the API response indicates success
      if (!data.success) {
        throw new Error(data.message || "Search failed");
      }

      // Update search results with backend data only
      setSearchResults(data.providers || []);
      setShowResults(true);

      // Call the onSearch prop for parent component
      onSearch(service, latitude, longitude);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchError(
        error instanceof Error
          ? error.message
          : "Failed to search for services. Please try again."
      );

      // Clear results on error - no mock data
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    setService(categoryName);
    setShowSuggestions(false);
  };

  const handleViewDetails = (providerId: string) => {
    // Navigate to provider details page
    console.log(`Viewing details for provider: ${providerId}`);
    // Example: navigate(`/provider/${providerId}`);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Find Local Service Providers in Seconds
          </h1>
          <p className={styles.subtitle}>
            Connect with trusted professionals near you for all your service
            needs
          </p>

          {searchError && (
            <div className={styles.errorMessage}>
              {searchError}
              <button
                onClick={() => setSearchError(null)}
                className={styles.closeError}
              >
                <X size={16} />
              </button>
            </div>
          )}

          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchInputGroup}>
              <div className={styles.inputWrapper}>
                <MapPin className={styles.inputIcon} size={20} />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Your location"
                  className={styles.input}
                  disabled={isUsingCurrentLocation}
                />
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className={styles.locationButton}
                  disabled={isUsingCurrentLocation}
                >
                  {isUsingCurrentLocation ? (
                    <>
                      <Loader size={16} className={styles.loaderIcon} />
                      Detecting...
                    </>
                  ) : (
                    "Current Location"
                  )}
                </button>
              </div>

              <div className={styles.inputWrapper}>
                <Search className={styles.inputIcon} size={20} />
                <input
                  type="text"
                  value={service}
                  onChange={handleServiceChange}
                  placeholder="What service do you need?"
                  className={styles.input}
                  autoComplete="off"
                />

                {/* Service Suggestions Dropdown */}
                {showSuggestions && (
                  <div className={styles.suggestionsDropdown}>
                    {isLoadingSuggestions ? (
                      <div className={styles.suggestionItem}>
                        <Loader size={16} className={styles.loaderIcon} />
                        <span>Loading suggestions...</span>
                      </div>
                    ) : (
                      serviceSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className={styles.suggestionItem}
                          onClick={() => handleSuggestionSelect(suggestion)}
                        >
                          <Search size={14} />
                          <div className={styles.suggestionContent}>
                            <span className={styles.suggestionName}>
                              {suggestion.name}
                            </span>
                            <span className={styles.suggestionCategory}>
                              {suggestion.category}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className={styles.searchButton}
                  disabled={
                    isSearching || !service.trim() || !latitude || !longitude
                  }
                >
                  {isSearching ? (
                    <>
                      <Loader size={18} className={styles.loaderIcon} />
                      Searching...
                    </>
                  ) : (
                    <>
                      Find Services <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          <div className={styles.categoriesSection}>
            <h3 className={styles.categoriesTitle}>Popular Services</h3>
            <div className={styles.categories}>
              {popularCategories.map((category) => (
                <button
                  key={category.id}
                  className={styles.categoryItem}
                  onClick={() => handleCategoryClick(category.name)}
                >
                  <span className={styles.categoryIcon}>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.heroImageContainer}>
          <div className={styles.heroImageOverlay}></div>
          <div className={styles.trustBadge}>
            <span className={styles.rating}>★ 4.9</span>
            <span className={styles.ratingText}>Trusted by 10,000+ users</span>
          </div>
        </div>
      </div>

      {showResults && (
        <div className={styles.resultsSection}>
          <SearchResults results={searchResults} isLoading={isSearching} />
        </div>
      )}
    </div>
  );
};

export default Hero;
