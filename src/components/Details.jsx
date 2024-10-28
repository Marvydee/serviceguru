import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import fetchServices from "../utils/listServices";

const BusinessDetails = () => {
  const { place_id } = useParams();
  console.log("Fetched place_id:", place_id);
  const [business, setBusiness] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServices(place_id)
      .then((data) => {
        setBusiness(data);
      })
      .catch((error) => {
        setError("Failed to fetch business details: " + error);
      });
  }, [place_id]);

  useEffect(() => {
    if (business) {
      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: business.latitude, lng: business.longitude },
        zoom: 15,
      });

      new window.google.maps.Marker({
        position: { lat: business.latitude, lng: business.longitude },
        map,
      });
    }
  }, [business]);

  if (error) return <p>{error}</p>;
  if (!business) return <p>Loading business details...</p>;

  return (
    <div className="business-details">
      <h1>{business.name}</h1>
      <img src={business.photo || "default-image.jpg"} alt={business.name} />
      <p>{business.description}</p>

      <div className="details-icons">
        <i className="fas fa-map-marker-alt"></i>
        <span>Address: {business.address}</span>
      </div>

      <div className="details-icons">
        <i className="fas fa-phone"></i>
        <span>Phone: {business.phone}</span>
      </div>

      <div className="details-icons rating">
        <i className="fas fa-star"></i>
        <span>Rating: {business.rating}</span>
      </div>

      <div id="map"></div>

      <div className="reviews-section">
        <h2>Customer Reviews</h2>
        <ul>
          {business.reviews && business.reviews.length > 0 ? (
            business.reviews.map((review, index) => (
              <li key={index}>
                <p>{review.text}</p>
                <p className="rating">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <i key={i} className="fas fa-star"></i>
                  ))}
                  Rating: {review.rating}
                </p>
              </li>
            ))
          ) : (
            <p className="no-reviews">No reviews available</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default BusinessDetails;

