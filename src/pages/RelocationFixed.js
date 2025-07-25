import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Popup,
  Circle,
  Polyline,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import { safeLocations as safeLocationsData } from "../data/safeLocations";
import Header from "../components/Header"; // Import Header component
import Footer from "../components/Footer"; // Import Footer component
import TranslatableText from "../components/TranslatableText"; // Import TranslatableText component
import { useTheme } from "../contexts/ThemeContext"; // Import ThemeContext

// Add debounce utility
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Add this function at the top level
const fetchNearbyHospitals = async (lat, lon, radius = 5000) => {
  try {
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lon});
        way["amenity"="hospital"](around:${radius},${lat},${lon});
        relation["amenity"="hospital"](around:${radius},${lat},${lon});
      );
      out body;
      >;
      out skel qt;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });

    const data = await response.json();
    return data.elements.map((element) => ({
      id: element.id,
      name: element.tags?.name || "Unnamed Hospital",
      coordinates: [element.lat, element.lon],
      type: element.tags?.healthcare || "Hospital",
      emergency: element.tags?.emergency || "yes",
      phone: element.tags?.phone || "N/A",
      address:
        element.tags?.["addr:full"] ||
        element.tags?.["addr:street"] ||
        "Address not available",
    }));
  } catch (error) {
    console.error("Error fetching nearby hospitals:", error);
    return [];
  }
};

function Relocation() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [nearestSafeZone, setNearestSafeZone] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [safeZoneSearch, setSafeZoneSearch] = useState("");
  const [travelDetails, setTravelDetails] = useState(null);
  const { darkMode } = useTheme();

  // Calculate travel details
  const calculateTravelDetails = useCallback((from, to) => {
    const distance = Math.round(to.distance);
    let recommendedMode;
    let estimatedTime;
    let route;

    if (distance > 700) {
      recommendedMode = "air";
      estimatedTime = Math.ceil(distance / 800);
      route = {
        primary: to.transportInfo.nearestAirport,
        steps: [
          "Get to nearest airport",
          "Take flight to destination",
          "Local transport to safe zone",
        ],
      };
    } else if (distance > 300) {
      recommendedMode = "rail";
      estimatedTime = Math.ceil(distance / 60);
      route = {
        primary: to.transportInfo.nearestStation,
        steps: [
          "Head to nearest railway station",
          "Take train to destination",
          "Local transport to safe zone",
        ],
      };
    } else {
      recommendedMode = "road";
      estimatedTime = Math.ceil(distance / 50);
      route = {
        primary: to.transportInfo.majorHighways.join(", "),
        steps: [
          "Take main highway",
          "Follow road signs to destination",
          "Local transport to safe zone",
        ],
      };
    }

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${from[0]},${from[1]}&destination=${to.coordinates[0]},${to.coordinates[1]}`;

    return {
      distance,
      recommendedMode,
      estimatedTime,
      route,
      googleMapsUrl,
    };
  }, []);

  // Function to calculate distance between two points using Haversine formula
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Get user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userCoords = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(userCoords);

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userCoords[0]}&lon=${userCoords[1]}&addressdetails=1`
            );
            const data = await response.json();

            const nearest = locations.reduce((closest, loc) => {
              const distance = calculateDistance(
                userCoords[0],
                userCoords[1],
                loc.coordinates[0],
                loc.coordinates[1]
              );
              if (!closest || distance < closest.distance) {
                return { ...loc, distance: parseFloat(distance.toFixed(1)) };
              }
              return closest;
            }, null);

            if (nearest) {
              setNearestSafeZone({
                ...nearest,
                userState: data.address?.state || "Your Location",
              });
              const details = calculateTravelDetails(userCoords, nearest);
              setTravelDetails(details);
            }
          } catch (error) {
            console.error("Error getting location details:", error);
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
        }
      );
    }
  };

  // Update the handleLocationSearch function
  const handleLocationSearch = useCallback(
    async (searchQuery) => {
      if (!searchQuery) return;

      try {
        setLoading(true);
        // 1. First get coordinates of searched location
        const locationResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}, India&countrycodes=in&limit=1&addressdetails=1`
        );
        const locationData = await locationResponse.json();

        if (locationData.length > 0) {
          const location = locationData[0];
          const searchedCoords = [
            parseFloat(location.lat),
            parseFloat(location.lon),
          ];
          setUserLocation(searchedCoords);

          // 2. Fetch hospitals near the searched location
          const hospitalsQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:10000,${searchedCoords[0]},${searchedCoords[1]});
          way["amenity"="hospital"](around:10000,${searchedCoords[0]},${searchedCoords[1]});
          relation["amenity"="hospital"](around:10000,${searchedCoords[0]},${searchedCoords[1]});
        );
        out body;
        >;
        out skel qt;
      `;

          const hospitalsResponse = await fetch(
            "https://overpass-api.de/api/interpreter",
            {
              method: "POST",
              body: hospitalsQuery,
            }
          );

          const hospitalsData = await hospitalsResponse.json();

          // 3. Process hospital data
          const nearbyHospitals = hospitalsData.elements
            .filter((element) => element.tags && element.tags.name)
            .map((hospital) => ({
              id: hospital.id,
              name: hospital.tags.name,
              coordinates: [hospital.lat, hospital.lon],
              type: hospital.tags.healthcare || "Hospital",
              emergency: hospital.tags.emergency || "yes",
              phone:
                hospital.tags.phone || hospital.tags["contact:phone"] || "N/A",
              address:
                hospital.tags["addr:full"] ||
                hospital.tags["addr:street"] ||
                "Address not available",
              distance: calculateDistance(
                searchedCoords[0],
                searchedCoords[1],
                hospital.lat,
                hospital.lon
              ).toFixed(1),
            }))
            .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

          // 4. Find nearest safe zone
          const nearest = locations.reduce((closest, loc) => {
            const distance = calculateDistance(
              searchedCoords[0],
              searchedCoords[1],
              loc.coordinates[0],
              loc.coordinates[1]
            );
            if (!closest || distance < closest.distance) {
              return { ...loc, distance: parseFloat(distance.toFixed(1)) };
            }
            return closest;
          }, null);

          if (nearest) {
            setNearestSafeZone({
              ...nearest,
              userState: location.address?.state || "Unknown Location",
              searchedLocation: {
                name: location.display_name,
                coordinates: searchedCoords,
              },
              nearbyHospitals: nearbyHospitals.slice(0, 5), // Show top 5 nearest hospitals
            });

            const details = calculateTravelDetails(searchedCoords, nearest);
            setTravelDetails(details);
          }
        }
      } catch (error) {
        console.error("Error searching location:", error);
      } finally {
        setLoading(false);
      }
    },
    [locations, calculateTravelDetails, calculateDistance]
  );

  // Add debounce to search input
  const debouncedSearch = useCallback(
    (value) => {
      const handler = debounce(
        (searchVal) => handleLocationSearch(searchVal),
        300
      );
      handler(value);
    },
    [handleLocationSearch]
  );

  useEffect(() => {
    const loadSafeLocations = async () => {
      try {
        setLoading(true);
        // Transform the safeLocations object into an array with all required properties
        const locationsArray = Object.entries(safeLocationsData).map(
          ([name, data]) => ({
            name,
            coordinates: data.coordinates,
            score: data.score,
            capacity: data.capacity,
            facilities: data.facilities,
            description: data.description,
            state: data.state,
            elevation: data.elevation,
            hasAirport: data.hasAirport,
            hasRailway: data.hasRailway,
            transportInfo: {
              nearestAirport:
                data.transportInfo?.nearestAirport || "Not available",
              nearestStation:
                data.transportInfo?.nearestStation || "Not available",
              majorHighways: data.transportInfo?.majorHighways || [],
              busTerminal: data.transportInfo?.busTerminal || "Not available",
            },
          })
        );
        setLocations(locationsArray);
      } catch (error) {
        console.error("Error loading safe locations:", error);
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    loadSafeLocations();
  }, []);

  const filterLocations = useCallback(
    (searchTerm) => {
      if (!searchTerm) return locations;
      return locations.filter(
        (location) =>
          location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          location.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
    },
    [locations]
  );

  const filteredLocations = useMemo(
    () => filterLocations(safeZoneSearch),
    [safeZoneSearch, filterLocations]
  );
  
  const createHoverContent = (location) => `
    <div class="bg-white p-3 rounded shadow-lg max-w-xs">
      <h4 class="font-bold text-gray-900">${location.name.toUpperCase()}</h4>
      <div class="flex items-center mt-1">
        <div class="w-2 h-2 rounded-full mr-2 ${
          location.score >= 90
            ? "bg-green-500"
            : location.score >= 80
            ? "bg-yellow-500"
            : "bg-red-500"
        }"></div>
        <span class="text-sm text-gray-600">Safety Score: ${
          location.score
        }%</span>
      </div>
      <p class="text-sm text-gray-600 mt-1">${location.description}</p>
    </div>
  `;

  // Add filtered locations handler
  const getFilteredSafeZones = useCallback(
    (searchTerm) => {
      if (!searchTerm) return locations;
      return locations.filter(
        (location) =>
          location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          location.state.toLowerCase().includes(searchTerm.toLowerCase())
      );
    },
    [locations]
  );

  // Update the LocationDetailsModal component
  const LocationDetailsModal = ({ location, onClose }) => {
    const [nearbyHospitals, setNearbyHospitals] = useState([]);
    const [loadingHospitals, setLoadingHospitals] = useState(true);

    useEffect(() => {
      const loadHospitals = async () => {
        if (location?.coordinates) {
          setLoadingHospitals(true);
          const [lat, lon] = location.coordinates;
          const hospitals = await fetchNearbyHospitals(lat, lon);
          setNearbyHospitals(hospitals);
          setLoadingHospitals(false);
        }
      };

      loadHospitals();
    }, [location]);

    if (!location) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div
          className={`${
            darkMode ? "bg-dark-bg-secondary" : "bg-gray-800"
          } rounded-xl w-full max-w-2xl relative`}
        >
          {/* Modal Header */}
          <div
            className={`p-4 border-b ${
              darkMode ? "border-gray-700" : "border-gray-600"
            }`}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white dark:text-dark-text-primary">
                {location.name.toUpperCase()}
              </h2>
              <button
                onClick={onClose}
                className={`text-gray-400 ${
                  darkMode ? "hover:text-dark-text-primary" : "hover:text-white"
                } transition-colors`}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Content - Scrollable */}
          <div className="overflow-y-auto p-4 max-h-[70vh] custom-scrollbar">
            {/* Safety Score */}
            <div
              className={`${
                darkMode ? "bg-dark-bg-tertiary" : "bg-gray-700"
              } p-4 rounded-lg mb-4`}
            >
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    location.score >= 90
                      ? "bg-green-500"
                      : location.score >= 80
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span className="text-lg font-medium text-white dark:text-dark-text-primary">
                  <TranslatableText>Safety Score:</TranslatableText>{" "}
                  {location.score}%
                </span>
              </div>
              <p className="text-gray-300 dark:text-dark-text-secondary mt-2">
                <TranslatableText>{location.description}</TranslatableText>
              </p>
            </div>

            {/* Location Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div
                className={`${
                  darkMode ? "bg-dark-bg-tertiary" : "bg-gray-700"
                } p-3 rounded-lg`}
              >
                <p className="text-gray-400 dark:text-dark-text-muted">
                  <TranslatableText>State</TranslatableText>
                </p>
                <p className="text-white dark:text-dark-text-primary font-medium">
                  <TranslatableText>{location.state}</TranslatableText>
                </p>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <p className="text-gray-400">
                  <TranslatableText>Elevation</TranslatableText>
                </p>
                <p className="text-white font-medium">
                  <TranslatableText>{location.elevation}</TranslatableText>
                </p>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <p className="text-gray-400">
                  <TranslatableText>Capacity</TranslatableText>
                </p>
                <p className="text-white font-medium">
                  <TranslatableText>{location.capacity}</TranslatableText>
                </p>
              </div>
            </div>

            {/* Transport Information */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">
                <TranslatableText>Transport Options</TranslatableText>
              </h3>
              <div className="space-y-3">
                {location.hasAirport && (
                  <div className="bg-gray-700 p-3 rounded-lg flex items-start">
                    <span className="text-2xl mr-3">✈️</span>
                    <div>
                      <p className="text-white font-medium">
                        <TranslatableText>Air Travel</TranslatableText>
                      </p>
                      <p className="text-gray-400 text-sm">
                        <TranslatableText>
                          {location.transportInfo?.nearestAirport}
                        </TranslatableText>
                      </p>
                    </div>
                  </div>
                )}
                {location.hasRailway && (
                  <div className="bg-gray-700 p-3 rounded-lg flex items-start">
                    <span className="text-2xl mr-3">🚂</span>
                    <div>
                      <p className="text-white font-medium">
                        <TranslatableText>Railway</TranslatableText>
                      </p>
                      <p className="text-gray-400 text-sm">
                        <TranslatableText>
                          {location.transportInfo?.nearestStation}
                        </TranslatableText>
                      </p>
                    </div>
                  </div>
                )}
                <div className="bg-gray-700 p-3 rounded-lg flex items-start">
                  <span className="text-2xl mr-3">🚌</span>
                  <div>
                    <p className="text-white font-medium">
                      <TranslatableText>Bus Transport</TranslatableText>
                    </p>
                    <p className="text-gray-400 text-sm">
                      <TranslatableText>
                        {location.transportInfo?.busTerminal}
                      </TranslatableText>
                    </p>
                  </div>
                </div>
                {location.transportInfo?.majorHighways?.length > 0 && (
                  <div className="bg-gray-700 p-3 rounded-lg flex items-start">
                    <span className="text-2xl mr-3">🛣️</span>
                    <div>
                      <p className="text-white font-medium">
                        <TranslatableText>Major Highways</TranslatableText>
                      </p>
                      <p className="text-gray-400 text-sm">
                        <TranslatableText>
                          {location.transportInfo.majorHighways.join(", ")}
                        </TranslatableText>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Available Facilities */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                <TranslatableText>Available Facilities</TranslatableText>
              </h3>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {location.facilities.map((facility, index) => (
                    <span
                      key={index}
                      className="bg-gray-600 text-gray-200 px-3 py-1 rounded-full text-sm"
                    >
                      <TranslatableText>{facility}</TranslatableText>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Nearby Hospitals Section */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                <span className="mr-2">🏥</span>
                <TranslatableText>Nearby Hospitals</TranslatableText>
              </h3>
              {loadingHospitals ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-700 h-16 rounded-lg"></div>
                  ))}
                </div>
              ) : nearbyHospitals.length > 0 ? (
                <div className="space-y-3">
                  {nearbyHospitals.map((hospital) => (
                    <div
                      key={hospital.id}
                      className="bg-gray-700 p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-white font-medium">
                            <TranslatableText>{hospital.name}</TranslatableText>
                          </h4>
                          <p className="text-gray-400 text-sm">
                            <TranslatableText>
                              {hospital.address}
                            </TranslatableText>
                          </p>
                          {hospital.phone !== "N/A" && (
                            <p className="text-gray-400 text-sm">
                              📞{" "}
                              <TranslatableText>
                                {hospital.phone}
                              </TranslatableText>
                            </p>
                          )}
                        </div>
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates[0]},${hospital.coordinates[1]}&travelmode=driving`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center"
                        >
                          <span className="mr-1">🚗</span>
                          <TranslatableText>Directions</TranslatableText>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  <TranslatableText>
                    No hospitals found in the nearby area
                  </TranslatableText>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Update the main layout structure
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
        <Header transparent={true} />

        {/* Search Bar - positioned below navigation */}
        <div className="absolute top-20 left-4 z-[1000] w-80 animate-fade-in-down">
          <div className="flex flex-col gap-2">
            <button
              onClick={getUserLocation}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 border border-white/20 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <TranslatableText>Use My Location</TranslatableText>
            </button>

            <div className="relative">
              <input
                type="text"
                value={locationSearch}
                onChange={(e) => {
                  setLocationSearch(e.target.value);
                  debouncedSearch(e.target.value);
                }}
                placeholder="Search location..."
                className="w-full p-3 pl-10 pr-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all duration-300"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={() => handleLocationSearch(locationSearch)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white p-1 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Full Screen Map Container */}
        <div className="h-screen w-full relative overflow-hidden">
          <MapContainer
            center={userLocation || [20.5937, 78.9629]}
            zoom={userLocation ? 8 : 4}
            className="h-full w-full"
            scrollWheelZoom={true}
            zoomControl={true}
            touchZoom={true}
            dragging={true}
            tap={true}
            minZoom={3}
            maxBounds={[
              [8.4, 68.7],
              [37.6, 97.25],
            ]}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              className="map-tiles"
              noWrap={false}
              opacity={1}
            />
            {/* User Location Marker */}
            {userLocation && (
              <Circle
                center={userLocation}
                radius={5000}
                pathOptions={{ color: "red", fillColor: "red" }}
              >
                <Popup>
                  <TranslatableText>Your Location</TranslatableText>
                </Popup>
              </Circle>
            )}

            {/* Path to nearest safe zone */}
            {userLocation && nearestSafeZone && (
              <Polyline
                positions={[userLocation, nearestSafeZone.coordinates]}
                pathOptions={{ color: "yellow" }}
              />
            )}

            {!loading &&
              filteredLocations.map((zone) => (
                <Circle
                  key={zone.name}
                  center={zone.coordinates}
                  radius={25000}
                  pathOptions={{
                    color:
                      zone.score >= 90
                        ? "#10B981"
                        : zone.score >= 80
                        ? "#FBBF24"
                        : "#DC2626",
                    fillOpacity: 0.2,
                  }}
                  eventHandlers={{
                    mouseover: (e) => {
                      const layer = e.target;
                      layer.setStyle({
                        fillOpacity: 0.4,
                        weight: 2,
                      });
                      layer
                        .bindTooltip(createHoverContent(zone), {
                          direction: "top",
                          sticky: true,
                          offset: [0, -10],
                          opacity: 1,
                          className: "custom-tooltip",
                        })
                        .openTooltip();
                    },
                    mouseout: (e) => {
                      const layer = e.target;
                      layer.setStyle({
                        fillOpacity: 0.2,
                        weight: 1,
                      });
                      layer.unbindTooltip();
                    },
                    click: () => {
                      // Keep the existing popup behavior
                    },
                  }}
                >
                  <Popup maxWidth={300} className="custom-popup">
                    <div className="bg-white rounded-lg p-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {zone.name.toUpperCase()}
                      </h3>

                      <div className="flex items-center mb-3">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${
                            zone.score >= 90
                              ? "bg-green-500"
                              : zone.score >= 80
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <span className="font-medium text-gray-700">
                          Safety Score: {zone.score}%
                        </span>
                      </div>

                      <div className="text-gray-600 mb-3">
                        <p className="mb-1">
                          <span className="font-medium">
                            <TranslatableText>State:</TranslatableText>
                          </span>{" "}
                          <TranslatableText>{zone.state}</TranslatableText>
                        </p>
                        <p className="mb-1">
                          <span className="font-medium">
                            <TranslatableText>Elevation:</TranslatableText>
                          </span>{" "}
                          <TranslatableText>
                            {zone.elevation}
                          </TranslatableText>
                        </p>
                        <p>
                          <span className="font-medium">
                            <TranslatableText>Capacity:</TranslatableText>
                          </span>{" "}
                          <TranslatableText>
                            {zone.capacity}
                          </TranslatableText>
                        </p>
                      </div>

                      <div className="mb-4">
                        <p className="text-gray-700">
                          <TranslatableText>
                            {zone.description}
                          </TranslatableText>
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedLocation(zone)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        <TranslatableText>View Details</TranslatableText>
                      </button>
                    </div>
                  </Popup>
                </Circle>
              ))}
          </MapContainer>
        </div>

        {/* Sidebar for nearest safe zone info - positioned on the right */}
        {nearestSafeZone && (
          <div className="absolute top-20 right-4 z-[1000] w-80 bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-blue-400">
                <TranslatableText>Nearest Safe Zone</TranslatableText>
              </h2>
              <button
                onClick={() => {
                  setNearestSafeZone(null);
                  setUserLocation(null);
                  setTravelDetails(null);
                }}
                className="text-sm px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-gray-200 flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <TranslatableText>Clear</TranslatableText>
              </button>
            </div>

            <div className="bg-gray-700 rounded-lg p-4 shadow-lg space-y-4">
              {/* Basic Info */}
              <div>
                <h3 className="font-medium text-white mb-2">
                  <TranslatableText>
                    {nearestSafeZone.name}
                  </TranslatableText>
                </h3>
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      nearestSafeZone.score >= 90
                        ? "bg-green-500"
                        : nearestSafeZone.score >= 80
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-300">
                    <TranslatableText>Safety Score:</TranslatableText>{" "}
                    {nearestSafeZone.score}%
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  <p>
                    <TranslatableText>From:</TranslatableText>{" "}
                    <TranslatableText>
                      {nearestSafeZone.userState || "Your Location"}
                    </TranslatableText>
                  </p>
                  <p>
                    <TranslatableText>To:</TranslatableText>{" "}
                    <TranslatableText>
                      {nearestSafeZone.state}
                    </TranslatableText>
                  </p>
                  <p className="text-green-400">
                    <TranslatableText>Distance:</TranslatableText>{" "}
                    {nearestSafeZone.distance}{" "}
                    <TranslatableText>km</TranslatableText>
                  </p>
                </div>
              </div>

              {/* Travel Details */}
              {travelDetails && (
                <div className="border-t border-gray-600 pt-4">
                  <h4 className="text-sm font-semibold text-white mb-3">
                    <TranslatableText>
                      Recommended Travel Route
                    </TranslatableText>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        <TranslatableText>Best Mode:</TranslatableText>
                      </span>
                      <span className="text-white">
                        {travelDetails.recommendedMode === "air" ? (
                          <>
                            <span>✈️</span>{" "}
                            <TranslatableText>
                              Air Travel
                            </TranslatableText>
                          </>
                        ) : travelDetails.recommendedMode === "rail" ? (
                          <>
                            <span>🚂</span>{" "}
                            <TranslatableText>Railway</TranslatableText>
                          </>
                        ) : (
                          <>
                            <span>🚗</span>{" "}
                            <TranslatableText>
                              Road Transport
                            </TranslatableText>
                          </>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        <TranslatableText>
                          Est. Travel Time:
                        </TranslatableText>
                      </span>
                      <span className="text-white">
                        {travelDetails.estimatedTime}{" "}
                        <TranslatableText>hours</TranslatableText>
                      </span>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-400 mb-2">
                        <TranslatableText>Route Steps:</TranslatableText>
                      </p>
                      <ol className="list-decimal list-inside space-y-1">
                        {travelDetails.route.steps.map((step, index) => (
                          <li key={index} className="text-gray-300">
                            <TranslatableText>{step}</TranslatableText>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <a
                      href={travelDetails.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center bg-blue-600 hover:bg-blue-700 transition-colors text-white py-2 px-4 rounded-lg text-sm"
                    >
                      <TranslatableText>
                        View Route on Google Maps
                      </TranslatableText>{" "}
                      🗺️
                    </a>
                  </div>
                </div>
              )}

              <button
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                onClick={() => {
                  setSelectedLocation(nearestSafeZone);
                  setShowDetails(true);
                }}
              >
                <TranslatableText>View Full Details</TranslatableText> →
              </button>
              
              {/* Add Nearby Hospitals Section */}
              {nearestSafeZone.nearbyHospitals &&
                nearestSafeZone.nearbyHospitals.length > 0 && (
                  <div className="border-t border-gray-600 pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-white mb-3">
                      <span className="mr-2">🏥</span>
                      <TranslatableText>
                        Nearby Hospitals
                      </TranslatableText>
                    </h4>
                    <div className="space-y-2">
                      {nearestSafeZone.nearbyHospitals
                        .slice(0, 3)
                        .map((hospital, index) => (
                          <div
                            key={index}
                            className="bg-gray-600 rounded p-2"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-white">
                                  <TranslatableText>
                                    {hospital.name}
                                  </TranslatableText>
                                </p>
                                <p className="text-xs text-gray-400">
                                  {hospital.distance}
                                  <TranslatableText>
                                    km away
                                  </TranslatableText>
                                </p>
                              </div>
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates[0]},${hospital.coordinates[1]}&travelmode=driving`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-white"
                              >
                                🚗{" "}
                                <TranslatableText>Route</TranslatableText>
                              </a>
                            </div>
                            {hospital.phone !== "N/A" && (
                              <p className="text-xs text-gray-400 mt-1">
                                📞{" "}
                                <TranslatableText>
                                  {hospital.phone}
                                </TranslatableText>
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        {showDetails && (
          <LocationDetailsModal
            location={selectedLocation}
            onClose={() => {
              setShowDetails(false);
              setSelectedLocation(null);
            }}
          />
        )}
      </div>
    </>
  );
}

export default Relocation;
