import React, { useEffect, useState } from "react";
import { fetchBusinesses } from "../utils/services";

function BusinessList({ searchTerm }) {
	const [businesses, setBusinesses] = useState([]);

	useEffect(() => {
		fetchBusinesses(setBusinesses searchTerm);
	}, [searchTerm]);

	return
