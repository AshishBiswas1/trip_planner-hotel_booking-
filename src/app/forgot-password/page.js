"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomAlert from "@/components/CustomAlert";
import { authApi } from "@/lib/api";

export default function ForgotPasswordPage() {
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [alertState, setAlertState] = useState(null);
 const router = useRouter();

 const handleSubmit = async (event) => {
  event.preventDefault();
  setAlertState(null);
  setIsSubmitting(true);

  const formData = new FormData(event.currentTarget);
  const payload = {
   email: formData.get("email")?.toString().trim(),
  };

  try {
   const data = await authApi.forgetPassword(payload);
   setAlertState({
    type: "success",
    message: data?.message || "Reset link sent to your email.",
   });
   setTimeout(() => {
    router.push("/login");
   }, 1200);
  } catch (error) {
   setAlertState({
    type: "error",
    message: error?.message || "Request failed. Please try again.",
   });
  } finally {
   setIsSubmitting(false);
  }
 };

 return (
  <main>
   <section className="min-h-[calc(100vh-88px)] flex items-center justify-center px-4 py-12">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
     <Link
      href="/login"
      className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 mb-4"
     >
      ← Back to login
     </Link>
     <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset password</h1>
     <p className="text-gray-600 mb-8">
      Enter your email and we&apos;ll send you a reset link.
     </p>

     <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
       <label
        htmlFor="email"
        className="block text-sm font-medium text-gray-700 mb-1"
       >
        Email
       </label>
       <input
        id="email"
        name="email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
        required
       />
      </div>

      <CustomAlert type={alertState?.type} message={alertState?.message} />

      <button
       type="submit"
       disabled={isSubmitting}
       className="w-full bg-blue-500 text-white rounded-lg py-2.5 font-semibold hover:bg-blue-600 transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
      >
       {isSubmitting ? "Sending link..." : "Send reset link"}
      </button>
     </form>
    </div>
   </section>
  </main>
 );
}
