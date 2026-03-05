"use client";

import { useSoilMoistureData } from "@/hooks/useSoilMoistureData";
import { useWeatherForecast } from "@/hooks/useWeatherForecast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { ref, query, orderByChild, limitToLast, onValue } from "firebase/database";
import { database } from "@/firebase/config";
import DashboardLayout from "@/components/DashboardLayout";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import WeatherForecastCard from "@/components/WeatherForecastCard";
import LocationSearch from "@/components/LocationSearch";
import InteractiveMap from "@/components/InteractiveMap";

// Interface for historical data
interface WeatherHistoryPoint {
  timestamp: number;
  weather: string;
  rainADC: number;
  airTemp: number;
  airHumidity: number;
}

// Format timestamp
const formatTimestamp = (timestamp: number, language: string) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  return date.toLocaleString(language === "id" ? "id-ID" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// Calculate time ago
const getTimeAgo = (timestamp: number, t: (key: string) => string) => {
  if (!timestamp) return "N/A";
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} ${t("time.daysAgo")}`;
  if (hours > 0) return `${hours} ${t("time.hoursAgo")}`;
  if (minutes > 0) return `${minutes} ${t("time.minutesAgo")}`;
  return `${seconds} ${t("time.secondsAgo")}`;
};

export default function WeatherPage() {
  const { data, loading, error } = useSoilMoistureData();
  const { t, language } = useLanguage();
  const {
    forecast,
    loading: forecastLoading,
    error: forecastError,
    refreshForecast,
    currentLocation,
    actualCoords,
  } = useWeatherForecast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherHistory, setWeatherHistory] = useState<WeatherHistoryPoint[]>([]);

  const handleLocationChange = (lat: number, lon: number) => {
    refreshForecast(lat, lon);
  };

  // Fetch weather history
  useEffect(() => {
    const historyRef = ref(database, "sensorData/history");
    const historyQuery = query(historyRef, orderByChild("timestamp"), limitToLast(10));

    const unsubscribe = onValue(historyQuery, (snapshot) => {
      if (snapshot.exists()) {
        const dataPoints: WeatherHistoryPoint[] = [];
        snapshot.forEach((child) => {
          const point = child.val();
          dataPoints.push({
            timestamp: point.timestamp || Date.now(),
            weather: point.weather || "Unknown",
            rainADC: point.rainADC || 0,
            airTemp: point.airTemp || 0,
            airHumidity: point.airHumidity || 0,
          });
        });
        dataPoints.sort((a, b) => b.timestamp - a.timestamp); // Latest first
        setWeatherHistory(dataPoints);
      }
    });

    return () => unsubscribe();
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#89986D]"></div>
          <p className="mt-4 text-gray-600 text-lg">{t("weather.loadingData")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md border-2 border-[#C5D89D]">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#89986D] text-white rounded-lg hover:bg-[#9CAB84] transition"
            >
              {t("common.reload")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isRaining = data.weather === "Hujan";

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="content-header">
        <div className="header-left">
          <h1>
            {isRaining ? "🌧️" : "☀️"} {t("sidebar.weather")}
          </h1>
          <p>{t("weather.subtitle")}</p>
        </div>
        <div className="header-right">
          <LanguageSwitcher />
          <div className="header-date">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>
              {currentTime.toLocaleTimeString(
                language === "id" ? "id-ID" : "en-US",
                { hour: "2-digit", minute: "2-digit", second: "2-digit" }
              )}
            </span>
          </div>
          <div className="header-date">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>
              {currentTime.toLocaleDateString(
                language === "id" ? "id-ID" : "en-US",
                { weekday: "short", day: "numeric", month: "short" }
              )}
            </span>
          </div>
          <div
            className={`status-indicator ${data.timestamp > 0 ? "active" : "inactive"}`}
          >
            <div className="status-dot"></div>
            <span>
              {data.timestamp > 0
                ? t("dashboard.status.live")
                : t("dashboard.status.offline")}
            </span>
          </div>
        </div>
      </div>

      {/* Main Weather Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Interactive Map — replaces the old weather icon card */}
        <div className="rounded-2xl shadow-xl overflow-hidden border-2 border-[#C5D89D]">
          <InteractiveMap
            center={actualCoords}
            onLocationPick={(lat, lon) => refreshForecast(lat, lon)}
            locationName={currentLocation || forecast?.city.name || "Memuat..."}
          />
        </div>

        {/* Weather Info & Stats */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-3xl mr-3">📊</span>
            {t("weather.detailInfo")}
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">{t("weather.temperature")}</span>
              <span className="text-xl font-bold text-gray-800">
                {data.airTemp.toFixed(1)}°C
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">{t("weather.humidity")}</span>
              <span className="text-xl font-bold text-gray-800">
                {data.airHumidity}%
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">
                {t("weather.weatherStatus")}
              </span>
              <span className="text-xl font-bold text-gray-800">{data.weather}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">{t("weather.rainSensor")}</span>
              <span className="text-xl font-bold text-gray-800">{data.rainADC}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">{t("weather.lastUpdate")}</span>
              <span className="text-sm font-semibold text-gray-800">
                {getTimeAgo(data.timestamp, t)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Forecast Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        {/* Section Header with Location Picker */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="text-3xl mr-3">📅</span>
            Prakiraan Cuaca 5 Hari
          </h2>
          <LocationSearch
            onSearch={handleLocationChange}
            currentLocation={
              currentLocation || forecast?.city.name || "Loading..."
            }
          />
        </div>

        {/* Forecast Cards */}
        {forecastLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-xl h-64 animate-pulse"
              ></div>
            ))}
          </div>
        ) : forecastError ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-gray-600 mb-4">{forecastError}</p>
            <button
              onClick={() => refreshForecast()}
              className="px-6 py-2 bg-[#89986D] text-white rounded-lg hover:bg-[#9CAB84] transition"
            >
              Coba Lagi
            </button>
          </div>
        ) : forecast && forecast.list.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {forecast.list.map((day, index) => (
              <WeatherForecastCard key={index} day={day} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Tidak ada data prakiraan cuaca tersedia
          </div>
        )}

        {/* Forecast Info Bar */}
        {forecast && (
          <div className="mt-6 p-4 bg-[#F6F0D7] rounded-xl border-2 border-[#C5D89D]">
            <p className="text-sm text-gray-700">
              📍 <strong>Lokasi:</strong> {forecast.city.name},{" "}
              {forecast.city.country}
              <span className="ml-4 text-gray-500">
                ({forecast.city.coord.lat.toFixed(4)},{" "}
                {forecast.city.coord.lon.toFixed(4)})
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Weather History */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="text-3xl mr-3">📜</span>
          Riwayat Cuaca (10 Terakhir)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Waktu
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Kondisi
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Suhu
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Kelembapan
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Sensor ADC
                </th>
              </tr>
            </thead>
            <tbody>
              {weatherHistory.length > 0 ? (
                weatherHistory.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatTimestamp(item.timestamp, language)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          item.weather === "Hujan"
                            ? "bg-[#9CAB84] text-white"
                            : "bg-[#F6F0D7] text-[#89986D]"
                        }`}
                      >
                        {item.weather === "Hujan" ? "🌧️" : "☀️"} {item.weather}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      {item.airTemp.toFixed(1)}°C
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      {item.airHumidity}%
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-mono text-gray-600">
                      {item.rainADC}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Tidak ada data riwayat tersedia
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sensor Info */}
      <div className="bg-gradient-to-r from-[#F6F0D7] to-[#C5D89D] rounded-2xl shadow-xl p-6 mb-8 border-2 border-[#9CAB84]">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-2xl mr-3">🔬</span>
          Tentang Sensor Hujan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Cara Kerja</h3>
            <p className="text-sm text-gray-600">
              Sensor hujan menggunakan prinsip resistansi. Ketika tetesan air
              jatuh pada permukaan sensor, resistansi menurun dan nilai ADC
              berubah. Sistem mendeteksi perubahan ini untuk menentukan kondisi
              cuaca.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Nilai ADC</h3>
            <p className="text-sm text-gray-600 mb-2">
              • <strong>4095</strong>: Tidak ada hujan (sensor kering)
            </p>
            <p className="text-sm text-gray-600 mb-2">
              • <strong>2000-4000</strong>: Gerimis atau awal hujan
            </p>
            <p className="text-sm text-gray-600">
              • <strong>&lt;2000</strong>: Hujan deras
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <p>🌧️ IoT Weather Monitoring System © 2025</p>
        <p className="text-xs mt-1">
          Powered by Rain Sensor + Firebase + Next.js
        </p>
      </div>
    </DashboardLayout>
  );
}
