import { motion } from "framer-motion";
import { Shield, AlertTriangle, Radio, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { fetchLatestReading, fetchStats, WaterReading } from "@/lib/api";
import DataExport from "./DataExport";

// Thresholds matching backend
const PH_MIN = 6.0;
const PH_MAX = 9.0;
const TURBIDITY_MAX = 100.0;
const TDS_MAX = 500.0;

const getStatus = (label: string, value: number): "Safe" | "Warning" => {
  if (label === "pH Level") {
    return value >= PH_MIN && value <= PH_MAX ? "Safe" : "Warning";
  }
  if (label === "Turbidity") {
    return value <= TURBIDITY_MAX ? "Safe" : "Warning";
  }
  if (label === "TDS") {
    return value <= TDS_MAX ? "Safe" : "Warning";
  }
  return "Safe";
};

const getPhDetail = (ph: number, status: "Safe" | "Warning"): string => {
  if (status === "Warning") {
    if (ph < PH_MIN) {
      if (ph < 4.0) return "Highly acidic - Immediate attention needed";
      if (ph < 5.0) return "Very acidic - Unsafe for consumption";
      if (ph < 6.0) return "Acidic - Out of safe range";
    } else if (ph > PH_MAX) {
      if (ph > 11.0) return "Highly alkaline - Immediate attention needed";
      if (ph > 10.0) return "Very alkaline - Unsafe for consumption";
      if (ph > 9.0) return "Alkaline - Out of safe range";
    }
    return "Out of safe range";
  }
  
  // Safe range messages
  if (ph >= 6.5 && ph <= 8.5) {
    if (ph >= 7.0 && ph <= 7.5) return "Optimal - Perfect balance";
    if (ph >= 6.8 && ph <= 7.2) return "Excellent - Within ideal range";
    return "Good - Within safe range";
  }
  if (ph >= 6.0 && ph < 6.5) return "Slightly acidic - Monitor closely";
  if (ph > 8.5 && ph <= 9.0) return "Slightly alkaline - Monitor closely";
  
  return "Within safe range";
};

const getTurbidityDetail = (turbidity: number, status: "Safe" | "Warning"): string => {
  if (status === "Warning") {
    return "Above safe limit";
  }
  if (turbidity < 10) return "Excellent - Very clear";
  if (turbidity < 25) return "Good - Clear water";
  if (turbidity < 50) return "Acceptable - Slightly cloudy";
  return "Within safe range";
};

const getTdsDetail = (tds: number, status: "Safe" | "Warning"): string => {
  if (status === "Warning") {
    return "Above safe limit";
  }
  if (tds < 100) return "Excellent - Very low dissolved solids";
  if (tds < 200) return "Good - Low dissolved solids";
  if (tds < 300) return "Acceptable - Moderate dissolved solids";
  return "Within safe range";
};

const DashboardSection = () => {
  const { latestReading, isConnected } = useWebSocket();
  const [initialReading, setInitialReading] = useState<WaterReading | null>(null);
  const [stats, setStats] = useState<{ readings_count: number; alerts_count: number } | null>(null);
  const [loading, setLoading] = useState(true);

  // Use latest reading from WebSocket or fallback to initial
  const currentReading = latestReading || initialReading;

  useEffect(() => {
    // Fetch initial data from backend
    const loadData = async () => {
      try {
        console.log("[Dashboard] Fetching data from backend...");
        const [reading, statsData] = await Promise.all([
          fetchLatestReading(),
          fetchStats(),
        ]);
        console.log("[Dashboard] Received from backend:", { reading, stats: statsData });
        if (reading) {
          setInitialReading(reading);
          console.log("[Dashboard] Latest reading:", reading);
        } else {
          console.log("[Dashboard] No reading data available yet");
        }
        setStats(statsData);
      } catch (error) {
        console.error("[Dashboard] Error loading data from backend:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update initial reading when WebSocket provides new data from backend
  useEffect(() => {
    if (latestReading) {
      console.log("[Dashboard] New reading from WebSocket (backend):", latestReading);
      setInitialReading(latestReading);
    }
  }, [latestReading]);

  const readings = useMemo(() => {
    if (!currentReading) {
      return [
        { label: "pH Level", value: "--", unit: "pH", status: "Safe" as const, detail: "No data", color: "text-muted-foreground" },
        { label: "TDS", value: "--", unit: "ppm", status: "Safe" as const, detail: "No data", color: "text-muted-foreground" },
        { label: "Turbidity", value: "--", unit: "NTU", status: "Safe" as const, detail: "No data", color: "text-muted-foreground" },
        { label: "Temperature", value: "--", unit: "°C", status: "Safe" as const, detail: "No data", color: "text-muted-foreground" },
      ];
    }

    const phStatus = getStatus("pH Level", currentReading.ph);
    const turbidityStatus = getStatus("Turbidity", currentReading.turbidity);
    const tdsStatus = getStatus("TDS", currentReading.tds);

    return [
      {
        label: "pH Level",
        value: currentReading.ph.toFixed(2),
        unit: "pH",
        status: phStatus,
        detail: getPhDetail(currentReading.ph, phStatus),
        color: phStatus === "Safe" ? "text-primary" : "text-accent",
      },
      {
        label: "TDS",
        value: currentReading.tds.toFixed(0),
        unit: "ppm",
        status: tdsStatus,
        detail: getTdsDetail(currentReading.tds, tdsStatus),
        color: tdsStatus === "Safe" ? "text-primary" : "text-accent",
      },
      {
        label: "Turbidity",
        value: currentReading.turbidity.toFixed(1),
        unit: "NTU",
        status: turbidityStatus,
        detail: getTurbidityDetail(currentReading.turbidity, turbidityStatus),
        color: turbidityStatus === "Safe" ? "text-primary" : "text-accent",
      },
      {
        label: "Temperature",
        value: currentReading.temperature ? currentReading.temperature.toFixed(1) : "--",
        unit: "°C",
        status: "Safe" as const,
        detail: currentReading.temperature ? "Normal range" : "Not available",
        color: "text-primary",
      },
    ];
  }, [currentReading]);

  const safeCount = readings.filter((r) => r.status === "Safe").length;
  const warningCount = readings.filter((r) => r.status === "Warning").length;
  return (
    <section id="dashboard" className="relative section-padding bg-background bg-grid">
      <div className="relative z-10 container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="text-center flex-1">
            <span className="text-sm font-medium text-primary mb-3 block">Live Dashboard</span>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground">Real-time Monitoring</h2>
          </div>
          <div className="relative">
            <DataExport />
          </div>
        </motion.div>

        {/* Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="nba-card mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Overall Status</p>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold text-foreground">
                  Water Quality — <span className={warningCount > 0 ? "text-accent" : "text-primary"}>
                    {warningCount > 0 ? "Warning" : "Good"}
                  </span>
                </h3>
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-primary" title="Connected" />
                ) : (
                  <WifiOff className="w-4 h-4 text-muted-foreground" title="Disconnected" />
                )}
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-2xl font-bold text-foreground">{safeCount}</span>
                <span className="text-sm text-muted-foreground">Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-accent" />
                <span className="text-2xl font-bold text-foreground">{warningCount}</span>
                <span className="text-sm text-muted-foreground">Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-secondary" />
                <span className="text-2xl font-bold text-foreground">{stats?.readings_count || 0}</span>
                <span className="text-sm text-muted-foreground">Readings</span>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Live Readings</h3>
            {loading && (
              <span className="text-xs text-muted-foreground">Loading...</span>
            )}
            {!loading && !currentReading && (
              <span className="text-xs text-muted-foreground">No data available</span>
            )}
            {currentReading && (
              <span className="text-xs text-muted-foreground">
                Last update: {new Date(currentReading.timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {readings.map((r, i) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                className="nba-card cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{r.label}</p>
                  <div className={`w-9 h-9 rounded-lg border-2 border-black ${r.status === 'Safe' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'} flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                    {r.status === 'Safe' ? <Shield className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold tracking-tight text-foreground">
                    {r.value}
                  </span>
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
