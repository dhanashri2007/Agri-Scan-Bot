import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ScanLine,
  Bot,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Sparkles,
  Wifi,
  WifiOff,
  Globe,
  Radio,
  ExternalLink,
  RotateCw,
  Video,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Info,
  RefreshCw,
} from 'lucide-react';
import { Language, ScanRecord } from '../types';
import {
  translations,
  getCropDisplayName,
  getDiseaseDisplayName,
} from '../translations';
import {
  DEFAULT_ROBOT_URL,
  getStoredRobotUrl,
  saveRobotUrl,
  cleanRobotUrl,
  getRobotCaptureUrl,
  getRobotStreamUrl,
  checkRobotConnectionStatus,
  fetchRobotFrameBlob,
  blobToDataUrl,
  OFFLINE_ROBOT_MESSAGE,
} from '../utils/robot';

interface ScanViewProps {
  language: Language;
  isRobotConnected: boolean;
  robotId: string;
  onScanComplete: (scan: ScanRecord) => void;
  initialRobotCaptureFile?: File | null;
  initialRobotPreviewUrl?: string | null;
}

export const ScanView: React.FC<ScanViewProps> = ({
  language,
  isRobotConnected: initialRobotConnected,
  robotId,
  onScanComplete,
  initialRobotCaptureFile,
  initialRobotPreviewUrl,
}) => {
  const t = translations[language];

  // 1. Shared Robot URL stored in localStorage (default http://192.168.137.100)
  const [robotUrl, setRobotUrl] = useState<string>(() => getStoredRobotUrl());
  const [urlInput, setUrlInput] = useState<string>(() => getStoredRobotUrl());
  const [isEditingUrl, setIsEditingUrl] = useState<boolean>(false);
  const [urlSavedNotice, setUrlSavedNotice] = useState<boolean>(false);

  // Connection & Ping State (ping {url}/cmd?var=move&val=0 with 3s timeout)
  const [isRobotOnline, setIsRobotOnline] = useState<boolean>(initialRobotConnected);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  // Farm plot and report language state (Auto-detect replaces manual crop selection)
  const [selectedFarm, setSelectedFarm] = useState<string>('farm-01');
  const [reportLanguage, setReportLanguage] = useState<Language>(language);

  // Preview & active file
  const [imagePreview, setImagePreview] = useState<string | null>(initialRobotPreviewUrl || null);
  const [imageFile, setImageFile] = useState<File | null>(initialRobotCaptureFile || null);
  const [scanSourceLabel, setScanSourceLabel] = useState<'Robot Camera' | 'Manual Upload'>(
    initialRobotCaptureFile ? 'Robot Camera' : 'Manual Upload'
  );

  // Progress state
  const [scanProgressStage, setScanProgressStage] = useState<
    'idle' | 'capturing' | 'uploading' | 'analyzing' | 'ready'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state displayed in card
  const [lastScanResult, setLastScanResult] = useState<ScanRecord | null>(null);
  const [isTranslatingResult, setIsTranslatingResult] = useState<boolean>(false);

  // Live video preview toggle
  const [showLiveStreamPreview, setShowLiveStreamPreview] = useState<boolean>(false);
  const [isStreamPausedForCapture, setIsStreamPausedForCapture] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync robot URL with custom events & localStorage
  useEffect(() => {
    const handleUrlChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const newUrl = customEvent.detail || getStoredRobotUrl();
      setRobotUrl(newUrl);
      setUrlInput(newUrl);
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'agriscan_robot_url' && e.newValue) {
        const cleaned = cleanRobotUrl(e.newValue);
        setRobotUrl(cleaned);
        setUrlInput(cleaned);
      }
    };

    window.addEventListener('agriscan-robot-url-changed', handleUrlChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('agriscan-robot-url-changed', handleUrlChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Ping robot connection every 5s with 3s timeout
  const testRobotPing = useCallback(
    async (targetUrl: string = robotUrl, silent = false) => {
      if (!silent) setIsPinging(true);
      try {
        const res = await checkRobotConnectionStatus(targetUrl, 3000);
        setIsRobotOnline(res.isOnline);
        setPingLatency(res.latencyMs ?? null);
      } catch {
        setIsRobotOnline(false);
      } finally {
        if (!silent) setIsPinging(false);
      }
    },
    [robotUrl]
  );

  useEffect(() => {
    testRobotPing(robotUrl, true);
    const interval = setInterval(() => {
      testRobotPing(robotUrl, true);
    }, 5000);
    return () => clearInterval(interval);
  }, [robotUrl, testRobotPing]);

  const handleSaveRobotUrl = () => {
    const cleaned = saveRobotUrl(urlInput);
    setRobotUrl(cleaned);
    setUrlInput(cleaned);
    setUrlSavedNotice(true);
    setIsEditingUrl(false);
    setTimeout(() => setUrlSavedNotice(false), 2000);
    testRobotPing(cleaned);
  };

  /**
   * Re-run translation of existing scan result when language changes (Requirement 4)
   * "When the user changes the language, show the existing result translated:
   * re-run the analysis text translation (or re-request the text in the new language)
   * so the result is displayed in the new language without needing a new photo."
  // Sync report language with global language selection
  useEffect(() => {
    setReportLanguage(language);
  }, [language]);

  /**
   * Re-run translation of existing scan result when language changes (Requirement 4 & 3)
   * "When the user changes the language, show the existing result translated:
   * re-run the analysis text translation (or re-request the text in the new language)
   * so the result is displayed in the new language without needing a new photo."
   */
  const translateScanToLanguage = useCallback(
    async (targetLang: Language) => {
      if (!lastScanResult) return;
      setIsTranslatingResult(true);
      try {
        const resp = await fetch('/api/ai/translate-scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scan: lastScanResult,
            targetLanguage: targetLang,
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          if (data.success) {
            setLastScanResult((prev) =>
              prev
                ? {
                    ...prev,
                    crop: data.crop || prev.crop,
                    disease: data.disease || prev.disease,
                    symptoms: data.symptoms || prev.symptoms,
                    aiExplanation: data.aiExplanation || prev.aiExplanation,
                    recommendedAction: data.recommendedAction || prev.recommendedAction,
                  }
                : null
            );
          }
        }
      } catch (err) {
        console.warn('Failed to translate existing result:', err);
      } finally {
        setIsTranslatingResult(false);
      }
    },
    [lastScanResult]
  );

  useEffect(() => {
    if (lastScanResult) {
      translateScanToLanguage(language);
    }
  }, [language, translateScanToLanguage]);

  const handleSwitchReportLanguage = (targetLang: Language) => {
    setReportLanguage(targetLang);
    translateScanToLanguage(targetLang);
  };

  /**
   * EXACT SAME ANALYSIS FUNCTION:
   * Analyzes a leaf File (converted from robot blob or from manual upload),
   * sets the image preview, manages the loading state, and calls the autonomous AI vision pipeline.
   * Directly identifies whichever crop is in the photo without forcing or assuming Tomato.
   */
  const analyzeLeaf = async (
    file: File,
    previewUrl: string,
    sourceLabel: 'Robot Camera' | 'Manual Upload'
  ) => {
    setErrorMessage(null);
    setImagePreview(previewUrl);
    setImageFile(file);
    setScanSourceLabel(sourceLabel);
    setScanProgressStage('uploading');

    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      setScanProgressStage('analyzing');

      // Use FormData to pass File object, crop: 'Auto-Detect', and reportLanguage
      const formData = new FormData();
      formData.append('image', file, file.name);
      formData.append('crop', 'Auto-Detect');
      formData.append('farmId', selectedFarm);
      formData.append('source', sourceLabel);
      formData.append('language', reportLanguage);

      const resp = await fetch('/api/scans/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Leaf image analysis failed');
      }

      setScanProgressStage('ready');
      setLastScanResult(data.scan);

      setTimeout(() => {
        setScanProgressStage('idle');
        onScanComplete(data.scan);
      }, 500);
    } catch (err: any) {
      setScanProgressStage('idle');
      setErrorMessage(err?.message || 'Failed to complete leaf analysis. Please try again.');
    }
  };

  /**
   * CAPTURE FROM ROBOT:
   * Requirement 3:
   * 1. Taken ONLY when button is clicked
   * 2. Disable button & show loading state
   * 3. If live stream is open, set stream img src to empty before fetch
   * 4. Fetch {url}/capture?t=<Date.now()> with 10s timeout
   * 5. Read as blob, check blob.type starts with "image/"
   * 6. Convert to File named "robot-capture.jpg" (type image/jpeg)
   * 7. Restore stream src after capture finishes (success or failure)
   * 8. Show preview of captured photo & pass File to exact same analysis function
   * 9. Set scan source to "Robot Camera"
   * 10. On failure show clear error message and Retry button
   */
  const handleCaptureFromRobot = async () => {
    if (scanProgressStage !== 'idle') return;
    setErrorMessage(null);
    setScanProgressStage('capturing');

    // Blank out stream if open so ESP32 single-core web server can serve /capture
    setIsStreamPausedForCapture(true);

    const now = Date.now();
    try {
      // Fetch with 10s timeout
      const blob = await fetchRobotFrameBlob(robotUrl, now, 10000);

      // Verify blob starts with image/
      if (!blob.type.startsWith('image/') && blob.size < 500) {
        throw new Error('Received non-image data from robot camera.');
      }

      // Convert to File named "robot-capture.jpg" (type image/jpeg)
      const robotFile = new File([blob], 'robot-capture.jpg', {
        type: 'image/jpeg',
        lastModified: now,
      });

      // Show preview
      const previewDataUrl = await blobToDataUrl(blob);
      setImagePreview(previewDataUrl);
      setImageFile(robotFile);
      setScanSourceLabel('Robot Camera');
      setIsRobotOnline(true);

      // Restore stream
      setIsStreamPausedForCapture(false);

      // Pass into exact same analysis function
      await analyzeLeaf(robotFile, previewDataUrl, 'Robot Camera');
    } catch (err: any) {
      setScanProgressStage('idle');
      const msg = err?.message || OFFLINE_ROBOT_MESSAGE;
      setErrorMessage(msg);
      setIsRobotOnline(false);
    } finally {
      // Always restore stream src
      setIsStreamPausedForCapture(false);
    }
  };

  /**
   * Manual photo upload file change handler
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(t.scan.invalidImageWarning);
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await analyzeLeaf(file, dataUrl, 'Manual Upload');
    };
    reader.readAsDataURL(file);
  };

  const isAnalyzing =
    scanProgressStage === 'capturing' ||
    scanProgressStage === 'uploading' ||
    scanProgressStage === 'analyzing' ||
    scanProgressStage === 'ready';

  const liveStreamUrl = isStreamPausedForCapture ? '' : getRobotStreamUrl(robotUrl);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* 1. Header & Shared Robot IP Bar */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-emerald-400" />
              <span>{t.scan.title}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Direct ESP32-CAM Robot Capture or High-Resolution Field Upload
            </p>
          </div>

          {/* Connection Status Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => testRobotPing(robotUrl)}
              disabled={isPinging}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                isRobotOnline
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-600/40 text-rose-300'
              }`}
              title="Ping robot connection status"
            >
              {isPinging ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              ) : isRobotOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span>{isRobotOnline ? t.common.connected : t.common.disconnected}</span>
              {pingLatency !== null && isRobotOnline && (
                <span className="text-[10px] opacity-75 font-mono">({pingLatency}ms)</span>
              )}
            </button>
          </div>
        </div>

        {/* Shared Robot URL Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Robot Target:</span>
            {isEditingUrl ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded px-2 py-0.5 text-xs font-mono text-emerald-300"
                  placeholder={DEFAULT_ROBOT_URL}
                />
                <button
                  onClick={handleSaveRobotUrl}
                  className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingUrl(false)}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <span className="font-mono text-emerald-300 font-semibold">{robotUrl}</span>
            )}
            {urlSavedNotice && (
              <span className="text-[11px] text-emerald-400 font-bold">Saved!</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isEditingUrl && (
              <button
                onClick={() => setIsEditingUrl(true)}
                className="text-[11px] text-slate-400 hover:text-emerald-400 underline transition"
              >
                Change URL
              </button>
            )}
            <button
              onClick={() => setShowLiveStreamPreview((prev) => !prev)}
              className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
            >
              <Video className="w-3 h-3 text-emerald-400" />
              <span>{showLiveStreamPreview ? 'Hide Live Feed' : 'Show Live Feed'}</span>
            </button>
          </div>
        </div>

        {/* Live Stream Foldable Panel */}
        {showLiveStreamPreview && (
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Live Camera Feed ({robotUrl}:81/stream)
              </span>
              <span className="text-[10px] text-slate-500">Auto-pauses during frame capture</span>
            </div>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
              {liveStreamUrl && !streamError ? (
                <img
                  src={liveStreamUrl}
                  alt="Robot Optical Stream"
                  className="w-full h-full object-contain"
                  onError={() => setStreamError(true)}
                />
              ) : (
                <div className="text-center p-4 text-xs text-slate-400 space-y-1">
                  <p>{t.robot.streamError}</p>
                  <button
                    onClick={() => setStreamError(false)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px]"
                  >
                    Retry Stream
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Disconnection Warning Message (Requirement 1) */}
        {!isRobotOnline && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{OFFLINE_ROBOT_MESSAGE}</span>
          </div>
        )}
      </div>

      {/* 2. Autonomous Plant Recognition (Replaces manual crop selector) */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 p-4 sm:p-5 rounded-2xl border border-emerald-500/40 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>{t.scan.autoDetectCrop}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                  Auto-Detect
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'mr'
                  ? 'कोणत्याही पिकाचे पान स्कॅन करा — AI पानाचे आकारमान, शिरा व लक्षणांवरून झाडाची जात आणि रोग थेट ओळखेल.'
                  : language === 'hi'
                  ? 'किसी भी पौधे की पत्ती स्कैन करें — AI पत्ती के आकार व शिराओं से पौधे की किस्म और रोग को अपने आप पहचानेगा।'
                  : 'Scan any crop leaf — the AI vision model autonomously identifies the plant species and botanical pathology directly from leaf morphology.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PRIMARY ACQUISITION ACTIONS: Clearly Visible "Capture from Robot" NEXT TO Manual Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option A: CAPTURE FROM ROBOT (Requirement 3: Clearly visible button next to manual upload) */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 p-5 rounded-3xl border-2 border-emerald-500/50 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Bot className="w-3 h-3" />
                <span>Primary Robot Method</span>
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">Port 80/81</span>
            </div>

            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              <span>{t.scan.captureFromRobotBtn}</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Fetches high-resolution snapshot directly from ESP32-CAM (<code className="text-emerald-300 font-mono text-[11px]">{getRobotCaptureUrl(robotUrl)}</code>). Auto-pauses stream to prevent web server contention.
            </p>
          </div>

          <div className="pt-2">
            <button
              id="btn-capture-from-robot"
              onClick={handleCaptureFromRobot}
              disabled={isAnalyzing}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm tracking-wide shadow-xl shadow-emerald-950/60 border border-emerald-400/40 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {scanProgressStage === 'capturing' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Capturing from ESP32...</span>
                </>
              ) : isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>{t.scan.captureFromRobotBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Option B: MANUAL UPLOAD / TAKE PHOTO */}
        <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Manual Option</span>
              </span>
              <span className="text-xs text-slate-400">JPG, PNG, WebP</span>
            </div>

            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" />
              <span>Manual Photo Upload</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload a clear leaf photograph directly from your smartphone camera or gallery. Uses the exact same AI pathology pipeline.
            </p>
          </div>

          {/* Hidden inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className="flex-1 py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Upload className="w-4 h-4 text-blue-400" />
              <span>{t.scan.uploadBtn}</span>
            </button>

            <button
              onClick={() => cameraInputRef.current?.click()}
              disabled={isAnalyzing}
              className="flex-1 py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>{t.scan.takePhotoBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Error Message Banner with Retry Button (Requirement 3: Never crash the page) */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Error Processing Leaf</div>
              <p className="text-rose-300 text-xs mt-0.5">{errorMessage}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCaptureFromRobot}
              className="px-3.5 py-1.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t.common.retry}</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Live Analysis Loading State & Photo Preview */}
      {isAnalyzing && (
        <div className="bg-slate-900 rounded-3xl border border-emerald-500/40 p-6 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <div>
              <h4 className="text-sm font-bold text-white">
                {scanProgressStage === 'capturing'
                  ? 'Capturing snapshot frame from robot camera...'
                  : scanProgressStage === 'uploading'
                  ? 'Pre-processing foliage spectrum...'
                  : scanProgressStage === 'analyzing'
                  ? `Analyzing leaf disease in ${translations[language].appName} (${language === 'mr' ? 'मराठी' : language === 'hi' ? 'हिंदी' : 'English'})...`
                  : 'Finalizing diagnosis report...'}
              </h4>
              <p className="text-xs text-slate-400">
                Calibrating lesions against botanical pathology model
              </p>
            </div>
          </div>

          {/* Captured photo preview while analyzing */}
          {imagePreview && (
            <div className="relative aspect-video max-h-56 bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <img src={imagePreview} alt="Capturing preview" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-emerald-950/20 pointer-events-none flex items-center justify-center">
                <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Source: {scanSourceLabel}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Completed Scan Result Card (Requirement 4: Displayed in selected language) */}
      {lastScanResult && !isAnalyzing && (
        <div className="bg-slate-900 rounded-3xl border border-emerald-500/40 p-6 shadow-2xl space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  lastScanResult.healthStatus === 'Healthy'
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-600/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {lastScanResult.healthStatus === 'Healthy' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <AlertCircle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{t.result.assessmentTitle}</span>
                  {isTranslatingResult && (
                    <span className="text-[10px] text-amber-400 font-normal animate-pulse">
                      (Translating to {language === 'mr' ? 'मराठी' : language === 'hi' ? 'हिंदी' : 'English'}...)
                    </span>
                  )}
                </h3>
                <span className="text-xs text-slate-400 font-mono">{lastScanResult.id}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Requirement 4 & User Request 3: AI Analysis Report in 3 Languages (English, Marathi, Hindi) */}
              <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-700/80 text-xs shadow-inner">
                <Globe className="w-3.5 h-3.5 text-emerald-400 ml-1.5 mr-0.5" />
                {[
                  { id: 'en', label: 'English' },
                  { id: 'mr', label: 'मराठी' },
                  { id: 'hi', label: 'हिंदी' },
                ].map((langItem) => (
                  <button
                    key={langItem.id}
                    onClick={() => handleSwitchReportLanguage(langItem.id as Language)}
                    disabled={isTranslatingResult}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      reportLanguage === langItem.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>{langItem.label}</span>
                  </button>
                ))}
              </div>

              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5">
                {lastScanResult.source === 'Robot Camera' ? (
                  <>
                    <Bot className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Robot Camera</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span>Manual Upload</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Bilingual Crop & Condition Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative rounded-2xl overflow-hidden bg-black max-h-56 border border-slate-800 flex items-center justify-center">
              <img
                src={lastScanResult.imagePath}
                alt="Analyzed leaf"
                className="w-full h-full object-contain"
              />
              <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-black/80 text-white backdrop-blur-md border border-white/10">
                Source: {lastScanResult.source}
              </span>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {translations[reportLanguage].result.cropName}
                </span>
                <div className="text-lg font-black text-white">
                  {getCropDisplayName(lastScanResult.crop, reportLanguage)}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {translations[reportLanguage].result.diseaseDetected}
                </span>
                <div className="text-base font-bold text-emerald-300 mt-0.5">
                  {getDiseaseDisplayName(lastScanResult.disease, reportLanguage)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    lastScanResult.healthStatus === 'Healthy'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {lastScanResult.healthStatus}
                </span>
                {lastScanResult.severity && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-semibold">
                    Severity: {lastScanResult.severity}
                  </span>
                )}
                {lastScanResult.confidence && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
                    {Math.round(lastScanResult.confidence * 100)}% Conf
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Symptoms in Selected Language */}
          {lastScanResult.symptoms && lastScanResult.symptoms.length > 0 && (
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {translations[reportLanguage].result.symptomsObserved}
              </span>
              <ul className="space-y-1.5 text-xs text-slate-200 list-disc list-inside">
                {lastScanResult.symptoms.map((sym, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {sym}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Botanical Assessment in Selected Language */}
          {lastScanResult.aiExplanation && (
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {translations[reportLanguage].result.explanation}
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lastScanResult.aiExplanation}
              </p>
            </div>
          )}

          {/* Recommended Action in Selected Language */}
          {lastScanResult.recommendedAction && (
            <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-600/50 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>{translations[reportLanguage].result.recommendedAction}</span>
              </span>
              <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                {lastScanResult.recommendedAction}
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => onScanComplete(lastScanResult)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
            >
              <span>{t.common.viewDetails}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
