import Navbar from "@/components/Navbar";
import DashboardSection from "@/components/DashboardSection";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background bg-grid">
      <Navbar />
      <DashboardSection />
    </div>
  );
};

export default Dashboard;
