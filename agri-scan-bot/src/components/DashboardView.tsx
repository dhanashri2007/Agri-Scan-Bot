import React from 'react';
import {
  ScanLine,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  CloudSun,
  Gamepad2,
  History,
  Sprout,
  Upload,
  Wifi,
  WifiOff,
  BatteryCharging,
  ArrowUpRight,
  ShieldAlert,
  Sun,
  Moon,
  Sunrise,
  Leaf,
  Palette,
} from 'lucide-react';
import {
  Language,
  OperatingState,
  ScanRecord,
  AlertRecord,
  WeatherData,
  User,
  AppTheme,
} from '../types';
import { translations } from '../translations';

interface DashboardViewProps {
  language: Language;
  isRobotConnected: boolean;
  operatingState: OperatingState;
  batteryPercentage: number | null;
  cameraStatus: string;
  motorStatus: string;
  lastSeenTime: string | null;
  robotId: string;
  scans: ScanRecord[];
  alerts: AlertRecord[];
  weather: WeatherData | null;
  weatherConnected: boolean;
  onNavigate: (view: any) => void;
  onSelectScan: (scan: ScanRecord) => void;
  onConnectRobotToggle: () => void;
  user?: User | null;
  onOpenAuth?: () => void;
  onOpenProfile?: () => void;
  theme?: AppTheme;
  onThemeChange?: (theme: AppTheme) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  language,
  isRobotConnected,
  operatingState,
  batteryPercentage,
  cameraStatus,
  motorStatus,
  lastSeenTime,
  robotId,
  scans,
  alerts,
  weather,
  weatherConnected,
  onNavigate,
  onSelectScan,
  onConnectRobotToggle,
  user,
  onOpenAuth,
  onOpenProfile,
  theme = 'dark',
  onThemeChange,
}) => {
  const t = translations[language];

  // Rapid theme cycle
  const cycleNextTheme = () => {
    if (!onThemeChange) return;
    const themeOrder: AppTheme[] = ['dark', 'light', 'medium', 'forest'];
    const currentIdx = themeOrder.indexOf((theme || 'dark') as AppTheme);
    const nextIdx = (currentIdx === -1 ? 0 : currentIdx + 1) % themeOrder.length;
    onThemeChange(themeOrder[nextIdx]);
  };

  // Compute real metrics from real database records (NO FAKE METRICS)
  const totalScans = scans.length;
  const healthyScans = scans.filter((s) => s.healthStatus === 'Healthy').length;
  const diseasedScans = scans.filter((s) => s.healthStatus === 'Diseased').length;
  const unreadAlerts = alerts.filter((a) => !a.isRead);
  const lastScan = scans[0] || null;

  return (
    <div className="space-y-5 pb-20 md:pb-8">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 p-4 sm:p-6 rounded-2xl border border-emerald-900/40 shadow-xl">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{t.dashboard.title}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live Field Node
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">{t.dashboard.subtitle}</p>
        </div>

        {/* Start Scan Primary Action */}
        <div className="flex items-center gap-3">
          <button
            id="dash-start-scan-btn"
            onClick={() => onNavigate('scan')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 hover:shadow-emerald-700/30 transition transform active:scale-95"
          >
            <ScanLine className="w-4 h-4" />
            <span>{t.dashboard.startScan}</span>
          </button>

          <button
            id="dash-robot-control-btn"
            onClick={() => onNavigate('control')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition"
          >
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <span>{t.nav.robotControl}</span>
          </button>

          {onThemeChange && (
            <button
              type="button"
              id="dash-theme-toggle-btn"
              onClick={cycleNextTheme}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              title="Click to cycle display theme: Dark ⇄ Light ⇄ Medium ⇄ Forest"
            >
              {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
              {theme === 'medium' && <Sunrise className="w-4 h-4 text-amber-600" />}
              {theme === 'forest' && <Leaf className="w-4 h-4 text-emerald-400" />}
              {theme === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
              <span className="hidden lg:inline capitalize font-medium">{theme}</span>
            </button>
          )}
        </div>
      </div>

      {/* Farmer Profile Context Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
            {user ? user.name.charAt(0).toUpperCase() : '🌾'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                {user ? user.name : 'Guest Farmer Session'}
              </span>
              {user?.primaryCrop && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  {user.primaryCrop} Plot
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {user?.location
                ? `Location: ${user.location} • Farm: ${user.farmName || 'Primary Plot'}`
                : 'Sign in to save scan history, manage farm plots, and sync alerts.'}
            </p>
          </div>
        </div>

        <div>
          {user ? (
            <button
              id="dash-manage-profile-btn"
              onClick={onOpenProfile}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              Manage Profile
            </button>
          ) : (
            <button
              id="dash-signin-register-btn"
              onClick={onOpenAuth}
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
            >
              Sign In / Register
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row: Total Scans, Healthy, Diseased, Active Alerts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Scans */}
        <div
          onClick={() => onNavigate('history')}
          className="bg-slate-900/80 hover:bg-slate-900 p-4 rounded-2xl border border-slate-800 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.dashboard.totalScans}</span>
            <ScanLine className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-white">{totalScans}</div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
            <span>{t.dashboard.lastScanTime}:</span>
            <span className="text-slate-300 font-medium">{lastScan ? new Date(lastScan.createdAt).toLocaleDateString() : t.common.notAvailable}</span>
          </div>
        </div>

        {/* Healthy Scans */}
        <div
          onClick={() => onNavigate('history')}
          className="bg-slate-900/80 hover:bg-slate-900 p-4 rounded-2xl border border-slate-800 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.dashboard.healthyScans}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-400">{healthyScans}</div>
          <div className="mt-1 text-[11px] text-emerald-500/80">
            {totalScans > 0 ? `${Math.round((healthyScans / totalScans) * 100)}% verified healthy` : t.common.waitingForData}
          </div>
        </div>

        {/* Diseased Scans */}
        <div
          onClick={() => onNavigate('history')}
          className="bg-slate-900/80 hover:bg-slate-900 p-4 rounded-2xl border border-slate-800 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.dashboard.diseasedScans}</span>
            <XCircle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-rose-400">{diseasedScans}</div>
          <div className="mt-1 text-[11px] text-rose-400/80">
            {diseasedScans > 0 ? 'Requires field scouting' : 'No diseases reported'}
          </div>
        </div>

        {/* Active Alerts */}
        <div
          onClick={() => onNavigate('alerts')}
          className="bg-slate-900/80 hover:bg-slate-900 p-4 rounded-2xl border border-slate-800 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.dashboard.recentAlerts}</span>
            <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-400">{unreadAlerts.length}</div>
          <div className="mt-1 text-[11px] text-amber-400/80">
            {unreadAlerts.length > 0 ? `${unreadAlerts.length} unread warnings` : 'All alerts acknowledged'}
          </div>
        </div>
      </div>

      {/* Main Grid: Robot Quick Status & Field Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Robot Quick Status Card (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-3 h-3 rounded-full ${
                  isRobotConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{t.dashboard.robotQuickStatus}</span>
                <span className="text-xs text-slate-400 font-mono">({robotId})</span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="dash-toggle-connect-btn"
                onClick={onConnectRobotToggle}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition ${
                  isRobotConnected
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-600/40 hover:bg-rose-900/60'
                    : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60'
                }`}
              >
                {isRobotConnected ? t.robot.disconnectRobotBtn : t.robot.connectRobotBtn}
              </button>

              <button
                onClick={() => onNavigate('health')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium p-1"
                title="View Subsystem Health"
              >
                <span>{t.common.viewDetails}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Subsystem Telemetry Badges (NO FAKE SENSOR VALUES) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {/* Connection Link */}
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                {isRobotConnected ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-rose-400" />}
                <span>Link State</span>
              </div>
              <div className="mt-1 font-bold text-sm text-white">
                {isRobotConnected ? t.common.online : t.common.offline}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {isRobotConnected ? 'ESP32 Wi-Fi Connected' : 'Waiting for connection'}
              </div>
            </div>

            {/* Battery Telemetry */}
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                <span>Battery Subsystem</span>
              </div>
              <div className="mt-1 font-bold text-sm text-white">
                {isRobotConnected && batteryPercentage !== null ? (
                  `${batteryPercentage}%`
                ) : (
                  <span className="text-amber-400/90 text-xs font-normal">{t.common.notAvailable}</span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {isRobotConnected && batteryPercentage !== null
                  ? 'Nominal 12V Li-Ion'
                  : 'Battery telemetry unavailable'}
              </div>
            </div>

            {/* Camera Status */}
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <ScanLine className="w-3.5 h-3.5 text-emerald-400" />
                <span>ESP32-CAM</span>
              </div>
              <div className="mt-1 font-bold text-sm text-white capitalize">
                {isRobotConnected ? cameraStatus : t.common.offline}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {isRobotConnected ? 'OV2640 Optics Ready' : 'Vision offline'}
              </div>
            </div>

            {/* 4WD Motor Controller */}
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>4WD Motors</span>
              </div>
              <div className="mt-1 font-bold text-sm text-white capitalize">
                {isRobotConnected ? motorStatus : t.common.offline}
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                {isRobotConnected ? 'L298N H-Bridge Armed' : 'Motors unpowered'}
              </div>
            </div>
          </div>

          {/* Bottom helper info */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/70">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {t.common.lastSeen}:{' '}
                <strong className="text-slate-200">
                  {lastSeenTime ? new Date(lastSeenTime).toLocaleTimeString() : t.common.notAvailable}
                </strong>
              </span>
            </span>

            <button
              onClick={() => onNavigate('control')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>Drive Robot</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Field Weather Widget (Real Open-Meteo or "Weather service not connected") */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CloudSun className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">{t.dashboard.weatherWidget}</h3>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Live Agro Met
              </span>
            </div>

            {weatherConnected && weather ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-black text-white">{weather.temperature}°C</div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    {weather.condition}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-medium">{weather.city}</div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-400">
                  <div className="bg-slate-800/50 p-2.5 rounded-xl">
                    <div className="text-[10px] text-slate-400">Relative Humidity</div>
                    <div className="font-bold text-slate-200 text-sm mt-0.5">{weather.humidity}%</div>
                  </div>
                  <div className="bg-slate-800/50 p-2.5 rounded-xl">
                    <div className="text-[10px] text-slate-400">Wind Speed</div>
                    <div className="font-bold text-slate-200 text-sm mt-0.5">{weather.windSpeed} km/h</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="my-6 text-center py-4 bg-slate-800/40 rounded-xl border border-slate-800">
                <CloudSun className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <div className="text-xs font-semibold text-amber-400">{t.common.serviceNotConnected}</div>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Agro-meteorological live stream offline. Reconnect network to view real field weather.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400">
            Source: Open-Meteo Precision Agriculture Forecast
          </div>
        </div>
      </div>

      {/* Quick Action Buttons Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          {t.dashboard.quickActions}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Action: Leaf Scan */}
          <button
            onClick={() => onNavigate('scan')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-emerald-500/30 text-emerald-300 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <ScanLine className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-center">{t.dashboard.startScan}</span>
          </button>

          {/* Action: Drive Robot */}
          <button
            onClick={() => onNavigate('control')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 text-slate-200 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-center">{t.nav.robotControl}</span>
          </button>

          {/* Action: Robot Health */}
          <button
            onClick={() => onNavigate('health')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 text-slate-200 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-center">{t.dashboard.checkHealth}</span>
          </button>

          {/* Action: Scan History */}
          <button
            onClick={() => onNavigate('history')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 text-slate-200 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600/20 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <History className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-center">{t.dashboard.viewHistory}</span>
          </button>

          {/* Action: Crop Monitoring */}
          <button
            onClick={() => onNavigate('crops')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 text-slate-200 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-center">{t.nav.crops}</span>
          </button>

          {/* Action: AI Assistant */}
          <button
            onClick={() => onNavigate('assistant')}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 text-slate-200 transition group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-center">{t.nav.assistant}</span>
          </button>
        </div>
      </div>

      {/* Bottom Split: Recent Scan & Recent Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Scan Card */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-emerald-400" />
              <span>Latest Leaf Diagnosis</span>
            </h3>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              View All Scans →
            </button>
          </div>

          {lastScan ? (
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <img
                src={lastScan.imagePath}
                alt="Latest leaf scan"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-slate-700 flex-shrink-0"
              />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      lastScan.healthStatus === 'Healthy'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {lastScan.healthStatus}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{lastScan.id}</span>
                </div>

                <div className="text-base font-bold text-white">{lastScan.crop}</div>
                <div className="text-xs text-slate-300 font-medium line-clamp-1">
                  {lastScan.disease}
                </div>
                <div className="text-[11px] text-slate-400">
                  {new Date(lastScan.createdAt).toLocaleString()} via{' '}
                  <span className="font-semibold text-slate-300">{lastScan.source}</span>
                </div>

                <button
                  onClick={() => onSelectScan(lastScan)}
                  className="mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                >
                  <span>{t.common.viewDetails}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              {t.common.insufficientData}
            </div>
          )}
        </div>

        {/* Recent Alert Card */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Field Disease Alert</span>
            </h3>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              View Alerts →
            </button>
          </div>

          {alerts.length > 0 ? (
            <div className="mt-4 space-y-3">
              {alerts.slice(0, 2).map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => onNavigate('alerts')}
                  className="bg-slate-800/60 hover:bg-slate-800 p-3.5 rounded-xl border border-slate-700/60 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white line-clamp-1">{alert.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        alert.type === 'Critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {alert.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">{alert.message}</p>
                  <div className="mt-2 text-[10px] text-slate-400">
                    {new Date(alert.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No active warnings. Field is operating normally.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
