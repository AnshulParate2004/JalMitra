import { motion } from "framer-motion";
import { Waves, BarChart3, BellRing, FileCheck, Brain, Wifi } from "lucide-react";

const features = [
  { icon: Waves, title: "Multi-Parameter Sensing", desc: "Track pH, TDS, turbidity, temperature, conductivity, and dissolved oxygen simultaneously." },
  { icon: BarChart3, title: "Visual Analytics", desc: "Interactive charts and trend analysis for every water source in your network." },
  { icon: BellRing, title: "Instant Alerts", desc: "Get notified within seconds of any quality deviation above safe thresholds." },
  { icon: FileCheck, title: "Compliance Ready", desc: "Automatic reports aligned with WHO and BIS drinking water quality standards." },
  { icon: Brain, title: "AI-Powered Predictions", desc: "Machine learning models that predict contamination events before they happen." },
  { icon: Wifi, title: "Remote Monitoring", desc: "Monitor any water source from anywhere — field sensors to cloud dashboard." },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const FeaturesSection = () => {
  return (
    <section id="features" className="relative section-padding bg-background bg-grid">
      <div className="relative z-10 container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary mb-3 block">Features</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            Everything you need to{" "}
            <span className="text-primary">safeguard water quality</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From sensor data collection to predictive analytics — one platform for complete water safety.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f, i) => {
            const colors = [
              { bg: "bg-primary/20", text: "text-primary", border: "border-primary" },
              { bg: "bg-secondary/20", text: "text-secondary", border: "border-secondary" },
              { bg: "bg-accent/20", text: "text-accent", border: "border-accent" },
              { bg: "bg-success/20", text: "text-success", border: "border-success" },
              { bg: "bg-cyan/20", text: "text-cyan", border: "border-cyan" },
              { bg: "bg-warning/20", text: "text-warning", border: "border-warning" },
            ];
            const color = colors[i % colors.length];
            return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="nba-card group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg border-2 border-black bg-primary/10 flex items-center justify-center mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
