import React, { useState } from 'react';
import { Navigation, RefreshCw, Locate, AlertCircle, MapPinned, Route, Map as MapIcon, ChevronDown } from 'lucide-react';
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
    
    // College coordinates fallback
    const targetCoords = collegeCoords || getCityCoordinates(collegeCity);
    
    const dist = calculateDistance(userCoords.lat, userCoords.lng, targetCoords.lat, targetCoords.lng);
    setManualDistance(dist);
  };

  const displayDistance = mode === 'auto' ? autoDistance : manualDistance;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-gray-200/50 hover:shadow-xl transition-all duration-500 overflow-hidden relative group">
      {/* Decorative background element */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl group-hover:bg-indigo-100 transition-colors duration-500" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <Navigation className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Distance Matrix</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Travel Analytics</p>
          </div>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
          <button 
            onClick={() => setMode('auto')}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${mode === 'auto' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            GPS AUTO
          </button>
          <button 
            onClick={() => setMode('manual')}
            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${mode === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            MANUAL
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {mode === 'auto' ? (
          <div className="space-y-4">
            <button
              onClick={onGetLocation}
              disabled={isGettingLocation}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-slate-900 text-white rounded-2xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-slate-200 font-bold"
            >
              {isGettingLocation ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Calibrating Satellite...</span>
                </>
              ) : (
                <>
                  <Locate className="w-5 h-5" />
                  <span>Locate My Position</span>
                </>
              )}
            </button>
            {error && (
               <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-shake">
                   <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                   <p className="text-rose-700 text-sm font-bold leading-tight">{error}</p>
               </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <select 
                value={manualCity}
                onChange={(e) => handleManualCalculate(e.target.value)}
                className="w-full appearance-none px-6 py-4 bg-slate-100 border-2 border-transparent focus:border-indigo-500 rounded-2xl font-bold text-slate-700 transition-all outline-none"
              >
                <option value="">Select your home city...</option>
                {popularCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}

        {displayDistance !== null ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
               <Route className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12" />
               
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Distance</p>
                    <p className="text-4xl font-black">{displayDistance.toFixed(1)} <span className="text-lg opacity-60">km</span></p>
                  </div>
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                    <MapIcon className="w-6 h-6" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                    <p className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-1">By Road</p>
                    <p className="text-lg font-bold">
                        {displayDistance < 10 ? `${Math.round(displayDistance * 6)} min` :
                         displayDistance < 50 ? `${Math.round(displayDistance * 2)} min` :
                         `${(displayDistance / 50).toFixed(1)} hr`}
                    </p>
                  </div>
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                    <p className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-1">Commute Cost</p>
                    <p className="text-lg font-bold">₹{Math.round(displayDistance * 5)}</p>
                  </div>
               </div>
            </div>
          </div>
        ) : mode === 'auto' && (
          <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl">
            <MapPinned className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-bold">Waiting for coordination lock...</p>
          </div>
        )}
      </div>
    </div>
  );
};
