"use client";

import { motion } from "framer-motion";

const highlights = [
 {
  id: 1,
  title: "Weekend Escapes",
  description: "Short stay recommendations under 3 hours from your city.",
 },
 {
  id: 2,
  title: "Family Friendly Picks",
  description: "Handpicked hotels with spacious rooms and kid-safe facilities.",
 },
 {
  id: 3,
  title: "Business Ready Hotels",
  description:
   "Fast Wi-Fi, airport transfer, and meeting-friendly environments.",
 },
];

export default function TravelHighlightsSection() {
 return (
  <section className="bg-white py-16">
   <div className="container mx-auto px-4">
    <motion.div
     initial={{ opacity: 0, y: 20 }}
     whileInView={{ opacity: 1, y: 0 }}
     viewport={{ once: true }}
     transition={{ duration: 0.5 }}
     className="rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 p-8 md:p-12 text-white"
    >
     <h2 className="text-3xl md:text-4xl font-bold">
      Explore More Ways To Travel
     </h2>
     <p className="mt-3 text-sky-100 max-w-2xl">
      Beyond hotel booking, discover tailored travel ideas to match your plan,
      style, and budget.
     </p>

     <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
      {highlights.map((item, index) => (
       <motion.article
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="rounded-xl bg-white/10 p-5 backdrop-blur-sm"
       >
        <h3 className="font-semibold text-lg">{item.title}</h3>
        <p className="mt-2 text-sm text-sky-100">{item.description}</p>
       </motion.article>
      ))}
     </div>
    </motion.div>
   </div>
  </section>
 );
}
