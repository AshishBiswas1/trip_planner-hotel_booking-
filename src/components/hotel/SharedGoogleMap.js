"use client";

import { useEffect, useRef } from "react";
import {
 APIProvider,
 AdvancedMarker,
 Map,
 Marker,
 Pin,
 useMap,
} from "@vis.gl/react-google-maps";

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };

const USER_MARKER_ICON =
 "data:image/svg+xml;utf8," +
 encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24"><path fill="#16a34a" stroke="#ffffff" stroke-width="1.2" d="M12 2C8.134 2 5 5.134 5 9c0 5.19 7 13 7 13s7-7.81 7-13c0-3.866-3.134-7-7-7z"/><circle cx="12" cy="9" r="3" fill="#ffffff"/></svg>',
 );

const HOTEL_MARKER_ICON =
 "data:image/svg+xml;utf8," +
 encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24"><path fill="#dc2626" stroke="#ffffff" stroke-width="1.2" d="M12 2C8.134 2 5 5.134 5 9c0 5.19 7 13 7 13s7-7.81 7-13c0-3.866-3.134-7-7-7z"/><circle cx="12" cy="9" r="3" fill="#ffffff"/></svg>',
 );

function LiveUserMarker({ enabled, initialPosition, updateIntervalMs = 200 }) {
 const map = useMap();
 const liveMarkerRef = useRef(null);
 const watchIdRef = useRef(null);
 const lastUpdateRef = useRef(0);

 useEffect(() => {
  if (
   !enabled ||
   !map ||
   typeof window === "undefined" ||
   !window.google?.maps
  ) {
   return;
  }

  const throttledInterval = Math.min(1000, Math.max(50, updateIntervalMs));

  if (!liveMarkerRef.current) {
   liveMarkerRef.current = new window.google.maps.Marker({
    map,
    title: "Your Location",
    icon: {
     path: window.google.maps.SymbolPath.CIRCLE,
     fillColor: "#16a34a",
     fillOpacity: 1,
     strokeColor: "#ffffff",
     strokeWeight: 2,
     scale: 8,
    },
    zIndex: 1000,
   });
  }

  if (
   initialPosition &&
   Number.isFinite(initialPosition.lat) &&
   Number.isFinite(initialPosition.lng)
  ) {
   liveMarkerRef.current.setPosition(initialPosition);
  }

  if (!navigator?.geolocation) {
   return;
  }

  watchIdRef.current = navigator.geolocation.watchPosition(
   (position) => {
    const now = Date.now();

    if (now - lastUpdateRef.current < throttledInterval) {
     return;
    }

    const next = {
     lat: position.coords.latitude,
     lng: position.coords.longitude,
    };

    liveMarkerRef.current?.setPosition(next);
    lastUpdateRef.current = now;
   },
   () => {
    // Keep silent: page-level location UI already handles permission errors.
   },
   {
    enableHighAccuracy: true,
    timeout: 12000,
    maximumAge: 0,
   },
  );

  return () => {
   if (watchIdRef.current !== null) {
    navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
   }

   if (liveMarkerRef.current) {
    liveMarkerRef.current.setMap(null);
    liveMarkerRef.current = null;
   }
  };
 }, [enabled, map, updateIntervalMs]);

 useEffect(() => {
  if (
   !enabled ||
   !liveMarkerRef.current ||
   !initialPosition ||
   !Number.isFinite(initialPosition.lat) ||
   !Number.isFinite(initialPosition.lng)
  ) {
   return;
  }

  liveMarkerRef.current.setPosition(initialPosition);
 }, [enabled, initialPosition]);

 return null;
}

function RadiusCircle({ center, radiusKm, showCircle }) {
 const map = useMap();
 const circleRef = useRef(null);

 useEffect(() => {
  if (circleRef.current && (!showCircle || !map)) {
   circleRef.current.setMap(null);
   circleRef.current = null;
  }

  if (
   !map ||
   !showCircle ||
   !center ||
   !Number.isFinite(center.lat) ||
   !Number.isFinite(center.lng) ||
   !Number.isFinite(radiusKm) ||
   radiusKm <= 0 ||
   typeof window === "undefined" ||
   !window.google?.maps
  ) {
   return;
  }

  if (!circleRef.current) {
   circleRef.current = new window.google.maps.Circle({
    strokeColor: "#16a34a",
    strokeOpacity: 0.95,
    strokeWeight: 2,
    fillColor: "#16a34a",
    fillOpacity: 0.14,
   });
  }

  circleRef.current.setCenter(center);
  circleRef.current.setRadius(radiusKm * 1000);
  circleRef.current.setMap(map);

  return () => {
   if (circleRef.current) {
    circleRef.current.setMap(null);
    circleRef.current = null;
   }
  };
 }, [center, map, radiusKm, showCircle]);

 return null;
}

function AutoFocusCenter({ center, zoom, enabled }) {
 const map = useMap();
 const lastCenterRef = useRef("");

 useEffect(() => {
  if (
   !enabled ||
   !map ||
   !center ||
   !Number.isFinite(center.lat) ||
   !Number.isFinite(center.lng)
  ) {
   return;
  }

  const centerKey = `${center.lat.toFixed(6)},${center.lng.toFixed(6)}`;

  if (lastCenterRef.current === centerKey) {
   return;
  }

  map.panTo(center);

  if (Number.isFinite(zoom)) {
   map.setZoom(zoom);
  }

  lastCenterRef.current = centerKey;
 }, [center, enabled, map, zoom]);

 return null;
}

function RouteRenderer({
 origin,
 destination,
 showRoute,
 onRouteStatusChange,
}) {
 const map = useMap();
 const directionsRendererRef = useRef(null);
 const directionsServiceRef = useRef(null);
 const blockedRef = useRef(false);

 useEffect(() => {
  if (!map || typeof window === "undefined" || !window.google?.maps) {
   return;
  }

  if (!directionsRendererRef.current) {
   directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
    suppressMarkers: true,
    preserveViewport: false,
    polylineOptions: {
     strokeColor: "#2563eb",
     strokeOpacity: 0.9,
     strokeWeight: 5,
    },
   });
   directionsRendererRef.current.setMap(map);
  }

  if (!directionsServiceRef.current) {
   directionsServiceRef.current = new window.google.maps.DirectionsService();
  }

  if (
   blockedRef.current ||
   !showRoute ||
   !origin ||
   !destination ||
   !Number.isFinite(origin.lat) ||
   !Number.isFinite(origin.lng) ||
   !Number.isFinite(destination.lat) ||
   !Number.isFinite(destination.lng)
  ) {
   directionsRendererRef.current.setDirections({ routes: [] });
   return;
  }

  directionsServiceRef.current.route(
   {
    origin,
    destination,
    travelMode: window.google.maps.TravelMode.DRIVING,
    provideRouteAlternatives: false,
   },
   (result, status) => {
    if (status === "OK" && result) {
     blockedRef.current = false;
     onRouteStatusChange?.(null);
     directionsRendererRef.current?.setDirections(result);
     return;
    }

    if (status === "REQUEST_DENIED") {
     blockedRef.current = true;
     directionsRendererRef.current?.setDirections({ routes: [] });
     onRouteStatusChange?.(
      "Route service is not authorized for this API key. Please check Google Cloud API key restrictions.",
     );
     return;
    }

    if (status && status !== "ZERO_RESULTS") {
     onRouteStatusChange?.(`Unable to draw route right now (${status}).`);
    }
   },
  );

  return () => {
   if (directionsRendererRef.current) {
    directionsRendererRef.current.setMap(null);
    directionsRendererRef.current = null;
   }
  };
 }, [destination, map, origin, showRoute]);

 return null;
}

export default function SharedGoogleMap({
 center,
 markers = [],
 zoom = 13,
 interactive = true,
 autoFocusCenter = false,
 autoFocusZoom = 15,
 className = "h-full min-h-[320px] w-full",
 circleCenter,
 circleRadiusKm = 0,
 showCircle = false,
 routeOrigin,
 routeDestination,
 showRoute = false,
 onRouteStatusChange,
 enableLiveUserTracking = false,
 liveUserTrackingIntervalMs = 200,
}) {
 const apiKey =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY_JS?.trim() ||
  "";
 const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() || "";
 const useAdvancedMarkers = Boolean(mapId);

 if (!apiKey) {
  return (
   <div className="flex h-full items-center justify-center bg-slate-100 p-6 text-center text-sm text-rose-700">
    Google Maps key is missing. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in
    .env.local.
   </div>
  );
 }

 const safeCenter =
  center && Number.isFinite(center.lat) && Number.isFinite(center.lng)
   ? center
   : DEFAULT_CENTER;

 return (
  <div className={`relative isolate z-0 overflow-hidden ${className}`}>
   <APIProvider apiKey={apiKey}>
    <Map
     defaultCenter={safeCenter}
     defaultZoom={zoom}
     mapId={mapId || undefined}
     mapTypeControl={false}
     streetViewControl={false}
     fullscreenControl={interactive}
     gestureHandling={interactive ? "greedy" : "none"}
     disableDefaultUI={!interactive}
     draggable={interactive}
     scrollwheel={interactive}
     keyboardShortcuts={interactive}
     className="h-full w-full"
    >
     <AutoFocusCenter
      center={safeCenter}
      zoom={autoFocusZoom}
      enabled={autoFocusCenter}
     />

     <LiveUserMarker
      enabled={enableLiveUserTracking}
      initialPosition={safeCenter}
      updateIntervalMs={liveUserTrackingIntervalMs}
     />

     {markers.map((marker) => {
      const key = marker?.id || `${marker?.title}-${marker?.position?.lat}`;
      const position = marker?.position;

      if (!position) {
       return null;
      }

      const borderColor = marker?.variant === "user" ? "#166534" : "#991b1b";
      const fillColor = marker?.variant === "user" ? "#16a34a" : "#dc2626";

      if (useAdvancedMarkers) {
       return (
        <AdvancedMarker key={key} position={position} title={marker?.title}>
         <Pin
          background={fillColor}
          borderColor={borderColor}
          glyphColor="#ffffff"
         />
        </AdvancedMarker>
       );
      }

      return (
       <Marker
        key={key}
        position={position}
        title={marker?.title}
        label={marker?.variant === "user" ? "U" : undefined}
        icon={marker?.variant === "user" ? USER_MARKER_ICON : HOTEL_MARKER_ICON}
       />
      );
     })}

     <RadiusCircle
      center={circleCenter}
      radiusKm={circleRadiusKm}
      showCircle={showCircle}
     />

     <RouteRenderer
      origin={routeOrigin}
      destination={routeDestination}
      showRoute={showRoute}
      onRouteStatusChange={onRouteStatusChange}
     />
    </Map>
   </APIProvider>
  </div>
 );
}
