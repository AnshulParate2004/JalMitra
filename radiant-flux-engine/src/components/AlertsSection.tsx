import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { fetchAlerts, WaterAlert } from "@/lib/api";
import { getAlertRecommendations } from "@/utils/alertRecommendations";

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const AlertsSection = () => {
  const { latestAlert } = useWebSocket();
  const [alerts, setAlerts] = useState<WaterAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await fetchAlerts(20);
        setAlerts(data);
      } catch (error) {
        console.error("Error loading alerts:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);

  // Update alerts when new alert comes via WebSocket
  useEffect(() => {
    if (latestAlert) {
      setAlerts((prev) => [latestAlert, ...prev].slice(0, 20));
    }
  }, [latestAlert]);
  return (
    <section id="alerts" className="relative section-padding bg-background bg-grid">
      <div className="relative z-10 container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="nba-card"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Recent Alerts</h3>
              <p className="text-sm text-muted-foreground">
                {alerts.length > 0 ? `${alerts.length} alert${alerts.length !== 1 ? "s" : ""}` : "No alerts"}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-primary/50" />
              <p>No alerts at this time. All readings are within safe limits.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert, i) => {
                const isWarning = alert.message.toLowerCase().includes("alert") || 
                                 alert.message.toLowerCase().includes("out of range") ||
                                 alert.message.toLowerCase().includes("above");
                const alertKey = `${alert.timestamp}-${i}`;
                const isExpanded = expandedAlerts.has(alertKey);
                const recommendation = getAlertRecommendations(alert);
                
                return (
              <motion.div
                key={alertKey}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                className="rounded-lg border-2 border-black bg-card hover:bg-muted/50 transition-colors overflow-hidden"
              >
                <div 
                  className="flex items-start gap-4 p-4 cursor-pointer"
                  onClick={() => {
                    const newExpanded = new Set(expandedAlerts);
                    if (isExpanded) {
                      newExpanded.delete(alertKey);
                    } else {
                      newExpanded.add(alertKey);
                    }
                    setExpandedAlerts(newExpanded);
                  }}
                >
                    <div className={`mt-0.5 ${isWarning ? "text-accent" : "text-primary"}`}>
                      {isWarning ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{alert.device_id}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatTimeAgo(alert.timestamp)}
                        </span>
                      </div>
                    </div>
                    {recommendation && (
                      <button className="text-muted-foreground hover:text-foreground transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {isExpanded && recommendation && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 border-t-2 border-black bg-muted/20">
                          <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="w-4 h-4 text-primary" />
                            <h4 className="text-sm font-semibold text-foreground">{recommendation.title}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded border border-black ${
                              recommendation.priority === "high" ? "bg-destructive/10 text-destructive" :
                              recommendation.priority === "medium" ? "bg-accent/10 text-accent" :
                              "bg-primary/10 text-primary"
                            }`}>
                              {recommendation.priority.toUpperCase()} PRIORITY
                            </span>
                          </div>
                          <ol className="space-y-2 ml-6 list-decimal">
                            {recommendation.steps.map((step, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground leading-relaxed">
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default AlertsSection;
