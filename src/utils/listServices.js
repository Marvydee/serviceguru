const fetchServices = (place_id) => {
  return new Promise((resolve, reject) => {
    const service = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );

    service.getDetails({ placeId: place_id }, (placeDetails, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        resolve({
          name: placeDetails.name,
          place_id: placeDetails.place_id,
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
        reject(new Error(`Failed to fetch details: ${status}`));
      }
    });
  });
};
export default fetchServices;

