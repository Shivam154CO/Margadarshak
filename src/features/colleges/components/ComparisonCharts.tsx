import React from 'react';
import { Radar, Bar } from 'react-chartjs-2';
import type { College, ComparisonMetric } from '../types/comparison';
import { COMPARISON_METRICS } from '../types/comparison';

interface ComparisonChartsProps {
  selectedColleges: College[];
  view: 'radar' | 'bar';
}

export const ComparisonCharts: React.FC<ComparisonChartsProps> = ({ selectedColleges, view }) => {
  // Generate radar chart data
  const getRadarChartData = () => {
    const labels = COMPARISON_METRICS.map(m => m.label);
    const datasets = selectedColleges.map((college, index) => {
      const colors = [
        'rgba(99, 102, 241, 0.6)',
        'rgba(236, 72, 153, 0.6)',
        'rgba(34, 197, 94, 0.6)',
        'rgba(234, 179, 8, 0.6)',
      ];
      const borderColors = [
        'rgb(99, 102, 241)',
        'rgb(236, 72, 153)',
        'rgb(34, 197, 94)',
        'rgb(234, 179, 8)',
      ];

      return {
        label: college.city ? `${college.college_name} (${college.city})` : college.college_name,
        data: COMPARISON_METRICS.map(metric => {
          const value = Number(college[metric.key]) || 0;
          if (metric.key === 'fees') {
            return Math.max(0, 100 - value / 10000);
          } else if (metric.key === 'nirf_ranking') {
            return Math.max(0, 100 - value);
          } else {
            return Math.min(100, value);
          }
        }),
        backgroundColor: colors[index % colors.length],
        borderColor: borderColors[index % borderColors.length],
        borderWidth: 2,
        pointBackgroundColor: borderColors[index % borderColors.length],
      };
    });

    return { labels, datasets };
  };

  // Generate bar chart data for specific metric
  const getBarChartData = (metric: ComparisonMetric) => {
    const labels = selectedColleges.map(c => c.city ? `${c.college_name} (${c.city})` : c.college_name);
    const data = selectedColleges.map(c => Number(c[metric.key]) || 0);

    return {
      labels,
      datasets: [
        {
          label: metric.label,
          data,
          backgroundColor: selectedColleges.map((_, index) =>
            `hsl(${index * 90}, 70%, 60%)`
          ),
          borderColor: selectedColleges.map((_, index) =>
            `hsl(${index * 90}, 70%, 40%)`
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  if (view === 'radar') {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Radar Comparison</h3>
        <div className="max-w-2xl mx-auto h-[400px]">
          <Radar data={getRadarChartData()} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Bar Comparison</h3>
      <div className="h-[400px]">
        <Bar data={getBarChartData(COMPARISON_METRICS[0])} options={{ maintainAspectRatio: false }} />
      </div>
    </div>
  );
};
