import React, { useState } from 'react';
import {
  X,
  Power,
  Wifi,
  Gamepad2,
  Camera,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface OnboardingModalProps {
  language: Language;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ language, onClose }) => {
  const t = translations[language];
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      stepNum: 1,
      title: t.onboarding.step1Title,
      desc: t.onboarding.step1Desc,
      icon: Power,
      badge: 'Hardware Power',
    },
    {
      stepNum: 2,
      title: t.onboarding.step2Title,
      desc: t.onboarding.step2Desc,
      icon: Wifi,
      badge: 'Local Wi-Fi Bus',
    },
    {
      stepNum: 3,
      title: t.onboarding.step3Title,
      desc: t.onboarding.step3Desc,
      icon: Gamepad2,
      badge: '4WD Chassis',
    },
    {
      stepNum: 4,
      title: t.onboarding.step4Title,
      desc: t.onboarding.step4Desc,
      icon: Camera,
      badge: 'ESP32-CAM',
    },
    {
      stepNum: 5,
      title: t.onboarding.step5Title,
      desc: t.onboarding.step5Desc,
      icon: Sparkles,
      badge: 'Neural Network',
    },
    {
      stepNum: 6,
      title: t.onboarding.step6Title,
      desc: t.onboarding.step6Desc,
      icon: CheckCircle2,
      badge: 'Decision Support',
    },
  ];

  const current = steps[currentStep];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Farmer Quick-Start Guide
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              Step {current.stepNum} of {steps.length}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Visual Card */}
        <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60 flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Icon className="w-8 h-8" />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            {current.badge}
          </span>

          <h4 className="text-base font-bold text-white">{current.title}</h4>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xs">{current.desc}</p>
        </div>

        {/* Step Indicator Dots */}
        <div className="flex items-center justify-center gap-1.5">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-2 rounded-full transition-all ${
                i === currentStep ? 'w-6 bg-emerald-500' : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
            >
              {t.common.close}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
