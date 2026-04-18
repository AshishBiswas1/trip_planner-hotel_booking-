"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { bookingApi } from "@/lib/api";

export default function RoomBookingModal({
 isOpen,
 onClose,
 room,
 hotel,
 onBookingSuccess = () => {},
}) {
 const [formData, setFormData] = useState({
  checkInDate: "",
  numberOfDays: "1",
  numberOfGuests: "1",
  specialRequests: "",
 });
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState("");

 const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
   ...prev,
   [name]: value,
  }));
  setError("");
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  // Validation
  if (!formData.checkInDate) {
   setError("Please select a check-in date.");
   return;
  }

  const numberOfDays = Number(formData.numberOfDays);
  const numberOfGuests = Number(formData.numberOfGuests);

  if (!Number.isInteger(numberOfDays) || numberOfDays < 1) {
   setError("Number of days must be at least 1.");
   return;
  }

  if (numberOfGuests < 1 || numberOfGuests > 10) {
   setError("Number of guests must be between 1 and 10.");
   return;
  }

  if (room?.capacity && numberOfGuests > room.capacity) {
   setError(
    "The room cannot hold the number of guests. Please book another room.",
   );
   return;
  }

  try {
   setIsLoading(true);

   const bookingPayload = {
    roomId: room?._id,
    hotelId: hotel?._id,
    checkInDate: formData.checkInDate,
    numberOfDays,
    numberOfGuests,
    returnUrl: window.location.href,
    specialRequests: formData.specialRequests || undefined,
   };

   const response = await bookingApi.createBooking(hotel?._id, bookingPayload);

   if (response?.data?.booking) {
    onBookingSuccess(response.data);
    onClose();

    if (response?.data?.paymentUrl) {
     window.location.href = response.data.paymentUrl;
    }
   } else {
    setError(response?.message || "Booking failed. Please try again.");
   }
  } catch (err) {
   setError(err?.message || "An error occurred. Please try again.");
   console.error("Booking error:", err);
  } finally {
   setIsLoading(false);
  }
 };

 if (!isOpen) return null;

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur p-4">
   <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
    {/* Header */}
    <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-cyan-50 p-6">
     <h2 className="text-2xl font-extrabold text-slate-900">Book Room</h2>
     <button
      onClick={onClose}
      disabled={isLoading}
      className="rounded-full bg-slate-100 p-2 transition hover:bg-slate-200 disabled:opacity-50"
     >
      <X className="h-5 w-5 text-slate-600" />
     </button>
    </div>

    {/* Content */}
    <div className="p-6">
     {/* Room Info */}
     <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
       Room
      </p>
      <p className="mt-1 text-lg font-bold text-slate-900">
       {room?.roomType} - Room {room?.roomNumber}
      </p>
      <p className="mt-1 text-sm text-slate-600">{hotel?.name}</p>
     </div>

     {/* Error Message */}
     {error && (
      <div className="mb-4 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700">
       {error}
      </div>
     )}

     {/* Form */}
     <form onSubmit={handleSubmit} className="space-y-4">
      {/* Check-in Date */}
      <div>
       <label className="block text-sm font-semibold text-slate-700">
        Check-in Date
       </label>
       <input
        type="date"
        name="checkInDate"
        value={formData.checkInDate}
        onChange={handleInputChange}
        disabled={isLoading}
        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-700 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-100"
       />
      </div>

      {/* Number of Days */}
      <div>
       <label className="block text-sm font-semibold text-slate-700">
        Number of Days
       </label>
       <input
        type="number"
        name="numberOfDays"
        min="1"
        step="1"
        value={formData.numberOfDays}
        onChange={handleInputChange}
        disabled={isLoading}
        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-700 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-100"
       />
      </div>

      {/* Number of Guests */}
      <div>
       <label className="block text-sm font-semibold text-slate-700">
        Number of Guests
       </label>
       <select
        name="numberOfGuests"
        value={formData.numberOfGuests}
        onChange={handleInputChange}
        disabled={isLoading}
        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-700 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-100"
       >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
         <option key={num} value={num}>
          {num} {num === 1 ? "Guest" : "Guests"}
         </option>
        ))}
       </select>
      </div>

      {/* Special Requests */}
      <div>
       <label className="block text-sm font-semibold text-slate-700">
        Special Requests (Optional)
       </label>
       <textarea
        name="specialRequests"
        value={formData.specialRequests}
        onChange={handleInputChange}
        disabled={isLoading}
        placeholder="Any special requests or requirements?"
        rows="3"
        className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-700 placeholder-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-100"
       />
      </div>

      {/* Submit Button */}
      <button
       type="submit"
       disabled={isLoading}
       className="mt-6 w-full rounded-2xl bg-emerald-500 px-6 py-3 font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
      >
       {isLoading ? (
        <span className="inline-flex items-center gap-2">
         <Loader2 className="h-4 w-4 animate-spin" />
         Processing...
        </span>
       ) : (
        "Proceed to Payment"
       )}
      </button>
     </form>
    </div>
   </div>
  </div>
 );
}
