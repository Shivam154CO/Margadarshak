import React from "react";
import { motion } from "framer-motion";
import {
    Building, MapPin, Target, Bookmark, BookmarkCheck,
    ChevronDown, ExternalLink, IndianRupee
} from "lucide-react";
import type { College } from "../../types/college";

interface CollegeCardProps {
    college: College;
    index: number;
    saved: boolean;
    onToggleSaved: () => void;
    onOpenBranches: () => void;
    onViewDetails: () => void;
    isPredicted: boolean;
}

export const CollegeCard: React.FC<CollegeCardProps> = ({
    college, index, saved, onToggleSaved, onOpenBranches, onViewDetails, isPredicted
}) => {
    const getAdmissionInfo = (chance: number) => {
        if (chance >= 80) return { label: "Very High", color: "text-emerald-600 bg-emerald-50", border: "border-emerald-100" };
        if (chance >= 60) return { label: "High", color: "text-blue-600 bg-blue-50", border: "border-blue-100" };
        if (chance >= 40) return { label: "Moderate", color: "text-amber-600 bg-amber-50", border: "border-amber-100" };
        return { label: "Low", color: "text-rose-600 bg-rose-50", border: "border-rose-100" };
    };

    const maxChance = college.branches ? Math.max(...college.branches.map(b => b.admission_chance || 0)) : 0;
    const admission = getAdmissionInfo(maxChance);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full"
        >
            {/* College Image Header */}
            <div className="relative h-56 overflow-hidden">
                <img
                    src={college.image || "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80"}
                    alt={college.college_name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); onToggleSaved(); }}
                        className={`p-3 rounded-2xl backdrop-blur-md transition-all ${saved ? "bg-pink-500 text-white shadow-lg" : "bg-white/20 text-white hover:bg-white"
                            }`}
                    >
                        {saved ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
                    </motion.button>
                </div>

                {/* Status Badges */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div className="flex flex-col gap-2">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-lg border border-white/30 uppercase tracking-wider">
                            {college.autonomy_status}
                        </span>
                        <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                            <MapPin className="w-4 h-4 text-emerald-400" />
                            {college.city}
                        </div>
                    </div>
                    {isPredicted && (
                        <div className={`px-3 py-2 rounded-xl backdrop-blur-md border ${admission.border} ${admission.color} shadow-lg`}>
                            <div className="text-[10px] font-bold uppercase tracking-tighter opacity-70">Chance</div>
                            <div className="text-sm font-bold leading-none">{admission.label}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                        {college.college_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                        <Building className="w-4 h-4" />
                        <span>{(college.branches || []).length} Branches Available</span>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-gray-100">
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Highest Package</div>
                        <div className="text-sm font-bold text-indigo-600 flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" />
                            {college.highest_package_lpa} LPA
                        </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-gray-100">
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Placement Rate</div>
                        <div className="text-sm font-bold text-indigo-600 flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {college.placement_rate}%
                        </div>
                    </div>
                </div>

                <div className="mt-auto flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onViewDetails}
                        className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                    >
                        View Full Profile
                        <ExternalLink className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onOpenBranches}
                        className="px-4 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};
