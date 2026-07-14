import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import SessionSection from "@/components/landing/SessionSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />

      <HeroSection />

      <SessionSection />

      <FeaturesSection />

      <Footer />
    </>
  );
}