import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageSquare, ThumbsUp, CheckCircle2, Search, AlertTriangle, Heart, Star, Info, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import ReviewModal from '@/features/community/components/ReviewModal';
import type { UserProfile } from '@/types/user';

interface Reply {
    id: string;
    review_id: string;
    user_id: string;
    content: string;
    created_at: string;
    users?: {
        name: string;
    };
}

interface Review {
    id: string;
    user_id: string;
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
    const { warning, success, error: toastError } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [replies, setReplies] = useState<Record<string, Reply[]>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [showReplyFor, setShowReplyFor] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEditReview, setCurrentEditReview] = useState<Review | null>(null);

    useEffect(() => {
        fetchReviews();
        fetchReplies();
        
        const getSessionData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setCurrentUserId(session.user.id);
                const { data } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                setProfile(data);
            }
        };
        getSessionData();

        const reviewsChannel = supabase
            .channel('public:college_reviews')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'college_reviews' },
                (payload: any) => {
                    if (payload.eventType === 'UPDATE') {
                        setReviews((prev: Review[]) =>
                            prev.map((r: Review) =>
                                r.id === payload.new.id
                                    ? { ...r, ...payload.new }
                                    : r
                            )
                        );
                    } else if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
                        fetchReviews();
                    }
                }
            )
            .subscribe();

        const repliesChannel = supabase
            .channel('public:college_replies')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'college_replies' },
                () => {
                    fetchReplies();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(reviewsChannel);
            supabase.removeChannel(repliesChannel);
        };
    }, []);

    const fetchReviews = async () => {
        try {
            const { data, error } = await supabase
                .from('college_reviews_with_profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReviews(data || []);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchReplies = async () => {
        try {
            const { data, error } = await supabase
                .from('college_replies')
                .select(`
                    *,
                    users:user_id (name)
                `)
                .order('created_at', { ascending: true });

            if (error) throw error;

            const grouped: Record<string, Reply[]> = {};
            data?.forEach((r: any) => {
                if (!grouped[r.review_id]) grouped[r.review_id] = [];
                grouped[r.review_id].push(r);
            });
            setReplies(grouped);
        } catch (err) {
            console.error('Error fetching replies:', err);
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
            const upvotes = currentUpvotes || [];
            const hasUpvoted = upvotes.includes(userId);
            const newUpvotes = hasUpvoted
                ? upvotes.filter((id: string) => id !== userId)
                : [...upvotes, userId];

            const { error } = await supabase
                .from('college_reviews')
                .update({ upvotes: newUpvotes })
                .eq('id', reviewId);

            if (error) throw error;

            setReviews((prev: Review[]) => prev.map((r: Review) => r.id === reviewId ? { ...r, upvotes: newUpvotes } : r));
        } catch (err) {
            console.error('Upvote failed:', err);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;
        try {
            const { error } = await supabase
                .from('college_reviews')
                .delete()
                .eq('id', reviewId);
            
            if (error) throw error;
            success("Deleted", "Your review has been removed.");
            setReviews((prev: Review[]) => prev.filter((r: Review) => r.id !== reviewId));
        } catch (err: any) {
            toastError("Delete Failed", err.message);
        }
    };

    const handleEditReview = (review: Review) => {
        setCurrentEditReview(review);
        setIsModalOpen(true);
    };

    const handlePostReply = async (reviewId: string) => {
        if (!replyContent.trim()) return;
        setSubmittingReply(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                warning("Login Required", "Sign in to join the conversation.");
                return;
            }

            const { error } = await supabase
                .from('college_replies')
                .insert([{
                    review_id: reviewId,
                    user_id: session.user.id,
                    content: replyContent.trim()
                }]);

            if (error) throw error;
            setReplyContent('');
            setShowReplyFor(null);
            success("Posted", "Your reply is live.");
            fetchReplies();
        } catch (err: any) {
            toastError("Reply Failed", err.message);
        } finally {
            setSubmittingReply(false);
        }
    };

    const filteredReviews = useMemo(() => {
        return reviews.filter((r: Review) =>
            r.college_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.best_thing.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.reality_check.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [reviews, searchTerm]);

    const stats = useMemo(() => {
        const total = reviews.length;
        const verified = reviews.filter((r: Review) => r.is_verified_student).length;
        const avgRating = total > 0 ? (reviews.reduce((acc: number, r: Review) => acc + (r.overall_rating || 0), 0) / total).toFixed(1) : "0.0";
        const totalUpvotes = (reviews || []).reduce((acc: number, r: Review) => acc + (r.upvotes?.length || 0), 0);
        return { total, verified, avgRating, totalUpvotes };
    }, [reviews]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar activeTab="community" />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
                {/* Header Segment */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Community Voice</h1>
                    <p className="text-sm text-slate-500 mt-1 uppercase tracking-[0.1em] font-black opacity-50"> Maharashtra Campus Hub </p>
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
                            placeholder="Search by college or branch..."
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
                            <div className="text-center py-20 text-slate-400 text-xs font-black uppercase tracking-[0.2em] animate-pulse italic">Syncing Records...</div>
                        ) : filteredReviews.length > 0 ? (
                            filteredReviews.map((review: Review, idx: number) => {
                                const ratingColor = review.overall_rating >= 4 ? "border-l-emerald-500" : review.overall_rating >= 3 ? "border-l-amber-500" : "border-l-rose-500";
                                const userHasUpvoted = currentUserId && review.upvotes?.includes(currentUserId);
                                const isOwner = currentUserId === review.user_id;

                                return (
                                    <motion.div
                                        key={review.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: Math.min(idx * 0.05, 0.4) }}
                                        className={`bg-white rounded-xl border border-slate-200 border-l-4 ${ratingColor} p-6 shadow-sm hover:shadow-md transition-all group/card overflow-hidden`}
                                    >
                                        {/* Card Header */}
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center shrink-0 border border-slate-100">
                                                    <span className="text-xs font-black text-slate-400 tracking-tighter uppercase">{review.reviewer_name?.slice(0, 2) || 'S'}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-bold text-slate-900 text-sm">{review.reviewer_name || 'Anonymous Student'}</h3>
                                                        {review.is_verified_student && (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50/50 text-indigo-600 text-[9px] font-black uppercase tracking-wider border border-indigo-100/30">
                                                                <Check className="w-2.5 h-2.5" /> Verified
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1.5 uppercase tracking-wide">
                                                        <span>{review.college_code}</span>
                                                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                        <span>{new Date(review.created_at).toLocaleDateString("en-IN", { month: 'short', year: 'numeric' })}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start shrink-0">
                                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50/50 border border-slate-100 rounded-lg">
                                                    <Star className={`w-3 h-3 fill-current ${review.overall_rating >= 4 ? 'text-emerald-500' : 'text-amber-500'}`} />
                                                    <span className="font-black text-slate-700 text-sm tabular-nums">{review.overall_rating.toFixed(1)}</span>
                                                </div>
                                                {isOwner && (
                                                    <div className="flex gap-2 mt-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => handleEditReview(review)}
                                                            className="text-[9px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest"
                                                        >Edit</button>
                                                        <span className="text-slate-200">|</span>
                                                        <button 
                                                            onClick={() => handleDeleteReview(review.id)}
                                                            className="text-[9px] font-black text-slate-400 hover:text-rose-600 uppercase tracking-widest"
                                                        >Delete</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Ratings Dashboard */}
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
                                            {[
                                                { label: "Academics", value: review.academics_rating },
                                                { label: "Placement", value: review.placement_rating },
                                                { label: "Campus", value: review.campus_rating },
                                                { label: "Infras", value: review.infrastructure_rating },
                                                { label: "ROI", value: review.roi_rating }
                                            ].map((m: any) => (
                                                <div key={m.label} className="bg-slate-50/30 rounded-lg p-2 border border-slate-100/50 text-center">
                                                    <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{m.label}</div>
                                                    <div className="text-xs font-black text-slate-600">{m.value}/5</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Content Segments - Minimalist */}
                                        <div className="space-y-3 mb-6">
                                            <div className="flex gap-3">
                                                <div className="mt-1"><ThumbsUp className="w-3.5 h-3.5 text-emerald-500/50" /></div>
                                                <div className="min-w-0">
                                                    <p className="text-slate-600 text-[13px] font-medium leading-relaxed leading-snug">{review.best_thing}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <div className="mt-1"><AlertTriangle className="w-3.5 h-3.5 text-rose-500/50" /></div>
                                                <div className="min-w-0">
                                                    <p className="text-slate-600 text-[13px] font-medium leading-relaxed leading-snug">{review.reality_check}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleUpvote(review.id, review.upvotes)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                                                        userHasUpvoted
                                                            ? 'text-indigo-600 font-black'
                                                            : 'text-slate-400 font-bold hover:text-slate-600'
                                                    }`}
                                                >
                                                    <Heart className={`w-3.5 h-3.5 ${userHasUpvoted ? 'fill-current' : ''}`} />
                                                    <span className="text-[10px] uppercase tracking-wider">{review.upvotes?.length || 0}</span>
                                                </button>
                                                <button
                                                    onClick={() => setShowReplyFor(showReplyFor === review.id ? null : review.id)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                                                        showReplyFor === review.id ? 'text-indigo-600 font-black' : 'text-slate-400 font-bold hover:text-slate-600'
                                                    }`}
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] uppercase tracking-wider">{replies[review.id]?.length || 0}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Nested Replies - Minimalist & Reactive */}
                                        <AnimatePresence>
                                            {showReplyFor === review.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="mt-4 pt-4 border-t border-slate-50 space-y-4"
                                                >
                                                    {/* Reply List */}
                                                    <div className="space-y-3 pl-8">
                                                        {replies[review.id]?.map((reply: Reply) => (
                                                            <div key={reply.id} className="flex gap-3">
                                                                <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                                                    <span className="text-[8px] font-black text-slate-300 uppercase">{reply.users?.name?.slice(0, 1) || 'A'}</span>
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] font-black text-slate-700">{reply.users?.name || 'Anonymous'}</span>
                                                                        <span className="text-[8px] font-bold text-slate-300 uppercase">{new Date(reply.created_at).toLocaleDateString()}</span>
                                                                    </div>
                                                                    <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">{reply.content}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Reply Input */}
                                                    <div className="flex gap-3 pl-8">
                                                        <input 
                                                            type="text"
                                                            value={replyContent}
                                                            onChange={(e) => setReplyContent(e.target.value)}
                                                            placeholder="Write a reply..."
                                                            className="flex-grow bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                                                            onKeyDown={(e) => e.key === 'Enter' && handlePostReply(review.id)}
                                                        />
                                                        <button 
                                                            disabled={submittingReply || !replyContent.trim()}
                                                            onClick={() => handlePostReply(review.id)}
                                                            className="text-[10px] font-black text-indigo-600 uppercase tracking-widest disabled:opacity-30"
                                                        >Post</button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="text-center py-24 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <Info className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No community matching found</p>
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="mt-4 text-indigo-600 font-black text-[10px] uppercase hover:underline underline-offset-4 tracking-[0.2em]"
                                >
                                    Clear Global Search
                                </button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {profile && (
                <ReviewModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setCurrentEditReview(null);
                    }}
                    collegeCode={currentEditReview?.college_code || ''}
                    collegeName={currentEditReview?.college_code || 'Update Review'}
                    profile={profile}
                    onSuccess={fetchReviews}
                    initialReview={currentEditReview}
                />
            )}

            <Footer />
        </div>
    );
}
