"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, BedDouble, MapPin } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RoomStrip from "@/components/hotel/RoomStrip";
import { hotelApi } from "@/lib/api";

export default function RoomStripsPage({ slug }) {
 const searchParams = useSearchParams();
 const fromParam = searchParams?.get("from") || "";

 const [hotel, setHotel] = useState(null);
 const [isLoadingHotel, setIsLoadingHotel] = useState(true);
 const [error, setError] = useState("");
 const [roomTypeFilter, setRoomTypeFilter] = useState("");
 const [maxPriceFilter, setMaxPriceFilter] = useState("");
 const [minCapacityFilter, setMinCapacityFilter] = useState("");
 const [availabilityFilter, setAvailabilityFilter] = useState("all");

 useEffect(() => {
  let isMounted = true;

  async function loadHotel() {
   try {
    setIsLoadingHotel(true);
    setError("");

    const response = await hotelApi.getBySlug(slug);
    const fetchedHotel = response?.data?.data ?? null;

    if (isMounted) {
     setHotel(fetchedHotel);
    }
   } catch (err) {
    if (isMounted) {
     setError(err?.message || "Failed to load hotel information.");
    }
   } finally {
    if (isMounted) {
     setIsLoadingHotel(false);
    }
   }
  }

  loadHotel();

  return () => {
   isMounted = false;
  };
 }, [slug]);

 const roomFilters = useMemo(() => {
  const filters = {
   sort: "price",
  };

  if (roomTypeFilter) {
   filters.roomType = roomTypeFilter;
  }

  if (maxPriceFilter) {
   filters["price[lte]"] = maxPriceFilter;
  }

  if (minCapacityFilter) {
   filters["capacity[gte]"] = minCapacityFilter;
  }

  if (availabilityFilter === "available") {
   filters.isBooked = false;
  }

  if (availabilityFilter === "booked") {
   filters.isBooked = true;
  }

  return filters;
 }, [roomTypeFilter, maxPriceFilter, minCapacityFilter, availabilityFilter]);

 return (
  <main className="hotel-page-bg min-h-screen">
   <Header />

   <section className="relative px-4 pb-16 pt-8 sm:px-6 lg:px-8">
    <div className="hotel-page-overlay pointer-events-none absolute inset-0" />

    <div className="relative mx-auto max-w-6xl">
     <Link
      href={`/hotels/${slug}${
       fromParam ? `?from=${encodeURIComponent(fromParam)}` : ""
      }`}
      className="mb-4 inline-flex items-center gap-2 text-slate-600 transition-colors duration-300 hover:text-blue-500"
     >
      <ArrowLeft className="h-5 w-5" />
      <span className="font-medium">Back to Hotel</span>
     </Link>

     <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-slate-700/10 backdrop-blur sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
       <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
         <BedDouble className="h-3.5 w-3.5" />
         Room Collection
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
         {isLoadingHotel
          ? "Loading rooms..."
          : `Rooms at ${hotel?.name || "this hotel"}`}
        </h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
         Explore live room inventory, pricing, and availability fetched from
         backend.
        </p>
       </div>

       {hotel?.location?.city ? (
        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
         <MapPin className="h-4 w-4" />
         {hotel.location.city}
        </div>
       ) : null}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2 lg:grid-cols-4">
       <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
        Room Type
        <select
         value={roomTypeFilter}
         onChange={(event) => setRoomTypeFilter(event.target.value)}
         className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
        >
         <option value="">All</option>
         <option value="Single">Single</option>
         <option value="Double">Double</option>
         <option value="Suite">Suite</option>
         <option value="Deluxe">Deluxe</option>
        </select>
       </label>

       <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
        Max Price (INR)
        <input
         type="number"
         min="0"
         value={maxPriceFilter}
         onChange={(event) => setMaxPriceFilter(event.target.value)}
         placeholder="Any"
         className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
        />
       </label>

       <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
        Min Capacity
        <select
         value={minCapacityFilter}
         onChange={(event) => setMinCapacityFilter(event.target.value)}
         className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
        >
         <option value="">Any</option>
         <option value="1">1+</option>
         <option value="2">2+</option>
         <option value="3">3+</option>
         <option value="4">4+</option>
         <option value="5">5+</option>
        </select>
       </label>

       <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
        Availability
        <select
         value={availabilityFilter}
         onChange={(event) => setAvailabilityFilter(event.target.value)}
         className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
        >
         <option value="all">All</option>
         <option value="available">Available</option>
         <option value="booked">Booked</option>
        </select>
       </label>
      </div>

      {error ? (
       <div className="mt-5 rounded-2xl border border-rose-300 bg-rose-50/90 p-5 text-sm text-rose-700">
        {error}
       </div>
      ) : null}

      {!error && hotel?._id ? (
       <RoomStrip hotelId={hotel._id} hotelSlug={slug} filters={roomFilters} />
      ) : null}
     </div>
    </div>
   </section>

   <Footer />
  </main>
 );
}
