import React, { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

const API_KEY = "80df7ef9d51c1d3f6322bb375bbb62b9";

const weatherIcons = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Drizzle: "🌦️",
  Thunderstorm: "⛈️",
  Snow: "❄️",
  Mist: "🌫️",
  Smoke: "💨",
  Haze: "🌫️",
  Dust: "🌪️",
  Fog: "🌫️",
  Sand: "🏜️",
  Ash: "🌋",
  Squall: "🌬️",
  Tornado: "🌪️",
};

const categories = [
  { key: "temp", label: "Temperature (°C)" },
  { key: "weather", label: "Weather" },
  { key: "humidity", label: "Humidity (%)" },
  { key: "wind_speed", label: "Wind Speed (m/s)" },
  { key: "pop", label: "Precipitation Probability (%)" },
];

function groupForecastByDay(list) {
  const days = {};
  list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!days[date]) days[date] = [];
    days[date].push(item);
  });
  return days;
}

export default function ForecastModal({ lat, lon, name, onClose }) {
  const { darkMode } = useTheme();
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchForecast() {
      setLoading(true);
      setError(null);
      try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch forecast");
        const data = await res.json();
        setForecast(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (lat && lon) fetchForecast();
  }, [lat, lon]);

  const grouped = forecast ? Object.entries(groupForecastByDay(forecast.list)).slice(0, 3) : [];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in font-sans">
      <div
        className={`relative w-full max-w-3xl mx-auto rounded-3xl shadow-2xl border-0 max-h-[92vh] flex flex-col ${
          darkMode ? "bg-gray-900" : "bg-white"
        } animate-slide-in-up p-0`}
        style={{ boxShadow: darkMode ? "0 8px 32px 0 rgba(0,0,0,0.7)" : "0 8px 32px 0 rgba(0,0,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full z-10 transition-colors shadow-lg text-2xl"
          style={{ fontSize: 28 }}
        >
          ×
        </button>
        <div className="p-8 overflow-y-auto max-h-[88vh] custom-scrollbar text-gray-900 dark:text-gray-100">
          <h2 className="text-4xl font-extrabold mb-8 text-blue-700 dark:text-blue-300 text-center drop-shadow-lg">
            3 Day Forecast
          </h2>
          {loading && <div className="p-8 text-center text-lg font-semibold">Loading forecast...</div>}
          {error && <div className="p-8 text-center text-red-600 dark:text-red-400">{error}</div>}
          {!loading && !error && forecast && (
            <div className="space-y-14">
              {grouped.map(([date, items], i) => (
                <div
                  key={date}
                  className={`rounded-2xl shadow-xl border-0 p-0 mb-8 ${
                    [
                      "bg-gradient-to-br from-blue-200/80 to-blue-400/40 dark:from-blue-900/80 dark:to-blue-800/60",
                      "bg-gradient-to-br from-green-200/80 to-green-400/40 dark:from-green-900/80 dark:to-green-800/60",
                      "bg-gradient-to-br from-yellow-100/80 to-yellow-300/40 dark:from-yellow-900/80 dark:to-yellow-800/60",
                    ][i % 3]
                  } border-l-8 ${[
                    "border-blue-400 dark:border-blue-700",
                    "border-green-400 dark:border-green-700",
                    "border-yellow-400 dark:border-yellow-700",
                  ][i % 3]}`}
                >
                  <div className="p-6">
                    <h3 className="text-2xl font-bold flex items-center gap-2 mb-4 text-gray-900 dark:text-gray-100 drop-shadow">
                      <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse"></span>
                      {new Date(date).toLocaleDateString("en-IN", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </h3>
                    {/* Sticky Header Row */}
                    <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 rounded-lg flex items-center py-2 border-b border-gray-300 dark:border-gray-700 mb-2 shadow-sm">
                      <div className="w-1/6 flex items-center gap-1 justify-center">
                        <svg className="w-5 h-5 text-black dark:text-gray-100 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="font-semibold text-black dark:text-gray-100">Time</span>
                      </div>
                      {categories.map((cat, idx) => (
                        <div key={cat.key} className="w-1/6 text-center font-semibold text-base text-gray-900 dark:text-gray-100">
                          {cat.label}
                        </div>
                      ))}
                    </div>
                    {/* Forecast Rows */}
                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          className={`flex w-full items-center py-3 px-2 rounded-lg transition-all duration-200 mb-3 ${
                            idx % 2 === 0
                              ? "bg-white/70 dark:bg-gray-800/70"
                              : "bg-blue-50/60 dark:bg-blue-900/60"
                          } hover:bg-blue-100/80 dark:hover:bg-blue-800/80`}
                          style={{ fontSize: 18 }}
                        >
                          <div className="w-1/6 text-black dark:text-gray-100 font-mono text-center font-bold text-lg">
                            {item.dt_txt.split(" ")[1].slice(0, 5)}
                          </div>
                          {/* Temperature */}
                          <div className="w-1/6 text-center">
                            <span className="inline-block px-3 py-1 rounded-lg bg-yellow-100 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100 font-bold text-lg shadow">
                              {item.main.temp}°C
                            </span>
                          </div>
                          {/* Weather */}
                          <div className="w-1/6 text-center flex items-center justify-center gap-2">
                            <span className="text-2xl">
                              {weatherIcons[item.weather[0].main] || "🌡️"}
                            </span>
                            <span className="capitalize font-medium text-base">
                              {item.weather[0].main}
                            </span>
                            <span className="text-xs text-gray-600 dark:text-gray-300">({item.weather[0].description})</span>
                          </div>
                          {/* Humidity */}
                          <div className="w-1/6 text-center">
                            <span className="inline-block px-3 py-1 rounded-lg bg-green-100 dark:bg-green-700 text-green-900 dark:text-green-100 font-semibold">
                              {item.main.humidity}%
                            </span>
                          </div>
                          {/* Wind Speed */}
                          <div className="w-1/6 text-center">
                            <span className="inline-block px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-700 text-purple-900 dark:text-purple-100 font-semibold">
                              {item.wind.speed} m/s
                            </span>
                          </div>
                          {/* Precipitation Probability */}
                          <div className="w-1/6 text-center">
                            <span className="inline-block px-3 py-1 rounded-lg bg-pink-100 dark:bg-pink-700 text-pink-900 dark:text-pink-100 font-semibold">
                              {Math.round((item.pop || 0) * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 