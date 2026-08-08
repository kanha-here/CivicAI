import { LandingNavbar } from "../components/landing/landing-navbar";
import { Hero } from "../components/landing/hero";
import { StatsStrip } from "../components/landing/stats-strip";
import { Features } from "../components/landing/features";
import { HowItWorks } from "../components/landing/how-it-works";
import { Departments } from "../components/landing/departments";
import { Testimonials } from "../components/landing/testimonials";
import { TrustBar } from "../components/landing/trust-bar";
import { FinalCTA } from "../components/landing/final-cta";
import { LandingFooter } from "../components/landing/landing-footer";
import { FloatingChatbot } from "../components/floating-chatbot";

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <main>
        <Hero />
        <StatsStrip />
        <Features />
        <HowItWorks />
        <Departments />
        <Testimonials />
        <TrustBar />
        <FinalCTA />
      </main>
      <LandingFooter />
      <FloatingChatbot />
    </div>
  );
}
