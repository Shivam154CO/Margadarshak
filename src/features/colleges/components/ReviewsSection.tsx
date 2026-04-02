import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Star, CheckCircle, ThumbsUp, AlertTriangle } from 'lucide-react';

interface Review {
  id: string;
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
  onOpenModal: () => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  isLoading,
  onOpenModal,
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
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-3"
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
              transition={{ delay: index * 0.1 }}
              className="p-6 sm:p-8 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200/60 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center font-black text-indigo-700 text-xl border border-indigo-200/50 shadow-inner">
                    {review.reviewer_name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900">{review.reviewer_name || 'Alumnus'}</h4>
                      {review.is_verified_student && (
                        <span className="flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200/50 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold">
                          <CheckCircle className="w-3 h-3" /> Verified Student
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/50 px-3 py-1.5 rounded-lg shrink-0">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-amber-700">{review.overall_rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-6">
                {[
                  { label: "Acad", val: review.academics_rating },
                  { label: "Place", val: review.placement_rating },
                  { label: "Life", val: review.campus_rating },
                  { label: "Infra", val: review.infrastructure_rating },
                  { label: "ROI", val: review.roi_rating },
                ].map((m, i) => (
                  <div key={i} className="text-center bg-white border border-slate-100 p-2 rounded-lg">
                    <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">{m.label}</div>
                    <div className="font-black text-slate-700">{m.val}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h5 className="flex items-center gap-2 text-sm font-bold text-emerald-600 uppercase tracking-widest mb-2">
                    <ThumbsUp className="w-4 h-4 text-emerald-500" /> The Best Thing
                  </h5>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed bg-emerald-50/50 block p-4 rounded-xl border border-emerald-100/50">
                    {review.best_thing}
                  </p>
                </div>
                <div>
                  <h5 className="flex items-center gap-2 text-sm font-bold text-rose-600 uppercase tracking-widest mb-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" /> The Reality Check
                  </h5>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed bg-rose-50/50 block p-4 rounded-xl border border-rose-100/50">
                    {review.reality_check}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors group">
                  <div className="p-1.5 rounded bg-slate-100 group-hover:bg-indigo-50 transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </div>
                  Helpful ({review.upvotes?.length || 0})
                </button>
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
            <button
               onClick={onOpenModal}
               className="px-6 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
            >
              Write the First Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
