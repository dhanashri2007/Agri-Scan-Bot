import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Phone,
  Mail,
  Lock,
  MapPin,
  Sprout,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Globe,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { Language, User } from '../types';
import { translations } from '../translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onLoginSuccess: (user: User, token: string) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const t = translations[language];
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [primaryCrop, setPrimaryCrop] = useState('Tomato');
  const [farmName, setFarmName] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim()) {
      setErrorMessage(
        language === 'mr'
          ? 'कृपया मोबाईल नंबर किंवा ईमेल टाका.'
          : language === 'hi'
          ? 'कृपया मोबाइल नंबर या ईमेल दर्ज करें।'
          : 'Please enter your mobile number or email.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      setSuccessMessage(data.message || 'Login successful!');
      setTimeout(() => {
        onLoginSuccess(data.user, data.token);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.user) {
        setSuccessMessage(
          language === 'mr'
            ? 'डेमो शेतकरी (रमेश पाटील) म्हणून यशस्वीरीत्या लॉगिन झाले!'
            : language === 'hi'
            ? 'डेमो किसान (रमेश पाटिल) के रूप में सफलतापूर्वक लॉगिन हुआ!'
            : 'Logged in successfully as Demo Farmer (Ramesh Patil)!'
        );
        setTimeout(() => {
          onLoginSuccess(data.user, data.token);
          onClose();
        }, 500);
      }
    } catch (err: any) {
      setErrorMessage('Failed to connect to demo account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim() || !mobile.trim()) {
      setErrorMessage(
        language === 'mr'
          ? 'कृपया पूर्ण नाव आणि मोबाईल नंबर टाका.'
          : language === 'hi'
          ? 'कृपया पूरा नाम और मोबाइल नंबर दर्ज करें।'
          : 'Please enter your full name and mobile number.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          mobile: mobile.trim(),
          email: email.trim() || undefined,
          password: password.trim() || 'farmer123',
          location: location.trim() || 'Nashik, Maharashtra',
          primaryCrop,
          farmName: farmName.trim() || `${name.trim()}'s Farm Plot`,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed.');
      }

      setSuccessMessage(
        language === 'mr'
          ? 'खाते यशस्वीरीत्या तयार झाले! शेतकरी डॅशबोर्ड सुरू होत आहे...'
          : language === 'hi'
          ? 'खाता सफलतापूर्वक बन गया! किसान डैशबोर्ड शुरू हो रहा है...'
          : 'Account created successfully! Launching farmer dashboard...'
      );
      setTimeout(() => {
        onLoginSuccess(data.user, data.token);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 my-8">
        {/* Close Button */}
        <button
          id="btn-close-auth-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Banner & Language Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-lg">
              🌱
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wide">AGRI-SCAN BOT</h3>
              <p className="text-[11px] text-emerald-400 font-medium">
                {mode === 'login' ? t.auth.loginTitle : t.auth.registerTitle}
              </p>
            </div>
          </div>

          {/* Quick Language Toggle */}
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 self-start sm:self-auto">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition ${
                language === 'en'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('hi')}
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition ${
                language === 'hi'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('mr')}
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition ${
                language === 'mr'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              मराठी
            </button>
          </div>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60">
          <button
            id="tab-btn-auth-login"
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              mode === 'login'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.auth.loginNow}
          </button>
          <button
            id="tab-btn-auth-register"
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              mode === 'register'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.auth.registerNow}
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1-Click Demo Login Banner (High convenience for evaluation) */}
        <div className="bg-gradient-to-r from-emerald-950/60 to-slate-800/60 p-3.5 rounded-2xl border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.auth.demoLoginBtn}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Pre-configured with tomato plots, real scans, and connected robot telemetry.
            </p>
          </div>
          <button
            id="btn-one-tap-demo-login"
            type="button"
            disabled={isLoading}
            onClick={handleDemoLogin}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm flex-shrink-0"
          >
            <span>One-Tap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Form Sections */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.auth.mobileOrEmail}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="input-login-identifier"
                  type="text"
                  required
                  placeholder={t.auth.mobilePlaceholder}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  {t.auth.password}
                </label>
                <span className="text-[11px] text-slate-500">Default: farmer123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="input-login-password"
                  type="password"
                  placeholder={t.auth.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            <button
              id="btn-submit-farmer-login"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Checking credentials...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t.auth.loginBtn}</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-400">
                {t.auth.dontHaveAccount}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="text-emerald-400 font-bold hover:underline ml-1"
                >
                  {t.auth.registerNow}
                </button>
              </span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.auth.fullName} *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="input-register-name"
                  type="text"
                  required
                  placeholder={t.auth.fullNamePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.auth.mobileNumber} *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    id="input-register-mobile"
                    type="tel"
                    required
                    placeholder="98220 12345"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.auth.emailOptional}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    id="input-register-email"
                    type="email"
                    placeholder={t.auth.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.auth.primaryCrop}
                </label>
                <div className="relative">
                  <Sprout className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <select
                    id="select-register-crop"
                    value={primaryCrop}
                    onChange={(e) => setPrimaryCrop(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="Tomato">Tomato (टोमॅटो)</option>
                    <option value="Cotton">Cotton (कपास / कपाशी)</option>
                    <option value="Potato">Potato (बटाटा / आलू)</option>
                    <option value="Soybean">Soybean (सोयाबीन)</option>
                    <option value="Chili">Chili (मिरची / मिर्च)</option>
                    <option value="Wheat">Wheat (गहू / गेहूं)</option>
                    <option value="Onion">Onion (कांदा / प्याज)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.auth.location}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    id="input-register-location"
                    type="text"
                    placeholder={t.auth.locationPlaceholder}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.auth.farmName}
              </label>
              <input
                id="input-register-farm-name"
                type="text"
                placeholder={t.auth.farmNamePlaceholder}
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.auth.password} (PIN)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="input-register-password"
                  type="password"
                  placeholder="Set 4-digit PIN or password (e.g., 1234)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            <button
              id="btn-submit-farmer-register"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span>Registering farm profile...</span>
              ) : (
                <>
                  <Sprout className="w-4 h-4" />
                  <span>{t.auth.registerBtn}</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-400">
                {t.auth.alreadyHaveAccount}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="text-emerald-400 font-bold hover:underline ml-1"
                >
                  {t.auth.loginNow}
                </button>
              </span>
            </div>
          </form>
        )}

        {/* Bottom Guest Mode Action */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Explore features without sign in</span>
          <button
            id="btn-continue-as-guest"
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white font-semibold flex items-center gap-1 hover:underline"
          >
            <span>{t.auth.guestMode}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
