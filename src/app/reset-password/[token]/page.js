"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomAlert from "@/components/CustomAlert";
import { authApi } from "@/lib/api";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage({ params }) {
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [alertState, setAlertState] = useState(null);
 const router = useRouter();
 const { token } = use(params);

 const handleSubmit = async (event) => {
  event.preventDefault();
  setAlertState(null);
  setIsSubmitting(true);

  const formData = new FormData(event.currentTarget);
  const payload = {
   password: formData.get("password")?.toString(),
   confirmPassword: formData.get("confirmPassword")?.toString(),
  };

  try {
   const data = await authApi.resetPassword(token, payload);
   setAlertState({
    type: "success",
    message: data?.message || "Password updated successfully.",
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
     <h1 className="text-3xl font-bold text-gray-900 mb-2">
      Set a new password
     </h1>
     <p className="text-gray-600 mb-8">
      Create a new password for your Trip Planner account.
     </p>

     <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
       <label
        htmlFor="password"
        className="block text-sm font-medium text-gray-700 mb-1"
       >
        New password
       </label>
       <div className="relative">
        <input
         id="password"
         name="password"
         type={showPassword ? "text" : "password"}
         placeholder="Create a new password"
         className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-11 outline-none focus:ring-2 focus:ring-blue-500"
         required
        />
        <button
         type="button"
         onClick={() => setShowPassword((prev) => !prev)}
         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
         aria-label={showPassword ? "Hide password" : "Show password"}
        >
         {showPassword ? (
          <EyeOff className="h-4 w-4" />
         ) : (
          <Eye className="h-4 w-4" />
         )}
        </button>
       </div>
      </div>

      <div>
       <label
        htmlFor="confirmPassword"
        className="block text-sm font-medium text-gray-700 mb-1"
       >
        Confirm password
       </label>
       <div className="relative">
        <input
         id="confirmPassword"
         name="confirmPassword"
         type={showConfirmPassword ? "text" : "password"}
         placeholder="Re-enter your new password"
         className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-11 outline-none focus:ring-2 focus:ring-blue-500"
         required
        />
        <button
         type="button"
         onClick={() => setShowConfirmPassword((prev) => !prev)}
         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
         aria-label={
          showConfirmPassword
           ? "Hide confirm password"
           : "Show confirm password"
         }
        >
         {showConfirmPassword ? (
          <EyeOff className="h-4 w-4" />
         ) : (
          <Eye className="h-4 w-4" />
         )}
        </button>
       </div>
      </div>

      <CustomAlert type={alertState?.type} message={alertState?.message} />

      <button
       type="submit"
       disabled={isSubmitting}
       className="w-full bg-blue-500 text-white rounded-lg py-2.5 font-semibold hover:bg-blue-600 transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
      >
       {isSubmitting ? "Updating..." : "Reset password"}
      </button>
     </form>
    </div>
   </section>
  </main>
 );
}
