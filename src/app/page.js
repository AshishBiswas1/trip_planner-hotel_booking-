import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Search from "@/components/Search";
import FeaturedDeals from "@/components/FeaturedDeals";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Search />
      <FeaturedDeals />
      <Footer />
    </main>
  );
}
