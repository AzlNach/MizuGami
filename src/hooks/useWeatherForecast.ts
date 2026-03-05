"use client";


import { useState, useEffect } from "react";

// Interface for forecast data
export interface ForecastDay {
  dt: number;
  temp: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  feels_like: {
    day: number;
    night: number;
    eve: number;
    morn: number;
  };
  pressure: number;
  humidity: number;
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  speed: number;
  deg: number;
  gust: number;
  clouds: number;
  pop: number;
  rain?: number;
}

export interface WeatherForecast {
  city: {
    id: number;
    name: string;
    coord: {
      lon: number;
      lat: number;
    };
    country: string;
    population: number;
    timezone: number;
  };
  list: ForecastDay[];
}

interface UseWeatherForecastResult {
  forecast: WeatherForecast | null;
  loading: boolean;
  error: string | null;
  refreshForecast: (lat?: number, lon?: number) => void;
  currentLocation: string | null;
  /** Actual coordinates used for the last fetch (from user GPS or manual input) */
  actualCoords: { lat: number; lon: number } | null;
}

// Reverse-geocode using OpenStreetMap Nominatim (free, no key required).
// Returns a human-readable locality name (kecamatan / kelurahan level when available).
// This fixes the issue where OWM snaps coordinates to a wrong nearest city
// (e.g. Bojongsoang -> Pameungpeuk).
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=14&addressdetails=1&accept-language=id`;
    const res = await fetch(url, { headers: { "Accept-Language": "id" } });
    if (!res.ok) throw new Error("Nominatim error");
    const data = await res.json();
    const addr = (data.address ?? {}) as Record<string, string>;
    // Pick the most granular available label
    const locality =
      addr.village ||
      addr.suburb ||
      addr.neighbourhood ||
      addr.quarter ||
      addr.hamlet ||
      addr.city_district ||
      addr.county ||
      addr.municipality ||
      addr.town ||
      addr.city ||
      (data.display_name as string | undefined)?.split(",")[0] ||
      "Lokasi Saya";
    return locality;
  } catch {
    return "Lokasi Saya";
  }
}

export function useWeatherForecast(): UseWeatherForecastResult {
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [actualCoords, setActualCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Fetch forecast data from OpenWeather API
  const fetchForecast = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError(null);
      // Save the real coordinates immediately so the map updates even before fetch completes
      setActualCoords({ lat, lon });

      // Get API key from server-side env via internal API route.
      // This avoids client-side env substitution issues in dev/HMR on Windows.
      const keyRes = await fetch("/api/validate-api-key", { cache: "no-store" });
      const keyJson = (await keyRes.json()) as {
        keys?: { openWeather?: boolean };
      };

      if (!keyRes.ok || !keyJson?.keys?.openWeather) {
        throw new Error(
          "OpenWeather API key tidak ditemukan. Pastikan ada NEXT_PUBLIC_OPENWEATHER_API_KEY di .env.local lalu restart dev server."
        );
      }

      // Run weather fetch and reverse geocoding in parallel for speed
      const [response, locationName] = await Promise.all([
        fetch(`/api/weather-forecast?lat=${lat}&lon=${lon}`, { cache: "no-store" }),
        reverseGeocode(lat, lon),
      ]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: WeatherForecast = await response.json();

      // Override city.name with the real reverse-geocoded locality so the UI
      // shows the actual place the user is in (e.g. "Bojongsoang"), not the
      // nearest city in OpenWeather's database (e.g. "Pameungpeuk").
      data.city.name = locationName;
      // Keep coord as the actual user coords, not OWM snapped coords
      data.city.coord = { lat, lon };

      setForecast(data);
      setCurrentLocation(locationName);
      setError(null);
    } catch (err) {
      console.error("Error fetching weather forecast:", err);
      setError(err instanceof Error ? err.message : "Gagal memuat data forecast");
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  // Get user's geolocation
  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchForecast(latitude, longitude);
        },
        (err) => {
          console.error("Geolocation error:", err);
          // Default location (Bandung, Indonesia) if geolocation fails
          const defaultLat = -6.9175;
          const defaultLon = 107.6191;
          fetchForecast(defaultLat, defaultLon);
          setError("Tidak dapat mengakses lokasi. Menggunakan Bandung sebagai default.");
        }
      );
    } else {
      const defaultLat = -6.9175;
      const defaultLon = 107.6191;
      fetchForecast(defaultLat, defaultLon);
      setError("Geolocation tidak didukung. Menggunakan Bandung sebagai default.");
    }
  };

  // Refresh forecast with optional custom coordinates
  const refreshForecast = (lat?: number, lon?: number) => {
    if (lat !== undefined && lon !== undefined) {
      fetchForecast(lat, lon);
    } else {
      getUserLocation();
    }
  };

  // Initial load
  useEffect(() => {
    getUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    forecast,
    loading,
    error,
    refreshForecast,
    currentLocation,
    actualCoords,
  };
}
