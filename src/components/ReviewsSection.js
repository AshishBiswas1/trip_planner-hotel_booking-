"use client";

import { motion } from "framer-motion";

const reviews = [
 {
  id: 1,
  name: "Aarav Sharma",
  location: "Mumbai",
  review:
   "The booking process was super smooth, and the hotel looked exactly like the photos. Great experience overall.",
  rating: 5,
 },
 {
  id: 2,
  name: "Priya Nair",
  location: "Bengaluru",
  review:
   "I loved the price transparency and instant confirmation. It saved me time during a business trip.",
  rating: 5,
 },
 {
  id: 3,
  name: "Rahul Mehta",
  location: "Delhi",
  review:
   "Support team was responsive when I had to update my booking dates. Reliable platform for travel planning.",
  rating: 4,
 },
];

function Rating({ value }) {
 return (
  <p className="text-amber-500">
   {"★".repeat(value)}
   {"☆".repeat(5 - value)}
  </p>
 );
}

export default function ReviewsSection() {
 return (
  <section className="bg-slate-50 py-16">
   <div className="container mx-auto px-4">
    <motion.h2
     initial={{ opacity: 0, y: 20 }}
     whileInView={{ opacity: 1, y: 0 }}
     viewport={{ once: true }}
     transition={{ duration: 0.5 }}
     className="text-3xl md:text-4xl font-bold text-center text-gray-900"
    >
     What Travelers Say
    </motion.h2>

    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
     {reviews.map((item, index) => (
      <motion.article
       key={item.id}
       initial={{ opacity: 0, y: 30 }}
       whileInView={{ opacity: 1, y: 0 }}
       viewport={{ once: true }}
       transition={{ duration: 0.4, delay: index * 0.1 }}
       className="rounded-xl bg-white p-6 shadow-sm border border-gray-100"
      >
       <Rating value={item.rating} />
       <p className="mt-4 text-gray-600 leading-relaxed">{item.review}</p>
       <div className="mt-5">
        <p className="font-semibold text-gray-900">{item.name}</p>
        <p className="text-sm text-gray-500">{item.location}</p>
       </div>
      </motion.article>
     ))}
    </div>
   </div>
  </section>
 );
}
