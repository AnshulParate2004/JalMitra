import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const lineData = [
  { time: "00:00", ph: 7.1, turbidity: 1.2 },
  { time: "04:00", ph: 7.0, turbidity: 1.1 },
  { time: "08:00", ph: 7.3, turbidity: 1.4 },
  { time: "12:00", ph: 7.2, turbidity: 1.8 },
  { time: "16:00", ph: 7.4, turbidity: 1.3 },
  { time: "20:00", ph: 7.1, turbidity: 1.5 },
  { time: "Now", ph: 7.2, turbidity: 1.3 },
];

const barData = [
  { source: "Tap A", tds: 290 },
  { source: "Tap B", tds: 310 },
  { source: "Well C", tds: 550 },
  { source: "River D", tds: 420 },
  { source: "Filter E", tds: 180 },
  { source: "Tank F", tds: 340 },
];

const AnalyticsSection = () => {
  return (
    <section id="analytics" className="relative section-padding">
      <div className="absolute inset-0 mesh-gradient" />

      <div className="relative z-10 container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-medium text-primary mb-3 block">Analytics</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* pH & Turbidity Chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-strong p-6 gradient-border"
          >
            <h3 className="text-lg font-semibold text-foreground mb-1">Water Quality — Last 24h</h3>
            <p className="text-sm text-muted-foreground mb-6">pH & Turbidity trends</p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 18%)" />
                <XAxis dataKey="time" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }} stroke="hsl(222 20% 18%)" />
                <YAxis tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }} stroke="hsl(222 20% 18%)" />
                <Tooltip
                  contentStyle={{ background: 'hsl(222 40% 10%)', border: '1px solid hsl(222 20% 25%)', borderRadius: '8px', color: 'hsl(210 40% 92%)' }}
                />
                <Line type="monotone" dataKey="ph" stroke="hsl(186 100% 50%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="turbidity" stroke="hsl(280 80% 60%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* TDS Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-strong p-6 gradient-border"
          >
            <h3 className="text-lg font-semibold text-foreground mb-1">TDS by Source</h3>
            <p className="text-sm text-muted-foreground mb-6">Total dissolved solids (ppm)</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 18%)" />
                <XAxis dataKey="source" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }} stroke="hsl(222 20% 18%)" />
                <YAxis tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }} stroke="hsl(222 20% 18%)" />
                <Tooltip
                  contentStyle={{ background: 'hsl(222 40% 10%)', border: '1px solid hsl(222 20% 25%)', borderRadius: '8px', color: 'hsl(210 40% 92%)' }}
                />
                <Bar dataKey="tds" fill="hsl(186 100% 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsSection;
