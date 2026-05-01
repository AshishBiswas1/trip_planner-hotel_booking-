"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
 ArrowLeft,
 ArrowRightLeft,
 CalendarDays,
 ChevronRight,
 LoaderCircle,
 Search,
 Ticket,
} from "lucide-react";
import { travelApi } from "@/lib/api";

const modeConfigMap = {
 flights: {
  heading: "Flight Explorer",
  subheading:
   "Search routes and quickly inspect a specific flight schedule from static transport feeds.",
  accent: "from-sky-500 via-cyan-500 to-emerald-500",
  badge: "Air Routes",
  searchLabel: "Plan your flight",
  primaryActionLabel: "Search flights",
  searchApi: ({ from, to, travelDate }) =>
   travelApi.searchFlightsByRoute({ from, to, travelDate }),
 },
 trains: {
  heading: "Train Explorer",
  subheading:
   "Enter your route details once and get matching train options instantly.",
  accent: "from-emerald-500 via-teal-500 to-cyan-500",
  badge: "Rail Routes",
  searchLabel: "Plan your train journey",
  primaryActionLabel: "Search trains",
  searchApi: ({ from, to, travelDate }) =>
   travelApi.searchTrainsByRoute({ from, to, travelDate }),
 },
 buses: {
  heading: "Bus Explorer",
  subheading:
   "Use one simple form to find buses for your route and travel date.",
  accent: "from-amber-500 via-orange-500 to-rose-500",
  badge: "Road Routes",
  searchLabel: "Plan your bus trip",
  primaryActionLabel: "Search buses",
  searchApi: ({ from, to, travelDate }) =>
   travelApi.searchBusesByRoute({ from, to, travelDate }),
 },
};

function pretty(value) {
 if (value === null || value === undefined || value === "") return "-";
 if (typeof value === "object") return JSON.stringify(value);
 return String(value);
}

function normalizeRoutePoint(point) {
 if (!point) return "";
 if (typeof point === "string") return point.trim();
 if (typeof point === "object") {
  return String(point.station || point.name || point.city || "").trim();
 }
 return String(point).trim();
}

function formatRouteSpan(route = [], from = "", to = "") {
 const normalizedRoute = Array.isArray(route)
  ? route.map(normalizeRoutePoint).filter(Boolean)
  : [];
 const normalizedFrom = String(from || "").trim();
 const normalizedTo = String(to || "").trim();

 if (!normalizedFrom || !normalizedTo) {
  return [normalizedFrom, normalizedTo].filter(Boolean);
 }

 const fromIndex = normalizedRoute.findIndex(
  (point) => point.toLowerCase() === normalizedFrom.toLowerCase(),
 );
 const toIndex = normalizedRoute.findIndex(
  (point) => point.toLowerCase() === normalizedTo.toLowerCase(),
 );

 if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
  const routeSpan = normalizedRoute.slice(fromIndex, toIndex + 1);
  return routeSpan.length ? routeSpan : [normalizedFrom, normalizedTo];
 }

 return [normalizedFrom, normalizedTo];
}

function joinRoute(route = [], from = "", to = "") {
 const routeSpan = formatRouteSpan(route, from, to);
 return routeSpan.length ? routeSpan.join(" -> ") : "-";
}

function buildCheckoutHref({
 mode,
 row,
 passengers,
 travelDate,
 from,
 to,
 totalPrice,
}) {
 const searchParams = new URLSearchParams();
 searchParams.set("mode", mode);
 searchParams.set(
  "optionId",
  row?.flight_id || row?.train_number || row?.bus_id || "",
 );
 searchParams.set(
  "provider",
  row?.airline || row?.train_name || row?.operator || "",
 );
 searchParams.set("from", from || "");
 searchParams.set("to", to || "");
 searchParams.set("passengers", String(passengers || 1));
 searchParams.set("travelDate", travelDate || "");
 searchParams.set("totalPrice", String(totalPrice || 0));
 return `/travel/checkout?${searchParams.toString()}`;
}

function getSegmentCount(mode, row) {
 if (mode === "flights") {
  if (Array.isArray(row?.route) && row.route.length > 1)
   return row.route.length - 1;
  if (typeof row?.stops === "number") return row.stops + 1;
  return 1;
 }

 if (mode === "trains") {
  if (Array.isArray(row?.route) && row.route.length > 1)
   return row.route.length - 1;
  return 1;
 }

 if (mode === "buses") {
  const route = row?.full_route || row?.route;
  if (Array.isArray(route) && route.length > 1) return route.length - 1;
  return 1;
 }

 return 1;
}

function getEstimatedFare(mode, row, passengers) {
 const pax = Number(passengers) || 1;
 const segments = getSegmentCount(mode, row);

 if (mode === "flights") {
  const base = Number(row?.base_price_per_leg) || 0;
  return base * segments * pax;
 }

 if (mode === "trains") {
  const base = Number(row?.base_price_per_stop) || 0;
  return base * segments * pax;
 }

 if (mode === "buses") {
  const base = Number(row?.price_per_segment) || 0;
  return base * segments * pax;
 }

 return 0;
}

function ResultCards({ mode, rows, passengers, searchForm }) {
 if (!rows.length) {
  return (
   <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-4 py-6 text-sm text-slate-500">
    No data yet. Run a search or schedule lookup.
   </div>
  );
 }

 return (
  <div className="grid gap-4 sm:grid-cols-2">
   {rows.slice(0, 20).map((row, index) => {
    const key = `${mode}-${row?.flight_id || row?.train_number || row?.bus_id || row?.station || index}`;

    if (mode === "flights") {
     const estimate = getEstimatedFare(mode, row, passengers);
     const checkoutHref = buildCheckoutHref({
      mode,
      row,
      passengers,
      travelDate: searchForm.travelDate,
      from: searchForm.from,
      to: searchForm.to,
      totalPrice: estimate,
     });
     return (
      <article
       key={key}
       className="group overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-5 shadow-[0_10px_30px_rgba(14,165,233,0.12)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(14,165,233,0.18)]"
      >
       <div className="flex items-start justify-between gap-3">
        <div>
         <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700/80">
          Flight
         </p>
         <h4 className="mt-1 text-lg font-black text-slate-900">
          {pretty(row?.flight_id)}
         </h4>
         <p className="mt-1 text-sm font-medium text-slate-600">
          {pretty(row?.airline)}
         </p>
        </div>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
         {pretty(row?.stops)} stops
        </span>
       </div>

       <div className="mt-4 rounded-2xl bg-white/80 p-4 ring-1 ring-sky-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
         Route
        </p>
        <p className="mt-1 text-sm font-medium text-slate-700">
         {joinRoute(row?.route, searchForm.from, searchForm.to)}
        </p>
       </div>

       <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-sky-100">
         <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Departure
         </p>
         <p className="mt-1 font-semibold text-slate-900">
          {pretty(row?.departure)}
         </p>
        </div>
        <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-sky-100">
         <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Base fare / leg
         </p>
         <p className="mt-1 font-semibold text-slate-900">
          Rs {pretty(row?.base_price_per_leg)}
         </p>
        </div>
       </div>

       <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-white">
        <div>
         <p className="text-xs uppercase tracking-[0.18em] text-white/70">
          Estimated total
         </p>
         <p className="text-lg font-black">Rs {pretty(estimate)}</p>
        </div>
        <Link
         href={checkoutHref}
         className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-50"
        >
         Book & Pay
         <ChevronRight className="h-4 w-4" />
        </Link>
       </div>
      </article>
     );
    }

    if (mode === "trains") {
     const estimate = getEstimatedFare(mode, row, passengers);
     const checkoutHref = buildCheckoutHref({
      mode,
      row,
      passengers,
      travelDate: searchForm.travelDate,
      from: searchForm.from,
      to: searchForm.to,
      totalPrice: estimate,
     });
     return (
      <article
       key={key}
       className="group overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-5 shadow-[0_10px_30px_rgba(16,185,129,0.12)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(16,185,129,0.18)]"
      >
       <div className="flex items-start justify-between gap-3">
        <div>
         <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700/80">
          Train
         </p>
         <h4 className="mt-1 text-lg font-black text-slate-900">
          {pretty(row?.train_number)}
         </h4>
         <p className="mt-1 text-sm font-medium text-slate-600">
          {pretty(row?.train_name)}
         </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
         Rail
        </span>
       </div>

       <div className="mt-4 rounded-2xl bg-white/80 p-4 ring-1 ring-emerald-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
         Route
        </p>
        <p className="mt-1 text-sm font-medium text-slate-700">
         {joinRoute(row?.route, searchForm.from, searchForm.to)}
        </p>
       </div>

       <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-emerald-100">
         <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Departure
         </p>
         <p className="mt-1 font-semibold text-slate-900">
          {pretty(row?.departure_time)}
         </p>
        </div>
        <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-emerald-100">
         <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Base fare / stop
         </p>
         <p className="mt-1 font-semibold text-slate-900">
          Rs {pretty(row?.base_price_per_stop)}
         </p>
        </div>
       </div>

       <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-white">
        <div>
         <p className="text-xs uppercase tracking-[0.18em] text-white/70">
          Estimated total
         </p>
         <p className="text-lg font-black">Rs {pretty(estimate)}</p>
        </div>
        <Link
         href={checkoutHref}
         className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-50"
        >
         Book & Pay
         <ChevronRight className="h-4 w-4" />
        </Link>
       </div>
       {Array.isArray(row?.classes) && row.classes.length ? (
        <p className="mt-2 text-xs text-slate-600">
         Classes:{" "}
         {row.classes
          .map((item) => item?.code)
          .filter(Boolean)
          .join(", ")}
        </p>
       ) : null}
      </article>
     );
    }

    if (mode === "buses") {
     const estimate = getEstimatedFare(mode, row, passengers);
     const checkoutHref = buildCheckoutHref({
      mode,
      row,
      passengers,
      travelDate: searchForm.travelDate,
      from: searchForm.from,
      to: searchForm.to,
      totalPrice: estimate,
     });

     return (
      <article
       key={key}
       className="group overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-rose-50 p-5 shadow-[0_10px_30px_rgba(249,115,22,0.12)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(249,115,22,0.18)]"
      >
       <div className="flex items-start justify-between gap-3">
        <div>
         <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700/80">
          Bus
         </p>
         <h4 className="mt-1 text-lg font-black text-slate-900">
          {pretty(row?.bus_id)}
         </h4>
         <p className="mt-1 text-sm font-medium text-slate-600">
          {pretty(row?.operator)} · {pretty(row?.bus_type)}
         </p>
        </div>
        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
         {pretty(row?.available_seats)}/{pretty(row?.total_seats)} seats
        </span>
       </div>

       <div className="mt-4 rounded-2xl bg-white/80 p-4 ring-1 ring-orange-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
         Route
        </p>
        <p className="mt-1 text-sm font-medium text-slate-700">
         {joinRoute(
          row?.full_route || [row?.source_city, row?.destination_city],
          searchForm.from,
          searchForm.to,
         )}
        </p>
       </div>

       <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-orange-100">
         <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Departure
         </p>
         <p className="mt-1 font-semibold text-slate-900">
          {pretty(row?.source_departure_time)}
         </p>
        </div>
        <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-orange-100">
         <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Price / segment
         </p>
         <p className="mt-1 font-semibold text-slate-900">
          Rs {pretty(row?.price_per_segment)}
         </p>
        </div>
       </div>

       <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-white">
        <div>
         <p className="text-xs uppercase tracking-[0.18em] text-white/70">
          Estimated total
         </p>
         <p className="text-lg font-black">Rs {pretty(estimate)}</p>
        </div>
        <Link
         href={checkoutHref}
         className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-orange-50"
        >
         Book & Pay
         <ChevronRight className="h-4 w-4" />
        </Link>
       </div>
      </article>
     );
    }

    return (
     <article
      key={key}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
     >
      <pre className="overflow-x-auto text-xs text-slate-700">
       {pretty(row)}
      </pre>
     </article>
    );
   })}
  </div>
 );
}

export default function TravelModePageTemplate({ mode }) {
 const config = modeConfigMap[mode] || modeConfigMap.flights;
 const [form, setForm] = useState({
  from: "",
  to: "",
  passengers: "1",
  travelDate: "",
 });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const [dataRows, setDataRows] = useState([]);
 const [meta, setMeta] = useState({ title: "", count: 0 });

 const onChange = (event) => {
  const { name, value } = event.target;
  setForm((current) => ({ ...current, [name]: value }));
 };

 const handleSearch = async (event) => {
  event.preventDefault();
  setError("");
  setLoading(true);

  try {
   const result = await config.searchApi({
    from: form.from,
    to: form.to,
    travelDate: form.travelDate,
   });
   const collection =
    result?.data?.flights || result?.data?.trains || result?.data?.buses || [];

   setDataRows(Array.isArray(collection) ? collection : []);
   setMeta({
    title: `${config.searchLabel} for ${form.passengers} passenger(s)`,
    count: Number(result?.results || collection?.length || 0),
   });
  } catch (requestError) {
   setError(requestError?.message || "Unable to fetch route data.");
  } finally {
   setLoading(false);
  }
 };

 return (
  <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.25),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_30%),linear-gradient(180deg,_#f9fdff_0%,_#effcf7_50%,_#ffffff_100%)] py-8 sm:py-12">
   <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:36px_36px]" />

   <section className="container relative mx-auto px-4">
    <motion.div
     initial={{ opacity: 0, y: 10 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.35 }}
     className="mb-6"
    >
     <Link
      href="/"
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-x-0.5 hover:border-cyan-300 hover:text-cyan-700"
     >
      <ArrowLeft className="h-4 w-4" />
      Back to Home
     </Link>
    </motion.div>

    <motion.div
     initial={{ opacity: 0, y: 16 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.45 }}
     className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-2xl shadow-slate-900/10 backdrop-blur"
    >
     <div
      className={`bg-gradient-to-r ${config.accent} px-6 py-8 text-white sm:px-10`}
     >
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
       <Ticket className="h-3.5 w-3.5" />
       {config.badge}
      </div>
      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
       {config.heading}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-white/90 sm:text-base">
       {config.subheading}
      </p>
     </div>

     <div className="p-5 sm:p-8">
      <form
       onSubmit={handleSearch}
       className="mx-auto max-w-4xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
       <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
        <ArrowRightLeft className="h-4 w-4 text-cyan-600" />
        Enter trip details
       </h2>

       <p className="text-sm text-slate-600">
        Fill start point, destination, number of passengers, and date, then
        click search.
       </p>

       <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
         <span className="mb-1 block">Start point</span>
         <input
          type="text"
          name="from"
          value={form.from}
          onChange={onChange}
          placeholder="e.g. Delhi"
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-cyan-300 transition focus:border-cyan-400 focus:ring"
          required
         />
        </label>

        <label className="block text-sm font-medium text-slate-700">
         <span className="mb-1 block">Destination</span>
         <input
          type="text"
          name="to"
          value={form.to}
          onChange={onChange}
          placeholder="e.g. Mumbai"
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-cyan-300 transition focus:border-cyan-400 focus:ring"
          required
         />
        </label>

        <label className="block text-sm font-medium text-slate-700">
         <span className="mb-1 block">Number of passengers</span>
         <input
          type="number"
          name="passengers"
          value={form.passengers}
          onChange={onChange}
          min="1"
          max="12"
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none ring-cyan-300 transition focus:border-cyan-400 focus:ring"
          required
         />
        </label>

        <label className="block text-sm font-medium text-slate-700">
         <span className="mb-1 block">Travel date</span>
         <div className="relative">
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
           type="date"
           name="travelDate"
           value={form.travelDate}
           onChange={onChange}
           className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 outline-none ring-cyan-300 transition focus:border-cyan-400 focus:ring"
           required
          />
         </div>
        </label>
       </div>

       <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
       >
        {loading ? (
         <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
         <Search className="h-4 w-4" />
        )}
        {config.primaryActionLabel}
       </button>
      </form>
     </div>
    </motion.div>

    <motion.section
     initial={{ opacity: 0, y: 10 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.4, delay: 0.1 }}
     className="mt-6 rounded-3xl border border-white/70 bg-white/85 p-5 shadow-xl shadow-slate-900/5 backdrop-blur sm:p-6"
    >
     <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-lg font-bold text-slate-900">Results</h3>
      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
       {meta.title || "No query yet"} {meta.count ? `(${meta.count})` : ""}
      </span>
     </div>

     {error ? (
      <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
       {error}
      </div>
     ) : null}

     <ResultCards
      mode={mode}
      rows={dataRows}
      passengers={form.passengers}
      searchForm={form}
     />
    </motion.section>
   </section>
  </main>
 );
}
