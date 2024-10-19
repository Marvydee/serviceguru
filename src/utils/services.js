export const fetchBusinesses = (businessType) => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };

          const request = {
            location,
            radius: "5000", // 5km radius
            type: [businessType], // Use the Input provided by the user
          };

          const service = new window.google.maps.places.PlacesService(
            document.createElement("div")
          );

          service.nearbySearch(request, (results, status) => {
            console.log("Results:", results); // Log the raw results
            console.log("Status:", status);
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              // Map over results to fetch details for each business
              const detailedBusinesses = results.map((business) => {
                return new Promise((resolve) => {
                  // Retrieve detailed information for each business
                  service.getDetails(
                    { placeId: business.place_id }, // Ensure you pass the place_id
                    (placeDetails, detailsStatus) => {
                      if (
                        detailsStatus ===
                        window.google.maps.places.PlacesServiceStatus.OK
                      ) {
                        resolve({
                          name: placeDetails.name,
                          place_id: placeDetails.place_id, // Include place_id
                          phone: placeDetails.formatted_phone_number || "N/A",
                          website: placeDetails.website || "N/A",
                          address: placeDetails.vicinity || "N/A",
                          photo: placeDetails.photos
                            ? placeDetails.photos[0].getUrl()
                            : "serviceguru-react/src/assets/img/default-image-icon-missing-picture-page-vector-40546530.jpg",
                          rating: placeDetails.rating || "No rating available",
                          latitude: placeDetails.geometry.location.lat(),
                          longitude: placeDetails.geometry.location.lng(),
                        });
                      } else {
                        resolve({
                          name: business.name,
                          place_id: business.place_id, // Include place_id in case of failure too
                          phone: "N/A",
                          website: "N/A",
                          address: "N/A",
                          photo:
                            "serviceguru-react/src/assets/img/default-image-icon-missing-picture-page-vector-40546530.jpg",
                          rating: "No rating available",
                          latitude: null,
                          longitude: null,
                        });
                      }
                    }
                  );
                });
              });

              // Wait for all promises to resolve
              Promise.all(detailedBusinesses)
                .then((results) => {
                  console.log("Detailed Businesses:", results); // Log the detailed businesses
                  resolve(results);
                })
                .catch((error) => {
                  console.error("Error fetching business details:", error);
                  reject("Error fetching detailed business information.");
                });
            } else {
              reject(`Failed to fetch businesses: ${status}`);
            }
          });
        },
        (error) => {
          reject(`Geolocation error: ${error.message}`);
        }
      );
    } else {
      reject("Geolocation is not supported by this browser.");
    }
  });
};

export const fetchBusinessDetails = (place_id) => {
  return new Promise((resolve, reject) => {
    const service = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );

    service.getDetails({ placeId: place_id }, (details, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        resolve({
          name: details.name,
          phone: details.formatted_phone_number || "N/A",
          website: details.website || "N/A",
          address: details.vicinity || "N/A",
          photo: details.photos ? details.photos[0].getUrl() : null,
          rating: details.rating || "No rating available",
          latitude: details.geometry.location.lat(), // Get latitude
          longitude: details.geometry.location.lng(), // Get longitude
        });
      } else {
        reject(`Failed to fetch business details: ${status}`);
      }
    });
  });
};
