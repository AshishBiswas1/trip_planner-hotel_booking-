"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function HotelDetailBackButton({ fallbackHref = "/hotels" }) {
 const router = useRouter();
 const pathname = usePathname();
 const searchParams = useSearchParams();

 const fromParam = searchParams?.get("from") || "";
 const decodedFromParam = fromParam ? decodeURIComponent(fromParam) : "";

 const storageKey = useMemo(
  () => `hotel-detail-origin:${pathname || "unknown"}`,
  [pathname],
 );

 useEffect(() => {
  if (typeof window === "undefined" || !pathname) {
   return;
  }

  let referrerUrl;

  try {
   referrerUrl = document.referrer ? new URL(document.referrer) : null;
  } catch {
   referrerUrl = null;
  }

  if (!referrerUrl || referrerUrl.origin !== window.location.origin) {
   return;
  }

  const referrerPath = `${referrerUrl.pathname}${referrerUrl.search}${referrerUrl.hash}`;
  const isRoomListReferrer = /\/hotels\/[^/]+\/rooms/.test(
   referrerUrl.pathname,
  );

  if (isRoomListReferrer || referrerUrl.pathname === pathname) {
   return;
  }

  sessionStorage.setItem(storageKey, referrerPath);
 }, [pathname, storageKey]);

 const handleBack = () => {
  if (typeof window !== "undefined") {
   if (decodedFromParam && decodedFromParam !== pathname) {
    router.push(decodedFromParam);
    return;
   }
   const rememberedOrigin = sessionStorage.getItem(storageKey);

   if (rememberedOrigin) {
    router.push(rememberedOrigin);
    return;
   }

   if (window.history.length > 1) {
    router.back();
    return;
   }
  }

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
