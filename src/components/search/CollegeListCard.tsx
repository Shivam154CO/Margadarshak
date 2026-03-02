import React from "react";
import { motion } from "framer-motion";
import {
    MapPin, Target, Bookmark, BookmarkCheck,
    ExternalLink, IndianRupee, Star, ShieldCheck, ChevronRight
} from "lucide-react";
import type { College } from "../../types/college";
import SmartImage from "../SmartImage";

interface CollegeListCardProps {
    college: College;
    index: number;
    saved: boolean;
    onToggleSaved: () => void;
    onOpenBranches: () => void;
    onViewDetails: () => void;
    isPredicted: boolean;
}

export const CollegeListCard: React.FC<CollegeListCardProps> = ({
    college, index, saved, onToggleSaved, onOpenBranches, onViewDetails, isPredicted
}) => {
    // ... logic remains same ...
    const getAdmissionInfo = (chance: number) => {
        if (chance >= 80) return { label: "Excellent Chance", color: "text-emerald-700 bg-emerald-100", icon: ShieldCheck };
        if (chance >= 60) return { label: "Good Chance", color: "text-blue-700 bg-blue-100", icon: Target };
        if (chance >= 40) return { label: "Fair Chance", color: "text-amber-700 bg-amber-100", icon: Star };
        return { label: "Target Reach", color: "text-rose-700 bg-rose-100", icon: Target };
    };

    const maxChance = college.branches ? Math.max(...college.branches.map(b => b.admission_chance || 0)) : 0;
    const admission = getAdmissionInfo(maxChance);
    const StatusIcon = admission.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration: 0.8,
                delay: index * 0.05,
                ease: [0.21, 1.11, 0.81, 0.99]
            }}
            className="group bg-white rounded-3xl p-5 border border-gray-100 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col md:flex-row gap-6 items-center"
        >
            {/* Mini Image */}
            <div className="relative w-full md:w-48 h-32 rounded-2xl overflow-hidden flex-shrink-0">
                <SmartImage
                    src={college.image || "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80"}
                    alt={college.college_name}
                    className="w-full h-full"
                    fallbackText={college.college_name}
                />
                {isPredicted && (
                    <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-black text-indigo-600 border border-indigo-100 shadow-sm uppercase tracking-tighter">
                        Match Score: {Math.max(...(college.branches || []).map(b => b.match_score || 0))}%
                    </div>
                )}
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">
                                {college.autonomy_status}
                            </span>
                            <span className="flex items-center gap-1 text-slate-400 text-xs">
                                <MapPin className="w-3 h-3" />
                                {college.city}, Maharashtra
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate pr-4">
                            {college.college_name}
                        </h3>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onToggleSaved}
                        className={`p-3 rounded-2xl transition-all ${saved ? "bg-pink-500 text-white shadow-lg shadow-pink-200" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                            }`}
                    >
                        {saved ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
                    </motion.button>
                </div>

                <div className="flex flex-wrap items-center gap-y-3 gap-x-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                            <IndianRupee className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Budget Approx</div>
                            <div className="text-sm font-bold text-gray-700">₹{Math.min(...(college.branches || []).map(b => b.fees || 0)).toLocaleString()}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-50 rounded-xl">
                            <Target className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Placements</div>
                            <div className="text-sm font-bold text-gray-700">{college.placement_rate}% Rate</div>
                        </div>
                    </div>

                    {isPredicted && (
                        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border border-transparent ${admission.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            <div className="text-sm font-extrabold">{admission.label}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onViewDetails}
                    className="flex-1 md:w-32 py-3 px-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                >
                    Details
                    <ExternalLink className="w-4 h-4" />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onOpenBranches}
                    className="flex-1 md:w-32 py-3 px-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                    Branches
                    <ChevronRight className="w-4 h-4" />
                </motion.button>
            </div>
        </motion.div>
    );
};
