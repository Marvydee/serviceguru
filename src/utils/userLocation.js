const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(resolve, (error) => {
        reject(`Geolocation error: ${error.message}`);
      });
    } else {
      reject("Geolocation is not supported by this browser.");
    }
  });
};

export default getUserLocation;
