import { motion } from "framer-motion";
import { Shield, AlertTriangle, Radio } from "lucide-react";

const readings = [
  { label: "pH Level", value: "7.2", unit: "pH", status: "Safe", detail: "Stable over 6h", color: "text-primary" },
  { label: "TDS", value: "288", unit: "ppm", status: "Safe", detail: "↓ 3% from yesterday", color: "text-primary" },
  { label: "Turbidity", value: "1.3", unit: "NTU", status: "Safe", detail: "Within safe range", color: "text-primary" },
  { label: "Temperature", value: "24.5", unit: "°C", status: "Safe", detail: "Normal range", color: "text-primary" },
  { label: "Conductivity", value: "420", unit: "μS/cm", status: "Warning", detail: "↑ Slightly elevated", color: "text-accent" },
  { label: "Dissolved O₂", value: "6.8", unit: "mg/L", status: "Safe", detail: "Healthy level", color: "text-primary" },
];

const DashboardSection = () => {
  return (
    <section id="dashboard" className="relative section-padding">
      <div className="absolute inset-0 mesh-gradient-intense" />

      <div className="relative z-10 container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-primary mb-3 block">Live Dashboard</span>
          <h2 className="text-3xl md:text-5xl font-bold">Real-time Monitoring</h2>
        </motion.div>

        {/* Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-strong p-6 mb-8 gradient-border"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Overall Status</p>
              <h3 className="text-xl font-semibold text-foreground">Water Quality — <span className="text-primary">Good</span></h3>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-2xl font-bold text-foreground">4</span>
                <span className="text-sm text-muted-foreground">Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-accent" />
                <span className="text-2xl font-bold text-foreground">1</span>
                <span className="text-sm text-muted-foreground">Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-secondary" />
                <span className="text-2xl font-bold text-foreground">6</span>
                <span className="text-sm text-muted-foreground">Sources</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Live Readings */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Live Readings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {readings.map((r, i) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className="glass card-hover p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${r.status === 'Safe' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{r.label}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold text-foreground">{r.value}</span>
                  <span className="text-sm text-muted-foreground">{r.unit}</span>
                </div>
                <p className="text-xs text-muted-foreground">{r.detail}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardSection;
