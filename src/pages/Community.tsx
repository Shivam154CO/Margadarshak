import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, ThumbsUp, CheckCircle2, Search, AlertTriangle, Heart, Star, Info, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Review {
    id: string;
    created_at: string;
    college_code: string;
    academics_rating: number;
    placement_rating: number;
    campus_rating: number;
    infrastructure_rating: number;
    roi_rating: number;
    overall_rating: number;
    best_thing: string;
    reality_check: string;
    is_verified_student: boolean;
    upvotes: string[];
    reviewer_name: string;
    reviewer_avatar: string;
}

export default function Community() {
    const { info, warning } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchReviews();
        
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setCurrentUserId(session?.user?.id || null);
        };
        getSession();

        const channel = supabase
            .channel('public:college_reviews')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'college_reviews' },
                (payload) => {
                    if (payload.eventType === 'UPDATE') {
                        setReviews((prev) =>
                            prev.map((r) =>
                                r.id === payload.new.id
                                    ? { ...r, upvotes: payload.new.upvotes }
                                    : r
                            )
                        );
                    } else if (payload.eventType === 'INSERT') {
                        fetchReviews();
                    } else if (payload.eventType === 'DELETE') {
                        setReviews((prev) => prev.filter((r) => r.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchReviews = async () => {
        try {
            const { data, error } = await supabase
                .from('college_reviews_with_profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching reviews:', error);
            } else {
                setReviews(data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpvote = async (reviewId: string, currentUpvotes: string[]) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                warning("Login Required", "Please log in to upvote reviews.");
                return;
            }

            const userId = session.user.id;
            const hasUpvoted = currentUpvotes.includes(userId);
            const newUpvotes = hasUpvoted
                ? currentUpvotes.filter(id => id !== userId)
                : [...currentUpvotes, userId];

            const { error } = await supabase
                .from('college_reviews')
                .update({ upvotes: newUpvotes })
                .eq('id', reviewId);

            if (error) throw error;

            setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, upvotes: newUpvotes } : r));
        } catch (err) {
            console.error('Upvote failed:', err);
        }
    };

    const filteredReviews = useMemo(() => {
        return reviews.filter(r =>
            r.college_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.best_thing.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.reality_check.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [reviews, searchTerm]);

    const stats = useMemo(() => {
        const total = reviews.length;
        const verified = reviews.filter(r => r.is_verified_student).length;
        const avgRating = total > 0 ? (reviews.reduce((acc, r) => acc + (r.overall_rating || 0), 0) / total).toFixed(1) : "0.0";
        const totalUpvotes = (reviews || []).reduce((acc, r) => acc + (r.upvotes?.length || 0), 0);
        return { total, verified, avgRating, totalUpvotes };
    }, [reviews]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar activeTab="community" />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
                {/* Header Segment */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Community Voice</h1>
                    <p className="text-sm text-slate-500 mt-1">Raw, unfiltered feedback from students across Maharashtra campuses</p>
                </div>

                {/* Stats Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                    {[
                        { label: "Total Reviews", value: stats.total, color: "border-l-slate-400", icon: MessageSquare },
                        { label: "Verified Students", value: stats.verified, color: "border-l-indigo-500", icon: CheckCircle2 },
                        { label: "Avg. Community Rating", value: `${stats.avgRating}/5`, color: "border-l-amber-500", icon: Star },
                        { label: "Helpful Contributions", value: stats.totalUpvotes, color: "border-l-emerald-500", icon: Heart },
                    ].map(s => (
                        <div key={s.label} className={`bg-white rounded-xl border border-slate-200 border-l-4 ${s.color} p-4 shadow-sm group hover:-translate-y-0.5 transition-transform`}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="text-2xl font-bold text-slate-800 tabular-nums">{s.value}</div>
                                <s.icon className={`w-4 h-4 opacity-20 group-hover:opacity-100 transition-opacity ${s.color.replace('border-l-', 'text-')}`} />
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Search & Action Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find reviews by college, branch, or keywords..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium transition-all"
                        />
                    </div>
                </div>

                {/* Reviews Feed */}
                <div className="space-y-6">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <div className="text-center py-20 text-slate-400 text-sm font-bold animate-pulse uppercase tracking-widest italic">Syncing with Community Records...</div>
                        ) : filteredReviews.length > 0 ? (
                            filteredReviews.map((review, idx) => {
                                const ratingColor = review.overall_rating >= 4 ? "border-l-emerald-500" : review.overall_rating >= 3 ? "border-l-amber-500" : "border-l-rose-500";
                                const userHasUpvoted = currentUserId && review.upvotes?.includes(currentUserId);
                                
                                return (
                                    <motion.div
                                        key={review.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(idx * 0.05, 0.4) }}
                                        className={`bg-white rounded-xl border border-slate-200 border-l-4 ${ratingColor} p-6 shadow-sm hover:shadow-md transition-all hover:border-r-slate-200`}
                                    >
                                        {/* Card Header */}
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0 border border-slate-200">
                                                    <span className="text-sm font-black text-slate-600 tracking-tighter uppercase">{review.reviewer_name?.slice(0, 2) || 'S'}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-bold text-slate-900 text-base">{review.reviewer_name || 'Anonymous Student'}</h3>
                                                        {review.is_verified_student && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                                                                <Check className="w-3 h-3" /> Verified
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-semibold text-slate-400 mt-1 flex items-center gap-1.5">
                                                        <span>Targeting</span>
                                                        <span className="text-indigo-600 font-bold px-1.5 py-0.5 bg-indigo-50 rounded border border-indigo-100/50">{review.college_code}</span>
                                                        <span>• {new Date(review.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end shrink-0">
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                                                    <Star className={`w-3.5 h-3.5 fill-current ${review.overall_rating >= 4 ? 'text-emerald-500' : 'text-amber-500'}`} />
                                                    <span className="font-black text-slate-800 text-base tabular-nums">{review.overall_rating.toFixed(1)}</span>
                                                </div>
                                                <span className="text-[9px] font-black text-slate-300 uppercase mt-1 tracking-widest">Global Rating</span>
                                            </div>
                                        </div>

                                        {/* Ratings Dashboard */}
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                                            {[
                                                { label: "Academics", value: review.academics_rating },
                                                { label: "Placement", value: review.placement_rating },
                                                { label: "Campus Life", value: review.campus_rating },
                                                { label: "Infrastructure", value: review.infrastructure_rating },
                                                { label: "Return on Inv", value: review.roi_rating }
                                            ].map(m => (
                                                <div key={m.label} className="bg-slate-50/50 rounded-lg p-2.5 border border-slate-100 text-center">
                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{m.label}</div>
                                                    <div className="text-sm font-black text-slate-700">{m.value}/5</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Content Segments */}
                                        <div className="space-y-4 mb-6">
                                            <div className="bg-emerald-50 items-start border border-emerald-100 rounded-xl p-4 flex gap-4">
                                                <ThumbsUp className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                                <div className="min-w-0">
                                                    <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] mb-1.5">Primary Advantages</h4>
                                                    <p className="text-slate-700 text-sm font-medium leading-relaxed">{review.best_thing}</p>
                                                </div>
                                            </div>
                                            <div className="bg-rose-50 items-start border border-rose-100 rounded-xl p-4 flex gap-4">
                                                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                                <div className="min-w-0">
                                                    <h4 className="text-[10px] font-black text-rose-700 uppercase tracking-[0.2em] mb-1.5">Reality Assessment</h4>
                                                    <p className="text-slate-700 text-sm font-medium leading-relaxed">{review.reality_check}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-slate-100">
                                            <button
                                                onClick={() => handleUpvote(review.id, review.upvotes || [])}
                                                className={`flex items-center gap-2.5 px-4 py-2 rounded-lg transition-all border ${
                                                    userHasUpvoted
                                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                }`}
                                            >
                                                <Heart className={`w-4 h-4 ${(review.upvotes?.length > 0 || userHasUpvoted) ? 'fill-current' : ''}`} />
                                                <span className="font-bold text-xs uppercase tracking-wider">Helpful ({review.upvotes?.length || 0})</span>
                                            </button>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => info('Coming Soon', 'Reply threads will be available in the next release.')}
                                                    className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 tracking-widest transition-colors"
                                                >
                                                    <MessageSquare className="w-4 h-4" /> Reply
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="text-center py-24 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <Info className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No community matching found</p>
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="mt-4 text-indigo-600 font-black text-xs uppercase hover:underline underline-offset-4"
                                >
                                    Clear Global Search
                                </button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <Footer />
        </div>
    );
}
