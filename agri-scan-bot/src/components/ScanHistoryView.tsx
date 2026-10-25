import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bot,
  Upload,
  Calendar,
  ArrowUpRight,
  Trash2,
} from 'lucide-react';
import { Language, ScanRecord } from '../types';
import { translations } from '../translations';

interface ScanHistoryViewProps {
  language: Language;
  scans: ScanRecord[];
  onSelectScan: (scan: ScanRecord) => void;
  onDeleteScan: (scanId: string) => void;
}

export const ScanHistoryView: React.FC<ScanHistoryViewProps> = ({
  language,
  scans,
  onSelectScan,
  onDeleteScan,
}) => {
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCrop, setFilterCrop] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterSource, setFilterSource] = useState('ALL');

  // Filter scans
  const filteredScans = scans.filter((scan) => {
    const matchesSearch =
      scan.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (scan.disease && scan.disease.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCrop = filterCrop === 'ALL' || scan.crop === filterCrop;
    const matchesStatus = filterStatus === 'ALL' || scan.healthStatus === filterStatus;
    const matchesSource =
      filterSource === 'ALL' ||
      (filterSource === 'ROBOT' && (scan.source === 'ROBOT' || scan.source === 'Robot Camera')) ||
      (filterSource === 'MANUAL' && (scan.source === 'MANUAL' || scan.source === 'Manual Upload')) ||
      scan.source === filterSource;

    return matchesSearch && matchesCrop && matchesStatus && matchesSource;
  });

  const uniqueCrops = Array.from(new Set(scans.map((s) => s.crop)));

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <span>{t.nav.history}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Historical leaf diagnoses, botanical records, and robot scan archives.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 w-fit">
          {filteredScans.length} of {scans.length} records
        </span>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search crop or disease..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Crop */}
        <div>
          <select
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Crops</option>
            {uniqueCrops.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Status */}
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Health States</option>
            <option value="Healthy">Healthy Only</option>
            <option value="Diseased">Diseased Only</option>
          </select>
        </div>

        {/* Filter Source */}
        <div>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Scan Sources</option>
            <option value="ROBOT">Robot Camera</option>
            <option value="MANUAL">Manual Upload</option>
          </select>
        </div>
      </div>

      {/* Records List */}
      {filteredScans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredScans.map((scan) => {
            const isHealthy = scan.healthStatus === 'Healthy';
            const isDiseased = scan.healthStatus === 'Diseased';

            return (
              <div
                key={scan.id}
                onClick={() => onSelectScan(scan)}
                className="bg-slate-900/90 hover:bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 p-4 transition cursor-pointer group shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={scan.imagePath}
                    alt={scan.crop}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-slate-700 flex-shrink-0"
                  />
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {scan.crop}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isHealthy
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : isDiseased
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {scan.healthStatus}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-medium line-clamp-1">
                      {scan.disease || 'Undetermined condition'}
                    </div>

                    {scan.severity && (
                      <div className="text-[11px] text-slate-400">
                        Severity: <strong className="text-slate-200">{scan.severity}</strong>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-500 font-mono">
                      {scan.id}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Source & Date */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    {scan.source === 'ROBOT' || scan.source === 'Robot Camera' ? (
                      <>
                        <Bot className="w-3 h-3 text-emerald-400" />
                        <span>Robot Camera</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3 text-blue-400" />
                        <span>Manual Upload</span>
                      </>
                    )}
                  </span>

                  <div className="flex items-center gap-2">
                    <span>{new Date(scan.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete scan record ${scan.id}?`)) {
                          onDeleteScan(scan.id);
                        }
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 transition"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-12 text-center space-y-2">
          <History className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Matching Scan Records</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {scans.length === 0
              ? 'No scans have been performed yet. Start a leaf scan using Mode A (Robot) or Mode B (Manual).'
              : 'Try clearing your filters or searching with a different term.'}
          </p>
        </div>
      )}
    </div>
  );
};
