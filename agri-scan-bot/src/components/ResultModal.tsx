import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Calendar,
  Bot,
  Upload,
  ShieldCheck,
  Printer,
  Info,
  Loader2,
  Globe,
} from 'lucide-react';
import { Language, ScanRecord } from '../types';
import {
  translations,
  getCropDisplayName,
  getDiseaseDisplayName,
} from '../translations';

interface ResultModalProps {
  scan: ScanRecord | null;
  onClose: () => void;
  language: Language;
  onOpenChatWithScan?: (scan: ScanRecord) => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  scan: initialScan,
  onClose,
  language,
  onOpenChatWithScan,
}) => {
  if (!initialScan) return null;

  const [currentScan, setCurrentScan] = useState<ScanRecord>(initialScan);
  const [modalLang, setModalLang] = useState<Language>(language);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  const t = translations[modalLang];

  useEffect(() => {
    setCurrentScan(initialScan);
  }, [initialScan]);

  useEffect(() => {
    setModalLang(language);
  }, [language]);

  const translateScanToLang = async (targetLang: Language) => {
    if (!initialScan) return;
    setIsTranslating(true);
    try {
      const resp = await fetch('/api/ai/translate-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan: initialScan,
          targetLanguage: targetLang,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          setCurrentScan((prev) => ({
            ...prev,
            crop: data.crop || prev.crop,
            disease: data.disease || prev.disease,
            symptoms: data.symptoms || prev.symptoms,
            aiExplanation: data.aiExplanation || prev.aiExplanation,
            recommendedAction: data.recommendedAction || prev.recommendedAction,
          }));
        }
      }
    } catch (err) {
      console.warn('Failed to translate scan modal:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwitchLanguage = (newLang: Language) => {
    setModalLang(newLang);
    translateScanToLang(newLang);
  };

  // Translate existing scan when language changes
  useEffect(() => {
    if (initialScan) {
      translateScanToLang(language);
    }
  }, [language, initialScan]);

  const isHealthy = currentScan.healthStatus === 'Healthy';
  const isDiseased = currentScan.healthStatus === 'Diseased';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-10 gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isHealthy
                  ? 'bg-emerald-600/20 text-emerald-400'
                  : isDiseased
                  ? 'bg-rose-600/20 text-rose-400'
                  : 'bg-amber-600/20 text-amber-400'
              }`}
            >
              {isHealthy ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : isDiseased ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <HelpCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>{t.result.assessmentTitle}</span>
                {isTranslating && (
                  <span className="text-[10px] text-amber-400 font-normal flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Translating to {modalLang === 'mr' ? 'मराठी' : modalLang === 'hi' ? 'हिंदी' : 'English'}...</span>
                  </span>
                )}
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">{currentScan.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Requirement 4 & User Request 3: 3-Language Switcher */}
            <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-700/80 text-xs shadow-inner">
              <Globe className="w-3 h-3 text-emerald-400 ml-1 mr-0.5" />
              {[
                { id: 'en', label: 'EN' },
                { id: 'mr', label: 'मराठी' },
                { id: 'hi', label: 'हिंदी' },
              ].map((langItem) => (
                <button
                  key={langItem.id}
                  onClick={() => handleSwitchLanguage(langItem.id as Language)}
                  disabled={isTranslating}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition ${
                    modalLang === langItem.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{langItem.label}</span>
                </button>
              ))}
            </div>

            <button
              id="close-result-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          {/* Decision Support Disclaimer */}
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs">
            <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px] sm:text-xs">{t.result.disclaimer}</p>
          </div>

          {/* Leaf Photograph + Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Image Box */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-black max-h-60 flex items-center justify-center">
              <img
                src={currentScan.imagePath}
                alt="Analyzed leaf specimen"
                className="w-full h-full object-cover max-h-60"
              />
              <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/75 text-white backdrop-blur-sm border border-white/10 flex items-center gap-1">
                {currentScan.source === 'ROBOT' || currentScan.source === 'Robot Camera' ? (
                  <>
                    <Bot className="w-3 h-3 text-emerald-400" />
                    <span>Robot Camera</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3 h-3 text-blue-400" />
                    <span>Manual Photo</span>
                  </>
                )}
              </span>
            </div>

            {/* Core Classification Card */}
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 flex flex-col justify-between space-y-3">
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {t.result.cropName}
                </div>
                <div className="text-lg font-black text-white">
                  {getCropDisplayName(currentScan.crop, modalLang)}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {t.result.healthStatus}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isHealthy
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isDiseased
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {currentScan.healthStatus}
                  </span>
                  {currentScan.severity && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-200">
                      Severity: {currentScan.severity}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {t.result.diseaseDetected}
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {getDiseaseDisplayName(currentScan.disease, modalLang)}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/50 text-[11px]">
                <div>
                  <span className="text-slate-400">Confidence:</span>{' '}
                  <span className="font-bold text-slate-200">
                    {currentScan.confidence !== null && currentScan.confidence !== undefined
                      ? `${Math.round(currentScan.confidence * 100)}%`
                      : t.common.notAvailable}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400">Lesion Area:</span>{' '}
                  <span className="font-bold text-slate-200">
                    {currentScan.affectedAreaPercentage !== null && currentScan.affectedAreaPercentage !== undefined
                      ? `${currentScan.affectedAreaPercentage}%`
                      : t.common.notAvailable}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Visible Symptoms Observed */}
          {currentScan.symptoms && currentScan.symptoms.length > 0 && (
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60 space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {t.result.symptomsObserved}
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {currentScan.symptoms.map((sym, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {sym}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Botanical AI Explanation */}
          {currentScan.aiExplanation && (
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60 space-y-1.5">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {t.result.explanation}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{currentScan.aiExplanation}</p>
            </div>
          )}

          {/* Recommended Next Inspection Step */}
          {currentScan.recommendedAction && (
            <div className="bg-emerald-950/30 p-4 rounded-2xl border border-emerald-600/40 space-y-1.5">
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t.result.recommendedAction}</span>
              </div>
              <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                {currentScan.recommendedAction}
              </p>
            </div>
          )}

          {/* Metadata Footer: Date, Robot ID, Origin */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-slate-800/50 text-[11px] text-slate-400">
            <div>
              <span>Timestamp:</span>
              <div className="font-semibold text-slate-200">
                {new Date(currentScan.createdAt).toLocaleString()}
              </div>
            </div>

            <div>
              <span>Scan Source:</span>
              <div className="font-semibold text-slate-200">
                {currentScan.source === 'ROBOT' || currentScan.source === 'Robot Camera'
                  ? 'Robot Camera'
                  : 'Manual Upload'}
              </div>
            </div>

            <div>
              <span>Farm Plot:</span>
              <div className="font-semibold text-slate-200">
                {currentScan.farmId ? 'Plot A (Assigned)' : 'Unassigned'}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-900/90 sticky bottom-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onOpenChatWithScan && (
              <button
                onClick={() => onOpenChatWithScan(currentScan)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-semibold transition"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Ask Kisan AI</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md"
            >
              {t.common.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
