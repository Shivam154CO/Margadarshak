import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCityCoordinates, calculateDistance } from '@/utils/collegeHelpers';

interface DistanceCalculatorProps {
  distance: number | null;
  isGettingLocation: boolean;
  onGetLocation: () => void;
  error: string | null;
  collegeCity?: string;
  collegeCoords?: { lat: number, lng: number };
}

export const DistanceCalculator: React.FC<DistanceCalculatorProps> = ({
  distance: autoDistance,
  isGettingLocation,
  onGetLocation,
  error,
  collegeCity = "Pune",
  collegeCoords
}) => {
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [manualCity, setManualCity] = useState('');
  const [manualDistance, setManualDistance] = useState<number | null>(null);

  const popularCities = ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Ahmednagar", "Kolhapur", "Solapur", "Amravati"];

  const handleManualCalculate = (city: string) => {
    setManualCity(city);
    const userCoords = getCityCoordinates(city);
    const targetCoords = collegeCoords || getCityCoordinates(collegeCity);
    const dist = calculateDistance(userCoords.lat, userCoords.lng, targetCoords.lat, targetCoords.lng);
    setManualDistance(dist);
  };

  const displayDistance = mode === 'auto' ? autoDistance : manualDistance;

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 overflow-hidden relative group">
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Distance Matrix</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Travel Analytics</p>
          </div>

          <div className="flex p-1 bg-slate-50 rounded-xl self-start sm:self-auto border border-slate-100">
            {['auto', 'manual'].map((m) => (
              <button 
                key={m}
                onClick={() => setMode(m as 'auto' | 'manual')}
                className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all duration-300 uppercase tracking-wider ${mode === m ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {m === 'auto' ? 'Locate' : 'Search City'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {mode === 'auto' ? (
              <motion.div 
                key="auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <button
                  onClick={onGetLocation}
                  disabled={isGettingLocation}
                  className="w-full flex items-center justify-center py-4 bg-slate-900 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] font-bold"
                >
                  {isGettingLocation ? 'Calibrating Satellite...' : 'Detect My Position'}
                </button>
                {error && (
                   <p className="text-rose-600 text-[11px] font-bold text-center">{error}</p>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="manual"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <select 
                  value={manualCity}
                  onChange={(e) => handleManualCalculate(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-200 transition-all appearance-none"
                >
                  <option value="" disabled>Choose your location...</option>
                  {popularCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {displayDistance !== null ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pt-6 border-t border-slate-50"
              >
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Distance</p>
                      <p className="text-3xl font-black text-slate-900">{displayDistance.toFixed(1)} <span className="text-sm text-slate-400 font-bold uppercase ml-1">km</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-white border border-slate-100 rounded-2xl">
                      <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1.5">Est. Travel Time</p>
                      <p className="text-lg font-bold text-slate-900 tracking-tight">
                          {displayDistance < 10 ? `${Math.round(displayDistance * 6)} min` :
                           displayDistance < 50 ? `${Math.round(displayDistance * 2)} min` :
                           `${(displayDistance / 50).toFixed(1)} hr`}
                      </p>
                    </div>
                    <div className="p-5 bg-white border border-slate-100 rounded-2xl">
                      <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1.5">Travel Cost</p>
                      <p className="text-lg font-bold text-slate-900 tracking-tight">₹{Math.round(displayDistance * 5)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : mode === 'auto' && (
              <div className="text-center py-10 border-2 border-dashed border-slate-50 rounded-2xl">
                <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">Awaiting Location Detect</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
