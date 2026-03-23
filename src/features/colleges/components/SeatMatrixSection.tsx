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
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Seat Matrix - Category Wise</h3>
        <div className="text-center py-8">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Seat matrix data for {branchName} will be loaded soon</p>
        </div>
      </div>
    );
  }

  const totalSeats = totalIntake || seatMatrix.reduce((sum, cat) => sum + cat.seats, 0);
 
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h3 className="text-xl font-bold text-gray-900">Seat Matrix - {branchName}</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>Collapse All</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              <span>View All Categories</span>
            </>
          )}
        </button>
      </div>

      <div className="mb-8">
        <div className="flex justify-between mb-4">
          <div>
            <h4 className="font-semibold text-gray-900">Branch Intake: {totalSeats} seats</h4>
            <p className="text-sm text-gray-600">Category distribution for {branchName}</p>
          </div>
          {userCategory && (
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">Your Category: {userCategory}</div>
              <div className="text-sm text-gray-500">Highlighted below</div>
            </div>
          )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {seatMatrix.map((category, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`p-4 rounded-xl border ${category.category === userCategory ? 'border-2 border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-900">{category.category}</span>
                      <span className="text-lg font-bold" style={{ color: category.color }}>
                        {category.seats}
                      </span>
                    </div>
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${category.percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                      <span>{category.percentage.toFixed(1)}%</span>
                      <span>{category.seats} seats</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
