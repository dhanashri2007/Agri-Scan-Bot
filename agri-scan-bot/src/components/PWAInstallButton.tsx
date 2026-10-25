import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { translations } from '../translations';
import { Language } from '../types';

interface PWAInstallButtonProps {
  language: Language;
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ language, className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const t = translations[language];

  // If already running as an installed standalone PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className={`flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs md:text-sm px-3.5 py-2 shadow-md hover:shadow-emerald-900/30 transition active:scale-95 ${className}`}
        title="Install AGRI-SCAN BOT to your home screen"
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span>{t.common.installApp}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/60 hover:bg-emerald-900/50 text-emerald-300 text-xs px-3 py-1.5 transition ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.common.installOnIOS}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center text-emerald-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-semibold text-white">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                  <p>Tap the <strong>Share</strong> button (box with upward arrow) in the Safari toolbar.</p>
                </div>
                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                  <p>Scroll down and select <strong>"Add to Home Screen"</strong>.</p>
                </div>
                <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                  <p>Tap <strong>Add</strong> in the top-right corner to launch as a standalone app.</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Ambient Fallback button for testing / manual guidance
  return (
    <button
      id="pwa-install-manual-btn"
      onClick={() => {
        alert(
          language === 'mr'
            ? "ब्राउझर मेनू उघडा आणि 'Add to Home screen' किंवा 'Install App' निवडा."
            : language === 'hi'
            ? "ब्राउज़र मेनू खोलें और 'Add to Home screen' अथवा 'Install App' चुनें।"
            : "To install: open your browser menu (⋮) and tap 'Add to Home screen' or 'Install App'."
        );
      }}
      className={`flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 text-xs px-2.5 py-1.5 transition ${className}`}
      title="Install PWA"
    >
      <Download className="w-3.5 h-3.5" />
      <span>{t.common.installApp}</span>
    </button>
  );
};
