import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot,
  Send,
  User,
  Loader2,
  Sparkles,
  Info,
  RefreshCw,
  Lightbulb,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  FileCheck,
  Leaf,
} from 'lucide-react';
import { Language, ChatMessage, ScanRecord } from '../types';
import {
  translations,
  getCropDisplayName,
  getDiseaseDisplayName,
} from '../translations';

// Web Speech API interface definitions for TypeScript
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (e: Event) => void;
  onend: (e: Event) => void;
  onerror: (e: any) => void;
  onresult: (e: SpeechRecognitionEvent) => void;
}

interface AIAssistantViewProps {
  language: Language;
  latestScan?: ScanRecord | null;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  language,
  latestScan,
}) => {
  const t = translations[language];

  const getGreeting = useCallback(
    (lang: Language) => {
      if (lang === 'mr') {
        return 'नमस्कार शेतकरी बंधूंनो! मी किसान AI आपला शेती सल्लागार आहे. वनस्पतींचे रोग, पानांवरील लक्षणे, सेंद्रिय उपाय आणि 4WD रोबोट वापरासंबंधी मला कोणताही प्रश्न विचारा. मी आपल्या सेवेत आहे!';
      }
      if (lang === 'hi') {
        return 'नमस्ते किसान भाई! मैं किसान एआई, आपका कृषि सलाहकार हूँ। पौधों के रोग, जैविक उपचार, सिंचाई और रोबोट संचालन पर आपकी सहायता कर सकता हूँ। अपना प्रश्न पूछें!';
      }
      return 'Welcome! I am Kisan AI, your agricultural companion. I can help diagnose leaf diseases, suggest organic remedies, and guide robot scouting. How can I help your farm today?';
    },
    []
  );

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-01',
      sender: 'assistant',
      text: getGreeting(language),
      createdAt: new Date().toISOString(),
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Check if Web Speech API is supported
  const isSpeechRecognitionSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Auto-scroll on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Update greeting when language changes if only the initial greeting exists
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome-01') {
        return [
          {
            id: 'welcome-01',
            sender: 'assistant',
            text: getGreeting(language),
            createdAt: new Date().toISOString(),
          },
        ];
      }
      return prev;
    });
  }, [language, getGreeting]);

  // Setup Web Speech Recognition
  useEffect(() => {
    if (!isSpeechRecognitionSupported) return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      try {
        const recognition: SpeechRecognitionInstance = new SpeechRecognitionClass();
        recognition.continuous = false;
        recognition.interimResults = false;
        // en-IN, mr-IN, or hi-IN based on selected language
        recognition.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition error:', e);
          setIsListening(false);
        };

        recognition.onresult = (e: SpeechRecognitionEvent) => {
          const transcript = e.results[0]?.[0]?.transcript;
          if (transcript) {
            setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Could not initialize SpeechRecognition:', err);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [language, isSpeechRecognitionSupported]);

  // Toggle voice dictation
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang =
          language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  };

  // Text-To-Speech (Read Aloud) using window.speechSynthesis
  const handleReadAloud = (messageId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // If currently speaking this message, stop
    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingMessageId(messageId);

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.lang = targetLang;

    // Try finding matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) => v.lang.startsWith(targetLang) || v.lang.replace('_', '-').startsWith(targetLang)
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Language-matched quick question chips
  const getPromptSuggestions = () => {
    if (language === 'mr') {
      const base = [
        'टोमॅटोवरील अर्ली ब्लाईट (करपा) कसा ओळखावा आणि सेंद्रिय उपाय काय आहेत?',
        'कपाशीवरील बोंडअळी व पानांचा चुरमुरडा थांबवण्यासाठी उपाय सांगा.',
        'बटाट्यावरील लेट ब्लाईट आणि पावसाळ्यानंतर पिकांचे संरक्षण कसे करावे?',
      ];
      if (latestScan) {
        base.unshift(`माझ्या ${getCropDisplayName(latestScan.crop, 'mr')} च्या पानावरील रोगावर सेंद्रिय उपाय सांगा.`);
      }
      return base;
    }
    if (language === 'hi') {
      const base = [
        'टमाटर में अगेती झुलसा (Early Blight) के लक्षण और जैविक उपचार क्या हैं?',
        'कपास में पत्ती मरोड़ और कीट नियंत्रण के लिए क्या करें?',
        'आलू में पछेती झुलसा रोकने के जैविक तरीके बताइए।',
      ];
      if (latestScan) {
        base.unshift(`मेरे ${getCropDisplayName(latestScan.crop, 'hi')} की पत्ती के रोग का उपचार बताएं।`);
      }
      return base;
    }
    const base = [
      'What are the symptoms and organic management of Early Blight in tomato?',
      'How to scout and manage Leaf Curl in Cotton using robot cameras?',
      'What are recommended scouting intervals for potato fields after rain?',
    ];
    if (latestScan) {
      base.unshift(`Explain organic management for my scanned ${latestScan.crop} leaf.`);
    }
    return base;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const resp = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language,
          latestScan: latestScan || null,
          conversationHistory: messages.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          })),
        }),
      });

      const data = await resp.json();

      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Assistant service failed');
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Response error';
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text:
            language === 'mr'
              ? `क्षमस्व, संपर्क होऊ शकला नाही: ${message}. कृपया इंटरनेट तपासा.`
              : language === 'hi'
              ? `क्षमा करें, प्रतिक्रिया प्राप्त नहीं हो सकी: ${message}. कृपया कनेक्शन जांचें.`
              : `Apologies, unable to retrieve AI response: ${message}. Please check your connection.`,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20 md:pb-8 flex flex-col h-[82vh]">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{t.assistant.title}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                Gemini 3.8 Intelligence
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'mr'
                ? 'मराठी, हिंदी व इंग्रजी भाषेत कृषी सल्लागार'
                : language === 'hi'
                ? 'हिंदी, मराठी एवं अंग्रेजी में कृषि सलाहकार'
                : 'Multilingual plant pathology & 4WD robot companion'}
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'welcome-01',
                sender: 'assistant',
                text: getGreeting(language),
                createdAt: new Date().toISOString(),
              },
            ])
          }
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
          title="Reset Chat"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Latest Leaf Scan Context Banner */}
      {latestScan && (
        <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="line-clamp-1">
              <strong>{t.assistant.scanContextNotice}:</strong>{' '}
              <span>{getCropDisplayName(latestScan.crop, language)}</span> —{' '}
              <span className="text-emerald-300 font-semibold">{getDiseaseDisplayName(latestScan.disease, language)}</span>
            </div>
          </div>
          <button
            onClick={() =>
              handleSendMessage(
                language === 'mr'
                  ? `माझ्या ${getCropDisplayName(latestScan.crop, 'mr')} च्या पानावर ${getDiseaseDisplayName(latestScan.disease, 'mr')} आढळले आहे. सेंद्रिय उपाय सांगा.`
                  : language === 'hi'
                  ? `मेरे ${getCropDisplayName(latestScan.crop, 'hi')} पर ${getDiseaseDisplayName(latestScan.disease, 'hi')} है, इसका उपचार बताएं।`
                  : `What are the next cultural management steps for my ${latestScan.crop} leaf with ${latestScan.disease}?`
              )
            }
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex-shrink-0 transition"
          >
            Ask About Leaf
          </button>
        </div>
      )}

      {/* Decision Support Advisory Notice */}
      <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs">
        <Info className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span className="text-[11px] leading-tight">
          <strong>{t.assistant.disclaimer}</strong>
        </span>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-slate-900/80 rounded-2xl border border-slate-800 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs ${
                  isUser
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-emerald-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-xl rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-800/80 text-slate-200 border border-slate-700/70 whitespace-pre-wrap'
                }`}
              >
                <div>{msg.text}</div>

                <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-slate-700/40 text-[10px]">
                  <span className={isUser ? 'text-emerald-200' : 'text-slate-500'}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {/* Read Aloud Button on Bot messages */}
                  {!isUser && (
                    <button
                      onClick={() => handleReadAloud(msg.id, msg.text)}
                      className="flex items-center gap-1 text-slate-400 hover:text-emerald-300 transition"
                      title={speakingMessageId === msg.id ? t.assistant.stopSpeech : t.assistant.readAloud}
                    >
                      {speakingMessageId === msg.id ? (
                        <>
                          <VolumeX className="w-3 h-3 text-rose-400 animate-pulse" />
                          <span className="text-rose-400">Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-emerald-400" />
                          <span>{t.assistant.readAloud}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800/80 text-slate-300 rounded-2xl px-4 py-3 border border-slate-700/70 flex items-center gap-2 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>
                {language === 'mr'
                  ? 'सल्लागार उत्तर तयार करत आहे...'
                  : language === 'hi'
                  ? 'सलाहकार उत्तर तैयार कर रहा है...'
                  : 'Analyzing agronomic query...'}
              </span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 ml-1" />
        {getPromptSuggestions().map((prompt, idx) => (
          <button
            key={idx}
            disabled={isLoading}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] whitespace-nowrap transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Bar with Web Speech Microphone Button */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800"
      >
        {/* Microphone Button (Web Speech API) - Hidden if browser does not support it */}
        {isSpeechRecognitionSupported && (
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-xl transition ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700'
            }`}
            title={isListening ? t.assistant.micListening : t.assistant.micStart}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        )}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isListening ? t.assistant.micListening : t.assistant.placeholder}
          className="flex-1 bg-transparent text-white text-xs sm:text-sm px-3 py-2 focus:outline-none placeholder:text-slate-500"
        />

        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition shadow-sm"
          title={t.assistant.sendBtn}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
