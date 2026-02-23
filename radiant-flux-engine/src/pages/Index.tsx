import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import DashboardSection from "@/components/DashboardSection";
import AnalyticsSection from "@/components/AnalyticsSection";
import AlertsSection from "@/components/AlertsSection";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <DashboardSection />
      <AnalyticsSection />
      <AlertsSection />
      <CTASection />
    </div>
  );
};

export default Index;
