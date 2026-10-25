import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Gamepad2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Square,
  AlertOctagon,
  Video,
  ExternalLink,
  RotateCw,
  Check,
  Globe,
  Sliders,
  Camera,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Lightbulb,
  Columns,
  Rows,
} from 'lucide-react';
import { Language, MovementState, ScanRecord } from '../types';
import { translations } from '../translations';
import {
  DEFAULT_ROBOT_URL,
  getStoredRobotUrl,
  saveRobotUrl,
  cleanRobotUrl,
  getRobotStreamUrl,
  getRobotCmdUrl,
  getRobotSpeedUrl,
  getRobotLightUrl,
  sendRobotCmd,
  sendRobotSpeed,
  sendRobotLight,
  checkRobotConnectionStatus,
  fetchRobotFrameBlob,
  blobToDataUrl,
  OFFLINE_ROBOT_MESSAGE,
} from '../utils/robot';

interface RobotControlViewProps {
  language: Language;
  isRobotConnected: boolean;
  robotId: string;
  currentMovementState: MovementState;
  onConnectRobot: () => void;
  onRefreshHealth: () => void;
  onConnectionStatusChange?: (isConnected: boolean) => void;
  onCaptureNavigateToScan?: (file: File, previewUrl: string) => void;
  onScanComplete?: (scan: ScanRecord) => void;
}

export const RobotControlView: React.FC<RobotControlViewProps> = ({
  language,
  isRobotConnected: initialRobotConnected,
  currentMovementState,
  onConnectionStatusChange,
  onCaptureNavigateToScan,
  onScanComplete,
}) => {
  const t = translations[language];

  // 1. Robot URL state persisted in localStorage (default http://192.168.137.100)
  const [robotUrl, setRobotUrl] = useState<string>(() => getStoredRobotUrl());
  const [inputUrl, setInputUrl] = useState<string>(() => getStoredRobotUrl());
  const [urlSavedNotification, setUrlSavedNotification] = useState<boolean>(false);

  // 2. Real Connection Status (Ping {url}/cmd?var=move&val=0 with 3s timeout)
  const [isConnected, setIsConnected] = useState<boolean>(initialRobotConnected);
  const [isCheckingConnection, setIsCheckingConnection] = useState<boolean>(false);
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<string>(new Date().toLocaleTimeString());

  // 3. Motor Speed Slider State (0-255)
  const [motorSpeed, setMotorSpeed] = useState<number>(200);
  const [isSendingSpeed, setIsSendingSpeed] = useState<boolean>(false);

  // 4. ESP32 Light / Flash / LED Control (Requirement 4)
  const [isLightOn, setIsLightOn] = useState<boolean>(false);
  const [lightBrightness, setLightBrightness] = useState<number>(255);
  const [isSendingLight, setIsSendingLight] = useState<boolean>(false);

  // 5. Dual View Layout State (Requirement 1: Simultaneous Live Feed + Robot Control View)
  const [isDualView, setIsDualView] = useState<boolean>(true);

  // 6. Directional Kinematics State
  const [activeCommand, setActiveCommand] = useState<MovementState>(currentMovementState);

  // 7. Live Stream & Capture State
  const [streamKey, setStreamKey] = useState<number>(Date.now());
  const [streamLoaded, setStreamLoaded] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<boolean>(false);
  const [isStreamPausedForCapture, setIsStreamPausedForCapture] = useState<boolean>(false);

  // Capture Under Live Video State
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [lastCapturedPreview, setLastCapturedPreview] = useState<string | null>(null);
  const [isAnalyzingCaptured, setIsAnalyzingCaptured] = useState<boolean>(false);

  // Terminal Logs
  const [commandLogs, setCommandLogs] = useState<Array<{ time: string; msg: string; success: boolean }>>([
    {
      time: new Date().toLocaleTimeString(),
      msg: `ESP32 Kinematics initialized for ${robotUrl}`,
      success: true,
    },
  ]);

  // Movement interval ref (200ms cadence while held)
  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activeValRef = useRef<number | null>(null);
  const isPressedRef = useRef<boolean>(false);

  const appendLog = useCallback((msg: string, success: boolean) => {
    setCommandLogs((prev) => [
      {
        time: new Date().toLocaleTimeString(),
        msg,
        success,
      },
      ...prev.slice(0, 25),
    ]);
  }, []);

  // Sync robot URL if changed in another tab or view
  useEffect(() => {
    const handleUrlChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const newUrl = customEvent.detail || getStoredRobotUrl();
      setRobotUrl(newUrl);
      setInputUrl(newUrl);
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'agriscan_robot_url' && e.newValue) {
        const cleaned = cleanRobotUrl(e.newValue);
        setRobotUrl(cleaned);
        setInputUrl(cleaned);
      }
    };

    window.addEventListener('agriscan-robot-url-changed', handleUrlChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('agriscan-robot-url-changed', handleUrlChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  /**
   * Ping {url}/cmd?var=move&val=0 with a 3 second timeout (AbortController).
   * Show "Connected" only if response is OK, otherwise "Disconnected" with OFFLINE_ROBOT_MESSAGE.
   * Re-check every 5 seconds.
   */
  const pingRobotConnection = useCallback(
    async (targetUrl: string, silent = false) => {
      if (!silent) setIsCheckingConnection(true);

      try {
        const result = await checkRobotConnectionStatus(targetUrl, 3000);
        setIsConnected(result.isOnline);
        setPingLatency(result.latencyMs ?? null);
        setLastCheckTime(new Date().toLocaleTimeString());

        if (result.isOnline) {
          setConnectionError(null);
          if (!silent) {
            appendLog(`PING SUCCESS: ${cleanRobotUrl(targetUrl)} responded in ${result.latencyMs}ms`, true);
          }
          if (onConnectionStatusChange) onConnectionStatusChange(true);
        } else {
          setConnectionError(OFFLINE_ROBOT_MESSAGE);
          if (!silent) {
            appendLog(`PING FAILED: ${OFFLINE_ROBOT_MESSAGE}`, false);
          }
          if (onConnectionStatusChange) onConnectionStatusChange(false);
        }
      } catch {
        setIsConnected(false);
        setConnectionError(OFFLINE_ROBOT_MESSAGE);
        if (onConnectionStatusChange) onConnectionStatusChange(false);
      } finally {
        if (!silent) setIsCheckingConnection(false);
      }
    },
    [appendLog, onConnectionStatusChange]
  );

  // Background ping interval every 5 seconds (Requirement 1)
  useEffect(() => {
    pingRobotConnection(robotUrl, true);
    const interval = setInterval(() => {
      pingRobotConnection(robotUrl, true);
    }, 5000);

    return () => clearInterval(interval);
  }, [robotUrl, pingRobotConnection]);

  // Save new URL to state & localStorage
  const handleSaveUrl = (newUrl: string) => {
    const cleaned = saveRobotUrl(newUrl);
    setRobotUrl(cleaned);
    setInputUrl(cleaned);
    setUrlSavedNotification(true);
    setTimeout(() => setUrlSavedNotification(false), 2000);
    appendLog(`Saved new Robot Endpoint URL: ${cleaned}`, true);
    pingRobotConnection(cleaned, false);
  };

  const handleResetDefaultUrl = () => {
    handleSaveUrl(DEFAULT_ROBOT_URL);
  };

  /**
   * Directional kinematic commands:
   * GET {url}/cmd?var=move&val=N (1=forward, 2=reverse, 3=left, 4=right, 0=stop)
   */
  const sendMoveHttp = useCallback(
    async (val: number, name: string) => {
      try {
        const result = await sendRobotCmd(robotUrl, val, 1800);
        if (result.success) {
          appendLog(`CMD OK: ${name} (val=${val})`, true);
        } else {
          appendLog(`CMD ERR: ${result.error || 'Failed to send move'}`, false);
        }
      } catch (err: any) {
        appendLog(`CMD FAIL: ${err?.message || 'Network error'}`, false);
      }
    },
    [robotUrl, appendLog]
  );

  /**
   * Speed slider:
   * GET {url}/cmd?var=speed&val=N (0-255)
   */
  const handleSpeedChange = async (newSpeed: number) => {
    setMotorSpeed(newSpeed);
    setIsSendingSpeed(true);
    try {
      const result = await sendRobotSpeed(robotUrl, newSpeed);
      if (result.success) {
        appendLog(`SPEED OK: set to ${newSpeed}/255`, true);
      } else {
        appendLog(`SPEED ERR: ${result.error || 'Failed to update speed'}`, false);
      }
    } catch (err: any) {
      appendLog(`SPEED FAIL: ${err?.message || 'Network error'}`, false);
    } finally {
      setIsSendingSpeed(false);
    }
  };

  /**
   * ESP32 Light / Flash / LED Control (Requirement 4)
   * GET {url}/cmd?var=light&val=N (1=ON / 255=Full, 0=OFF)
   */
  const handleToggleLight = async () => {
    const nextState = !isLightOn;
    setIsLightOn(nextState);
    setIsSendingLight(true);
    const valToSend = nextState ? lightBrightness : 0;
    try {
      appendLog(`Sending Light command: val=${valToSend}...`, true);
      const res = await sendRobotLight(robotUrl, valToSend);
      if (res.success) {
        appendLog(`ESP32 Light ${nextState ? 'ON' : 'OFF'} (val=${valToSend}) confirmed`, true);
      } else {
        appendLog(`LIGHT ERR: ${res.error || 'Failed to update light'}`, false);
      }
    } catch (err: any) {
      appendLog(`LIGHT FAIL: ${err?.message || 'Network error'}`, false);
    } finally {
      setIsSendingLight(false);
    }
  };

  const handleLightBrightnessChange = async (newBrightness: number) => {
    setLightBrightness(newBrightness);
    if (!isLightOn) return;
    try {
      await sendRobotLight(robotUrl, newBrightness);
    } catch {
      // ignore
    }
  };

  /**
   * Continuous press handling using Pointer Events (support both touch and mouse):
   * Call immediately on press, then every 200ms while held.
   * Send val=0 on release/leave/cancel.
   */
  const handlePressStart = (val: number, name: MovementState) => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }

    isPressedRef.current = true;
    activeValRef.current = val;
    setActiveCommand(name);

    // Call immediately on press
    sendMoveHttp(val, name);

    // Call GET {url}/cmd?var=move&val=N every 200 ms while held
    moveIntervalRef.current = setInterval(() => {
      if (isPressedRef.current && activeValRef.current === val) {
        sendMoveHttp(val, name);
      }
    }, 200);
  };

  const handlePressEnd = useCallback(() => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }

    if (isPressedRef.current || activeValRef.current !== null) {
      isPressedRef.current = false;
      activeValRef.current = null;
      setActiveCommand('Stop');
      // On release/leave/cancel send val=0
      sendMoveHttp(0, 'Stop (Release)');
    }
  }, [sendMoveHttp]);

  // Explicit Stop (val=0)
  const handleExplicitStop = () => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
    isPressedRef.current = false;
    activeValRef.current = null;
    setActiveCommand('Stop');
    sendMoveHttp(0, 'Stop');
  };

  // Emergency Stop (val=0)
  const handleEmergencyStop = () => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
    isPressedRef.current = false;
    activeValRef.current = null;
    setActiveCommand('Stop');
    sendMoveHttp(0, 'EMERGENCY STOP (val=0)');
    appendLog('EMERGENCY STOP: Robot halt command val=0 dispatched immediately!', false);
  };

  /**
   * Capture under the live video (Requirement 3):
   * 1. Disable button & show loading state
   * 2. Pause stream (<img src=""> blanked)
   * 3. Fetch {url}/capture?t=<Date.now()> with 10s timeout
   * 4. Check blob starts with image/
   * 5. Convert to File "robot-capture.jpg" (type image/jpeg)
   * 6. Restore stream src
   * 7. Trigger analysis or navigate to scan page
   * 8. On failure show clear error & Retry button
   */
  const handleCaptureSnapshot = async () => {
    if (isCapturing) return;

    setIsCapturing(true);
    setCaptureError(null);
    appendLog(`Triggering snapshot from ${cleanRobotUrl(robotUrl)}/capture...`, true);

    // 1. ESP32 single-client lock: blank out live stream src before fetching frame
    setIsStreamPausedForCapture(true);

    const now = Date.now();
    try {
      // 2. Fetch {url}/capture?t=<timestamp> with 10s timeout
      const blob = await fetchRobotFrameBlob(robotUrl, now, 10000);

      // 3. Verify blob.type starts with image/
      if (!blob.type.startsWith('image/') && blob.size < 500) {
        throw new Error('Received non-image response from ESP32 camera.');
      }

      // 4. Convert blob to File named "robot-capture.jpg" (type image/jpeg)
      const robotCaptureFile = new File([blob], 'robot-capture.jpg', {
        type: 'image/jpeg',
        lastModified: now,
      });

      // 5. Convert blob to preview data URL
      const previewDataUrl = await blobToDataUrl(blob);
      setLastCapturedPreview(previewDataUrl);
      appendLog(`Frame capture success: ${Math.round(blob.size / 1024)} KB image received`, true);

      // 6. Restore live stream
      setIsStreamPausedForCapture(false);

      // If navigation callback provided, navigate to Leaf Scan with the File
      if (onCaptureNavigateToScan) {
        onCaptureNavigateToScan(robotCaptureFile, previewDataUrl);
      } else {
        // Direct in-place analysis
        setIsAnalyzingCaptured(true);
        const formData = new FormData();
        formData.append('image', robotCaptureFile, 'robot-capture.jpg');
        formData.append('crop', 'Auto-Detect');
        formData.append('source', 'Robot Camera');
        formData.append('language', language);

        const resp = await fetch('/api/scans/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await resp.json();
        if (resp.ok && data.success && onScanComplete) {
          onScanComplete(data.scan);
        }
      }
    } catch (err: any) {
      const msg = err?.message || OFFLINE_ROBOT_MESSAGE;
      setCaptureError(msg);
      appendLog(`CAPTURE ERROR: ${msg}`, false);
    } finally {
      setIsCapturing(false);
      setIsAnalyzingCaptured(false);
      // Always restore stream src after capture finishes
      setIsStreamPausedForCapture(false);
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.repeat) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handlePressStart(1, 'Forward');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handlePressStart(2, 'Reverse');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handlePressStart(3, 'Left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handlePressStart(4, 'Right');
      } else if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        handleEmergencyStop();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd', 'W', 'S', 'A', 'D'].includes(e.key)) {
        e.preventDefault();
        handlePressEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handlePressEnd]);

  const streamUrl = isStreamPausedForCapture ? '' : getRobotStreamUrl(robotUrl);

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-20 md:pb-8">
      {/* 1. Header & View Layout Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-emerald-400" />
            <span>{t.robot.controlTitle}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {language === 'mr'
              ? 'थेट ESP32 रोबोट नियंत्रण व रिअल-टाइम कॅमेरा लाइव्ह फीड.'
              : language === 'hi'
              ? 'प्रत्यक्ष ESP32 रोबोट नियंत्रण एवं रियल-टाइम कैमरा लाइव स्ट्रीम।'
              : 'Direct kinematic HTTP drive, light control & live ESP32-CAM stream pipeline.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Dual View Toggle (Requirement 1: View Both Live Stream & Controls Together) */}
          <button
            onClick={() => setIsDualView((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            title="Toggle Side-by-Side Dual View"
          >
            {isDualView ? <Columns className="w-3.5 h-3.5 text-emerald-400" /> : <Rows className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">{isDualView ? t.robot.dualView : t.robot.stackedView}</span>
            <span className="sm:hidden">{isDualView ? 'Dual' : 'Stack'}</span>
          </button>

          {/* Quick Ping Button */}
          <button
            onClick={() => pingRobotConnection(robotUrl)}
            disabled={isCheckingConnection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition disabled:opacity-50"
            title="Ping robot endpoint /cmd?var=move&val=0 (3s timeout)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingConnection ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isCheckingConnection ? t.common.connecting : 'Ping'}</span>
          </button>
        </div>
      </div>

      {/* 2. Shared Robot Base URL & Connection Status (Requirement 1) */}
      <div className="bg-slate-900/95 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label
            htmlFor="robot-url-input"
            className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Robot IP / Base URL</span>
          </label>
          <span className="text-[11px] text-slate-400">
            Shared URL in localStorage: <code className="text-emerald-400 font-mono">agriscan_robot_url</code>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <input
              id="robot-url-input"
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveUrl(inputUrl);
              }}
              placeholder={DEFAULT_ROBOT_URL}
              className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono text-emerald-300 focus:outline-none transition"
            />
            {urlSavedNotification && (
              <span className="absolute right-3 top-2 text-[11px] text-emerald-400 flex items-center gap-1 font-bold animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSaveUrl(inputUrl)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t.common.save}</span>
            </button>

            <button
              onClick={handleResetDefaultUrl}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              title={`Reset to default ${DEFAULT_ROBOT_URL}`}
            >
              Default
            </button>
          </div>
        </div>

        {/* Real Status Badge & Ping Metrics */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Status:</span>
            {isCheckingConnection ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold text-[11px]">
                <RotateCw className="w-3 h-3 animate-spin" />
                <span>Pinging {cleanRobotUrl(robotUrl)}...</span>
              </span>
            ) : isConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Connected {pingLatency !== null ? `(${pingLatency} ms)` : ''}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Disconnected</span>
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-3">
            <span>{t.robot.recheck5s}</span>
            <span className="text-slate-500">Checked: {lastCheckTime}</span>
          </div>
        </div>

        {/* Disconnection Warning Message */}
        {(!isConnected || connectionError) && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold">{OFFLINE_ROBOT_MESSAGE}</div>
              <div className="text-[11px] text-rose-300/80 font-mono">
                Ping Target: {getRobotCmdUrl(robotUrl, 0)} (3000ms timeout)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. DUAL-VIEW SECTION (Requirement 1: View Both Live Video Stream & Robot Controls Together) */}
      <div className={`grid gap-5 items-start ${isDualView ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* LEFT COLUMN: Live Camera Feed + Snapshot Capture + Hardware Controls (Light & Speed) */}
        <div className={`${isDualView ? 'lg:col-span-6 xl:col-span-7' : 'w-full'} space-y-4`}>
          
          {/* Live Video Stream Card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Live ESP32-CAM Feed
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  Live
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setStreamKey(Date.now());
                    setStreamLoaded(false);
                    setStreamError(false);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition"
                  title="Reload live video stream"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Reload</span>
                </button>
                <a
                  href={getRobotStreamUrl(robotUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
                  title="Open stream in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Video Canvas / Stream Area */}
            <div className="relative aspect-video max-h-[380px] bg-black flex items-center justify-center overflow-hidden">
              {streamUrl ? (
                <img
                  key={streamKey}
                  src={streamUrl}
                  alt="ESP32-CAM Live Video Stream"
                  className={`w-full h-full object-contain transition-opacity duration-300 ${
                    streamLoaded && !streamError ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => {
                    setStreamLoaded(true);
                    setStreamError(false);
                  }}
                  onError={() => {
                    setStreamLoaded(false);
                    setStreamError(true);
                  }}
                />
              ) : null}

              {/* Fallback message & stream pause indicator */}
              {(isStreamPausedForCapture || !streamLoaded || streamError || !streamUrl) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-950/95 space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700">
                    {isCapturing ? (
                      <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                    ) : (
                      <Video className="w-6 h-6 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      {isCapturing
                        ? 'Capturing snapshot frame from ESP32...'
                        : streamError
                        ? t.robot.streamError
                        : t.robot.streamWaiting}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                      Feed endpoint: <code className="text-emerald-400 font-mono">{getRobotStreamUrl(robotUrl)}</code>
                    </p>
                  </div>

                  {!isCapturing && (
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setStreamKey(Date.now());
                          setStreamError(false);
                        }}
                        className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition flex items-center gap-1.5"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Retry Stream</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Stream Overlay HUD */}
              <div className="absolute top-2 left-2 flex items-center gap-2 pointer-events-none">
                <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-emerald-300 border border-emerald-500/20">
                  {getRobotStreamUrl(robotUrl)}
                </span>
              </div>

              <div className="absolute bottom-2 right-2 pointer-events-none">
                <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-slate-700/50">
                  STATE: {activeCommand.toUpperCase()} | PWM: {motorSpeed} {isLightOn ? '| LIGHT: ON' : ''}
                </span>
              </div>
            </div>

            {/* Small "Capture" button directly under the live video (Requirement 3) */}
            <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>High-resolution ESP32-CAM frame capture</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  id="btn-under-video-capture"
                  onClick={handleCaptureSnapshot}
                  disabled={isCapturing}
                  className="flex-1 sm:flex-none px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950/50 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCapturing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>{t.robot.capturing}</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5" />
                      <span>{t.robot.captureBtn}</span>
                    </>
                  )}
                </button>

                {lastCapturedPreview && (
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Ready
                  </span>
                )}
              </div>
            </div>

            {/* Capture Error & Retry Banner */}
            {captureError && (
              <div className="p-2.5 bg-rose-950/60 border-t border-rose-800/50 text-rose-200 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{captureError}</span>
                </div>
                <button
                  onClick={handleCaptureSnapshot}
                  className="px-2.5 py-0.5 bg-rose-800 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition"
                >
                  {t.common.retry}
                </button>
              </div>
            )}
          </div>

          {/* HARDWARE CONTROLS: Light Control + Speed Slider side-by-side or stacked */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 4a. ESP32 Light / Flash / LED Control (Requirement 4) */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className={`w-4 h-4 ${isLightOn ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-400'}`} />
                  <span>{t.robot.lightLabel}</span>
                </label>
                {isSendingLight && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />}
              </div>

              {/* Light Toggle Switch */}
              <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-xs font-semibold">
                  <span className={isLightOn ? 'text-amber-300 font-bold' : 'text-slate-400'}>
                    {isLightOn ? t.robot.lightOn : t.robot.lightOff}
                  </span>
                </div>

                <button
                  onClick={handleToggleLight}
                  disabled={isSendingLight}
                  className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition flex items-center gap-1.5 shadow ${
                    isLightOn
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <Lightbulb className={`w-3.5 h-3.5 ${isLightOn ? 'fill-slate-950' : ''}`} />
                  <span>{isLightOn ? 'Turn OFF' : 'Turn ON'}</span>
                </button>
              </div>

              {/* Light Brightness Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>{t.robot.lightBrightness}</span>
                  <span className="text-amber-300 font-bold">{Math.round((lightBrightness / 255) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  step="5"
                  value={lightBrightness}
                  onChange={(e) => handleLightBrightnessChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>

            {/* 4b. Motor Speed Slider (0-255) calls {url}/cmd?var=speed&val=N (Requirement 2) */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="robot-speed-slider"
                  className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>{t.robot.speedLabel}</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    {motorSpeed} / 255 ({Math.round((motorSpeed / 255) * 100)}%)
                  </span>
                  {isSendingSpeed && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />}
                </div>
              </div>

              <div className="space-y-1 pt-3">
                <input
                  id="robot-speed-slider"
                  type="range"
                  min="0"
                  max="255"
                  step="5"
                  value={motorSpeed}
                  onChange={(e) => handleSpeedChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0 (Halt)</span>
                  <span>128 (Half)</span>
                  <span>255 (Full)</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: 4WD Kinematic D-Pad Controller + Emergency Stop + Terminal Log */}
        <div className={`${isDualView ? 'lg:col-span-6 xl:col-span-5' : 'w-full'} space-y-4`}>
          
          {/* 4WD Kinematics D-Pad (Positioned right alongside the stream!) */}
          <div className="bg-slate-900/95 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col items-center justify-center space-y-5 select-none">
            <div className="text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center justify-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-emerald-400" />
                <span>4WD Kinematic Drive Controller</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {language === 'mr'
                  ? 'दाबून ठेवा (होल्ड करा): दर २०० ms ने कमांड जाईल. सोडताच रोबोट थांबेल.'
                  : language === 'hi'
                  ? 'दबाकर रखें: हर 200 ms पर कमांड जाएगा। छोड़ते ही रोबोट रुकेगा।'
                  : 'Press & hold buttons (mouse or touch) to send pulses every 200ms.'}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                Active State: <strong>{activeCommand.toUpperCase()}</strong>
              </div>
            </div>

            {/* 3x3 D-Pad Layout using Pointer Events */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-60 sm:w-68">
              {/* Row 1: Empty, Forward, Empty */}
              <div />
              <button
                id="btn-move-forward"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handlePressStart(1, 'Forward');
                }}
                onPointerUp={handlePressEnd}
                onPointerLeave={handlePressEnd}
                onPointerCancel={handlePressEnd}
                className={`h-16 sm:h-20 rounded-2xl flex flex-col items-center justify-center font-bold text-xs border transition active:scale-95 shadow-md touch-none ${
                  activeCommand === 'Forward'
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-900/50 scale-95'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <ArrowUp className="w-6 h-6 sm:w-7 sm:h-7 mb-0.5" />
                <span className="text-[11px]">{t.common.forward}</span>
              </button>
              <div />

              {/* Row 2: Left, Stop, Right */}
              <button
                id="btn-move-left"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handlePressStart(3, 'Left');
                }}
                onPointerUp={handlePressEnd}
                onPointerLeave={handlePressEnd}
                onPointerCancel={handlePressEnd}
                className={`h-16 sm:h-20 rounded-2xl flex flex-col items-center justify-center font-bold text-xs border transition active:scale-95 shadow-md touch-none ${
                  activeCommand === 'Left'
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-900/50 scale-95'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7 mb-0.5" />
                <span className="text-[11px]">{t.common.left}</span>
              </button>

              <button
                id="btn-move-stop"
                onClick={handleExplicitStop}
                className={`h-16 sm:h-20 rounded-2xl flex flex-col items-center justify-center font-bold text-xs border transition active:scale-95 shadow-md ${
                  activeCommand === 'Stop'
                    ? 'bg-amber-600 text-white border-amber-500 shadow-amber-950/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                }`}
              >
                <Square className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5" />
                <span className="text-[11px]">{t.common.stop}</span>
              </button>

              <button
                id="btn-move-right"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handlePressStart(4, 'Right');
                }}
                onPointerUp={handlePressEnd}
                onPointerLeave={handlePressEnd}
                onPointerCancel={handlePressEnd}
                className={`h-16 sm:h-20 rounded-2xl flex flex-col items-center justify-center font-bold text-xs border transition active:scale-95 shadow-md touch-none ${
                  activeCommand === 'Right'
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-900/50 scale-95'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 mb-0.5" />
                <span className="text-[11px]">{t.common.right}</span>
              </button>

              {/* Row 3: Empty, Reverse, Empty */}
              <div />
              <button
                id="btn-move-reverse"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handlePressStart(2, 'Reverse');
                }}
                onPointerUp={handlePressEnd}
                onPointerLeave={handlePressEnd}
                onPointerCancel={handlePressEnd}
                className={`h-16 sm:h-20 rounded-2xl flex flex-col items-center justify-center font-bold text-xs border transition active:scale-95 shadow-md touch-none ${
                  activeCommand === 'Reverse'
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-900/50 scale-95'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <ArrowDown className="w-6 h-6 sm:w-7 sm:h-7 mb-0.5" />
                <span className="text-[11px]">{t.common.reverse}</span>
              </button>
              <div />
            </div>

            {/* Big Emergency Stop Button (Sends val=0) */}
            <div className="w-full pt-1">
              <button
                id="btn-emergency-stop"
                onClick={handleEmergencyStop}
                className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-rose-950/60 border-2 border-rose-400 hover:scale-[1.01] active:scale-95 transition flex items-center justify-center gap-2"
              >
                <AlertOctagon className="w-5 h-5 animate-pulse" />
                <span>{t.common.emergencyStop} (val=0)</span>
              </button>
            </div>
          </div>

          {/* Terminal Communication Log */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-[11px]">Command & Telemetry Log</span>
              </div>
              <span className="text-[10px] text-slate-500">200 ms / GET</span>
            </div>

            <div className="space-y-1 max-h-36 overflow-y-auto pr-1 text-[11px]">
              {commandLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-1.5 ${log.success ? 'text-emerald-300' : 'text-rose-400'}`}
                >
                  <span className="text-slate-500 flex-shrink-0">[{log.time}]</span>
                  <span className="break-all">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
