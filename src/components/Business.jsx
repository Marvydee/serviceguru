import React, { useEffect, useState } from "react";
import { fetchBusinesses } from "../utils/services";

function BusinessList({ searchTerm }) {
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    fetchBusinesses(setBusinesses, searchTerm);
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
                <img
                  src={
                    business.photo ||
                    "serviceguru-react/src/assets/img/default-image-icon-missing-picture-page-vector-40546530.jpg"
                  }
                  alt={`${business.name}`}
                  className="business-photo"
                />
              )}
              <div className="business-details">
                <h3 className="business-name">{business.name}</h3>
                <p>
                  <i className="fas fa-star"></i> Rating: {business.rating}{" "}
                </p>
                <p>
                  <i className="fas fa-phone-alt"></i>
                  {business.phone}
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
                  <i className="fas fa-map-marker-alt"></i>
                  {business.address}
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

