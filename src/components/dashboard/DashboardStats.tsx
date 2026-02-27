import React from "react";
import { Zap, CheckCircle, Target, TrendingUp, Building } from "lucide-react";

interface DashboardStatsProps {
    stats: {
        mostProbable: number;
        bestFit: number;
        goodFit: number;
        stretch: number;
        uniqueColleges: number;
    };
    activeFilter: string;
    onFilterChange: (id: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, activeFilter, onFilterChange }) => {
    const filters = [
        { id: 'all', label: 'All Matches', count: stats.mostProbable + stats.bestFit + stats.goodFit + stats.stretch, color: 'bg-slate-900', icon: Zap },
        { id: 'most-probable', label: 'Most Probable', count: stats.mostProbable, color: 'bg-purple-600', icon: Zap },
        { id: 'best-fit', label: 'Best Fit', count: stats.bestFit, color: 'bg-emerald-600', icon: CheckCircle },
        { id: 'good-fit', label: 'Good Fit', count: stats.goodFit, color: 'bg-indigo-600', icon: Target },
        { id: 'stretch', label: 'Stretch', count: stats.stretch, color: 'bg-rose-600', icon: TrendingUp },
    ];

    return (
        <div className="space-y-8 mb-12">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                {filters.map(f => (
                    <button
                        key={f.id}
                        onClick={() => onFilterChange(f.id)}
                        className={`p-6 rounded-[2rem] border transition-all text-left group relative overflow-hidden ${activeFilter === f.id
                                ? `${f.color} border-transparent text-white shadow-2xl`
                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 shadow-sm'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${activeFilter === f.id ? 'bg-white/20' : 'bg-slate-50 text-slate-400'
                            }`}>
                            <f.icon className="w-5 h-5" />
                        </div>
                        <div className={`text-3xl font-black mb-1 ${activeFilter === f.id ? 'text-white' : 'text-slate-900'}`}>{f.count}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest">{f.label}</div>

                        {activeFilter === f.id && (
                            <div className="absolute top-4 right-4 w-2 h-2 bg-white rounded-full animate-pulse" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
