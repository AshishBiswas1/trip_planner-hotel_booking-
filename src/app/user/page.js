"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
 ArrowLeft,
 BadgeCheck,
 BriefcaseBusiness,
 Camera,
 ChevronRight,
 CreditCard,
 Edit2,
 LoaderCircle,
 LockKeyhole,
 Mail,
 MessageSquareText,
 PencilLine,
 Save,
 Shield,
 Star,
 Ticket,
 Trash2,
 UserRound,
} from "lucide-react";
import CustomAlert from "@/components/CustomAlert";
import { useAuth } from "@/context/AuthContext";
import {
 authApi,
 authStorage,
 bookingApi,
 paymentApi,
 reviewApi,
 tripApi,
 aiApi,
} from "@/lib/api";

const NAV_ITEMS = [
 {
  id: "bookings",
  label: "Bookings",
  icon: Ticket,
  tone: "from-cyan-500 to-sky-500",
 },
 {
  id: "reviews",
  label: "Reviews",
  icon: MessageSquareText,
  tone: "from-emerald-500 to-teal-500",
 },
 {
  id: "payments",
  label: "Payments",
  icon: CreditCard,
  tone: "from-amber-500 to-orange-500",
 },
 {
  id: "trips",
  label: "Trips",
  icon: BriefcaseBusiness,
  tone: "from-violet-500 to-fuchsia-500",
 },
];

const INITIAL_DATA = {
 bookings: [],
 reviews: [],
 payments: [],
 trips: [],
};

function formatDate(value) {
 if (!value) return "-";

 const date = new Date(value);
 if (Number.isNaN(date.getTime())) return "-";

 return new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
 }).format(date);
}

function formatDateForInput(value) {
 if (!value) return "";

 const date = new Date(value);
 if (Number.isNaN(date.getTime())) return "";

 return date.toISOString().slice(0, 10);
}

function formatCoordinateForInput(value) {
 if (value === null || value === undefined || value === "") return "";
 const numericValue = Number(value);
 return Number.isFinite(numericValue) ? String(numericValue) : "";
}

function formatMoney(value, currency = "INR") {
 const amount = Number(value);
 if (!Number.isFinite(amount)) return "-";

 return new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency,
  maximumFractionDigits: 0,
 }).format(amount);
}

function getInitials(name = "User") {
 return name
  .split(" ")
  .map((part) => part[0])
  .filter(Boolean)
  .slice(0, 2)
  .join("")
  .toUpperCase();
}

function unwrapUser(response) {
 return response?.data?.data || response?.data?.user || response?.user || null;
}

function unwrapBookings(response) {
 return response?.data?.bookings || [];
}

function unwrapReviews(response) {
 return response?.data?.reviews || [];
}

function unwrapPayments(response) {
 return response?.data?.payments || [];
}

function unwrapTrips(response) {
 return response?.data?.trips || [];
}

function SectionChip({ icon: Icon, label, active, onClick, tone }) {
 return (
  <button
   type="button"
   onClick={onClick}
   className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
    active
     ? "border-cyan-300 bg-white shadow-md shadow-cyan-500/10"
     : "border-white/60 bg-white/50 hover:border-slate-200 hover:bg-white"
   }`}
  >
   <span
    className={`rounded-xl bg-gradient-to-br ${tone} p-2 text-white shadow-sm`}
   >
    <Icon className="h-4 w-4" />
   </span>
   <span className="flex-1">
    <span className="block text-sm font-bold text-slate-800">{label}</span>
    <span className="block text-xs text-slate-500">
     View your saved {label.toLowerCase()} data
    </span>
   </span>
   <ChevronRight className="h-4 w-4 text-slate-400" />
  </button>
 );
}

export default function UserPage() {
 const router = useRouter();
 const { token, user: authUser, isAuthLoading, isAuthenticated } = useAuth();
 const [profile, setProfile] = useState(authUser || null);
 const [activeSection, setActiveSection] = useState("bookings");
 const [data, setData] = useState(INITIAL_DATA);
 const [pageError, setPageError] = useState("");
 const [isLoading, setIsLoading] = useState(true);

 // Profile editing state
 const [isEditingProfile, setIsEditingProfile] = useState(false);
 const [editName, setEditName] = useState(authUser?.name || "");
 const [editEmail, setEditEmail] = useState(authUser?.email || "");
 const [editPhotoFile, setEditPhotoFile] = useState(null);
 const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");
 const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
 const [alertState, setAlertState] = useState(null);
 // Password change state
 const [currentPassword, setCurrentPassword] = useState("");
 const [newPassword, setNewPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
 const [passwordAlert, setPasswordAlert] = useState(null);

 const loadAccountData = useCallback(async () => {
  if (isAuthLoading || !isAuthenticated || !token) return;

  setIsLoading(true);
  setPageError("");

  const [meResult, bookingsResult, reviewsResult, paymentsResult, tripsResult] =
   await Promise.allSettled([
    authApi.getMe(token),
    bookingApi.getMyBookings(token),
    reviewApi.getMyReviews(token),
    paymentApi.getMyPayments(token),
    tripApi.getUserTrips({}, token),
   ]);

  if (meResult.status === "fulfilled") {
   setProfile(unwrapUser(meResult.value) || authUser || null);
  } else {
   setProfile(authUser || null);
   setPageError(meResult.reason?.message || "Unable to load profile data.");
  }

  setData({
   bookings:
    bookingsResult.status === "fulfilled"
     ? unwrapBookings(bookingsResult.value)
     : [],
   reviews:
    reviewsResult.status === "fulfilled"
     ? unwrapReviews(reviewsResult.value)
     : [],
   payments:
    paymentsResult.status === "fulfilled"
     ? unwrapPayments(paymentsResult.value)
     : [],
   trips:
    tripsResult.status === "fulfilled" ? unwrapTrips(tripsResult.value) : [],
  });

  setIsLoading(false);
 }, [authUser, isAuthLoading, isAuthenticated, token]);

 useEffect(() => {
  if (isAuthLoading) return;

  if (!isAuthenticated || !token) {
   router.replace("/login?next=/user");
  }
 }, [isAuthLoading, isAuthenticated, token, router]);

 useEffect(() => {
  let isMounted = true;

  if (isAuthLoading || !isAuthenticated || !token) return;

  loadAccountData().finally(() => {
   if (!isMounted) return;
  });

  return () => {
   isMounted = false;
  };
 }, [authUser, isAuthLoading, isAuthenticated, token, loadAccountData]);

 const activeConfig = useMemo(
  () => NAV_ITEMS.find((item) => item.id === activeSection) || NAV_ITEMS[0],
  [activeSection],
 );

 const activeRecords = data[activeSection] || [];

 const handleSaveProfile = async (event) => {
  event.preventDefault();
  setIsSubmittingProfile(true);
  setAlertState(null);

  try {
   const hasPhoto = Boolean(editPhotoFile);
   const payload = hasPhoto
    ? (() => {
       const formData = new FormData();
       formData.append("name", editName.trim());
       formData.append("email", editEmail.trim());
       formData.append("photo", editPhotoFile);
       return formData;
      })()
    : {
       name: editName.trim(),
       email: editEmail.trim(),
      };

   const response = await authApi.updateMe(payload, token);
   const unwrapped =
    response?.data?.user || response?.data?.data || response?.user || profile;

   setProfile(unwrapped);
   authStorage.setUser(unwrapped);
   setEditName(unwrapped?.name || "");
   setEditEmail(unwrapped?.email || "");
   setEditPhotoFile(null);
   setPhotoPreviewUrl("");
   setIsEditingProfile(false);

   setAlertState({
    type: "success",
    message: "Profile updated successfully!",
   });
  } catch (error) {
   setAlertState({
    type: "error",
    message: error?.message || "Unable to update profile.",
   });
  } finally {
   setIsSubmittingProfile(false);
  }
 };

 const handleUpdatePassword = async (event) => {
  event?.preventDefault?.();
  setIsSubmittingPassword(true);
  setPasswordAlert(null);

  try {
   if (!currentPassword || !newPassword) {
    throw new Error("Please provide current and new passwords.");
   }
   if (newPassword !== confirmPassword) {
    throw new Error("New password and confirmation do not match.");
   }

   const response = await authApi.updatePassword(
    { currentPassword, newPassword, confirmPassword },
    token,
   );

   const updatedUser =
    response?.data?.user || response?.data?.data || response?.user || profile;
   const nextToken = response?.token || token;

   if (nextToken) {
    authStorage.setToken(nextToken);
   }

   if (updatedUser) {
    setProfile(updatedUser);
    authStorage.setUser(updatedUser);
   }

   setPasswordAlert({
    type: "success",
    message: "Password updated successfully.",
   });
   setCurrentPassword("");
   setNewPassword("");
   setConfirmPassword("");
  } catch (error) {
   setPasswordAlert({
    type: "error",
    message: error?.message || "Unable to update password.",
   });
  } finally {
   setIsSubmittingPassword(false);
  }
 };

 return (
  <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.2),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_24%),linear-gradient(180deg,_#f8fdff_0%,_#eef7f3_100%)] py-8 sm:py-12">
   <section className="container mx-auto px-4">
    <Link
     href="/"
     className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-x-0.5 hover:border-cyan-300 hover:text-cyan-700"
    >
     <ArrowLeft className="h-4 w-4" />
     Back to home
    </Link>

    <motion.div
     initial={{ opacity: 0, y: 18 }}
     animate={{ opacity: 1, y: 0 }}
     transition={{ duration: 0.45 }}
     className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-2xl shadow-slate-900/10 backdrop-blur"
    >
     <div className="grid gap-6 border-b border-slate-200/70 p-6 lg:grid-cols-[320px_1fr] lg:p-8">
      <aside className="space-y-5 rounded-[1.75rem] border border-slate-200 bg-slate-50/90 p-5 shadow-sm">
       <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-white bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/20">
         <div className="flex h-full w-full items-center justify-center text-xl font-black">
          {profile?.photo && profile.photo !== "default.jpg" ? (
           <img
            src={profile.photo}
            alt={profile?.name || "Profile"}
            className="h-full w-full object-cover rounded-full block"
           />
          ) : (
           getInitials(profile?.name || authUser?.name || "User")
          )}
         </div>
        </div>

        <div>
         <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">
          Account
         </p>
         <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Account overview
         </h1>
         <p className="text-sm text-slate-600">
          Access your profile settings, bookings, reviews, payments, and trips
          in one place.
         </p>
        </div>
       </div>

       <div className="grid grid-cols-2 gap-3">
        <StatCard label="Bookings" value={data.bookings.length} />
        <StatCard label="Reviews" value={data.reviews.length} />
        <StatCard label="Payments" value={data.payments.length} />
        <StatCard label="Trips" value={data.trips.length} />
       </div>

       <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
        <div className="flex items-center gap-3">
         <span className="rounded-xl bg-cyan-100 p-2 text-cyan-700">
          <BadgeCheck className="h-4 w-4" />
         </span>
         <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
           Role
          </p>
          <p className="font-semibold text-slate-900">
           {profile?.role || "user"}
          </p>
         </div>
        </div>
       </div>

       <button
        type="button"
        onClick={() => {
         setIsEditingProfile(!isEditingProfile);
         if (isEditingProfile) {
          setEditName(profile?.name || "");
          setEditEmail(profile?.email || "");
         }
        }}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-cyan-500/20 transition hover:from-cyan-600 hover:to-teal-600"
       >
        <Edit2 className="h-4 w-4" />
        {isEditingProfile ? "Cancel" : "Edit details"}
       </button>

       <div className="space-y-3">
        {NAV_ITEMS.map((item) => {
         const Icon = item.icon;

         return (
          <SectionChip
           key={item.id}
           icon={Icon}
           label={item.label}
           tone={item.tone}
           active={activeSection === item.id}
           onClick={() => setActiveSection(item.id)}
          />
         );
        })}
       </div>
      </aside>

      <div className="space-y-6">
       {!isEditingProfile && (
        <div className="rounded-[1.75rem] bg-slate-900 px-6 py-6 text-white sm:px-7">
         <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
          /me profile
         </p>
         <h2 className="mt-2 text-3xl font-black tracking-tight">
          Everything about your account in one place
         </h2>
         <p className="mt-2 max-w-3xl text-sm text-white/80 sm:text-base">
          This page loads the authenticated user from the backend and stitches
          in your bookings, reviews, payments, and trips through their
          respective protected routes.
         </p>

         <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/90">
          <Pill label={profile?.email || "Email unavailable"} />
          <Pill label={`Role: ${profile?.role || "user"}`} />
          <Pill label={`Section: ${activeConfig.label}`} />
         </div>
        </div>
       )}

       {pageError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
         {pageError}
        </div>
       ) : null}

       {!isEditingProfile && (
        <div className="flex flex-wrap gap-3 lg:hidden">
         {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.id;

          return (
           <button
            key={item.id}
            type="button"
            onClick={() => setActiveSection(item.id)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
             active
              ? "border-cyan-300 bg-cyan-50 text-cyan-700"
              : "border-slate-200 bg-white text-slate-600"
            }`}
           >
            <Icon className="h-4 w-4" />
            {item.label}
           </button>
          );
         })}
        </div>
       )}

       {!isEditingProfile && (
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
         <div className="mb-5 flex items-center justify-between gap-4">
          <div>
           <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">
            {activeConfig.label}
           </p>
           <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
            {activeConfig.label} overview
           </h3>
          </div>

          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
           {activeRecords.length} records
          </div>
         </div>

         {isLoading ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50">
           <div className="text-center">
            <LoaderCircle className="mx-auto mb-3 h-7 w-7 animate-spin text-cyan-600" />
            <p className="text-sm text-slate-600">Loading account data...</p>
           </div>
          </div>
         ) : activeSection === "bookings" ? (
          <BookingList bookings={activeRecords} />
         ) : activeSection === "reviews" ? (
          <ReviewList reviews={activeRecords} onReload={loadAccountData} />
         ) : activeSection === "payments" ? (
          <PaymentList payments={activeRecords} />
         ) : (
          <TripList
           trips={activeRecords}
           router={router}
           onReload={loadAccountData}
          />
         )}
        </div>
       )}

       {isEditingProfile && (
        <ProfileEditForm
         profile={profile}
         editName={editName}
         editEmail={editEmail}
         photoPreviewUrl={photoPreviewUrl}
         onNameChange={(e) => setEditName(e.target.value)}
         onEmailChange={(e) => setEditEmail(e.target.value)}
         onPhotoChange={(e) => {
          const nextFile = e.target.files?.[0] || null;
          setEditPhotoFile(nextFile);

          if (photoPreviewUrl) {
           URL.revokeObjectURL(photoPreviewUrl);
          }

          if (nextFile) {
           setPhotoPreviewUrl(URL.createObjectURL(nextFile));
          } else {
           setPhotoPreviewUrl("");
          }
         }}
         onSave={handleSaveProfile}
         isSubmitting={isSubmittingProfile}
         alertState={alertState}
         // password props
         currentPassword={currentPassword}
         newPassword={newPassword}
         confirmPassword={confirmPassword}
         onCurrentPasswordChange={(e) => setCurrentPassword(e.target.value)}
         onNewPasswordChange={(e) => setNewPassword(e.target.value)}
         onConfirmPasswordChange={(e) => setConfirmPassword(e.target.value)}
         onPasswordSave={handleUpdatePassword}
         isPwdSubmitting={isSubmittingPassword}
         pwdAlertState={passwordAlert}
        />
       )}
      </div>
     </div>
    </motion.div>
   </section>
  </main>
 );
}

function StatCard({ label, value }) {
 return (
  <div className="rounded-2xl bg-white p-4 text-center ring-1 ring-slate-100">
   <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
    {label}
   </p>
   <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
  </div>
 );
}

function Pill({ label }) {
 return (
  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
   {label}
  </span>
 );
}

function ProfileEditForm({
 profile,
 editName,
 editEmail,
 photoPreviewUrl,
 onNameChange,
 onEmailChange,
 onPhotoChange,
 onSave,
 isSubmitting,
 alertState,
 // password props
 currentPassword,
 newPassword,
 confirmPassword,
 onCurrentPasswordChange,
 onNewPasswordChange,
 onConfirmPasswordChange,
 onPasswordSave,
 isPwdSubmitting,
 pwdAlertState,
}) {
 return (
  <div className="space-y-6">
   {alertState ? (
    <CustomAlert type={alertState.type} message={alertState.message} />
   ) : null}

   <form onSubmit={onSave} className="space-y-6">
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
     <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">
       Profile settings
      </p>
      <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
       Update your details
      </h3>
     </div>

     <div className="space-y-6">
      <div>
       <label htmlFor="name" className="block">
        <span className="mb-3 block text-sm font-semibold text-slate-700">
         Name
        </span>
        <div className="relative">
         <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <UserRound className="h-4 w-4" />
         </span>
         <input
          id="name"
          type="text"
          value={editName}
          onChange={onNameChange}
          placeholder="Your name"
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
          required
         />
        </div>
       </label>
      </div>

      <div>
       <label htmlFor="email" className="block">
        <span className="mb-3 block text-sm font-semibold text-slate-700">
         Email
        </span>
        <div className="relative">
         <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Mail className="h-4 w-4" />
         </span>
         <input
          id="email"
          type="email"
          value={editEmail}
          onChange={onEmailChange}
          placeholder="you@example.com"
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
          required
         />
        </div>
       </label>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100">
       <div className="flex items-start gap-3">
        <span className="rounded-xl bg-cyan-100 p-2 text-cyan-700">
         <Camera className="h-4 w-4" />
        </span>
        <div className="flex-1">
         <p className="text-sm font-bold text-slate-900">Image upload</p>
         <p className="text-xs text-slate-600">Upload a profile picture.</p>

         <div className="mt-3 flex items-center gap-3">
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white">
           {photoPreviewUrl ||
           (profile?.photo && profile.photo !== "default.jpg") ? (
            <img
             src={photoPreviewUrl || profile.photo}
             alt="Profile preview"
             className="h-full w-full object-cover rounded-full block"
            />
           ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
             <UserRound className="h-5 w-5" />
            </div>
           )}
          </div>

          <label className="inline-flex cursor-pointer items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:border-cyan-300 hover:text-cyan-700">
           Choose photo
           <input
            type="file"
            accept="image/*"
            onChange={onPhotoChange}
            className="hidden"
           />
          </label>
         </div>
        </div>
       </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100">
       <div className="flex items-start gap-3">
        <span className="rounded-xl bg-amber-100 p-2 text-amber-700">
         <LockKeyhole className="h-4 w-4" />
        </span>
        <div className="flex-1">
         <p className="text-sm font-bold text-slate-900">Password change</p>
         <p className="text-xs text-slate-600">
          Change your password while logged in.
         </p>

         {pwdAlertState ? (
          <div className="mt-3">
           <CustomAlert
            type={pwdAlertState.type}
            message={pwdAlertState.message}
           />
          </div>
         ) : null}

         <div className="mt-3 space-y-3">
          <label className="block">
           <span className="block text-sm font-semibold text-slate-700">
            Current password
           </span>
           <input
            type="password"
            value={currentPassword}
            onChange={onCurrentPasswordChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
            placeholder="Current password"
            required
           />
          </label>

          <label className="block">
           <span className="block text-sm font-semibold text-slate-700">
            New password
           </span>
           <input
            type="password"
            value={newPassword}
            onChange={onNewPasswordChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
            placeholder="New password"
            required
           />
          </label>

          <label className="block">
           <span className="block text-sm font-semibold text-slate-700">
            Confirm new password
           </span>
           <input
            type="password"
            value={confirmPassword}
            onChange={onConfirmPasswordChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white py-3 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
            placeholder="Confirm new password"
            required
           />
          </label>

          <div className="mt-2">
           <button
            type="button"
            onClick={onPasswordSave}
            disabled={isPwdSubmitting}
            className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
           >
            {isPwdSubmitting ? (
             <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
             <Shield className="h-4 w-4" />
            )}
            Change password
           </button>
          </div>
         </div>
        </div>
       </div>
      </div>
     </div>

     <div className="mt-6 flex flex-wrap gap-3">
      <button
       type="submit"
       disabled={isSubmitting}
       className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-600 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
       {isSubmitting ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
       ) : (
        <Save className="h-4 w-4" />
       )}
       Save changes
      </button>
     </div>
    </div>
   </form>
  </div>
 );
}

function EmptyState({ title, description, actionHref, actionLabel }) {
 return (
  <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
   <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
    <UserRound className="h-7 w-7 text-cyan-600" />
   </div>
   <h4 className="mt-4 text-xl font-black text-slate-900">{title}</h4>
   <p className="mt-2 max-w-md text-sm text-slate-600">{description}</p>
   {actionHref ? (
    <Link
     href={actionHref}
     className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
    >
     {actionLabel}
     <ChevronRight className="h-4 w-4" />
    </Link>
   ) : null}
  </div>
 );
}

function BookingList({ bookings }) {
 if (!bookings.length) {
  return (
   <EmptyState
    title="No bookings yet"
    description="Once you confirm a hotel or travel booking, it will show up here."
    actionHref="/hotels"
    actionLabel="Explore hotels"
   />
  );
 }

 return (
  <div className="grid gap-4">
   {bookings.map((booking) => (
    <div
     key={booking._id}
     className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
    >
     <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
       <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-700">
         {booking.bookingType || "hotel"}
        </span>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
         {booking.status || "pending"}
        </span>
       </div>

       <h4 className="mt-3 text-lg font-black text-slate-900">
        {booking.hotel?.name || booking.travelDetails?.provider || "Booking"}
       </h4>
       <p className="mt-1 text-sm text-slate-600">
        {booking.bookingType === "travel"
         ? `${booking.travelDetails?.from || "-"} → ${booking.travelDetails?.to || "-"}`
         : `${booking.hotel?.location || "Hotel"} · Room ${booking.room?.roomNumber || "-"}`}
       </p>
      </div>

      <div className="rounded-2xl bg-white px-4 py-3 text-right ring-1 ring-slate-100">
       <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        Total
       </p>
       <p className="text-lg font-black text-slate-900">
        {formatMoney(booking.totalPrice)}
       </p>
      </div>
     </div>

     <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <InfoTile label="Check in" value={formatDate(booking.checkInDate)} />
      <InfoTile label="Check out" value={formatDate(booking.checkOutDate)} />
      <InfoTile label="Guests" value={booking.numberOfGuests || "-"} />
      <InfoTile label="Days" value={booking.numberOfDays || "-"} />
     </div>
    </div>
   ))}
  </div>
 );
}

function ReviewList({ reviews, onReload }) {
 const [editingId, setEditingId] = useState(null);
 const [editRating, setEditRating] = useState(0);
 const [editComment, setEditComment] = useState("");
 const [isUpdating, setIsUpdating] = useState(false);
 const [alertState, setAlertState] = useState(null);

 if (!reviews.length) {
  return (
   <EmptyState
    title="No reviews yet"
    description="When you leave hotel feedback, it will appear here alongside the rated property."
    actionHref="/hotels"
    actionLabel="Browse hotels"
   />
  );
 }

 const handleEditClick = (review) => {
  setEditingId(review._id);
  setEditRating(review.rating);
  setEditComment(review.comment);
  setAlertState(null);
 };

 const handleDeleteReview = async (reviewId) => {
  if (!window.confirm("Are you sure you want to delete this review?")) return;

  try {
   await reviewApi.deleteReview(reviewId);
   await onReload?.();
   setAlertState({
    type: "success",
    message: "Review deleted successfully.",
   });
  } catch (error) {
   setAlertState({
    type: "error",
    message: "Unable to delete review.",
   });
  }
 };

 const handleSaveReview = async (reviewId) => {
  setIsUpdating(true);
  setAlertState(null);

  try {
   await reviewApi.updateReview(reviewId, {
    rating: editRating,
    comment: editComment,
   });
   await onReload?.();
   setEditingId(null);
   setAlertState({
    type: "success",
    message: "Review updated successfully.",
   });
  } catch (error) {
   setAlertState({
    type: "error",
    message: "Unable to update review.",
   });
  } finally {
   setIsUpdating(false);
  }
 };

 return (
  <div className="space-y-4">
   {alertState ? (
    <CustomAlert type={alertState.type} message={alertState.message} />
   ) : null}

   {reviews.map((review) => (
    <div
     key={review._id}
     className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
    >
     {editingId === review._id ? (
      <div className="space-y-4">
       <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
         Rating
        </label>
        <div className="flex items-center gap-2">
         {[1, 2, 3, 4, 5].map((num) => (
          <button
           key={num}
           type="button"
           onClick={() => setEditRating(num)}
           className={`p-1 transition ${editRating >= num ? "text-yellow-400" : "text-slate-300"}`}
          >
           <Star className="h-6 w-6 fill-current" />
          </button>
         ))}
        </div>
       </div>

       <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
         Comment
        </label>
        <textarea
         value={editComment}
         onChange={(e) => setEditComment(e.target.value)}
         className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
         rows="4"
         placeholder="Your review comment..."
        />
       </div>

       <div className="flex flex-wrap gap-2">
        <button
         type="button"
         onClick={() => handleSaveReview(review._id)}
         disabled={isUpdating}
         className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
        >
         {isUpdating ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
         ) : (
          <Save className="h-4 w-4" />
         )}
         Save
        </button>
        <button
         type="button"
         onClick={() => setEditingId(null)}
         className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
         Cancel
        </button>
       </div>
      </div>
     ) : (
      <>
       <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
         <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          Review
         </p>
         <h4 className="mt-2 text-lg font-black text-slate-900">
          {review.hotel?.name || "Hotel review"}
         </h4>
        </div>

        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
         <Star className="h-4 w-4 fill-current" />
         {review.rating}
        </div>
       </div>

       <p className="mt-4 text-sm leading-6 text-slate-700">
        {review.comment || "No comment was added with this review."}
       </p>

       <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {formatDate(review.createdAt)}
       </p>

       <div className="mt-4 flex flex-wrap gap-2">
        <button
         type="button"
         onClick={() => handleEditClick(review)}
         className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
        >
         <Edit2 className="h-4 w-4" />
         Edit
        </button>
        <button
         type="button"
         onClick={() => handleDeleteReview(review._id)}
         className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-200"
        >
         <Trash2 className="h-4 w-4" />
         Delete
        </button>
       </div>
      </>
     )}
    </div>
   ))}
  </div>
 );
}

function PaymentList({ payments }) {
 if (!payments.length) {
  return (
   <EmptyState
    title="No payments yet"
    description="Completed and pending payments linked to your account will be shown here."
    actionHref="/travel/checkout"
    actionLabel="Make a payment"
   />
  );
 }

 return (
  <div className="grid gap-4">
   {payments.map((payment) => (
    <div
     key={payment._id}
     className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
    >
     <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
       <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
        Payment
       </p>
       <h4 className="mt-2 text-lg font-black text-slate-900">
        {payment.booking?.bookingType === "travel"
         ? payment.booking?.travelDetails?.mode ||
           payment.travelMeta?.mode ||
           "Travel payment"
         : payment.hotel?.name || "Hotel payment"}
       </h4>
       <p className="mt-1 text-sm text-slate-600">
        {payment.booking?.bookingType === "travel"
         ? `${payment.booking?.travelDetails?.from || "-"} → ${payment.booking?.travelDetails?.to || "-"}`
         : `${payment.hotel?.location || "No hotel location"} · ${payment.room?.roomNumber || "No room info"}`}
       </p>
      </div>

      <div className="rounded-2xl bg-white px-4 py-3 text-right ring-1 ring-slate-100">
       <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        Amount
       </p>
       <p className="text-lg font-black text-slate-900">
        {formatMoney(payment.amount, payment.currency)}
       </p>
      </div>
     </div>

     <div className="mt-4 grid gap-3 sm:grid-cols-3">
      <InfoTile label="Method" value={payment.paymentMethod || "-"} />
      <InfoTile label="Status" value={payment.status || "-"} />
      <InfoTile label="Created" value={formatDate(payment.createdAt)} />
     </div>
    </div>
   ))}
  </div>
 );
}

function TripList({ trips, router, onReload }) {
 const [editingId, setEditingId] = useState(null);
 const [editDetails, setEditDetails] = useState("");
 const [editStartDate, setEditStartDate] = useState("");
 const [editEndDate, setEditEndDate] = useState("");
 const [editTravelMode, setEditTravelMode] = useState("DRIVE");
 const [editStartLat, setEditStartLat] = useState("");
 const [editStartLng, setEditStartLng] = useState("");
 const [editEndLat, setEditEndLat] = useState("");
 const [editEndLng, setEditEndLng] = useState("");
 const [editIsAutoPlanned, setEditIsAutoPlanned] = useState(true);
 const [isUpdating, setIsUpdating] = useState(false);
 const [isPredicting, setIsPredicting] = useState(false);
 const [alertState, setAlertState] = useState(null);

 const travelModeOptions = [
  "DRIVE",
  "TWO_WHEELER",
  "TRANSIT",
  "WALK",
  "BICYCLE",
 ];

 if (!trips.length) {
  return (
   <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center gap-4">
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
     <BriefcaseBusiness className="h-7 w-7 text-violet-600" />
    </div>
    <h4 className="text-xl font-black text-slate-900">No trips yet</h4>
    <p className="max-w-md text-sm text-slate-600">
     Saved trip plans created through the planner show up here once they are
     sent to the backend.
    </p>
    <button
     type="button"
     onClick={() => router.push("/plan-trip")}
     className="mt-2 inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
    >
     Plan a trip
     <ChevronRight className="h-4 w-4" />
    </button>
   </div>
  );
 }

 const handleEditClick = (trip) => {
  setEditingId(trip._id);
  setEditDetails(trip.details);
  setEditStartDate(formatDateForInput(trip.startDate));
  setEditEndDate(formatDateForInput(trip.endDate));
  setEditTravelMode(trip.travelMode || "DRIVE");
  setEditStartLat(
   formatCoordinateForInput(trip.startLocation?.coordinates?.lat),
  );
  setEditStartLng(
   formatCoordinateForInput(trip.startLocation?.coordinates?.lng),
  );
  setEditEndLat(formatCoordinateForInput(trip.endLocation?.coordinates?.lat));
  setEditEndLng(formatCoordinateForInput(trip.endLocation?.coordinates?.lng));
  setEditIsAutoPlanned(Boolean(trip.isAutoPlanned));
  setAlertState(null);
 };

 const handleDeleteTrip = async (tripId) => {
  if (!window.confirm("Are you sure you want to delete this trip?")) return;

  try {
   await tripApi.deleteTrip(tripId);
   await onReload?.();
   setAlertState({
    type: "success",
    message: "Trip deleted successfully.",
   });
  } catch (error) {
   setAlertState({
    type: "error",
    message: "Unable to delete trip.",
   });
  }
 };

 const handlePredictTrip = async (tripId) => {
  setIsPredicting(true);
  setAlertState(null);

  try {
   // Find the trip to get its details
   const tripIndex = data.trips.findIndex((t) => t._id === tripId);
   if (tripIndex === -1) {
    throw new Error("Trip not found");
   }
   const trip = data.trips[tripIndex];

   // Calculate distance from trip coordinates
   const haversineKm = (a, b) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const aa =
     sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
   };

   const distanceKm = haversineKm(
    trip.startLocation.coordinates,
    trip.endLocation.coordinates,
   );

   // Calculate trip duration in days
   const startDate = new Date(trip.startDate);
   const endDate = new Date(trip.endDate);
   const durationDays = Math.max(
    1,
    Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)),
   );

   // City to airport code mapping
   const cityToAirportCode = {
    delhi: "DEL",
    "new delhi": "DEL",
    mumbai: "BOM",
    bangalore: "BLR",
    hyderabad: "HYD",
    kolkata: "CCU",
    chennai: "MAA",
    pune: "PNQ",
    goa: "GOI",
    lucknow: "LKO",
    agra: "AGR",
    jaipur: "JAI",
    bhopal: "BHO",
    indore: "IDR",
    kochi: "COK",
    thiruvananthapuram: "TRV",
    chandigarh: "CHD",
    amritsar: "ATQ",
    nagpur: "NAG",
   };

   const getAirportCode = (location) => {
    if (!location) return null;
    const placeName = location.label || location.name || "";
    const normalized = placeName.toLowerCase().trim();
    return (
     cityToAirportCode[normalized] || normalized.toUpperCase().substring(0, 3)
    );
   };

   // Build prediction payload from trip data
   const payload = {
    tripId,
    hotel: {
     data: {
      City: trip.details?.split(" ").slice(0, 2).join(" ") || "Default City",
      Accomadation_Type: "Standard",
     },
     nights: durationDays,
    },
    touring: [
     {
      Type: "sightseeing",
      Google_review_rating: 4.2,
      time_needed_to_visit_in_hrs: Math.max(1, durationDays * 2),
     },
    ],
   };

   // Only predict flights if trip is using FLIGHT mode
   if (trip.travelMode === "FLIGHT") {
    const sourceCode = getAirportCode(trip.startLocation);
    const destCode = getAirportCode(trip.endLocation);
    const currentMonth = new Date().getMonth() + 1;

    const majorAirlines = [
     "Air India",
     "Indigo",
     "SpiceJet",
     "GoAir",
     "Vistara",
    ];

    if (sourceCode && destCode) {
     payload.flights = majorAirlines.map((airline) => ({
      Source: sourceCode,
      Destination: destCode,
      Airline: airline,
      Month: currentMonth,
     }));
    }
   } else if (trip.travelMode === "TRANSIT") {
    // Add bus prediction for TRANSIT mode
    payload.bus = {
     Source: trip.startLocation?.label || "Start",
     Destination: trip.endLocation?.label || "End",
     Bus_Type: "AC",
     Operator: "Local",
     Duration_Hours: Math.max(1, Math.round(distanceKm / 40)),
    };
   } else {
    // For DRIVE, TWO_WHEELER, BICYCLE, WALK: add touring/intercity_drive
    payload.touring.push({
     Type: "intercity_drive",
     Google_review_rating: 4.0,
     time_needed_to_visit_in_hrs: Math.max(1, Math.round(distanceKm / 60)),
    });
   }

   // Call predict endpoint with tripId so it persists
   await aiApi.estimateTrip(payload);
   await onReload?.();
   setAlertState({
    type: "success",
    message: "Cost predicted and trip updated.",
   });
  } catch (error) {
   setAlertState({
    type: "error",
    message: error?.message || "Unable to predict cost.",
   });
  } finally {
   setIsPredicting(false);
  }
 };

 const handleSaveTrip = async (tripId) => {
  setIsUpdating(true);
  setAlertState(null);

  const buildLocation = (latValue, lngValue) => {
   if (latValue === "" || lngValue === "") return undefined;

   const lat = Number(latValue);
   const lng = Number(lngValue);

   if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Please enter valid numeric coordinates.");
   }

   return { coordinates: { lat, lng } };
  };

  try {
   await tripApi.updateTrip(tripId, {
    details: editDetails,
    startDate: editStartDate || undefined,
    endDate: editEndDate || undefined,
    travelMode: editTravelMode,
    startLocation: buildLocation(editStartLat, editStartLng),
    endLocation: buildLocation(editEndLat, editEndLng),
    isAutoPlanned: editIsAutoPlanned,
   });
   await onReload?.();
   setEditingId(null);
   setAlertState({
    type: "success",
    message: "Trip updated successfully.",
   });
  } catch (error) {
   setAlertState({
    type: "error",
    message: "Unable to update trip.",
   });
  } finally {
   setIsUpdating(false);
  }
 };

 return (
  <div className="space-y-4">
   {alertState ? (
    <CustomAlert type={alertState.type} message={alertState.message} />
   ) : null}

   <button
    type="button"
    onClick={() => router.push("/plan-trip")}
    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-600 hover:to-fuchsia-600"
   >
    <BriefcaseBusiness className="h-4 w-4" />
    Create new trip
   </button>

   {trips.map((trip) => (
    <div
     key={trip._id}
     className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
    >
     {editingId === trip._id ? (
      <div className="space-y-4">
       <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
         Trip Details
        </label>
        <textarea
         value={editDetails}
         onChange={(e) => setEditDetails(e.target.value)}
         className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
         rows="4"
         placeholder="Your trip itinerary..."
        />
       </div>

       <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
         <span className="mb-2 block text-sm font-semibold text-slate-700">
          Start date
         </span>
         <input
          type="date"
          value={editStartDate}
          onChange={(e) => setEditStartDate(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
         />
        </label>

        <label className="block">
         <span className="mb-2 block text-sm font-semibold text-slate-700">
          End date
         </span>
         <input
          type="date"
          value={editEndDate}
          onChange={(e) => setEditEndDate(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
         />
        </label>

        <label className="block">
         <span className="mb-2 block text-sm font-semibold text-slate-700">
          Travel mode
         </span>
         <select
          value={editTravelMode}
          onChange={(e) => setEditTravelMode(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
         >
          {travelModeOptions.map((mode) => (
           <option key={mode} value={mode}>
            {mode}
           </option>
          ))}
         </select>
        </label>
       </div>

       <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
         <p className="text-sm font-bold text-slate-900">Start location</p>
         <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
           <span className="mb-2 block text-xs font-semibold text-slate-600">
            Latitude
           </span>
           <input
            type="number"
            step="any"
            value={editStartLat}
            onChange={(e) => setEditStartLat(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            placeholder="e.g. 12.9716"
           />
          </label>
          <label className="block">
           <span className="mb-2 block text-xs font-semibold text-slate-600">
            Longitude
           </span>
           <input
            type="number"
            step="any"
            value={editStartLng}
            onChange={(e) => setEditStartLng(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            placeholder="e.g. 77.5946"
           />
          </label>
         </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
         <p className="text-sm font-bold text-slate-900">End location</p>
         <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
           <span className="mb-2 block text-xs font-semibold text-slate-600">
            Latitude
           </span>
           <input
            type="number"
            step="any"
            value={editEndLat}
            onChange={(e) => setEditEndLat(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            placeholder="e.g. 13.0827"
           />
          </label>
          <label className="block">
           <span className="mb-2 block text-xs font-semibold text-slate-600">
            Longitude
           </span>
           <input
            type="number"
            step="any"
            value={editEndLng}
            onChange={(e) => setEditEndLng(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
            placeholder="e.g. 80.2707"
           />
          </label>
         </div>
        </div>
       </div>

       <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <input
         type="checkbox"
         checked={editIsAutoPlanned}
         onChange={(e) => setEditIsAutoPlanned(e.target.checked)}
         className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
        />
        <span className="text-sm font-semibold text-slate-700">
         Auto-planned trip
        </span>
       </label>

       <div className="flex flex-wrap gap-2">
        <button
         type="button"
         onClick={() => handleSaveTrip(trip._id)}
         disabled={isUpdating}
         className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:opacity-60"
        >
         {isUpdating ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
         ) : (
          <Save className="h-4 w-4" />
         )}
         Save
        </button>
        <button
         type="button"
         onClick={() => setEditingId(null)}
         className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
         Cancel
        </button>
       </div>
      </div>
     ) : (
      <>
       <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
         <p className="text-xs font-bold uppercase tracking-wide text-violet-700">
          Trip
         </p>
         <h4 className="mt-2 text-lg font-black text-slate-900">
          {trip.details || "Planned itinerary"}
         </h4>
         <p className="mt-1 text-sm text-slate-600">
          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
         </p>
        </div>

        <div className="rounded-2xl bg-white px-4 py-3 text-right ring-1 ring-slate-100">
         <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Travel mode
         </p>
         <p className="text-lg font-black text-slate-900">{trip.travelMode}</p>
        </div>
       </div>

       <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <InfoTile label="Start" value={formatDate(trip.startDate)} />
        <InfoTile label="End" value={formatDate(trip.endDate)} />
        <InfoTile label="Cost" value={formatMoney(trip.totalCost)} />
       </div>

       <div className="mt-4 flex flex-wrap gap-2">
        <button
         type="button"
         onClick={() => handleEditClick(trip)}
         className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
        >
         <Edit2 className="h-4 w-4" />
         Edit
        </button>
        <button
         type="button"
         onClick={() => handlePredictTrip(trip._id)}
         disabled={isPredicting}
         className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-200"
        >
         {isPredicting ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
         ) : (
          <Star className="h-4 w-4" />
         )}
         Predict Cost
        </button>
        <button
         type="button"
         onClick={() => handleDeleteTrip(trip._id)}
         className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-200"
        >
         <Trash2 className="h-4 w-4" />
         Delete
        </button>
       </div>
      </>
     )}
    </div>
   ))}
  </div>
 );
}

function InfoTile({ label, value }) {
 return (
  <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
   <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
    {label}
   </p>
   <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
  </div>
 );
}
