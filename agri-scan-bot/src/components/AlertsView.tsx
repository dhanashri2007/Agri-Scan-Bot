import React from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  Calendar,
  Check,
  Trash2,
} from 'lucide-react';
import { Language, AlertRecord } from '../types';
import { translations } from '../translations';

interface AlertsViewProps {
  language: Language;
  alerts: AlertRecord[];
  onMarkRead: (id: string) => void;
  onClearAlert: (id: string) => void;
  onNavigateToScan?: (scanId: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  language,
  alerts,
  onMarkRead,
  onClearAlert,
  onNavigateToScan,
}) => {
  const t = translations[language];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <span>{t.nav.alerts}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time agro-bot warnings, leaf disease alerts, and hardware notifications.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 w-fit">
          {alerts.filter((a) => !a.isRead).length} unacknowledged warnings
        </span>
      </div>

      {/* Alerts List */}
      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const isCritical = alert.type === 'Critical';
            const isWarning = alert.type === 'Warning';

            return (
              <div
                key={alert.id}
                className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  alert.isRead
                    ? 'bg-slate-900/60 border-slate-800/80 opacity-75'
                    : isCritical
                    ? 'bg-rose-950/30 border-rose-600/40 shadow-lg shadow-rose-950/20'
                    : isWarning
                    ? 'bg-amber-950/30 border-amber-500/40 shadow-lg shadow-amber-950/20'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isCritical
                        ? 'bg-rose-600/20 text-rose-400'
                        : isWarning
                        ? 'bg-amber-600/20 text-amber-400'
                        : 'bg-blue-600/20 text-blue-400'
                    }`}
                  >
                    {isCritical ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-white">
                        {alert.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-300'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {alert.type}
                      </span>
                      {!alert.isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span>{new Date(alert.createdAt).toLocaleString()}</span>
                      {alert.relatedScanId && (
                        <button
                          onClick={() => onNavigateToScan?.(alert.relatedScanId!)}
                          className="text-emerald-400 hover:text-emerald-300 font-medium underline"
                        >
                          View Scan {alert.relatedScanId}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!alert.isRead && (
                    <button
                      onClick={() => onMarkRead(alert.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                      title="Mark as Read"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Acknowledge</span>
                    </button>
                  )}

                  <button
                    onClick={() => onClearAlert(alert.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Dismiss Alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-12 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Active Alerts</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All robot subsystems and field scans are currently within normal thresholds.
          </p>
        </div>
      )}
    </div>
  );
};
