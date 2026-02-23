import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState, useMemo } from "react";
import DataExport from "./DataExport";
import { fetchReadings, WaterReading } from "@/lib/api";

const AnalyticsSection = () => {
  const [readings, setReadings] = useState<WaterReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReadings = async () => {
      try {
        const data = await fetchReadings(50); // Get last 50 readings
        setReadings(data);
      } catch (error) {
        console.error("Error loading readings for analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReadings();
    // Refresh every 30 seconds
    const interval = setInterval(loadReadings, 30000);
    return () => clearInterval(interval);
  }, []);

  // Process readings for line chart (last 24 hours, grouped by hour)
  const lineData = useMemo(() => {
    if (readings.length === 0) {
      return [
        { time: "00:00", ph: 0, turbidity: 0 },
        { time: "12:00", ph: 0, turbidity: 0 },
        { time: "Now", ph: 0, turbidity: 0 },
      ];
    }

    const now = new Date();
    const last24Hours = readings.filter((r) => {
      const readingTime = new Date(r.timestamp);
      return now.getTime() - readingTime.getTime() <= 24 * 60 * 60 * 1000;
    });

    if (last24Hours.length === 0) {
      return [
        { time: "No data", ph: 0, turbidity: 0 },
      ];
    }

    // Group by hour and average
    const hourlyData: Record<number, { ph: number[]; turbidity: number[] }> = {};
    
    last24Hours.forEach((reading) => {
      const time = new Date(reading.timestamp);
      const hour = time.getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { ph: [], turbidity: [] };
      }
      hourlyData[hour].ph.push(reading.ph);
      hourlyData[hour].turbidity.push(reading.turbidity);
    });

    const chartData = Object.entries(hourlyData)
      .map(([hour, values]) => ({
        time: `${String(hour).padStart(2, "0")}:00`,
        ph: values.ph.reduce((a, b) => a + b, 0) / values.ph.length,
        turbidity: values.turbidity.reduce((a, b) => a + b, 0) / values.turbidity.length,
      }))
      .sort((a, b) => a.time.localeCompare(b.time));

    // Add latest reading
    const latest = last24Hours[0];
    if (latest) {
      chartData.push({
        time: "Now",
        ph: latest.ph,
        turbidity: latest.turbidity,
      });
    }

    return chartData.length > 0 ? chartData : [{ time: "No data", ph: 0, turbidity: 0 }];
  }, [readings]);

  // Process readings for bar chart (TDS by device)
  const barData = useMemo(() => {
    if (readings.length === 0) {
      return [];
    }

    // Get latest reading per device
    const deviceReadings: Record<string, WaterReading> = {};
    readings.forEach((reading) => {
      if (!deviceReadings[reading.device_id] || 
          new Date(reading.timestamp) > new Date(deviceReadings[reading.device_id].timestamp)) {
        deviceReadings[reading.device_id] = reading;
      }
    });

    return Object.entries(deviceReadings).map(([device, reading]) => ({
      source: device,
      tds: reading.tds,
    }));
  }, [readings]);
  return (
    <section id="analytics" className="relative section-padding bg-background bg-grid">
      <div className="relative z-10 container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="text-center flex-1">
            <span className="text-sm font-medium text-primary mb-3 block">Analytics</span>
          </div>
          <div className="relative">
            <DataExport />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* pH & Turbidity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05, duration: 0.35 }}
            className="nba-card"
          >
            <h3 className="text-lg font-semibold text-foreground mb-1">Water Quality — Last 24h</h3>
            <p className="text-sm text-muted-foreground mb-6">pH & Turbidity trends</p>
            {loading && (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Loading chart data...
              </div>
            )}
            {!loading && lineData.length === 0 && (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
            {!loading && lineData.length > 0 && (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} stroke="hsl(var(--border))" />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} stroke="hsl(var(--border))" />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '2px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                />
                <Line type="monotone" dataKey="ph" stroke="hsl(280 80% 60%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="turbidity" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            )}
          </motion.div>

          {/* TDS Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="nba-card"
          >
            <h3 className="text-lg font-semibold text-foreground mb-1">TDS by Device</h3>
            <p className="text-sm text-muted-foreground mb-6">Total dissolved solids (ppm)</p>
            {loading && (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Loading chart data...
              </div>
            )}
            {!loading && barData.length === 0 && (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
            {!loading && barData.length > 0 && (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="source" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} stroke="hsl(var(--border))" />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} stroke="hsl(var(--border))" />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '2px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="tds" fill="hsl(280 80% 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsSection;
