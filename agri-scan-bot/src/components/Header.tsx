import React from 'react';
import { Bot, HelpCircle, Globe, Wifi, WifiOff, User as UserIcon, LogIn, ChevronDown, Sun, Moon, Sunrise, Leaf } from 'lucide-react';
import { Language, OperatingState, User, AppTheme } from '../types';
import { translations } from '../translations';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  isRobotConnected: boolean;
  operatingState: OperatingState;
  onOpenOnboarding: () => void;
  onNavigate: (view: string) => void;
  user: User | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  isRobotConnected,
  operatingState,
  onOpenOnboarding,
  onNavigate,
  user,
  onOpenAuth,
  onOpenProfile,
}) => {
  const t = translations[language];

  // Rapid cycle to next theme on button click
  const cycleNextTheme = () => {
    const themeOrder: readonly AppTheme[] = ['dark', 'light', 'medium', 'forest'] as const;
    const currentIdx = themeOrder.indexOf(theme);
    const nextIdx = (currentIdx === -1 ? 0 : currentIdx + 1) % themeOrder.length;
    onThemeChange(themeOrder[nextIdx]);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-emerald-900/40 px-3 sm:px-6 py-2.5 transition-colors shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo & Identity */}
        <div
          id="app-brand"
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 p-0.5 shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform flex items-center justify-center border border-emerald-500/30">
            <Bot className="w-5 h-5 text-emerald-100" />
            <span
              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                isRobotConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                {t.appName}
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden xs:inline-block">
                  4WD ESP32
                </span>
              </h1>
            </div>
            <p className="hidden sm:block text-xs text-emerald-400/80 line-clamp-1 max-w-md">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Right Controls: User Profile/Auth, Robot Status, Language, Guide */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Farmer Auth / Profile Button */}
          {user ? (
            <button
              id="header-user-profile-btn"
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-emerald-500/40 text-left transition group shadow-sm"
              title="Click to view or edit your farmer profile"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-600/30 text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1 max-w-[110px]">
                  {user.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium line-clamp-1">
                  {user.primaryCrop || 'Farmer'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
            </button>
          ) : (
            <button
              id="header-login-btn"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.auth.loginNow} / {t.auth.registerNow}</span>
              <span className="sm:hidden">{t.auth.loginNow}</span>
            </button>
          )}

          {/* Robot Connection Status Pill */}
          <button
            id="header-robot-status-pill"
            onClick={() => onNavigate('health')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${
              isRobotConnected
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-rose-950/60 border-rose-600/40 text-rose-300 hover:bg-rose-900/60'
            }`}
            title="Click to inspect Robot Subsystem Health"
          >
            {isRobotConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden lg:inline">Robot:</span>
                <span>{operatingState}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden xs:inline">Robot Offline</span>
                <span className="xs:hidden">Offline</span>
              </>
            )}
          </button>

          {/* Theme Selector with Live Mode Indicator */}
          <div className="relative flex items-center bg-slate-800/80 rounded-xl border border-slate-700/70 p-0.5 shadow-sm">
            <button
              type="button"
              onClick={cycleNextTheme}
              className="pl-2 pr-1 py-1 text-slate-300 hover:text-white transition flex items-center"
              title="Click to quickly cycle theme: Dark ⇄ Light ⇄ Medium ⇄ Forest"
            >
              {theme === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500 animate-pulse" />}
              {theme === 'medium' && <Sunrise className="w-3.5 h-3.5 text-amber-600" />}
              {theme === 'forest' && <Leaf className="w-3.5 h-3.5 text-emerald-500" />}
              {theme === 'dark' && <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            </button>
            <select
              id="theme-select"
              aria-label="Theme Select"
              value={theme}
              onChange={(e) => onThemeChange(e.target.value as AppTheme)}
              className="bg-transparent text-xs font-semibold text-slate-200 py-1.5 pl-0.5 pr-2 rounded-lg focus:outline-none cursor-pointer"
              title={t.theme?.title || 'Display Theme'}
            >
              <option value="dark" className="bg-slate-900 text-white">🌙 {t.theme?.dark || 'Dark'}</option>
              <option value="light" className="bg-slate-900 text-white">☀️ {t.theme?.light || 'Light'}</option>
              <option value="medium" className="bg-slate-900 text-white">🌾 {t.theme?.medium || 'Medium'}</option>
              <option value="forest" className="bg-slate-900 text-white">🍃 {t.theme?.forest || 'Forest'}</option>
            </select>
          </div>

          {/* Language Selector */}
          <div className="relative flex items-center bg-slate-800/80 rounded-xl border border-slate-700/70 p-0.5">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-2" />
            <select
              id="language-select"
              aria-label="Language Select"
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-transparent text-xs font-semibold text-slate-200 py-1.5 pl-1.5 pr-2 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-900 text-white">English</option>
              <option value="mr" className="bg-slate-900 text-white">मराठी (Marathi)</option>
              <option value="hi" className="bg-slate-900 text-white">हिंदी (Hindi)</option>
            </select>
          </div>

          {/* In-App PWA Install Button */}
          <PWAInstallButton language={language} />

          {/* Farmer Guide Help Button */}
          <button
            id="onboarding-guide-btn"
            onClick={onOpenOnboarding}
            className="flex items-center gap-1 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition"
            title="Open Farmer Quick-Start Guide"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span className="hidden lg:inline font-semibold">Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
