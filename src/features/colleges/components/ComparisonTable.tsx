import React from 'react';
import type { College, ComparisonMetric } from '../types/comparison';
import { COMPARISON_METRICS } from '../types/comparison';

interface ComparisonTableProps {
  selectedColleges: College[];
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ selectedColleges }) => {
  // Format value for display
  const formatValue = (value: any, metric: ComparisonMetric): string => {
    if (value === undefined || value === null) return 'N/A';
    if (metric.key === 'fees') return `₹${Number(value).toLocaleString()}`;
    return `${value}${metric.unit || ''}`;
  };

  // Get comparison winner for each metric
  const getMetricWinner = (metric: ComparisonMetric): College | null => {
    if (selectedColleges.length < 2) return null;
    let winner = selectedColleges[0];
    let bestValue = Number(winner[metric.key]) || 0;

    selectedColleges.forEach(college => {
      const value = Number(college[metric.key]) || 0;
      if (metric.higherIsBetter ? value > bestValue : value < bestValue) {
        bestValue = value;
        winner = college;
      }
    });
    return winner;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Detailed Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-medium text-gray-700">Metric</th>
              {selectedColleges.map((college) => (
                <th key={college.college_code} className="text-center py-2 font-medium text-gray-700">
                  {college.college_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_METRICS.map((metric) => (
              <tr key={metric.key} className="border-b border-gray-100">
                <td className="py-3 font-medium text-gray-900">{metric.label}</td>
                {selectedColleges.map((college) => {
                  const value = college[metric.key];
                  const isWinner = getMetricWinner(metric)?.college_code === college.college_code;
                  return (
                    <td 
                      key={college.college_code} 
                      className={`py-3 text-center ${isWinner ? 'bg-yellow-50 font-bold border-x border-yellow-200' : ''}`}
                    >
                      {formatValue(value, metric)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
