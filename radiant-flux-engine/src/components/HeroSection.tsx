import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Activity, Radio, Zap } from "lucide-react";

const stats = [
  { icon: Activity, value: "24/7", label: "Monitoring" },
  { icon: Radio, value: "6", label: "Sources" },
  { icon: Zap, value: "<5s", label: "Alert Time" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background bg-grid">
      <div className="relative z-10 container mx-auto text-center px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-card text-muted-foreground border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-8">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            Real-time Water Quality Monitoring
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-foreground"
        >
          Protect Every Drop{" "}
          <br />
          <span className="text-primary">with Intelligence</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          JalSuraksha monitors water quality across sources in real-time, alerting you to contamination before it reaches communities.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Link
            to="/signin"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-black bg-primary text-primary-foreground font-semibold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-300"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/signin"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-black bg-card text-foreground font-semibold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-300"
          >
            Sign In
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="flex justify-center gap-4 md:gap-6"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.1, duration: 0.35 }}
              className="nba-card-sm flex flex-col items-center gap-2"
            >
              <stat.icon className="w-5 h-5 text-primary" />
              <span className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
