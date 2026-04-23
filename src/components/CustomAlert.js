export default function CustomAlert({ type = "info", message }) {
 if (!message) return null;

 const baseClass =
  "rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-300";

 const variants = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
 };

 return (
  <div
   className={`${baseClass} ${variants[type] || variants.info}`}
   role="alert"
  >
   {message}
  </div>
 );
}
