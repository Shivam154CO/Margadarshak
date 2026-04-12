import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';
import type { BranchInfo } from '@/types/college';

interface AvailableBranchesProps {
  branches: BranchInfo[];
  selectedBranch?: string;
  onBranchSelect: (branchName: string) => void;
  collegeCode?: string;
}

export const AvailableBranches: React.FC<AvailableBranchesProps> = ({
  branches,
  selectedBranch,
  onBranchSelect,
}) => {
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);

  const toggleExpand = (e: React.MouseEvent, branchName: string) => {
    e.stopPropagation();
    setExpandedBranch(prev => (prev === branchName ? null : branchName));
  };

  if (branches.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="text-center py-10">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 text-sm font-medium">No branch information available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Available Branches</h3>
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          {branches.length} Branches
        </span>
      </div>

      {/* Branch Rows */}
      <div className="divide-y divide-slate-100">
        {branches.map((branch, index) => {
          const isSelected = branch.branch_name === selectedBranch;
          const isExpanded = expandedBranch === branch.branch_name;
          const totalSeats = branch.total_intake || branch.seats || 0;

          return (
            <div key={index}>
              {/* Branch Row */}
              <div
                className={`flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4 cursor-pointer transition-colors duration-200 ${
                  isSelected ? 'bg-indigo-50/60' : 'hover:bg-slate-50'
                }`}
                onClick={() => onBranchSelect(branch.branch_name)}
              >
                {/* Left: Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-bold text-sm leading-snug break-words ${isSelected ? 'text-indigo-800' : 'text-slate-900'}`}>
                      {branch.branch_name}
                    </p>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-bold uppercase tracking-wide">
                        <CheckCircle2 className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{totalSeats} seats total</p>
                </div>

                {/* Right: Summary pills + expand */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {branch.categories && branch.categories.slice(0, 3).map((cat, ci) => (
                    <span key={ci} className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700 whitespace-nowrap">
                      {cat.category}: <span className="text-slate-900 font-bold">{cat.seats}</span>
                    </span>
                  ))}
                  {branch.categories && branch.categories.length > 3 && (
                    <span className="text-[11px] text-slate-500 font-bold">+{branch.categories.length - 3} more</span>
                  )}

                  {branch.categories && branch.categories.length > 0 && (
                    <button
                      onClick={(e) => toggleExpand(e, branch.branch_name)}
                      className="ml-2 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all whitespace-nowrap"
                    >
                      {isExpanded ? (
                        <><ChevronUp className="w-3.5 h-3.5" /> Collapse</>
                      ) : (
                        <><ChevronDown className="w-3.5 h-3.5" /> Details</>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Detail Panel */}
              <AnimatePresence>
                {isExpanded && branch.categories && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-3 bg-slate-50 border-t border-slate-200">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                        Category-wise Seat Distribution — {branch.branch_name}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {branch.categories.map((cat, ci) => (
                          <motion.div
                            key={ci}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: ci * 0.03 }}
                            className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm"
                          >
                            <div>
                              <p className="text-xs font-black text-slate-900 leading-none">{cat.category}</p>
                              <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Category</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-slate-900 leading-none">{cat.seats}</p>
                              <p className="text-[10px] font-bold text-indigo-700 mt-0.5">{cat.percentage.toFixed(1)}%</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Mini bar chart */}
                      <div className="mt-4 space-y-1.5">
                        {branch.categories.map((cat, ci) => (
                          <div key={ci} className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-600 w-14 shrink-0 text-right">{cat.category}</span>
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${cat.percentage}%` }}
                                transition={{ duration: 0.5, delay: ci * 0.04 }}
                                className="h-full bg-indigo-600 rounded-full"
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 w-8 shrink-0">{cat.seats}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
