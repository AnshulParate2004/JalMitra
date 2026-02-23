import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CheckCircle, BookOpen, Droplets, Bell, Clock } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import ThemeToggle from '@/components/ThemeToggle';

const Notifications = () => {
  const { t } = useTranslation();

  const notifications = [
    { time: '8:00 AM', title: t('irrigate_alert'), desc: 'Cotton field - Zone A', type: 'irrigation' as const, done: true, emoji: '💧' },
    { time: '9:30 AM', title: t('learn_alert'), desc: '5 min video - Save 50% water', type: 'education' as const, done: false, emoji: '📚' },
    { time: '12:00 PM', title: 'Weather Alert', desc: 'Light rain expected tomorrow', type: 'weather' as const, done: false, emoji: '🌧️' },
    { time: '2:00 PM', title: t('irrigate_alert'), desc: 'Wheat field - Zone B', type: 'irrigation' as const, done: true, emoji: '💧' },
    { time: '5:00 PM', title: 'Scheme Deadline', desc: 'PMKSY application - 3 days left', type: 'scheme' as const, done: false, emoji: '🏛️' },
    { time: '6:00 PM', title: 'Quiz Available', desc: 'Test your drip irrigation knowledge', type: 'education' as const, done: false, emoji: '🧠' },
  ];

  const typeColors = {
    irrigation: 'border-l-water',
    education: 'border-l-secondary',
    weather: 'border-l-accent',
    scheme: 'border-l-crop',
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="safe-top flex items-center justify-between bg-gradient-earth px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-foreground" />
          <h1 className="text-lg font-bold text-foreground">{t('notifications')}</h1>
        </div>
        <ThemeToggle />
      </header>

      <main className="px-4 py-4">
        {/* Today summary */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center justify-between rounded-2xl bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Today's Progress</div>
              <div className="text-xs text-muted-foreground">2/4 tasks {t('completed')}</div>
            </div>
          </div>
          <div className="text-2xl font-bold text-primary">50%</div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-0.5 bg-border" />

          {notifications.map((notif, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative mb-3 pl-10"
            >
              {/* Timeline dot */}
              <div className={`absolute left-2.5 top-4 h-3 w-3 rounded-full border-2 ${
                notif.done ? 'border-primary bg-primary' : 'border-border bg-card'
              }`} />

              <div className={`rounded-2xl border-l-4 bg-card p-4 ${typeColors[notif.type]}`}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{notif.emoji}</span>
                    <span className="text-sm font-bold text-foreground">{notif.title}</span>
                  </div>
                  {notif.done && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      ✅ {t('completed')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{notif.desc}</p>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" /> {notif.time}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Notifications;
