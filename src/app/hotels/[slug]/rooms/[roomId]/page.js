import RoomDetailPage from "@/components/hotel/RoomDetailPage";

export default async function RoomDetailRoute({ params }) {
 const { slug, roomId } = await params;

 return <RoomDetailPage slug={slug} roomId={roomId} />;
}
