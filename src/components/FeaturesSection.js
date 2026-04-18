"use client";

import { motion } from "framer-motion";
import { ShieldCheck, MapPinned, WalletCards, Clock3 } from "lucide-react";

const features = [
 {
  id: 1,
  icon: ShieldCheck,
  title: "Trusted Stays",
  description:
   "Every property is verified so you can book with confidence and avoid surprises.",
 },
 {
  id: 2,
  icon: MapPinned,
  title: "Smart Location Filters",
  description:
   "Find hotels near landmarks, stations, and business districts in a few clicks.",
 },
 {
  id: 3,
  icon: WalletCards,
  title: "Best Price Insights",
  description:
   "Compare value fast with transparent rates, taxes, and no hidden fees.",
 },
 {
  id: 4,
  icon: Clock3,
  title: "24/7 Booking Support",
  description:
   "Get help anytime for booking changes, confirmations, and travel questions.",
 },
];

export default function FeaturesSection() {
 return (
  <section id="about" className="bg-white py-16">
   <div className="container mx-auto px-4">
    <motion.h2
     initial={{ opacity: 0, y: 20 }}
     whileInView={{ opacity: 1, y: 0 }}
     viewport={{ once: true }}
     transition={{ duration: 0.5 }}
     className="text-3xl md:text-4xl font-bold text-center text-gray-900"
    >
     Features That Make Booking Easy
    </motion.h2>

    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
     {features.map((feature, index) => {
      const Icon = feature.icon;

      return (
       <motion.article
        key={feature.id}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
       >
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
         <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
        <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
       </motion.article>
      );
     })}
    </div>
   </div>
  </section>
 );
}
