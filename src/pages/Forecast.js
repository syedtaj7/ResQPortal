import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const API_KEY = "80df7ef9d51c1d3f6322bb375bbb62b9"; // OpenWeather API key from project

const categories = [
  { key: 'temp', label: 'Temperature (°C)' },
  { key: 'weather', label: 'Weather' },
  { key: 'humidity', label: 'Humidity (%)' },
  { key: 'wind_speed', label: 'Wind Speed (m/s)' },
  { key: 'pop', label: 'Precipitation Probability (%)' },
];

function groupForecastByDay(list) {
  const days = {};
  list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!days[date]) days[date] = [];
    days[date].push(item);
  });
  return days;
}

export default function Forecast() {
  const [searchParams] = useSearchParams();
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const name = searchParams.get('name');

  useEffect(() => {
    async function fetchForecast() {
      setLoading(true);
      setError(null);
      try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch forecast');
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

  if (loading) return <div className="p-8 text-center">Loading forecast...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!forecast) return null;

  // Group by day
  const grouped = Object.entries(groupForecastByDay(forecast.list)).slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">3 Day Forecast for {name}</h2>
      {grouped.map(([date, items]) => (
        <div key={date} className="mb-6 p-4 rounded-lg shadow bg-white">
          <h3 className="text-lg font-semibold mb-2">{date}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(cat => (
              <div key={cat.key} className="">
                <div className="font-medium text-gray-700 mb-1">{cat.label}</div>
                <div className="space-y-1">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{item.dt_txt.split(' ')[1].slice(0,5)}</span>
                      {cat.key === 'temp' && <span>{item.main.temp}°C</span>}
                      {cat.key === 'weather' && <span>{item.weather[0].main} ({item.weather[0].description})</span>}
                      {cat.key === 'humidity' && <span>{item.main.humidity}%</span>}
                      {cat.key === 'wind_speed' && <span>{item.wind.speed} m/s</span>}
                      {cat.key === 'pop' && <span>{Math.round((item.pop || 0) * 100)}%</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 