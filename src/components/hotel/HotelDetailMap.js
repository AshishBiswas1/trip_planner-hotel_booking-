"use client";

import { useEffect, useRef, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";

/**
 * HOTEL DETAIL MAP COMPONENT (Hotel Only Version)
 * - Non-interactive (Static view)
 * - Single Primary Hotel Marker
 * - Cleaned up to remove Day/Stop overlays
 */

const DEFAULT_CENTER = [78.9629, 20.5937]; // India
const DEFAULT_ZOOM = 4;

export default function HotelDetailMap({
 hotelCoordinates, // Format: [lng, lat]
 zoom = 14,
}) {
 const mapContainerRef = useRef(null);
 const mapRef = useRef(null);
 const hotelMarkerRef = useRef(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");

 const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY?.trim();

 // Safety: Ensures [Longitude, Latitude] order for India (Lng > Lat)
 const getCorrectedCoords = (coords) => {
  if (!Array.isArray(coords) || coords.length !== 2) return DEFAULT_CENTER;
  const [a, b] = coords;
  // MapTiler standard is [Lng, Lat]. In India, Lng (~70-90) is > Lat (~8-30)
  return Math.abs(a) < Math.abs(b) ? [b, a] : [a, b];
 };

 const finalCoords = getCorrectedCoords(hotelCoordinates);

 useEffect(() => {
  if (!apiKey || !mapContainerRef.current || mapRef.current) return;

  maptilersdk.config.apiKey = apiKey;
  let isMounted = true;

  const initMap = async () => {
   try {
    const map = new maptilersdk.Map({
     container: mapContainerRef.current,
     style: maptilersdk.MapStyle.STREETS,
     center: finalCoords,
     zoom: hotelCoordinates ? zoom : DEFAULT_ZOOM,

     // NON-INTERACTIVE SETTINGS
     interactive: false,
     dragPan: false,
     scrollWheelZoom: false,
     doubleClickZoom: false,
     touchZoomRotate: false,
     keyboard: false,
     attributionControl: false,
    });

    // Suppress internal projection errors common in HMR/Turbopack reloads
    map.on("error", (e) => {
     if (e.error?.message?.includes("projection")) return;
     if (isMounted) setError("Map sync error. Please refresh.");
    });

    map.on("load", () => {
     if (!isMounted) return;
     map.resize();
     setLoading(false);

     // ADD PERMANENT HOTEL MARKER
     if (hotelCoordinates) {
      const el = document.createElement("div");
      // Premium dark theme for the main hotel marker
      el.className =
       "h-10 w-10 rounded-full border-4 border-white bg-slate-900 shadow-2xl flex items-center justify-center";
      el.innerHTML = `
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>`;

      hotelMarkerRef.current = new maptilersdk.Marker({
       element: el,
       anchor: "bottom",
      })
       .setLngLat(finalCoords)
       .addTo(map);
     }
    });

    mapRef.current = map;
   } catch (err) {
    if (isMounted) {
     setError(err.message);
     setLoading(false);
    }
   }
  };

  initMap();

  // CLEANUP: Aggressive removal to prevent "reading name of undefined" in Next.js
  return () => {
   isMounted = false;
   if (mapRef.current) {
    const currentMap = mapRef.current;
    mapRef.current = null;
    setTimeout(() => {
     try {
      currentMap.remove();
     } catch (e) {
      // Ignore WebGL context errors during hot-reload
     }
    }, 0);
   }
  };
 }, [apiKey]);

 // Handle updates to coordinates programmatically
 useEffect(() => {
  if (mapRef.current && hotelCoordinates) {
   const newCoords = getCorrectedCoords(hotelCoordinates);
   mapRef.current.jumpTo({ center: newCoords, zoom: zoom });

   if (hotelMarkerRef.current) {
    hotelMarkerRef.current.setLngLat(newCoords);
   }
  }
 }, [hotelCoordinates, zoom]);

 return (
  <div className="relative h-[400px] w-full overflow-hidden rounded-2xl border border-white/50 bg-slate-200 shadow-lg sm:h-[430px]">
   {/* MAP ENGINE LAYER */}
   <div
    ref={mapContainerRef}
    className="absolute inset-0 z-0 h-full w-full pointer-events-none"
   />

   {/* LOADING OVERLAY */}
   {loading && !error && (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-50/70 backdrop-blur-sm">
     <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
      <p className="text-xs font-black text-slate-700 tracking-[0.2em] uppercase">
       Locating Hotel
      </p>
     </div>
    </div>
   )}

   {/* ERROR OVERLAY */}
   {error && (
    <div className="absolute bottom-6 inset-x-6 z-30 rounded-xl bg-red-600 px-5 py-3 text-white text-xs font-bold shadow-2xl">
     ⚠️ {error}
    </div>
   )}
  </div>
 );
}
