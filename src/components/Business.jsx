import React, { useEffect, useState } from "react";
import fetchBusinesses from "../utils/servicesData";
import { Link } from "react-router-dom";

function BusinessList({ searchTerm }) {
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    fetchBusinesses(searchTerm)
      .then((fetchedBusinesses) => {
        console.log("Fetched Businesses:", fetchedBusinesses); // Log the businesses
        setBusinesses(fetchedBusinesses);
      })
      .catch((error) => {
        console.error("Error fetching businesses:", error);
      });
  }, [searchTerm]);

  return (
    <div>
      <h2>Nearby Service Providers</h2>
      <div id="business-list">
        {businesses.length === 0 ? (
          <p>No data found</p>
        ) : (
          businesses.map((business, index) => (
            <div key={index} className="business-item">
              {business.photo && (
                <Link to={`/business/${business.place_id}`}>
                  {/* Ensure that business.place_id exists */}
                  <img
                    src={
                      business.photo ||
                      "serviceguru-react/src/assets/img/default-image-icon-missing-picture-page-vector-40546530.jpg"
                    }
                    alt={`${business.name}`}
                    className="business-photo"
                  />
                </Link>
              )}
              <div className="business-content">
                <h3 className="business-name">
                  <Link to={`/business/${business.place_id}`}>
                    {business.name}
                  </Link>
                </h3>
                <p>
                  <i className="fas fa-star"></i> Rating: {business.rating}{" "}
                </p>
                <p>
                  <i className="fas fa-phone-alt"></i> {business.phone}
                </p>
                <p>
                  <i className="fas fa-globe"></i>
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {business.name}
                  </a>
                </p>
                <p>
                  <i className="fas fa-map-marker-alt"></i> {business.address}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BusinessList;

