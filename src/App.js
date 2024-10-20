import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Search from "./components/Search";
import BusinessList from "./components/Business";
import BusinessDetails from "./components/Details";
import About from "./components/About";

function SearchBar({ onSearch }) {
  const location = useLocation();

  if (location.pathname === "/") {
    return (
      <div className="row align-items-center g-lg-5 py-5">
        <div className="col-lg-7 text-center text-lg-start">
          <h1 className="display-4 fw-bold lh-1 text-body-emphasis mb-3">
            Find Trusted Service Providers Near You
          </h1>
          <p className="col-lg-10 fs-4">
            Connect with experts for all your needs – from home repairs to
            professional services, we've got you covered.
          </p>
        </div>
        <Search onSearch={onSearch} />
      </div>
    );
  }

  return null;
}

function App() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (term) => {
    setSearchTerm(term); // Update the search term state
  };

  return (
    <Router>
      <Header />
      <div className="container col-xl-10 col-xxl-8 px-4 py-5">
        <SearchBar onSearch={handleSearch} />
      </div>

      <Routes>
        {/* Pass the search term to BusinessList */}
        <Route path="/" element={<BusinessList searchTerm={searchTerm} />} />
        <Route path="/about" element={<About />} />
        <Route path="/business/:place_id" element={<BusinessDetails />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
