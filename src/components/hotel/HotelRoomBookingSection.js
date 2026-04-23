"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export default function HotelRoomBookingSection({ hotel }) {
 const searchParams = useSearchParams();
 const fromParam = searchParams?.get("from") || "";

 const amenities = Array.isArray(hotel?.amenities)
  ? hotel.amenities.slice(0, 10)
  : [];
 const hotelRoomsHref = hotel?.slug
  ? `/hotels/${hotel.slug}/rooms${
     fromParam ? `?from=${encodeURIComponent(fromParam)}` : ""
    }`
  : "/hotels";

 return (
  <section
   className="mt-8 rounded-3xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-emerald-50 p-6 shadow-xl shadow-slate-700/10"
   style={{ clipPath: "polygon(0 12%, 100% 0, 100% 100%, 0 100%)" }}
  >
   <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
    <div>
     <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
      Room Booking
     </h2>
     <p className="mt-2 text-sm text-slate-600">
      Tap the button to view live room availability for this hotel.
     </p>
    </div>
    <Link
     href={hotelRoomsHref}
     className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
    >
     <ShieldCheck className="h-4 w-4" />
     Book Room
    </Link>
   </div>

   {amenities.length > 0 ? (
    <div className="mt-5 flex flex-wrap gap-2">
     {amenities.map((amenity, index) => (
      <span
       key={`${amenity}-${index}`}
       className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700"
      >
       {amenity}
      </span>
     ))}
    </div>
   ) : null}
  </section>
 );
}
