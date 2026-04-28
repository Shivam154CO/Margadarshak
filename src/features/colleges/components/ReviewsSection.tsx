import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Star, CheckCircle, ThumbsUp, AlertTriangle } from 'lucide-react';

export interface Review {
  id: string;
  user_id?: string;
  reviewer_name: string;
  created_at: string;
  overall_rating: number;
  academics_rating: number;
  placement_rating: number;
  campus_rating: number;
  infrastructure_rating: number;
  roi_rating: number;
  best_thing: string;
  reality_check: string;
  is_verified_student: boolean;
  upvotes?: string[];
}

interface ReviewsSectionProps {
  reviews: Review[];
  isLoading: boolean;
  currentUserId?: string;
  onOpenModal: () => void;
  onEditReview?: (review: Review) => void;
  onDeleteReview?: (id: string) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  isLoading,
  currentUserId,
  onOpenModal,
  onEditReview,
  onDeleteReview,
}) => {
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.overall_rating, 0) / reviews.length
    : 0;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Student Feedback & Reviews</h3>
          <p className="text-gray-600">Real feedback from current and former students</p>
        </div>
        {reviews.length > 0 && (
          <div className="text-right flex-shrink-0">
            <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl">
              <div className="text-3xl font-black text-indigo-700">{averageRating.toFixed(1)}</div>
              <div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-50'}`}
                    />
                  ))}
                </div>
                <div className="text-xs text-indigo-600 font-bold mt-0.5">{reviews.length} reviews</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center mb-8 pb-8 border-b border-gray-100">
        <button
          onClick={onOpenModal}
          className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all flex items-center gap-3 shadow-lg shadow-slate-900/20 active:scale-95"
        >
          <MessageSquare className="w-5 h-5 fill-white/20" />
          <span>Submit Your Own Review</span>
        </button>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-10 font-medium text-slate-500 animate-pulse">Loading verified student reviews...</div>
        ) : reviews.length > 0 ? (
          reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 border border-slate-200 shrink-0">
                    {review.reviewer_name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{review.reviewer_name || 'Alumnus'}</h4>
                      {review.is_verified_student && (
                        <span className="flex items-center gap-1 bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider font-bold">
                          <CheckCircle className="w-3 h-3" /> Verified Student
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg shrink-0">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-sm text-slate-700">{review.overall_rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { label: "Acad", val: review.academics_rating },
                  { label: "Place", val: review.placement_rating },
                  { label: "Life", val: review.campus_rating },
                  { label: "Infra", val: review.infrastructure_rating },
                  { label: "ROI", val: review.roi_rating },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 pl-2.5 py-1 rounded-md">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</span>
                    <span className="text-[11px] font-black text-slate-700">{m.val}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-5">
                <div>
                  <h5 className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                    <ThumbsUp className="w-3.5 h-3.5 text-slate-400" /> The Best Part
                  </h5>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    {review.best_thing}
                  </p>
                </div>
                <div>
                  <h5 className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-slate-400" /> Reality Check
                  </h5>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    {review.reality_check}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors group">
                  <div className="p-1.5 rounded bg-slate-100 group-hover:bg-indigo-50 transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </div>
                  Helpful ({review.upvotes?.length || 0})
                </button>
                
                {currentUserId && review.user_id === currentUserId && (
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => onEditReview && onEditReview(review)}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors"
                    >
                      Edit
                    </button>
                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                    <button 
                      onClick={() => onDeleteReview && onDeleteReview(review.id)}
                      className="text-[10px] font-bold text-rose-500 hover:text-rose-700 uppercase tracking-widest transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <MessageSquare className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="text-lg font-bold text-slate-800 mb-2">No reviews yet</h4>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">Be the first to share your honest experience.</p>
          </div>
        )}
      </div>
    </div>
  );
};
