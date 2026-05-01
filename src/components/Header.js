"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
 BedDouble,
 Plane,
 Menu,
 X,
 CalendarCheck,
 Zap,
 Bus,
 Train,
} from "lucide-react";

export default function Header() {
 const [isMobileOpen, setIsMobileOpen] = useState(false);
 const [isPanelOpen, setIsPanelOpen] = useState(false);
 const closePanelTimeoutRef = useRef(null);
 const { user, isAuthLoading, isAuthenticated, logout } = useAuth();

 useEffect(() => {
  return () => {
   if (closePanelTimeoutRef.current) {
    clearTimeout(closePanelTimeoutRef.current);
   }
  };
 }, []);

 const hotelMenuItems = [
  {
   href: "/hotels?booking=prebook",
   title: "Pre-Booking Hotel Rooms",
   description: "Reserve early and lock your preferred stay.",
   icon: CalendarCheck,
  },
  {
   href: "/nearby",
   title: "Instant Booking Hotel Rooms",
   description: "Book immediately with real-time room availability.",
   icon: Zap,
  },
 ];

 const transportItems = [
  {
   href: "/flights",
   title: "Flights",
   description: "Compare and book flights across routes.",
   icon: Plane,
  },
  {
   href: "/buses",
   title: "Buses",
   description: "Find intercity buses with flexible times.",
   icon: Bus,
  },
  {
   href: "/trains",
   title: "Trains",
   description: "Browse train options and reserve tickets.",
   icon: Train,
  },
 ];

 const profileImage =
  user?.photo && user.photo !== "default.jpg"
   ? user.photo
   : `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || "User",
     )}&background=2563eb&color=fff`;

 const handleLogout = async () => {
  await logout();
  setIsMobileOpen(false);
 };

 const openPanel = () => {
  if (closePanelTimeoutRef.current) {
   clearTimeout(closePanelTimeoutRef.current);
   closePanelTimeoutRef.current = null;
  }
  setIsPanelOpen(true);
 };

 const closePanel = () => {
  if (closePanelTimeoutRef.current) {
   clearTimeout(closePanelTimeoutRef.current);
  }

  closePanelTimeoutRef.current = setTimeout(() => {
   setIsPanelOpen(false);
  }, 120);
 };

 return (
  <header
   className="sticky top-0 z-50 border-b border-white/70 bg-white/80 shadow-lg shadow-slate-900/5 backdrop-blur-xl"
   onMouseEnter={openPanel}
   onMouseLeave={closePanel}
  >
   <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-4 sm:py-5">
    <Link href="/" className="flex items-center gap-2">
     <span className="rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 p-2 text-white shadow-md shadow-cyan-500/30">
      <BedDouble className="h-6 w-6" />
     </span>
     <span className="text-xl font-black tracking-tight text-slate-800 sm:text-2xl">
      Trip Planner
     </span>
    </Link>

    <div className="hidden flex-1 justify-center md:flex">
     <div className="flex min-w-[560px] max-w-[780px] items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/95 px-5 py-3 shadow-xl shadow-slate-900/10 backdrop-blur-xl">
      <nav className="flex items-center gap-6">
       <Link
        href="/"
        className="text-sm font-semibold text-slate-700 transition hover:text-cyan-700"
       >
        Home
       </Link>
       <Link
        href="/plan-trip"
        className="text-sm font-semibold text-slate-700 transition hover:text-cyan-700"
       >
        Plan Trip
       </Link>
       <Link
        href="/#about"
        className="text-sm font-semibold text-slate-700 transition hover:text-cyan-700"
       >
        About
       </Link>
       <Link
        href="/#contact"
        className="text-sm font-semibold text-slate-700 transition hover:text-cyan-700"
       >
        Contact
       </Link>
      </nav>

      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
       Hover To Explore Bookings
      </span>
     </div>
    </div>

    <div className="hidden items-center gap-4 md:flex">
     {isAuthLoading ? null : isAuthenticated ? (
      <>
       <img
        src={profileImage}
        alt="Profile"
        className="h-9 w-9 rounded-full border border-slate-200 object-cover"
       />
       <button
        type="button"
        onClick={handleLogout}
        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
       >
        Logout
       </button>
      </>
     ) : (
      <>
       <Link
        href="/login"
        className="text-sm font-semibold text-slate-600 transition hover:text-cyan-700"
       >
        Login
       </Link>
       <Link
        href="/signup"
        className="rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-600 hover:to-teal-600"
       >
        Sign Up
       </Link>
      </>
     )}
    </div>

    <div className="md:hidden">
     <button
      type="button"
      onClick={() => setIsMobileOpen((prev) => !prev)}
      className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700"
      aria-expanded={isMobileOpen}
      aria-label="Toggle navigation menu"
     >
      {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
     </button>
    </div>
   </div>

   <div className="pointer-events-none absolute inset-x-0 top-full z-50 hidden md:block">
    <div className="container mx-auto px-4">
     <div
      className={`pointer-events-auto mt-2 overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-xl shadow-slate-900/10 backdrop-blur-xl transition-all duration-300 ${
       isPanelOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      }`}
     >
      <div
       className={`grid overflow-hidden transition-all duration-300 ${
        isPanelOpen
         ? "max-h-[380px] grid-rows-[1fr]"
         : "max-h-0 grid-rows-[0fr]"
       }`}
      >
       <div className="overflow-hidden">
        <div className="grid grid-cols-5 gap-3 p-4">
         {hotelMenuItems.map((item) => {
          const Icon = item.icon;
          return (
           <Link
            key={item.title}
            href={item.href}
            className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-cyan-50 to-white p-3 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-500/15"
           >
            <div className="flex items-start gap-2.5">
             <span className="rounded-lg bg-cyan-100 p-2 text-cyan-700 transition group-hover:bg-cyan-200">
              <Icon className="h-4 w-4" />
             </span>
             <span>
              <span className="block text-sm font-bold text-slate-800">
               {item.title}
              </span>
              <span className="mt-0.5 block text-xs text-slate-600">
               {item.description}
              </span>
             </span>
            </div>
           </Link>
          );
         })}

         {transportItems.map((item) => {
          const Icon = item.icon;
          return (
           <Link
            key={item.title}
            href={item.href}
            className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-white p-3 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/15"
           >
            <div className="flex items-start gap-2.5">
             <span className="rounded-lg bg-emerald-100 p-2 text-emerald-700 transition group-hover:bg-emerald-200">
              <Icon className="h-4 w-4" />
             </span>
             <span>
              <span className="block text-sm font-bold text-slate-800">
               {item.title}
              </span>
              <span className="mt-0.5 block text-xs text-slate-600">
               {item.description}
              </span>
             </span>
            </div>
           </Link>
          );
         })}
        </div>
       </div>
      </div>
     </div>
    </div>
   </div>

   {isMobileOpen ? (
    <div className="border-t border-slate-200 bg-white/95 px-4 pb-5 pt-4 backdrop-blur md:hidden">
     <div className="mb-3 space-y-1 rounded-2xl border border-slate-200 bg-white p-3">
      <Link
       href="/"
       className="block rounded-lg px-2 py-2 text-sm font-semibold text-slate-700"
       onClick={() => setIsMobileOpen(false)}
      >
       Home
      </Link>
      <Link
       href="/#about"
       className="block rounded-lg px-2 py-2 text-sm font-semibold text-slate-700"
       onClick={() => setIsMobileOpen(false)}
      >
       About
      </Link>
      <Link
       href="/plan-trip"
       className="block rounded-lg px-2 py-2 text-sm font-semibold text-slate-700"
       onClick={() => setIsMobileOpen(false)}
      >
       Plan Trip
      </Link>
      <Link
       href="/#contact"
       className="block rounded-lg px-2 py-2 text-sm font-semibold text-slate-700"
       onClick={() => setIsMobileOpen(false)}
      >
       Contact
      </Link>
     </div>

     <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
       Hotels
      </p>
      {hotelMenuItems.map((item) => {
       const Icon = item.icon;
       return (
        <Link
         key={item.title}
         href={item.href}
         className="flex items-start gap-3 rounded-xl bg-white p-3"
         onClick={() => setIsMobileOpen(false)}
        >
         <span className="rounded-lg bg-cyan-100 p-2 text-cyan-700">
          <Icon className="h-4 w-4" />
         </span>
         <span>
          <span className="block text-sm font-bold text-slate-800">
           {item.title}
          </span>
          <span className="mt-0.5 block text-xs text-slate-600">
           {item.description}
          </span>
         </span>
        </Link>
       );
      })}
     </div>

     <div className="mt-3 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
       Transport
      </p>
      {transportItems.map((item) => {
       const Icon = item.icon;
       return (
        <Link
         key={item.title}
         href={item.href}
         className="flex items-start gap-3 rounded-xl bg-white p-3"
         onClick={() => setIsMobileOpen(false)}
        >
         <span className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
          <Icon className="h-4 w-4" />
         </span>
         <span>
          <span className="block text-sm font-bold text-slate-800">
           {item.title}
          </span>
          <span className="mt-0.5 block text-xs text-slate-600">
           {item.description}
          </span>
         </span>
        </Link>
       );
      })}
     </div>

     <div className="mt-4 flex flex-col space-y-2">
      {isAuthLoading ? null : isAuthenticated ? (
       <>
        <div className="flex items-center justify-center py-1">
         <img
          src={profileImage}
          alt="Profile"
          className="h-10 w-10 rounded-full border border-slate-200 object-cover"
         />
        </div>
        <button
         type="button"
         onClick={handleLogout}
         className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
        >
         Logout
        </button>
       </>
      ) : (
       <>
        <Link
         href="/login"
         className="rounded-full border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700"
         onClick={() => setIsMobileOpen(false)}
        >
         Login
        </Link>
        <Link
         href="/signup"
         className="rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2 text-center text-sm font-semibold text-white"
         onClick={() => setIsMobileOpen(false)}
        >
         Sign Up
        </Link>
       </>
      )}
     </div>
    </div>
   ) : null}
  </header>
 );
}
