import React, { useState, useEffect, useCallback } from "react";
import { Search, MapPin, ArrowRight, Loader, X } from "lucide-react";
import styles from "../styles/Hero.module.css";
import SearchResults from "../components/SearchResults";
import { serviceOptions } from "../data/serviceOptions";

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

const Hero: React.FC = () => {
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

  useEffect(() => {
    const cached = localStorage.getItem("lastSearchData");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setService(parsed.service || "");
        setLatitude(parsed.latitude || null);
        setLongitude(parsed.longitude || null);
        setSearchResults(parsed.results || []);
        setShowResults(true);
      } catch (e) {
        console.warn("Failed to restore previous search:", e);
      }
    }
  }, []);

  // Comprehensive service suggestions database
  const allServices: ServiceSuggestion[] = serviceOptions.map(
    (name, index) => ({
      id: (index + 1).toString(),
      name,
      category: name,
    })
  );

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
      console.log("🔍 Starting search with:", {
        service: service.trim(),
        latitude,
        longitude,
      });

      // API call to backend
      const response = await fetch(
        "https://serviceguru-qlng.onrender.com/search-services",
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
      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Response not ok:", errorData);
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("📦 Response data:", data);

      // Check if the API response indicates success
      if (!data.success) {
        console.error("❌ API returned success: false");
        throw new Error(data.message || "Search failed");
      }
      console.log(
        "✅ Search successful, providers found:",
        data.providers?.length || 0
      );

      // Update search results with backend data only
      setSearchResults(data.providers || []);
      setShowResults(true);
      localStorage.setItem(
        "lastSearchData",
        JSON.stringify({
          results: data.providers || [],
          service: service.trim(),
          latitude,
          longitude,
        })
      );

      // Call the onSearch prop for parent component
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
