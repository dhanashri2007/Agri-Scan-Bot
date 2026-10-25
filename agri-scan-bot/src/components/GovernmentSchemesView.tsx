import React, { useState, useEffect } from 'react';
import {
  Building2,
  ExternalLink,
  ShieldCheck,
  FileText,
  Users,
  CheckCircle2,
  HelpCircle,
  Search,
} from 'lucide-react';
import { Language, GovtScheme } from '../types';
import { translations } from '../translations';

interface GovernmentSchemesViewProps {
  language: Language;
}

export const GovernmentSchemesView: React.FC<GovernmentSchemesViewProps> = ({ language }) => {
  const t = translations[language];

  const [schemes, setSchemes] = useState<GovtScheme[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<GovtScheme | null>(null);

  useEffect(() => {
    fetch('/api/schemes')
      .then((res) => res.json())
      .then((data) => {
        if (data.schemes) {
          setSchemes(data.schemes);
        }
      })
      .catch((err) => console.error('Error loading schemes:', err));
  }, []);

  const filteredSchemes = schemes.filter(
    (s) =>
      (s.title || s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <span>{t.nav.schemes}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Official government subsidies, robot mechanization grants, and crop insurance programs.
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search schemes or subsidies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSchemes.map((scheme) => (
          <div
            key={scheme.id}
            onClick={() => setSelectedScheme(scheme)}
            className="bg-slate-900/90 hover:bg-slate-900 rounded-2xl border border-slate-800 hover:border-emerald-500/40 p-5 transition cursor-pointer group shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {scheme.category}
                </span>
                <span className="text-xs text-slate-500 font-mono">{scheme.id}</span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                {scheme.title || scheme.name}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {scheme.description}
              </p>
            </div>

            {/* Benefits pill */}
            <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30 text-xs text-emerald-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Grant / Subsidy Benefit
              </div>
              <div className="font-semibold text-xs mt-0.5">
                {scheme.benefit || scheme.benefits}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="text-slate-300">Click to view eligibility & documents</span>
              <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                Details →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  {selectedScheme.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedScheme.title || selectedScheme.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedScheme(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{selectedScheme.description}</p>

            {/* Benefit Box */}
            <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-500/40 text-xs">
              <span className="text-[10px] font-bold uppercase text-emerald-400">Financial Benefit:</span>
              <p className="font-bold text-emerald-100 text-sm mt-0.5">
                {selectedScheme.benefit || selectedScheme.benefits}
              </p>
            </div>

            {/* Eligibility */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Eligibility Criteria:</span>
              </div>
              <p className="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 leading-relaxed">
                {selectedScheme.eligibility}
              </p>
            </div>

            {/* Required Documents */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Required Documents:</span>
              </div>
              <ul className="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-1 list-disc list-inside">
                {(selectedScheme.documentsRequired || selectedScheme.requiredDocuments || []).map((doc, i) => (
                  <li key={i}>{doc}</li>
                ))}
              </ul>
            </div>

            {/* Link button */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setSelectedScheme(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Close
              </button>

              <a
                href={selectedScheme.officialLink || selectedScheme.officialPortalUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
              >
                <span>Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
