"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { BedDouble, Plane, Menu, X } from "lucide-react";

export default function Header() {
 const [isOpen, setIsOpen] = useState(false);
 const { user, isAuthLoading, isAuthenticated, logout } = useAuth();

 const profileImage =
  user?.photo && user.photo !== "default.jpg"
   ? user.photo
   : `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.name || "User",
     )}&background=2563eb&color=fff`;

 const handleLogout = async () => {
  await logout();
  setIsOpen(false);
 };

 return (
  <header className="sticky top-0 z-50 bg-white shadow-md">
   <div className="container mx-auto px-4 py-6 flex justify-between items-center">
    <div className="flex items-center space-x-2">
     <BedDouble className="h-8 w-8 text-blue-500" />
     <span className="text-2xl font-bold text-gray-800">Trip Planner</span>
    </div>
    <div className="hidden md:flex items-center space-x-8">
     <Link
      href="/hotels"
      className="text-gray-600 hover:text-blue-500 transition-colors duration-300 flex items-center space-x-2"
     >
      <BedDouble className="h-5 w-5" />
      <span>Hotel</span>
     </Link>
     <a
      href="#"
      className="text-gray-600 hover:text-blue-500 transition-colors duration-300 flex items-center space-x-2"
     >
      <Plane className="h-5 w-5" />
      <span>Flights</span>
     </a>
    </div>
    <div className="hidden md:flex items-center space-x-4">
     {isAuthLoading ? null : isAuthenticated ? (
      <>
       <img
        src={profileImage}
        alt="Profile"
        className="h-9 w-9 rounded-full border border-gray-200 object-cover"
       />
       <button
        type="button"
        onClick={handleLogout}
        className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors duration-300"
       >
        Logout
       </button>
      </>
     ) : (
      <>
       <Link
        href="/login"
        className="text-gray-600 hover:text-blue-500 transition-colors duration-300"
       >
        Login
       </Link>
       <Link
        href="/signup"
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300"
       >
        Sign Up
       </Link>
      </>
     )}
    </div>
    <div className="md:hidden">
     <button onClick={() => setIsOpen(!isOpen)}>
      {isOpen ? (
       <X className="h-6 w-6 text-gray-800" />
      ) : (
       <Menu className="h-6 w-6 text-gray-800" />
      )}
     </button>
    </div>
   </div>
   {isOpen && (
    <div className="md:hidden bg-white px-4 pb-4">
     <Link
      href="/hotels"
      className="block text-gray-600 hover:text-blue-500 py-2"
      onClick={() => setIsOpen(false)}
     >
      Hotel
     </Link>
     <a href="#" className="block text-gray-600 hover:text-blue-500 py-2">
      Flights
     </a>
     <div className="flex flex-col space-y-2 mt-4">
      {isAuthLoading ? null : isAuthenticated ? (
       <>
        <div className="flex items-center justify-center py-2">
         <img
          src={profileImage}
          alt="Profile"
          className="h-10 w-10 rounded-full border border-gray-200 object-cover"
         />
        </div>
        <button
         type="button"
         onClick={handleLogout}
         className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md"
        >
         Logout
        </button>
       </>
      ) : (
       <>
        <Link
         href="/login"
         className="border border-gray-300 text-gray-600 px-4 py-2 rounded-md text-center"
        >
         Login
        </Link>
        <Link
         href="/signup"
         className="bg-blue-500 text-white px-4 py-2 rounded-md text-center"
        >
         Sign Up
        </Link>
       </>
      )}
     </div>
    </div>
   )}
  </header>
 );
}
