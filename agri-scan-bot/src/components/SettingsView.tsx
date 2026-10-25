import React, { useState } from 'react';
import {
  Settings,
  Globe,
  Bot,
  User as UserIcon,
  Smartphone,
  Cpu,
  ShieldCheck,
  Check,
  LogOut,
  LogIn,
  KeyRound,
  Sun,
  Moon,
  Sunrise,
  Leaf,
  Palette,
  CheckCircle2,
} from 'lucide-react';
import { Language, User, AppTheme } from '../types';
import { translations } from '../translations';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsViewProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  robotId: string;
  onUpdateRobotId: (id: string) => void;
  user?: User | null;
  onOpenAuth?: () => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  onLanguageChange,
  theme,
  onThemeChange,
  robotId,
  onUpdateRobotId,
  user,
  onOpenAuth,
  onOpenProfile,
  onLogout,
}) => {
  const t = translations[language];

  const [currentId, setCurrentId] = useState(robotId);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRobotId(currentId.trim() || 'ASB-ROBOT-001');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          <span>{t.nav.settings}</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure application language, robot field identifier, and farmer account security.
        </p>
      </div>

      {/* Farmer Account & Authentication Card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <UserIcon className="w-4 h-4 text-emerald-400" />
            <span>{t.auth.profileTitle}</span>
          </div>
          {user ? (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Session
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Guest Mode
            </span>
          )}
        </div>

        {user ? (
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{user.name}</span>
                <span className="text-xs text-slate-400">({user.mobile})</span>
              </div>
              <p className="text-xs text-slate-300">
                Plot: {user.farmName || 'Primary Plot'} • Primary Crop: {user.primaryCrop || 'Tomato'}
              </p>
              <p className="text-[11px] text-slate-500">
                User ID: {user.id} • Registered {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={onOpenProfile}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                Edit Profile
              </button>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t.auth.logout}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Sign In or Register</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Save scan reports to your farm cloud profile, sync alerts, and configure multi-plot analytics.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm self-start sm:self-auto"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.auth.loginNow} / {t.auth.registerNow}</span>
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-4">
        {/* Display Themes (Light, Medium, Dark, Forest) */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Palette className="w-4 h-4 text-emerald-400" />
              <span>{t.theme?.title || 'Display Theme'}</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              4 Field Modes Available
            </span>
          </div>

          <p className="text-xs text-slate-400">
            {t.theme?.subtitle || 'Select lighting theme for field sunlight or night scouting:'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. High-Tech Dark (Night Ops) */}
            <button
              type="button"
              id="theme-btn-dark"
              onClick={() => onThemeChange('dark')}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                theme === 'dark'
                  ? 'border-emerald-500 bg-slate-800/90 ring-1 ring-emerald-500 shadow-md'
                  : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/70 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-indigo-400 shadow-inner">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{t.theme?.dark || 'High-Tech Dark (Night)'}</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">
                      Night Ops & OLED Battery Saver
                    </span>
                  </div>
                </div>
                {theme === 'dark' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </div>

              <p className="text-[11px] text-slate-400 mt-2.5 line-clamp-2">
                {t.theme?.darkDesc || 'Deep slate & emerald contrast for low-light & OLED tablets'}
              </p>

              {/* Swatch Bar */}
              <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-700/50">
                <div className="w-4 h-4 rounded-full bg-[#020617] border border-slate-700" title="Background: #020617" />
                <div className="w-4 h-4 rounded-full bg-[#0f172a] border border-slate-700" title="Surface: #0f172a" />
                <div className="w-4 h-4 rounded-full bg-[#10b981] border border-emerald-400" title="Accent: #10b981" />
                <span className="text-[9px] text-slate-500 font-mono ml-auto">Night / OLED</span>
              </div>
            </button>

            {/* 2. Daylight Clean (Light Theme) */}
            <button
              type="button"
              id="theme-btn-light"
              onClick={() => onThemeChange('light')}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                theme === 'light'
                  ? 'border-emerald-500 bg-slate-800/90 ring-1 ring-emerald-500 shadow-md'
                  : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/70 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-amber-500 shadow-inner">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{t.theme?.light || 'Daylight Clean (Light)'}</span>
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                        Sun
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">
                      Direct Field Sunlight Visibility
                    </span>
                  </div>
                </div>
                {theme === 'light' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </div>

              <p className="text-[11px] text-slate-400 mt-2.5 line-clamp-2">
                {t.theme?.lightDesc || 'Crisp sunlight-optimized high legibility for direct field sun'}
              </p>

              {/* Swatch Bar */}
              <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-700/50">
                <div className="w-4 h-4 rounded-full bg-[#f8fafc] border border-slate-300" title="Background: #f8fafc" />
                <div className="w-4 h-4 rounded-full bg-[#ffffff] border border-slate-300" title="Surface: #ffffff" />
                <div className="w-4 h-4 rounded-full bg-[#059669] border border-emerald-600" title="Accent: #059669" />
                <span className="text-[9px] text-slate-500 font-mono ml-auto">High Contrast</span>
              </div>
            </button>

            {/* 3. Warm Earth (Medium Color Theme) */}
            <button
              type="button"
              id="theme-btn-medium"
              onClick={() => onThemeChange('medium')}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                theme === 'medium'
                  ? 'border-emerald-500 bg-slate-800/90 ring-1 ring-emerald-500 shadow-md'
                  : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/70 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#362f28] border border-[#554a40] flex items-center justify-center text-amber-500 shadow-inner">
                    <Sunrise className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{t.theme?.medium || 'Warm Earth (Medium)'}</span>
                      <span className="text-[9px] bg-amber-600/20 text-amber-400 px-1.5 py-0.2 rounded font-bold">
                        Medium
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">
                      Eye-Relaxing Sand & Soil Tone
                    </span>
                  </div>
                </div>
                {theme === 'medium' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </div>

              <p className="text-[11px] text-slate-400 mt-2.5 line-clamp-2">
                {t.theme?.mediumDesc || 'Soothing warm sand & amber neutral tone to reduce eye strain'}
              </p>

              {/* Swatch Bar */}
              <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-700/50">
                <div className="w-4 h-4 rounded-full bg-[#27221d] border border-[#554a40]" title="Background: #27221d" />
                <div className="w-4 h-4 rounded-full bg-[#362f28] border border-[#554a40]" title="Surface: #362f28" />
                <div className="w-4 h-4 rounded-full bg-[#f59e0b] border border-amber-500" title="Accent: #f59e0b" />
                <span className="text-[9px] text-slate-500 font-mono ml-auto">Warm Neutral</span>
              </div>
            </button>

            {/* 4. Forest Meadow (Deep Agro Theme) */}
            <button
              type="button"
              id="theme-btn-forest"
              onClick={() => onThemeChange('forest')}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                theme === 'forest'
                  ? 'border-emerald-500 bg-slate-800/90 ring-1 ring-emerald-500 shadow-md'
                  : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/70 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#132a1e] border border-[#244b36] flex items-center justify-center text-emerald-400 shadow-inner">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{t.theme?.forest || 'Forest Meadow (Deep Agro)'}</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">
                      Botanical Crop & Drone Mode
                    </span>
                  </div>
                </div>
                {theme === 'forest' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </div>

              <p className="text-[11px] text-slate-400 mt-2.5 line-clamp-2">
                {t.theme?.forestDesc || 'Rich botanical green & moss tone for agricultural robotics'}
              </p>

              {/* Swatch Bar */}
              <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-700/50">
                <div className="w-4 h-4 rounded-full bg-[#0b1a12] border border-[#244b36]" title="Background: #0b1a12" />
                <div className="w-4 h-4 rounded-full bg-[#132a1e] border border-[#244b36]" title="Surface: #132a1e" />
                <div className="w-4 h-4 rounded-full bg-[#34d399] border border-emerald-400" title="Accent: #34d399" />
                <span className="text-[9px] text-slate-500 font-mono ml-auto">Lush Agro</span>
              </div>
            </button>
          </div>
        </div>

        {/* Language Selection Card */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Select Application Language</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'en', label: 'English', sub: 'English' },
              { id: 'mr', label: 'मराठी (Marathi)', sub: 'Marathi' },
              { id: 'hi', label: 'हिंदी (Hindi)', sub: 'Hindi' },
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => onLanguageChange(lang.id as Language)}
                className={`p-3.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                  language === lang.id
                    ? 'bg-emerald-600/20 border-emerald-500 text-white font-bold'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-sm">{lang.label}</span>
                <span className="text-[10px] text-slate-400">{lang.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Robot Device Identification */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>4WD Field Robot Configuration</span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-slate-400">Assigned Robot Hardware ID</label>
            <input
              type="text"
              value={currentId}
              onChange={(e) => setCurrentId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2.5 font-mono focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-500">
              Matches the MAC/firmware ID broadcasted over ESP32 UDP beacons.
            </p>
          </div>
        </div>

        {/* PWA & Mobile Installation */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Progressive Web App (PWA) Offline Status</span>
            </div>
            <PWAInstallButton language={language} />
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            AGRI-SCAN BOT is installed as a native app shell on your home screen with service worker caching for full offline access in remote fields.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Settings updated successfully!</span>
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md"
          >
            Save Changes
          </button>
        </div>
      </form>

      {/* Hardware Architecture Specifications */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Cpu className="w-4 h-4 text-slate-500" />
          <span>AGRI-SCAN Hardware Technical Spec</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
          <div className="bg-slate-800/40 p-2.5 rounded-xl">
            <div className="text-[10px] text-slate-500">MCU Platform</div>
            <div className="font-semibold text-white mt-0.5">ESP32 240MHz</div>
          </div>
          <div className="bg-slate-800/40 p-2.5 rounded-xl">
            <div className="text-[10px] text-slate-500">Camera Optics</div>
            <div className="font-semibold text-white mt-0.5">OV2640 2MP CMOS</div>
          </div>
          <div className="bg-slate-800/40 p-2.5 rounded-xl">
            <div className="text-[10px] text-slate-500">Chassis Drive</div>
            <div className="font-semibold text-white mt-0.5">4WD Dual L298N</div>
          </div>
          <div className="bg-slate-800/40 p-2.5 rounded-xl">
            <div className="text-[10px] text-slate-500">AI Model</div>
            <div className="font-semibold text-white mt-0.5">Gemini 3.8 Flash</div>
          </div>
        </div>
      </div>
    </div>
  );
};
