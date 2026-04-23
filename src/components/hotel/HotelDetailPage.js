import Image from "next/image";
import {
 BedDouble,
 IndianRupee,
 Landmark,
 MapPin,
 Quote,
 Star,
 Users,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HotelRoomBookingSection from "@/components/hotel/HotelRoomBookingSection";
import HotelDetailMap from "@/components/hotel/HotelDetailMap";
import HotelDetailBackButton from "@/components/hotel/HotelDetailBackButton";
import { hotelApi } from "@/lib/api";

const FALLBACK_HOTEL_IMAGES = [
 "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
 "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80",
 "https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1600&q=80",
];

function isLikelyValidImageUrl(value) {
 if (typeof value !== "string" || !value.trim()) return false;

 try {
  const parsed = new URL(value);
  const isHttps = parsed.protocol === "https:";
  const hasKnownHost =
   parsed.hostname === "images.unsplash.com" ||
   parsed.hostname === "res.cloudinary.com";

  if (!isHttps || !hasKnownHost) return false;

  if (parsed.hostname === "images.unsplash.com") {
   const unsplashPath = parsed.pathname || "";
   const unsplashPhotoId = unsplashPath.match(/\/photo-([a-zA-Z0-9_-]{10,})/);
   return Boolean(unsplashPhotoId);
  }

  return true;
 } catch {
  return false;
 }
}

function getHotelImages(hotel) {
 const validImages = Array.isArray(hotel?.images)
  ? hotel.images.filter(isLikelyValidImageUrl)
  : [];

 if (validImages.length > 0) return validImages;

 return FALLBACK_HOTEL_IMAGES;
}

function getOptimizedImageUrl(url, width = 1400, quality = 75) {
 if (!url) return url;

 // Optimize known CDN hosts without changing visual layout.
 if (url.includes("images.unsplash.com")) {
  try {
   const parsed = new URL(url);
   parsed.searchParams.set("auto", "format");
   parsed.searchParams.set("fit", "crop");
   parsed.searchParams.set("w", String(width));
   parsed.searchParams.set("q", String(quality));
   return parsed.toString();
  } catch {
   return url;
  }
 }

 if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
  const transformSegment = url.split("/upload/")[1] || "";

  if (
   transformSegment.startsWith("f_auto") ||
   transformSegment.startsWith("q_auto") ||
   transformSegment.startsWith("w_")
  ) {
   return url;
  }

  return url.replace("/upload/", `/upload/f_auto,q_auto:good,w_${width}/`);
 }

 return url;
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

function formatLocation(location) {
 return [location?.address, location?.city, location?.state, location?.country]
  .filter(Boolean)
  .join(", ");
}

function getMapStops(city) {
 const place = city || "City Center";

 return [
  { label: `Day 1: ${place} Arrival`, top: "18%", left: "14%" },
  { label: `Day 2: ${place} Market`, top: "42%", left: "34%" },
  { label: `Day 3: ${place} Highlights`, top: "58%", left: "56%" },
  { label: `Day 4: ${place} Leisure`, top: "36%", left: "76%" },
 ];
}

function getHotelCoordinates(hotel) {
 const coordinates = hotel?.location?.coordinates?.coordinates;

 if (!Array.isArray(coordinates) || coordinates.length !== 2) return null;

 const [lng, lat] = coordinates;
 if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;

 return [lng, lat];
}

function getGuestReviews(hotel) {
 const hotelName = hotel?.name || "this hotel";
 const city = hotel?.location?.city || "the city";

 return [
  {
   name: "Lourdes Browning",
   comment: `Great service and very smooth check-in. ${hotelName} made our stay in ${city} really comfortable.`,
  },
  {
   name: "Sophie Louise Hart",
   comment:
    "Rooms were clean, amenities were useful, and the location made local travel easy.",
  },
  {
   name: "Cristian Vega",
   comment:
    "Exactly what we expected from the listing. Helpful staff and good value for money.",
  },
 ];
}

export default async function HotelDetailPage({ slug }) {
 let hotel = null;
 let error = "";

 try {
  const response = await hotelApi.getBySlug(slug);
  hotel = response?.data?.data ?? null;
 } catch (err) {
  error = err?.message || "Failed to load hotel details.";
 }

 if (error) {
  return (
   <main className="hotel-page-bg min-h-screen">
    <Header />
    <section className="relative px-4 pb-20 pt-10 sm:px-6 lg:px-8">
     <div className="hotel-page-overlay pointer-events-none absolute inset-0" />
     <div className="relative mx-auto max-w-6xl">
      <div className="rounded-3xl border border-rose-300 bg-rose-50/90 p-8 text-center text-rose-700 backdrop-blur">
       {error}
      </div>
     </div>
    </section>
    <Footer />
   </main>
  );
 }

 if (!hotel) {
  return (
   <main className="hotel-page-bg min-h-screen">
    <Header />
    <section className="relative px-4 pb-20 pt-10 sm:px-6 lg:px-8">
     <div className="hotel-page-overlay pointer-events-none absolute inset-0" />
     <div className="relative mx-auto max-w-6xl">
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-8 text-center text-slate-600 backdrop-blur">
       Hotel not found.
      </div>
     </div>
    </section>
    <Footer />
   </main>
  );
 }

 const images = getHotelImages(hotel);
 const heroImage = getOptimizedImageUrl(images[0], 1400, 75);
 const galleryImages = images.map((img) => getOptimizedImageUrl(img, 900, 75));
 const locationLine = formatLocation(hotel?.location);
 const reviews = getGuestReviews(hotel);
 const city = hotel?.location?.city || "City";
 const mapStops = getMapStops(city);
 const hotelCoordinates = getHotelCoordinates(hotel);

 const repeatedReviews = [...reviews, ...reviews];

 return (
  <main className="hotel-page-bg min-h-screen">
   <Header />

   <section className="relative px-4 pb-20 pt-8 sm:px-6 lg:px-8">
    <div className="hotel-page-overlay pointer-events-none absolute inset-0" />

    <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/80 bg-white/25 shadow-xl shadow-slate-700/10 backdrop-blur">
     <div className="relative min-h-[280px] sm:min-h-[420px]">
      <Image
       src={heroImage}
       alt={hotel?.name || "Hotel"}
       fill
       sizes="(max-width: 1024px) 100vw, 1200px"
       priority
       loading="eager"
       fetchPriority="high"
       quality={75}
       className="object-cover"
      />
      <div className="absolute inset-0 bg-slate-900/45" />

      <div className="absolute left-6 top-6 z-10 sm:left-8 sm:top-8">
       <HotelDetailBackButton fallbackHref="/hotels" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 sm:p-10">
       <h1 className="max-w-4xl text-3xl font-black tracking-tight text-white drop-shadow sm:text-5xl">
        {hotel?.name}
       </h1>
       <p className="mt-2 max-w-2xl text-sm text-slate-100 sm:text-base">
        {hotel?.description || "No description available."}
       </p>
      </div>
     </div>
    </div>

    <div className="relative mx-auto mt-8 max-w-6xl">
     <section
      className="rounded-3xl border border-white/80 bg-white/90 shadow-xl shadow-slate-700/10 backdrop-blur"
      style={{
       clipPath: "polygon(0 8%, 100% 0, 100% 92%, 0 100%)",
      }}
     >
      <div className="grid gap-0 lg:grid-cols-2">
       <div className="border-b border-slate-200/70 px-6 pb-8 pt-12 lg:border-b-0 lg:border-r lg:px-10 lg:py-12">
        <h2 className="text-2xl font-extrabold text-emerald-600">
         Quick Facts
        </h2>
        <div className="mt-6 space-y-3 text-sm text-slate-700">
         <p className="flex items-center gap-2">
          <IndianRupee className="h-4 w-4 text-cyan-600" />
          <span className="font-semibold">Price:</span>{" "}
          {formatPrice(hotel?.pricePerNight)}
         </p>
         <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-cyan-600" />
          <span className="font-semibold">City:</span> {city}
         </p>
         <p className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-cyan-600" />
          <span className="font-semibold">Country:</span>{" "}
          {hotel?.location?.country || "Country not available"}
         </p>
         <p className="flex items-center gap-2">
          <Star className="h-4 w-4 text-cyan-600" />
          <span className="font-semibold">Rating:</span>{" "}
          {hotel?.rating ? `${hotel.rating}/5` : "No rating"}
         </p>
         <p className="flex items-center gap-2">
          <Users className="h-4 w-4 text-cyan-600" />
          <span className="font-semibold">Reviews:</span>{" "}
          {Number.isFinite(hotel?.totalReviews)
           ? hotel.totalReviews
           : "Review count unavailable"}
         </p>
         <p className="flex items-center gap-2">
          <BedDouble className="h-4 w-4 text-cyan-600" />
          <span className="font-semibold">Rooms:</span>{" "}
          {Number.isFinite(hotel?.roomsAvailable)
           ? `${hotel.roomsAvailable} available`
           : "Availability pending"}
         </p>
         <p className="rounded-xl border border-cyan-100 bg-cyan-50 p-3 text-cyan-900">
          <span className="font-semibold">Location:</span>{" "}
          {locationLine || "Address not available"}
         </p>
        </div>
       </div>

       <div className="px-6 pb-10 pt-10 lg:px-10 lg:py-12">
        <h2 className="text-2xl font-extrabold text-emerald-600">
         About {hotel?.name}
        </h2>
        <p className="mt-4 leading-8 text-slate-600">
         {hotel?.description || "No description available."}
        </p>
        <p className="mt-4 leading-8 text-slate-600">
         The property offers a balanced stay experience with comfort-focused
         rooms, convenient city access, and a service style that suits both
         short and long visits.
        </p>
       </div>
      </div>
     </section>

     <section
      className="mt-8 rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-slate-700/10 backdrop-blur"
      style={{ clipPath: "polygon(0 10%, 100% 0, 100% 90%, 0 100%)" }}
     >
      <h2 className="mb-4 text-2xl font-extrabold text-emerald-600">Images</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
       {galleryImages.slice(0, 6).map((img, index) => (
        <div
         key={`${img}-${index}`}
         className="relative h-44 overflow-hidden rounded-2xl"
        >
         <Image
          src={img}
          alt={`${hotel?.name || "Hotel"} image ${index + 1}`}
          fill
          sizes="(max-width: 1024px) 50vw, 33vw"
          loading={index === 0 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "auto"}
          priority={index === 0}
          className="object-cover"
         />
        </div>
       ))}
      </div>
     </section>

     <section
      className="mt-8 rounded-3xl border border-white/80 bg-emerald-500/90 px-7 pb-8 pt-12 shadow-xl shadow-slate-700/10 sm:px-8 sm:pb-8 sm:pt-14"
      style={{ clipPath: "polygon(0 5%, 100% 0, 100% 92%, 0 100%)" }}
     >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
       <h2 className="text-3xl font-extrabold text-white">Map</h2>
       <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-100">
        Route Overview
       </p>
      </div>

      <HotelDetailMap hotelCoordinates={hotelCoordinates} zoom={13} />
     </section>

     <section
      className="mt-8 overflow-hidden rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-slate-700/10 backdrop-blur"
      style={{ clipPath: "polygon(0 10%, 100% 0, 100% 92%, 0 100%)" }}
     >
      <h2 className="mb-4 text-2xl font-extrabold text-emerald-600">Reviews</h2>
      <div className="review-marquee-track">
       {repeatedReviews.map((review, index) => (
        <article
         key={`${review.name}-${index}`}
         className="review-card inline-flex w-[280px] flex-none flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
         <div className="flex items-center gap-2 text-cyan-600">
          <Quote className="h-4 w-4" />
          <h3 className="text-sm font-bold text-slate-800">{review.name}</h3>
         </div>
         <p className="mt-2 text-sm leading-7 text-slate-600">
          {review.comment}
         </p>
         <div className="mt-3 flex items-center gap-1 text-emerald-500">
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
         </div>
        </article>
       ))}
      </div>
     </section>

     <HotelRoomBookingSection hotel={hotel} />
    </div>
   </section>

   <Footer />
  </main>
 );
}
