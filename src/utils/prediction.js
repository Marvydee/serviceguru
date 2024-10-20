const businessTypes = [
  { name: "Restaurant", type: "restaurant" },
  { name: "Bank", type: "bank" },
  { name: "Hospital", type: "hospital" },
  { name: "Café", type: "cafe" },
  { name: "Gym", type: "gym" },
  { name: "Pharmacy", type: "pharmacy" },
  { name: "Supermarket", type: "supermarket" },
  { name: "Bakery", type: "bakery" },
  { name: "Car Rental", type: "car_rental" },
  { name: "Clothing Store", type: "clothing_store" },
  { name: "Accounting Services", type: "accounting" },
  { name: "Beauty Salon", type: "beauty_salon" },
  { name: "Bookstore", type: "book_store" },
  { name: "Car Dealer", type: "car_dealer" },
  { name: "Mechanic", type: "car_repair" },
  { name: "Car Wash", type: "car_wash" },
  { name: "Dentist", type: "dentist" },
  { name: "Doctor", type: "doctor" },
  { name: "Electrician", type: "electrician" },
  { name: "Insurance Agency", type: "insurance_agency" },
  { name: "Laundry Service", type: "laundry" },
  { name: "Lawyer", type: "lawyer" },
  { name: "Locksmith", type: "locksmith" },
  { name: "Meal Delivery", type: "meal_delivery" },
  { name: "Takeaway", type: "meal_takeaway" },
  { name: "Moving Company", type: "moving_company" },
  { name: "Museum", type: "museum" },
  { name: "Painter", type: "painter" },
  { name: "Physiotherapist", type: "physiotherapist" },
  { name: "Plumber", type: "plumber" },
  { name: "Police Station", type: "police" },
  { name: "Real Estate Agency", type: "real_estate_agency" },
  { name: "Roofing Contractor", type: "roofing_contractor" },
  { name: "Travel Agency", type: "travel_agency" },
  { name: "Veterinary Care", type: "veterinary_care" },
];

const filterBusinessTypes = (input) => {
  return businessTypes.filter((business) =>
    business.name.toLowerCase().startsWith(input.toLowerCase())
  );
};

export default filterBusinessTypes;
