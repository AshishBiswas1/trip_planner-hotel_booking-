"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import CustomAlert from "@/components/CustomAlert";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [alertState, setAlertState] = useState(null);
 const router = useRouter();
 const { loginWithAuthData } = useAuth();

 const handleSubmit = async (event) => {
  event.preventDefault();
  setAlertState(null);
  setIsSubmitting(true);

  const formData = new FormData(event.currentTarget);
  const payload = {
   name: formData.get("name")?.toString().trim(),
   email: formData.get("email")?.toString().trim(),
   password: formData.get("password")?.toString(),
   confirmPassword: formData.get("confirmPassword")?.toString(),
  };

  try {
   const data = await authApi.register(payload);
   await loginWithAuthData(data);
   setAlertState({
    type: "success",
    message: "Signup successful. Redirecting to home...",
   });
   setTimeout(() => {
    router.push("/");
   }, 900);
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
   <Header />
   <section className="min-h-[calc(100vh-88px)] flex items-center justify-center px-4 py-12">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
     <Link
      href="/"
      className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 mb-4"
     >
      ← Back to home
     </Link>
     <h1 className="text-3xl font-bold text-gray-900 mb-2">
      Create your account
     </h1>
     <p className="text-gray-600 mb-8">
      Start booking hotels and flights in one place.
     </p>

     <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
       <label
        htmlFor="name"
        className="block text-sm font-medium text-gray-700 mb-1"
       >
        Full name
       </label>
       <input
        id="name"
        name="name"
        type="text"
        placeholder="Your full name"
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
        required
       />
      </div>

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
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
        required
       />
      </div>

      <div>
       <label
        htmlFor="password"
        className="block text-sm font-medium text-gray-700 mb-1"
       >
        Password
       </label>
       <div className="relative">
        <input
         id="password"
         name="password"
         type={showPassword ? "text" : "password"}
         placeholder="Create a password"
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
         placeholder="Re-enter your password"
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
       {isSubmitting ? "Creating account..." : "Sign Up"}
      </button>
     </form>

     <p className="text-sm text-gray-600 mt-6 text-center">
      Already have an account?{" "}
      <Link href="/login" className="text-blue-600 hover:underline font-medium">
       Login
      </Link>
     </p>
    </div>
   </section>
  </main>
 );
}
