import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import SessionSection from "@/components/landing/SessionSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#1E3A8A] selection:text-white antialiased">
      <Navbar />

      <main>
        <HeroSection />

        <SessionSection />

        <FeaturesSection />
      </main>

      <Footer />
    </div>
  );
}