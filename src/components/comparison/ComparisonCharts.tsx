import React from "react";
import { Radar } from "react-chartjs-2";
import {
    Chart as ChartJS, RadialLinearScale, PointElement, LineElement,
    Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement,
    ArcElement, Title
} from "chart.js";

ChartJS.register(
    RadialLinearScale, PointElement, LineElement, Filler, Tooltip,
    Legend, CategoryScale, LinearScale, BarElement, ArcElement, Title
);

interface ComparisonChartsProps {
    radarData: any;
    barData: any;
}

export const ComparisonCharts: React.FC<ComparisonChartsProps> = ({ radarData }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl">
                <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-widest">Core Attribute Map</h3>
                <div className="h-[400px] flex items-center justify-center">
                    <Radar
                        data={radarData}
                        options={{
                            scales: {
                                r: {
                                    angleLines: { color: 'rgba(0,0,0,0.05)' },
                                    grid: { color: 'rgba(0,0,0,0.05)' },
                                    pointLabels: { font: { size: 10, weight: 'bold' as const }, color: '#64748b' },
                                    ticks: { display: false }
                                }
                            },
                            plugins: {
                                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { weight: 'bold' } } }
                            }
                        }}
                    />
                </div>
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-xl font-black mb-8 uppercase tracking-widest text-indigo-400">AI Side-by-Side Analysis</h3>
                    <div className="space-y-6">
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-sm font-medium text-slate-300 leading-relaxed">
                                Based on your 2024 merit profile, <span className="text-white font-bold">College A</span> offers a significantly better ROI due to lower fees and equivalent placement outcomes.
                            </p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-sm font-medium text-slate-300 leading-relaxed">
                                <span className="text-indigo-400 font-bold">College B</span> however has a 40% stronger alumni network in your preferred "Information Technology" domain.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
