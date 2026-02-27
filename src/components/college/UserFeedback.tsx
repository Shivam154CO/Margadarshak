import React from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, ShieldCheck, User } from "lucide-react";
import type { Feedback } from "../../types/college";

interface UserFeedbackProps {
    feedbacks: Feedback[];
    averageRating: number;
    totalFeedbacks: number;
}

export const UserFeedback: React.FC<UserFeedbackProps> = ({ feedbacks, averageRating, totalFeedbacks }) => {
    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
                <div className="flex items-center gap-8">
                    <div className="text-center">
                        <div className="text-6xl font-black text-slate-900 mb-2">{averageRating?.toFixed(1) || "4.5"}</div>
                        <div className="flex items-center justify-center gap-1 text-amber-400 mb-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} className={`w-5 h-5 ${i <= Math.round(averageRating || 4.5) ? 'fill-current' : ''}`} />
                            ))}
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{totalFeedbacks || "120"} Verified Reviews</div>
                    </div>

                    <div className="hidden sm:block h-20 w-px bg-slate-100" />

                    <div className="space-y-3 flex-1 min-w-[200px]">
                        {[5, 4, 3, 2, 1].map(stars => (
                            <div key={stars} className="flex items-center gap-3">
                                <span className="text-xs font-black text-slate-400 w-4">{stars}</span>
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-400 rounded-full"
                                        style={{ width: `${stars === 5 ? 70 : stars === 4 ? 20 : 5}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all flex items-center gap-3">
                    Write a Review
                    <MessageSquare className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {feedbacks?.length > 0 ? feedbacks.map((f, i) => (
                    <motion.div
                        key={f.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                                    <User className="w-6 h-6 text-slate-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{f.user_name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex text-amber-400">
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`w-3 h-3 ${i <= f.rating ? 'fill-current' : ''}`} />)}
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{f.date}</span>
                                    </div>
                                </div>
                            </div>
                            {f.verified && (
                                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Verified
                                </div>
                            )}
                        </div>

                        <p className="text-slate-600 font-medium leading-relaxed mb-6">"{f.comment}"</p>

                        <div className="flex items-center gap-6">
                            <button className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all">
                                Helpful ({f.helpful_count})
                            </button>
                            <button className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all">
                                Report
                            </button>
                        </div>
                    </motion.div>
                )) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No reviews yet</h3>
                        <p className="text-slate-500">Be the first to share your experience with this college.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
