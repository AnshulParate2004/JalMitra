import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Play, BookOpen, Calendar, Award, HelpCircle, ChevronRight, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';

type Tab = 'videos' | 'guides' | 'calendar' | 'schemes' | 'quiz';

const tabs: { key: Tab; icon: typeof Play; emoji: string }[] = [
  { key: 'videos', icon: Play, emoji: '🎬' },
  { key: 'guides', icon: BookOpen, emoji: '📘' },
  { key: 'calendar', icon: Calendar, emoji: '📅' },
  { key: 'schemes', icon: Award, emoji: '💰' },
  { key: 'quiz', icon: HelpCircle, emoji: '🧠' },
];

const Education = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('videos');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="safe-top bg-gradient-earth px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">📚 {t('education')}</h1>
          <div className="flex gap-2">
            <LanguageSelector compact />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="overflow-x-auto border-b border-border">
        <div className="flex gap-1 px-4 py-2">
          {tabs.map(({ key, emoji }) => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <span>{emoji}</span>
              {t(key === 'videos' ? 'video_library' : key === 'guides' ? 'how_to_guides' : key === 'calendar' ? 'crop_calendars' : key === 'schemes' ? 'scheme_guides' : 'quizzes')}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'videos' && (
              <div className="space-y-4">
                {[
                  { title: t('drip_vs_flood'), desc: t('drip_benefit'), duration: '5 min', emoji: '💧' },
                  { title: t('soil_testing'), desc: 'pH meter, NPK kit tutorial', duration: '8 min', emoji: '🧪' },
                  { title: 'Sprinkler Setup Guide', desc: 'Complete installation walkthrough', duration: '12 min', emoji: '🌊' },
                ].map((video, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex items-center gap-3 rounded-2xl bg-card p-4"
                  >
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-accent/10 text-3xl">
                      {video.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-foreground">{video.title}</h3>
                      <p className="text-xs text-muted-foreground">{video.desc}</p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-accent">
                        <Play className="h-3 w-3" /> {video.duration}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                ))}
                {/* Animated infographic */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-2xl bg-accent/5 p-6"
                >
                  <h3 className="mb-4 text-center text-sm font-bold text-foreground">Drip vs Flood Comparison</h3>
                  <div className="flex justify-around">
                    <div className="text-center">
                      <motion.div
                        className="text-4xl"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        💧
                      </motion.div>
                      <div className="mt-2 text-xs font-bold text-primary">Drip</div>
                      <div className="text-xs text-muted-foreground">50% less water</div>
                      <motion.div
                        className="mt-2 h-2 w-16 overflow-hidden rounded-full bg-muted"
                      >
                        <motion.div
                          className="h-full rounded-full bg-crop"
                          initial={{ width: 0 }}
                          animate={{ width: '90%' }}
                          transition={{ delay: 1, duration: 1.5 }}
                        />
                      </motion.div>
                      <div className="mt-1 text-[10px] text-crop">90% efficient</div>
                    </div>
                    <div className="text-center">
                      <motion.div
                        className="text-4xl"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        🌊
                      </motion.div>
                      <div className="mt-2 text-xs font-bold text-destructive">Flood</div>
                      <div className="text-xs text-muted-foreground">High water use</div>
                      <motion.div
                        className="mt-2 h-2 w-16 overflow-hidden rounded-full bg-muted"
                      >
                        <motion.div
                          className="h-full rounded-full bg-destructive/60"
                          initial={{ width: 0 }}
                          animate={{ width: '40%' }}
                          transition={{ delay: 1, duration: 1.5 }}
                        />
                      </motion.div>
                      <div className="mt-1 text-[10px] text-destructive">40% efficient</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === 'guides' && (
              <div className="space-y-4">
                {[
                  { title: t('soil_testing'), steps: ['Collect soil sample', 'Use pH meter', 'Check NPK levels', 'Record results'], emoji: '🧪' },
                  { title: 'Drip System Installation', steps: ['Plan layout', 'Install mainline', 'Connect laterals', 'Set timer'], emoji: '🔧' },
                  { title: 'Composting at Home', steps: ['Collect waste', 'Layer materials', 'Turn weekly', 'Use in 3 months'], emoji: '♻️' },
                ].map((guide, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="rounded-2xl bg-card p-4"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-2xl">{guide.emoji}</span>
                      <h3 className="text-sm font-bold text-foreground">{guide.title}</h3>
                    </div>
                    <div className="space-y-2">
                      {guide.steps.map((step, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + j * 0.1 }}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                            {j + 1}
                          </span>
                          <span className="text-foreground">{step}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="space-y-4">
                {[
                  { crop: t('crop_cotton'), emoji: '🌿', months: [
                    { month: 'Feb', action: t('sow'), color: 'bg-crop/20 text-crop' },
                    { month: 'May', action: t('irrigate'), color: 'bg-accent/20 text-accent' },
                    { month: 'Oct', action: t('harvest'), color: 'bg-secondary/20 text-secondary' },
                  ]},
                  { crop: t('crop_wheat'), emoji: '🌾', months: [
                    { month: 'Nov', action: t('sow'), color: 'bg-crop/20 text-crop' },
                    { month: 'Feb', action: t('irrigate'), color: 'bg-accent/20 text-accent' },
                    { month: 'Apr', action: t('harvest'), color: 'bg-secondary/20 text-secondary' },
                  ]},
                  { crop: t('crop_rice'), emoji: '🍚', months: [
                    { month: 'Jun', action: t('sow'), color: 'bg-crop/20 text-crop' },
                    { month: 'Aug', action: t('irrigate'), color: 'bg-accent/20 text-accent' },
                    { month: 'Nov', action: t('harvest'), color: 'bg-secondary/20 text-secondary' },
                  ]},
                ].map((crop, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="rounded-2xl bg-card p-4"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-2xl">{crop.emoji}</span>
                      <h3 className="text-sm font-bold text-foreground">{crop.crop}</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      {crop.months.map((m, j) => (
                        <motion.div
                          key={j}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + j * 0.2, type: 'spring' }}
                          className="flex flex-col items-center"
                        >
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${m.color}`}>
                            {m.month}
                          </span>
                          <span className="mt-1 text-[10px] text-muted-foreground">{m.action}</span>
                          {j < crop.months.length - 1 && (
                            <div className="absolute">
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'schemes' && (
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl bg-card p-4"
                >
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                    <span className="text-xl">🏛️</span> {t('pmksy_guide')}
                  </h3>
                  <p className="mb-4 text-xs text-muted-foreground">Pradhan Mantri Krishi Sinchayee Yojana</p>
                  
                  <div className="space-y-3">
                    {[
                      { step: 1, title: t('tehsil_office'), desc: 'Visit with Aadhaar + Land records', emoji: '🏢' },
                      { step: 2, title: t('fill_form'), desc: 'Submit irrigation plan details', emoji: '📝' },
                      { step: 3, title: t('get_subsidy'), desc: 'Drip/Sprinkler equipment covered', emoji: '✅' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.2 }}
                        className="flex items-start gap-3"
                      >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary/20 text-sm font-bold text-secondary">
                          {item.step}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span>{item.emoji}</span>
                            <span className="text-sm font-medium text-foreground">{item.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-card p-5"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-2xl">🧠</span>
                    <h3 className="text-sm font-bold text-foreground">{t('test_knowledge')}</h3>
                  </div>
                  
                  <p className="mb-4 text-sm text-foreground">{t('quiz_q1')}</p>
                  
                  <div className="space-y-2">
                    {[t('quiz_a1_1'), t('quiz_a1_2'), t('quiz_a1_3')].map((answer, i) => (
                      <motion.button
                        key={i}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setQuizAnswer(i)}
                        disabled={quizAnswer !== null}
                        className={`w-full rounded-xl border-2 p-3 text-left text-sm transition-colors ${
                          quizAnswer === null
                            ? 'border-border bg-background text-foreground hover:border-primary/50'
                            : i === 1
                            ? 'border-crop bg-crop/10 text-crop'
                            : quizAnswer === i
                            ? 'border-destructive bg-destructive/10 text-destructive'
                            : 'border-border bg-background text-muted-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {quizAnswer !== null && i === 1 && <CheckCircle className="h-4 w-4" />}
                          {quizAnswer !== null && quizAnswer === i && i !== 1 && <XCircle className="h-4 w-4" />}
                          <span>{answer}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <AnimatePresence>
                    {quizAnswer !== null && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={`mt-4 rounded-xl p-3 text-sm ${
                          quizAnswer === 1 ? 'bg-crop/10 text-crop' : 'bg-destructive/10 text-destructive'
                        }`}
                      >
                        {quizAnswer === 1 ? t('quiz_correct') : t('quiz_wrong')}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {quizAnswer !== null && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setQuizAnswer(null)}
                      className="mt-3 w-full rounded-xl bg-primary py-2 text-sm font-bold text-primary-foreground"
                    >
                      Next Question →
                    </motion.button>
                  )}
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
};

export default Education;
