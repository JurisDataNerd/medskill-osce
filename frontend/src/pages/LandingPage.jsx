import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import WhyPraxisSection from "@/components/landing/WhyPraxisSection";
import IntroductionSimulationSection from "@/components/landing/IntroductionSimulationSection";
import AiProofSection from "@/components/landing/AiProofSection";
import SessionSection from "@/components/landing/SessionSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FaqSection from "@/components/landing/FaqSection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#0D3A68] selection:text-white antialiased overflow-x-hidden">
      {/* Pill Navigation Header */}
      <Navbar />

      <main>
        {/* Hero Section: Motto SplitText + Social Proof Counter Bar + Mascot */}
        <HeroSection />

        {/* Section 1: Kenapa Praxis (Deep Navy Background) */}
        <WhyPraxisSection />

        {/* Section 2: Pengenalan 2 Skenario Simulasi OSCE (Praxis Mandiri & Praxis On-Site) */}
        <IntroductionSimulationSection />

        {/* Section 3: Screenshot Anamnesis AI di praxis.png */}
        <AiProofSection />

        {/* Section 4: Jadwal Simulasi */}
        <SessionSection />

        {/* Section 5: Testimoni & Kisah Sukses Koas */}
        <TestimonialsSection />

        {/* Section 6: FAQ (Deep Navy Background) */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}