import { motion } from 'framer-motion';

interface MoistureGaugeProps {
  percentage: number;
  recommendation: string;
}

const MoistureGauge = ({ percentage, recommendation }: MoistureGaugeProps) => {
  const fillLevel = Math.min(100, Math.max(0, percentage));

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-48 w-20 overflow-hidden rounded-2xl border-2 border-border bg-muted">
        {/* Water fill */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-b-xl"
          style={{
            background: `linear-gradient(180deg, hsl(var(--water) / 0.6) 0%, hsl(var(--water)) 100%)`,
          }}
          initial={{ height: '0%' }}
          animate={{ height: `${fillLevel}%` }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-2xl font-bold text-foreground drop-shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {fillLevel}%
          </motion.span>
        </div>
        {/* Plant sprout at top */}
        <motion.div
          className="absolute -top-1 left-1/2 -translate-x-1/2 text-2xl"
          initial={{ scaleY: 0, originY: 1 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 1.5, duration: 1, ease: 'easeOut' }}
        >
          🌱
        </motion.div>
      </div>
      <motion.p
        className="text-center text-sm font-medium text-muted-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2 }}
      >
        {recommendation}
      </motion.p>
    </div>
  );
};

export default MoistureGauge;
