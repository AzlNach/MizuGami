"use client";

import { useState } from "react";

interface LocationSearchProps {
  onSearch: (lat: number, lon: number, locationName: string) => void;
  currentLocation: string;
}

// Indonesian cities with coordinates
const INDONESIAN_CITIES = [
  { name: "Jakarta", lat: -6.2088, lon: 106.8456 },
  { name: "Surabaya", lat: -7.2575, lon: 112.7521 },
  { name: "Bandung", lat: -6.9175, lon: 107.6191 },
  { name: "Medan", lat: 3.5952, lon: 98.6722 },
  { name: "Semarang", lat: -6.9667, lon: 110.4167 },
  { name: "Makassar", lat: -5.1477, lon: 119.4327 },
  { name: "Palembang", lat: -2.9761, lon: 104.7754 },
  { name: "Tangerang", lat: -6.1783, lon: 106.6319 },
  { name: "Depok", lat: -6.4025, lon: 106.7942 },
  { name: "Bekasi", lat: -6.2383, lon: 106.9756 },
  { name: "Bogor", lat: -6.5950, lon: 106.8160 },
  { name: "Yogyakarta", lat: -7.7956, lon: 110.3695 },
  { name: "Malang", lat: -7.9666, lon: 112.6326 },
  { name: "Denpasar", lat: -8.6705, lon: 115.2126 },
  { name: "Balikpapan", lat: -1.2379, lon: 116.8529 },
  { name: "Bojongsoang", lat: -6.9978, lon: 107.6488 },
  { name: "Baleendah", lat: -7.0099, lon: 107.6354 },
  { name: "Dayeuhkolot", lat: -6.9863, lon: 107.6272 },
  { name: "Cimahi", lat: -6.8843, lon: 107.5423 },
];

export default function LocationSearch({ onSearch, currentLocation }: LocationSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCities = INDONESIAN_CITIES.filter((city) =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCitySelect = (city: (typeof INDONESIAN_CITIES)[0]) => {
    onSearch(city.lat, city.lon, city.name);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleUseMyLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onSearch(latitude, longitude, "Lokasi Saya");
          setIsOpen(false);
        },
        (error) => {
          alert("Tidak dapat mengakses lokasi Anda. Pastikan izin lokasi diaktifkan.");
          console.error("Geolocation error:", error);
        }
      );
    }
  };

  return (
    <div className="relative">
      {/* Current Location Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition border-2 border-gray-200 hover:border-[#89986D]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span className="font-semibold text-gray-800">{currentLocation}</span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`transform transition ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 overflow-hidden">
          {/* Use My Location */}
          <button
            onClick={handleUseMyLocation}
            className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center space-x-3 border-b border-gray-200 transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
            </svg>
            <div>
              <div className="font-semibold text-blue-600">Gunakan Lokasi Saya</div>
              <div className="text-xs text-gray-500">Deteksi otomatis dari GPS</div>
            </div>
          </button>

          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Cari kota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#89986D] text-sm"
            />
          </div>

          {/* City List */}
          <div className="overflow-y-auto max-h-64">
            {filteredCities.map((city) => (
              <button
                key={city.name}
                onClick={() => handleCitySelect(city)}
                className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between transition"
              >
                <span className="font-medium text-gray-800 text-sm">{city.name}</span>
                <span className="text-xs text-gray-400">
                  {city.lat.toFixed(2)}, {city.lon.toFixed(2)}
                </span>
              </button>
            ))}
            {filteredCities.length === 0 && (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                Kota tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
