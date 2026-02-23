import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Send, Volume2, Loader2, MessageSquare, X } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { voiceBotApi } from '@/services/voiceBotApi';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isAudio?: boolean;
}

const VoiceBot = () => {
  const { t, i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t('voice_bot_welcome'),
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'mr' ? 'mr-IN' : 'en-IN';

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        handleSendMessage(transcript);
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [i18n.language]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      // Call backend RAG API
      const data = await voiceBotApi.query({
        query: messageText,
        language: i18n.language,
      });

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || data.message || t('voice_bot_error'),
        isUser: false,
        timestamp: new Date(),
        isAudio: data.audio_url ? true : false,
      };
      setMessages((prev) => [...prev, botMessage]);

      // Play audio if available
      if (data.audio_url) {
        const audio = new Audio(data.audio_url);
        audio.play();
      } else if (data.response) {
        // Use browser TTS as fallback
        speakText(data.response);
      }
    } catch (error) {
      console.error('Error calling voice bot:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: t('voice_bot_error'),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'mr' ? 'mr-IN' : 'en-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: t('voice_bot_welcome'),
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      {/* Header */}
      <header className="safe-top bg-gradient-earth px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">{t('voice_bot')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clearChat}>
              <X className="h-4 w-4" />
            </Button>
            <LanguageSelector compact />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <Card
                  className={`max-w-[80%] p-3 ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  {!message.isUser && message.isAudio && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-6"
                      onClick={() => speakText(message.text)}
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <Card className="bg-card p-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </Card>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-20 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-md safe-bottom">
        <div className="flex items-center gap-2 px-4 py-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={isListening ? stopListening : startListening}
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isListening
                ? 'bg-destructive text-destructive-foreground animate-pulse'
                : 'bg-primary text-primary-foreground'
            }`}
          >
            {isListening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </motion.button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={t('voice_bot_placeholder')}
            className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isProcessing}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </motion.button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-2">
          {[
            t('voice_bot_quick_pmksy'),
            t('voice_bot_quick_irrigation'),
            t('voice_bot_quick_crop'),
            t('voice_bot_quick_subsidy'),
          ].map((quickText, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSendMessage(quickText)}
              className="whitespace-nowrap rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground"
            >
              {quickText}
            </motion.button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export default VoiceBot;
