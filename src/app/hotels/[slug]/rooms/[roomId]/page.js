// src/app/hotels/[slug]/rooms/[roomId]/page.js
import RoomDetailPage from "@/components/hotel/RoomDetailPage";
import { notFound } from "next/navigation";

export default async function RoomDetailRoute({ params }) {
 // Await params as required by newer Next.js versions
 const { slug, roomId } = await params;

 // Basic validation to prevent sending empty data to the component
 if (!slug || !roomId) {
  return notFound();
 }

 return <RoomDetailPage slug={slug} roomId={roomId} />;
}
