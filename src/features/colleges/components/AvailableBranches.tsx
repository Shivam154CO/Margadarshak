import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronUp, ChevronDown } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-wrap justify-between items-center mb-4 sm:mb-6 gap-2">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Available Branches</h3>
        <span className="text-xs sm:text-sm text-gray-600">{branches.length} branches available</span>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {branches.map((branch, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 sm:p-6 rounded-xl border transition-all duration-300 cursor-pointer ${branch.branch_name === selectedBranch
              ? 'border-blue-500 bg-blue-50/50 shadow-md'
              : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:shadow-sm'
              }`}
            onClick={() => onBranchSelect(branch.branch_name)}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4 gap-2">
              <div className="min-w-0">
                <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-1 break-words">{branch.branch_name}</h4>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <span>Intake: {branch.total_intake} seats</span>
                  {branch.branch_name === selectedBranch && (
                    <span className="text-blue-600 font-medium">✓ Selected</span>
                  )}
                </div>
              </div>
              <div className="flex-1 w-full sm:w-auto">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 sm:text-right">Seat Distribution (Category-wise)</div>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:justify-end">
                  {branch.categories && branch.categories.map((category: any, catIndex: number) => (
                    <div key={catIndex} className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">
                        {category.category}: {category.seats}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {branch.categories && branch.categories.length > 0 && branch.branch_name === selectedBranch && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    className="flex items-center space-x-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        <span>Collapse</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        <span>Expand Details</span>
                      </>
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100 mt-4">
                        {branch.categories.map((category, catIndex) => (
                          <div key={catIndex} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-2.5 h-2.5 rounded-full shadow-sm"
                                style={{ backgroundColor: category.color }}
                              />
                              <div>
                                <p className="text-xs font-black text-slate-900 leading-none">{category.category}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Category</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-slate-900 leading-none">{category.seats} Seats</p>
                              <p className="text-[10px] font-bold text-indigo-600 mt-1">({category.percentage.toFixed(1)}%)</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {branches.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No branch information available</p>
        </div>
      )}
    </div>
  );
};
