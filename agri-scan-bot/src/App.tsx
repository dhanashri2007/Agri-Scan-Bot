import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { ScanView } from './components/ScanView';
import { ResultModal } from './components/ResultModal';
import { RobotControlView } from './components/RobotControlView';
import { RobotHealthView } from './components/RobotHealthView';
import { ScanHistoryView } from './components/ScanHistoryView';
import { AlertsView } from './components/AlertsView';
import { CropMonitoringView } from './components/CropMonitoringView';
import { FarmManagementView } from './components/FarmManagementView';
import { AIAssistantView } from './components/AIAssistantView';
import { GovernmentSchemesView } from './components/GovernmentSchemesView';
import { HelpView } from './components/HelpView';
import { SettingsView } from './components/SettingsView';
import { OnboardingModal } from './components/OnboardingModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';

import {
  Language,
  OperatingState,
  MovementState,
  ScanRecord,
  AlertRecord,
  FarmRecord,
  RobotHealthReport,
  WeatherData,
  User,
  AppTheme,
} from './types';

export default function App() {
  // Application Language State
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('agri_scan_lang');
    return (saved as Language) || 'en';
  });

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('agri_scan_lang', lang);
  };

  // Application Theme State (4 modes: dark, light, medium, forest)
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('agri_scan_theme');
    if (saved === 'light' || saved === 'medium' || saved === 'forest' || saved === 'dark') {
      return saved;
    }
    return 'dark';
  });

  const handleThemeChange = (newTheme: AppTheme) => {
    setTheme(newTheme);
    localStorage.setItem('agri_scan_theme', newTheme);
  };

  // Apply active theme class to document root element
  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  // Farmer User Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('agri_auth_token') || null;
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals State
  const [selectedScanForModal, setSelectedScanForModal] = useState<ScanRecord | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [initialCaptureFile, setInitialCaptureFile] = useState<File | null>(null);
  const [initialPreviewUrl, setInitialPreviewUrl] = useState<string | null>(null);

  // Robot State
  const [isRobotConnected, setIsRobotConnected] = useState<boolean>(true);
  const [operatingState, setOperatingState] = useState<OperatingState>('STANDBY');
  const [currentMovementState, setCurrentMovementState] = useState<MovementState>('Stop');
  const [batteryPercentage, setBatteryPercentage] = useState<number | null>(84);
  const [cameraStatus, setCameraStatus] = useState<string>('ready');
  const [motorStatus, setMotorStatus] = useState<string>('armed');
  const [lastSeenTime, setLastSeenTime] = useState<string | null>(new Date().toISOString());
  const [robotId, setRobotId] = useState<string>('ASB-ROBOT-001');

  // Data Collections from Backend
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [farms, setFarms] = useState<FarmRecord[]>([]);
  const [healthReport, setHealthReport] = useState<RobotHealthReport | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherConnected, setWeatherConnected] = useState<boolean>(false);

  // Data Fetching Functions
  const fetchScans = useCallback(async () => {
    try {
      const res = await fetch('/api/scans');
      const data = await res.json();
      if (Array.isArray(data)) {
        setScans(data);
      } else if (data && Array.isArray(data.scans)) {
        setScans(data.scans);
      }
    } catch (err) {
      console.error('Failed to load scans:', err);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      if (Array.isArray(data)) {
        setAlerts(data);
      } else if (data && Array.isArray(data.alerts)) {
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.error('Failed to load alerts:', err);
    }
  }, []);

  const fetchFarms = useCallback(async () => {
    try {
      const res = await fetch('/api/farms');
      const data = await res.json();
      if (Array.isArray(data)) {
        setFarms(data);
      } else if (data && Array.isArray(data.farms)) {
        setFarms(data.farms);
      }
    } catch (err) {
      console.error('Failed to load farms:', err);
    }
  }, []);

  const fetchRobotHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/robot/health');
      const data = await res.json();
      const report: RobotHealthReport | null = data.health || (data.robotId && data.overallStatus ? data : null);
      if (report) {
        setHealthReport(report);
        const isConn = report.overallStatus !== 'OFFLINE';
        setIsRobotConnected(isConn);
        setOperatingState(report.overallStatus);
        setLastSeenTime(report.lastHeartbeat || report.lastCommunication);
        setRobotId(report.robotId);
      }
    } catch (err) {
      console.error('Failed to load robot health:', err);
    }
  }, []);

  const fetchWeather = useCallback(async () => {
    try {
      const res = await fetch('/api/weather');
      const data = await res.json();
      if (data.weather) {
        setWeather(data.weather);
        setWeatherConnected(data.weather.isConnected !== false);
      } else if (data && (data.connected || data.temperature !== undefined)) {
        setWeather({
          city: data.city || 'Nashik Agro-Climatic Zone',
          temperature: data.temperature ?? 24,
          condition: data.condition || 'Clear Sky',
          humidity: data.humidity ?? 65,
          windSpeed: data.windSpeed ?? 10,
          source: data.source || 'Open-Meteo Live API',
          timestamp: data.timestamp || new Date().toISOString(),
          isConnected: data.connected !== false,
        });
        setWeatherConnected(data.connected !== false);
      } else {
        setWeatherConnected(false);
      }
    } catch (err) {
      console.error('Weather stream unavailable:', err);
      setWeatherConnected(false);
    }
  }, []);

  // Initial Data Load & Periodic Polling
  useEffect(() => {
    fetchScans();
    fetchAlerts();
    fetchFarms();
    fetchRobotHealth();
    fetchWeather();

    // Check if first-time visitor to open onboarding guide
    const hasSeenGuide = localStorage.getItem('agri_scan_guide_seen');
    if (!hasSeenGuide) {
      setShowOnboarding(true);
      localStorage.setItem('agri_scan_guide_seen', 'true');
    }

    // Interval polling for robot telemetry and alerts
    const timer = setInterval(() => {
      fetchRobotHealth();
      fetchAlerts();
    }, 6000);

    return () => clearInterval(timer);
  }, [fetchScans, fetchAlerts, fetchFarms, fetchRobotHealth, fetchWeather]);

  // Auth Initialization on Mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('agri_auth_token');
      if (savedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          const data = await res.json();
          if ((data.authenticated || data.success) && data.user) {
            setUser(data.user);
            return;
          }
        } catch (e) {
          console.warn('Auth token verification error:', e);
        }
      }

      // Default to demo farmer (Ramesh Patil) so all screens are immediately rich & functional
      try {
        const res = await fetch('/api/auth/demo', { method: 'POST' });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setAuthToken(data.token);
          localStorage.setItem('agri_auth_token', data.token);
        }
      } catch (e) {
        console.warn('Failed to auto-init demo user:', e);
      }
    };

    initAuth();
  }, []);

  const handleLoginSuccess = (loggedInUser: User, token: string) => {
    setUser(loggedInUser);
    setAuthToken(token);
    localStorage.setItem('agri_auth_token', token);
    if (loggedInUser.language && loggedInUser.language !== language) {
      handleLanguageChange(loggedInUser.language as Language);
    }
    // Refresh scans, farms, alerts for this user
    fetchScans();
    fetchFarms();
    fetchAlerts();
  };

  const handleLogout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('agri_auth_token');
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setUser(updatedUser);
    if (updatedUser.language && updatedUser.language !== language) {
      handleLanguageChange(updatedUser.language as Language);
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  // Connect / Disconnect Toggle
  const handleConnectRobotToggle = async () => {
    try {
      if (isRobotConnected) {
        await fetch('/api/robot/disconnect', { method: 'POST' });
      } else {
        await fetch('/api/robot/connect', { method: 'POST' });
      }
      await fetchRobotHealth();
    } catch (err) {
      console.error('Failed to toggle robot state:', err);
    }
  };

  // Heartbeat ping simulation
  const handleSimulateHeartbeat = async () => {
    try {
      await fetch('/api/robot/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batteryPercentage: 84 }),
      });
      await fetchRobotHealth();
    } catch (err) {
      console.error('Failed to send heartbeat:', err);
    }
  };

  // Handlers for Farms
  const handleAddFarm = async (newFarm: Omit<FarmRecord, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFarm),
      });
      const data = await res.json();
      const createdFarm = data.farm || (data.id ? data : null);
      if (createdFarm) {
        setFarms((prev) => [createdFarm, ...prev]);
      }
    } catch (err) {
      console.error('Failed to create farm:', err);
    }
  };

  const handleDeleteFarm = async (farmId: string) => {
    try {
      await fetch(`/api/farms/${farmId}`, { method: 'DELETE' });
      setFarms((prev) => prev.filter((f) => f.id !== farmId));
    } catch (err) {
      console.error('Failed to delete farm:', err);
    }
  };

  // Handlers for Scans
  const handleScanCompleted = (newScan: ScanRecord) => {
    setScans((prev) => [newScan, ...prev]);
    setSelectedScanForModal(newScan);
    fetchAlerts();
    fetchRobotHealth();
  };

  const handleDeleteScan = async (scanId: string) => {
    try {
      await fetch(`/api/scans/${scanId}`, { method: 'DELETE' });
      setScans((prev) => prev.filter((s) => s.id !== scanId));
      fetchAlerts();
    } catch (err) {
      console.error('Failed to delete scan:', err);
    }
  };

  // Handlers for Alerts
  const handleMarkAlertRead = async (alertId: string) => {
    try {
      await fetch(`/api/alerts/${alertId}/read`, { method: 'PATCH' });
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
      );
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  };

  const handleClearAlert = async (alertId: string) => {
    try {
      await fetch(`/api/alerts/${alertId}`, { method: 'DELETE' });
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      console.error('Failed to clear alert:', err);
    }
  };

  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div className={`min-h-screen theme-${theme} theme-transition bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white`}>
      {/* Offline Connectivity Banner */}
      <OfflineIndicator language={language} />

      {/* Main App Header */}
      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onThemeChange={handleThemeChange}
        isRobotConnected={isRobotConnected}
        operatingState={operatingState}
        onOpenOnboarding={() => setShowOnboarding(true)}
        onNavigate={(tab) => setActiveTab(tab as ActiveTab)}
        user={user}
        onOpenAuth={() => handleOpenAuth('login')}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Responsive Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        language={language}
        unreadAlertsCount={unreadAlertsCount}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            language={language}
            isRobotConnected={isRobotConnected}
            operatingState={operatingState}
            batteryPercentage={batteryPercentage}
            cameraStatus={cameraStatus}
            motorStatus={motorStatus}
            lastSeenTime={lastSeenTime}
            robotId={robotId}
            scans={scans}
            alerts={alerts}
            weather={weather}
            weatherConnected={weatherConnected}
            onNavigate={setActiveTab}
            onSelectScan={(scan) => setSelectedScanForModal(scan)}
            onConnectRobotToggle={handleConnectRobotToggle}
            user={user}
            onOpenAuth={() => handleOpenAuth('login')}
            onOpenProfile={() => setShowProfileModal(true)}
            theme={theme}
            onThemeChange={handleThemeChange}
          />
        )}

        {activeTab === 'scan' && (
          <ScanView
            language={language}
            isRobotConnected={isRobotConnected}
            robotId={robotId}
            onScanComplete={(scan) => {
              handleScanCompleted(scan);
              setSelectedScanForModal(scan);
            }}
            initialRobotCaptureFile={initialCaptureFile}
            initialRobotPreviewUrl={initialPreviewUrl}
          />
        )}

        {activeTab === 'control' && (
          <RobotControlView
            language={language}
            isRobotConnected={isRobotConnected}
            robotId={robotId}
            currentMovementState={currentMovementState}
            onConnectRobot={handleConnectRobotToggle}
            onRefreshHealth={fetchRobotHealth}
            onConnectionStatusChange={setIsRobotConnected}
            onCaptureNavigateToScan={(file, previewUrl) => {
              setInitialCaptureFile(file);
              setInitialPreviewUrl(previewUrl);
              setActiveTab('scan');
            }}
            onScanComplete={(scan) => {
              handleScanCompleted(scan);
              setSelectedScanForModal(scan);
            }}
          />
        )}

        {activeTab === 'health' && (
          <RobotHealthView
            language={language}
            healthReport={healthReport}
            isRobotConnected={isRobotConnected}
            onRefresh={fetchRobotHealth}
            onConnectToggle={handleConnectRobotToggle}
            onSimulateHeartbeat={handleSimulateHeartbeat}
          />
        )}

        {activeTab === 'history' && (
          <ScanHistoryView
            language={language}
            scans={scans}
            onSelectScan={(scan) => setSelectedScanForModal(scan)}
            onDeleteScan={handleDeleteScan}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsView
            language={language}
            alerts={alerts}
            onMarkRead={handleMarkAlertRead}
            onClearAlert={handleClearAlert}
            onNavigateToScan={(scanId) => {
              const target = scans.find((s) => s.id === scanId);
              if (target) setSelectedScanForModal(target);
            }}
          />
        )}

        {activeTab === 'crops' && (
          <CropMonitoringView
            language={language}
            scans={scans}
            onSelectScan={(scan) => setSelectedScanForModal(scan)}
            onNavigateToScan={() => setActiveTab('scan')}
          />
        )}

        {activeTab === 'farm' && (
          <FarmManagementView
            language={language}
            farms={farms}
            onAddFarm={handleAddFarm}
            onDeleteFarm={handleDeleteFarm}
          />
        )}

        {activeTab === 'assistant' && (
          <AIAssistantView
            language={language}
            latestScan={selectedScanForModal || scans[0] || null}
          />
        )}

        {activeTab === 'schemes' && (
          <GovernmentSchemesView language={language} />
        )}

        {activeTab === 'help' && (
          <HelpView language={language} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            language={language}
            onLanguageChange={handleLanguageChange}
            theme={theme}
            onThemeChange={handleThemeChange}
            robotId={robotId}
            onUpdateRobotId={setRobotId}
            user={user}
            onOpenAuth={() => handleOpenAuth('login')}
            onOpenProfile={() => setShowProfileModal(true)}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Result Inspection Modal */}
      <ResultModal
        scan={selectedScanForModal}
        onClose={() => setSelectedScanForModal(null)}
        language={language}
        onOpenChatWithScan={(scan) => {
          setSelectedScanForModal(null);
          setActiveTab('assistant');
        }}
      />

      {/* Farmer Onboarding Quick-Start Guide Modal */}
      {showOnboarding && (
        <OnboardingModal
          language={language}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      {/* Farmer Login & Registration Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        language={language}
        onLanguageChange={handleLanguageChange}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authModalMode}
      />

      {/* Farmer User Profile & Account Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        language={language}
        onLanguageChange={handleLanguageChange}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
        onOpenAuth={() => handleOpenAuth('login')}
      />
    </div>
  );
}
