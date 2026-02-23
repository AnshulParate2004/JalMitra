import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Droplets, BookOpen, ChevronRight } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const HeroLanding = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-sky">
      {/* Floating background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-[10%] top-[15%] text-6xl opacity-20"
          animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          🌾
        </motion.div>
        <motion.div
          className="absolute right-[15%] top-[25%] text-5xl opacity-15"
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        >
          💧
        </motion.div>
        <motion.div
          className="absolute bottom-[30%] left-[20%] text-4xl opacity-15"
          animate={{ y: [-8, 8, -8], x: [-5, 5, -5] }}
          transition={{ duration: 7, repeat: Infinity, delay: 2 }}
        >
          📚
        </motion.div>
        <motion.div
          className="absolute bottom-[20%] right-[10%] text-6xl opacity-20"
          animate={{ y: [8, -8, 8] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
        >
          🚜
        </motion.div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 safe-top">
        <LanguageSelector compact />
        <ThemeToggle />
      </header>

      {/* Hero Content */}
      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center px-4 pb-32 pt-8"
      >
        {/* Tractor Animation */}
        <motion.div
          variants={fadeUp}
          className="mb-6"
        >
          <motion.div
            className="text-7xl"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.5, type: 'spring', stiffness: 60 }}
          >
            🚜
          </motion.div>
        </motion.div>

        {/* Crops growing */}
        <motion.div
          variants={fadeUp}
          className="mb-4 flex gap-2"
        >
          {['🌱', '🌿', '🌾', '🌻', '🌽'].map((emoji, i) => (
            <motion.span
              key={i}
              className="text-3xl"
              initial={{ scaleY: 0, originY: 1 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 1.5 + i * 0.2, duration: 0.8, type: 'spring' }}
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>

        {/* Book pages flip */}
        <motion.div
          variants={fadeUp}
          className="mb-8"
        >
          <motion.span
            className="text-5xl"
            initial={{ rotateY: -90 }}
            animate={{ rotateY: 0 }}
            transition={{ delay: 2.5, duration: 0.8, type: 'spring' }}
            style={{ display: 'inline-block' }}
          >
            📖
          </motion.span>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={fadeUp}
          className="mb-2 text-center font-devanagari text-3xl font-extrabold text-foreground sm:text-4xl"
        >
          {t('hero_title')}
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mb-8 max-w-md text-center text-sm text-muted-foreground sm:text-base"
        >
          {t('hero_subtitle')}
        </motion.p>

        {/* Stats */}
        <motion.div
          variants={fadeUp}
          className="mb-8 flex gap-4 text-center"
        >
          {[
            { label: t('water_saving'), value: '50%', emoji: '💧' },
            { label: t('yield_boost'), value: '40%', emoji: '🌾' },
            { label: t('subsidy'), value: '₹50K', emoji: '💰' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="glass-card rounded-xl px-4 py-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-xl">{stat.emoji}</div>
              <div className="text-lg font-bold text-primary">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={fadeUp}
          className="flex w-full max-w-sm flex-col gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-lg font-bold text-primary-foreground shadow-lg animate-pulse-glow"
          >
            <Droplets className="h-5 w-5" />
            {t('register')}
            <ChevronRight className="h-5 w-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/education')}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-secondary bg-secondary/10 px-6 py-4 text-lg font-bold text-secondary shadow-md"
          >
            <BookOpen className="h-5 w-5" />
            {t('education')}
            <ChevronRight className="h-5 w-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 rounded-2xl bg-accent/10 px-6 py-3 text-sm font-medium text-accent"
          >
            {t('login')} →
          </motion.button>
        </motion.div>

        {/* Farmer wisdom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.5, duration: 0.8 }}
          className="mt-8 max-w-sm rounded-xl bg-card/60 p-4 text-center backdrop-blur-sm"
        >
          <p className="font-devanagari text-sm italic text-muted-foreground">
            "जो किसान सीखता है, वो हमेशा उगाता है"
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            — Indian Farmer Wisdom
          </p>
        </motion.div>
      </motion.main>
    </div>
  );
};

export default HeroLanding;
