"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { tripApi } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import {
 GOOGLE_MAPS_API_KEY,
 ROUTE_TEST_FALLBACK_DESTINATION,
 ROUTE_TEST_FALLBACK_ORIGIN,
 itemVariants,
 pageVariants,
} from "./constants";
import {
 buildMajorRouteCoordinates,
 calculateEndDate,
 computeDriveRoutes,
 findPreferredRouteIndex,
 geocodePlace,
 getGeolocationErrorMessage,
 isSamePoint,
 parseLatLngText,
 reverseGeocode,
 toLatLngLiteral,
} from "./utils";
import TripPlanningMap from "./components/TripPlanningMap";
import RouteAlternativesPanel from "./components/RouteAlternativesPanel";
import TripComposerPanel, { HeroHeader } from "./components/TripComposerPanel";
import SuccessOverlay from "./components/SuccessOverlay";

export default function PlanTripPage() {
 const router = useRouter();
 const [form, setForm] = useState({
  details: "",
  startDate: "",
  durationDays: "5",
  startPlace: "",
  endPlace: "",
  travelMode: "DRIVE",
 });
 const [startPoint, setStartPoint] = useState(null);
 const [endPoint, setEndPoint] = useState(null);
 const [activePicker, setActivePicker] = useState("start");
 const [routeOptions, setRouteOptions] = useState([]);
 const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
 const [routePreference, setRoutePreference] = useState("manual");
 const [routeIssue, setRouteIssue] = useState(null);
 const [routeApiTestLoading, setRouteApiTestLoading] = useState(false);
 const [routeApiTestResult, setRouteApiTestResult] = useState(null);
 const [copiedDiagnostics, setCopiedDiagnostics] = useState(false);
 const [routeStatus, setRouteStatus] = useState(
  "Pick two locations to generate route alternatives.",
 );
 const [locationStatus, setLocationStatus] = useState({
  start: "Enter a place name or tap the map.",
  end: "Enter a place name or tap the map.",
 });
 const [loading, setLoading] = useState(false);
 const [useCurrentLocationLoading, setUseCurrentLocationLoading] =
  useState(false);
 const [geoPermissionState, setGeoPermissionState] = useState("unknown");
 const [error, setError] = useState("");
 const [successMessage, setSuccessMessage] = useState("");
 const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
 const [isClientMounted, setIsClientMounted] = useState(false);

 const startLookupTokenRef = useRef(0);
 const endLookupTokenRef = useRef(0);
 const startPointRef = useRef(null);
 const endPointRef = useRef(null);
 const redirectTimeoutRef = useRef(null);

 const endDate = useMemo(
  () => calculateEndDate(form.startDate, form.durationDays),
  [form.startDate, form.durationDays],
 );

 const summaryCards = useMemo(
  () => [
   {
    label: "Start",
    value: form.startPlace || "Awaiting location",
   },
   {
    label: "End",
    value: form.endPlace || "Awaiting location",
   },
   {
    label: "End date",
    value: endDate || "Auto-calculated",
   },
  ],
  [endDate, form.endPlace, form.startPlace],
 );

 useEffect(() => {
  startPointRef.current = startPoint;
 }, [startPoint]);

 useEffect(() => {
  endPointRef.current = endPoint;
 }, [endPoint]);

 useEffect(() => {
  return () => {
   if (redirectTimeoutRef.current) {
    clearTimeout(redirectTimeoutRef.current);
   }
  };
 }, []);

 useEffect(() => {
  setIsClientMounted(true);
 }, []);

 useEffect(() => {
  if (
   typeof navigator === "undefined" ||
   !navigator.permissions ||
   !navigator.geolocation
  ) {
   setGeoPermissionState("unsupported");
   return;
  }

  let permissionStatus;
  let isMounted = true;

  const loadPermission = async () => {
   try {
    permissionStatus = await navigator.permissions.query({
     name: "geolocation",
    });

    if (!isMounted) return;

    setGeoPermissionState(permissionStatus.state || "prompt");
    permissionStatus.onchange = () => {
     setGeoPermissionState(permissionStatus.state || "prompt");
    };
   } catch {
    if (isMounted) {
     setGeoPermissionState("unknown");
    }
   }
  };

  loadPermission();

  return () => {
   isMounted = false;
   if (permissionStatus) {
    permissionStatus.onchange = null;
   }
  };
 }, []);

 const handleChange = useCallback((event) => {
  const { name, value } = event.target;
  setForm((current) => ({ ...current, [name]: value }));
 }, []);

 const applyResolvedLocation = useCallback((target, location) => {
  if (!location) return;

  const coords = toLatLngLiteral(location.coords || location);
  if (!coords) return;

  if (target === "start") {
   setStartPoint(coords);
   setLocationStatus((current) => ({
    ...current,
    start: location.label
     ? `Matched: ${location.label}`
     : "Start location updated from the map.",
   }));
   return;
  }

  setEndPoint(coords);
  setLocationStatus((current) => ({
   ...current,
   end: location.label
    ? `Matched: ${location.label}`
    : "End location updated from the map.",
  }));
 }, []);

 const handleMapPick = useCallback(
  async (coords) => {
   if (!coords) return;

   const target = activePicker;
   const label = await reverseGeocode(GOOGLE_MAPS_API_KEY, coords);
   const resolved = { coords, label };

   if (target === "start") {
    setForm((current) => ({
     ...current,
     startPlace: label || `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
    }));
   } else {
    setForm((current) => ({
     ...current,
     endPlace: label || `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
    }));
   }

   applyResolvedLocation(target, resolved);
  },
  [activePicker, applyResolvedLocation],
 );

 const handleUseCurrentLocationAsStart = useCallback(async () => {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
   setError("Geolocation is not supported in this browser.");
   return;
  }

  setError("");
  setUseCurrentLocationLoading(true);

  try {
   const position = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
     enableHighAccuracy: true,
     timeout: 12000,
     maximumAge: 0,
    });
   });

   const coords = {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
   };
   const label = await reverseGeocode(GOOGLE_MAPS_API_KEY, coords);
   const startName = label || "Current Location";

   setForm((current) => ({
    ...current,
    startPlace: startName,
   }));
   applyResolvedLocation("start", { coords, label: startName });
   setActivePicker("end");
  } catch (geoError) {
   if (geoError?.code === 1) {
    setGeoPermissionState("denied");
   }
   setError(getGeolocationErrorMessage(geoError));
  } finally {
   setUseCurrentLocationLoading(false);
  }
 }, [applyResolvedLocation]);

 const handleRouteApiSelfTest = useCallback(async () => {
  if (!GOOGLE_MAPS_API_KEY) {
   setRouteApiTestResult({
    ok: false,
    title: "Route API test failed",
    message: "Google Maps API key is missing.",
   });
   return;
  }

  setRouteApiTestLoading(true);
  setRouteApiTestResult(null);

  const origin = startPoint || ROUTE_TEST_FALLBACK_ORIGIN;
  const destination = endPoint || ROUTE_TEST_FALLBACK_DESTINATION;

  try {
   const result = await computeDriveRoutes({
    apiKey: GOOGLE_MAPS_API_KEY,
    origin,
    destination,
    travelMode: form.travelMode,
    alternatives: false,
   });

   if (!result.ok || !result.routes.length) {
    throw new Error(result.status || "UNKNOWN_ERROR");
   }

   setRouteApiTestResult({
    ok: true,
    title: "Route API test passed",
    message:
     "Directions API is responding correctly from this page. If routes still hide, check selected points and filters.",
   });
  } catch (status) {
   const code = status instanceof Error ? status.message : status;

   if (code === "REQUEST_DENIED" || code === "PERMISSION_DENIED") {
    setRouteApiTestResult({
     ok: false,
     title: `Route API test failed: ${code}`,
     message:
      "Routes API denied this request. Enable Routes API for your key and allow this site origin in API key restrictions.",
    });
   } else {
    setRouteApiTestResult({
     ok: false,
     title: `Route API test failed: ${code}`,
     message:
      "Routes API call did not succeed. Review API key setup, billing, and current request points.",
    });
   }
  } finally {
   setRouteApiTestLoading(false);
  }
 }, [endPoint, form.travelMode, startPoint]);

 const handleCopyDiagnostics = useCallback(async () => {
  const diagnostics = {
   timestamp: new Date().toISOString(),
   routeStatus,
   routeIssue,
   routeApiTestResult,
   routePreference,
   routeCount: routeOptions.length,
   selectedRouteIndex,
   selectedRouteSummary: routeOptions[selectedRouteIndex]?.summary || null,
   startPlace: form.startPlace || null,
   endPlace: form.endPlace || null,
   startPoint,
   endPoint,
   googleMapsApiKeyPresent: Boolean(GOOGLE_MAPS_API_KEY),
  };

  if (typeof navigator === "undefined" || !navigator?.clipboard?.writeText) {
   setError("Clipboard access is unavailable in this browser context.");
   return;
  }

  try {
   await navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
   setCopiedDiagnostics(true);
   setTimeout(() => setCopiedDiagnostics(false), 1800);
  } catch {
   setError("Failed to copy diagnostics. Please try again.");
  }
 }, [
  endPoint,
  form.endPlace,
  form.startPlace,
  routeApiTestResult,
  routeIssue,
  routeOptions,
  routePreference,
  routeStatus,
  selectedRouteIndex,
  startPoint,
 ]);

 useEffect(() => {
  const query = form.startPlace.trim();

  if (!query) {
   setStartPoint((current) => (current ? null : current));
   setLocationStatus((current) => ({
    ...current,
    start: "Enter a place name or tap the map.",
   }));
   return;
  }

  const parsedCoords = parseLatLngText(query);
  if (parsedCoords) {
   setStartPoint((current) =>
    isSamePoint(current, parsedCoords) ? current : parsedCoords,
   );
   setLocationStatus((current) => ({
    ...current,
    start: "Using typed coordinates as start location.",
   }));
   return;
  }

  const token = ++startLookupTokenRef.current;
  setLocationStatus((current) => ({
   ...current,
   start: "Searching for the start location...",
  }));

  const timer = setTimeout(async () => {
   const result = await geocodePlace(GOOGLE_MAPS_API_KEY, query);

   if (token !== startLookupTokenRef.current) return;

   if (result?.coords) {
    setStartPoint((current) =>
     isSamePoint(current, result.coords) ? current : result.coords,
    );
    setLocationStatus((current) => ({
     ...current,
     start: `Matched: ${result.label}`,
    }));
    return;
   }

   if (startPointRef.current) {
    setLocationStatus((current) => ({
     ...current,
     start:
      "Could not resolve this text. Keeping your previously selected start location.",
    }));
   } else {
    setStartPoint(null);
    setLocationStatus((current) => ({
     ...current,
     start: "No match yet. Try a broader place name or pick on the map.",
    }));
   }
  }, 700);

  return () => clearTimeout(timer);
 }, [form.startPlace]);

 useEffect(() => {
  const query = form.endPlace.trim();

  if (!query) {
   setEndPoint((current) => (current ? null : current));
   setLocationStatus((current) => ({
    ...current,
    end: "Enter a place name or tap the map.",
   }));
   return;
  }

  const parsedCoords = parseLatLngText(query);
  if (parsedCoords) {
   setEndPoint((current) =>
    isSamePoint(current, parsedCoords) ? current : parsedCoords,
   );
   setLocationStatus((current) => ({
    ...current,
    end: "Using typed coordinates as destination location.",
   }));
   return;
  }

  const token = ++endLookupTokenRef.current;
  setLocationStatus((current) => ({
   ...current,
   end: "Searching for the destination...",
  }));

  const timer = setTimeout(async () => {
   const result = await geocodePlace(GOOGLE_MAPS_API_KEY, query);

   if (token !== endLookupTokenRef.current) return;

   if (result?.coords) {
    setEndPoint((current) =>
     isSamePoint(current, result.coords) ? current : result.coords,
    );
    setLocationStatus((current) => ({
     ...current,
     end: `Matched: ${result.label}`,
    }));
    return;
   }

   if (endPointRef.current) {
    setLocationStatus((current) => ({
     ...current,
     end: "Could not resolve this text. Keeping your previously selected destination.",
    }));
   } else {
    setEndPoint(null);
    setLocationStatus((current) => ({
     ...current,
     end: "No match yet. Try a broader place name or pick on the map.",
    }));
   }
  }, 700);

  return () => clearTimeout(timer);
 }, [form.endPlace]);

 useEffect(() => {
  if (selectedRouteIndex >= routeOptions.length) {
   setSelectedRouteIndex(0);
  }
 }, [routeOptions, selectedRouteIndex]);

 useEffect(() => {
  if (!routeOptions.length) return;

  if (routePreference === "manual") return;

  const nextIndex = findPreferredRouteIndex(routeOptions, routePreference);
  setSelectedRouteIndex(nextIndex);
 }, [routeOptions, routePreference]);

 const handleSubmit = useCallback(
  async (event) => {
   event.preventDefault();
   setError("");
   setSuccessMessage("");
   setLoading(true);

   try {
    const [resolvedStart, resolvedEnd] = await Promise.all([
     startPoint
      ? { coords: startPoint, label: form.startPlace }
      : geocodePlace(GOOGLE_MAPS_API_KEY, form.startPlace),
     endPoint
      ? { coords: endPoint, label: form.endPlace }
      : geocodePlace(GOOGLE_MAPS_API_KEY, form.endPlace),
    ]);

    const startCoords = toLatLngLiteral(resolvedStart?.coords);
    const endCoords = toLatLngLiteral(resolvedEnd?.coords);

    if (!startCoords || !endCoords) {
     throw new Error("Resolve both locations before creating the trip.");
    }

    if (!form.startDate) {
     throw new Error("Choose a start date before creating the trip.");
    }

    const finalEndDate = calculateEndDate(form.startDate, form.durationDays);

    if (!finalEndDate) {
     throw new Error("Trip duration could not be converted into an end date.");
    }

    const selectedRoutePath = routeOptions[selectedRouteIndex]?.path || [];
    const majorRouteCoordinates = await buildMajorRouteCoordinates({
     apiKey: GOOGLE_MAPS_API_KEY,
     routePath: selectedRoutePath,
     startCoords,
     endCoords,
     startLabel: resolvedStart?.label || form.startPlace,
     endLabel: resolvedEnd?.label || form.endPlace,
     maxIntermediatePoints: 8,
    });

    const payload = {
     details: form.details,
     startDate: form.startDate,
     endDate: finalEndDate,
     travelMode: form.travelMode,
     startLocation: {
      coordinates: startCoords,
     },
     endLocation: {
      coordinates: endCoords,
     },
     route: majorRouteCoordinates.map((point) => ({
      coordinates: {
       lat: point.lat,
       lng: point.lng,
      },
     })),
    };

    await tripApi.createTrip(payload);

    setSuccessMessage("Trip created successfully.");
    setShowSuccessOverlay(true);

    redirectTimeoutRef.current = setTimeout(() => {
     router.push("/");
    }, 1800);
   } catch (submitError) {
    setError(submitError?.message || "Failed to create trip.");
   } finally {
    setLoading(false);
   }
  },
  [
   endPoint,
   form.details,
   form.endPlace,
   form.startDate,
   form.startPlace,
   form.durationDays,
   router,
   routeOptions,
   selectedRouteIndex,
   startPoint,
   form.travelMode,
  ],
 );

 if (!isClientMounted) {
  return (
   <main className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_30%),linear-gradient(180deg,_#f8fdff_0%,_#effaf8_42%,_#ffffff_100%)] py-6 sm:py-10" />
  );
 }

 return (
  <main className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_30%),linear-gradient(180deg,_#f8fdff_0%,_#effaf8_42%,_#ffffff_100%)] py-6 sm:py-10">
   <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <motion.div
     aria-hidden="true"
     className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl"
     animate={{ x: [0, 28, 0], y: [0, -12, 0] }}
     transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
     aria-hidden="true"
     className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl"
     animate={{ x: [0, -22, 0], y: [0, 18, 0] }}
     transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40" />
   </div>

   <motion.div
    className="container relative mx-auto px-4"
    variants={pageVariants}
    initial="hidden"
    animate="show"
   >
    <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
     <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-x-0.5 hover:border-cyan-300 hover:text-cyan-700"
     >
      <ArrowLeft className="h-4 w-4" />
      Back to Home
     </Link>
    </motion.div>

    <HeroHeader endDate={endDate} routeCount={routeOptions.length} />

    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
     <motion.section variants={itemVariants} className="space-y-6">
      <TripPlanningMap
       startPoint={startPoint}
       endPoint={endPoint}
       travelMode={form.travelMode}
       startPlaceLabel={form.startPlace}
       endPlaceLabel={form.endPlace}
       routeOptions={routeOptions}
       selectedRouteIndex={selectedRouteIndex}
       onRoutesResolved={setRouteOptions}
       onSelectRouteIndex={setSelectedRouteIndex}
       onPickLocation={handleMapPick}
       onRouteStatusChange={setRouteStatus}
       onRouteIssueChange={setRouteIssue}
      />

      <RouteAlternativesPanel
       routeStatus={routeStatus}
       routeIssue={routeIssue}
       routeApiTestLoading={routeApiTestLoading}
       routeApiTestResult={routeApiTestResult}
       onRouteApiSelfTest={handleRouteApiSelfTest}
       onCopyDiagnostics={handleCopyDiagnostics}
       copiedDiagnostics={copiedDiagnostics}
       routePreference={routePreference}
       onRoutePreferenceChange={setRoutePreference}
       routeOptions={routeOptions}
       selectedRouteIndex={selectedRouteIndex}
       onRouteCardSelect={(index) => {
        setRoutePreference("manual");
        setSelectedRouteIndex(index);
       }}
      />
     </motion.section>

     <TripComposerPanel
      itemVariants={itemVariants}
      handleSubmit={handleSubmit}
      form={form}
      handleChange={handleChange}
      activePicker={activePicker}
      setActivePicker={setActivePicker}
      handleUseCurrentLocationAsStart={handleUseCurrentLocationAsStart}
      useCurrentLocationLoading={useCurrentLocationLoading}
      geoPermissionState={geoPermissionState}
      locationStatus={locationStatus}
      endDate={endDate}
      travelMode={form.travelMode}
      summaryCards={summaryCards}
      error={error}
      successMessage={successMessage}
      loading={loading}
     />
    </div>
   </motion.div>

   <SuccessOverlay show={showSuccessOverlay} />
  </main>
 );
}
