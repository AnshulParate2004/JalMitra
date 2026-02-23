import { Home, BookOpen, Droplets, Bell, MessageSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { key: 'home', icon: Home, path: '/' },
  { key: 'farm', icon: Droplets, path: '/dashboard' },
  { key: 'learn', icon: BookOpen, path: '/education' },
  { key: 'voice_bot', icon: MessageSquare, path: '/voice-bot' },
  { key: 'alerts', icon: Bell, path: '/notifications' },
];

const BottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map(({ key, icon: Icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary"
                  />
                )}
              </div>
              <span className="text-[10px] font-medium">{t(key)}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
