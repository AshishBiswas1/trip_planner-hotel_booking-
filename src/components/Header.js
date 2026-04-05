"use client";
import { useState } from "react";
import { BedDouble, Plane, Menu, X } from "lucide-react";

export default function Header() {
 const [isOpen, setIsOpen] = useState(false);

 return (
  <header className="bg-white shadow-md">
   <div className="container mx-auto px-4 py-6 flex justify-between items-center">
    <div className="flex items-center space-x-2">
     <BedDouble className="h-8 w-8 text-blue-500" />
     <span className="text-2xl font-bold text-gray-800">Trip Planner</span>
    </div>
    <div className="hidden md:flex items-center space-x-8">
     <a
      href="#"
      className="text-gray-600 hover:text-blue-500 transition-colors duration-300 flex items-center space-x-2"
     >
      <BedDouble className="h-5 w-5" />
      <span>Hotels</span>
     </a>
     <a
      href="#"
      className="text-gray-600 hover:text-blue-500 transition-colors duration-300 flex items-center space-x-2"
     >
      <Plane className="h-5 w-5" />
      <span>Flights</span>
     </a>
    </div>
    <div className="hidden md:flex items-center space-x-4">
     <button className="text-gray-600 hover:text-blue-500 transition-colors duration-300">
      Login
     </button>
     <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300">
      Sign Up
     </button>
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
     <a href="#" className="block text-gray-600 hover:text-blue-500 py-2">
      Hotels
     </a>
     <a href="#" className="block text-gray-600 hover:text-blue-500 py-2">
      Flights
     </a>
     <div className="flex flex-col space-y-2 mt-4">
      <button className="border border-gray-300 text-gray-600 px-4 py-2 rounded-md">
       Login
      </button>
      <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
       Sign Up
      </button>
     </div>
    </div>
   )}
  </header>
 );
}
