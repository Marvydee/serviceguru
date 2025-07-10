const ServiceProvider = require("../models/ServiceProvider");

exports.searchProviders = async (req, res) => {
  try {
    const { latitude, longitude, service, radius } = req.body;

    // Enhanced validation
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Location coordinates are required",
        error: "MISSING_COORDINATES",
      });
    }

    if (!service || service.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Service type is required",
        error: "MISSING_SERVICE",
      });
    }

    // Validate coordinate ranges
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates provided",
        error: "INVALID_COORDINATES",
      });
    }

    // Convert radius from miles to meters (default 10km if not provided)
    const searchRadius = radius ? radius * 1609.34 : 10000; // 1 mile = 1609.34 meters
    const maxRadius = 80467; // Limit to 50 miles maximum

    if (searchRadius > maxRadius) {
      return res.status(400).json({
        success: false,
        message: "Search radius too large. Maximum 50 miles allowed.",
        error: "RADIUS_TOO_LARGE",
      });
    }

    // Build search query based on your schema
    const searchQuery = {
      service: new RegExp(service.trim(), "i"), // Match service field
      geoLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: searchRadius,
        },
      },
    };

    console.log(
      `Searching for "${service}" within ${
        searchRadius / 1000
      }km of [${latitude}, ${longitude}]`
    );

    // Execute search with sorting and limiting
    const providers = await ServiceProvider.find(searchQuery)
      .select("-password -__v") // Exclude sensitive and unnecessary fields
      .limit(50) // Limit results for performance
      .lean(); // Return plain objects for better performance

    // Calculate actual distances and add to results
    const providersWithDistance = providers.map((provider) => {
      if (provider.geoLocation && provider.geoLocation.coordinates) {
        const providerLon = provider.geoLocation.coordinates[0];
        const providerLat = provider.geoLocation.coordinates[1];
        const distance = calculateDistance(
          latitude,
          longitude,
          providerLat,
          providerLon
        );

        return {
          ...provider,
          distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
          distanceUnit: "miles",
        };
      }
      return provider;
    });

    // Sort by distance (closest first)
    providersWithDistance.sort(
      (a, b) => (a.distance || 999) - (b.distance || 999)
    );

    // Enhanced response
    res.json({
      success: true,
      providers: providersWithDistance,
      meta: {
        totalResults: providersWithDistance.length,
        searchRadius: Math.round((searchRadius / 1609.34) * 100) / 100, // Convert back to miles
        searchLocation: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        },
        searchTerm: service.trim(),
      },
    });
  } catch (err) {
    console.error("Search Error:", err);

    // Handle specific MongoDB errors
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid location data format",
        error: "INVALID_LOCATION_FORMAT",
      });
    }

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry error",
        error: "DUPLICATE_ENTRY",
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: "Internal server error occurred during search",
      error: "SEARCH_ERROR",
      ...(process.env.NODE_ENV === "development" && { details: err.message }),
    });
  }
};

// Utility function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
}

// Additional endpoint for service suggestions (for predictive search)
exports.getServiceSuggestions = async (req, res) => {
  try {
    const { query, limit = 8 } = req.query;

    if (!query || query.length < 1) {
      return res.json({ success: true, suggestions: [] });
    }

    // Get unique services from existing providers based on your schema
    const suggestions = await ServiceProvider.aggregate([
      {
        $match: {
          service: new RegExp(query, "i"), // Match service field only
        },
      },
      {
        $group: {
          _id: "$service",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          category: "$_id", // Use service name as category since no separate category field
          providerCount: "$count",
        },
      },
      {
        $sort: { providerCount: -1 },
      },
      {
        $limit: parseInt(limit),
      },
    ]);

    res.json({
      success: true,
      suggestions: suggestions.map((item, index) => ({
        id: `suggestion_${index}`,
        name: item.name,
        category: item.category || "General",
        providerCount: item.providerCount,
      })),
    });
  } catch (err) {
    console.error("Suggestions Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch suggestions",
      error: "SUGGESTIONS_ERROR",
    });
  }
};

exports.getProviderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || id.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provider ID is required",
        error: "MISSING_PROVIDER_ID",
      });
    }

    // Check if ID is a valid MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider ID format",
        error: "INVALID_PROVIDER_ID",
      });
    }

    console.log(`Fetching provider details for ID: ${id}`);

    // Find provider by ID
    const provider = await ServiceProvider.findById(id)
      .select("-password -__v") // Exclude sensitive and unnecessary fields
      .lean(); // Return plain object for better performance

    // Check if provider exists
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Service provider not found",
        error: "PROVIDER_NOT_FOUND",
      });
    }

    // Add additional computed fields if needed
    const enhancedProvider = {
      ...provider,
      id: p._id.toString(),
      formattedPhone: formatPhoneNumber(provider.phone),
      fullWebsiteUrl:
        provider.website && !provider.website.startsWith("http")
          ? `https://${provider.website}`
          : provider.website,
      // Add any other computed fields you need
    };

    // Success response
    res.json({
      success: true,
      provider: enhancedProvider,
      meta: {
        fetchedAt: new Date().toISOString(),
        providerId: id,
      },
    });
  } catch (err) {
    console.error("Provider Details Error:", err);

    // Handle specific MongoDB errors
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid provider ID format",
        error: "INVALID_PROVIDER_ID",
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: "Internal server error occurred while fetching provider details",
      error: "PROVIDER_FETCH_ERROR",
      ...(process.env.NODE_ENV === "development" && { details: err.message }),
    });
  }
};

// Get multiple providers by IDs (useful for favorites, bookmarks, etc.)
exports.getProvidersByIds = async (req, res) => {
  try {
    const { ids } = req.body;

    // Validate input
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provider IDs array is required",
        error: "MISSING_PROVIDER_IDS",
      });
    }

    // Limit the number of IDs to prevent abuse
    if (ids.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Too many provider IDs. Maximum 50 allowed.",
        error: "TOO_MANY_IDS",
      });
    }

    // Validate each ID format
    const invalidIds = ids.filter((id) => !id.match(/^[0-9a-fA-F]{24}$/));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid provider ID format(s) found",
        error: "INVALID_PROVIDER_IDS",
        invalidIds: invalidIds,
      });
    }

    console.log(`Fetching details for ${ids.length} providers`);

    // Find all providers by their IDs
    const providers = await ServiceProvider.find({
      _id: { $in: ids },
    })
      .select("-password -__v")
      .lean();

    // Enhance providers with additional data if needed
    const enhancedProviders = providers.map((provider) => ({
      ...provider,
      formattedPhone: formatPhoneNumber(provider.phone),
      fullWebsiteUrl:
        provider.website && !provider.website.startsWith("http")
          ? `https://${provider.website}`
          : provider.website,
    }));

    // Find which IDs were not found
    const foundIds = providers.map((p) => p._id.toString());
    const notFoundIds = ids.filter((id) => !foundIds.includes(id));

    res.json({
      success: true,
      providers: enhancedProviders,
      meta: {
        totalRequested: ids.length,
        totalFound: providers.length,
        notFoundIds: notFoundIds,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Multiple Providers Fetch Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred while fetching providers",
      error: "PROVIDERS_FETCH_ERROR",
      ...(process.env.NODE_ENV === "development" && { details: err.message }),
    });
  }
};

// Update provider details (if you need this functionality)
// exports.updateProvider = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     // Validate ID
//     if (!id.match(/^[0-9a-fA-F]{24}$/)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid provider ID format",
//         error: "INVALID_PROVIDER_ID",
//       });
//     }

//     // Remove sensitive fields from update data
//     delete updateData.password;
//     delete updateData._id;
//     delete updateData.__v;

//     // Add update timestamp
//     updateData.updatedAt = new Date();

//     const updatedProvider = await ServiceProvider.findByIdAndUpdate(
//       id,
//       updateData,
//       {
//         new: true, // Return updated document
//         runValidators: true, // Run schema validations
//       }
//     ).select("-password -__v");

//     if (!updatedProvider) {
//       return res.status(404).json({
//         success: false,
//         message: "Service provider not found",
//         error: "PROVIDER_NOT_FOUND",
//       });
//     }

//     res.json({
//       success: true,
//       provider: updatedProvider,
//       message: "Provider updated successfully",
//     });
//   } catch (err) {
//     console.error("Provider Update Error:", err);

//     if (err.name === "ValidationError") {
//       return res.status(400).json({
//         success: false,
//         message: "Validation error",
//         error: "VALIDATION_ERROR",
//         details: Object.keys(err.errors).map((key) => ({
//           field: key,
//           message: err.errors[key].message,
//         })),
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Internal server error occurred while updating provider",
//       error: "PROVIDER_UPDATE_ERROR",
//       ...(process.env.NODE_ENV === "development" && { details: err.message }),
//     });
//   }
// };

// Utility function to format phone numbers
function formatPhoneNumber(phone) {
  if (!phone) return phone;

  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "");

  // Format as (XXX) XXX-XXXX for US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  }

  // For international or other formats, return as-is
  return phone;
}
