"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, BedDouble } from "lucide-react";

function getHotelImage(hotel) {
 const fallbackImage =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";

 if (!Array.isArray(hotel?.images) || hotel.images.length === 0) {
  return fallbackImage;
 }

 const validImage = hotel.images.find((imageUrl) => {
  if (typeof imageUrl !== "string" || !imageUrl.trim()) {
   return false;
  }

  try {
   const parsed = new URL(imageUrl);

   if (parsed.protocol !== "https:") {
    return false;
   }

   return ["images.unsplash.com", "res.cloudinary.com"].includes(
    parsed.hostname,
   );
  } catch {
   return false;
  }
 });

 return validImage || fallbackImage;
}

function getShortDescription(description) {
 if (!description) {
  return "Comfort stay near top attractions.";
 }

 if (description.length <= 110) {
  return description;
 }

 return `${description.slice(0, 107)}...`;
}

export default function HotelStrip({
 hotel,
 onCardClick,
 showBookButton = false,
 bookHref,
}) {
 const hotelHref = hotel?.slug ? `/hotels/${hotel.slug}` : null;
 const finalBookHref = bookHref || hotelHref;
 const isRouteCard = typeof onCardClick === "function";

 if (!hotelHref) {
  return null;
 }

 const cardContent = (
  <article className="flex min-h-[122px] items-stretch">
   <div className="relative w-[34%] sm:w-[30%] lg:w-[24%]">
    <Image
     src={getHotelImage(hotel)}
     alt={hotel?.name || "Hotel"}
     fill
     className="object-cover"
     sizes="(max-width: 640px) 40vw, (max-width: 1024px) 30vw, 22vw"
    />
   </div>

   <div className="flex w-full flex-col justify-between gap-2 px-4 py-3">
    <div>
     <h3 className="line-clamp-1 text-base font-bold text-slate-900 sm:text-lg">
      {hotel?.name || "Hotel"}
     </h3>
     <p className="mt-1 line-clamp-2 text-sm text-slate-600">
      {getShortDescription(hotel?.description)}
     </p>
    </div>

    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600 sm:text-sm">
     <span className="inline-flex items-center gap-1.5">
      <MapPin className="h-4 w-4 text-cyan-600" />
      {hotel?.location?.city || "Unknown city"}
     </span>

     <span className="inline-flex items-center gap-1.5">
      <Star className="h-4 w-4 text-amber-500" />
      {Number.isFinite(hotel?.rating) ? hotel.rating.toFixed(1) : "N/A"}
     </span>

     <span className="inline-flex items-center gap-1.5">
      <BedDouble className="h-4 w-4 text-emerald-600" />
      {hotel?.roomsAvailable ?? 0} rooms
     </span>

     {Number.isFinite(hotel?.distance) ? (
      <span className="ml-auto rounded-full bg-cyan-50 px-2.5 py-1 text-cyan-800">
       {hotel.distance.toFixed(1)} km away
      </span>
     ) : null}

     {showBookButton && finalBookHref ? (
      <Link
       href={finalBookHref}
       onClickCapture={(event) => event.stopPropagation()}
       onClick={(event) => event.stopPropagation()}
       className="ml-auto inline-flex min-h-9 items-center justify-center rounded-xl border border-emerald-500 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      >
       Book Room
      </Link>
     ) : null}
    </div>
   </div>
  </article>
 );

 if (isRouteCard) {
  return (
   <div
    role="button"
    tabIndex={0}
    onClick={() => onCardClick(hotel)}
    onKeyDown={(event) => {
     if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onCardClick(hotel);
     }
    }}
    className="group block cursor-pointer overflow-hidden rounded-2xl border border-white/75 bg-white/90 shadow-lg shadow-slate-800/10 transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
   >
    {cardContent}
   </div>
  );
 }

 return (
  <Link
   href={hotelHref}
   className="group block overflow-hidden rounded-2xl border border-white/75 bg-white/90 shadow-lg shadow-slate-800/10 transition hover:-translate-y-0.5 hover:shadow-xl"
  >
   {cardContent}
  </Link>
 );
}
