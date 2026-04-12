import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ChevronUp, ChevronDown } from 'lucide-react';

interface SeatMatrixItem {
  category: string;
  seats: number;
  percentage: number;
  color: string;
}

interface SeatMatrixSectionProps {
  seatMatrix: SeatMatrixItem[];
  branchName: string;
  userCategory?: string;
  totalIntake?: number;
}

export const SeatMatrixSection: React.FC<SeatMatrixSectionProps> = ({
  seatMatrix,
  branchName,
  userCategory,
  totalIntake,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!seatMatrix || seatMatrix.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center">
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Seat Matrix — Category Wise</h3>
        </div>
        <div className="text-center py-8">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Seat matrix for <span className="font-semibold">{branchName}</span> will be available soon</p>
        </div>
      </div>
    );
  }

  const totalSeats = totalIntake || seatMatrix.reduce((sum, cat) => sum + cat.seats, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center">
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Seat Matrix</h3>
            <p className="text-[11px] text-slate-400">{branchName} · {totalSeats} total seats</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {userCategory && (
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
              {userCategory}
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
          >
            {isExpanded ? (
              <><ChevronUp className="w-3.5 h-3.5" /> Collapse</>
            ) : (
              <><ChevronDown className="w-3.5 h-3.5" /> View All</>
            )}
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
        <div className="flex h-3 rounded-full overflow-hidden gap-px">
          {seatMatrix.map((cat, i) => (
            <motion.div
              key={i}
              title={`${cat.category}: ${cat.seats} seats (${cat.percentage.toFixed(1)}%)`}
              initial={{ width: 0 }}
              animate={{ width: `${cat.percentage}%` }}
              transition={{ duration: 0.6, delay: i * 0.04 }}
              className={`h-full first:rounded-l-full last:rounded-r-full ${
                cat.category === userCategory ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
          {seatMatrix.slice(0, 5).map((cat, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${cat.category === userCategory ? 'bg-indigo-600' : 'bg-slate-300'}`} />
              <span className={`text-[10px] font-bold ${cat.category === userCategory ? 'text-indigo-700' : 'text-slate-500'}`}>
                {cat.category}: {cat.seats}
              </span>
            </div>
          ))}
          {seatMatrix.length > 5 && (
            <span className="text-[10px] text-slate-400 font-medium">+{seatMatrix.length - 5} more</span>
          )}
        </div>
      </div>

      {/* Expanded Detail Grid */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {seatMatrix.map((category, index) => {
                  const isUser = category.category === userCategory;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`rounded-xl border px-3 py-2.5 ${
                        isUser
                          ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-black leading-none ${isUser ? 'text-indigo-700' : 'text-slate-800'}`}>
                          {category.category}
                        </span>
                        {isUser && (
                          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wide">You</span>
                        )}
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${category.percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className={`h-full rounded-full ${isUser ? 'bg-indigo-500' : 'bg-slate-400'}`}
                        />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[10px] text-slate-500 font-medium">{category.percentage.toFixed(1)}%</span>
                        <span className={`text-[10px] font-black ${isUser ? 'text-indigo-600' : 'text-slate-700'}`}>{category.seats} seats</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
