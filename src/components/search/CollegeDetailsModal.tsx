import React from "react";
import { motion } from "framer-motion";
import {
    X, Building, Target, Award, Users, Bot, SearchX, Globe, Mail,
    MapPin, CheckCircle, Smartphone, ExternalLink, Calendar, Briefcase, Book, Activity, Music
} from "lucide-react";
import type { College } from "../../types/college";

interface CollegeDetailsModalProps {
    college: College;
    onClose: () => void;
    getProbabilityColor: (chance: number) => string;
}

export const CollegeDetailsModal: React.FC<CollegeDetailsModalProps> = ({
    college, onClose, getProbabilityColor: _getProbabilityColor
}) => {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="relative bg-white rounded-[2.5rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header with Image */}
                <div className="relative h-72 flex-shrink-0">
                    <img
                        src={college.image || "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80"}
                        alt={college.college_name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute top-6 right-6">
                        <button
                            onClick={onClose}
                            className="p-4 bg-white/20 hover:bg-white/40 backdrop-blur-xl text-white rounded-full transition-all border border-white/30"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="absolute bottom-8 left-10 right-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-4 py-1.5 bg-indigo-500 text-white text-xs font-black rounded-xl border border-indigo-400/50 uppercase tracking-widest">
                                    {college.autonomy_status}
                                </span>
                                <span className="px-4 py-1.5 bg-emerald-500 text-white text-xs font-black rounded-xl border border-emerald-400/50 uppercase tracking-widest">
                                    NAAC: {college.naac_grade || 'A++'}
                                </span>
                            </div>
                            <h2 className="text-4xl font-black text-white leading-tight">
                                {college.college_name}
                            </h2>
                            <p className="text-white/80 text-lg flex items-center gap-2 mt-2 font-medium">
                                <MapPin className="w-5 h-5 text-emerald-400" />
                                {college.city}, {college.region || 'Maharashtra'}
                            </p>
                        </div>
                        <div className="flex flex-col items-center md:items-end gap-3 translate-y-4">
                            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-2xl">
                                <div className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-2 text-center">Avg Package</div>
                                <div className="text-3xl font-black text-white">₹{college.average_package_lpa} <span className="text-sm font-bold text-white/60">LPA</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Tabs Area */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto p-10">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Left Column - Details */}
                            <div className="lg:col-span-2 space-y-10">
                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                                            <Target className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Placement Performance</h3>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                                            <div className="w-12 h-12 bg-indigo-100/50 text-indigo-600 rounded-2xl flex items-center justify-center mb-3">
                                                <Award className="w-6 h-6" />
                                            </div>
                                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Highest</div>
                                            <div className="text-2xl font-black text-slate-800">₹{college.highest_package_lpa} LPA</div>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                                            <div className="w-12 h-12 bg-emerald-100/50 text-emerald-600 rounded-2xl flex items-center justify-center mb-3">
                                                <CheckCircle className="w-6 h-6" />
                                            </div>
                                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Placement</div>
                                            <div className="text-2xl font-black text-slate-800">{college.placement_rate}%</div>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                                            <div className="w-12 h-12 bg-purple-100/50 text-purple-600 rounded-2xl flex items-center justify-center mb-3">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Recruiters</div>
                                            <div className="text-2xl font-black text-slate-800">150+</div>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                                                <Building className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Available Branches</h3>
                                        </div>
                                        <span className="text-indigo-600 font-black text-sm uppercase tracking-widest">{(college.branches || []).length} Courses</span>
                                    </div>
                                    <div className="bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden divide-y divide-slate-200">
                                        {(college.branches || []).slice(0, 5).map((branch, idx) => (
                                            <div key={idx} className="p-6 md:px-8 hover:bg-white transition-colors flex items-center justify-between group">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-indigo-600 text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        {(branch.branch_name || '').charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-base font-black text-slate-800">{branch.branch_name}</div>
                                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Code: {branch.branch_code}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-black text-emerald-600">₹{(branch.fees || 0).toLocaleString()}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Annual</div>
                                                </div>
                                            </div>
                                        ))}
                                        {(college.branches || []).length > 5 && (
                                            <div className="p-4 bg-slate-100/50 text-center">
                                                <button className="text-sm font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700">
                                                    + View {(college.branches || []).length - 5} More Branches
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                                            <Globe className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Campus Facilities</h3>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { icon: Activity, label: "Sports Complex", active: true },
                                            { icon: Music, label: "Cultural Events", active: true },
                                            { icon: Globe, label: "Wi-Fi Campus", active: true },
                                            { icon: Book, label: "Digital Library", active: true },
                                            { icon: Briefcase, label: "Innovation Hub", active: true },
                                            { icon: Users, label: "Clubs & Socs", active: true },
                                        ].map((f, i) => (
                                            <div key={i} className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <f.icon className="w-6 h-6 text-slate-400 mb-2" />
                                                <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">{f.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Right Column - Contact & Fast Info */}
                            <div className="space-y-8">
                                <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-200">
                                    <h4 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                                        <Mail className="w-5 h-5" /> Quick Contact
                                    </h4>
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
                                                <Smartphone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Helpline</div>
                                                <div className="text-sm font-black">+91 20 2550 7000</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Admissions</div>
                                                <div className="text-sm font-black truncate max-w-[150px]">admission@coep.ac.in</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Portal</div>
                                                <div className="text-sm font-black underline">www.coep.org.in</div>
                                            </div>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-full mt-8 py-4 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl flex items-center justify-center gap-3"
                                    >
                                        Apply Now
                                        <ExternalLink className="w-4 h-4" />
                                    </motion.button>
                                </div>

                                <div className="bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100">
                                    <h4 className="text-lg font-black text-emerald-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                                        <Calendar className="w-5 h-5" /> Deadlines
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b border-emerald-200/50">
                                            <span className="text-xs font-bold text-emerald-700/70 uppercase">Merit List</span>
                                            <span className="text-sm font-black text-emerald-900">July 15, 2025</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-emerald-200/50">
                                            <span className="text-xs font-bold text-emerald-700/70 uppercase">Final Phase</span>
                                            <span className="text-sm font-black text-emerald-900">Aug 20, 2025</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-xs font-bold text-emerald-700/70 uppercase">Counselling</span>
                                            <span className="text-sm font-black text-emerald-900">Aug 25, 2025</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <SearchX className="w-24 h-24" />
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-3">
                                        <Bot className="w-5 h-5 text-indigo-400" /> Smart Choice Info
                                    </h4>
                                    <p className="text-white/60 text-xs font-medium leading-relaxed mb-6">
                                        Based on current trends and historical data, this college ranks in the top 5% for your profile match.
                                    </p>
                                    <button className="text-xs font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 flex items-center gap-2">
                                        Detailed AI Analysis <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-50 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?u=${college.college_code}${i}`} alt="user" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-xs font-bold text-slate-500">
                                <span className="text-slate-900 font-black">2.4k students</span> interested in this college
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <button
                                onClick={onClose}
                                className="flex-1 md:flex-none px-8 py-4 text-slate-500 font-black uppercase tracking-widest text-xs hover:text-slate-900"
                            >
                                Close
                            </button>
                            <button className="flex-1 md:flex-none px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:shadow-slate-300 transition-all">
                                Download Brochure
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const ChevronRight = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);
