import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Phone, Globe, MapPin, BookOpen, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';

const steps = [
  { icon: Phone, key: 'step1' },
  { icon: Globe, key: 'step2' },
  { icon: MapPin, key: 'step3' },
  { icon: BookOpen, key: 'step4' },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

const Registration = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const next = () => {
    if (step < 3) { setDir(1); setStep(s => s + 1); }
    else navigate('/dashboard');
  };
  const prev = () => {
    if (step > 0) { setDir(-1); setStep(s => s - 1); }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Progress */}
      <div className="safe-top px-4 pt-4">
        <div className="mb-2 flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-1 items-center">
              <motion.div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                  i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
                animate={{ scale: i === step ? 1.15 : 1 }}
              >
                {i < step ? <Check className="h-5 w-5" /> : <s.icon className="h-4 w-4" />}
              </motion.div>
              {i < 3 && (
                <div className={`mx-1 h-1 flex-1 rounded-full ${i < step ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex flex-1 flex-col px-4 py-6">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <h2 className="mb-1 text-xl font-bold text-foreground">{t(`step${step + 1}_title`)}</h2>
            <p className="mb-6 text-sm text-muted-foreground">{t(`step${step + 1}_desc`)}</p>

            {step === 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-xl border-2 border-border bg-card p-3">
                  <span className="text-lg">🇮🇳</span>
                  <span className="text-muted-foreground">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder={t('phone_placeholder')}
                    className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
                {/* Floating numbers animation */}
                <div className="relative h-20">
                  {[1,2,3,4,5,6,7,8,9,0].map((n, i) => (
                    <motion.span
                      key={i}
                      className="absolute text-2xl font-bold text-primary/20"
                      style={{ left: `${(i * 10) % 90}%` }}
                      animate={{ y: [0, -30, 0], opacity: [0.1, 0.4, 0.1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                    >
                      {n}
                    </motion.span>
                  ))}
                </div>
                {!otpSent ? (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setOtpSent(true)}
                    disabled={phone.length < 10}
                    className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground disabled:opacity-50"
                  >
                    {t('send_otp')}
                  </motion.button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-center gap-2">
                      {[0,1,2,3].map(i => (
                        <motion.input
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          type="text"
                          maxLength={1}
                          value={otp[i] || ''}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '');
                            const newOtp = otp.split('');
                            newOtp[i] = val;
                            setOtp(newOtp.join(''));
                            if (val && e.target.nextElementSibling) {
                              (e.target.nextElementSibling as HTMLInputElement).focus();
                            }
                          }}
                          className="h-14 w-14 rounded-xl border-2 border-border bg-card text-center text-2xl font-bold text-foreground focus:border-primary focus:outline-none"
                        />
                      ))}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={next}
                      className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground"
                    >
                      {t('verify_otp')}
                    </motion.button>
                  </div>
                )}
              </div>
            )}

            {step === 1 && <LanguageSelector />}

            {step === 2 && (
              <div className="space-y-4">
                {/* Simplified map placeholder */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 1.5 }}
                  className="relative flex h-64 items-center justify-center overflow-hidden rounded-2xl border-2 border-border bg-gradient-earth"
                >
                  <motion.span
                    className="text-8xl"
                    initial={{ scale: 2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1, type: 'spring' }}
                  >
                    🗺️
                  </motion.span>
                  <motion.div
                    className="absolute text-3xl"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.5, type: 'spring', stiffness: 200, damping: 10 }}
                  >
                    📍
                  </motion.div>
                </motion.div>
                {/* Soil preview */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'pH', value: '6.8', emoji: '🧪' },
                    { label: 'NPK', value: 'Medium', emoji: '🌿' },
                    { label: 'Type', value: 'Black', emoji: '🟤' },
                  ].map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2 + i * 0.2 }}
                      className="rounded-xl bg-card p-3 text-center"
                    >
                      <div className="text-xl">{s.emoji}</div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                      <div className="text-sm font-bold text-foreground">{s.value}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-card p-6 text-center"
                >
                  <motion.span
                    className="mb-4 inline-block text-6xl"
                    animate={{ rotateY: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    🌾
                  </motion.span>
                  <h3 className="font-devanagari text-xl font-bold text-foreground">कपास सीखें?</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Learn cotton farming best practices, irrigation schedules, and government schemes
                  </p>
                </motion.div>
                {['📹 ' + t('video_library'), '📅 ' + t('crop_calendars'), '💰 ' + t('scheme_guides')].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.2 }}
                    className="flex items-center gap-3 rounded-xl bg-card p-3"
                  >
                    <span className="text-lg">{item.slice(0, 2)}</span>
                    <span className="text-sm font-medium text-foreground">{item.slice(2)}</span>
                    <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={prev}
              className="flex items-center gap-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground"
            >
              <ChevronLeft className="h-4 w-4" /> {t('prev')}
            </motion.button>
          )}
          {step > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={next}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"
            >
              {step === 3 ? t('finish') : t('next')} <ChevronRight className="h-4 w-4" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Registration;
