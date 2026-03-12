import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare, ThumbsUp, CheckCircle, Search, SlidersHorizontal, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useToast } from '../context/ToastContext';

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
    const [filterOpen, setFilterOpen] = useState(false);

    useEffect(() => {
        fetchReviews();

        // Establish Supabase Realtime connection
        const channel = supabase
            .channel('public:college_reviews')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'college_reviews' },
                (payload) => {
                    if (payload.eventType === 'UPDATE') {
                        // Optimistically update the UI for upvotes without re-fetching everything
                        setReviews((prev) =>
                            prev.map((r) =>
                                r.id === payload.new.id
                                    ? { ...r, upvotes: payload.new.upvotes }
                                    : r
                            )
                        );
                    } else if (payload.eventType === 'INSERT') {
                        // Re-fetch to get the new review + joined profile data
                        fetchReviews();
                    } else if (payload.eventType === 'DELETE') {
                        setReviews((prev) => prev.filter((r) => r.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        // Cleanup the subscription on unmount
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

            // Update local state instantly
            setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, upvotes: newUpvotes } : r));

        } catch (err) {
            console.error('Upvote failed:', err);
        }
    };

    const filteredReviews = reviews.filter(r =>
        r.college_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.best_thing.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reality_check.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        Ikigai <span className="text-indigo-600 relative inline-block">
                            Campus Voice
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-indigo-400 opacity-30" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                            </svg>
                        </span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
                        Raw, unfiltered student feedback. Real insights on placements, campus life, and whether the ROI is actually worth it.
                    </p>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 mb-8 max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search for a college code, branch, or keywords..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition-all placeholder:text-slate-400"
                        />
                    </div>
                    <button
                        onClick={() => setFilterOpen(!filterOpen)}
                        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors ${
                            filterOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        aria-pressed={filterOpen}
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                        <span>{filterOpen ? 'Hide Filters' : 'Filters'}</span>
                    </button>
                </div>

                {/* Global Community Feed */}
                <div className="max-w-4xl mx-auto space-y-6">
                    {loading ? (
                        <div className="text-center py-20 text-slate-500 font-bold animate-pulse">Loading community feed...</div>
                    ) : filteredReviews.length > 0 ? (
                        filteredReviews.map(review => (
                            <div key={review.id} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">

                                {/* Review Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center shadow-inner shrink-0 text-xl font-black text-indigo-700">
                                            {review.reviewer_name?.charAt(0) || 'S'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-slate-800 text-lg">{review.reviewer_name || 'Student'}</h3>
                                                {review.is_verified_student && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-black uppercase tracking-wider border border-sky-200/50">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Verified Student
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium mt-0.5">
                                                Reviewed <span className="text-indigo-600 font-bold">{review.college_code}</span> • {new Date(review.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:self-start bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/50">
                                        <span className="text-amber-500 text-xl leading-none">★</span>
                                        <span className="font-bold text-amber-700 text-lg">{review.overall_rating}</span>
                                    </div>
                                </div>

                                {/* Micro Ratings Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-8">
                                    <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Academics</div>
                                        <div className="font-black text-slate-800">{review.academics_rating}/5</div>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Placement</div>
                                        <div className="font-black text-slate-800">{review.placement_rating}/5</div>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Campus</div>
                                        <div className="font-black text-slate-800">{review.campus_rating}/5</div>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Infra</div>
                                        <div className="font-black text-slate-800">{review.infrastructure_rating}/5</div>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ROI</div>
                                        <div className="font-black text-slate-800">{review.roi_rating}/5</div>
                                    </div>
                                </div>

                                {/* Text Content */}
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <ThumbsUp className="w-5 h-5 text-emerald-600" /> The Best Thing
                                        </h4>
                                        <p className="text-slate-700 leading-relaxed bg-emerald-50/50 p-4 rounded-xl text-sm md:text-base border border-emerald-100/50">
                                            {review.best_thing}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-rose-600" /> The Reality Check
                                        </h4>
                                        <p className="text-slate-700 leading-relaxed bg-rose-50/50 p-4 rounded-xl text-sm md:text-base border border-rose-100/50">
                                            {review.reality_check}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer / Interaction */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => handleUpvote(review.id, review.upvotes)}
                                        className="group flex items-center gap-2 bg-slate-50 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <ThumbsUp className={`w-4 h-4 ${review.upvotes?.length > 0 ? 'text-indigo-600 fill-indigo-100' : 'text-slate-400 group-hover:text-indigo-600 transition-colors'}`} />
                                        <span className="font-bold text-sm text-slate-600 group-hover:text-indigo-700">
                                            Helpful ({review.upvotes?.length || 0})
                                        </span>
                                    </button>
                                    <button className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors px-4 py-2 text-sm font-bold"
                                        onClick={() => info('Replies Coming Soon', 'Threaded replies will be available in a future update.')}
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Reply
                                    </button>
                                </div>

                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
                            <p className="text-slate-500 font-medium mb-4">No reviews found matching your search.</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-indigo-600 font-bold hover:underline"
                            >
                                Clear search
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
