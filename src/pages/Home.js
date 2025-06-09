import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import React from "react";

import Header from "../components/Header";
import Footer from "../components/Footer";
import TranslatableText from "../components/TranslatableText";
import { useTheme } from "../contexts/ThemeContext";

// Update the severityColors constant for map markers
const severityColors = {
  high: {
    color: "#dc2626", // red-600
    fillColor: "#dc2626",
    fillOpacity: 0.4,
    weight: 2,
  },
  moderate: {
    color: "#d97706", // amber-600
    fillColor: "#d97706",
    fillOpacity: 0.4,
    weight: 2,
  },
  low: {
    color: "#059669", // emerald-600
    fillColor: "#059669",
    fillOpacity: 0.4,
    weight: 2,
  },
};

// Update the disasterTypeColors constant with dark mode support
const disasterTypeColors = {
  "Weather Warning": {
    bg: "bg-sky-100 dark:bg-sky-900/30",
    border: "border-sky-400 dark:border-sky-700",
    text: "text-sky-900 dark:text-sky-300",
    title: "text-sky-950 dark:text-sky-200",
    details: "text-sky-800 dark:text-sky-400",
  },
  Earthquake: {
    bg: "bg-rose-100 dark:bg-rose-900/30",
    border: "border-rose-400 dark:border-rose-700",
    text: "text-rose-900 dark:text-rose-300",
    title: "text-rose-950 dark:text-rose-200",
    details: "text-rose-800 dark:text-rose-400",
  },
  "Landslide Warning": {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    border: "border-orange-400 dark:border-orange-700",
    text: "text-orange-900 dark:text-orange-300",
    title: "text-orange-950 dark:text-orange-200",
    details: "text-orange-800 dark:text-orange-400",
  },
  "Air Quality Warning": {
    bg: "bg-violet-100 dark:bg-violet-900/30",
    border: "border-violet-400 dark:border-violet-700",
    text: "text-violet-900 dark:text-violet-300",
    title: "text-violet-950 dark:text-violet-200",
    details: "text-violet-800 dark:text-violet-400",
  },
  "Flash Flood": {
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    border: "border-indigo-400 dark:border-indigo-700",
    text: "text-indigo-900 dark:text-indigo-300",
    title: "text-indigo-950 dark:text-indigo-200",
    details: "text-indigo-800 dark:text-indigo-400",
  },
  Cyclone: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    border: "border-emerald-400 dark:border-emerald-700",
    text: "text-emerald-900 dark:text-emerald-300",
    title: "text-emerald-950 dark:text-emerald-200",
    details: "text-emerald-800 dark:text-emerald-400",
  },
  Wildfire: {
    bg: "bg-red-100 dark:bg-red-900/30",
    border: "border-red-400 dark:border-red-700",
    text: "text-red-900 dark:text-red-300",
    title: "text-red-950 dark:text-red-200",
    details: "text-red-800 dark:text-red-400",
  },
  default: {
    bg: "bg-slate-100 dark:bg-slate-800/50",
    border: "border-slate-400 dark:border-slate-700",
    text: "text-slate-900 dark:text-slate-300",
    title: "text-slate-950 dark:text-slate-200",
    details: "text-slate-800 dark:text-slate-400",
  },
};

// Update the createCircleCoords function to be more efficient
const createCircleCoords = (center, radiusKm = 10) => {
  const points = 24; // Reduced from 32 to 24 points for better performance
  const earthRadius = 6371;
  const lat = (center[0] * Math.PI) / 180;
  const lon = (center[1] * Math.PI) / 180;
  const d = radiusKm / earthRadius;

  const coords = [];
  for (let i = 0; i <= points; i++) {
    const brng = (2 * Math.PI * i) / points;
    const latPoint = Math.asin(
      Math.sin(lat) * Math.cos(d) + Math.cos(lat) * Math.sin(d) * Math.cos(brng)
    );
    const lonPoint =
      lon +
      Math.atan2(
        Math.sin(brng) * Math.sin(d) * Math.cos(lat),
        Math.cos(d) - Math.sin(lat) * Math.sin(latPoint)
      );

    if (!isNaN(latPoint) && !isNaN(lonPoint)) {
      // Round coordinates to 4 decimal places to reduce complexity
      coords.push([
        Number(((latPoint * 180) / Math.PI).toFixed(4)),
        Number(((lonPoint * 180) / Math.PI).toFixed(4)),
      ]);
    }
  }

  return coords;
};

// Removed unused constant boundsOptions and INDIA_BOUNDS

const locations = {
  // State Capitals
  delhi: [28.7041, 77.1025],
  mumbai: [19.076, 72.8777],
  bangalore: [12.9716, 77.5946],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  hyderabad: [17.385, 78.4867],
  thiruvananthapuram: [8.5241, 76.9366],
  amaravati: [16.515, 80.5187],
  patna: [25.5941, 85.1376],
  raipur: [21.2514, 81.6296],
  panaji: [15.4909, 73.8278],
  gandhinagar: [23.2156, 72.6369],
  chandigarh: [30.7333, 76.7794],
  shimla: [31.1048, 77.1734],
  ranchi: [23.3441, 85.3096],
  bhopal: [23.2599, 77.4126],
  imphal: [24.817, 93.9368],
  shillong: [25.5788, 91.8933],
  aizawl: [23.7307, 92.7173],
  kohima: [25.6751, 94.1086],
  bhubaneswar: [20.2961, 85.8245],
  jaipur: [26.9124, 75.7873],
  gangtok: [27.3389, 88.6065],
  agartala: [23.8315, 91.2868],
  lucknow: [26.8467, 80.9462],
  dehradun: [30.3165, 78.0322],
  dispur: [26.1433, 91.7898],

  // Major Cities & High Alert Areas
  ahmedabad: [23.0225, 72.5714],
  pune: [18.5204, 73.8567],
  surat: [21.1702, 72.8311],
  visakhapatnam: [17.6868, 83.2185],
  kochi: [9.9312, 76.2673],
  indore: [22.7196, 75.8577],
  nagpur: [21.1458, 79.0882],
  coimbatore: [11.0168, 76.9558],
  varanasi: [25.3176, 82.9739],
  guwahati: [26.1445, 91.7362],

  // Disaster-Prone Areas
  porbandar: [21.6417, 69.6293], // Cyclone prone
  bhuj: [23.242, 69.6669], // Earthquake prone
  mangalore: [12.9141, 74.856], // Coastal flooding
  darjeeling: [27.041, 88.2663], // Landslide prone
  jammu: [32.7266, 74.857], // Flood prone
  srinagar: [34.0837, 74.7973], // Flood prone
  puducherry: [11.9416, 79.8083], // Coastal flooding
  "port blair": [11.6234, 92.7265], // Tsunami prone
  kavaratti: [10.5593, 72.6358], // Cyclone prone
  diu: [20.7144, 70.9874], // Cyclone prone

  // Industrial Cities (Environmental Monitoring)
  jamshedpur: [22.8046, 86.2029],
  kanpur: [26.4499, 80.3319],
  ludhiana: [30.901, 75.8573],
  vadodara: [22.3072, 73.1812],
  rourkela: [22.2604, 84.8536],

  // Tourist Cities (High Population Density)
  agra: [27.1767, 78.0081],
  udaipur: [24.5854, 73.7125],
  rishikesh: [30.0869, 78.2676],
  madurai: [9.9252, 78.1198],
  amritsar: [31.634, 74.8723],

  // Additional Major Cities
  goa: [15.2993, 74.124],
  nashik: [20.0059, 73.7897],
  aurangabad: [19.8762, 75.3433],
  rajkot: [22.3039, 70.8022],
  dhanbad: [23.7957, 86.4304],
  nellore: [14.4426, 79.9865],
  tirupati: [13.6288, 79.4192],
  mysore: [12.2958, 76.6394],
  hubli: [15.3647, 75.124],
  jalandhar: [31.326, 75.5762],

  // Hill Stations & Tourist Places
  kullu: [31.9592, 77.1089],
  manali: [32.2432, 77.1892],
  mcleodganj: [32.2427, 76.3234],
  mahabaleshwar: [17.9307, 73.6477],
  lonavala: [18.7546, 73.4062],
  matheran: [18.9866, 73.2707],
  panchgani: [17.924, 73.814],
  cherrapunji: [25.28, 91.72],
  mussorie: [30.4598, 78.0644],
  ooty: [11.4102, 76.695],

  // Coastal Cities (Additional Monitoring)
  alibag: [18.6411, 72.8724],
  daman: [20.3974, 72.8328],
  karwar: [14.8137, 74.1279],
  kundapur: [13.6223, 74.6923],
  puri: [19.8135, 85.8312],
  rameswaram: [9.2876, 79.3129],
  varkala: [8.7378, 76.7164],
  kovalam: [8.4004, 76.9787],
  digha: [21.6267, 87.509],
  chilika: [19.7147, 85.3317],

  // Industrial Hubs (Environmental Focus)
  ankleshwar: [21.6266, 73.002],
  vapi: [20.3893, 72.9067],
  haldia: [22.0667, 88.0694],
  korba: [22.3595, 82.7501],
  singrauli: [24.1997, 82.6747],
  bellary: [15.1394, 76.9214],
  bhilai: [21.209, 81.428],
  bokaro: [23.6693, 86.1511],
  jharsuguda: [21.8596, 84.0066],
  angul: [20.84, 85.1016],
};

const defaultCenter = [20.5937, 78.9629];

// Add these constants at the top
const INDIA_BBOX = {
  north: 40.0,
  south: 5.0,
  west: 65.0,
  east: 100.0,
};

// Add these API keys after the INDIA_BBOX constant
const API_KEYS = {
  NASA: "Y1Cdfo9DlGrU5jC9ZhcwWMSdDlZB3xzac22qJUmn",
  NOAA: "RKetBfTOLiCosTZesHkUNIwsygfpTCxs",
  OPENWEATHER: "80df7ef9d51c1d3f6322bb375bbb62b9", // Updated OpenWeather API key
};

// Update fetchOpenWeatherData to use current weather, forecast, and air quality
const fetchOpenWeatherData = async (locations) => {
  const weatherData = [];
  try {
    console.log("Fetching weather data...");
    const localPredictions = [];
    const promises = Object.entries(locations).map(
      async ([location, coords]) => {
        try {
          const [lat, lon] = coords;
          console.log(`Fetching data for ${location} at ${lat},${lon}`);

          const [currentResponse, forecastResponse] = await Promise.all([
            fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEYS.OPENWEATHER}&units=metric`
            ),
            fetch(
              `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEYS.OPENWEATHER}&units=metric`
            ),
          ]);

          if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error(`Weather API Error: ${currentResponse.status}`);
          }

          const [current, forecast] = await Promise.all([
            currentResponse.json(),
            forecastResponse.json(),
          ]);
          console.log(`Data received for ${location}:`, current);

          if (current?.main && current?.weather?.[0]) {
            const conditions = {
              temp: current.main.temp,
              humidity: current.main.humidity,
              windSpeed: (current.wind?.speed || 0) * 3.6, // Convert m/s to km/h
              description: current.weather[0].description,
              pressure: current.main.pressure,
              rain: current.rain?.["1h"] || 0,
              snow: current.snow?.["1h"] || 0,
              visibility: current.visibility || 10000,
              clouds: current.clouds?.all || 0,
              location: location, // Add location name
              feelsLike: current.main.feels_like,
              windGust: (current.wind?.gust || 0) * 3.6,
              dewPoint: current.main.temp - (100 - current.main.humidity) / 5,
            };

            const { warnings, severity } = analyzeWeatherData(conditions);

            // Enhanced forecast analysis for flash floods and severe weather
            const forecastWarnings = forecast.list
              .slice(0, 16) // Next 48 hours for better flood prediction
              .filter((item) => {
                const forecastConditions = {
                  temp: item.main.temp,
                  windSpeed: (item.wind?.speed || 0) * 3.6,
                  rain: (item.rain?.["3h"] || 0) / 3, // Convert 3h to 1h
                  pressure: item.main.pressure,
                  humidity: item.main.humidity,
                  description: item.weather[0].main.toLowerCase(),
                  clouds: item.clouds?.all || 0,
                };

                // Enhanced flash flood detection criteria
                const isFlashFloodRisk = forecastConditions.rain > 20 ||
                                       (forecastConditions.rain > 10 && forecastConditions.humidity > 90) ||
                                       (forecastConditions.rain > 15 && forecastConditions.pressure < 1000);

                // Enhanced severe weather detection
                const isSevereWeather = forecastConditions.temp > 40 ||
                                      forecastConditions.temp < 10 ||
                                      forecastConditions.windSpeed > 62 ||
                                      forecastConditions.rain > 25 ||
                                      forecastConditions.pressure < 980 ||
                                      forecastConditions.description.includes("extreme") ||
                                      forecastConditions.description.includes("tornado") ||
                                      forecastConditions.description.includes("hurricane") ||
                                      forecastConditions.description.includes("storm") ||
                                      forecastConditions.description.includes("thunderstorm");

                return isFlashFloodRisk || isSevereWeather;
              })
              .map((item) => {
                const rain3h = (item.rain?.["3h"] || 0);
                const rainPerHour = rain3h / 3;
                const time = new Date(item.dt * 1000);

                // Determine warning type and severity
                let warningType = "Weather Alert";
                let severity = "moderate";

                if (rainPerHour > 50) {
                  warningType = "🌊 FLASH FLOOD EMERGENCY";
                  severity = "high";
                } else if (rainPerHour > 25) {
                  warningType = "🌊 Flash Flood Warning";
                  severity = "high";
                } else if (rainPerHour > 15) {
                  warningType = "🌧️ Heavy Rain Alert";
                  severity = "moderate";
                } else if (item.weather[0].main.toLowerCase().includes("storm")) {
                  warningType = "⛈️ Severe Storm Warning";
                  severity = "high";
                }

                return {
                  time,
                  conditions: item.weather[0].description,
                  temp: item.main.temp,
                  windSpeed: (item.wind?.speed || 0) * 3.6,
                  rain: rainPerHour,
                  rain3h: rain3h,
                  pressure: item.main.pressure,
                  humidity: item.main.humidity,
                  warningType,
                  severity,
                  floodRisk: rainPerHour > 15 ? "HIGH" : rainPerHour > 10 ? "MODERATE" : "LOW"
                };
              });
            // Get local predictions
            const predictions = predictLocalDisasters(conditions);
            localPredictions.push(...predictions);

            // Create specific flash flood alerts
            const floodAlerts = createFlashFloodAlerts(conditions, forecastWarnings, location);

            if (
              warnings.length > 0 ||
              forecastWarnings.length > 0 ||
              predictions.length > 0 ||
              floodAlerts.length > 0
            ) {
              // Add main weather alert
              weatherData.push({
                id: `weather-${location}-${Date.now()}`,
                title: `Weather Alert: ${location}`,
                coordinates: coords,
                severity,
                type: "Weather Warning",
                date: new Date().toISOString(),
                details:
                  `🌦️ CURRENT CONDITIONS:\n` +
                  `${conditions.description}\n` +
                  `Temperature: ${conditions.temp.toFixed(1)}°C\n` +
                  `💧 Rainfall: ${conditions.rain.toFixed(1)} mm/h\n` +
                  `💨 Wind Speed: ${conditions.windSpeed.toFixed(1)} km/h\n` +
                  `📊 Pressure: ${conditions.pressure} hPa\n` +
                  `💦 Humidity: ${conditions.humidity}%\n` +
                  `👁️ Visibility: ${(conditions.visibility / 1000).toFixed(1)} km\n\n` +

                  `🚨 ACTIVE WARNINGS:\n${warnings.join("\n")}\n\n` +

                  (conditions.rain > 10 ?
                    `🌊 FLOOD RISK ASSESSMENT:\n` +
                    `Risk Level: ${conditions.rain > 50 ? "🔴 EXTREME" : conditions.rain > 25 ? "🟠 HIGH" : "🟡 MODERATE"}\n` +
                    `Flood Potential: ${conditions.rain > 50 ? "Flash flooding imminent" : conditions.rain > 25 ? "Flash flooding likely" : "Localized flooding possible"}\n` +
                    `Action Required: ${conditions.rain > 50 ? "IMMEDIATE EVACUATION" : conditions.rain > 25 ? "PREPARE TO EVACUATE" : "MONITOR CONDITIONS"}\n\n`
                    : "") +

                  (forecastWarnings.length > 0
                    ? `📅 FORECAST WARNINGS (Next 48 Hours):\n${forecastWarnings
                        .map((w) => {
                          const timeStr = w.time.toLocaleDateString() + " " + w.time.toLocaleTimeString();
                          const floodInfo = w.rain > 15 ? ` | 🌊 ${w.floodRisk} FLOOD RISK` : "";
                          return `${timeStr}: ${w.warningType}\n` +
                                 `   ${w.conditions} | ${w.temp.toFixed(1)}°C | ${w.windSpeed.toFixed(1)} km/h | ${w.rain.toFixed(1)}mm/h${floodInfo}`;
                        })
                        .join("\n")}`
                    : ""),
                source: "OpenWeather",
                url: `https://openweathermap.org/city/${current.id}`,
              });

              // Add specific flash flood alerts as separate entries
              floodAlerts.forEach(alert => {
                weatherData.push(alert);
              });
            }
            // Enhanced logging for flash flood monitoring
            console.log(`🌦️ Weather Analysis for ${location}:`, {
              conditions,
              warnings: warnings.length,
              severity,
              floodAlerts: floodAlerts.length,
              forecastWarnings: forecastWarnings.length
            });

            // Special logging for flash flood conditions
            if (conditions.rain > 10) {
              console.log(`🌊 FLOOD MONITORING - ${location}:`, {
                currentRainfall: `${conditions.rain}mm/h`,
                floodRisk: conditions.rain > 50 ? "EXTREME" : conditions.rain > 25 ? "HIGH" : "MODERATE",
                alertsGenerated: floodAlerts.length,
                forecastRisk: forecastWarnings.filter(w => w.rain > 15).length > 0 ? "YES" : "NO",
                emergencyLevel: conditions.rain > 75 ? "CRITICAL" : conditions.rain > 50 ? "HIGH" : "MODERATE"
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching weather for ${location}:`, error);
        }
      }
    );

    await Promise.all(promises);
  } catch (error) {
    console.error("Error in OpenWeather data fetch:", error);
  }

  return weatherData;
};

// Enhanced analyzeWeatherData function with flash flood and heavy rain detection
const analyzeWeatherData = (conditions) => {
  const warnings = [];
  let severity = "low";

  // Enhanced Flash Flood Detection
  if (conditions.rain > 75) {
    severity = "high";
    warnings.push("🌊 FLASH FLOOD EMERGENCY - Extremely Heavy Rainfall (>75mm/h)");
    warnings.push("⚠️ Immediate Evacuation Required - Life-threatening flooding");
  } else if (conditions.rain > 50) {
    severity = "high";
    warnings.push("🌊 Flash Flood Warning - Very Heavy Rainfall (50-75mm/h)");
    warnings.push("🚨 Avoid low-lying areas and underpasses");
  } else if (conditions.rain > 25) {
    severity = "moderate";
    warnings.push("🌧️ Heavy Rain Alert - Potential Flash Flooding (25-50mm/h)");
    warnings.push("⚠️ Monitor water levels and avoid flood-prone areas");
  } else if (conditions.rain > 10) {
    severity = "moderate";
    warnings.push("🌦️ Moderate to Heavy Rain - Flash Flood Watch (10-25mm/h)");
  }

  // Enhanced Rainfall Pattern Analysis
  if (conditions.rain > 20 && conditions.humidity > 85) {
    severity = severity === "low" ? "moderate" : severity;
    warnings.push("💧 Sustained Heavy Rainfall - Increased flood risk due to high humidity");
  }

  // Pressure-based flood prediction
  if (conditions.rain > 15 && conditions.pressure < 1000) {
    severity = severity === "low" ? "moderate" : severity;
    warnings.push("🌀 Low Pressure System - Enhanced rainfall and flood potential");
  }

  // Wind + Rain = Severe Storm Conditions
  if (conditions.rain > 20 && conditions.windSpeed > 50) {
    severity = "high";
    warnings.push("⛈️ Severe Thunderstorm - Heavy rain with strong winds");
    warnings.push("🌪️ Potential for flash flooding and wind damage");
  }

  // Temperature Warnings
  if (conditions.temp >= 45) {
    severity = "high";
    warnings.push("🌡️ Extreme Heat Warning - Heat Wave Conditions (>45°C)");
  } else if (conditions.temp >= 40) {
    severity = severity === "low" ? "moderate" : severity;
    warnings.push("🔥 Heat Advisory - High Temperature Alert (40-45°C)");
  }

  // Cold Temperature Warnings
  if (conditions.temp <= 5) {
    severity = "high";
    warnings.push("❄️ Extreme Cold Warning - Cold Wave Conditions (<5°C)");
  } else if (conditions.temp <= 10) {
    severity = severity === "low" ? "moderate" : severity;
    warnings.push("🧊 Cold Weather Advisory (5-10°C)");
  }

  // Enhanced Visibility and Storm Detection
  if (conditions.visibility < 1000 && conditions.windSpeed > 30) {
    severity = "high";
    warnings.push("🌪️ Dust Storm Warning - Extremely Low Visibility");
  }

  // Fog with potential for flash flooding
  if (conditions.visibility < 500 && conditions.humidity > 95 && conditions.rain > 5) {
    severity = severity === "low" ? "moderate" : severity;
    warnings.push("🌫️ Dense Fog with Rain - Reduced visibility during flooding");
  }

  // Heat Index Check
  const heatIndex = calculateHeatIndex(conditions.temp, conditions.humidity);
  if (heatIndex > 54) {
    severity = "high";
    warnings.push("🔥 Extreme Heat Danger - Heat Stroke Risk (Heat Index >54°C)");
  } else if (heatIndex > 41) {
    severity = severity === "low" ? "moderate" : severity;
    warnings.push("🌡️ Heat Advisory - Heat Exhaustion Risk (Heat Index >41°C)");
  }

  // Wind Chill Check
  const windChill = calculateWindChill(conditions.temp, conditions.windSpeed);
  if (windChill < -27) {
    severity = "high";
    warnings.push("🧊 Extreme Wind Chill - Frostbite Risk (<-27°C)");
  }

  // Enhanced logging for flash flood detection
  if (conditions.rain > 10) {
    console.log(`🌊 FLOOD DETECTION for ${conditions.location}:`, {
      rainfall: `${conditions.rain}mm/h`,
      severity,
      floodRisk: conditions.rain > 50 ? "EXTREME" : conditions.rain > 25 ? "HIGH" : "MODERATE",
      warnings: warnings.filter(w => w.includes("🌊") || w.includes("🌧️") || w.includes("🌦️"))
    });
  }

  return { warnings, severity };
};

// Enhanced function to extract comprehensive weather warning information with forecast details
const getComprehensiveWeatherWarning = (disaster) => {
  if (disaster.type !== "Weather Warning") {
    return {
      title: disaster.type,
      icon: "⚠️",
      severity: disaster.severity || "moderate",
      color: "gray",
      warnings: [],
      forecast: [],
      description: "",
      hasRealWarnings: false
    };
  }

  const details = disaster.details.toLowerCase();

  // Extract actual weather values from details for accurate analysis
  const extractWeatherValues = (text) => {
    const rainfallMatch = text.match(/rainfall:\s*(\d+\.?\d*)\s*mm\/h/i);
    const tempMatch = text.match(/temperature:\s*(\d+\.?\d*)\s*°c/i);
    const windMatch = text.match(/wind speed:\s*(\d+\.?\d*)\s*km\/h/i);
    const visibilityMatch = text.match(/visibility:\s*(\d+\.?\d*)\s*km/i);
    const humidityMatch = text.match(/humidity:\s*(\d+)\s*%/i);
    const pressureMatch = text.match(/pressure:\s*(\d+)\s*hpa/i);

    return {
      rainfall: rainfallMatch ? parseFloat(rainfallMatch[1]) : 0,
      temperature: tempMatch ? parseFloat(tempMatch[1]) : null,
      windSpeed: windMatch ? parseFloat(windMatch[1]) : 0,
      visibility: visibilityMatch ? parseFloat(visibilityMatch[1]) : 10,
      humidity: humidityMatch ? parseInt(humidityMatch[1]) : 50,
      pressure: pressureMatch ? parseInt(pressureMatch[1]) : 1013
    };
  };

  // Extract forecast information from details
  const extractForecastData = (text) => {
    const forecastSection = text.match(/📅 forecast warnings \(next 48 hours\):(.*?)(?=\n\n|$)/is);
    if (!forecastSection) return [];

    const forecastLines = forecastSection[1].split('\n').filter(line => line.trim());
    const forecasts = [];

    for (let i = 0; i < forecastLines.length; i += 2) {
      const timeLine = forecastLines[i];
      const detailLine = forecastLines[i + 1];

      if (timeLine && detailLine) {
        const timeMatch = timeLine.match(/(\d{1,2}\/\d{1,2}\/\d{4}.*?\d{1,2}:\d{2}:\d{2}.*?):/);
        const conditionMatch = detailLine.match(/(.+?)\s*\|\s*(\d+\.?\d*)°c\s*\|\s*(\d+\.?\d*)\s*km\/h\s*\|\s*(\d+\.?\d*)mm\/h/i);

        if (timeMatch && conditionMatch) {
          forecasts.push({
            time: timeMatch[1].trim(),
            condition: conditionMatch[1].trim(),
            temperature: parseFloat(conditionMatch[2]),
            windSpeed: parseFloat(conditionMatch[3]),
            rainfall: parseFloat(conditionMatch[4])
          });
        }
      }
    }

    return forecasts;
  };

  const weatherData = extractWeatherValues(details);
  const forecastData = extractForecastData(disaster.details);
  let activeWarnings = [];
  let primaryWarning = "";
  let warningIcon = "🌦️";
  let severityLevel = "low";
  let warningColor = "blue";
  let hasRealWarnings = false;

  // REAL-TIME WARNING ANALYSIS - Only show warnings when actual conditions warrant them

  // CRITICAL FLOOD WARNINGS (Only if actual rainfall is significant)
  if (weatherData.rainfall > 75 || details.includes('flash flood emergency')) {
    primaryWarning = "🚨 FLASH FLOOD EMERGENCY";
    activeWarnings.push(`🌊 EXTREME RAINFALL: ${weatherData.rainfall.toFixed(1)} mm/h`);
    activeWarnings.push("⚠️ IMMEDIATE EVACUATION REQUIRED");
    activeWarnings.push("🚨 LIFE-THREATENING FLOODING");
    warningIcon = "🌊";
    severityLevel = "high";
    warningColor = "red";
    hasRealWarnings = true;
  } else if (weatherData.rainfall > 50 || details.includes('flash flood warning')) {
    primaryWarning = "🌊 FLASH FLOOD WARNING";
    activeWarnings.push(`🌧️ VERY HEAVY RAINFALL: ${weatherData.rainfall.toFixed(1)} mm/h`);
    activeWarnings.push("⚠️ AVOID LOW-LYING AREAS");
    activeWarnings.push("🚨 PREPARE FOR EVACUATION");
    warningIcon = "🌊";
    severityLevel = "high";
    warningColor = "orange";
    hasRealWarnings = true;
  } else if (weatherData.rainfall > 25) {
    primaryWarning = "🌧️ HEAVY RAIN WARNING";
    activeWarnings.push(`💧 HEAVY RAINFALL: ${weatherData.rainfall.toFixed(1)} mm/h`);
    activeWarnings.push("⚠️ FLOOD RISK - MONITOR CONDITIONS");
    warningIcon = "🌧️";
    severityLevel = "moderate";
    warningColor = "yellow";
    hasRealWarnings = true;
  } else if (weatherData.rainfall > 10) {
    primaryWarning = "🌦️ MODERATE RAIN ALERT";
    activeWarnings.push(`💧 MODERATE RAINFALL: ${weatherData.rainfall.toFixed(1)} mm/h`);
    activeWarnings.push("⚠️ WATCH FOR LOCALIZED FLOODING");
    warningIcon = "🌦️";
    severityLevel = "moderate";
    warningColor = "blue";
    hasRealWarnings = true;
  }

  // EXTREME TEMPERATURE WARNINGS (Only if actual temperature data supports it)
  if (weatherData.temperature !== null && weatherData.temperature >= 45) {
    if (!primaryWarning) {
      primaryWarning = "🔥 EXTREME HEAT EMERGENCY";
      warningIcon = "🔥";
      severityLevel = "high";
      warningColor = "red";
    }
    activeWarnings.push(`🌡️ EXTREME TEMPERATURE: ${weatherData.temperature.toFixed(1)}°C`);
    activeWarnings.push("🚨 HEAT STROKE RISK - STAY INDOORS");
    activeWarnings.push("💧 DRINK WATER FREQUENTLY");
    hasRealWarnings = true;
  } else if (weatherData.temperature !== null && weatherData.temperature >= 40) {
    if (!primaryWarning) {
      primaryWarning = "🔥 HEAT WAVE WARNING";
      warningIcon = "🔥";
      severityLevel = "high";
      warningColor = "orange";
    }
    activeWarnings.push(`🌡️ HIGH TEMPERATURE: ${weatherData.temperature.toFixed(1)}°C`);
    activeWarnings.push("⚠️ HEAT EXHAUSTION RISK");
    activeWarnings.push("🏠 LIMIT OUTDOOR ACTIVITIES");
    hasRealWarnings = true;
  } else if (weatherData.temperature !== null && weatherData.temperature <= 5) {
    if (!primaryWarning) {
      primaryWarning = "❄️ EXTREME COLD WARNING";
      warningIcon = "❄️";
      severityLevel = "high";
      warningColor = "blue";
    }
    activeWarnings.push(`🧊 EXTREME COLD: ${weatherData.temperature.toFixed(1)}°C`);
    activeWarnings.push("🚨 FROSTBITE RISK - STAY WARM");
    activeWarnings.push("🏠 AVOID PROLONGED EXPOSURE");
    hasRealWarnings = true;
  } else if (weatherData.temperature !== null && weatherData.temperature <= 10) {
    if (!primaryWarning) {
      primaryWarning = "🧊 COLD WAVE ALERT";
      warningIcon = "❄️";
      severityLevel = "moderate";
      warningColor = "blue";
    }
    activeWarnings.push(`❄️ COLD TEMPERATURE: ${weatherData.temperature.toFixed(1)}°C`);
    activeWarnings.push("⚠️ DRESS WARMLY");
    hasRealWarnings = true;
  }

  // DANGEROUS WIND WARNINGS (Only if actual wind speed is high)
  if (weatherData.windSpeed > 62) {
    if (!primaryWarning) {
      primaryWarning = "💨 SEVERE WIND WARNING";
      warningIcon = "💨";
      severityLevel = "high";
      warningColor = "red";
    }
    activeWarnings.push(`🌪️ SEVERE WINDS: ${weatherData.windSpeed.toFixed(1)} km/h`);
    activeWarnings.push("🚨 STRUCTURAL DAMAGE POSSIBLE");
    activeWarnings.push("🏠 STAY INDOORS - AVOID TRAVEL");
    hasRealWarnings = true;
  } else if (weatherData.windSpeed > 50) {
    if (!primaryWarning) {
      primaryWarning = "💨 HIGH WIND ALERT";
      warningIcon = "💨";
      severityLevel = "moderate";
      warningColor = "orange";
    }
    activeWarnings.push(`💨 HIGH WINDS: ${weatherData.windSpeed.toFixed(1)} km/h`);
    activeWarnings.push("⚠️ SECURE LOOSE OBJECTS");
    hasRealWarnings = true;
  }

  // SEVERE STORM WARNINGS (Multi-factor - only if both conditions are met)
  if (weatherData.rainfall > 15 && weatherData.windSpeed > 40) {
    if (!primaryWarning) {
      primaryWarning = "⛈️ SEVERE THUNDERSTORM";
      warningIcon = "⛈️";
      severityLevel = "high";
      warningColor = "purple";
    }
    activeWarnings.push("🌩️ SEVERE STORM CONDITIONS");
    activeWarnings.push("⚡ LIGHTNING RISK - STAY INDOORS");
    hasRealWarnings = true;
  }

  // VISIBILITY WARNINGS (Only if actual visibility is impaired)
  if (weatherData.visibility < 1 && weatherData.windSpeed > 30) {
    if (!primaryWarning) {
      primaryWarning = "🌪️ DUST STORM WARNING";
      warningIcon = "🌪️";
      severityLevel = "high";
      warningColor = "brown";
    }
    activeWarnings.push(`👁️ EXTREMELY LOW VISIBILITY: ${weatherData.visibility.toFixed(1)} km`);
    activeWarnings.push("🚨 AVOID TRAVEL - STAY INDOORS");
    hasRealWarnings = true;
  } else if (weatherData.visibility < 0.5 && weatherData.humidity > 95) {
    if (!primaryWarning) {
      primaryWarning = "🌫️ DENSE FOG WARNING";
      warningIcon = "🌫️";
      severityLevel = "moderate";
      warningColor = "gray";
    }
    activeWarnings.push(`👁️ DENSE FOG: ${weatherData.visibility.toFixed(1)} km visibility`);
    activeWarnings.push("🚗 DRIVE CAREFULLY - USE FOG LIGHTS");
    hasRealWarnings = true;
  }

  // ATMOSPHERIC PRESSURE WARNINGS (Only if pressure is significantly low)
  if (weatherData.pressure < 980) {
    activeWarnings.push(`LOW PRESSURE SYSTEM: ${weatherData.pressure} hPa`);
    activeWarnings.push("SEVERE WEATHER DEVELOPING");
    hasRealWarnings = true;
  }

  // Only show warnings if there are actual real weather conditions that warrant them
  if (!hasRealWarnings) {
    // Check if there are any text-based warnings for specific events
    if (details.includes('cyclone') || details.includes('hurricane')) {
      primaryWarning = "🌀 CYCLONE WARNING";
      warningIcon = "🌀";
      severityLevel = "high";
      warningColor = "red";
      activeWarnings.push("CYCLONIC CONDITIONS");
      activeWarnings.push("EXTREME WEATHER SYSTEM");
      hasRealWarnings = true;
    } else if (details.includes('flash flood emergency') || details.includes('flood warning')) {
      // These are handled above, but ensure we catch text-based flood warnings
      hasRealWarnings = true;
    } else {
      // No real warnings - return minimal advisory
      primaryWarning = "🌦️ WEATHER MONITORING";
      warningIcon = "🌦️";
      severityLevel = "low";
      warningColor = "blue";
      activeWarnings = ["LIVE WEATHER MONITORING"];
    }
  }

  return {
    title: primaryWarning,
    icon: warningIcon,
    severity: severityLevel,
    color: warningColor,
    warnings: activeWarnings,
    forecast: forecastData,
    description: hasRealWarnings ?
      `${activeWarnings.length} active warning${activeWarnings.length !== 1 ? 's' : ''}` :
      "Live monitoring - No active warnings",
    hasRealWarnings: hasRealWarnings
  };
};



// Add these helper functions
const calculateHeatIndex = (temp, humidity) => {
  // Simplified heat index calculation
  if (temp < 27) return temp;

  return (
    -8.784695 +
    1.61139411 * temp +
    2.338549 * humidity -
    0.14611605 * temp * humidity -
    0.012308094 * temp * temp -
    0.016424828 * humidity * humidity +
    0.002211732 * temp * temp * humidity +
    0.00072546 * temp * humidity * humidity -
    0.000003582 * temp * temp * humidity * humidity
  );
};

const calculateWindChill = (temp, windSpeed) => {
  // Wind chill calculation
  if (temp > 10 || windSpeed < 4.8) return temp;

  return (
    13.12 +
    0.6215 * temp -
    11.37 * Math.pow(windSpeed, 0.16) +
    0.3965 * temp * Math.pow(windSpeed, 0.16)
  );
};

// Update the fetchEarthquakeData function with proper date formatting and parameters
const fetchEarthquakeData = async () => {
  try {
    // Format date properly for USGS API (YYYY-MM-DD)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startTime = thirtyDaysAgo.toISOString().split("T")[0];
    const endTime = today.toISOString().split("T")[0];

    // Construct the USGS API URL with proper parameters
    const queryParams = new URLSearchParams({
      format: "geojson",
      starttime: startTime,
      endtime: endTime,
      minmagnitude: "4.0",
      maxlatitude: INDIA_BBOX.north,
      minlatitude: INDIA_BBOX.south,
      maxlongitude: INDIA_BBOX.east,
      minlongitude: INDIA_BBOX.west,
      orderby: "magnitude",
    });

    const response = await fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?${queryParams.toString()}`
    );

    if (!response.ok) {
      console.error("USGS API Response:", await response.text());
      throw new Error(`USGS API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("USGS API Response:", data);
    console.log(
      "Earthquake response:",
      data.features?.length || 0,
      "earthquakes found"
    );

    return data.features
      .filter((eq) => {
        const [lon, lat] = eq.geometry.coordinates;
        // Additional filtering to ensure points are within India
        return (
          lat >= INDIA_BBOX.south &&
          lat <= INDIA_BBOX.north &&
          lon >= INDIA_BBOX.west &&
          lon <= INDIA_BBOX.east
        );
      })
      .map((eq) => ({
        id: `eq-${eq.id}`,
        title: `M${eq.properties.mag.toFixed(1)} Earthquake near ${
          eq.properties.place
        }`,
        coordinates: [eq.geometry.coordinates[1], eq.geometry.coordinates[0]],
        severity:
          eq.properties.mag >= 6
            ? "high"
            : eq.properties.mag >= 5
            ? "moderate"
            : "low",
        type: "Earthquake",
        date: new Date(eq.properties.time).toISOString(),
        details: formatEarthquakeDetails(eq.properties),
        source: "USGS",
        url: eq.properties.url,
      }));
  } catch (error) {
    console.error("Error fetching earthquake data:", error);
    return [];
  }
};

// Add helper function to format earthquake details
const formatEarthquakeDetails = (properties) => {
  return (
    `Magnitude: ${properties.mag.toFixed(1)}\n` +
    `Depth: ${properties.depth} km\n` +
    `Location: ${properties.place}\n` +
    `Tsunami Risk: ${properties.tsunami === 1 ? "Yes" : "No"}\n` +
    `Intensity: ${
      properties.mmi ? `${properties.mmi} MMI` : "Not available"
    }\n` +
    `Status: ${
      properties.status.charAt(0).toUpperCase() + properties.status.slice(1)
    }`
  );
};

// Update fetchLandslideData function
const fetchLandslideData = async () => {
  try {
    const response = await fetch(
      `https://eonet.gsfc.nasa.gov/api/v3/events?category=landslides&status=open&bbox=${INDIA_BBOX.west},${INDIA_BBOX.south},${INDIA_BBOX.east},${INDIA_BBOX.north}`
    );

    if (!response.ok) {
      throw new Error(`NASA API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("NASA Landslide data:", data); // Debug log

    if (!data.events || !Array.isArray(data.events)) {
      console.warn("No landslide events found or invalid data format");
      return [];
    }

    return data.events
      .filter((event) => event.geometry && event.geometry[0]?.coordinates)
      .map((event) => ({
        id: `landslide-${event.id}`,
        title: `Landslide Risk: ${event.title}`,
        coordinates: event.geometry[0].coordinates.reverse(),
        severity: "high",
        type: "Landslide Warning",
        date: event.geometry[0].date || new Date().toISOString(),
        details: `Location: ${event.title}\nSource: ${
          event.sources?.[0]?.id || "NASA EONET"
        }\nStatus: ${event.closed ? "Closed" : "Active"}`,
        source: "NASA EONET",
        url:
          event.sources?.[0]?.url ||
          "https://eonet.gsfc.nasa.gov/api/v3/events",
      }));
  } catch (error) {
    console.error("Error fetching landslide data:", error);
    return [];
  }
};

// Update fetchTsunamiData function
const fetchTsunamiData = async () => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const startDate = thirtyDaysAgo.toISOString().split("T")[0];
    const endDate = today.toISOString().split("T")[0];

    // Use a proxy or alternative API endpoint
    const response = await fetch(
      `https://api.allorigins.win/raw?url=${encodeURIComponent(
        `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?` +
          `datasetid=GHCND&` +
          `locationid=FIPS:IN&` +
          `startdate=${startDate}&` +
          `enddate=${endDate}&` +
          `limit=1000`
      )}`,
      {
        headers: {
          token: API_KEYS.NOAA,
        },
      }
    );

    if (!response.ok) {
      console.warn("NCDC API Response:", await response.text());
      return []; // Return empty array instead of throwing
    }

    const data = await response.json();
    console.log("NCDC Weather data:", data);

    return (data?.results || [])
      .filter((record) => record.value !== null)
      .map((record, index) => ({
        id: `weather-${record.station}-${record.date}-${index}`,
        title: `Weather Event: ${record.station}`,
        coordinates: [
          record.latitude || defaultCenter[0],
          record.longitude || defaultCenter[1],
        ],
        severity: determineWeatherSeverity(record),
        type: "Weather Warning",
        date: record.date,
        details: formatWeatherDetails(record),
        source: "NOAA/NCDC",
        url: "https://www.ncdc.noaa.gov/cdo-web/",
      }));
  } catch (error) {
    console.error("Error fetching NCDC data:", error);
    return []; // Return empty array on error
  }
};

// Add helper functions
const determineWeatherSeverity = (record) => {
  // Add logic based on data values
  return "moderate";
};

const formatWeatherDetails = (record) => {
  return (
    `Station: ${record.station}\n` +
    `Data Type: ${record.datatype}\n` +
    `Value: ${record.value}\n` +
    `Date: ${new Date(record.date).toLocaleDateString()}`
  );
};

const fetchAirQualityData = async (locations) => {
  try {
    const promises = Object.entries(locations).map(
      async ([location, coords]) => {
        try {
          const [lat, lon] = coords;
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEYS.OPENWEATHER}`
          );

          if (!response.ok)
            throw new Error(`Air Quality API Error: ${response.status}`);
          const data = await response.json();

          // AQI levels: 1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor
          if (data.list?.[0]?.main?.aqi) {
            const aqi = data.list[0].main.aqi;
            const components = data.list[0].components;

            return {
              id: `air-${location}-${Date.now()}`,
              title: `Air Quality Alert: ${location}`,
              coordinates: coords,
              severity: aqi >= 4 ? "high" : aqi >= 3 ? "moderate" : "low",
              type: "Air Quality Warning",
              date: new Date().toISOString(),
              details:
                `Air Quality Index: ${aqi}/5\n` +
                `PM2.5: ${components.pm2_5} μg/m³\n` +
                `PM10: ${components.pm10} μg/m³\n` +
                `NO2: ${components.no2} μg/m³\n` +
                `SO2: ${components.so2} μg/m³\n` +
                `O3: ${components.o3} μg/m³\n` +
                `CO: ${components.co} μg/m³`,
              source: "OpenWeather Air Quality",
              url: "https://openweathermap.org/api/air-pollution",
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching air quality for ${location}:`, error);
          return null;
        }
      }
    );

    const results = await Promise.all(promises);
    return results.filter((result) => result !== null);
  } catch (error) {
    console.error("Error fetching air quality data:", error);
    return [];
  }
};

// Enhanced local disaster prediction with advanced flash flood detection
const predictLocalDisasters = (weatherData) => {
  const predictions = [];
  const location = weatherData.location?.toLowerCase() || "";

  // 🌊 ADVANCED FLASH FLOOD PREDICTION SYSTEM
  const floodRiskFactors = calculateFloodRisk(weatherData, location);

  if (floodRiskFactors.riskLevel === "EXTREME") {
    predictions.push({
      type: "Flash Flood",
      severity: "high",
      probability: 0.95,
      details: `🚨 EXTREME FLASH FLOOD RISK: ${floodRiskFactors.details}`,
      emergencyLevel: "CRITICAL",
      icon: "🌊",
      actionRequired: "IMMEDIATE EVACUATION"
    });
  } else if (floodRiskFactors.riskLevel === "HIGH") {
    predictions.push({
      type: "Flash Flood",
      severity: "high",
      probability: 0.85,
      details: `⚠️ HIGH FLASH FLOOD RISK: ${floodRiskFactors.details}`,
      emergencyLevel: "HIGH",
      icon: "🌊",
      actionRequired: "PREPARE FOR EVACUATION"
    });
  } else if (floodRiskFactors.riskLevel === "MODERATE") {
    predictions.push({
      type: "Flash Flood",
      severity: "moderate",
      probability: 0.65,
      details: `🌧️ MODERATE FLOOD RISK: ${floodRiskFactors.details}`,
      emergencyLevel: "MODERATE",
      icon: "🌦️",
      actionRequired: "MONITOR CONDITIONS"
    });
  }

  // 🌀 Enhanced Cyclone Detection
  if (weatherData.rain > 30 && weatherData.windSpeed > 25) {
    const cycloneIntensity = weatherData.rain > 75 && weatherData.windSpeed > 100 ? "SUPER CYCLONE" :
                           weatherData.rain > 50 && weatherData.windSpeed > 75 ? "VERY SEVERE" :
                           weatherData.rain > 35 && weatherData.windSpeed > 50 ? "SEVERE" : "CYCLONIC STORM";

    predictions.push({
      type: "Cyclone",
      severity: weatherData.rain > 50 ? "high" : "moderate",
      probability: 0.8,
      details: `🌀 ${cycloneIntensity}: Rain ${weatherData.rain}mm/h, Wind ${weatherData.windSpeed}km/h`,
      icon: "🌀",
      emergencyLevel: weatherData.rain > 50 ? "HIGH" : "MODERATE"
    });
  }

  // 🔥 Heat Wave Detection
  if (weatherData.temp > 40) {
    predictions.push({
      type: "Heat Wave",
      severity: weatherData.temp > 45 ? "high" : "moderate",
      probability: 0.9,
      details: `🌡️ Extreme temperature ${weatherData.temp}°C - Heat stroke risk`,
      icon: "🔥",
      emergencyLevel: weatherData.temp > 45 ? "HIGH" : "MODERATE"
    });
  }

  // ❄️ Cold Wave Detection
  if (weatherData.temp < 5) {
    predictions.push({
      type: "Cold Wave",
      severity: weatherData.temp < 0 ? "high" : "moderate",
      probability: 0.9,
      details: `🧊 Severe cold ${weatherData.temp}°C - Hypothermia risk`,
      icon: "❄️",
      emergencyLevel: weatherData.temp < 0 ? "HIGH" : "MODERATE"
    });
  }

  // 🏔️ Enhanced Landslide Risk (for hilly areas)
  if (weatherData.rain > 25 && hillStations.includes(location)) {
    const landslideRisk = weatherData.rain > 60 ? "EXTREME" :
                         weatherData.rain > 40 ? "HIGH" : "MODERATE";

    predictions.push({
      type: "Landslide",
      severity: weatherData.rain > 40 ? "high" : "moderate",
      probability: 0.75,
      details: `⛰️ ${landslideRisk} LANDSLIDE RISK: ${weatherData.rain}mm/h rainfall in hilly terrain`,
      icon: "🏔️",
      emergencyLevel: weatherData.rain > 40 ? "HIGH" : "MODERATE"
    });
  }

  // ⛈️ Severe Thunderstorm Detection
  if (weatherData.clouds > 75 && weatherData.windSpeed > 20) {
    predictions.push({
      type: "Thunderstorm",
      severity: weatherData.windSpeed > 30 ? "high" : "moderate",
      probability: 0.8,
      details: `⛈️ Severe thunderstorm: ${weatherData.clouds}% cloud cover, ${weatherData.windSpeed}km/h winds`,
      icon: "⛈️",
      emergencyLevel: weatherData.windSpeed > 30 ? "HIGH" : "MODERATE"
    });
  }

  // 🌫️ Dense Fog Warning
  if (weatherData.visibility < 1000 && weatherData.humidity > 90) {
    predictions.push({
      type: "Dense Fog",
      severity: weatherData.visibility < 500 ? "high" : "moderate",
      probability: 0.9,
      details: `🌫️ Dense fog: ${weatherData.visibility}m visibility, ${weatherData.humidity}% humidity`,
      icon: "🌫️",
      emergencyLevel: weatherData.visibility < 500 ? "HIGH" : "MODERATE"
    });
  }

  // 🌵 Drought Conditions
  if (weatherData.humidity < 30 && weatherData.temp > 35) {
    predictions.push({
      type: "Drought",
      severity: "moderate",
      probability: 0.7,
      details: `🌵 Drought conditions: ${weatherData.humidity}% humidity, ${weatherData.temp}°C temperature`,
      icon: "🌵",
      emergencyLevel: "MODERATE"
    });
  }

  return predictions;
};

// 🌊 Advanced Flood Risk Calculation System
const calculateFloodRisk = (weatherData, location) => {
  let riskScore = 0;
  let riskFactors = [];

  // Primary rainfall factor
  if (weatherData.rain > 75) {
    riskScore += 50;
    riskFactors.push(`Extreme rainfall ${weatherData.rain}mm/h`);
  } else if (weatherData.rain > 50) {
    riskScore += 35;
    riskFactors.push(`Very heavy rainfall ${weatherData.rain}mm/h`);
  } else if (weatherData.rain > 25) {
    riskScore += 20;
    riskFactors.push(`Heavy rainfall ${weatherData.rain}mm/h`);
  } else if (weatherData.rain > 10) {
    riskScore += 10;
    riskFactors.push(`Moderate rainfall ${weatherData.rain}mm/h`);
  }

  // Humidity factor (saturated ground)
  if (weatherData.humidity > 95) {
    riskScore += 15;
    riskFactors.push("Saturated atmospheric conditions");
  } else if (weatherData.humidity > 85) {
    riskScore += 10;
    riskFactors.push("High humidity levels");
  }

  // Pressure factor (storm systems)
  if (weatherData.pressure < 980) {
    riskScore += 20;
    riskFactors.push("Very low pressure system");
  } else if (weatherData.pressure < 1000) {
    riskScore += 10;
    riskFactors.push("Low pressure system");
  }

  // Wind factor (storm intensity)
  if (weatherData.windSpeed > 60) {
    riskScore += 15;
    riskFactors.push("Strong winds enhancing storm");
  } else if (weatherData.windSpeed > 30) {
    riskScore += 8;
    riskFactors.push("Moderate winds");
  }

  // Location-specific factors
  const floodProneAreas = [
    "mumbai", "chennai", "kolkata", "guwahati", "patna", "varanasi",
    "jammu", "srinagar", "kochi", "mangalore", "puducherry", "puri",
    "digha", "chilika", "haldia", "daman", "alibag"
  ];

  if (floodProneAreas.includes(location)) {
    riskScore += 15;
    riskFactors.push("Flood-prone geographical area");
  }

  // Coastal areas (storm surge risk)
  const coastalAreas = [
    "mumbai", "chennai", "kochi", "visakhapatnam", "mangalore",
    "puducherry", "puri", "digha", "porbandar", "diu", "karwar"
  ];

  if (coastalAreas.includes(location) && weatherData.windSpeed > 40) {
    riskScore += 12;
    riskFactors.push("Coastal storm surge potential");
  }

  // Determine risk level
  let riskLevel, details;
  if (riskScore >= 70) {
    riskLevel = "EXTREME";
    details = `Score: ${riskScore}/100. ${riskFactors.join(", ")}`;
  } else if (riskScore >= 45) {
    riskLevel = "HIGH";
    details = `Score: ${riskScore}/100. ${riskFactors.join(", ")}`;
  } else if (riskScore >= 25) {
    riskLevel = "MODERATE";
    details = `Score: ${riskScore}/100. ${riskFactors.join(", ")}`;
  } else {
    riskLevel = "LOW";
    details = `Score: ${riskScore}/100. Current conditions stable`;
  }

  return { riskLevel, riskScore, details, factors: riskFactors };
};

// 🌊 Create specific flash flood alerts for locations
const createFlashFloodAlerts = (conditions, forecastWarnings, location) => {
  const alerts = [];
  const locationName = location.charAt(0).toUpperCase() + location.slice(1);

  // Current conditions flash flood alert
  if (conditions.rain > 25) {
    const alertLevel = conditions.rain > 75 ? "EMERGENCY" :
                      conditions.rain > 50 ? "WARNING" :
                      conditions.rain > 25 ? "WATCH" : "ADVISORY";

    alerts.push({
      id: `flood-current-${location}-${Date.now()}`,
      title: `🌊 Flash Flood ${alertLevel}: ${locationName}`,
      coordinates: [conditions.lat || 0, conditions.lon || 0],
      severity: conditions.rain > 50 ? "high" : "moderate",
      type: "Flash Flood",
      date: new Date().toISOString(),
      details: `🚨 CURRENT FLASH FLOOD ${alertLevel}\n` +
               `Location: ${locationName}\n` +
               `Rainfall Rate: ${conditions.rain.toFixed(1)} mm/h\n` +
               `Risk Level: ${conditions.rain > 75 ? "EXTREME" : conditions.rain > 50 ? "HIGH" : "MODERATE"}\n` +
               `Action: ${conditions.rain > 75 ? "EVACUATE IMMEDIATELY" : conditions.rain > 50 ? "PREPARE TO EVACUATE" : "AVOID LOW AREAS"}\n` +
               `Conditions: ${conditions.description}\n` +
               `Pressure: ${conditions.pressure} hPa\n` +
               `Humidity: ${conditions.humidity}%`,
      source: "OpenWeather Flash Flood Detection",
      url: "https://openweathermap.org/",
      emergencyLevel: alertLevel,
      icon: "🌊"
    });
  }

  // Forecast-based flash flood alerts
  const severeFloodForecasts = forecastWarnings.filter(w => w.rain > 20);
  if (severeFloodForecasts.length > 0) {
    const maxRainForecast = severeFloodForecasts.reduce((max, current) =>
      current.rain > max.rain ? current : max
    );

    alerts.push({
      id: `flood-forecast-${location}-${Date.now()}`,
      title: `🌊 Flash Flood Forecast: ${locationName}`,
      coordinates: [conditions.lat || 0, conditions.lon || 0],
      severity: maxRainForecast.rain > 50 ? "high" : "moderate",
      type: "Flash Flood",
      date: maxRainForecast.time.toISOString(),
      details: `📅 UPCOMING FLASH FLOOD RISK\n` +
               `Location: ${locationName}\n` +
               `Expected Time: ${maxRainForecast.time.toLocaleString()}\n` +
               `Forecast Rainfall: ${maxRainForecast.rain.toFixed(1)} mm/h\n` +
               `Risk Level: ${maxRainForecast.floodRisk}\n` +
               `Warning Type: ${maxRainForecast.warningType}\n` +
               `Preparation Time: ${Math.round((maxRainForecast.time - new Date()) / (1000 * 60 * 60))} hours\n` +
               `Action Required: PREPARE EMERGENCY SUPPLIES AND EVACUATION PLAN`,
      source: "OpenWeather Flood Forecast",
      url: "https://openweathermap.org/",
      emergencyLevel: maxRainForecast.severity === "high" ? "WARNING" : "WATCH",
      icon: "🌊"
    });
  }

  return alerts;
};

// Add this array for hill stations
const hillStations = [
  "shimla",
  "manali",
  "darjeeling",
  "mussoorie",
  "nainital",
  "gangtok",
  "ooty",
  "kodaikanal",
  "munnar",
  "dehradun",
  "shillong",
  "srinagar",
  "kalimpong",
  "dharamshala",
  "almora",
];

function Legend() {
  return (
    <div className="absolute bottom-8 right-8 bg-white p-4 rounded-lg shadow-lg z-[1000]">
      <h4 className="text-gray-900 font-bold mb-2">
        <TranslatableText>Severity Levels</TranslatableText>
      </h4>
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-600 mr-2 rounded"></div>
          <span className="text-gray-700">
            <TranslatableText>High Severity</TranslatableText>
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-400 mr-2 rounded"></div>
          <span className="text-gray-700">
            <TranslatableText>Moderate Severity</TranslatableText>
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 mr-2 rounded"></div>
          <span className="text-gray-700">
            <TranslatableText>Low/No Risk</TranslatableText>
          </span>
        </div>
      </div>
    </div>
  );
}

// Add these components just before the Home function
// Removed duplicate Header function to resolve the error

// Removed duplicate Footer function to resolve the error

// Add this new component for handling map zooming
const MapController = ({ location }) => {
  const map = useMap();
  const defaultZoom = 5;
  const defaultCenter = useMemo(() => [20.5937, 78.9629], []); // Center of India

  useEffect(() => {
    // Handle location changes (zooming in)
    if (location && map) {
      const { coordinates, zoom } = location;
      if (Array.isArray(coordinates) && coordinates.length === 2) {
        map.flyTo(coordinates, zoom || 8, {
          duration: 1.5,
          easeLinearity: 0.25,
        });
      }
    }

    // Add click handler for zooming out
    const handleMapClick = (e) => {
      // Check if click is directly on the map (not on markers/polygons)
      const target = e.originalEvent.target;
      const isMapClick =
        target.classList.contains("leaflet-container") ||
        target.classList.contains("leaflet-tile") ||
        target.classList.contains("leaflet-tile-container");

      if (isMapClick) {
        map.flyTo(defaultCenter, defaultZoom, {
          duration: 1.5,
          easeLinearity: 0.25,
        });
      }
    };

    map.on("click", handleMapClick);

    // Cleanup
    return () => {
      map.off("click", handleMapClick);
    };
  }, [map, location, defaultCenter, defaultZoom]);

  return null;
};

function Home() {
  const [location, setLocation] = useState(null);
  const [search, setSearch] = useState("");
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapDisasters, setMapDisasters] = useState([]);
  const [filteredDisasters, setFilteredDisasters] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [showDetailedPopup, setShowDetailedPopup] = useState(false);
  const [selectedDisasterGroup, setSelectedDisasterGroup] = useState(null);

  // Remove the notification comment and related code

  const filterDisasters = useCallback(
    (searchTerm) => {
      console.log("Filtering disasters with term:", searchTerm);

      if (!searchTerm.trim()) {
        console.log("Empty search, showing all disasters");
        setFilteredDisasters(disasters);
        return;
      }

      const searchLower = searchTerm.toLowerCase();

      // First, check if the search term matches any location
      const matchingLocations = Object.keys(locations).filter((location) =>
        location.toLowerCase().includes(searchLower)
      );

      console.log("Matching locations:", matchingLocations);

      const filtered = disasters.filter((disaster) => {
        // Check if disaster is in any of the matching locations
        const locationMatch = matchingLocations.some((location) => {
          const [lat, lon] = locations[location];
          return (
            disaster.coordinates[0] === lat && disaster.coordinates[1] === lon
          );
        });

        // Check all other fields
        const titleMatch = disaster.title?.toLowerCase().includes(searchLower);
        const typeMatch = disaster.type?.toLowerCase().includes(searchLower);
        const severityMatch = disaster.severity
          ?.toLowerCase()
          .includes(searchLower);
        const detailsMatch = disaster.details
          ?.toLowerCase()
          .includes(searchLower);
        const sourceMatch = disaster.source
          ?.toLowerCase()
          .includes(searchLower);

        return (
          locationMatch ||
          titleMatch ||
          typeMatch ||
          severityMatch ||
          detailsMatch ||
          sourceMatch
        );
      });

      console.log(`Found ${filtered.length} matching disasters`);
      setFilteredDisasters(filtered);
    },
    [disasters]
  );

  // Add this new component above LocationSuggestions
  function useOutsideClick(ref, callback) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          callback();
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [ref, callback]);
  }

  // Update the LocationSuggestions component to clear suggestions after selection
  const LocationSuggestions = ({ searchTerm, onSelect }) => {
    const [isVisible, setIsVisible] = useState(true);
    const suggestionsRef = useRef(null);    useOutsideClick(suggestionsRef, () => setIsVisible(false));    // Reset visibility when search term changes
    useEffect(() => {
      setIsVisible(true);
    }, [searchTerm]);

    if (!searchTerm.trim() || !isVisible) return null;

    const matchingLocations = Object.keys(locations)
      .filter((location) =>
        location.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5);

    if (matchingLocations.length === 0) return null;

    return (
      <div
        ref={suggestionsRef}
        className="absolute z-50 w-full bg-gray-700 dark:bg-dark-bg-tertiary rounded-md shadow-lg mt-1 border border-gray-600 dark:border-gray-700 max-h-48 overflow-y-auto"
      >
        <ul className="py-1">
          {matchingLocations.map((location) => (
            <li
              key={location}
              className="px-4 py-2 hover:bg-gray-600 dark:hover:bg-dark-bg-secondary cursor-pointer text-gray-200 dark:text-dark-text-secondary flex items-center"
              onClick={() => {
                onSelect(location);
                setIsVisible(false);
              }}
            >
              <svg
                className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              <TranslatableText>
                {location.charAt(0).toUpperCase() + location.slice(1)}
              </TranslatableText>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Update the zoomToLocation function to handle different zoom levels
  const handleZoom = useCallback((coordinates, zoomLevel = 8) => {
    setLocation({
      coordinates: coordinates,
      zoom: zoomLevel,
    });
  }, []);

  // Update the handleLocationSelect function
  const handleLocationSelect = useCallback(
    (location) => {
      const locationKey = location.toLowerCase();
      if (locations[locationKey]) {
        handleZoom(locations[locationKey], 8);
        setSearch(location);
        filterDisasters(location);
      }
    },
    [handleZoom, filterDisasters]
  );

  const fetchAllDisasterData = async () => {
    try {
      setLoading(true);
      const errors = [];

      const [
        weatherData,
        earthquakeData,
        landslideData,
        tsunamiData,
        airQualityData,
      ] = await Promise.all([
        // ...existing fetch calls...
        fetchOpenWeatherData(locations).catch((err) => {
          errors.push(["Weather", err]);
          return [];
        }),
        fetchEarthquakeData().catch((err) => {
          errors.push(["Earthquake", err]);
          return [];
        }),
        fetchLandslideData().catch((err) => {
          errors.push(["Landslide", err]);
          return [];
        }),
        fetchTsunamiData().catch((err) => {
          errors.push(["Tsunami", err]);
          return [];
        }),
        fetchAirQualityData(locations).catch((err) => {
          errors.push(["Air Quality", err]);
          return [];
        }),
      ]);

      const allDisasters = [
        ...weatherData,
        ...earthquakeData,
        ...landslideData,
        ...tsunamiData,
        ...airQualityData,
      ]
        .filter(Boolean)
        .map((disaster) => ({
          ...disaster,
          id: `${disaster.type}-${disaster.title}-${disaster.date}`, // Ensure each disaster has a unique ID
        }));

      // Log high severity disasters for debugging
      allDisasters.forEach((disaster) => {
        if (disaster.severity === "high") {
          console.log("High severity disaster detected:", {
            id: disaster.id,
            title: disaster.title,
            type: disaster.type,
            severity: disaster.severity,
          });
        }
      });

      setMapDisasters(allDisasters);
      setDisasters(allDisasters);
      setFilteredDisasters(allDisasters);
    } catch (error) {
      console.error("Error fetching disaster data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Single useEffect for data fetching
  useEffect(() => {
    fetchAllDisasterData();
    const interval = setInterval(fetchAllDisasterData, 300000);

    return () => {
      clearInterval(interval);
      setLoading(false);
      setDisasters([]);
      setFilteredDisasters([]);
    };
  }, []); // Empty dependency array

  useEffect(() => {
    filterDisasters(search);
  }, [search, filterDisasters]);

  useEffect(() => {
    setFilteredDisasters(disasters);
  }, [disasters]);

  // Geolocation function
  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationPermission('not-supported');
      console.log('Geolocation is not supported by this browser.');
      return;
    }

    setLocationPermission('requesting');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userCoords = [latitude, longitude];
        setUserLocation(userCoords);
        setLocationPermission('granted');

        // Automatically zoom to user location
        handleZoom(userCoords, 10);

        console.log('User location detected:', userCoords);
      },
      (error) => {
        setLocationPermission('denied');
        console.error('Error getting user location:', error);

        // Fallback to default India center
        setUserLocation(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, [handleZoom]);

  // Request user location on component mount
  useEffect(() => {
    requestUserLocation();
  }, [requestUserLocation]);

  const { darkMode } = useTheme();
  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <Header transparent={true} />

      {/* Main Content */}
      <main className="relative">
        {/* Location Permission Notification */}
        {locationPermission === 'requesting' && (
          <div className="absolute top-4 right-4 z-[1001] animate-fade-in-down">
            <div className={`${darkMode ? "bg-blue-900/90 border-blue-700" : "bg-blue-100/90 border-blue-300"} backdrop-blur-sm border rounded-lg p-4 shadow-lg max-w-sm`}>
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-blue-100" : "text-blue-900"}`}>
                    <TranslatableText>Requesting Location Access</TranslatableText>
                  </p>
                  <p className={`text-xs ${darkMode ? "text-blue-200" : "text-blue-700"}`}>
                    <TranslatableText>Please allow location access to show disasters near you</TranslatableText>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {locationPermission === 'denied' && (
          <div className="absolute top-4 right-4 z-[1001] animate-fade-in-down">
            <div className={`${darkMode ? "bg-yellow-900/90 border-yellow-700" : "bg-yellow-100/90 border-yellow-300"} backdrop-blur-sm border rounded-lg p-4 shadow-lg max-w-sm`}>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${darkMode ? "text-yellow-100" : "text-yellow-900"}`}>
                    <TranslatableText>Location Access Denied</TranslatableText>
                  </p>
                  <p className={`text-xs ${darkMode ? "text-yellow-200" : "text-yellow-700"} mb-2`}>
                    <TranslatableText>Enable location access in your browser settings for personalized disaster alerts</TranslatableText>
                  </p>
                  <button
                    onClick={requestUserLocation}
                    className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded transition-colors duration-200"
                  >
                    <TranslatableText>Try Again</TranslatableText>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="absolute top-20 left-4 z-[1000] w-80 animate-fade-in-down">
          <div className="relative transform transition-all duration-300 hover:scale-105">
            <input
              type="text"
              placeholder="Search location..."
              value={search}
              className={`w-full pl-10 pr-10 py-3 rounded-lg border ${
                darkMode
                  ? "bg-gray-800/90 backdrop-blur-sm border-gray-600 text-white placeholder-gray-400"
                  : "bg-white/90 backdrop-blur-sm border-gray-300 text-black placeholder-gray-500"
              } focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg transition-all duration-300 focus:shadow-xl focus:scale-105`}
              onChange={(e) => {
                setSearch(e.target.value);
                filterDisasters(e.target.value);
              }}
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400 transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  filterDisasters("");
                }}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-all duration-300 hover:scale-110"
              >
                <svg
                  className="w-4 h-4"
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
            )}
          </div>
          <LocationSuggestions
            searchTerm={search}
            onSelect={handleLocationSelect}
          />
        </div>

        {/* Full Screen Map Container */}
        <div className="h-screen w-full relative overflow-hidden">
          <MapContainer
            center={userLocation || defaultCenter}
            zoom={userLocation ? 10 : 5}
            minZoom={2}
            maxZoom={18}
            scrollWheelZoom={true}
            className="h-full w-full"
            boundsOptions={{
              padding: [50, 50],
              animate: true,
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="map-tiles"
              noWrap={false}
              opacity={1}
            />

            {Object.entries(
              mapDisasters.reduce((grouped, disaster) => {
                const key = disaster.coordinates.join(",");
                if (!grouped[key]) {
                  grouped[key] = [];
                }
                grouped[key].push(disaster);
                return grouped;
              }, {})
            ).map(([coordKey, disasterGroup]) => {
              const [lat, lon] = coordKey.split(",").map(Number);
              const maxSeverity = disasterGroup.reduce(
                (max, d) =>
                  ["high", "moderate", "low"].indexOf(d.severity) <
                  ["high", "moderate", "low"].indexOf(max)
                    ? d.severity
                    : max,
                "low"
              );

              const mainDisaster = disasterGroup[0];

              return (
                <Polygon
                  key={coordKey}
                  positions={createCircleCoords([lat, lon], 15)}
                  pathOptions={{
                    ...severityColors[maxSeverity],
                    fillOpacity: 0.2,
                    smoothFactor: 2,
                    weight: 1.5,
                    noClip: true,
                    interactive: true,
                    bubblingMouseEvents: false,
                  }}
                  eventHandlers={{
                    mouseover: (e) => {
                      const layer = e.target;
                      layer.setStyle({
                        fillOpacity: 0.4,
                      });

                      // Removed unused getAllWarnings function





                          // Get comprehensive warning information
                          const warningInfo = getComprehensiveWeatherWarning(mainDisaster);
                          const warningColorMap = {
                            'red': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', dot: 'bg-red-500' },
                            'orange': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', dot: 'bg-orange-500' },
                            'yellow': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', dot: 'bg-yellow-500' },
                            'blue': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', dot: 'bg-blue-500' },
                            'purple': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', dot: 'bg-purple-500' },
                            'gray': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', dot: 'bg-gray-500' },
                            'brown': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', dot: 'bg-amber-600' }
                          };
                          const colorScheme = warningColorMap[warningInfo.color] || warningColorMap['blue'];

                          const tooltipContent = `
                            <div class="bg-white backdrop-blur-xl border border-gray-300 rounded-2xl shadow-2xl p-4 min-w-[300px] max-w-[380px]">
                              <!-- Enhanced Header with Warning Icon -->
                              <div class="flex items-center gap-3 mb-3">
                                <div class="w-12 h-12 ${colorScheme.bg} rounded-full flex items-center justify-center border ${colorScheme.border} shadow-lg">
                                  <span class="text-2xl">${warningInfo.icon}</span>
                                </div>
                                <div class="flex-1">
                                  <h3 class="font-bold text-gray-900 text-sm leading-tight mb-1">
                                    ${warningInfo.title}
                                  </h3>
                                  <div class="flex items-center gap-2">
                                    <span class="px-2 py-0.5 rounded-full text-xs font-bold ${colorScheme.bg} ${colorScheme.text} border ${colorScheme.border}">
                                      ${warningInfo.severity.toUpperCase()} ALERT
                                    </span>
                                    <span class="text-xs text-gray-600">
                                      ${disasterGroup.length} Active
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <!-- Prominent Warning Display -->
                              <div class="bg-gradient-to-r ${colorScheme.bg} rounded-xl p-4 border ${colorScheme.border} mb-3 shadow-sm">
                                <div class="flex items-center gap-2 mb-2">
                                  <span class="w-2 h-2 ${colorScheme.dot} rounded-full animate-pulse"></span>
                                  <p class="font-bold ${colorScheme.text} text-sm">ACTIVE WARNINGS</p>
                                </div>
                                <div class="space-y-1.5 max-h-32 overflow-y-auto">
                                  ${warningInfo.warnings.map(warning => `
                                    <div class="flex items-start gap-2">
                                      <span class="text-lg mt-0.5">${warning.includes('EMERGENCY') || warning.includes('EXTREME') ? '🚨' : warning.includes('WARNING') || warning.includes('ALERT') ? '⚠️' : warning.includes('FLOOD') || warning.includes('RAINFALL') ? '🌊' : warning.includes('HEAT') || warning.includes('TEMPERATURE') ? '🔥' : warning.includes('COLD') || warning.includes('FROST') ? '❄️' : warning.includes('WIND') ? '💨' : '⚡'}</span>
                                      <span class="text-sm ${colorScheme.text} font-medium leading-relaxed">${warning.replace(/^[🚨⚠️🌊🔥❄️💨⚡🌡️💧🏠🚗👁️📊🌀🌩️🌪️🌫️🧊\s]*/, '').trim()}</span>
                                    </div>
                                  `).join('')}
                                </div>
                              </div>

                              <!-- Emergency Status -->
                              <div class="flex items-center justify-between pt-2 border-t border-gray-200">
                                <div class="flex items-center gap-2">
                                  <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                  <span class="text-xs font-medium text-gray-700">LIVE MONITORING</span>
                                </div>
                                <div class="text-right">
                                  <p class="text-xs text-gray-500">Click for emergency details</p>
                                  <p class="text-xs font-medium ${colorScheme.text}">${warningInfo.description}</p>
                                </div>
                              </div>
                            </div>
                          `;

                          layer
                            .bindTooltip(tooltipContent, {
                              permanent: false,
                              direction: "top",
                              className: "modern-disaster-tooltip",
                              offset: [0, -15],
                              opacity: 1,
                              interactive: false,
                            })
                            .openTooltip();
                        },
                        mouseout: (e) => {
                          const layer = e.target;
                          layer.setStyle({
                            fillOpacity: 0.2,
                          });
                          layer.unbindTooltip();
                        },
                        click: (e) => {
                          const layer = e.target;
                          const bounds = layer.getBounds();
                          const center = bounds.getCenter();
                          if (center) {
                            handleZoom([center.lat, center.lng], 10);
                          }
                          // Show detailed popup in bottom left
                          setSelectedDisasterGroup(disasterGroup);
                          setShowDetailedPopup(true);
                        },
                      }}
                    >

                    </Polygon>
                  );                })}                
                <Legend />
                <MapController location={location} />
              </MapContainer>

              {/* Enhanced Bottom Left Detailed Popup */}
              {showDetailedPopup && selectedDisasterGroup && (
                <div className="absolute bottom-4 left-4 z-[1000] w-[480px] max-h-[85vh] overflow-y-auto animate-fade-in-up">
                  <div className="bg-white backdrop-blur-xl border border-gray-300 rounded-2xl shadow-2xl ring-1 ring-gray-200 overflow-hidden">
                    {(() => {
                      const mainWarningInfo = getComprehensiveWeatherWarning(selectedDisasterGroup[0]);
                      const warningColorMap = {
                        'red': { bg: 'bg-red-50', headerBg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', dot: 'bg-red-500', icon: 'bg-red-200' },
                        'orange': { bg: 'bg-orange-50', headerBg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', dot: 'bg-orange-500', icon: 'bg-orange-200' },
                        'yellow': { bg: 'bg-yellow-50', headerBg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', dot: 'bg-yellow-500', icon: 'bg-yellow-200' },
                        'blue': { bg: 'bg-blue-50', headerBg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', dot: 'bg-blue-500', icon: 'bg-blue-200' },
                        'purple': { bg: 'bg-purple-50', headerBg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300', dot: 'bg-purple-500', icon: 'bg-purple-200' },
                        'gray': { bg: 'bg-gray-50', headerBg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', dot: 'bg-gray-500', icon: 'bg-gray-200' },
                        'brown': { bg: 'bg-amber-50', headerBg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', dot: 'bg-amber-600', icon: 'bg-amber-200' }
                      };
                      const colorScheme = warningColorMap[mainWarningInfo.color] || warningColorMap['blue'];

                      return (
                        <>
                          {/* Enhanced Header with Warning Colors */}
                          <div className={`bg-gradient-to-r ${colorScheme.headerBg} to-white p-5 border-b ${colorScheme.border}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 ${colorScheme.icon} rounded-2xl flex items-center justify-center border ${colorScheme.border} shadow-lg`}>
                                  <span className="text-3xl">{mainWarningInfo.icon}</span>
                                </div>
                                <div>
                                  <h3 className="font-bold text-xl text-gray-900 mb-1">
                                    {mainWarningInfo.title}
                                  </h3>
                                  <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${colorScheme.bg} ${colorScheme.text} border ${colorScheme.border}`}>
                                      {mainWarningInfo.severity.toUpperCase()} ALERT
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      {selectedDisasterGroup.length} Active Alert{selectedDisasterGroup.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => setShowDetailedPopup(false)}
                                className="w-10 h-10 bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors rounded-full flex items-center justify-center shadow-md border border-gray-300"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>

                            {/* Critical Warning Banner */}
                            {mainWarningInfo.severity === 'high' && (
                              <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-red-600 text-lg">🚨</span>
                                  <p className="font-bold text-red-800 text-sm">CRITICAL WEATHER EMERGENCY</p>
                                </div>
                                <p className="text-red-700 text-xs mt-1">Immediate action required - Follow emergency protocols</p>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 ${colorScheme.dot} rounded-full animate-pulse`}></span>
                                <span className="font-medium text-gray-700">LIVE MONITORING</span>
                              </div>
                              <div className="flex items-center text-gray-500">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Updated: {new Date().toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}

                    {/* Enhanced Content Section */}
                    <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {selectedDisasterGroup.map((disaster, index) => {
                        const warningInfo = getComprehensiveWeatherWarning(disaster);
                        const warningColorMap = {
                          'red': { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-300', dot: 'bg-red-500', icon: 'bg-red-100', button: 'bg-red-600 hover:bg-red-700' },
                          'orange': { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-300', dot: 'bg-orange-500', icon: 'bg-orange-100', button: 'bg-orange-600 hover:bg-orange-700' },
                          'yellow': { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-300', dot: 'bg-yellow-500', icon: 'bg-yellow-100', button: 'bg-yellow-600 hover:bg-yellow-700' },
                          'blue': { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300', dot: 'bg-blue-500', icon: 'bg-blue-100', button: 'bg-blue-600 hover:bg-blue-700' },
                          'purple': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300', dot: 'bg-purple-500', icon: 'bg-purple-100', button: 'bg-purple-600 hover:bg-purple-700' },
                          'gray': { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-300', dot: 'bg-gray-500', icon: 'bg-gray-100', button: 'bg-gray-600 hover:bg-gray-700' },
                          'brown': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300', dot: 'bg-amber-600', icon: 'bg-amber-100', button: 'bg-amber-600 hover:bg-amber-700' }
                        };
                        const colorScheme = warningColorMap[warningInfo.color] || warningColorMap['blue'];

                        return (
                          <div
                            key={disaster.id || index}
                            className={`${colorScheme.bg} rounded-2xl p-5 border ${colorScheme.border} shadow-lg`}
                          >
                            {/* Enhanced Disaster Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 ${colorScheme.icon} rounded-xl flex items-center justify-center border ${colorScheme.border} shadow-md`}>
                                  <span className="text-2xl">{warningInfo.icon}</span>
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900 text-lg mb-1">
                                    <TranslatableText>{warningInfo.title}</TranslatableText>
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 ${colorScheme.dot} rounded-full animate-pulse`}></span>
                                    <span className="text-sm text-gray-600">{warningInfo.description}</span>
                                  </div>
                                </div>
                              </div>
                              <span className={`px-4 py-2 rounded-full text-sm font-bold ${colorScheme.bg} ${colorScheme.text} border ${colorScheme.border} shadow-sm`}>
                                <TranslatableText>{warningInfo.severity.toUpperCase()}</TranslatableText>
                              </span>
                            </div>

                            {/* Prominent Warning List */}
                            {warningInfo.warnings.length > 0 && (
                              <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-lg">🚨</span>
                                  <h5 className="font-bold text-gray-900 text-sm">ACTIVE WARNINGS</h5>
                                </div>
                                <div className="space-y-2">
                                  {warningInfo.warnings.map((warning, wIndex) => (
                                    <div key={wIndex} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                                      <span className="text-lg mt-0.5">
                                        {warning.includes('EMERGENCY') || warning.includes('EXTREME') ? '🚨' :
                                         warning.includes('WARNING') || warning.includes('ALERT') ? '⚠️' :
                                         warning.includes('FLOOD') || warning.includes('RAINFALL') ? '🌊' :
                                         warning.includes('HEAT') || warning.includes('TEMPERATURE') ? '🔥' :
                                         warning.includes('COLD') || warning.includes('FROST') ? '❄️' :
                                         warning.includes('WIND') ? '💨' : '⚡'}
                                      </span>
                                      <span className="text-sm text-gray-800 font-medium leading-relaxed">
                                        <TranslatableText>
                                          {warning.replace(/^[🚨⚠️🌊🔥❄️💨⚡🌡️💧🏠🚗👁️📊🌀🌩️🌪️🌫️🧊\s]*/, '').trim()}
                                        </TranslatableText>
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Forecast Details Section */}
                            {warningInfo.forecast && warningInfo.forecast.length > 0 && (
                              <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-lg">📅</span>
                                  <h6 className="font-bold text-blue-900 text-sm">48-HOUR FORECAST</h6>
                                </div>
                                <div className="space-y-3 max-h-32 overflow-y-auto">
                                  {warningInfo.forecast.slice(0, 6).map((forecast, fIndex) => (
                                    <div key={fIndex} className="bg-white rounded-lg p-3 border border-blue-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-blue-900 text-xs">{forecast.time}</span>
                                        <div className="flex items-center gap-2">
                                          {forecast.rainfall > 10 && <span className="text-blue-600">🌧️</span>}
                                          {forecast.temperature > 35 && <span className="text-red-600">🔥</span>}
                                          {forecast.windSpeed > 40 && <span className="text-gray-600">💨</span>}
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="text-center">
                                          <p className="text-gray-500">Temp</p>
                                          <p className="font-medium text-gray-800">{forecast.temperature.toFixed(1)}°C</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-gray-500">Rain</p>
                                          <p className="font-medium text-blue-600">{forecast.rainfall.toFixed(1)}mm/h</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-gray-500">Wind</p>
                                          <p className="font-medium text-gray-600">{forecast.windSpeed.toFixed(1)}km/h</p>
                                        </div>
                                      </div>
                                      <p className="text-xs text-gray-600 mt-2 italic">
                                        <TranslatableText>{forecast.condition}</TranslatableText>
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Disaster Details */}
                            <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm">📋</span>
                                <h6 className="font-semibold text-gray-900 text-sm">DETAILED INFORMATION</h6>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">
                                <TranslatableText>{disaster.details}</TranslatableText>
                              </p>
                            </div>

                            {/* Enhanced Action Buttons */}
                            <div className="grid grid-cols-2 gap-4">
                              <a
                                href={`/mitigation?type=${encodeURIComponent(disaster.type)}`}
                                className={`${colorScheme.button} text-white py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105`}
                              >
                                <span className="text-lg">🛡️</span>
                                <div className="text-center">
                                  <p><TranslatableText>Safety Guide</TranslatableText></p>
                                  <p className="text-xs opacity-90"><TranslatableText>View Precautions</TranslatableText></p>
                                </div>
                              </a>
                              <button
                                onClick={() => window.open('tel:112', '_self')}
                                className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse"
                              >
                                <span className="text-lg">🚨</span>
                                <div className="text-center">
                                  <p><TranslatableText>Emergency Call</TranslatableText></p>
                                  <p className="text-xs opacity-90"><TranslatableText>Call 112 Now</TranslatableText></p>
                                </div>
                              </button>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                              <time className="text-xs text-gray-500">
                                {new Date(disaster.date).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </time>
                              <a
                                href={disaster.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1"
                              >
                                <TranslatableText>Full Report</TranslatableText>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Updates Container Below Map */}
            <div className={`${darkMode ? "bg-gray-900" : "bg-gray-50"} py-12 animate-fade-in-up`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-12 animate-fade-in">
              <h2 className={`text-4xl font-bold ${darkMode ? "text-white" : "text-gray-900"} mb-4`}>
                <TranslatableText>Latest Disaster Updates</TranslatableText>
              </h2>
              <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"} max-w-3xl mx-auto`}>
                <TranslatableText>
                  Stay informed with real-time disaster reports and emergency alerts across India
                </TranslatableText>
              </p>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-8 animate-slide-in-left">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search disasters..."
                    value={search}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      darkMode
                        ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-black placeholder-gray-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 focus:scale-105`}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      filterDisasters(e.target.value);
                    }}
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  <TranslatableText>
                    Showing {filteredDisasters.length} of {disasters.length} reports
                  </TranslatableText>
                </div>
              </div>
            </div>

            {/* Disaster Updates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className={`${
                      darkMode ? "bg-gray-800" : "bg-white"
                    } rounded-xl p-6 shadow-lg animate-pulse`}
                  >
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                ))
              ) : filteredDisasters.length > 0 ? (
                filteredDisasters.map((disaster, index) => {
                  const typeColors =
                    disasterTypeColors[disaster.type] ||
                    disasterTypeColors.default;
                  return (
                    <div
                      key={`${disaster.id}-${index}`}
                      className={`${
                        darkMode ? "bg-gray-800" : "bg-white"
                      } rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up border-l-4 ${
                        disaster.severity === "high"
                          ? "border-red-500"
                          : disaster.severity === "moderate"
                          ? "border-yellow-500"
                          : "border-green-500"
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-900"} mb-2`}>
                            <TranslatableText>{disaster.title}</TranslatableText>
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors.bg} ${typeColors.text}`}>
                              <TranslatableText>{disaster.type}</TranslatableText>
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                disaster.severity === "high"
                                  ? "bg-red-100 text-red-800"
                                  : disaster.severity === "moderate"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              <TranslatableText>{disaster.severity}</TranslatableText>
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <img
                            src={`https://images.unsplash.com/photo-${
                              disaster.type === "Earthquake" ? "1547036967-23d11aacaee0" :
                              disaster.type === "Weather Warning" ? "1504608524841-42fe6f032b4b" :
                              "1558618666-fcd25c85cd64"
                            }?w=80&h=80&fit=crop&crop=center`}
                            alt={disaster.type}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        </div>
                      </div>

                      <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} mb-4 line-clamp-3`}>
                        <TranslatableText>{disaster.details}</TranslatableText>
                      </p>

                      <div className="flex items-center justify-between">
                        <time className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {new Date(disaster.date).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                        <a
                          href={disaster.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1 group transition-all duration-300"
                        >
                          <TranslatableText>Read More</TranslatableText>
                          <svg
                            className="w-4 h-4 transition-transform group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>                  );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className={`${darkMode ? "text-gray-400" : "text-gray-500"} text-lg`}>
                    {search.trim() ? (
                      <TranslatableText>No disasters found for this search</TranslatableText>
                    ) : (
                      <TranslatableText>No recent disaster reports found</TranslatableText>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Home;
