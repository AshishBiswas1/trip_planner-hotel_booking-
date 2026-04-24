import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { ROUTE_PREFERENCES } from "../constants";

export default function RouteAlternativesPanel({
 routeStatus,
 routeIssue,
 routeApiTestLoading,
 routeApiTestResult,
 onRouteApiSelfTest,
 onCopyDiagnostics,
 copiedDiagnostics,
 routePreference,
 onRoutePreferenceChange,
 routeOptions,
 selectedRouteIndex,
 onRouteCardSelect,
}) {
 return (
  <div className="rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6">
   <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
    <div>
     <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-700">
      Route alternatives
     </p>
     <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
      Choose the primary route
     </h2>
    </div>
    <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
     {routeStatus}
    </div>
   </div>

   {routeIssue ? (
    <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
     <p className="font-semibold">Route diagnostic: {routeIssue.code}</p>
     <p className="mt-1">{routeIssue.message}</p>
     {routeIssue.code === "REQUEST_DENIED" ? (
      <p className="mt-2 text-xs text-amber-800">
       Ensure Google Directions API is enabled for this key and the current site
       origin is allowed in API key restrictions.
      </p>
     ) : null}
    </div>
   ) : null}

   <div className="mb-4 flex flex-wrap items-center gap-3">
    <button
     type="button"
     onClick={onRouteApiSelfTest}
     disabled={routeApiTestLoading}
     className="rounded-full border border-cyan-300 bg-cyan-50 px-4 py-2 text-xs font-semibold text-cyan-800 transition hover:border-cyan-400 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
     {routeApiTestLoading ? "Testing route API..." : "Test Route API"}
    </button>

    <button
     type="button"
     onClick={onCopyDiagnostics}
     className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
    >
     {copiedDiagnostics ? "Diagnostics Copied" : "Copy Diagnostics"}
    </button>

    {routeApiTestResult ? (
     <div
      className={`rounded-2xl border px-3 py-2 text-xs ${
       routeApiTestResult.ok
        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
        : "border-rose-300 bg-rose-50 text-rose-800"
      }`}
     >
      <p className="font-semibold">{routeApiTestResult.title}</p>
      <p className="mt-1">{routeApiTestResult.message}</p>
     </div>
    ) : null}
   </div>

   <div className="mb-4 flex flex-wrap items-center gap-2">
    {ROUTE_PREFERENCES.map((preference) => {
     const isActive = routePreference === preference.key;
     return (
      <button
       key={preference.key}
       type="button"
       onClick={() => onRoutePreferenceChange(preference.key)}
       className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        isActive
         ? "border-cyan-300 bg-cyan-50 text-cyan-700"
         : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
       }`}
      >
       {preference.label}
      </button>
     );
    })}
   </div>

   {routeOptions.length ? (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
     {routeOptions.map((route, index) => {
      const isSelected = index === selectedRouteIndex;

      return (
       <motion.button
        key={route.id}
        type="button"
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => onRouteCardSelect(index)}
        className={`rounded-2xl border p-4 text-left transition ${
         isSelected
          ? "border-cyan-400 bg-cyan-50 shadow-lg shadow-cyan-500/10"
          : "border-slate-200 bg-white"
        }`}
       >
        <div className="flex items-start justify-between gap-3">
         <div>
          <div className="flex items-center gap-2">
           <span
            className={`h-2.5 w-2.5 rounded-full ${isSelected ? "bg-cyan-500" : "bg-slate-400"}`}
           />
           <p className="text-sm font-bold text-slate-900">{route.summary}</p>
          </div>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
           {isSelected ? "Primary route" : `Route ${index + 1}`}
          </p>
         </div>
         {isSelected ? (
          <CheckCircle2 className="h-5 w-5 text-cyan-600" />
         ) : null}
        </div>

        <div className="mt-4 grid gap-2 text-sm text-slate-600">
         <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
          <span>Duration</span>
          <span className="font-semibold text-slate-900">
           {route.durationText}
          </span>
         </div>
         <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
          <span>Distance</span>
          <span className="font-semibold text-slate-900">
           {route.distanceText}
          </span>
         </div>
        </div>

        <div className="mt-4 text-xs leading-5 text-slate-500">
         Click the polyline on the map or use this card to promote the route to
         the blue primary path.
        </div>
       </motion.button>
      );
     })}
    </div>
   ) : (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-500">
     Add both locations to see route options here.
    </div>
   )}
  </div>
 );
}
