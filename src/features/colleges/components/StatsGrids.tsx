import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Award, Briefcase } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface InfrastructureItem {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}

interface InfrastructureGridProps {
  items: InfrastructureItem[];
}

export const InfrastructureGrid: React.FC<InfrastructureGridProps> = ({ items }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
    {items.map((item, index) => {
      const Icon = item.icon;
      return (
        <motion.div
          key={index}
          whileHover={{ y: -5 }}
          className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 shadow-sm flex flex-col items-center text-center group transition-all duration-300"
        >
          <div className={`w-12 h-12 ${item.bgColor} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${item.color}`} />
          </div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{item.label}</p>
          <p className="text-sm font-bold text-gray-900">{item.value}</p>
        </motion.div>
      );
    })}
  </div>
);

interface PlacementStatsProps {
  stats: {
    placementRate: number;
    averagePackage: number;
    highestPackage: number;
    topRecruiters: string[];
    placementContact: string;
    industryTieUps?: number;
    internshipRate?: number;
  };
}

export const PlacementStats: React.FC<PlacementStatsProps> = ({ stats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <TrendingUp className="w-16 h-16" />
        </div>
        <p className="text-sm font-medium opacity-80 uppercase tracking-wider mb-2">Placement Rate</p>
        <p className="text-4xl font-black mb-1">{stats.placementRate}%</p>
        <div className="w-full h-1.5 bg-white/20 rounded-full mt-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.placementRate}%` }}
            className="h-full bg-white rounded-full"
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <DollarSign className="w-16 h-16" />
        </div>
        <p className="text-sm font-medium opacity-80 uppercase tracking-wider mb-2">Average Package</p>
        <p className="text-4xl font-black mb-1">₹{stats.averagePackage} LPA</p>
        <p className="text-xs opacity-70 mt-4">Median annual package</p>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-2xl text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Award className="w-16 h-16" />
        </div>
        <p className="text-sm font-medium opacity-80 uppercase tracking-wider mb-2">Highest Package</p>
        <p className="text-4xl font-black mb-1">₹{stats.highestPackage} LPA</p>
        <p className="text-xs opacity-70 mt-4">Top placement offer</p>
      </div>

      <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Briefcase className="w-16 h-16" />
        </div>
        <p className="text-sm font-medium opacity-80 uppercase tracking-wider mb-2">Internship Rate</p>
        <p className="text-4xl font-black mb-1">{stats.internshipRate || 0}%</p>
        <p className="text-xs opacity-70 mt-4">Pre-placement offers</p>
      </div>
    </div>

    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm">
      <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-indigo-600" /> Top Recruiters
      </h4>
      <div className="flex flex-wrap gap-3">
        {stats.topRecruiters.map((recruiter, i) => (
          <div key={i} className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
            {recruiter}
          </div>
        ))}
      </div>
    </div>
  </div>
);
