"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BedDouble, IndianRupee, Loader2, Users } from "lucide-react";
import { roomApi } from "@/lib/api";

function formatPrice(value) {
 const amount = Number(value);
 if (!Number.isFinite(amount)) return "N/A";

 return new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
 }).format(amount);
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

 return specials.slice(0, 2);
}

export default function RoomStrip({ hotelId, hotelSlug, filters = {} }) {
 const [rooms, setRooms] = useState([]);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState("");

 useEffect(() => {
  let isMounted = true;

  async function loadRooms() {
   if (!hotelId) {
    if (isMounted) {
     setRooms([]);
     setError("Hotel ID is missing.");
     setIsLoading(false);
    }
    return;
   }

   try {
    setIsLoading(true);
    setError("");

    const response = await roomApi.getByHotelId(hotelId, filters);
    const fetchedRooms = response?.data?.rooms ?? [];

    if (isMounted) {
     setRooms(fetchedRooms);
    }
   } catch (err) {
    if (isMounted) {
     setError(err?.message || "Failed to load rooms.");
    }
   } finally {
    if (isMounted) {
     setIsLoading(false);
    }
   }
  }

  loadRooms();

  return () => {
   isMounted = false;
  };
 }, [hotelId, filters]);

 if (isLoading) {
  return (
   <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
    <span className="inline-flex items-center gap-2">
     <Loader2 className="h-4 w-4 animate-spin" />
     Loading available rooms...
    </span>
   </div>
  );
 }

 if (error) {
  return (
   <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
    {error}
   </div>
  );
 }

 if (rooms.length === 0) {
  return (
   <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
    No rooms are available for this hotel right now.
   </div>
  );
 }

 return (
  <div id="room-strip" className="mt-6 space-y-4 pb-2">
   {rooms.map((room, index) => {
    const statusClasses = room.isBooked
     ? "bg-rose-50 text-rose-700 ring-rose-200"
     : "bg-emerald-50 text-emerald-700 ring-emerald-200";

    return (
     <motion.article
      key={room._id || `${room.hotel}-${room.roomNumber}`}
      initial={{ opacity: 0, y: 20, scale: 0.99 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
       duration: 0.42,
       ease: [0.22, 1, 0.36, 1],
       delay: Math.min(index * 0.025, 0.4),
      }}
      className="relative"
      style={{ zIndex: rooms.length - index }}
     >
      <Link
       href={
        hotelSlug && room?._id ? `/hotels/${hotelSlug}/rooms/${room._id}` : "#"
       }
       className="block"
      >
       <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-700/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:px-5 sm:py-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-cyan-400 to-emerald-400" />

        <div className="flex flex-col gap-3 pl-2 sm:flex-row sm:items-center sm:justify-between">
         <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
           Room Inventory
          </p>
          <h3 className="truncate text-xl font-black tracking-tight text-slate-900">
           Room {room.roomNumber}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-700 sm:text-sm">
           <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 font-semibold text-cyan-700">
            <BedDouble className="h-3.5 w-3.5" />
            {room.roomType || "Type N/A"}
           </span>
           <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-700">
            <Users className="h-3.5 w-3.5" />
            Capacity {Number.isFinite(room.capacity) ? room.capacity : "N/A"}
           </span>
           <span
            className={`inline-flex rounded-full px-2.5 py-1 font-semibold ring-1 ${statusClasses}`}
           >
            {room.isBooked ? "Booked" : "Available"}
           </span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
           <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            What's special:
           </span>
           {getRoomSpecials(room).map((special, specialIndex) => (
            <span
             key={`${room._id || room.roomNumber}-special-${specialIndex}`}
             className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
            >
             {special}
            </span>
           ))}
          </div>
         </div>

         <div className="inline-flex items-center gap-1 self-start rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xl font-black tracking-tight text-slate-800 sm:self-center">
          <IndianRupee className="h-5 w-5" />
          {formatPrice(room.price)}
         </div>
        </div>
       </div>
      </Link>
     </motion.article>
    );
   })}
  </div>
 );
}
