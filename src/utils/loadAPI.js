const apiKey = process.env.REACT_APP_API_KEY;

const loadGoogleMapsAPI = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=3.49`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
};

export default loadGoogleMapsAPI;
