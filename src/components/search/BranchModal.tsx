import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building, Target, Users, IndianRupee, Info } from "lucide-react";
import type { College } from "../../types/college";

interface BranchModalProps {
    college: College;
    onClose: () => void;
    getProbabilityColor: (chance: number) => string;
}

export const BranchModal: React.FC<BranchModalProps> = ({
    college, onClose, getProbabilityColor
}) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden"
            >
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 leading-tight">
                            Course Cutoffs & Seats
                        </h2>
                        <p className="text-slate-500 font-medium">{college.college_name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-slate-100 rounded-2xl transition-colors group"
                    >
                        <X className="w-6 h-6 text-slate-400 group-hover:text-slate-900" />
                    </button>
                </div>

                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(college.branches || []).map((branch, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:border-indigo-200 transition-all hover:bg-white hover:shadow-xl group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <Building className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    {branch.admission_chance !== undefined && (
                                        <div className={`px-4 py-2 rounded-2xl bg-gradient-to-r ${getProbabilityColor(branch.admission_chance)} text-white font-black text-xs shadow-lg uppercase tracking-wider`}>
                                            {branch.admission_chance}% Chance
                                        </div>
                                    )}
                                </div>

                                <h4 className="text-lg font-bold text-slate-900 mb-4 pr-10">
                                    {branch.branch_name}
                                </h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/60 p-3 rounded-2xl">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <Target className="w-3 h-3" />
                                            Cutoff Rank
                                        </div>
                                        <div className="text-base font-black text-slate-800 tracking-tight">
                                            {branch.cutoff_rank ? branch.cutoff_rank.toLocaleString() : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="bg-white/60 p-3 rounded-2xl">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            Seats
                                        </div>
                                        <div className="text-base font-black text-slate-800 tracking-tight">
                                            {branch.seats || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="bg-white/60 p-3 rounded-2xl">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <IndianRupee className="w-3 h-3" />
                                            Annual Fees
                                        </div>
                                        <div className="text-base font-black text-emerald-600 tracking-tight">
                                            ₹{branch.fees ? branch.fees.toLocaleString() : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="bg-white/60 p-3 rounded-2xl">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <Info className="w-3 h-3" />
                                            Percentile
                                        </div>
                                        <div className="text-base font-black text-indigo-600 tracking-tight">
                                            {branch.cutoff_percentile || 'N/A'}%
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
