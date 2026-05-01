"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, LoaderCircle, ShieldCheck } from "lucide-react";
import { paymentApi } from "@/lib/api";

const modeLabels = {
 flights: { title: "Flight Checkout", accent: "from-sky-500 to-cyan-500" },
 trains: { title: "Train Checkout", accent: "from-emerald-500 to-teal-500" },
 buses: { title: "Bus Checkout", accent: "from-orange-500 to-rose-500" },
};

const modeRoutes = {
 flights: "/",
 trains: "/",
 buses: "/",
};

export default function TravelCheckoutPage() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const [paymentMethod, setPaymentMethod] = useState("upi");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");

 const travel = useMemo(
  () => ({
   mode: searchParams.get("mode") || "flights",
   optionId: searchParams.get("optionId") || "",
   provider: searchParams.get("provider") || "",
   from: searchParams.get("from") || "",
   to: searchParams.get("to") || "",
   passengers: searchParams.get("passengers") || "1",
   travelDate: searchParams.get("travelDate") || "",
   totalPrice: searchParams.get("totalPrice") || "0",
  }),
  [searchParams],
 );

 const label = modeLabels[travel.mode] || modeLabels.flights;

 const handlePay = async () => {
  setError("");
  setLoading(true);

  try {
   const response = await paymentApi.createTravelPayment({
    travelMode: travel.mode,
    optionId: travel.optionId,
    provider: travel.provider,
    from: travel.from,
    to: travel.to,
    passengers: Number(travel.passengers),
    travelDate: travel.travelDate,
    totalPrice: Number(travel.totalPrice),
    paymentMethod,
    returnUrl: window.location.href,
   });

   if (response?.data?.paymentUrl) {
    window.location.href = response.data.paymentUrl;
    return;
   }

   throw new Error("Payment link was not created.");
  } catch (requestError) {
   setError(requestError?.message || "Unable to create payment.");
  } finally {
   setLoading(false);
  }
 };

 return (
  <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.2),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_28%),linear-gradient(180deg,_#f9fdff_0%,_#eefbf5_100%)] py-8 sm:py-12">
   <section className="container relative mx-auto px-4">
    <Link
     href={modeRoutes[travel.mode] || "/"}
     className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-x-0.5 hover:border-cyan-300 hover:text-cyan-700"
    >
     <ArrowLeft className="h-4 w-4" />
     Back to Home
    </Link>

    <motion.div
     initial={{ opacity: 0, y: 16 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.45 }}
     className="overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-2xl shadow-slate-900/10 backdrop-blur"
    >
     <div
      className={`bg-gradient-to-r ${label.accent} px-6 py-8 text-white sm:px-10`}
     >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">
       Payment
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
       {label.title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-white/90 sm:text-base">
       Review your trip details and complete payment to receive the confirmation
       link.
      </p>
     </div>

     <div className="grid gap-6 p-5 sm:grid-cols-[1.2fr_0.8fr] sm:p-8">
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
       <h2 className="text-lg font-bold text-slate-900">Trip summary</h2>
       <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <SummaryItem label="From" value={travel.from} />
        <SummaryItem label="To" value={travel.to} />
        <SummaryItem label="Passengers" value={travel.passengers} />
        <SummaryItem label="Date" value={travel.travelDate} />
       </div>
       <div className="rounded-2xl bg-cyan-50 px-4 py-4 ring-1 ring-cyan-100">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
         Route
        </p>
        <p className="mt-1 text-base font-bold text-slate-900">
         {travel.from || "-"} → {travel.to || "-"}
        </p>
        <p className="mt-1 text-sm text-slate-600">
         Only the route span between the selected start and destination is
         shown.
        </p>
       </div>
       <div className="rounded-2xl bg-slate-900 px-4 py-4 text-white">
        <p className="text-xs uppercase tracking-[0.18em] text-white/70">
         Total price
        </p>
        <p className="mt-1 text-2xl font-black">Rs {travel.totalPrice}</p>
       </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
       <h2 className="text-lg font-bold text-slate-900">Payment method</h2>

       {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
         {error}
        </div>
       ) : null}

       <div className="space-y-3">
        {["upi", "card", "netbanking"].map((method) => (
         <button
          key={method}
          type="button"
          onClick={() => setPaymentMethod(method)}
          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
           paymentMethod === method
            ? "border-cyan-400 bg-cyan-50"
            : "border-slate-200 bg-white hover:border-slate-300"
          }`}
         >
          <span className="inline-flex items-center gap-3">
           <span className="rounded-full bg-slate-900 p-2 text-white">
            <CreditCard className="h-4 w-4" />
           </span>
           <span className="font-semibold text-slate-900 uppercase">
            {method}
           </span>
          </span>
          {paymentMethod === method ? (
           <ShieldCheck className="h-5 w-5 text-cyan-600" />
          ) : null}
         </button>
        ))}
       </div>

       <button
        type="button"
        disabled={loading}
        onClick={handlePay}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
       >
        {loading ? (
         <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
         <CreditCard className="h-4 w-4" />
        )}
        Pay now
       </button>
      </div>
     </div>
    </motion.div>
   </section>
  </main>
 );
}

function SummaryItem({ label, value }) {
 return (
  <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
   <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
    {label}
   </p>
   <p className="mt-1 font-semibold text-slate-900">{value || "-"}</p>
  </div>
 );
}
