import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Award, IndianRupee, PieChart, Briefcase } from "lucide-react";
import type { College } from "../../types/college";

interface PlacementStatsProps {
    college: College;
}

export const PlacementStats: React.FC<PlacementStatsProps> = ({ college }) => {
    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    whileHover={{ y: -5 }}
                    className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center group"
                >
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Placement Rate</div>
                    <div className="text-4xl font-black text-slate-900">{college.placement_rate}%</div>
                    <div className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Active Recruitment
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center group"
                >
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <IndianRupee className="w-8 h-8" />
                    </div>
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Average Package</div>
                    <div className="text-4xl font-black text-slate-900">₹{college.average_package_lpa} <span className="text-lg font-bold text-slate-400">LPA</span></div>
                    <div className="text-xs font-bold text-slate-500 mt-2">Historical Growth: +12%</div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center group"
                >
                    <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Award className="w-8 h-8" />
                    </div>
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Highest Package</div>
                    <div className="text-4xl font-black text-slate-900">₹{college.highest_package_lpa} <span className="text-lg font-bold text-slate-400">LPA</span></div>
                    <div className="text-xs font-bold text-indigo-600 mt-2">Offered by Top MNCs</div>
                </motion.div>
            </div>

            {/* Main Recruiters */}
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
                    <Briefcase className="w-48 h-48" />
                </div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                        <div>
                            <h3 className="text-3xl font-black mb-3">Principal Recruiters</h3>
                            <p className="text-slate-400 text-lg font-medium max-w-xl">
                                Our legacy of excellence attracts over 250+ global technology and engineering leaders every year.
                            </p>
                        </div>
                        <button className="px-8 py-4 bg-white text-slate-900 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all flex items-center gap-3">
                            Download Report
                            <PieChart className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
                        {['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Accenture', 'Wipro', 'Cognizant', 'Capegemini', 'Adobe', 'Oracle', 'IBM'].map(company => (
                            <div key={company} className="h-20 bg-white/5 rounded-[1.5rem] border border-white/10 flex items-center justify-center filter grayscale transition-all hover:grayscale-0 hover:bg-white/10 hover:border-white/20">
                                <span className="text-sm font-black text-white/40 tracking-widest uppercase">{company}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
