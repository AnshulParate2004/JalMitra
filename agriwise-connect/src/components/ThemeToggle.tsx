import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-sm font-medium text-foreground transition-colors"
      aria-label={theme === 'light' ? t('dark_mode') : t('light_mode')}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 text-accent" />
      ) : (
        <Sun className="h-4 w-4 text-harvest" />
      )}
      <span className="hidden sm:inline">{theme === 'light' ? t('dark_mode') : t('light_mode')}</span>
    </motion.button>
  );
};

export default ThemeToggle;
