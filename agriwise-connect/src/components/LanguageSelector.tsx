import { useTranslation } from 'react-i18next';
import { languageNames } from '@/i18n/translations';
import { motion } from 'framer-motion';

const LanguageSelector = ({ compact = false }: { compact?: boolean }) => {
  const { i18n } = useTranslation();
  const langs = Object.entries(languageNames);

  if (compact) {
    return (
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="rounded-lg border border-border bg-card px-2 py-1 text-sm text-foreground"
      >
        {langs.map(([code, info]) => (
          <option key={code} value={code}>
            {info.flower} {info.native}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {langs.map(([code, info], i) => (
        <motion.button
          key={code}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => i18n.changeLanguage(code)}
          className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-colors ${
            i18n.language === code
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card hover:border-primary/50'
          }`}
        >
          <span className="text-2xl">{info.flower}</span>
          <span className="text-xs font-semibold text-foreground">{info.native}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default LanguageSelector;
