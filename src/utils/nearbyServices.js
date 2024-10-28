const fetchNearbyServices = (location, businessType) => {
  return new Promise((resolve, reject) => {
    const service = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );

    const request = {
      location,
      radius: "5000", // 5km radius
      type: [businessType], // Business type input
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        resolve(results);
      } else {
        reject(`Failed to fetch service: ${status}`);
      }
    });
  });
};

export default fetchNearbyServices;
