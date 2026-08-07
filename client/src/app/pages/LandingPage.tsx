import { Navbar } from "../components/navbar";
import { HeroSection } from "../components/hero-section";
import { ComplaintSubmission } from "../components/complaint-submission";
import { AIPipeline } from "../components/ai-pipeline";
import { DashboardPreview } from "../components/dashboard-preview";
import { OfficerWorkflow } from "../components/officer-workflow";
import { TrustTransparency } from "../components/trust-transparency";
import { Footer } from "../components/footer";
import { FloatingChatbot } from "../components/floating-chatbot";

export function LandingPage() {
  return (
    <div className="min-h-screen dark:bg-[#0B1020] bg-white transition-colors duration-300">
      <Navbar />
      <main>
        <HeroSection />
        <ComplaintSubmission />
        <AIPipeline />
        <DashboardPreview />
        <OfficerWorkflow />
        <TrustTransparency />
      </main>
      <Footer />
      <FloatingChatbot />
    </div>
  );
}
