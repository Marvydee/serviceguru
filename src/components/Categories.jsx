import React from "react";

const Categories = ({ onCategorySelect }) => {
  const categories = [
    { name: "Restaurants", type: "restaurant" },
    { name: "Electrician", type: "electrician" },
    { name: "Mechanic", type: "car_repair" },
    { name: "Plumbers", type: "plumber" },
    { name: "Laundry Service", type: "laundry" },
    { name: "Locksmith", type: "locksmith" },
    { name: "Painter", type: "painter" },
    { name: "Veterinary Care", type: "veterinary_care" },
  ];

  return (
    <div className="categories">
      <h2>Select a Category</h2>
      <div className="tab-list">
        {categories.map((category, index) => (
          <span
            key={index}
            onClick={() => onCategorySelect(category.type)}
            className="tab"
            role="button"
            tabIndex={0}
          >
            {category.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Categories;

