"use client";
import { motion } from "framer-motion";
import {
 Card,
 CardContent,
 CardFooter,
 CardHeader,
 CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

const deals = [
 {
  id: 1,
  title: "Luxury Suite with Ocean View",
  image:
   "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  price: "$250/night",
 },
 {
  id: 2,
  title: "Cozy Downtown Apartment",
  image:
   "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  price: "$150/night",
 },
 {
  id: 3,
  title: "Mountain Cabin Retreat",
  image:
   "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1916&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  price: "$180/night",
 },
];

export default function FeaturedDeals() {
 return (
  <div className="bg-white py-12">
   <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-8">Featured Deals</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
     {deals.map((deal, index) => (
      <motion.div
       key={deal.id}
       initial={{ opacity: 0, y: 50 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.5, delay: index * 0.2 }}
      >
       <Card className="overflow-hidden">
        <CardHeader className="p-0">
         <div className="relative h-60 w-full">
          <Image
           src={deal.image}
           alt={deal.title}
           fill
           style={{ objectFit: "cover" }}
          />
         </div>
        </CardHeader>
        <CardContent className="p-6">
         <CardTitle className="text-xl mb-2">{deal.title}</CardTitle>
         <p className="text-gray-600">{deal.price}</p>
        </CardContent>
        <CardFooter className="p-6">
         <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300">
          Book Now
         </button>
        </CardFooter>
       </Card>
      </motion.div>
     ))}
    </div>
   </div>
  </div>
 );
}
