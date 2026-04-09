"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
 MapPin,
 Star,
 BedDouble,
 Landmark,
 Sparkles,
 ArrowLeft,
 Search,
} from "lucide-react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { hotelApi } from "@/lib/api";

const ITEMS_PER_PAGE = 20;

function getHotelImage(hotel) {
 if (Array.isArray(hotel.images) && hotel.images.length > 0) {
  return hotel.images[0];
 }

 return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";
}

function formatPrice(pricePerNight) {
 const value = Number(pricePerNight);
 if (!Number.isFinite(value)) return "Price unavailable";

 return new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
 }).format(value);
}

function getShortDescription(description) {
 if (!description) {
  return "Comfort stay near top attractions.";
 }

 if (description.length <= 95) {
  return description;
 }

 return `${description.slice(0, 92)}...`;
}

function getPageRange(currentPage, totalItems) {
 if (totalItems === 0) {
  return { start: 0, end: 0 };
 }

 const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
 const end = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

 return { start, end };
}

export default function HotelStrips() {
 const [hotels, setHotels] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState("");
 const [searchTerm, setSearchTerm] = useState("");
 const [currentPage, setCurrentPage] = useState(1);

 useEffect(() => {
  let isMounted = true;

  async function loadHotels() {
   try {
    setIsLoading(true);
    setError("");

    const response = await hotelApi.getAll();
    const hotelList = response?.data?.data ?? [];

    if (isMounted) {
     setHotels(hotelList);
    }
   } catch (err) {
    if (isMounted) {
     setError(err?.message || "Failed to load hotels.");
    }
   } finally {
    if (isMounted) {
     setIsLoading(false);
    }
   }
  }

  loadHotels();

  return () => {
   isMounted = false;
  };
 }, []);

 const filteredHotels = useMemo(() => {
  const query = searchTerm.trim().toLowerCase();

  if (!query) {
   return hotels;
  }

  return hotels.filter((hotel) =>
   String(hotel?.name || "")
    .toLowerCase()
    .includes(query),
  );
 }, [hotels, searchTerm]);

 const totalPages = Math.max(
  Math.ceil(filteredHotels.length / ITEMS_PER_PAGE),
  1,
 );

 useEffect(() => {
  setCurrentPage(1);
 }, [searchTerm]);

 useEffect(() => {
  if (currentPage > totalPages) {
   setCurrentPage(totalPages);
  }
 }, [currentPage, totalPages]);

 const currentHotels = useMemo(() => {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  return filteredHotels.slice(startIndex, startIndex + ITEMS_PER_PAGE);
 }, [filteredHotels, currentPage]);

 const sectionHeight = useMemo(
  () => `${Math.max(currentHotels.length, 1) * 34}vh`,
  [currentHotels.length],
 );

 const pageRange = getPageRange(currentPage, filteredHotels.length);

 const getTilt = (index) => {
  const tiltPattern = [-1.25, 1.35, -1.05, 1.15];
  return tiltPattern[index % tiltPattern.length];
 };

 const handlePreviousPage = () => {
  setCurrentPage((page) => Math.max(page - 1, 1));
  window.scrollTo({ top: 0, behavior: "smooth" });
 };

 const handleNextPage = () => {
  setCurrentPage((page) => Math.min(page + 1, totalPages));
  window.scrollTo({ top: 0, behavior: "smooth" });
 };

 return (
  <main className="hotel-page-bg min-h-screen">
   <Header />

   <section className="relative px-4 pb-40 pt-10 sm:px-6 lg:px-8">
    <div className="hotel-page-overlay pointer-events-none absolute inset-0" />

    <motion.div
     initial={{ opacity: 0, y: 18 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.55, ease: "easeOut" }}
     className="relative mx-auto max-w-4xl"
    >
     <Link
      href="/"
      className="mb-4 inline-flex items-center gap-2 text-slate-600 transition-colors duration-300 hover:text-blue-500"
     >
      <ArrowLeft className="h-5 w-5" />
      <span className="font-medium">Back to Home</span>
     </Link>

     <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/60 bg-white/70 px-4 py-1.5 text-sm font-semibold text-slate-700 backdrop-blur">
      <Sparkles className="h-4 w-4 text-cyan-600" />
      Handpicked stays for your next trip
     </div>

     <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
      Hotel Collection
     </h1>
     <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
      Scroll to explore. Each strip stacks upward and takes the spotlight while
      the background stays in place.
     </p>

     <div className="mt-6 rounded-3xl border border-white/70 bg-white/80 p-3 shadow-lg shadow-slate-700/5 backdrop-blur sm:p-4">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-cyan-300 focus-within:bg-white">
       <Search className="h-5 w-5 text-slate-400" />
       <input
        type="text"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Search hotels by name"
        autoComplete="off"
        spellCheck={false}
        suppressHydrationWarning
        className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
       />
      </div>
     </div>
    </motion.div>

    {isLoading ? (
     <div className="relative mx-auto mt-16 max-w-5xl rounded-3xl border border-slate-200/80 bg-white/80 p-8 text-center text-slate-600 backdrop-blur">
      Loading hotels...
     </div>
    ) : null}

    {error ? (
     <div className="relative mx-auto mt-16 max-w-5xl rounded-3xl border border-rose-300 bg-rose-50/90 p-8 text-center text-rose-700 backdrop-blur">
      {error}
     </div>
    ) : null}

    {!isLoading && !error && hotels.length === 0 ? (
     <div className="relative mx-auto mt-16 max-w-5xl rounded-3xl border border-slate-200/80 bg-white/80 p-8 text-center text-slate-600 backdrop-blur">
      No hotels found right now.
     </div>
    ) : null}

    {!isLoading &&
    !error &&
    hotels.length > 0 &&
    filteredHotels.length === 0 ? (
     <div className="relative mx-auto mt-16 max-w-5xl rounded-3xl border border-slate-200/80 bg-white/80 p-8 text-center text-slate-600 backdrop-blur">
      No hotels match your search.
     </div>
    ) : null}

    {!isLoading && !error && filteredHotels.length > 0 ? (
     <>
      <div className="relative mx-auto mt-8 flex max-w-4xl items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-lg shadow-slate-700/5 backdrop-blur">
       <span>
        Showing {pageRange.start}-{pageRange.end} of {filteredHotels.length}
       </span>
       <span>
        Page {currentPage} of {totalPages}
       </span>
      </div>

      <div
       className="hotel-stack-list relative mx-auto mt-10 max-w-4xl"
       style={{ height: sectionHeight }}
      >
       {currentHotels.map((hotel, index) => {
        const tilt = getTilt(index);

        return (
         <motion.article
          key={hotel._id || `${hotel.slug || hotel.name}-${index}`}
          initial={{ opacity: 0, y: 55, scale: 0.98, rotate: tilt * 0.25 }}
          whileInView={{ opacity: 1, y: 0, scale: 1, rotate: tilt }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{
           duration: 0.55,
           ease: [0.22, 1, 0.36, 1],
           delay: index * 0.05,
          }}
          className="hotel-stack-card"
          style={{
           zIndex: index + 1,
           "--stack-shift": `${index % 2 === 0 ? -6 : 6}px`,
          }}
         >
          <div className="flex h-[120px] items-stretch overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-xl shadow-slate-700/10 backdrop-blur sm:h-[132px]">
           <div className="relative h-full w-[34%] sm:w-[30%] lg:w-[24%]">
            <Image
             src={getHotelImage(hotel)}
             alt={hotel.name || "Hotel"}
             fill
             sizes="(max-width: 1024px) 34vw, 24vw"
             className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/30 to-transparent" />
            <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-800 sm:text-xs">
             {formatPrice(hotel.pricePerNight)}
            </div>
           </div>

           <div className="flex min-w-0 flex-1 flex-col justify-between p-3 sm:p-4">
            <div>
             <h2 className="truncate text-base font-extrabold text-slate-900 sm:text-lg">
              {hotel.name}
             </h2>
             <p className="mt-1 truncate text-xs text-slate-600 sm:text-sm">
              {getShortDescription(hotel.description)}
             </p>

             <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-700 sm:gap-2 sm:text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-1 font-semibold text-cyan-700">
               <MapPin className="h-3.5 w-3.5" />
               {hotel?.location?.city || "City"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 font-semibold text-amber-700">
               <Star className="h-3.5 w-3.5" />
               {hotel?.rating ? `${hotel.rating}/5` : "No rating"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-1 font-semibold text-violet-700">
               <BedDouble className="h-3.5 w-3.5" />
               {Number.isFinite(hotel?.roomsAvailable)
                ? `${hotel.roomsAvailable} rooms`
                : "Room info pending"}
              </span>
             </div>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 sm:text-sm">
             <Landmark className="h-3.5 w-3.5" />
             <span>{hotel?.location?.country || "Country not available"}</span>
            </div>
           </div>
          </div>
         </motion.article>
        );
       })}
      </div>

      {totalPages > 1 ? (
       <div className="fixed inset-x-0 bottom-4 z-30 px-4 sm:bottom-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl shadow-slate-700/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
         <p className="text-sm text-slate-600">
          Page {currentPage} of {totalPages}
         </p>
         <div className="flex items-center gap-2">
          <button
           type="button"
           onClick={handlePreviousPage}
           disabled={currentPage === 1}
           className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
           Previous
          </button>
          <button
           type="button"
           onClick={handleNextPage}
           disabled={currentPage === totalPages}
           className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
           Next
          </button>
         </div>
        </div>
       </div>
      ) : null}
     </>
    ) : null}
   </section>

   <Footer />
  </main>
 );
}
