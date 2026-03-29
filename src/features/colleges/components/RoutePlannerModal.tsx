import React, { type Dispatch, type SetStateAction } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Navigation } from 'lucide-react';
import { calculateDistance } from '../utils/geoUtils';

interface RoutePlannerModalProps {
  showVisitPlanner: boolean;
  setShowVisitPlanner: (val: boolean) => void;
  visitList: any[];
  setVisitList: Dispatch<SetStateAction<any[]>>;
  mapProvider: 'osm' | 'google';
  googleRouteResponse: google.maps.DirectionsResult | null;
  setDirectionsPanel: (el: HTMLElement | null) => void;
  setMapCenter: (center: { lat: number, lng: number }) => void;
  setZoomLevel: (zoom: number) => void;
}

export const RoutePlannerModal: React.FC<RoutePlannerModalProps> = ({
  showVisitPlanner,
  setShowVisitPlanner,
  visitList,
  setVisitList,
  mapProvider,
  googleRouteResponse,
  setDirectionsPanel,
  setMapCenter,
  setZoomLevel
}) => {
  return (
    <AnimatePresence>
      {showVisitPlanner && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Route Planner</h2>
                <p className="text-sm text-slate-500 mt-1">{visitList.length} college{visitList.length !== 1 ? 's' : ''} in your route</p>
              </div>
              <button onClick={() => setShowVisitPlanner(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Route legs OR Native Google Instructions */}
            {mapProvider === 'google' && googleRouteResponse ? (
              <div className="flex-1 overflow-y-auto bg-slate-50 premium-scrollbar p-0 m-0" ref={setDirectionsPanel} />
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-1">
                {visitList.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 py-12">Add colleges from the map to plan your route.</p>
                ) : (
                visitList.map((col, idx) => {
                  const next = visitList[idx + 1];
                  const legDist = (next && col.latitude && col.longitude && next.latitude && next.longitude)
                    ? calculateDistance(col.latitude!, col.longitude!, next.latitude!, next.longitude!)
                    : null;
                  const legMins = legDist ? Math.round((legDist / 40) * 60) : null;
                  const legH = legMins ? Math.floor(legMins / 60) : 0;
                  const legM = legMins ? legMins % 60 : 0;
                  return (
                    <div key={col.college_code}>
                      {/* College stop card */}
                      <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold bg-slate-200 text-slate-700">
                          {idx === 0 ? 'S' : idx === visitList.length - 1 ? 'E' : idx}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{col.college_name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{col.city}</p>
                        </div>
                        <button
                          onClick={() => setVisitList((prev: any[]) => prev.filter(c => c.college_code !== col.college_code))}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0 rounded-md hover:bg-rose-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Leg connector — distance + time */}
                      {next && (
                        <div className="flex items-center gap-4 px-6 py-2">
                          <div className="w-0.5 h-6 bg-slate-200 ml-3.5 flex-shrink-0" />
                          {legDist !== null ? (
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded">
                                {legDist.toFixed(1)} km
                              </span>
                              <span className="text-[11px] font-medium text-slate-500">
                                ~{legH > 0 ? `${legH}h ` : ''}{legM} min drive
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">No coordinates</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              </div>
            )}

            {/* Summary + action */}
            {visitList.length > 1 && (() => {
              let totalDist = 0;
              for (let i = 0; i < visitList.length - 1; i++) {
                const a = visitList[i], b = visitList[i + 1];
                if (a.latitude && a.longitude && b.latitude && b.longitude)
                  totalDist += calculateDistance(a.latitude!, a.longitude!, b.latitude!, b.longitude!);
              }
              const totalMins = Math.round((totalDist / 40) * 60);
              const h = Math.floor(totalMins / 60);
              const m = totalMins % 60;
              return (
                <div className="border-t border-slate-100 p-6 bg-slate-50 flex-shrink-0 space-y-6">
                  <div className="flex items-center justify-around">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 font-medium mb-1">Total Distance</p>
                      <p className="text-lg font-bold text-slate-900">{totalDist.toFixed(1)} <span className="text-sm font-medium text-slate-500">km</span></p>
                    </div>
                    <div className="w-px h-8 bg-slate-200" />
                    <div className="text-center">
                      <p className="text-xs text-slate-500 font-medium mb-1">Drive Time</p>
                      <p className="text-lg font-bold text-slate-900">{h > 0 ? `${h}h ` : ''}{m} <span className="text-sm font-medium text-slate-500">min</span></p>
                    </div>
                    <div className="w-px h-8 bg-slate-200" />
                    <div className="text-center">
                      <p className="text-xs text-slate-500 font-medium mb-1">Stops</p>
                      <p className="text-lg font-bold text-slate-900">{visitList.length}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
                      onClick={() => {
                        setShowVisitPlanner(false);
                        // Smoothly set center to average of origin/destination
                        if (visitList.length >= 2) {
                          const origin = visitList[0];
                          const dest = visitList[visitList.length - 1];
                          const midLat = (origin.latitude! + dest.latitude!) / 2;
                          const midLng = (origin.longitude! + dest.longitude!) / 2;
                          setMapCenter({ lat: midLat, lng: midLng });
                          setZoomLevel(11);
                        }
                      }}
                    >
                      <Eye className="w-4 h-4" /> View on Map
                    </button>
                    <button
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
                      onClick={() => {
                        const origin = visitList[0];
                        const destination = visitList[visitList.length - 1];
                        const waypoints = visitList.slice(1, -1);
                        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}${waypoints.length ? `&waypoints=${waypoints.map(c => `${c.latitude},${c.longitude}`).join('|')}` : ''}&travelmode=driving`;
                        window.open(url, '_blank');
                      }}
                    >
                      Navigation <Navigation className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
