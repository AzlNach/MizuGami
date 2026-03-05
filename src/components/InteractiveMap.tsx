"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";

// "marker" library is needed for AdvancedMarkerElement
const LIBRARIES: ("marker")[] = ["marker"];

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const DEFAULT_CENTER = { lat: -6.9175, lng: 107.6191 }; // Bandung

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
  minHeight: "340px",
  borderRadius: "0",
};

interface InteractiveMapProps {
  center: { lat: number; lon: number } | null;
  onLocationPick: (lat: number, lon: number) => void;
  locationName: string;
}

export default function InteractiveMap({
  center,
  onLocationPick,
  locationName,
}: InteractiveMapProps) {
  const mapCenter = center
    ? { lat: center.lat, lng: center.lon }
    : DEFAULT_CENTER;

  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number }>(mapCenter);
  const [loadError, setLoadError] = useState(false);

  // Ref to the Google Map instance
  const mapRef = useRef<google.maps.Map | null>(null);
  // Ref to the AdvancedMarkerElement
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  // Sync external center changes
  useEffect(() => {
    setMarkerPos(mapCenter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.lat, center?.lon]);

  // Create / update AdvancedMarkerElement whenever map or position changes
  useEffect(() => {
    if (!mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.position = markerPos;
      mapRef.current.panTo(markerPos);
    } else {
      markerRef.current = new google.maps.marker.AdvancedMarkerElement({
        map: mapRef.current,
        position: markerPos,
        title: locationName,
      });
    }
  }, [markerPos, locationName]);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleMapUnmount = useCallback(() => {
    if (markerRef.current) {
      markerRef.current.map = null;
      markerRef.current = null;
    }
    mapRef.current = null;
  }, []);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPos({ lat, lng });
      onLocationPick(lat, lng);
    },
    [onLocationPick]
  );

  const useJsApi = !!GOOGLE_MAPS_API_KEY && !loadError;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="text-2xl mr-2"></span>
          Peta Lokasi Cuaca
        </h2>
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#F6F0D7] rounded-xl border border-[#C5D89D]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#89986D" strokeWidth="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-sm font-semibold text-[#89986D] max-w-[130px] truncate">{locationName}</span>
        </div>
      </div>

      <p className="text-xs text-gray-400 px-6 pb-2">
         Klik pada peta untuk memperbarui lokasi prakiraan cuaca
      </p>

      {/* Map */}
      <div className="flex-1 min-h-[280px]">
        {useJsApi ? (
          <LoadScript
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            libraries={LIBRARIES}
            onError={() => setLoadError(true)}
            loadingElement={
              <div className="w-full h-full bg-gray-100 flex items-center justify-center" style={{ minHeight: 280 }}>
                <div className="text-center text-gray-500">
                  <div className="text-3xl mb-2"></div>
                  <p className="text-sm">Memuat peta...</p>
                </div>
              </div>
            }
          >
            <GoogleMap
              mapContainerStyle={MAP_CONTAINER_STYLE}
              center={mapCenter}
              zoom={13}
              onClick={handleMapClick}
              onLoad={handleMapLoad}
              onUnmount={handleMapUnmount}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
                zoomControl: true,
                mapId: "DEMO_MAP_ID",
              }}
            />
          </LoadScript>
        ) : (
          <div className="w-full h-full flex flex-col" style={{ minHeight: 280 }}>
            <iframe
              key={`${mapCenter.lat}-${mapCenter.lng}`}
              width="100%"
              height="100%"
              style={{ border: 0, display: "block", minHeight: 280, flex: 1 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&z=14&output=embed`}
              title="Peta Lokasi Cuaca"
            />
            {loadError && (
              <p className="text-xs text-amber-600 bg-amber-50 px-4 py-2 border-t border-amber-200">
                 Maps JS API gagal dimuat. Aktifkan <strong>Maps JavaScript API</strong> di Google Cloud Console dan pastikan tidak ada pembatasan HTTP referrer untuk <code>localhost</code>.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Coordinates footer */}
      <div className="px-6 py-3 flex items-center space-x-2 text-xs text-gray-500 border-t border-gray-100">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
          <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
          <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
        </svg>
        <span>
          Koordinat aktif:{" "}
          <strong>{markerPos.lat.toFixed(5)}, {markerPos.lng.toFixed(5)}</strong>
        </span>
      </div>
    </div>
  );
}
