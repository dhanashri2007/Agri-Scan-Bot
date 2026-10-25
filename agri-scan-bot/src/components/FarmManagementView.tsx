import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Sprout,
  Calendar,
  CheckCircle2,
  Trash2,
  X,
  Layers,
} from 'lucide-react';
import { Language, FarmRecord } from '../types';
import { translations } from '../translations';

interface FarmManagementViewProps {
  language: Language;
  farms: FarmRecord[];
  onAddFarm: (farm: Omit<FarmRecord, 'id' | 'createdAt'>) => void;
  onDeleteFarm: (farmId: string) => void;
}

export const FarmManagementView: React.FC<FarmManagementViewProps> = ({
  language,
  farms,
  onAddFarm,
  onDeleteFarm,
}) => {
  const t = translations[language];

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [crop, setCrop] = useState('Tomato');
  const [area, setArea] = useState('2.5 Acres');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddFarm({
      name,
      location: location || 'Maharashtra, India',
      crop,
      area,
      plantingDate: new Date().toISOString().split('T')[0],
      robotId: 'ASB-ROBOT-001',
    });

    setName('');
    setLocation('');
    setIsAdding(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <span>{t.nav.farm}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your agricultural plots, field acreage, and active AGRI-SCAN robot assignments.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Plot</span>
        </button>
      </div>

      {/* Farm Plots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {farms.map((farm) => (
          <div
            key={farm.id}
            className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3 shadow-sm hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  {farm.id}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{farm.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{farm.location}</span>
                </div>
              </div>

              {farms.length > 1 && (
                <button
                  onClick={() => onDeleteFarm(farm.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                  title="Remove Plot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
              <div className="bg-slate-800/50 p-2.5 rounded-xl">
                <div className="text-[10px] text-slate-400">Primary Crop</div>
                <div className="font-bold text-white mt-0.5 flex items-center gap-1">
                  <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{farm.crop}</span>
                </div>
              </div>

              <div className="bg-slate-800/50 p-2.5 rounded-xl">
                <div className="text-[10px] text-slate-400">Plot Area</div>
                <div className="font-bold text-white mt-0.5">{farm.area}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
              <span>Assigned Robot: <strong>{farm.robotId || 'ASB-ROBOT-001'}</strong></span>
              <span>Planted: {farm.plantingDate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Plot Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Register Agricultural Plot</h3>
              <button
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Plot / Farm Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Field - Plot C"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Location / Region
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nashik, Maharashtra"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Crop Cultivated
                  </label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Tomato">Tomato</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Potato">Potato</option>
                    <option value="Soybean">Soybean</option>
                    <option value="Corn">Corn</option>
                    <option value="Wheat">Wheat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Acreage / Area
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. 3.0 Acres"
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                >
                  Save Plot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
