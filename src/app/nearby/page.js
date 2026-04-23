"use client";

import { useEffect, useState } from "react";
import { LocateFixed, Search, SlidersHorizontal } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HotelStrip from "@/components/hotel/HotelStrip";
import NearbyHotelsGoogleMap from "@/components/hotel/NearbyHotelsGoogleMap";
import { hotelApi } from "@/lib/api";

async function getCurrentLocation() {
 if (typeof window === "undefined" || !navigator?.geolocation) {
  throw new Error("Geolocation is not supported by your browser.");
 }

 return new Promise((resolve, reject) => {
  navigator.geolocation.getCurrentPosition(
   (position) => {
    resolve({
     lat: position.coords.latitude,
     lng: position.coords.longitude,
    });
   },
   () => {
    reject(
     new Error("Unable to access your location. Please allow location access."),
    );
   },
   {
    enableHighAccuracy: false,
    timeout: 8000,
    maximumAge: 30000,
   },
  );
 });
}

export default function NearbyHotelsPage() {
 const [distance, setDistance] = useState(5);
 const [location, setLocation] = useState(null);
 const [hotels, setHotels] = useState([]);
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState("");
 const [routeError, setRouteError] = useState("");
 const [hasFetchedHotels, setHasFetchedHotels] = useState(false);
 const [selectedHotelForRoute, setSelectedHotelForRoute] = useState(null);

 const getHotelLatLng = (hotel) => {
  const coordinates = hotel?.location?.coordinates?.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
   return null;
  }

  const [lng, lat] = coordinates;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
   return null;
  }

  return { lat, lng };
 };

 useEffect(() => {
  if (typeof window === "undefined" || !navigator?.geolocation) {
   setError("Geolocation is not supported by your browser.");
   return;
  }

  const watchId = navigator.geolocation.watchPosition(
   (position) => {
    setLocation({
     lat: position.coords.latitude,
     lng: position.coords.longitude,
    });
   },
   () => {
    // Keep this non-blocking. User can still trigger location manually.
   },
   {
    enableHighAccuracy: false,
    timeout: 12000,
    maximumAge: 15000,
   },
  );

  return () => {
   navigator.geolocation.clearWatch(watchId);
  };
 }, []);

 const fetchNearbyHotels = async ({ refreshLocation = false } = {}) => {
  try {
   setIsLoading(true);
   setError("");

   let currentLocation = location;

   if (refreshLocation || !currentLocation) {
    try {
     const liveLocation = await getCurrentLocation();
     currentLocation = liveLocation;
     setLocation(liveLocation);
    } catch {
     if (!currentLocation) {
      throw new Error(
       "Unable to access your location. Please allow location access and try again.",
      );
     }
    }
   }

   const response = await hotelApi.getNearby({
    location: `${currentLocation.lat},${currentLocation.lng}`,
    distance,
   });

   setHotels(response?.data?.hotels ?? []);
   setSelectedHotelForRoute(null);
   setRouteError("");
   setHasFetchedHotels(true);
  } catch (err) {
   setError(err?.message || "Failed to fetch nearby hotels.");
  } finally {
   setIsLoading(false);
  }
 };

 const handleUseCurrentLocation = async () => {
  try {
   setError("");
   const liveLocation = await getCurrentLocation();
   setLocation(liveLocation);
  } catch (err) {
   setError(err?.message || "Failed to update your current location.");
  }
 };

 const handleFindHotels = async () => {
  await fetchNearbyHotels({ refreshLocation: false });
 };

 const handleTripSelect = (hotel) => {
  const position = getHotelLatLng(hotel);

  if (!position) {
   return;
  }

  setSelectedHotelForRoute({
   id: hotel?._id || hotel?.slug || hotel?.name,
   name: hotel?.name || "Selected Hotel",
   slug: hotel?.slug,
   position,
  });

  setRouteError("");
 };

 return (
  <main className="hotel-page-bg min-h-screen">
   <Header />

   <section className="hotel-page-overlay px-4 pb-14 pt-8 sm:px-6 lg:px-8">
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
     <div className="overflow-hidden rounded-3xl border border-white/75 bg-gradient-to-br from-slate-100 to-cyan-50 shadow-xl shadow-slate-900/10">
      <div className="h-[380px] sm:h-[500px]">
       <NearbyHotelsGoogleMap
        hotels={hotels}
        userLocation={location}
        radiusKm={distance}
        showSearchCircle={hasFetchedHotels}
        selectedHotelForRoute={selectedHotelForRoute}
        onRouteStatusChange={setRouteError}
       />
      </div>
     </div>

     <div className="rounded-3xl border border-white/80 bg-white/85 p-4 shadow-xl shadow-slate-900/10 backdrop-blur sm:p-5">
      <div className="mb-3">
       <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
        Instant Booking Nearby
       </h1>
       <p className="mt-1 text-sm text-slate-600">
        Choose a radius, use your current location, and find hotels inside that
        search circle.
       </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
       <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5">
        <SlidersHorizontal className="h-3.5 w-3.5 text-slate-600" />
        <span className="text-xs font-semibold text-slate-700">Radius</span>
        <input
         type="number"
         min="1"
         max="100"
         value={distance}
         onChange={(event) => setDistance(Number(event.target.value) || 5)}
         suppressHydrationWarning
         className="w-14 rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-800 outline-none"
        />
        <span className="text-xs font-semibold text-slate-500">km</span>
       </label>

       <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={isLoading}
        suppressHydrationWarning
        className="inline-flex items-center gap-2 rounded-full border border-cyan-300 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 shadow-sm transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-70"
       >
        <>
         <LocateFixed className="h-4 w-4" />
         Use Current Location
        </>
       </button>

       <button
        type="button"
        onClick={handleFindHotels}
        disabled={isLoading}
        suppressHydrationWarning
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-600 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-70"
       >
        {isLoading ? (
         <>
          <Search className="h-4 w-4 animate-pulse" />
          Finding Hotels...
         </>
        ) : (
         <>
          <Search className="h-4 w-4" />
          Find Hotels
         </>
        )}
       </button>
      </div>

      {location ? (
       <p className="mt-3 text-xs text-slate-600">
        Current location: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
       </p>
      ) : null}
     </div>

     <div className="space-y-4 rounded-3xl border border-white/80 bg-white/85 p-4 shadow-xl shadow-slate-900/10 backdrop-blur sm:p-5">
      <div className="flex items-center justify-between gap-2">
       <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
        Hotels In Radius
       </h2>
       <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
        {hotels.length} found
       </span>
      </div>

      {error ? (
       <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error}
       </div>
      ) : null}

      {routeError ? (
       <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {routeError}
       </div>
      ) : null}

      {!isLoading && !error && hotels.length === 0 ? (
       <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
        No nearby hotels yet. Click "Find Hotels" to search.
       </div>
      ) : null}

      <div className="space-y-3">
       {hotels.map((hotel) => (
        <HotelStrip
         key={hotel._id || hotel.slug}
         hotel={hotel}
         onCardClick={handleTripSelect}
         showBookButton
         bookHref={
          hotel?.slug
           ? `/hotels/${hotel.slug}?from=${encodeURIComponent("/nearby")}`
           : undefined
         }
        />
       ))}
      </div>
     </div>
    </div>
   </section>

   <Footer />
  </main>
 );
}
