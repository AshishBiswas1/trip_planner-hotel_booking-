"use client";

import { useMemo } from "react";
import SharedGoogleMap from "@/components/hotel/SharedGoogleMap";

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };

function getHotelLatLng(hotel) {
 const coordinates = hotel?.location?.coordinates?.coordinates;

 if (!Array.isArray(coordinates) || coordinates.length !== 2) {
  return null;
 }

 const [lng, lat] = coordinates;

 if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
  return null;
 }

 return { lat, lng };
}

export default function NearbyHotelsGoogleMap({
 hotels = [],
 userLocation,
 radiusKm = 5,
 showSearchCircle = false,
 selectedHotelForRoute,
 onRouteStatusChange,
}) {
 const hotelMarkers = useMemo(() => {
  return hotels
   .map((hotel) => {
    const position = getHotelLatLng(hotel);

    if (!position) {
     return null;
    }

    return {
     id:
      hotel?._id ||
      hotel?.slug ||
      `${hotel?.name}-${position.lat}-${position.lng}`,
     name: hotel?.name || "Hotel",
     position,
    };
   })
   .filter(Boolean);
 }, [hotels]);

 const center = useMemo(() => {
  if (
   userLocation &&
   Number.isFinite(userLocation.lat) &&
   Number.isFinite(userLocation.lng)
  ) {
   return userLocation;
  }

  if (hotelMarkers.length > 0) {
   return hotelMarkers[0].position;
  }

  return DEFAULT_CENTER;
 }, [hotelMarkers, userLocation]);

 const markers = useMemo(() => {
  const parsedMarkers = hotelMarkers.map((marker) => ({
   ...marker,
   title: marker.name,
   variant: "hotel",
  }));

  if (
   userLocation &&
   Number.isFinite(userLocation.lat) &&
   Number.isFinite(userLocation.lng)
  ) {
   parsedMarkers.unshift({
    id: "user-location",
    title: "Your Location",
    position: userLocation,
    variant: "user",
   });
  }

  return parsedMarkers;
 }, [hotelMarkers, userLocation]);

 return (
  <SharedGoogleMap
   center={center}
   markers={markers}
   zoom={13}
   interactive
   autoFocusCenter={Boolean(userLocation)}
   autoFocusZoom={15}
   circleCenter={userLocation}
   circleRadiusKm={radiusKm}
   showCircle={showSearchCircle}
   routeOrigin={userLocation}
   routeDestination={selectedHotelForRoute?.position}
   showRoute={Boolean(selectedHotelForRoute && userLocation)}
   onRouteStatusChange={onRouteStatusChange}
   enableLiveUserTracking={false}
  />
 );
}
