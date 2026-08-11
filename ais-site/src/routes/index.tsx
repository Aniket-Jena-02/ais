import { createFileRoute, redirect } from "@tanstack/react-router";
import { Navbar } from "../components/landing/Navbar";
import { HeroSection } from "../components/landing/HeroSection";
import { AppPreview } from "../components/landing/AppPreview";
import { StatsSection } from "../components/landing/StatsSection";
import { FeaturesGrid } from "../components/landing/FeaturesGrid";
import { CTASection } from "../components/landing/CTASection";
import { LandingFooter } from "../components/landing/LandingFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    title: "Ether Chat | Home",
    meta: [
      { property: "og:title", content: "Ether Chat | Home" },
      { property: "og:description", content: "Ether Chat" },
      { property: "og:image", content: "/favicon.png" },
    ],
  }),
  component: LandingPage,
  beforeLoad: async () => {
    let isAuthenticated = false;
    try {
      const res = await fetch(`${import.meta.env.VITE_API}/auth/me`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.userName) {
          isAuthenticated = true;
        }
      }
    } catch (e) {
      // ignore fetch errors
    }

    if (isAuthenticated) {
      throw redirect({ to: "/channels" });
    }
  }
});

function LandingPage() {
  return (
    <div className="min-h-dvh bg-brand-dark relative overflow-x-hidden selection:bg-brand-accent/30 font-sans">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/3 w-200 h-200 bg-brand-accent/[0.06] rounded-full filter blur-[140px] animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-150 h-150 bg-brand-accent-soft/[0.04] rounded-full filter blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 right-1/3 w-100 h-100 bg-emerald-500/[0.02] rounded-full filter blur-[100px] animate-blob animation-delay-4000" />
      </div>

      <Navbar />
      <HeroSection />
      <AppPreview />
      <StatsSection />
      <FeaturesGrid />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
