import React from 'react';
import {
  LayoutDashboard,
  ScanLine,
  Gamepad2,
  Activity,
  History,
  Bell,
  Sprout,
  MapPin,
  Bot,
  Building2,
  HelpCircle,
  Settings,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

export type ActiveTab =
  | 'dashboard'
  | 'scan'
  | 'control'
  | 'health'
  | 'history'
  | 'alerts'
  | 'crops'
  | 'farm'
  | 'assistant'
  | 'schemes'
  | 'help'
  | 'settings';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  language: Language;
  unreadAlertsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  language,
  unreadAlertsCount = 0,
}) => {
  const t = translations[language];

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'scan', label: t.nav.scan, icon: ScanLine, highlight: true },
    { id: 'control', label: t.nav.robotControl, icon: Gamepad2 },
    { id: 'health', label: t.nav.robotHealth, icon: Activity },
    { id: 'history', label: t.nav.history, icon: History },
    { id: 'alerts', label: t.nav.alerts, icon: Bell, badge: unreadAlertsCount },
    { id: 'crops', label: t.nav.crops, icon: Sprout },
    { id: 'farm', label: t.nav.farm, icon: MapPin },
    { id: 'assistant', label: t.nav.assistant, icon: Bot },
    { id: 'schemes', label: t.nav.schemes, icon: Building2 },
    { id: 'help', label: t.nav.help, icon: HelpCircle },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <>
      {/* Desktop / Tablet Navigation Bar (Top sub-nav) */}
      <nav className="hidden md:block bg-slate-900 border-b border-slate-800 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => onSelectTab(item.id as ActiveTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/40'
                    : item.highlight
                    ? 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/40 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (Floating clean dock) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 py-1.5 px-2">
        <div className="grid grid-cols-5 items-center justify-around gap-1">
          {/* Dashboard */}
          <button
            id="mobile-nav-dashboard"
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-medium transition ${
              activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="truncate max-w-[60px]">{t.nav.dashboard}</span>
          </button>

          {/* Robot Control */}
          <button
            id="mobile-nav-control"
            onClick={() => onSelectTab('control')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-medium transition ${
              activeTab === 'control' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Gamepad2 className="w-5 h-5 mb-0.5" />
            <span className="truncate max-w-[60px]">{t.nav.robotControl}</span>
          </button>

          {/* Center Scan Button (Big Touch Target) */}
          <button
            id="mobile-nav-scan"
            onClick={() => onSelectTab('scan')}
            className="flex flex-col items-center justify-center -mt-5"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60 active:scale-95 border-2 border-slate-900">
              <ScanLine className="w-6 h-6 animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 mt-0.5">{t.nav.scan}</span>
          </button>

          {/* History */}
          <button
            id="mobile-nav-history"
            onClick={() => onSelectTab('history')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-medium transition ${
              activeTab === 'history' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <History className="w-5 h-5 mb-0.5" />
            <span className="truncate max-w-[60px]">{t.nav.history}</span>
          </button>

          {/* More Menu / Health */}
          <button
            id="mobile-nav-health"
            onClick={() => onSelectTab('health')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-medium transition ${
              activeTab === 'health' || activeTab === 'settings' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Activity className="w-5 h-5 mb-0.5" />
            <span className="truncate max-w-[60px]">{t.nav.robotHealth}</span>
          </button>
        </div>
      </div>
    </>
  );
};
