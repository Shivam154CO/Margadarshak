import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, GraduationCap, Building2, Briefcase, HeartHandshake, Zap, ThumbsUp, AlertTriangle, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { UserProfile } from '../../../types/user';
import { useToast } from '../../../context/ToastContext';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    collegeCode: string;
    collegeName: string;
    profile: UserProfile | null;
    onSuccess: () => void;
    initialReview?: any;
}

export default function ReviewModal({ isOpen, onClose, collegeCode, collegeName, profile, onSuccess, initialReview }: ReviewModalProps) {
    const { error: toastError, success } = useToast();
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

    useEffect(() => {
        if (initialReview && isOpen) {
            setRatings({
                academics: initialReview.academics_rating || 0,
                placement: initialReview.placement_rating || 0,
                campus: initialReview.campus_rating || 0,
                infrastructure: initialReview.infrastructure_rating || 0,
                roi: initialReview.roi_rating || 0,
            });
            setTextReviews({
                best: initialReview.best_thing || '',
                worst: initialReview.reality_check || ''
            });
            setIsVerified(initialReview.is_verified_student || false);
            setStep(1);
        } else if (isOpen) {
            setRatings({ academics: 0, placement: 0, campus: 0, infrastructure: 0, roi: 0 });
            setTextReviews({ best: '', worst: '' });
            setIsVerified(false);
            setStep(1);
        }
    }, [initialReview, isOpen]);

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

        const payload = {
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
        };

        try {
            let error;
            if (initialReview?.id) {
                const { error: updateError } = await supabase
                    .from('college_reviews')
                    .update(payload)
                    .eq('id', initialReview.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('college_reviews')
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;

            success('Success', initialReview ? 'Review updated successfully' : 'Thank you for your feedback!');
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            toastError('Review Failed', err.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const categories = [
        { key: 'academics', label: 'Academics & Faculty', icon: GraduationCap },
        { key: 'placement', label: 'Placement Reality', icon: Briefcase },
        { key: 'campus', label: 'Campus Life & Events', icon: HeartHandshake },
        { key: 'infrastructure', label: 'Infrastructure & Labs', icon: Building2 },
        { key: 'roi', label: 'Return on Investment', icon: Zap },
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
                >
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                        <div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{initialReview ? 'Edit Your Voice' : 'Add Your Voice'}</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{collegeName}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-6 scroll-smooth">
                        {step === 1 ? (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    {categories.map((cat) => (
                                        <div key={cat.key} className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <cat.icon className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{cat.label}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        onClick={() => handleRating(cat.key as any, star)}
                                                        className={`p-1.5 rounded-lg border transition-all ${
                                                            ratings[cat.key as keyof typeof ratings] >= star
                                                                ? 'bg-indigo-600 border-indigo-600'
                                                                : 'bg-white border-slate-200 hover:border-indigo-200'
                                                        }`}
                                                    >
                                                        <Star className={`w-3.5 h-3.5 ${ratings[cat.key as keyof typeof ratings] >= star ? 'text-white fill-current' : 'text-slate-300'}`} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <ThumbsUp className="w-3.5 h-3.5 text-emerald-500/50" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">The Best Part</span>
                                        </div>
                                        <textarea
                                            value={textReviews.best}
                                            onChange={e => setTextReviews(p => ({ ...p, best: e.target.value }))}
                                            placeholder="What makes this college special?"
                                            className="w-full min-h-[100px] p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500/50" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reality Check</span>
                                        </div>
                                        <textarea
                                            value={textReviews.worst}
                                            onChange={e => setTextReviews(p => ({ ...p, worst: e.target.value }))}
                                            placeholder="What should new students be careful about?"
                                            className="w-full min-h-[100px] p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500/20 focus:outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>

                                    <button
                                        onClick={() => setIsVerified(!isVerified)}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                            isVerified ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-100'
                                        }`}
                                    >
                                        <div className="text-left">
                                            <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Verified Student Status</div>
                                            <p className="text-[9px] font-medium text-slate-500 mt-0.5">I confirm that I am/was a student of this institution</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                            isVerified ? 'bg-indigo-600 border-indigo-600 shadow-sm' : 'bg-white border-slate-200'
                                        }`}>
                                            {isVerified && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 shrink-0">
                        {step === 2 && (
                            <button
                                onClick={handlePrev}
                                className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                Back
                            </button>
                        )}
                        <button
                            onClick={step === 1 ? handleNext : handleSubmit}
                            disabled={submitting || (step === 1 && !Object.values(ratings).some(v => v > 0))}
                            className="flex-[2] py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/10 hover:bg-slate-800 disabled:opacity-50 transition-all"
                        >
                            {submitting ? 'Processing...' : (step === 1 ? 'Continue' : initialReview ? 'Update Review' : 'Submit Voice')}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
