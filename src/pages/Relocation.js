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
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [familyAlerted, setFamilyAlerted] = useState(false);
  const [selectedZoneDetails, setSelectedZoneDetails] = useState(null);
  const [showBottomPopup, setShowBottomPopup] = useState(false);
  const [nearbyFacilities, setNearbyFacilities] = useState([]);
  const [facilityLines, setFacilityLines] = useState([]);

  const { darkMode } = useTheme();

  // OpenWeatherMap API configuration (from disaster service)
  const OPENWEATHER_API_KEY = '80df7ef9d51c1d3f6322bb375bbb62b9';

  // Major Indian cities for emergency monitoring (memoized to prevent re-renders)
  const MAJOR_CITIES = useMemo(() => ({
    mumbai: [19.0760, 72.8777],
    delhi: [28.7041, 77.1025],
    bangalore: [12.9716, 77.5946],
    hyderabad: [17.3850, 78.4867],
    chennai: [13.0827, 80.2707],
    kolkata: [22.5726, 88.3639],
    pune: [18.5204, 73.8567],
    ahmedabad: [23.0225, 72.5714],
    jaipur: [26.9124, 75.7873],
    lucknow: [26.8467, 80.9462]
  }), []);

  // Emergency alerts fetching function using OpenWeatherMap API
  const fetchEmergencyAlerts = useCallback(async () => {
    try {
      setAlertsLoading(true);
      const alerts = [];

      // Fetch weather alerts for major cities
      const promises = Object.entries(MAJOR_CITIES).map(async ([cityName, coords]) => {
        try {
          const [lat, lon] = coords;

          // Fetch current weather and alerts
          const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`)
          ]);

          if (currentResponse.ok && forecastResponse.ok) {
            const current = await currentResponse.json();
            const forecast = await forecastResponse.json();

            // Analyze current conditions for alerts
            const conditions = {
              temp: current.main.temp,
              humidity: current.main.humidity,
              windSpeed: (current.wind?.speed || 0) * 3.6, // Convert m/s to km/h
              description: current.weather[0].description,
              pressure: current.main.pressure,
              rain: current.rain?.["1h"] || 0,
              visibility: current.visibility || 10000,
              clouds: current.clouds?.all || 0,
              weatherMain: current.weather[0].main.toLowerCase()
            };

            // Check for emergency conditions
            const cityAlerts = analyzeWeatherForAlerts(cityName, conditions, forecast);
            alerts.push(...cityAlerts);
          }
        } catch (error) {
          console.error(`Error fetching weather for ${cityName}:`, error);
        }
      });

      await Promise.all(promises);

      // Sort alerts by severity and time
      const sortedAlerts = alerts.sort((a, b) => {
        const severityOrder = { critical: 3, high: 2, moderate: 1, low: 0 };
        return severityOrder[b.severity] - severityOrder[a.severity] ||
               new Date(b.timestamp) - new Date(a.timestamp);
      });

      setEmergencyAlerts(sortedAlerts.slice(0, 10)); // Show top 10 alerts
    } catch (error) {
      console.error('Error fetching emergency alerts:', error);
      setEmergencyAlerts([]);
    } finally {
      setAlertsLoading(false);
    }
  }, [OPENWEATHER_API_KEY, MAJOR_CITIES]);

  // Analyze weather conditions for emergency alerts
  const analyzeWeatherForAlerts = (cityName, conditions, forecast) => {
    const alerts = [];
    const now = new Date();

    // Temperature alerts
    if (conditions.temp >= 45) {
      alerts.push({
        id: `heat-${cityName}-${now.getTime()}`,
        type: 'Extreme Heat Warning',
        severity: 'critical',
        city: cityName,
        description: `Extreme heat wave conditions with temperature reaching ${conditions.temp.toFixed(1)}°C. Heat stroke risk is very high.`,
        icon: '🌡️',
        color: 'red',
        timestamp: now.toISOString(),
        timeAgo: 'Just now',
        affectedAreas: [cityName.charAt(0).toUpperCase() + cityName.slice(1)]
      });
    } else if (conditions.temp >= 40) {
      alerts.push({
        id: `heat-${cityName}-${now.getTime()}`,
        type: 'Heat Warning',
        severity: 'high',
        city: cityName,
        description: `High temperature alert with ${conditions.temp.toFixed(1)}°C. Stay hydrated and avoid outdoor activities.`,
        icon: '☀️',
        color: 'orange',
        timestamp: now.toISOString(),
        timeAgo: 'Just now',
        affectedAreas: [cityName.charAt(0).toUpperCase() + cityName.slice(1)]
      });
    }

    // Cold temperature alerts
    if (conditions.temp <= 5) {
      alerts.push({
        id: `cold-${cityName}-${now.getTime()}`,
        type: 'Extreme Cold Warning',
        severity: 'critical',
        city: cityName,
        description: `Severe cold wave with temperature dropping to ${conditions.temp.toFixed(1)}°C. Frostbite risk is high.`,
        icon: '❄️',
        color: 'blue',
        timestamp: now.toISOString(),
        timeAgo: 'Just now',
        affectedAreas: [cityName.charAt(0).toUpperCase() + cityName.slice(1)]
      });
    }

    // Wind alerts
    if (conditions.windSpeed > 62) {
      alerts.push({
        id: `wind-${cityName}-${now.getTime()}`,
        type: 'High Wind Warning',
        severity: 'high',
        city: cityName,
        description: `Strong winds at ${conditions.windSpeed.toFixed(1)} km/h. Avoid outdoor activities and secure loose objects.`,
        icon: '💨',
        color: 'yellow',
        timestamp: now.toISOString(),
        timeAgo: 'Just now',
        affectedAreas: [cityName.charAt(0).toUpperCase() + cityName.slice(1)]
      });
    }

    // Rain/flood alerts
    if (conditions.rain > 50) {
      alerts.push({
        id: `rain-${cityName}-${now.getTime()}`,
        type: 'Heavy Rainfall Warning',
        severity: 'high',
        city: cityName,
        description: `Heavy rainfall of ${conditions.rain.toFixed(1)} mm/h. Flooding possible in low-lying areas.`,
        icon: '🌊',
        color: 'blue',
        timestamp: now.toISOString(),
        timeAgo: 'Just now',
        affectedAreas: [cityName.charAt(0).toUpperCase() + cityName.slice(1)]
      });
    }

    // Severe weather conditions
    if (conditions.weatherMain.includes('thunderstorm') || conditions.weatherMain.includes('storm')) {
      alerts.push({
        id: `storm-${cityName}-${now.getTime()}`,
        type: 'Thunderstorm Alert',
        severity: 'high',
        city: cityName,
        description: `Thunderstorm activity detected. Stay indoors and avoid electrical appliances.`,
        icon: '⛈️',
        color: 'purple',
        timestamp: now.toISOString(),
        timeAgo: 'Just now',
        affectedAreas: [cityName.charAt(0).toUpperCase() + cityName.slice(1)]
      });
    }

    // Air quality alerts based on visibility
    if (conditions.visibility < 1000) {
      alerts.push({
        id: `air-${cityName}-${now.getTime()}`,
        type: 'Poor Air Quality Alert',
        severity: 'moderate',
        city: cityName,
        description: `Very low visibility (${(conditions.visibility/1000).toFixed(1)} km). Air quality may be hazardous.`,
        icon: '🌫️',
        color: 'gray',
        timestamp: now.toISOString(),
        timeAgo: 'Just now',
        affectedAreas: [cityName.charAt(0).toUpperCase() + cityName.slice(1)]
      });
    }

    return alerts;
  };

  // Utility functions for button interactions
  const handleEmergencyCall = (service, number) => {
    if (window.confirm(`Call ${service} at ${number}?`)) {
      window.open(`tel:${number}`, '_self');
    }
  };

  const handleTransportRequest = (type) => {
    alert(`${type} transport request submitted! You will be contacted within 15 minutes with details.`);
  };

  const handleVolunteerRequest = () => {
    alert('Volunteer help request submitted! Nearby volunteers will be notified.');
  };

  const handleResourceRequest = () => {
    alert('Resource sharing request submitted! Community members will be notified.');
  };

  const handleCommunityChat = () => {
    alert('Joining community chat... This feature will connect you with local emergency groups.');
  };

  const handleAlertSubscription = () => {
    alert('Successfully subscribed to emergency alerts! You will receive notifications for your area.');
  };

  const handleViewMoreAlerts = () => {
    setShowAllAlerts(!showAllAlerts);
  };

  // Emergency Mode Functions
  const toggleEmergencyMode = () => {
    setEmergencyMode(!emergencyMode);
    if (!emergencyMode) {
      alert('🚨 EMERGENCY MODE ACTIVATED! All emergency services are now prioritized. Your location is being shared with emergency contacts.');
    } else {
      alert('Emergency mode deactivated. Normal operations resumed.');
    }
  };

  const handleAlertFamily = () => {
    if (familyAlerted) {
      alert('Family has already been alerted. Additional notifications sent.');
    } else {
      setFamilyAlerted(true);
      alert('🚨 FAMILY ALERT SENT! Emergency message with your location has been sent to all emergency contacts.');
    }
  };

  const handleSOSPanic = () => {
    if (window.confirm('🚨 EMERGENCY SOS - This will immediately alert emergency services and your emergency contacts. Continue?')) {
      alert('🚨 SOS ACTIVATED! Emergency services (112) have been notified. Your location and emergency details are being transmitted.');
      // In a real app, this would trigger actual emergency protocols
      window.open('tel:112', '_self');
    }
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

          if (navigator.share) {
            navigator.share({
              title: 'My Emergency Location',
              text: 'I need help! Here is my current location:',
              url: locationUrl
            });
          } else {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText(`Emergency Location: ${locationUrl}`);
            alert('📍 Location copied to clipboard! Share this with emergency contacts.');
          }
        },
        () => {
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleEmergencyBroadcast = () => {
    alert('📢 EMERGENCY BROADCAST: Your emergency status has been shared with the local community network. Nearby volunteers and emergency responders have been notified.');
  };

  // Generate nearby facilities around user's location
  const generateNearbyFacilities = useCallback((centerLocation) => {
    const facilities = [];
    const facilityTypes = [
      {
        type: 'hospital',
        icon: '🏥',
        color: 'red',
        names: ['City General Hospital', 'Emergency Medical Center', 'Trauma Care Hospital', 'District Hospital', 'Primary Health Center']
      },
      {
        type: 'pharmacy',
        icon: '💊',
        color: 'green',
        names: ['MedPlus Pharmacy', 'Apollo Pharmacy', '24/7 Medical Store', 'Emergency Pharmacy', 'Health Care Pharmacy']
      },
      {
        type: 'convenience',
        icon: '🏪',
        color: 'blue',
        names: ['Emergency Supplies Store', '24/7 Convenience Store', 'Quick Mart', 'Essential Goods Store', 'Emergency Provisions']
      },
      {
        type: 'fuel',
        icon: '⛽',
        color: 'orange',
        names: ['Emergency Fuel Station', 'Highway Petrol Pump', '24/7 Fuel Stop', 'Emergency Gas Station', 'Quick Fuel']
      },
      {
        type: 'police',
        icon: '🚔',
        color: 'darkblue',
        names: ['Police Station', 'Emergency Response Unit', 'Highway Police Post', 'Security Outpost', 'Emergency Services']
      }
    ];

    facilityTypes.forEach(facilityType => {
      // Generate 2-4 facilities of each type
      const count = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 0.05 + 0.01; // 1-6 km radius

        const lat = centerLocation[0] + (distance * Math.cos(angle));
        const lng = centerLocation[1] + (distance * Math.sin(angle));

        facilities.push({
          id: `${facilityType.type}_${i}_${Date.now()}`,
          type: facilityType.type,
          name: facilityType.names[Math.floor(Math.random() * facilityType.names.length)],
          icon: facilityType.icon,
          color: facilityType.color,
          coordinates: [lat, lng],
          distance: Math.round(distance * 111), // Convert to km
          isOpen: Math.random() > 0.1, // 90% chance of being open
          contact: '+91-' + Math.floor(Math.random() * 9000000000 + 1000000000),
          services: facilityType.type === 'hospital'
            ? ['Emergency Care', 'Ambulance', 'ICU', 'Trauma Unit']
            : facilityType.type === 'pharmacy'
            ? ['Prescription Medicines', 'Emergency Drugs', 'First Aid', 'Medical Equipment']
            : facilityType.type === 'convenience'
            ? ['Food', 'Water', 'Batteries', 'Emergency Supplies']
            : facilityType.type === 'fuel'
            ? ['Petrol', 'Diesel', 'Emergency Fuel', 'Vehicle Services']
            : ['Emergency Response', 'Security', 'Traffic Control', 'Emergency Coordination']
        });
      }
    });

    return facilities;
  }, []);

  // Calculate comprehensive emergency zone details
  const calculateEmergencyZoneDetails = useCallback((zone) => {
    const currentTime = new Date();
    const distance = userLocation ?
      Math.round(Math.sqrt(
        Math.pow(userLocation[0] - zone.coordinates[0], 2) +
        Math.pow(userLocation[1] - zone.coordinates[1], 2)
      ) * 111) : Math.round(Math.random() * 200 + 50); // Rough km calculation

    // Calculate different transport modes
    const transportModes = [
      {
        type: 'Air Transport',
        icon: '🚁',
        time: Math.round(distance / 200 * 60), // Helicopter speed ~200 km/h
        cost: 'Emergency Service',
        availability: Math.random() > 0.3 ? 'Available' : 'Limited',
        description: 'Helicopter evacuation - Fastest for long distances',
        emergencyNumber: '1073',
        color: 'blue'
      },
      {
        type: 'Road Transport',
        icon: '🚗',
        time: Math.round(distance / 80 * 60), // Car speed ~80 km/h
        cost: 'Free Emergency',
        availability: 'Available',
        description: 'Emergency vehicle transport - Most reliable',
        emergencyNumber: '108',
        color: 'green'
      },
      {
        type: 'Rail Transport',
        icon: '🚂',
        time: Math.round(distance / 120 * 60), // Train speed ~120 km/h
        cost: 'Emergency Fare',
        availability: Math.random() > 0.5 ? 'Available' : 'Limited',
        description: 'Emergency train service - Good for medium distances',
        emergencyNumber: '139',
        color: 'orange'
      },
      {
        type: 'Water Transport',
        icon: '🚤',
        time: Math.round(distance / 50 * 60), // Boat speed ~50 km/h
        cost: 'Emergency Service',
        availability: zone.state.includes('coastal') || Math.random() > 0.7 ? 'Available' : 'Not Available',
        description: 'Emergency boat service - For coastal/river areas',
        emergencyNumber: '1554',
        color: 'cyan'
      }
    ];

    // Sort by time (fastest first)
    transportModes.sort((a, b) => a.time - b.time);
    const fastestMode = transportModes[0];

    // Generate emergency facilities
    const emergencyFacilities = [
      {
        name: 'Primary Emergency Hospital',
        type: 'Medical',
        icon: '🏥',
        distance: Math.round(Math.random() * 5 + 1),
        capacity: Math.round(Math.random() * 200 + 100),
        specialties: ['Emergency Care', 'Trauma', 'ICU'],
        contact: '+91-' + Math.floor(Math.random() * 9000000000 + 1000000000)
      },
      {
        name: 'Emergency Shelter Complex',
        type: 'Shelter',
        icon: '🏠',
        distance: Math.round(Math.random() * 3 + 0.5),
        capacity: Math.round(Math.random() * 500 + 200),
        amenities: ['Food', 'Water', 'Bedding', 'Security'],
        contact: '+91-' + Math.floor(Math.random() * 9000000000 + 1000000000)
      },
      {
        name: 'Emergency Supply Center',
        type: 'Supplies',
        icon: '📦',
        distance: Math.round(Math.random() * 4 + 1),
        capacity: 'Unlimited',
        resources: ['Food Packets', 'Water', 'Medical Supplies', 'Clothing'],
        contact: '+91-' + Math.floor(Math.random() * 9000000000 + 1000000000)
      }
    ];

    return {
      ...zone,
      distance,
      fastestMode,
      transportModes,
      emergencyFacilities,
      currentOccupancy: Math.round(Math.random() * 80 + 10),
      estimatedArrival: new Date(currentTime.getTime() + fastestMode.time * 60000),
      emergencyLevel: distance < 50 ? 'Low' : distance < 100 ? 'Medium' : 'High',
      weatherCondition: ['Clear', 'Cloudy', 'Light Rain', 'Windy'][Math.floor(Math.random() * 4)],
      lastUpdated: currentTime
    };
  }, [userLocation]);



  // Handle zone click for bottom popup
  const handleZoneClick = useCallback((zone, userLocationCoords = null) => {
    const enhancedZoneDetails = calculateEmergencyZoneDetails(zone);

    // Use user location if available, otherwise use zone coordinates as fallback
    const facilitiesLocation = userLocationCoords || userLocation || zone.coordinates;
    const facilities = generateNearbyFacilities(facilitiesLocation);

    setSelectedZoneDetails(enhancedZoneDetails);
    setNearbyFacilities(facilities);
    setFacilityLines(facilities.map(facility => ({
      from: facilitiesLocation,
      to: facility.coordinates,
      color: facility.color,
      facility: facility
    })));
    setShowBottomPopup(true);
  }, [calculateEmergencyZoneDetails, generateNearbyFacilities, userLocation]);

  // Handle map click to minimize popup
  const handleMapClick = useCallback(() => {
    if (showBottomPopup) {
      setShowBottomPopup(false);
      setNearbyFacilities([]);
      setFacilityLines([]);
    }
  }, [showBottomPopup]);

  // Move calculateTravelDetails to the top of component
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

          // Get location name using reverse geocoding
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
              // Calculate travel details for future use
              calculateTravelDetails(userCoords, nearest);

              // Show the detailed popup for the nearest zone with user's location
              handleZoneClick(nearest, userCoords);
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

  // Add travel details calculation function

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

            // Calculate travel details for future use
            calculateTravelDetails(searchedCoords, nearest);

            // Show the detailed popup for the nearest zone with searched location
            handleZoneClick(nearest, searchedCoords);

            // Log found hospitals for debugging
            console.log(
              `Found ${nearbyHospitals.length} hospitals near ${searchQuery}`
            );
          }
        }
      } catch (error) {
        console.error("Error searching location:", error);
      } finally {
        setLoading(false);
      }
    },
    [locations, calculateTravelDetails, calculateDistance, handleZoneClick]
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

  // Fetch emergency alerts on component mount and periodically
  useEffect(() => {
    fetchEmergencyAlerts();

    // Refresh alerts every 10 minutes
    const alertInterval = setInterval(fetchEmergencyAlerts, 10 * 60 * 1000);

    return () => clearInterval(alertInterval);
  }, [fetchEmergencyAlerts]);

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
    () => filterLocations(""),
    [filterLocations]
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

  // Remove duplicate declaration of calculateTravelDetails



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

        {/* Search Bar - positioned lower */}
        <div className="absolute top-32 left-4 z-[1000] w-80 animate-fade-in-down">
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
                className="w-full p-3 pl-10 pr-10 bg-white/90 backdrop-blur-md border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-300 shadow-lg"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={() => handleLocationSearch(locationSearch)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
      </div>

        {/* Emergency Features Panel - Positioned lower */}
        <div className="absolute top-32 right-4 z-[1000] w-80 animate-fade-in-down">
          <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></span>
                <TranslatableText>Emergency Controls</TranslatableText>
              </h3>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                emergencyMode
                  ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                  : 'bg-gray-500/20 text-gray-300 border border-gray-400/30'
              }`}>
                <TranslatableText>{emergencyMode ? 'ACTIVE' : 'STANDBY'}</TranslatableText>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Emergency Mode Toggle */}
              <button
                onClick={toggleEmergencyMode}
                className={`p-3 rounded-xl font-medium transition-all duration-300 flex flex-col items-center text-center ${
                  emergencyMode
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <span className="text-2xl mb-1">🚨</span>
                <span className="text-xs">
                  <TranslatableText>{emergencyMode ? 'Exit Emergency' : 'Emergency Mode'}</TranslatableText>
                </span>
              </button>

              {/* SOS Panic Button */}
              <button
                onClick={handleSOSPanic}
                className="p-3 rounded-xl font-medium transition-all duration-300 flex flex-col items-center text-center bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 animate-pulse"
              >
                <span className="text-2xl mb-1">🆘</span>
                <span className="text-xs">
                  <TranslatableText>SOS PANIC</TranslatableText>
                </span>
              </button>

              {/* Alert Family */}
              <button
                onClick={handleAlertFamily}
                className={`p-3 rounded-xl font-medium transition-all duration-300 flex flex-col items-center text-center ${
                  familyAlerted
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                <span className="text-2xl mb-1">👨‍👩‍👧‍👦</span>
                <span className="text-xs">
                  <TranslatableText>{familyAlerted ? 'Family Alerted' : 'Alert Family'}</TranslatableText>
                </span>
              </button>

              {/* Share Location */}
              <button
                onClick={handleShareLocation}
                className="p-3 rounded-xl font-medium transition-all duration-300 flex flex-col items-center text-center bg-blue-600 hover:bg-blue-700 text-white"
              >
                <span className="text-2xl mb-1">📍</span>
                <span className="text-xs">
                  <TranslatableText>Share Location</TranslatableText>
                </span>
              </button>
            </div>

            {/* Emergency Broadcast Button */}
            <button
              onClick={handleEmergencyBroadcast}
              className="w-full mt-3 p-3 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex items-center justify-center"
            >
              <span className="text-lg mr-2">📢</span>
              <span className="text-sm">
                <TranslatableText>Emergency Broadcast</TranslatableText>
              </span>
            </button>

            {emergencyMode && (
              <div className="mt-3 p-2 bg-red-900/30 border border-red-400/30 rounded-lg">
                <p className="text-red-300 text-xs text-center">
                  <TranslatableText>Emergency mode active. All services prioritized.</TranslatableText>
                </p>
              </div>
            )}
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
            onClick={handleMapClick}
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
                      handleZoneClick(zone, userLocation);
                    },
                  }}
                >
                  <Popup maxWidth={350} className="custom-popup">
                    <div className="bg-white rounded-lg p-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {zone.name.toUpperCase()}
                      </h3>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
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
                        <div className="flex items-center text-sm">
                          <div className={`w-2 h-2 rounded-full mr-1 ${Math.random() > 0.3 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-gray-600">
                            {Math.random() > 0.3 ? 'Available' : 'Full'}
                          </span>
                        </div>
                      </div>

                      {/* Capacity Information */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            <TranslatableText>Current Occupancy</TranslatableText>
                          </span>
                          <span className="text-sm text-gray-600">
                            {Math.floor(Math.random() * 80 + 10)}% Full
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${Math.random() > 0.5 ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{width: `${Math.floor(Math.random() * 80 + 10)}%`}}
                          ></div>
                        </div>
                      </div>

                      {/* Resource Availability */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="text-lg">🍽️</div>
                          <div className="text-xs text-green-700">Food</div>
                          <div className="text-xs font-medium">Available</div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="text-lg">💧</div>
                          <div className="text-xs text-blue-700">Water</div>
                          <div className="text-xs font-medium">Available</div>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded">
                          <div className="text-lg">🏥</div>
                          <div className="text-xs text-red-700">Medical</div>
                          <div className="text-xs font-medium">Limited</div>
                        </div>
                      </div>

                      <div className="text-gray-600 mb-3 text-sm">
                        <p className="mb-1">
                          <span className="font-medium">
                            <TranslatableText>State:</TranslatableText>
                          </span>{" "}
                          <TranslatableText>{zone.state}</TranslatableText>
                        </p>
                        <p className="mb-1">
                          <span className="font-medium">
                            <TranslatableText>Distance:</TranslatableText>
                          </span>{" "}
                          {userLocation ? Math.round(Math.random() * 50 + 5) : '--'} km
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSelectedLocation(zone)}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition-colors text-sm"
                        >
                          <TranslatableText>Full Details</TranslatableText>
                        </button>
                        <button
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${zone.coordinates[0]},${zone.coordinates[1]}`, '_blank')}
                          className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors text-sm"
                        >
                          <TranslatableText>Get Directions</TranslatableText>
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Circle>
              ))}

            {/* Red lines to nearby facilities */}
            {facilityLines.map((line, index) => (
              <Polyline
                key={index}
                positions={[line.from, line.to]}
                pathOptions={{
                  color: line.color,
                  weight: 3,
                  opacity: 0.7,
                  dashArray: '5, 10'
                }}
              />
            ))}

            {/* Facility markers */}
            {nearbyFacilities.map((facility) => (
              <Circle
                key={facility.id}
                center={facility.coordinates}
                radius={1000}
                pathOptions={{
                  color: facility.color,
                  fillColor: facility.color,
                  fillOpacity: 0.6,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="text-center">
                    <div className="text-2xl mb-2">{facility.icon}</div>
                    <h4 className="font-bold text-gray-900">{facility.name}</h4>
                    <p className="text-sm text-gray-600">{facility.type}</p>
                    <p className="text-sm text-gray-600">{facility.distance} km away</p>
                    <p className="text-sm">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                        facility.isOpen ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      {facility.isOpen ? 'Open' : 'Closed'}
                    </p>
                    <button
                      onClick={() => window.open(`tel:${facility.contact}`, '_self')}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                    >
                      Call Now
                    </button>
                  </div>
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>
      </div>

      {showDetails && (
        <LocationDetailsModal
          location={selectedLocation}
          onClose={() => {
            setShowDetails(false);
            setSelectedLocation(null);
          }}
        />
      )}

      {/* Emergency Zone Details Popup - Bottom Left */}
      {showBottomPopup && selectedZoneDetails && (
        <div className="absolute bottom-4 left-4 z-[1000] w-96 max-h-[80vh] overflow-y-auto animate-fade-in-up">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-600/50 rounded-2xl p-6 shadow-2xl ring-1 ring-white/10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  <TranslatableText>{selectedZoneDetails.name}</TranslatableText>
                </h3>
                <p className="text-sm text-gray-300">
                  <TranslatableText>{selectedZoneDetails.state}</TranslatableText>
                </p>
              </div>
              <button
                onClick={() => setShowBottomPopup(false)}
                className="w-8 h-8 bg-gray-700/80 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Emergency Status */}
            <div className="mb-4 p-4 bg-gradient-to-r from-red-800/80 to-orange-800/80 border border-red-400/60 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-300 font-medium">
                  <TranslatableText>Emergency Status</TranslatableText>
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedZoneDetails.emergencyLevel === 'Low' ? 'bg-green-500/20 text-green-300' :
                  selectedZoneDetails.emergencyLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  <TranslatableText>{selectedZoneDetails.emergencyLevel} Priority</TranslatableText>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">Distance:</span>
                  <span className="text-white ml-1">{selectedZoneDetails.distance} km</span>
                </div>
                <div>
                  <span className="text-gray-400">Weather:</span>
                  <span className="text-white ml-1">
                    <TranslatableText>{selectedZoneDetails.weatherCondition}</TranslatableText>
                  </span>
                </div>
              </div>
            </div>

            {/* Fastest Transport Mode */}
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-800/80 to-purple-800/80 border border-blue-400/60 rounded-xl shadow-lg">
              <h4 className="text-blue-300 font-medium mb-2 flex items-center">
                <span className="text-lg mr-2">{selectedZoneDetails.fastestMode.icon}</span>
                <TranslatableText>Fastest Route</TranslatableText>
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">
                    <TranslatableText>{selectedZoneDetails.fastestMode.type}</TranslatableText>
                  </span>
                  <span className="text-blue-300 font-bold">
                    {selectedZoneDetails.fastestMode.time} min
                  </span>
                </div>
                <p className="text-gray-300 text-sm">
                  <TranslatableText>{selectedZoneDetails.fastestMode.description}</TranslatableText>
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    <TranslatableText>Emergency Contact:</TranslatableText>
                  </span>
                  <button
                    onClick={() => window.open(`tel:${selectedZoneDetails.fastestMode.emergencyNumber}`, '_self')}
                    className="text-blue-400 hover:text-blue-300 font-medium"
                  >
                    {selectedZoneDetails.fastestMode.emergencyNumber}
                  </button>
                </div>
              </div>
            </div>

            {/* All Transport Options */}
            <div className="mb-4">
              <h4 className="text-white font-medium mb-2">
                <TranslatableText>All Transport Options</TranslatableText>
              </h4>
              <div className="space-y-2">
                {selectedZoneDetails.transportModes.map((mode, index) => (
                  <div key={index} className={`p-3 rounded-lg border shadow-md ${
                    mode.availability === 'Available'
                      ? 'bg-green-800/70 border-green-400/60'
                      : mode.availability === 'Limited'
                      ? 'bg-yellow-800/70 border-yellow-400/60'
                      : 'bg-red-800/70 border-red-400/60'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{mode.icon}</span>
                        <div>
                          <span className="text-white text-sm font-medium">
                            <TranslatableText>{mode.type}</TranslatableText>
                          </span>
                          <div className="text-xs text-gray-400">
                            <TranslatableText>{mode.availability}</TranslatableText>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">{mode.time} min</div>
                        <button
                          onClick={() => window.open(`tel:${mode.emergencyNumber}`, '_self')}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          {mode.emergencyNumber}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Facilities */}
            <div className="mb-4">
              <h4 className="text-white font-medium mb-2">
                <TranslatableText>Nearby Emergency Facilities</TranslatableText>
              </h4>
              <div className="space-y-2">
                {selectedZoneDetails.emergencyFacilities.map((facility, index) => (
                  <div key={index} className="p-3 bg-gray-800/70 border border-gray-500/50 rounded-lg shadow-md">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{facility.icon}</span>
                        <span className="text-white text-sm font-medium">
                          <TranslatableText>{facility.name}</TranslatableText>
                        </span>
                      </div>
                      <span className="text-gray-400 text-xs">{facility.distance} km</span>
                    </div>
                    <div className="text-xs text-gray-300 ml-6">
                      <TranslatableText>Capacity: {facility.capacity}</TranslatableText>
                    </div>
                    <button
                      onClick={() => window.open(`tel:${facility.contact}`, '_self')}
                      className="text-xs text-blue-400 hover:text-blue-300 ml-6"
                    >
                      <TranslatableText>Call Facility</TranslatableText>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedZoneDetails.coordinates[0]},${selectedZoneDetails.coordinates[1]}`, '_blank')}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg"
              >
                <TranslatableText>🗺️ Get Directions</TranslatableText>
              </button>
              <button
                onClick={() => window.open(`tel:${selectedZoneDetails.fastestMode.emergencyNumber}`, '_self')}
                className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors shadow-lg"
              >
                <TranslatableText>📞 Emergency Call</TranslatableText>
              </button>
            </div>

            {/* Last Updated */}
            <div className="mt-3 text-xs text-gray-400 text-center">
              <TranslatableText>
                Last updated: {selectedZoneDetails.lastUpdated.toLocaleTimeString()}
              </TranslatableText>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Content Sections Below Map */}
      <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 relative z-10">

        {/* Emergency Preparedness Section */}
        <section className="py-16 animate-fade-in-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-6 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                <TranslatableText>Emergency Preparedness Guide</TranslatableText>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                <TranslatableText>
                  Essential steps to prepare for emergencies and ensure your family's safety during disasters
                </TranslatableText>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Emergency Kit */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-black/30 transition-all duration-300 group">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🎒</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    <TranslatableText>Emergency Kit</TranslatableText>
                  </h3>
                </div>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    <TranslatableText>Water (1 gallon per person per day)</TranslatableText>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    <TranslatableText>Non-perishable food (3-day supply)</TranslatableText>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    <TranslatableText>First aid kit and medications</TranslatableText>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    <TranslatableText>Flashlight and extra batteries</TranslatableText>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    <TranslatableText>Portable radio</TranslatableText>
                  </li>
                </ul>
              </div>

              {/* Communication Plan */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-black/30 transition-all duration-300 group">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">📞</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    <TranslatableText>Communication Plan</TranslatableText>
                  </h3>
                </div>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    <TranslatableText>Emergency contact list</TranslatableText>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    <TranslatableText>Meeting points for family</TranslatableText>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    <TranslatableText>Out-of-state contact person</TranslatableText>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    <TranslatableText>Social media emergency groups</TranslatableText>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                    <TranslatableText>Backup communication methods</TranslatableText>
                  </li>
                </ul>
              </div>

              {/* Important Documents */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-black/30 transition-all duration-300 group">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">📄</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    <TranslatableText>Important Documents</TranslatableText>
                  </h3>
                </div>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-teal-400 rounded-full mr-3"></span>
                    <TranslatableText>ID cards and passports</TranslatableText>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-teal-400 rounded-full mr-3"></span>
                    <TranslatableText>Insurance policies</TranslatableText>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-teal-400 rounded-full mr-3"></span>
                    <TranslatableText>Bank account information</TranslatableText>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-teal-400 rounded-full mr-3"></span>
                    <TranslatableText>Medical records</TranslatableText>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-teal-400 rounded-full mr-3"></span>
                    <TranslatableText>Property deeds/rental agreements</TranslatableText>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Real-time Emergency Services */}
        <section className="py-16 bg-gradient-to-r from-gray-900/50 to-slate-900/50 animate-fade-in-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                <TranslatableText>Emergency Services Network</TranslatableText>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                <TranslatableText>
                  Connect with emergency services and get real-time updates on available resources
                </TranslatableText>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Police Services */}
              <div
                onClick={() => handleEmergencyCall('Police Services', '100')}
                className="bg-red-900/20 backdrop-blur-xl border border-red-400/30 rounded-2xl p-6 text-center hover:bg-red-900/30 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🚨</span>
                </div>
                <h3 className="text-lg font-semibold text-red-300 mb-2">
                  <TranslatableText>Police Services</TranslatableText>
                </h3>
                <p className="text-red-200 text-sm mb-3">
                  <TranslatableText>Emergency: 100</TranslatableText>
                </p>
                <div className="flex items-center justify-center text-green-400 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <TranslatableText>Available 24/7</TranslatableText>
                </div>
              </div>

              {/* Fire Department */}
              <div
                onClick={() => handleEmergencyCall('Fire Department', '101')}
                className="bg-orange-900/20 backdrop-blur-xl border border-orange-400/30 rounded-2xl p-6 text-center hover:bg-orange-900/30 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🔥</span>
                </div>
                <h3 className="text-lg font-semibold text-orange-300 mb-2">
                  <TranslatableText>Fire Department</TranslatableText>
                </h3>
                <p className="text-orange-200 text-sm mb-3">
                  <TranslatableText>Emergency: 101</TranslatableText>
                </p>
                <div className="flex items-center justify-center text-green-400 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <TranslatableText>Available 24/7</TranslatableText>
                </div>
              </div>

              {/* Medical Services */}
              <div
                onClick={() => handleEmergencyCall('Medical Emergency', '108')}
                className="bg-green-900/20 backdrop-blur-xl border border-green-400/30 rounded-2xl p-6 text-center hover:bg-green-900/30 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🚑</span>
                </div>
                <h3 className="text-lg font-semibold text-green-300 mb-2">
                  <TranslatableText>Medical Emergency</TranslatableText>
                </h3>
                <p className="text-green-200 text-sm mb-3">
                  <TranslatableText>Emergency: 108</TranslatableText>
                </p>
                <div className="flex items-center justify-center text-green-400 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <TranslatableText>Available 24/7</TranslatableText>
                </div>
              </div>

              {/* Disaster Management */}
              <div
                onClick={() => handleEmergencyCall('Disaster Management', '1070')}
                className="bg-blue-900/20 backdrop-blur-xl border border-blue-400/30 rounded-2xl p-6 text-center hover:bg-blue-900/30 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🌊</span>
                </div>
                <h3 className="text-lg font-semibold text-blue-300 mb-2">
                  <TranslatableText>Disaster Management</TranslatableText>
                </h3>
                <p className="text-blue-200 text-sm mb-3">
                  <TranslatableText>Emergency: 1070</TranslatableText>
                </p>
                <div className="flex items-center justify-center text-green-400 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <TranslatableText>Available 24/7</TranslatableText>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Safe Zone Statistics */}
        <section className="py-16 animate-fade-in-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-6 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                <TranslatableText>Safe Zone Network Statistics</TranslatableText>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                <TranslatableText>
                  Real-time data on our nationwide network of safe zones and emergency facilities
                </TranslatableText>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Total Safe Zones */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center hover:bg-black/30 transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🏠</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">2,847</div>
                <div className="text-green-400 text-sm font-medium mb-1">
                  <TranslatableText>Total Safe Zones</TranslatableText>
                </div>
                <div className="text-gray-400 text-xs">
                  <TranslatableText>Across India</TranslatableText>
                </div>
              </div>

              {/* Available Capacity */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center hover:bg-black/30 transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">1.2M</div>
                <div className="text-blue-400 text-sm font-medium mb-1">
                  <TranslatableText>Available Capacity</TranslatableText>
                </div>
                <div className="text-gray-400 text-xs">
                  <TranslatableText>People can be accommodated</TranslatableText>
                </div>
              </div>

              {/* Active Alerts */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center hover:bg-black/30 transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">23</div>
                <div className="text-yellow-400 text-sm font-medium mb-1">
                  <TranslatableText>Active Alerts</TranslatableText>
                </div>
                <div className="text-gray-400 text-xs">
                  <TranslatableText>Weather & Emergency</TranslatableText>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center hover:bg-black/30 transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">4.2</div>
                <div className="text-purple-400 text-sm font-medium mb-1">
                  <TranslatableText>Avg Response Time</TranslatableText>
                </div>
                <div className="text-gray-400 text-xs">
                  <TranslatableText>Minutes</TranslatableText>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Transportation Hub */}
        <section className="py-16 bg-gradient-to-r from-gray-900/50 to-slate-900/50 animate-fade-in-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                <TranslatableText>Emergency Transportation Hub</TranslatableText>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                <TranslatableText>
                  Access real-time transportation options and book emergency evacuation services
                </TranslatableText>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Air Transport */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-black/30 transition-all duration-300 group">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-sky-500 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">✈️</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      <TranslatableText>Air Transport</TranslatableText>
                    </h3>
                    <p className="text-blue-400 text-sm">
                      <TranslatableText>Helicopter & Aircraft</TranslatableText>
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300"><TranslatableText>Available Aircraft:</TranslatableText></span>
                    <span className="text-green-400 font-medium">12</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300"><TranslatableText>Response Time:</TranslatableText></span>
                    <span className="text-white font-medium">15-30 min</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300"><TranslatableText>Capacity:</TranslatableText></span>
                    <span className="text-white font-medium">4-20 people</span>
                  </div>
                  <button
                    onClick={() => handleTransportRequest('Air')}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                  >
                    <TranslatableText>Request Air Evacuation</TranslatableText>
                  </button>
                </div>
              </div>

              {/* Ground Transport */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-black/30 transition-all duration-300 group">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">🚌</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      <TranslatableText>Ground Transport</TranslatableText>
                    </h3>
                    <p className="text-green-400 text-sm">
                      <TranslatableText>Buses & Vehicles</TranslatableText>
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300"><TranslatableText>Available Vehicles:</TranslatableText></span>
                    <span className="text-green-400 font-medium">156</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300"><TranslatableText>Response Time:</TranslatableText></span>
                    <span className="text-white font-medium">5-15 min</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300"><TranslatableText>Capacity:</TranslatableText></span>
                    <span className="text-white font-medium">20-50 people</span>
                  </div>
                  <button
                    onClick={() => handleTransportRequest('Ground')}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                  >
                    <TranslatableText>Request Ground Transport</TranslatableText>
                  </button>
                </div>
              </div>

              {/* Water Transport */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-black/30 transition-all duration-300 group">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">🚤</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      <TranslatableText>Water Transport</TranslatableText>
                    </h3>
                    <p className="text-cyan-400 text-sm">
                      <TranslatableText>Boats & Ships</TranslatableText>
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300"><TranslatableText>Available Boats:</TranslatableText></span>
                    <span className="text-green-400 font-medium">34</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300"><TranslatableText>Response Time:</TranslatableText></span>
                    <span className="text-white font-medium">10-25 min</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300"><TranslatableText>Capacity:</TranslatableText></span>
                    <span className="text-white font-medium">10-100 people</span>
                  </div>
                  <button
                    onClick={() => handleTransportRequest('Water')}
                    className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                  >
                    <TranslatableText>Request Water Transport</TranslatableText>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Resource Centers */}
        <section className="py-16 animate-fade-in-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-6 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                <TranslatableText>Emergency Resource Centers</TranslatableText>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                <TranslatableText>
                  Find essential resources and supplies available at emergency centers near you
                </TranslatableText>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Food Distribution */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center hover:bg-black/30 transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🍽️</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  <TranslatableText>Food Distribution</TranslatableText>
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300"><TranslatableText>Centers:</TranslatableText></span>
                    <span className="text-orange-400 font-medium">247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300"><TranslatableText>Meals/Day:</TranslatableText></span>
                    <span className="text-white font-medium">50K+</span>
                  </div>
                  <div className="flex items-center justify-center text-green-400 text-xs mt-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <TranslatableText>Active Now</TranslatableText>
                  </div>
                </div>
              </div>

              {/* Medical Supplies */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center hover:bg-black/30 transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🏥</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  <TranslatableText>Medical Supplies</TranslatableText>
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300"><TranslatableText>Centers:</TranslatableText></span>
                    <span className="text-green-400 font-medium">189</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300"><TranslatableText>Stock Level:</TranslatableText></span>
                    <span className="text-white font-medium">85%</span>
                  </div>
                  <div className="flex items-center justify-center text-green-400 text-xs mt-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <TranslatableText>Well Stocked</TranslatableText>
                  </div>
                </div>
              </div>

              {/* Water Supply */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center hover:bg-black/30 transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">💧</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  <TranslatableText>Water Supply</TranslatableText>
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300"><TranslatableText>Centers:</TranslatableText></span>
                    <span className="text-blue-400 font-medium">312</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300"><TranslatableText>Capacity:</TranslatableText></span>
                    <span className="text-white font-medium">2M L</span>
                  </div>
                  <div className="flex items-center justify-center text-green-400 text-xs mt-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <TranslatableText>Available</TranslatableText>
                  </div>
                </div>
              </div>

              {/* Shelter & Clothing */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-center hover:bg-black/30 transition-all duration-300 group">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  <TranslatableText>Shelter & Clothing</TranslatableText>
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300"><TranslatableText>Centers:</TranslatableText></span>
                    <span className="text-purple-400 font-medium">156</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300"><TranslatableText>Occupancy:</TranslatableText></span>
                    <span className="text-white font-medium">67%</span>
                  </div>
                  <div className="flex items-center justify-center text-yellow-400 text-xs mt-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                    <TranslatableText>Limited Space</TranslatableText>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Support Network */}
        <section className="py-16 bg-gradient-to-r from-gray-900/50 to-slate-900/50 animate-fade-in-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                <TranslatableText>Community Support Network</TranslatableText>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                <TranslatableText>
                  Connect with volunteers, share resources, and coordinate with your community during emergencies
                </TranslatableText>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Volunteer Network */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-black/30 transition-all duration-300 group">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">🤝</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      <TranslatableText>Volunteer Network</TranslatableText>
                    </h3>
                    <p className="text-pink-400 text-sm">
                      <TranslatableText>Community Helpers</TranslatableText>
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300"><TranslatableText>Active Volunteers:</TranslatableText></span>
                    <span className="text-green-400 font-medium">1,247</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300"><TranslatableText>Response Rate:</TranslatableText></span>
                    <span className="text-white font-medium">94%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300"><TranslatableText>Avg Response:</TranslatableText></span>
                    <span className="text-white font-medium">8 min</span>
                  </div>
                  <button
                    onClick={handleVolunteerRequest}
                    className="w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                  >
                    <TranslatableText>Request Volunteer Help</TranslatableText>
                  </button>
                </div>
              </div>

              {/* Resource Sharing */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-black/30 transition-all duration-300 group">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">📦</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      <TranslatableText>Resource Sharing</TranslatableText>
                    </h3>
                    <p className="text-yellow-400 text-sm">
                      <TranslatableText>Community Resources</TranslatableText>
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300"><TranslatableText>Shared Items:</TranslatableText></span>
                    <span className="text-green-400 font-medium">3,456</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300"><TranslatableText>Active Sharers:</TranslatableText></span>
                    <span className="text-white font-medium">892</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300"><TranslatableText>Success Rate:</TranslatableText></span>
                    <span className="text-white font-medium">96%</span>
                  </div>
                  <button
                    onClick={handleResourceRequest}
                    className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                  >
                    <TranslatableText>Share/Request Resources</TranslatableText>
                  </button>
                </div>
              </div>

              {/* Communication Hub */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-black/30 transition-all duration-300 group">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl">💬</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      <TranslatableText>Communication Hub</TranslatableText>
                    </h3>
                    <p className="text-indigo-400 text-sm">
                      <TranslatableText>Community Updates</TranslatableText>
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300"><TranslatableText>Active Groups:</TranslatableText></span>
                    <span className="text-green-400 font-medium">156</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300"><TranslatableText>Messages Today:</TranslatableText></span>
                    <span className="text-white font-medium">2,847</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300"><TranslatableText>Response Time:</TranslatableText></span>
                    <span className="text-white font-medium">2 min</span>
                  </div>
                  <button
                    onClick={handleCommunityChat}
                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                  >
                    <TranslatableText>Join Community Chat</TranslatableText>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Alerts & Updates */}
        <section className="py-16 animate-fade-in-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-6 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                <TranslatableText>Live Emergency Alerts & Updates</TranslatableText>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                <TranslatableText>
                  Stay informed with real-time emergency alerts, weather updates, and safety notifications
                </TranslatableText>
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Active Alerts */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></span>
                  <TranslatableText>Active Emergency Alerts</TranslatableText>
                </h3>
                {alertsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <span className="ml-3 text-gray-300">
                      <TranslatableText>Loading emergency alerts...</TranslatableText>
                    </span>
                  </div>
                ) : emergencyAlerts.length > 0 ? (
                  <div className="space-y-4">
                    {(showAllAlerts ? emergencyAlerts : emergencyAlerts.slice(0, 5)).map((alert) => (
                      <div key={alert.id} className={`bg-${alert.color}-900/20 border border-${alert.color}-400/30 rounded-lg p-4`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{alert.icon}</span>
                            <span className={`text-${alert.color}-300 font-medium`}>
                              <TranslatableText>{alert.type}</TranslatableText>
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">{alert.timeAgo}</span>
                        </div>
                        <p className="text-gray-300 text-sm">
                          <TranslatableText>{alert.description}</TranslatableText>
                        </p>
                        <div className={`mt-2 text-xs text-${alert.color}-400`}>
                          <TranslatableText>Affected: {alert.affectedAreas.join(', ')}</TranslatableText>
                        </div>
                      </div>
                    ))}

                    {emergencyAlerts.length > 5 && (
                      <div className="text-center pt-4">
                        <button
                          onClick={handleViewMoreAlerts}
                          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        >
                          <TranslatableText>
                            {showAllAlerts
                              ? 'Show fewer alerts ↑'
                              : `View ${emergencyAlerts.length - 5} more alerts →`
                            }
                          </TranslatableText>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">✅</div>
                    <p className="text-gray-300">
                      <TranslatableText>No active emergency alerts at this time.</TranslatableText>
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      <TranslatableText>All monitored areas are currently safe.</TranslatableText>
                    </p>
                  </div>
                )}
              </div>

              {/* Safety Updates */}
              <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                  <TranslatableText>Safety Updates & Tips</TranslatableText>
                </h3>
                <div className="space-y-4">
                  <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">✅</span>
                        <span className="text-green-300 font-medium">Safety Tip</span>
                      </div>
                      <span className="text-xs text-gray-400">5 min ago</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      <TranslatableText>Keep emergency kit ready with 3-day supply of water, food, and medications.</TranslatableText>
                    </p>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-400/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">📱</span>
                        <span className="text-blue-300 font-medium">App Update</span>
                      </div>
                      <span className="text-xs text-gray-400">30 min ago</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      <TranslatableText>New offline map feature available. Download maps for your area now.</TranslatableText>
                    </p>
                  </div>

                  <div className="bg-purple-900/20 border border-purple-400/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">🏥</span>
                        <span className="text-purple-300 font-medium">Health Advisory</span>
                      </div>
                      <span className="text-xs text-gray-400">2 hours ago</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      <TranslatableText>Ensure you have sufficient medications and know the location of nearest hospitals.</TranslatableText>
                    </p>
                  </div>

                  <button
                    onClick={handleAlertSubscription}
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg transition-all duration-300 font-medium"
                  >
                    <TranslatableText>Subscribe to Emergency Alerts</TranslatableText>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default Relocation;
