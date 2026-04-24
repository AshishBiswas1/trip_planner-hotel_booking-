import { AnimatePresence, motion } from "framer-motion";
import {
 ArrowRight,
 CalendarDays,
 CheckCircle2,
 Loader2,
 LocateFixed,
 Sparkles,
 WandSparkles,
} from "lucide-react";
import { TRAVEL_MODES } from "../constants";

export function HeroHeader({ endDate, routeCount }) {
 return (
  <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
   <div className="max-w-3xl">
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-200/70 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-800 shadow-sm backdrop-blur">
     <WandSparkles className="h-4 w-4" />
     Trip Builder Studio
    </div>
    <h1 className="max-w-2xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-7xl">
     Design your next journey with a live, map-driven planning flow.
    </h1>
    <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
     Type place names or tap the map to position the trip. The page resolves the
     locations, draws multiple driving routes, and sends the backend the exact
     trip payload it expects.
    </p>
   </div>

   <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
    {[
     {
      label: "Map actions",
      value: "Type or tap",
      icon: LocateFixed,
     },
     {
      label: "End date",
      value: endDate || "Auto",
      icon: CalendarDays,
     },
     {
      label: "Routes",
      value: routeCount ? String(routeCount) : "-",
      icon: CheckCircle2,
     },
    ].map((stat) => {
     const Icon = stat.icon;

     return (
      <div
       key={stat.label}
       className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-lg shadow-cyan-900/5 backdrop-blur-xl"
      >
       <div className="mb-3 inline-flex rounded-xl bg-slate-950 p-2 text-white shadow-md shadow-slate-900/20">
        <Icon className="h-4 w-4" />
       </div>
       <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {stat.label}
       </p>
       <p className="mt-1 text-sm font-bold text-slate-900">{stat.value}</p>
      </div>
     );
    })}
   </div>
  </div>
 );
}

export default function TripComposerPanel({
 itemVariants,
 handleSubmit,
 form,
 handleChange,
 activePicker,
 setActivePicker,
 handleUseCurrentLocationAsStart,
 useCurrentLocationLoading,
 geoPermissionState,
 locationStatus,
 endDate,
 travelMode,
 summaryCards,
 error,
 successMessage,
 loading,
}) {
 return (
  <motion.aside
   variants={itemVariants}
   className="rounded-[2rem] border border-white/80 bg-white/75 p-5 shadow-[0_30px_100px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-7 lg:sticky lg:top-24 lg:self-start"
  >
   <div className="mb-6 flex items-center justify-between gap-4">
    <div>
     <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-700">
      Composer
     </p>
     <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
      Build the trip
     </h2>
    </div>
    <div className="rounded-full border border-white/70 bg-white/70 px-3 py-2 text-xs font-semibold text-cyan-700 shadow-sm">
     Backend-ready
    </div>
   </div>

   <form onSubmit={handleSubmit} className="space-y-4">
    <div>
     <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
      Trip details
     </label>
     <textarea
      name="details"
      value={form.details}
      onChange={handleChange}
      className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/40"
      placeholder="Describe the trip mood, must-visit places, family travel, business goals, and preferences."
     />
    </div>

    <div className="grid gap-3 sm:grid-cols-2">
     <button
      type="button"
      onClick={() => setActivePicker("start")}
      className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
       activePicker === "start"
        ? "border-cyan-400 bg-cyan-50 text-cyan-800 shadow-sm"
        : "border-slate-200 bg-white text-slate-700"
      }`}
     >
      Place start point on map
     </button>
     <button
      type="button"
      onClick={() => setActivePicker("end")}
      className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
       activePicker === "end"
        ? "border-rose-400 bg-rose-50 text-rose-700 shadow-sm"
        : "border-slate-200 bg-white text-slate-700"
      }`}
     >
      Place end point on map
     </button>
    </div>

    <button
     type="button"
     onClick={handleUseCurrentLocationAsStart}
     disabled={useCurrentLocationLoading}
     className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
     <LocateFixed className="h-4 w-4" />
     {useCurrentLocationLoading
      ? "Setting current location..."
      : "Use Current Location As Start"}
    </button>

    {geoPermissionState === "denied" ? (
     <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      Location access is blocked. Enable location permission for this site in
      your browser and then try again.
     </div>
    ) : null}

    <div className="grid gap-3 sm:grid-cols-2">
     <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
       Start place
      </label>
      <input
       name="startPlace"
       value={form.startPlace}
       onChange={handleChange}
       className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/40"
       placeholder="e.g. New Delhi Railway Station"
      />
      <p className="mt-2 text-xs leading-5 text-slate-500">
       {locationStatus.start}
      </p>
     </div>

     <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
       Destination place
      </label>
      <input
       name="endPlace"
       value={form.endPlace}
       onChange={handleChange}
       className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-200/40"
       placeholder="e.g. Jaipur City Palace"
      />
      <p className="mt-2 text-xs leading-5 text-slate-500">
       {locationStatus.end}
      </p>
     </div>
    </div>

    <div className="grid gap-3 sm:grid-cols-2">
     <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
       Start date
      </label>
      <input
       type="date"
       name="startDate"
       value={form.startDate}
       onChange={handleChange}
       className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/40"
       required
      />
     </div>

     <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
       Trip duration (days)
      </label>
      <input
       type="number"
       min="1"
       max="365"
       name="durationDays"
       value={form.durationDays}
       onChange={handleChange}
       className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/40"
       required
      />
     </div>
    </div>

    <div>
     <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
      Travel mode
     </label>
     <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {TRAVEL_MODES.map((mode) => {
       const isActive = travelMode === mode.key;

       return (
        <button
         key={mode.key}
         type="button"
         onClick={() =>
          handleChange({ target: { name: "travelMode", value: mode.key } })
         }
         className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
          isActive
           ? "border-cyan-400 bg-cyan-50 text-cyan-800"
           : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
         }`}
        >
         {mode.label}
        </button>
       );
      })}
     </div>
    </div>

    <div className="rounded-3xl border border-slate-200 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),rgba(16,185,129,0.08))] p-4">
     <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
      <Sparkles className="h-4 w-4 text-cyan-700" />
      Auto-calculated trip end date
     </div>
     <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-bold text-slate-900">
      {endDate || "Select a start date and duration to calculate the end date."}
     </div>
    </div>

    <div className="grid gap-3 sm:grid-cols-3">
     {summaryCards.map((item) => (
      <div
       key={item.label}
       className="rounded-2xl border border-slate-200 bg-white p-4"
      >
       <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
        {item.label}
       </p>
       <p className="mt-2 text-sm font-semibold text-slate-900">{item.value}</p>
      </div>
     ))}
    </div>

    <AnimatePresence mode="wait">
     {error ? (
      <motion.p
       key={error}
       initial={{ opacity: 0, y: -6 }}
       animate={{ opacity: 1, y: 0 }}
       exit={{ opacity: 0, y: -6 }}
       className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700"
      >
       {error}
      </motion.p>
     ) : null}
    </AnimatePresence>

    <AnimatePresence mode="wait">
     {successMessage ? (
      <motion.p
       key={successMessage}
       initial={{ opacity: 0, y: -6 }}
       animate={{ opacity: 1, y: 0 }}
       exit={{ opacity: 0, y: -6 }}
       className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
      >
       {successMessage}
      </motion.p>
     ) : null}
    </AnimatePresence>

    <motion.button
     type="submit"
     disabled={loading}
     whileHover={!loading ? { scale: 1.01 } : undefined}
     whileTap={!loading ? { scale: 0.99 } : undefined}
     className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-5 py-4 text-sm font-bold text-white shadow-[0_18px_50px_rgba(20,184,166,0.35)] transition disabled:cursor-not-allowed disabled:opacity-70"
    >
     <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.26),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
     {loading ? (
      <Loader2 className="h-4 w-4 animate-spin" />
     ) : (
      <ArrowRight className="h-4 w-4" />
     )}
     <span>{loading ? "Creating trip..." : "Create Trip"}</span>
    </motion.button>
   </form>
  </motion.aside>
 );
}
