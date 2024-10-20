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
    
  );
}

export default Search;

