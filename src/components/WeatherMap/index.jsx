import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// import { Search } from 'lucide-react';
// import { Input } from "../ui/Input";
// import { Button } from "../ui/Button";

import sunnyIcon from '../ui/placeholders/weather-sunny.png';
import rainIcon from '../ui/placeholders/weather-rain.png';
import snowIcon from '../ui/placeholders/weather-snow.png';
import partlySunnyIcon from '../ui/placeholders/weather-partly-sunny.png';
import windyIcon from '../ui/placeholders/weather-windy.png';
import partlyRainyIcon from '../ui/placeholders/weather-partly-rainy.png';
import partlySnowIcon from '../ui/placeholders/weather-partly-snow.png';
import cloudyIcon from '../ui/placeholders/weather-cloudy.png';

const weatherIcons = {
  sunny: new L.Icon({iconUrl: sunnyIcon, iconSize: [96, 96]}),
  rain: new L.Icon({iconUrl: rainIcon, iconSize: [96, 96]}),
  snow: new L.Icon({iconUrl: snowIcon, iconSize: [96, 96]}),
  partlySunny: new L.Icon({iconUrl: partlySunnyIcon, iconSize: [96, 96]}),
  windy: new L.Icon({iconUrl: windyIcon, iconSize: [96, 96]}),
  partlyRainy: new L.Icon({iconUrl: partlyRainyIcon, iconSize: [96, 96]}),
  partlySnow: new L.Icon({iconUrl: partlySnowIcon, iconSize: [96, 96]}),
  cloudy: new L.Icon({iconUrl: cloudyIcon, iconSize: [96, 96]}),
};

const SPAIN_CENTER = { lat: 40.4637, lon: -3.7492 };
const SPAIN_CITIES = [
    { name: "Madrid", lat: 40.4168, lon: -3.7038 },
    { name: "Barcelona", lat: 41.3851, lon: 2.1734 },
    { name: "Valencia", lat: 39.4699, lon: -0.3763 },
    { name: "Sevilla", lat: 37.3891, lon: -5.9845 },
    { name: "Zaragoza", lat: 41.6488, lon: -0.8891 },
    { name: "Cáceres", lat: 39.47649, lon: -6.37224 },
    { name: "Murcia", lat: 37.9922, lon: -1.1307 },
    { name: "Palma", lat: 39.5696, lon: 2.6502 },
    { name: "Las Palmas", lat: 28.1235, lon: -15.4366 },
    { name: "Bilbao", lat: 43.2630, lon: -2.9350 },
    { name: "Alicante", lat: 38.3452, lon: -0.4815 },
    { name: "Córdoba", lat: 37.8882, lon: -4.7794 },
    { name: "Valladolid", lat: 41.6523, lon: -4.7245 },
    { name: "Vigo", lat: 42.2406, lon: -8.7207 },
    { name: "Gijón", lat: 43.5357, lon: -5.6615 },
    { name: "Girona", lat: 41.98311, lon: 2.82493 },
    { name: "Vitoria", lat: 42.8467, lon: -2.6716 },
    { name: "A Coruña", lat: 43.3713, lon: -8.3959 },
    { name: "Granada", lat: 37.1773, lon: -3.5986 },
    { name: "Ciudad Real", lat: 38.98626, lon: -3.92907 },
];

const WeatherMap = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [mapCenter] = useState([SPAIN_CENTER.lat, SPAIN_CENTER.lon]);
  const [zoom, setZoom] = useState(6);

  useEffect(() => {
    fetchWeatherDataForSpain();
  }, []);

  const fetchWeatherDataForSpain = async () => {
    try {
      const weatherPromises = SPAIN_CITIES.map(city => 
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`)
          .then(response => response.json())
      );

      const weatherResults = await Promise.all(weatherPromises);

      const newWeatherData = weatherResults.map((data, index) => ({
        id: index,
        lat: SPAIN_CITIES[index].lat,
        lon: SPAIN_CITIES[index].lon,
        location: SPAIN_CITIES[index].name,
        weather: interpretWeatherCode(data.current_weather.weathercode),
        temp: Math.round(data.current_weather.temperature),
      }));

      setWeatherData(newWeatherData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  const interpretWeatherCode = (code) => {
    if (code <= 1) return 'sunny';
    if (code <= 3) return 'partlySunny';
    if (code <= 48) return 'cloudy';
    if (code <= 67) return 'rain';
    if (code <= 77) return 'snow';
    if (code <= 82) return 'partlyRainy';
    if (code <= 86) return 'partlySnow';
    return 'windy';
  };

  const MapEvents = () => {
    const map = useMap();
    useEffect(() => {
      map.on('zoomend', () => {
        setZoom(map.getZoom());
      });
    }, [map]);
    return null;
  };

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Shitty Weather Map</h1>
      </div>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEvents />
        {weatherData.map((data) => (
          <Marker
            key={data.id}
            position={[data.lat, data.lon]}
            icon={weatherIcons[data.weather]}
          >
            <Popup>
              <strong>{data.location}</strong><br />
              Tiempo: {data.weather}<br />
              Temperatura: {data.temp}°C
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default WeatherMap;