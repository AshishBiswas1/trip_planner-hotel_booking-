"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomAlert from "@/components/CustomAlert";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
 const [showPassword, setShowPassword] = useState(false);
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
   email: formData.get("email")?.toString().trim(),
   password: formData.get("password")?.toString(),
  };

  try {
   const data = await authApi.login(payload);
   await loginWithAuthData(data);
   setAlertState({
    type: "success",
    message: "Login successful. Redirecting to home...",
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
   <section className="min-h-[calc(100vh-88px)] flex items-center justify-center px-4 py-12">
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
     <Link
      href="/"
      className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 mb-4"
     >
      ← Back to home
     </Link>
     <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
     <p className="text-gray-600 mb-8">
      Log in to continue planning your next trip.
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
        data-lpignore="true"
        data-1p-ignore="true"
        suppressHydrationWarning
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
         placeholder="Enter your password"
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

      <CustomAlert type={alertState?.type} message={alertState?.message} />

      <button
       type="submit"
       disabled={isSubmitting}
       className="w-full bg-blue-500 text-white rounded-lg py-2.5 font-semibold hover:bg-blue-600 transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
      >
       {isSubmitting ? "Logging in..." : "Login"}
      </button>
     </form>

     <p className="text-sm text-gray-600 mt-6 text-center">
      Don&apos;t have an account?{" "}
      <Link
       href="/signup"
       className="text-blue-600 hover:underline font-medium"
      >
       Sign up
      </Link>
     </p>
     <p className="text-sm text-gray-600 mt-3 text-center">
      <Link
       href="/forgot-password"
       className="text-blue-600 hover:underline font-medium"
      >
       Forgot your password?
      </Link>
     </p>
    </div>
   </section>
  </main>
 );
}
