import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

export const OfflineIndicator: React.FC<{ language: Language }> = ({ language }) => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const t = translations[language];

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      id="offline-banner"
      className="fixed bottom-16 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 flex items-center justify-between gap-3 rounded-2xl bg-amber-600/95 text-white px-4 py-3 shadow-2xl backdrop-blur-md border border-amber-400/40"
    >
      <div className="flex items-center gap-2.5 text-xs md:text-sm font-medium">
        <WifiOff className="w-5 h-5 flex-shrink-0 animate-pulse text-amber-200" />
        <span>
          <strong>{t.common.offline} Mode</strong> —{' '}
          {language === 'mr'
            ? 'कॅश केलेला डेटा उपलब्ध आहे. लाईव्ह रोबोट आणि AI विश्लेषणासाठी इंटरनेट आवश्यक आहे.'
            : language === 'hi'
            ? 'कैश किया गया डेटा उपलब्ध है। लाइव रोबोट और AI विश्लेषण के लिए नेटवर्क आवश्यक है।'
            : 'Cached UI active. Live robot telemetry and AI analysis require network connection.'}
        </span>
      </div>
      <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-800/80 px-2 py-0.5 rounded text-amber-100">
        PWA Cache
      </span>
    </div>
  );
};
