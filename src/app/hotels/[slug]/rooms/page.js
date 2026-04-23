import RoomStripsPage from "@/components/hotel/RoomStripsPage";

export default async function HotelRoomsRoute({ params }) {
 const { slug } = await params;

 return <RoomStripsPage slug={slug} />;
}
