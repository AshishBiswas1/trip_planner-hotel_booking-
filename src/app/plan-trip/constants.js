import { CalendarDays, Layers3, MapPinned, Route } from "lucide-react";

export const GOOGLE_MAPS_API_KEY =
 process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
 process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY_JS?.trim() ||
 "";

export const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
export const ROUTE_TEST_FALLBACK_ORIGIN = { lat: 28.6139, lng: 77.209 };
export const ROUTE_TEST_FALLBACK_DESTINATION = { lat: 26.9124, lng: 75.7873 };

export const pageVariants = {
 hidden: { opacity: 0, y: 18 },
 show: {
  opacity: 1,
  y: 0,
  transition: { staggerChildren: 0.08, delayChildren: 0.08 },
 },
};

export const itemVariants = {
 hidden: { opacity: 0, y: 14 },
 show: { opacity: 1, y: 0 },
};

export const START_ICON =
 "data:image/svg+xml;utf8," +
 encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24"><path fill="#16a34a" stroke="#ffffff" stroke-width="1.2" d="M12 2C8.134 2 5 5.134 5 9c0 5.19 7 13 7 13s7-7.81 7-13c0-3.866-3.134-7-7-7z"/><circle cx="12" cy="9" r="3" fill="#ffffff"/></svg>',
 );

export const END_ICON =
 "data:image/svg+xml;utf8," +
 encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24"><path fill="#dc2626" stroke="#ffffff" stroke-width="1.2" d="M12 2C8.134 2 5 5.134 5 9c0 5.19 7 13 7 13s7-7.81 7-13c0-3.866-3.134-7-7-7z"/><circle cx="12" cy="9" r="3" fill="#ffffff"/></svg>',
 );

export const highlights = [
 {
  title: "Map-first creation",
  description:
   "Type place names or tap directly on the map to position the trip.",
  icon: MapPinned,
 },
 {
  title: "Automatic end date",
  description:
   "Only the start date and trip duration are entered. The end date is computed for the API.",
  icon: CalendarDays,
 },
 {
  title: "Primary route selection",
  description:
   "The selected path stays blue while alternative routes are muted in gray.",
  icon: Route,
 },
];

export const ROUTE_PREFERENCES = [
 { key: "manual", label: "Manual" },
 { key: "fastest", label: "Fastest" },
 { key: "shortest", label: "Shortest" },
];

export const TRAVEL_MODES = [
 { key: "DRIVE", label: "Car" },
 { key: "TWO_WHEELER", label: "Bike" },
 { key: "TRANSIT", label: "Transit" },
 { key: "WALK", label: "Walk" },
 { key: "BICYCLE", label: "Cycle" },
 { key: "FLIGHT", label: "Flight" },
];

export const TOP_STATS = [
 {
  label: "Map actions",
  value: "Type or tap",
 },
 {
  label: "End date",
  value: "auto",
 },
 {
  label: "Routes",
  value: "-",
 },
];

export const routeLegendIcon = Layers3;
