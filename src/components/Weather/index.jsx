import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search } from 'lucide-react';
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

// Import weather icons (assuming these imports are correct)
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

const DEFAULT_LOCATION = { lat: 41.3851, lon: 2.1734, name: 'Barcelona' };

const WeatherMap = () => {
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_LOCATION);
  const [weatherData, setWeatherData] = useState([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [mapCenter, setMapCenter] = useState([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon]);
  const [zoom, setZoom] = useState(10);

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    fetchWeatherData(currentLocation.lat, currentLocation.lon);
  }, [currentLocation]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            name: 'Current Location'
          };
          setCurrentLocation(newLocation);
          setMapCenter([newLocation.lat, newLocation.lon]);
        },
        (error) => {
          console.error("Error getting user location:", error);
          setCurrentLocation(DEFAULT_LOCATION);
          setMapCenter([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon]);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setCurrentLocation(DEFAULT_LOCATION);
      setMapCenter([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon]);
    }
  };

  const fetchWeatherData = async (lat, lon) => {
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,weathercode`);
      const data = await response.json();
      
      if (data.current_weather) {
        const weather = interpretWeatherCode(data.current_weather.weathercode);
        const newWeatherData = {
          id: 1,
          lat,
          lon,
          location: currentLocation.name,
          weather,
          temp: Math.round(data.current_weather.temperature),
        };
        setWeatherData([newWeatherData]);
      }
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

  const handleSearch = async (e) => {
    e.preventDefault();
    // In a real application, you would use a geocoding service here
    // For this example, we'll just add a new location with slightly offset coordinates
    const newLocation = {
      lat: currentLocation.lat + Math.random() * 0.2 - 0.1,
      lon: currentLocation.lon + Math.random() * 0.2 - 0.1,
      name: searchLocation,
    };
    console.log('newLocation :>>>>>>>> ', newLocation);
    setCurrentLocation(newLocation);
    setMapCenter([newLocation.lat, newLocation.lon]);
    setSearchLocation('');
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
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="Search location..."
            className="flex-grow"
          />
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
        </form>
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
              Weather: {data.weather}<br />
              Temperature: {data.temp}°C
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default WeatherMap;