import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Building, Calendar, Share2, Bookmark, Eye, BookmarkCheck } from "lucide-react";
import type { College } from "../../types/college";

interface CollegeHeaderProps {
    college: College;
    onBack: () => void;
    saved: boolean;
    onToggleSaved: () => void;
}

export const CollegeHeader: React.FC<CollegeHeaderProps> = ({ college, onBack, saved, onToggleSaved }) => {
    return (
        <div className="relative h-[450px] overflow-hidden">
            <motion.img
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8 }}
                src={college.image || "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80"}
                className="w-full h-full object-cover"
                alt={college.college_name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

            {/* Navigation & Actions */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
                <motion.button
                    whileHover={{ scale: 1.05, x: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-bold text-sm hidden sm:inline">Back to Search</span>
                </motion.button>

                <div className="flex gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white border border-white/20 hover:bg-white/20 transition-all"
                    >
                        <Share2 className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onToggleSaved}
                        className={`p-3 backdrop-blur-md rounded-2xl border transition-all ${saved ? "bg-pink-500 text-white border-pink-400" : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                            }`}
                    >
                        {saved ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
                    </motion.button>
                </div>
            </div>

            {/* College Info Header */}
            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="px-4 py-1.5 bg-indigo-500/80 backdrop-blur-md text-white text-xs font-black rounded-xl uppercase tracking-widest border border-indigo-400/50">
                                {college.autonomy_status}
                            </span>
                            <span className="px-4 py-1.5 bg-emerald-500/80 backdrop-blur-md text-white text-xs font-black rounded-xl uppercase tracking-widest border border-emerald-400/50">
                                NAAC A++
                            </span>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-xl text-white text-xs font-bold border border-white/20">
                                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                                <span>2.4k Views</span>
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4 drop-shadow-2xl">
                            {college.college_name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-y-4 gap-x-8 text-white/90">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <MapPin className="w-5 h-5 text-emerald-400" />
                                </div>
                                <span className="text-lg font-bold">{college.city}, Maharashtra</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Building className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="text-lg font-bold">University of {college.city}</span>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <Calendar className="w-5 h-5 text-purple-400" />
                                </div>
                                <span className="text-lg font-bold">Est. 1965</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
