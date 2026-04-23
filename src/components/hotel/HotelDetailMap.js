"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";

const DEFAULT_CENTER = [78.9629, 20.5937];
const DEFAULT_ZOOM = 5;
const MIN_FOCUS_ZOOM = 15;

export default function HotelDetailMap({
 hotelCoordinates, // Format: [lng, lat]
 zoom = 14,
}) {
 const mapContainerRef = useRef(null);
 const mapRef = useRef(null);
 const markerRef = useRef(null);
 const [error, setError] = useState("");
 const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY?.trim();

 const parsed = useMemo(() => {
  if (!Array.isArray(hotelCoordinates) || hotelCoordinates.length !== 2) {
   return null;
  }

  const [lng, lat] = hotelCoordinates;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
   return null;
  }

  return [lng, lat];
 }, [hotelCoordinates]);

 useEffect(() => {
  if (!apiKey) {
   setError("MapTiler API key is missing in .env.local.");
   return;
  }

  if (!mapContainerRef.current || mapRef.current) {
   return;
  }

  maptilersdk.config.apiKey = apiKey;

  const center = parsed || DEFAULT_CENTER;
  const targetZoom = parsed ? Math.max(zoom, MIN_FOCUS_ZOOM) : DEFAULT_ZOOM;

  const map = new maptilersdk.Map({
   container: mapContainerRef.current,
   style: "https://api.maptiler.com/maps/toner-v2/style.json",
   center,
   zoom: targetZoom,
   interactive: false,
   dragPan: false,
   scrollWheelZoom: false,
   doubleClickZoom: false,
   touchZoomRotate: false,
   keyboard: false,
   attributionControl: false,
  });

  map.on("error", (event) => {
   if (event?.error?.message?.includes("projection")) {
    return;
   }

   setError("Unable to load map tiles. Please refresh and try again.");
  });

  map.on("load", () => {
   setError("");
  });

  markerRef.current = new maptilersdk.Marker({ color: "#0f766e" })
   .setLngLat(center)
   .addTo(map);

  mapRef.current = map;

  return () => {
   const currentMap = mapRef.current;
   markerRef.current = null;
   mapRef.current = null;

   if (currentMap) {
    setTimeout(() => {
     try {
      currentMap.remove();
     } catch {
      // Ignore transient MapLibre teardown errors during HMR.
     }
    }, 0);
   }
  };
 }, [apiKey]);

 useEffect(() => {
  if (!mapRef.current) {
   return;
  }

  const center = parsed || DEFAULT_CENTER;
  const targetZoom = parsed ? Math.max(zoom, MIN_FOCUS_ZOOM) : DEFAULT_ZOOM;

  mapRef.current.jumpTo({ center, zoom: targetZoom });

  if (!markerRef.current) {
   markerRef.current = new maptilersdk.Marker({ color: "#0f766e" })
    .setLngLat(center)
    .addTo(mapRef.current);
   return;
  }

  markerRef.current.setLngLat(center);
 }, [parsed, zoom]);

 return (
  <div className="relative h-[400px] w-full overflow-hidden rounded-2xl border border-white/50 bg-slate-200 shadow-lg sm:h-[430px]">
   <div ref={mapContainerRef} className="h-full w-full" />

   {error ? (
    <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-lg">
     {error}
    </div>
   ) : null}
  </div>
 );
}
