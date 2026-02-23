import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, ArrowRight, Clock } from "lucide-react";

const alerts = [
  { type: "warning", icon: AlertTriangle, message: "Turbidity spike detected — 5.8 NTU", source: "River D", time: "12 min ago" },
  { type: "warning", icon: AlertTriangle, message: "TDS approaching safe limit — 550 ppm", source: "Well C", time: "1h ago" },
  { type: "success", icon: CheckCircle, message: "Filter maintenance completed successfully", source: "Filter E", time: "3h ago" },
  { type: "info", icon: CheckCircle, message: "All sensors calibrated and operational", source: "System", time: "5h ago" },
];

const AlertsSection = () => {
  return (
    <section id="alerts" className="relative section-padding">
      <div className="absolute inset-0 mesh-gradient-intense" />

      <div className="relative z-10 container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-strong p-6 md:p-8 gradient-border"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Recent Alerts</h3>
              <p className="text-sm text-muted-foreground">Last 24 hours</p>
            </div>
            <a href="#" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-4">
            {alerts.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={`mt-0.5 ${a.type === 'warning' ? 'text-accent' : 'text-primary'}`}>
                  <a.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{a.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{a.source}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {a.time}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AlertsSection;
