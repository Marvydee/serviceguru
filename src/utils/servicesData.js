import loadGoogleMapsAPI from "./loadAPI";
import fetchNearbyServices from "./nearbyServices";
import fetchServices from "./listServices";
import getUserLocation from "./userLocation";

const fetchBusinesses = async (businessType) => {
  try {
   
    await loadGoogleMapsAPI();

    const position = await getUserLocation();
    const { latitude, longitude } = position.coords;
    const location = { lat: latitude, lng: longitude };

    const businesses = await fetchNearbyServices(location, businessType);

    const detailedBusinesses = await Promise.all(
      businesses.map((business) => fetchServices(business.place_id))
    );

    console.log("Detailed Businesses:", detailedBusinesses);
    return detailedBusinesses;
  } catch (error) {
    console.error("Error:", error);
    throw new Error(error);
  }
};

export default fetchBusinesses;
