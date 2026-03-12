import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, GraduationCap, Building2, Briefcase, HeartHandshake, Zap, ThumbsUp, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types/user';
import { useToast } from '../context/ToastContext';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    collegeCode: string;
    collegeName: string;
    profile: UserProfile | null;
    onSuccess: () => void;
}

export default function ReviewModal({ isOpen, onClose, collegeCode, collegeName, profile, onSuccess }: ReviewModalProps) {
    const { error: toastError } = useToast();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [ratings, setRatings] = useState({
        academics: 0,
        placement: 0,
        campus: 0,
        infrastructure: 0,
        roi: 0,
    });
    const [textReviews, setTextReviews] = useState({
        best: '',
        worst: ''
    });

    const overallRating = Object.values(ratings).filter(Boolean).length > 0
        ? (Object.values(ratings).reduce((a, b) => a + b, 0) / 5).toFixed(1)
        : '0.0';

    const handleRating = (key: keyof typeof ratings, val: number) => {
        setRatings(p => ({ ...p, [key]: val }));
    };

    const handleNext = () => setStep(2);
    const handlePrev = () => setStep(1);

    const handleSubmit = async () => {
        if (!profile) return;
        setSubmitting(true);

        try {
            const { error } = await supabase
                .from('college_reviews')
                .insert([{
                    user_id: profile.id,
                    college_code: collegeCode,
                    academics_rating: ratings.academics || 1,
                    placement_rating: ratings.placement || 1,
                    campus_rating: ratings.campus || 1,
                    infrastructure_rating: ratings.infrastructure || 1,
                    roi_rating: ratings.roi || 1,
                    overall_rating: parseFloat(overallRating),
                    best_thing: textReviews.best || 'N/A',
                    reality_check: textReviews.worst || 'N/A',
                    is_verified_student: isVerified
                }]);

            if (error) throw error;

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            toastError('Review Failed', err.message || 'Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const categories = [
        { key: 'academics', label: 'Academics & Faculty', icon: GraduationCap, color: 'text-blue-500' },
        { key: 'placement', label: 'Placement Reality', icon: Briefcase, color: 'text-emerald-500' },
        { key: 'campus', label: 'Campus Life & Events', icon: HeartHandshake, color: 'text-purple-500' },
        { key: 'infrastructure', label: 'Infrastructure & Labs', icon: Building2, color: 'text-orange-500' },
        { key: 'roi', label: 'Return on Investment (ROI)', icon: Zap, color: 'text-yellow-500' },
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Rate & Review</h2>
                            <p className="text-sm text-slate-500 font-medium truncate max-w-sm">{collegeName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full flex items-center justify-center transition-colors shadow-sm"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="overflow-y-auto p-6 flex-1 bg-slate-50/50">
                        {step === 1 ? (
                            <div className="space-y-6">
                                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-6 flex items-start gap-4">
                                    <div className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-md shrink-0">
                                        {overallRating}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">Overall Rating</h3>
                                        <p className="text-sm text-slate-500">Provide specific ratings across 5 key dimensions to help other students.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {categories.map((cat) => {
                                        const Icon = cat.icon;
                                        return (
                                            <div key={cat.key} className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg bg-slate-50 ${cat.color}`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-bold text-slate-700 text-sm md:text-base">{cat.label}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            onClick={() => handleRating(cat.key as any, star)}
                                                            className={`p-1 transition-transform hover:scale-110`}
                                                        >
                                                            <Star className={`w-6 h-6 ${ratings[cat.key as keyof typeof ratings] >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 fill-slate-50'}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                                    <label className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                        <ThumbsUp className="w-5 h-5 text-emerald-600" /> The Best Thing (What I Loved)
                                    </label>
                                    <textarea
                                        value={textReviews.best}
                                        onChange={(e) => setTextReviews(p => ({ ...p, best: e.target.value }))}
                                        placeholder="e.g., The coding culture here is incredible, seniors help you so much..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[100px] leading-relaxed"
                                    />
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                                    <label className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-rose-600" /> The Reality Check (Watch Out For)
                                    </label>
                                    <textarea
                                        value={textReviews.worst}
                                        onChange={(e) => setTextReviews(p => ({ ...p, worst: e.target.value }))}
                                        placeholder="e.g., Hostel food can be repetitive, and the attendance rule is strictly enforced..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all min-h-[100px] leading-relaxed"
                                    />
                                </div>

                                {/* Verification Badge Toggle */}
                                <div onClick={() => setIsVerified(!isVerified)} className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${isVerified ? 'bg-sky-50 border-sky-400' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isVerified ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                        {isVerified && <Zap className="w-3.5 h-3.5 fill-white" />}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-sm ${isVerified ? 'text-sky-800' : 'text-slate-700'}`}>Claim "Verified Student" Badge</h4>
                                        <p className="text-xs text-slate-500">I confirm I am currently admitted to or an alumnus of this specific college.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-5 border-t border-slate-100 bg-white flex justify-between items-center z-10 shrink-0">
                        {step === 1 ? (
                            <>
                                <button onClick={onClose} className="text-slate-500 font-bold px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                                <button
                                    onClick={handleNext}
                                    disabled={Object.values(ratings).some(v => v === 0)}
                                    className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next Step →
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handlePrev} className="text-slate-500 font-bold px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors">← Back</button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !textReviews.best || !textReviews.worst}
                                    className="bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting ? 'Submitting...' : 'Post Review'}
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
