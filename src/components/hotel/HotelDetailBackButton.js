"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function HotelDetailBackButton({ fallbackHref = "/" }) {
 const router = useRouter();

 const handleBack = () => {
  router.push(fallbackHref);
 };

 return (
  <button
   type="button"
   onClick={handleBack}
   className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/30"
  >
   <ArrowLeft className="h-4 w-4" />
   Back
  </button>
 );
}
