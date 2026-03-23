import React from 'react';

interface StatsBarProps {
  stats: {
    mostProbable: number;
    bestFit: number;
    goodFit: number;
    stretch: number;
    reach: number;
    uniqueColleges: number;
  };
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 text-center uppercase tracking-tight">
      <div className="bg-white border border-slate-200 border-l-4 border-l-purple-500 rounded-xl p-4 shadow-sm hover:-translate-y-0.5 transition-transform">
        <div className="text-2xl font-bold text-slate-800">{stats.mostProbable}</div>
        <p className="text-sm font-medium text-slate-700 mt-1">Most Probable</p>
        <p className="text-xs text-slate-400 mt-0.5">Near-exact matches</p>
      </div>
      <div className="bg-white border border-slate-200 border-l-4 border-l-emerald-500 rounded-xl p-4 shadow-sm hover:-translate-y-0.5 transition-transform">
        <div className="text-2xl font-bold text-slate-800">{stats.bestFit}</div>
        <p className="text-sm font-medium text-slate-700 mt-1">Best Fit</p>
        <p className="text-xs text-slate-400 mt-0.5">High probability</p>
      </div>
      <div className="bg-white border border-slate-200 border-l-4 border-l-blue-500 rounded-xl p-4 shadow-sm hover:-translate-y-0.5 transition-transform">
        <div className="text-2xl font-bold text-slate-800">{stats.goodFit}</div>
        <p className="text-sm font-medium text-slate-700 mt-1">Good Fit</p>
        <p className="text-xs text-slate-400 mt-0.5">Solid chance</p>
      </div>
      <div className="bg-white border border-slate-200 border-l-4 border-l-orange-400 rounded-xl p-4 shadow-sm hover:-translate-y-0.5 transition-transform">
        <div className="text-2xl font-bold text-slate-800">{stats.stretch}</div>
        <p className="text-sm font-medium text-slate-700 mt-1">Stretch</p>
        <p className="text-xs text-slate-400 mt-0.5">Aggressive choices</p>
      </div>
      <div className="bg-white border border-slate-200 border-l-4 border-l-red-500 rounded-xl p-4 shadow-sm hover:-translate-y-0.5 transition-transform">
        <div className="text-2xl font-bold text-slate-800">{stats.reach}</div>
        <p className="text-sm font-medium text-slate-700 mt-1">Reach</p>
        <p className="text-xs text-slate-400 mt-0.5">High-risk goals</p>
      </div>
      <div className="bg-white border border-slate-200 border-l-4 border-l-slate-400 rounded-xl p-4 shadow-sm hover:-translate-y-0.5 transition-transform">
        <div className="text-2xl font-bold text-slate-800">{stats.uniqueColleges}</div>
        <p className="text-sm font-medium text-slate-700 mt-1">Unique Colleges</p>
        <p className="text-xs text-slate-400 mt-0.5">Different institutions</p>
      </div>
    </div>
  );
};
