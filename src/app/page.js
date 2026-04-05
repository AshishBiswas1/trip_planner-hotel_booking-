import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturesSection from "@/components/FeaturesSection";
import ReviewsSection from "@/components/ReviewsSection";
import TravelHighlightsSection from "@/components/TravelHighlightsSection";
import Footer from "@/components/Footer";

export default function Home() {
 return (
  <main>
   <Header />
   <Hero />
   <FeaturesSection />
   <ReviewsSection />
   <TravelHighlightsSection />
   <Footer />
  </main>
 );
}
