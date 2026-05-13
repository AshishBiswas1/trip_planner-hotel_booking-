"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
 ArrowLeft,
 BadgeCheck,
 BedDouble,
 IndianRupee,
 MapPin,
 ShieldCheck,
 Sparkles,
 Users,
} from "lucide-react";
import Footer from "@/components/Footer";
import RoomBookingModal from "@/components/hotel/RoomBookingModal";
import { hotelApi, roomApi } from "@/lib/api";

function formatPrice(value) {
 const amount = Number(value);
 if (!Number.isFinite(amount)) return "N/A";

 return new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
 }).format(amount);
}

function getRoomImage(room) {
 const fallback =
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1600&q=80";

 const image = Array.isArray(room?.images) ? room.images[0] : undefined;
 if (typeof image !== "string") return fallback;

 const trimmed = image.trim();
 if (!trimmed) return fallback;

 // next/image ultimately relies on URL parsing; guard against values like "null", "undefined", or malformed strings.
 try {
  // Accept absolute URLs, and also protocol-relative URLs.
  // If it's not a valid URL, we'll fall back.
  // eslint-disable-next-line no-new
  new URL(trimmed.startsWith("//") ? `https:${trimmed}` : trimmed);

  // Ensure we return an absolute URL string. Convert protocol-relative
  // values ("//foo...") to https-prefixed strings so Next's Image
  // default loader can construct valid URLs.
  return trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
 } catch {
  return fallback;
 }
}

function getRoomSpecials(room) {
 const specials = [];
 const amenities = Array.isArray(room?.amenities) ? room.amenities : [];

 if (amenities.length > 0) {
  specials.push(`Includes ${amenities.slice(0, 3).join(", ")}`);
 }

 const roomTypeSpecial = {
  Suite: "Spacious suite-style layout",
  Deluxe: "Premium comfort with upgraded interior",
  Double: "Balanced setup for two guests",
  Single: "Cozy layout for solo travelers",
 };

 if (roomTypeSpecial[room?.roomType]) {
  specials.push(roomTypeSpecial[room.roomType]);
 }

 if (Number.isFinite(room?.capacity)) {
  specials.push(
   `Designed for up to ${room.capacity} guest${room.capacity > 1 ? "s" : ""}`,
  );
 }

 specials.push(
  room?.isBooked
   ? "Popular room currently reserved"
   : "Ready for immediate booking",
 );

 return specials.slice(0, 4);
}

export default function RoomDetailPage({ slug, roomId }) {
 const [hotel, setHotel] = useState(null);
 const [room, setRoom] = useState(null);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState("");
 const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

 useEffect(() => {
  let isMounted = true;

  async function loadData() {
   try {
    setIsLoading(true);
    setError("");

    const hotelResponse = await hotelApi.getBySlug(slug);
    const fetchedHotel = hotelResponse?.data?.data ?? null;

    if (!fetchedHotel?._id) {
     throw new Error("Hotel not found.");
    }

    const roomResponse = await roomApi.getById(fetchedHotel._id, roomId);
    const fetchedRoom = roomResponse?.data?.room ?? null;

    if (!fetchedRoom) {
     throw new Error("Room not found.");
    }

    if (isMounted) {
     setHotel(fetchedHotel);
     setRoom(fetchedRoom);
    }
   } catch (err) {
    if (isMounted) {
     setError(err?.message || "Failed to load room details.");
    }
   } finally {
    if (isMounted) {
     setIsLoading(false);
    }
   }
  }

  loadData();

  return () => {
   isMounted = false;
  };
 }, [slug, roomId]);

 const roomSpecials = useMemo(() => getRoomSpecials(room), [room]);
 const heroImage = getRoomImage(room);
 const amenities = Array.isArray(room?.amenities) ? room.amenities : [];

 if (isLoading) {
  return (
   <main className="hotel-page-bg min-h-screen">
    <section className="relative px-4 pb-20 pt-10 sm:px-6 lg:px-8">
     <div className="hotel-page-overlay pointer-events-none absolute inset-0" />
     <div className="relative mx-auto max-w-6xl rounded-3xl border border-slate-200/80 bg-white/80 p-8 text-center text-slate-600 backdrop-blur">
      Loading room details...
     </div>
    </section>
    <Footer />
   </main>
  );
 }

 if (error) {
  return (
   <main className="hotel-page-bg min-h-screen">
    <section className="relative px-4 pb-20 pt-10 sm:px-6 lg:px-8">
     <div className="hotel-page-overlay pointer-events-none absolute inset-0" />
     <div className="relative mx-auto max-w-6xl rounded-3xl border border-rose-300 bg-rose-50/90 p-8 text-center text-rose-700 backdrop-blur">
      {error}
     </div>
    </section>
    <Footer />
   </main>
  );
 }

 return (
  <>
   <main className="hotel-page-bg min-h-screen">
    <section className="relative px-4 pb-20 pt-8 sm:px-6 lg:px-8">
     <div className="hotel-page-overlay pointer-events-none absolute inset-0" />

     <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/80 bg-white/25 shadow-xl shadow-slate-700/10 backdrop-blur">
      <div className="relative min-h-[280px] sm:min-h-[420px]">
       <Image
        src={heroImage}
        alt={`Room ${room?.roomNumber || "details"}`}
        fill
        sizes="(max-width: 1024px) 100vw, 1200px"
        priority
        className="object-cover"
       />
       <div className="absolute inset-0 bg-slate-900/45" />

       <div className="absolute left-6 top-6 z-10 sm:left-8 sm:top-8">
        <Link
         href="/"
         className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/30"
        >
         <ArrowLeft className="h-4 w-4" />
         Back to Home
        </Link>
       </div>

       <div className="absolute bottom-0 left-0 right-0 z-10 p-6 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
         <div>
          <p className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/95 backdrop-blur">
           <Sparkles className="h-3.5 w-3.5" />
           Premium Stay Unit
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white drop-shadow sm:text-5xl">
           Room {room?.roomNumber}
          </h1>
          <p className="mt-2 text-sm text-slate-100 sm:text-base">
           {hotel?.name || "Hotel"} • {hotel?.location?.city || "City"}
          </p>
         </div>

         <button
          type="button"
          onClick={() => setIsBookingModalOpen(true)}
          className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 sm:self-auto"
         >
          <ShieldCheck className="h-4 w-4" />
          Book Room
         </button>
        </div>
       </div>
      </div>
     </div>

     <div className="relative mx-auto mt-8 max-w-6xl grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-slate-700/10 backdrop-blur sm:p-8">
       <h2 className="text-2xl font-extrabold text-emerald-600">
        Room Highlights
       </h2>
       <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {roomSpecials.map((special, index) => (
         <div
          key={`${special}-${index}`}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
         >
          {special}
         </div>
        ))}
       </div>

       {amenities.length > 0 ? (
        <div className="mt-6">
         <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
          Included Amenities
         </h3>
         <div className="mt-3 flex flex-wrap gap-2">
          {amenities.map((amenity, index) => (
           <span
            key={`${amenity}-${index}`}
            className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700"
           >
            {amenity}
           </span>
          ))}
         </div>
        </div>
       ) : null}
      </section>

      <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-slate-700/10 backdrop-blur sm:p-8">
       <h2 className="text-2xl font-extrabold text-emerald-600">Quick Facts</h2>
       <div className="mt-5 space-y-3 text-sm text-slate-700">
        <p className="flex items-center gap-2">
         <BedDouble className="h-4 w-4 text-cyan-600" />
         <span className="font-semibold">Type:</span> {room?.roomType || "N/A"}
        </p>
        <p className="flex items-center gap-2">
         <Users className="h-4 w-4 text-cyan-600" />
         <span className="font-semibold">Capacity:</span>{" "}
         {Number.isFinite(room?.capacity) ? room.capacity : "N/A"}
        </p>
        <p className="flex items-center gap-2">
         <IndianRupee className="h-4 w-4 text-cyan-600" />
         <span className="font-semibold">Price:</span>{" "}
         {formatPrice(room?.price)}
        </p>
        <p className="flex items-center gap-2">
         <BadgeCheck className="h-4 w-4 text-cyan-600" />
         <span className="font-semibold">Status:</span>{" "}
         {room?.isBooked ? "Booked" : "Available"}
        </p>
        <p className="rounded-xl border border-cyan-100 bg-cyan-50 p-3 text-cyan-900">
         <span className="font-semibold inline-flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          Hotel:
         </span>{" "}
         {hotel?.name || "Hotel not available"}
        </p>
       </div>
      </section>
     </div>
    </section>

    <Footer />
   </main>

   <RoomBookingModal
    isOpen={isBookingModalOpen}
    onClose={() => setIsBookingModalOpen(false)}
    room={room}
    hotel={hotel}
   />
  </>
 );
}
