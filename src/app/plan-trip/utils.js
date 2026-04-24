export function toIsoDate(date) {
 if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
  return "";
 }

 return date.toISOString().slice(0, 10);
}

export function calculateEndDate(startDate, durationDays) {
 if (!startDate) return "";

 const duration = Math.max(1, Number(durationDays) || 1);
 const [year, month, day] = startDate.split("-").map(Number);

 if (![year, month, day].every(Number.isFinite)) return "";

 const endDate = new Date(Date.UTC(year, month - 1, day));
 endDate.setUTCDate(endDate.getUTCDate() + duration - 1);

 return toIsoDate(endDate);
}

export function toLatLngLiteral(value) {
 if (!value) return null;

 const lat = Number(value.lat);
 const lng = Number(value.lng);

 if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

 return { lat, lng };
}

export function isSamePoint(a, b) {
 const pointA = toLatLngLiteral(a);
 const pointB = toLatLngLiteral(b);

 if (!pointA || !pointB) return false;

 return pointA.lat === pointB.lat && pointA.lng === pointB.lng;
}

export function pathFromRoute(route) {
 const points = route?.overview_path;

 if (!Array.isArray(points)) return [];

 return points
  .map((point) => {
   if (typeof point?.lat === "function" && typeof point?.lng === "function") {
    return { lat: point.lat(), lng: point.lng() };
   }

   return toLatLngLiteral(point);
  })
  .filter(Boolean);
}

export function formatDistance(meters) {
 if (!Number.isFinite(meters)) return "Distance unavailable";

 if (meters >= 1000) {
  return `${(meters / 1000).toFixed(meters >= 10000 ? 0 : 1)} km`;
 }

 return `${Math.round(meters)} m`;
}

export function formatDuration(seconds) {
 if (!Number.isFinite(seconds)) return "Time unavailable";

 const totalMinutes = Math.max(1, Math.round(seconds / 60));
 const hours = Math.floor(totalMinutes / 60);
 const minutes = totalMinutes % 60;

 if (hours === 0) return `${minutes} min`;
 if (minutes === 0) return `${hours} hr`;
 return `${hours} hr ${minutes} min`;
}

export function formatInr(value) {
 if (!Number.isFinite(value)) return "N/A";

 return new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
 }).format(value);
}

export function parseLatLngText(input) {
 if (!input || typeof input !== "string") return null;

 const parts = input
  .split(",")
  .map((part) => part.trim())
  .filter(Boolean);

 if (parts.length !== 2) return null;

 const lat = Number(parts[0]);
 const lng = Number(parts[1]);

 if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
 if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

 return { lat, lng };
}

export function getGeolocationErrorMessage(error) {
 if (!error || typeof error.code !== "number") {
  return "Unable to fetch your current location. Please try again.";
 }

 if (error.code === 1) {
  return "Location permission was denied. Enable location access in your browser settings.";
 }

 if (error.code === 2) {
  return "Current location is unavailable right now. Please try again in a moment.";
 }

 if (error.code === 3) {
  return "Location request timed out. Please retry or enter the place manually.";
 }

 return "Unable to fetch your current location. Please try again.";
}

export function findPreferredRouteIndex(routes, preference) {
 if (!Array.isArray(routes) || !routes.length) return 0;

 if (preference === "fastest") {
  return routes.reduce((bestIdx, route, idx, all) => {
   const current = route?.durationValue ?? Number.POSITIVE_INFINITY;
   const best = all[bestIdx]?.durationValue ?? Number.POSITIVE_INFINITY;
   return current < best ? idx : bestIdx;
  }, 0);
 }

 if (preference === "shortest") {
  return routes.reduce((bestIdx, route, idx, all) => {
   const current = route?.distanceValue ?? Number.POSITIVE_INFINITY;
   const best = all[bestIdx]?.distanceValue ?? Number.POSITIVE_INFINITY;
   return current < best ? idx : bestIdx;
  }, 0);
 }

 return 0;
}

export async function geocodePlace(apiKey, place) {
 if (!apiKey || !place?.trim()) return null;

 const query = place.trim();
 const normalizedQuery = query.toLowerCase();
 const queryAliasMap = {
  rooki: "roorkee",
  rookee: "roorkee",
  roorke: "roorkee",
  "core university": "coer university roorkee",
 };

 const geocodeAddress = (address) => {
  const buildGoogleGeocodeUrl = (countryCode) => {
   const componentsParam = countryCode
    ? `&components=country:${encodeURIComponent(countryCode)}`
    : "";

   return `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address,
   )}&region=in&language=en${componentsParam}&key=${apiKey}`;
  };

  const geocodeRequest = async (countryCode) => {
   let response;

   try {
    response = await fetch(buildGoogleGeocodeUrl(countryCode));
   } catch {
    return null;
   }

   const data = await response.json();

   if (
    data?.status !== "OK" ||
    !Array.isArray(data?.results) ||
    !data.results[0]
   ) {
    return null;
   }

   const result = data.results[0];
   const location = result?.geometry?.location;

   if (!location) return null;

   return {
    coords: { lat: location.lat, lng: location.lng },
    label: result.formatted_address || address,
   };
  };

  return {
   indiaOnly: () => geocodeRequest("IN"),
   global: () => geocodeRequest(),
  };
 };

 const geocodeWithOpenMeteo = (address) => {
  const lookup = async (countryCode) => {
   const countryParam = countryCode
    ? `&countryCode=${encodeURIComponent(countryCode)}`
    : "";

   let response;

   try {
    response = await fetch(
     `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      address,
     )}&count=1&language=en&format=json${countryParam}`,
    );
   } catch {
    return null;
   }

   if (!response.ok) return null;

   const data = await response.json();
   const best = Array.isArray(data?.results) ? data.results[0] : null;

   const lat = Number(best?.latitude);
   const lng = Number(best?.longitude);

   if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

   const labelParts = [best?.name, best?.admin1, best?.country]
    .filter(Boolean)
    .join(", ");

   return {
    coords: { lat, lng },
    label: labelParts || address,
   };
  };

  return {
   indiaOnly: () => lookup("IN"),
   global: () => lookup(),
  };
 };

 const queryCandidates = [query, `${query}, India`];
 const alias = queryAliasMap[normalizedQuery];

 if (alias) {
  queryCandidates.push(alias, `${alias}, India`);
 }

 const uniqueCandidates = [...new Set(queryCandidates)];

 // Phase 1: check all candidates with India-only constraint first.
 for (const candidate of uniqueCandidates) {
  const resolved = await geocodeAddress(candidate).indiaOnly();
  if (resolved) return resolved;
 }

 // Phase 2: still India-first on fallback provider.
 for (const candidate of uniqueCandidates) {
  const fallback = await geocodeWithOpenMeteo(candidate).indiaOnly();
  if (fallback) return fallback;
 }

 // Phase 3: only now allow global matching.
 for (const candidate of uniqueCandidates) {
  const resolved = await geocodeAddress(candidate).global();
  if (resolved) return resolved;
 }

 for (const candidate of uniqueCandidates) {
  const fallback = await geocodeWithOpenMeteo(candidate).global();
  if (fallback) return fallback;
 }

 return null;
}

export function downsamplePath(path, maxPoints = 120) {
 if (!Array.isArray(path)) return [];
 if (path.length <= maxPoints) return path;

 const sampled = [];
 const step = (path.length - 1) / (maxPoints - 1);

 for (let i = 0; i < maxPoints; i += 1) {
  const index = Math.round(i * step);
  sampled.push(path[index]);
 }

 return sampled;
}

function toRadians(value) {
 return (value * Math.PI) / 180;
}

function distanceKm(a, b) {
 if (!a || !b) return Number.POSITIVE_INFINITY;

 const earthRadiusKm = 6371;
 const dLat = toRadians((b.lat || 0) - (a.lat || 0));
 const dLng = toRadians((b.lng || 0) - (a.lng || 0));
 const lat1 = toRadians(a.lat || 0);
 const lat2 = toRadians(b.lat || 0);

 const haversine =
  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

 return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}

function extractLocationAnchor(label) {
 if (!label || typeof label !== "string") return "";

 const tokens = label
  .split(",")
  .map((part) => part.replace(/\d+/g, "").trim())
  .filter(Boolean)
  .filter((part) => part.toLowerCase() !== "india");

 if (!tokens.length) return "";

 return tokens.slice(-3).join("|").toLowerCase();
}

function dedupeByCoordinates(points, minGapKm = 20) {
 const deduped = [];

 points.forEach((point) => {
  const coords = toLatLngLiteral(point);
  if (!coords) return;

  const existing = deduped.find(
   (candidate) => distanceKm(candidate, coords) < minGapKm,
  );

  if (!existing) {
   deduped.push(coords);
  }
 });

 return deduped;
}

export async function buildMajorRouteCoordinates({
 apiKey,
 routePath,
 startCoords,
 endCoords,
 startLabel,
 endLabel,
 maxIntermediatePoints = 8,
}) {
 const origin = toLatLngLiteral(startCoords);
 const destination = toLatLngLiteral(endCoords);

 if (!origin || !destination) return [];

 const sampled = downsamplePath(routePath || [], 18).filter(Boolean);

 if (!sampled.length || !apiKey) {
  return dedupeByCoordinates([origin, destination], 1);
 }

 const middle = sampled.slice(1, -1);

 const geocoded = await Promise.all(
  middle.map(async (point) => {
   const label = await reverseGeocode(apiKey, point);
   return {
    point: toLatLngLiteral(point),
    anchor: extractLocationAnchor(label),
   };
  }),
 );

 const seenAnchors = new Set();
 const startAnchor = extractLocationAnchor(startLabel);
 const endAnchor = extractLocationAnchor(endLabel);

 if (startAnchor) seenAnchors.add(startAnchor);
 if (endAnchor) seenAnchors.add(endAnchor);

 const selected = [origin];

 for (const entry of geocoded) {
  if (selected.length >= maxIntermediatePoints + 1) break;
  if (!entry?.point || !entry.anchor || seenAnchors.has(entry.anchor)) continue;

  const tooClose =
   distanceKm(selected[selected.length - 1], entry.point) < 30 ||
   distanceKm(destination, entry.point) < 30;

  if (tooClose) continue;

  selected.push(entry.point);
  seenAnchors.add(entry.anchor);
 }

 selected.push(destination);

 return dedupeByCoordinates(selected, 10);
}

export async function reverseGeocode(apiKey, coords) {
 if (!apiKey || !coords) return null;

 const response = await fetch(
  `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.lat},${coords.lng}&key=${apiKey}`,
 );
 const data = await response.json();

 if (
  data?.status !== "OK" ||
  !Array.isArray(data?.results) ||
  !data.results[0]
 ) {
  return null;
 }

 return data.results[0].formatted_address || null;
}

function decodePolyline(encoded) {
 if (!encoded || typeof encoded !== "string") return [];

 let index = 0;
 let lat = 0;
 let lng = 0;
 const coordinates = [];

 while (index < encoded.length) {
  let result = 0;
  let shift = 0;
  let byte;

  do {
   byte = encoded.charCodeAt(index++) - 63;
   result |= (byte & 0x1f) << shift;
   shift += 5;
  } while (byte >= 0x20);

  const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
  lat += deltaLat;

  result = 0;
  shift = 0;

  do {
   byte = encoded.charCodeAt(index++) - 63;
   result |= (byte & 0x1f) << shift;
   shift += 5;
  } while (byte >= 0x20);

  const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
  lng += deltaLng;

  coordinates.push({
   lat: lat / 1e5,
   lng: lng / 1e5,
  });
 }

 return coordinates;
}

function parseDurationSeconds(durationText) {
 if (typeof durationText !== "string") return null;

 const normalized = durationText.trim();
 if (!normalized.endsWith("s")) return null;

 const seconds = Number(normalized.slice(0, -1));
 return Number.isFinite(seconds) ? seconds : null;
}

export async function computeDriveRoutes({
 apiKey,
 origin,
 destination,
 travelMode = "DRIVE",
 alternatives = true,
}) {
 if (!apiKey || !origin || !destination) {
  return { ok: false, status: "INVALID_REQUEST", routes: [] };
 }

 const allowedModes = new Set([
  "DRIVE",
  "TWO_WHEELER",
  "TRANSIT",
  "WALK",
  "BICYCLE",
 ]);
 const requestedMode = allowedModes.has(travelMode) ? travelMode : "DRIVE";

 const runRequest = async ({ mode, withAlternatives }) => {
  const payload = {
   origin: {
    location: {
     latLng: {
      latitude: origin.lat,
      longitude: origin.lng,
     },
    },
   },
   destination: {
    location: {
     latLng: {
      latitude: destination.lat,
      longitude: destination.lng,
     },
    },
   },
   travelMode: mode,
   computeAlternativeRoutes: Boolean(withAlternatives),
   languageCode: "en-US",
   units: "METRIC",
  };

  if (mode === "DRIVE") {
   payload.routingPreference = "TRAFFIC_UNAWARE";
  }

  const response = await fetch(
   "https://routes.googleapis.com/directions/v2:computeRoutes",
   {
    method: "POST",
    headers: {
     "Content-Type": "application/json",
     "X-Goog-Api-Key": apiKey,
     "X-Goog-FieldMask":
      "routes.duration,routes.distanceMeters,routes.description,routes.polyline.encodedPolyline",
    },
    body: JSON.stringify(payload),
   },
  );

  const data = await response.json();

  if (!response.ok) {
   return {
    ok: false,
    status: data?.error?.status || String(response.status),
    routes: [],
   };
  }

  const rawRoutes = Array.isArray(data?.routes) ? data.routes : [];

  if (!rawRoutes.length) {
   return { ok: false, status: "ZERO_RESULTS", routes: [] };
  }

  const routes = rawRoutes.map((route, index) => {
   const distanceValue = Number(route?.distanceMeters) || null;
   const durationValue = parseDurationSeconds(route?.duration);

   return {
    id: `${index}-${route?.description || "route"}`,
    summary: route?.description || `Route ${index + 1}`,
    path: decodePolyline(route?.polyline?.encodedPolyline),
    distanceText: formatDistance(distanceValue),
    durationText: formatDuration(durationValue),
    distanceValue,
    durationValue,
   };
  });

  return { ok: true, status: "OK", routes };
 };

 try {
  let result = await runRequest({
   mode: requestedMode,
   withAlternatives: alternatives,
  });

  if (!result.ok && result.status === "ZERO_RESULTS" && alternatives) {
   result = await runRequest({ mode: requestedMode, withAlternatives: false });
  }

  if (
   !result.ok &&
   result.status === "ZERO_RESULTS" &&
   requestedMode !== "DRIVE"
  ) {
   result = await runRequest({ mode: "DRIVE", withAlternatives: alternatives });

   if (!result.ok && result.status === "ZERO_RESULTS" && alternatives) {
    result = await runRequest({ mode: "DRIVE", withAlternatives: false });
   }

   if (result.ok) {
    return {
     ...result,
     requestedTravelMode: requestedMode,
     effectiveTravelMode: "DRIVE",
    };
   }
  }

  if (result.ok) {
   return {
    ...result,
    requestedTravelMode: requestedMode,
    effectiveTravelMode: requestedMode,
   };
  }

  return {
   ...result,
   requestedTravelMode: requestedMode,
   effectiveTravelMode: requestedMode,
  };
 } catch {
  return {
   ok: false,
   status: "NETWORK_ERROR",
   routes: [],
   requestedTravelMode: requestedMode,
   effectiveTravelMode: requestedMode,
  };
 }
}
