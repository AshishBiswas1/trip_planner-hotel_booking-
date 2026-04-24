import { useEffect, useRef } from "react";
import {
 APIProvider,
 AdvancedMarker,
 Map,
 Pin,
 useMap,
} from "@vis.gl/react-google-maps";
import { DEFAULT_CENTER, GOOGLE_MAPS_API_KEY } from "../constants";
import { computeDriveRoutes } from "../utils";

const MODE_LABEL_MAP = {
 DRIVE: "driving",
 TWO_WHEELER: "two-wheeler",
 TRANSIT: "transit",
 WALK: "walking",
 BICYCLE: "cycling",
};

function MapClickLayer({ onPickLocation }) {
 const map = useMap();

 useEffect(() => {
  if (!map || typeof window === "undefined" || !window.google?.maps) return;

  const listener = map.addListener("click", (event) => {
   const latLng = event?.latLng;

   if (!latLng) return;

   onPickLocation({ lat: latLng.lat(), lng: latLng.lng() });
  });

  return () => listener.remove();
 }, [map, onPickLocation]);

 return null;
}

function DirectionsOverlay({
 startPoint,
 endPoint,
 travelMode,
 routeOptions,
 selectedRouteIndex,
 onRoutesResolved,
 onSelectRouteIndex,
 onRouteStatusChange,
 onRouteIssueChange,
}) {
 const map = useMap();
 const polylinesRef = useRef([]);
 const requestIdRef = useRef(0);

 useEffect(() => {
  if (!map || typeof window === "undefined" || !window.google?.maps) return;

  polylinesRef.current.forEach((polyline) => polyline.setMap(null));
  polylinesRef.current = [];

  if (!routeOptions.length) return;

  const selectedRoute = routeOptions[selectedRouteIndex] || routeOptions[0];

  routeOptions.forEach((route, index) => {
   const polyline = new window.google.maps.Polyline({
    path: route.path,
    geodesic: true,
    strokeColor: index === selectedRouteIndex ? "#2563eb" : "#94a3b8",
    strokeOpacity: index === selectedRouteIndex ? 0.95 : 0.55,
    strokeWeight: index === selectedRouteIndex ? 6 : 4,
    zIndex: index === selectedRouteIndex ? 20 : 10,
    clickable: true,
   });

   polyline.addListener("click", () => onSelectRouteIndex(index));
   polyline.setMap(map);
   polylinesRef.current.push(polyline);
  });

  if (selectedRoute?.path?.length) {
   const bounds = new window.google.maps.LatLngBounds();
   selectedRoute.path.forEach((point) => bounds.extend(point));
   map.fitBounds(bounds, 96);
  }

  return () => {
   polylinesRef.current.forEach((polyline) => polyline.setMap(null));
   polylinesRef.current = [];
  };
 }, [map, onSelectRouteIndex, routeOptions, selectedRouteIndex]);

 useEffect(() => {
  if (!map || typeof window === "undefined" || !window.google?.maps) return;

  if (!startPoint || !endPoint) {
   onRoutesResolved([]);
   onRouteIssueChange(null);
   onRouteStatusChange("Pick both locations to generate route alternatives.");
   return;
  }

  const currentRequestId = ++requestIdRef.current;

  onRouteStatusChange("Finding route alternatives...");

  const resolveRoutes = async () => {
   const result = await computeDriveRoutes({
    apiKey: GOOGLE_MAPS_API_KEY,
    origin: startPoint,
    destination: endPoint,
    travelMode,
    alternatives: true,
   });

   if (currentRequestId !== requestIdRef.current) return;

   if (result.ok && result.routes.length) {
    onRoutesResolved(result.routes);
    onRouteIssueChange(null);

    const requestedLabel =
     MODE_LABEL_MAP[result.requestedTravelMode] ||
     MODE_LABEL_MAP[travelMode] ||
     "selected";
    const effectiveLabel =
     MODE_LABEL_MAP[result.effectiveTravelMode] || requestedLabel;

    if (result.effectiveTravelMode !== result.requestedTravelMode) {
     onRouteStatusChange(
      `${result.routes.length} route${result.routes.length === 1 ? "" : "s"} ready. ${requestedLabel} routes were unavailable, so showing ${effectiveLabel} alternatives.`,
     );
     return;
    }

    onRouteStatusChange(
     `${result.routes.length} route${result.routes.length === 1 ? "" : "s"} ready.`,
    );
    return;
   }

   onRoutesResolved([]);

   if (result.status === "ZERO_RESULTS") {
    onRouteIssueChange({
     code: "ZERO_RESULTS",
     message:
      "No route found for the selected travel mode between the selected points.",
    });
    onRouteStatusChange("No route was found for the selected locations.");
    return;
   }

   if (
    result.status === "PERMISSION_DENIED" ||
    result.status === "REQUEST_DENIED"
   ) {
    onRouteIssueChange({
     code: result.status,
     message:
      "Routes API request was denied. Check whether Routes API is enabled and allowed referrers are configured.",
    });
    onRouteStatusChange(`Unable to draw routes right now (${result.status}).`);
    return;
   }

   onRouteIssueChange({
    code: result.status || "ROUTE_ERROR",
    message: `Unable to draw routes right now (${result.status}).`,
   });
   onRouteStatusChange(`Unable to draw routes right now (${result.status}).`);
  };

  resolveRoutes();
 }, [
  endPoint,
  map,
  onRouteIssueChange,
  onRouteStatusChange,
  onRoutesResolved,
  startPoint,
  travelMode,
 ]);

 return null;
}

export default function TripPlanningMap({
 startPoint,
 endPoint,
 travelMode,
 startPlaceLabel,
 endPlaceLabel,
 routeOptions,
 selectedRouteIndex,
 onRoutesResolved,
 onSelectRouteIndex,
 onPickLocation,
 onRouteStatusChange,
 onRouteIssueChange,
}) {
 const mapId =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() || "DEMO_MAP_ID";
 const center = startPoint || endPoint || DEFAULT_CENTER;

 if (!GOOGLE_MAPS_API_KEY) {
  return (
   <div className="flex min-h-[640px] items-center justify-center rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm text-rose-700">
    Google Maps API key is missing. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in
    .env.local.
   </div>
  );
 }

 return (
  <div className="relative min-h-[640px] overflow-hidden rounded-[2rem] border border-white/80 bg-slate-950 shadow-[0_30px_100px_rgba(15,23,42,0.18)]">
   <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
    <Map
     defaultCenter={center}
     defaultZoom={5}
     mapId={mapId || undefined}
     className="h-[640px] w-full"
     gestureHandling="greedy"
     clickableIcons={false}
     mapTypeControl={false}
     streetViewControl={false}
     fullscreenControl={false}
     disableDefaultUI={false}
    >
     <MapClickLayer onPickLocation={onPickLocation} />

     <DirectionsOverlay
      startPoint={startPoint}
      endPoint={endPoint}
      travelMode={travelMode}
      routeOptions={routeOptions}
      selectedRouteIndex={selectedRouteIndex}
      onRoutesResolved={onRoutesResolved}
      onSelectRouteIndex={onSelectRouteIndex}
      onRouteStatusChange={onRouteStatusChange}
      onRouteIssueChange={onRouteIssueChange}
     />

     {startPoint ? (
      <AdvancedMarker
       position={startPoint}
       title={startPlaceLabel || "Trip start"}
      >
       <Pin background="#16a34a" borderColor="#166534" glyphColor="#ffffff" />
      </AdvancedMarker>
     ) : null}

     {endPoint ? (
      <AdvancedMarker position={endPoint} title={endPlaceLabel || "Trip end"}>
       <Pin background="#dc2626" borderColor="#991b1b" glyphColor="#ffffff" />
      </AdvancedMarker>
     ) : null}
    </Map>
   </APIProvider>

   <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.06),rgba(2,6,23,0.24))]" />

   <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-slate-950/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100 backdrop-blur">
    Click the map to place{" "}
    {startPoint && !endPoint ? "the end point" : "start or end"}
   </div>

   <div className="absolute right-4 top-4 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-semibold text-white backdrop-blur-xl">
    Blue route = primary, gray routes = alternatives
   </div>

   <div className="absolute inset-x-4 bottom-4 flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-4 text-white shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
    <div className="flex items-center justify-between gap-3">
     <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200">
       Route engine
      </p>
      <p className="mt-1 text-sm text-slate-200">
       {routeOptions.length
        ? `${routeOptions.length} routes available. Click a route line or card to set it as primary.`
        : "Set both locations to generate route alternatives."}
      </p>
     </div>

     <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-cyan-100">
      Multi-route mode
     </div>
    </div>

    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
     <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
      Start: {startPlaceLabel || (startPoint ? "set" : "not set")}
     </span>
     <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
      End: {endPlaceLabel || (endPoint ? "set" : "not set")}
     </span>
     <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
      Route: {routeOptions[selectedRouteIndex]?.summary || "waiting"}
     </span>
    </div>
   </div>
  </div>
 );
}
