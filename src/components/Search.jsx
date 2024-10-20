import React, { useState } from "react";
import filterBusinessTypes from "../utils/prediction";

function Search({ onSearch }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = (e) => {
    const searchTerm = e.target.value;
    setInput(searchTerm);

    if (searchTerm) {
      setSuggestions(filterBusinessTypes(searchTerm));
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setInput(suggestion.name);
    setSuggestions([]);
    onSearch(suggestion.type);
  };

  return (
    <div className="col-md-10 mx-auto col-lg-5">
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="Search for service type..."
        className="search-input"
      />

      <ul className="suggestions-list">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            className="suggestion-item"
            onClick={() => handleSelectSuggestion(suggestion)}
          >
            {suggestion.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Search;

