import React from 'react';
import { Navigation, RefreshCw, Locate, AlertCircle, MapPinned, Route } from 'lucide-react';

interface DistanceCalculatorProps {
  distance: number | null;
  isGettingLocation: boolean;
  onGetLocation: () => void;
  error: string | null;
}

export const DistanceCalculator: React.FC<DistanceCalculatorProps> = ({
  distance,
  isGettingLocation,
  onGetLocation,
  error,
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div className="flex items-center space-x-3">
          <Navigation className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Distance Calculator</h3>
        </div>
        <button
          onClick={onGetLocation}
          disabled={isGettingLocation}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm"
        >
          {isGettingLocation ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Getting Location...</span>
            </>
          ) : (
            <>
              <Locate className="w-4 h-4" />
              <span>Get Distance</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {distance !== null ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 gap-3">
            <div className="flex items-center space-x-3">
              <Route className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Distance from your location</p>
                <p className="text-2xl font-bold text-gray-900">{distance.toFixed(1)} km</p>
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-sm text-gray-500">Approx. travel time</p>
              <p className="text-lg font-semibold text-gray-700">
                {distance < 10 ? `${Math.round(distance * 6)} min` :
                  distance < 50 ? `${Math.round(distance * 2)} min` :
                    `${Math.round(distance / 50)} hr`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <MapPinned className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Click "Get Distance" to calculate distance from your current location</p>
        </div>
      )}
    </div>
  );
};
