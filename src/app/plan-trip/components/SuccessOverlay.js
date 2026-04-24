import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function SuccessOverlay({ show }) {
 return (
  <AnimatePresence>
   {show ? (
    <motion.div
     initial={{ opacity: 0 }}
     animate={{ opacity: 1 }}
     exit={{ opacity: 0 }}
     className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
    >
     <motion.div
      initial={{ scale: 0.92, y: 16, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.96, y: 10, opacity: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      className="w-full max-w-md rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-2xl"
     >
      <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
       <CheckCircle2 className="h-7 w-7" />
      </div>
      <h3 className="text-2xl font-black tracking-tight text-slate-900">
       Trip Created
      </h3>
      <p className="mt-2 text-sm text-slate-600">
       Your trip has been saved successfully. Taking you back to home...
      </p>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
       <motion.div
        className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
       />
      </div>
     </motion.div>
    </motion.div>
   ) : null}
  </AnimatePresence>
 );
}
