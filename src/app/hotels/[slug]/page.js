import HotelDetailPage from "@/components/hotel/HotelDetailPage";

export default async function HotelDetailRoute({ params }) {
 const { slug } = await params;

 return <HotelDetailPage slug={slug} />;
}
