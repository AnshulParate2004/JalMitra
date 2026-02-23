import { motion } from "framer-motion";
import { ArrowRight, Activity, Radio, Zap } from "lucide-react";

const stats = [
  { icon: Activity, value: "24/7", label: "Monitoring" },
  { icon: Radio, value: "6", label: "Sources" },
  { icon: Zap, value: "<5s", label: "Alert Time" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated mesh background */}
      <div className="absolute inset-0 mesh-gradient-intense" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-neon-purple/10 blur-[120px] animate-mesh" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-neon-cyan/10 blur-[100px] animate-mesh" style={{ animationDelay: '-7s' }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-neon-magenta/5 blur-[80px] animate-pulse-glow" />

      <div className="relative z-10 container mx-auto text-center px-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">Real-time Water Quality Monitoring</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          Protect Every Drop{" "}
          <br />
          <span className="gradient-text-alt">with Intelligence</span>
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
          <a
            href="#dashboard"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:shadow-[0_0_30px_hsl(186_100%_50%/0.4)] transition-all duration-300"
          >
            View Dashboard <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#features"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl glass text-foreground font-semibold hover:bg-card/60 transition-all duration-300"
          >
            Explore Features
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="flex justify-center gap-4 md:gap-6"
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="glass card-hover px-6 py-4 md:px-8 md:py-5 flex flex-col items-center gap-2 gradient-border"
            >
              <stat.icon className="w-5 h-5 text-primary" />
              <span className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
