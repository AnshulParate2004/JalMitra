import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Droplets, BookOpen, Cloud, Thermometer, Wind, Eye } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import MoistureGauge from '@/components/MoistureGauge';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';
import { useNavigate } from 'react-router-dom';

const cardUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const weather = [
    { icon: Thermometer, label: '32°C', sub: 'Temperature' },
    { icon: Cloud, label: '45%', sub: 'Humidity' },
    { icon: Wind, label: '12 km/h', sub: 'Wind' },
  ];

  const wisdomQuotes = [
    { hi: "बूंद-बूंद से सागर भरता है", en: "Drop by drop fills the ocean" },
    { hi: "सीखो, उगाओ, बचाओ", en: "Learn, Grow, Save" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="safe-top flex items-center justify-between bg-gradient-earth px-4 py-3">
        <div>
          <h1 className="text-lg font-bold text-foreground">{t('dashboard')}</h1>
          <p className="text-xs text-muted-foreground">📍 Nagpur, Maharashtra</p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector compact />
          <ThemeToggle />
        </div>
      </header>

      <main className="px-4 py-4">
        {/* Weather bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center justify-around rounded-2xl bg-card p-3"
        >
          {weather.map((w, i) => (
            <div key={i} className="flex items-center gap-2">
              <w.icon className="h-4 w-4 text-accent" />
              <div>
                <div className="text-sm font-bold text-foreground">{w.label}</div>
                <div className="text-[10px] text-muted-foreground">{w.sub}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Moisture + Recommendation */}
        <motion.div
          custom={0}
          variants={cardUp}
          initial="hidden"
          animate="show"
          className="mb-4 flex items-center gap-4 rounded-2xl bg-card p-4"
        >
          <MoistureGauge percentage={18} recommendation={`25L ${t('irrigate_today')}`} />
          <div className="flex-1 space-y-3">
            <div className="rounded-xl bg-primary/10 p-3">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-water" />
                <span className="text-lg font-bold text-foreground">25L</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t('irrigate_today')}</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/education')}
              className="flex w-full items-center gap-2 rounded-xl bg-secondary/20 p-3"
            >
              <BookOpen className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-foreground">{t('learn_drip')}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Education Cards */}
        <h2 className="mb-3 text-sm font-bold text-foreground">📚 {t('learn')}</h2>
        <div className="mb-4 space-y-3">
          {[
            { emoji: '💧', title: t('drip_vs_flood'), desc: t('drip_benefit'), color: 'bg-accent/10' },
            { emoji: '🧪', title: t('soil_testing'), desc: 'pH, NPK testing at home', color: 'bg-primary/10' },
            { emoji: '📅', title: t('cotton_cycle'), desc: 'Feb → May → Oct', color: 'bg-secondary/10' },
          ].map((card, i) => (
            <motion.div
              key={i}
              custom={i + 1}
              variants={cardUp}
              initial="hidden"
              animate="show"
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/education')}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl ${card.color} p-4`}
            >
              <span className="text-3xl">{card.emoji}</span>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-foreground">{card.title}</h3>
                <p className="text-xs text-muted-foreground">{card.desc}</p>
              </div>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          ))}
        </div>

        {/* Wisdom Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="rounded-xl bg-card p-4 text-center"
        >
          <p className="font-devanagari text-sm font-medium text-foreground">
            "{wisdomQuotes[0].hi}"
          </p>
          <p className="mt-1 text-xs italic text-muted-foreground">{wisdomQuotes[0].en}</p>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
