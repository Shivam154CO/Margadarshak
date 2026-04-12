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
          whileHover={{ y: -4 }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center group transition-all duration-300 hover:border-indigo-200 hover:shadow-md"
        >
          <div className="w-11 h-11 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors duration-300">
            <Icon className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
          <p className="text-sm font-bold text-slate-800">{item.value}</p>
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

const PlacementStatBox: React.FC<{
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  showBar?: boolean;
  barValue?: number;
}> = ({ icon: Icon, label, value, sub, showBar, barValue }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 relative overflow-hidden group">
    <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon className="w-16 h-16 text-slate-900" />
    </div>
    <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center mb-4">
      <Icon className="w-5 h-5 text-indigo-500" />
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <p className="text-3xl font-black text-slate-900 mb-1">{value}</p>
    {sub && <p className="text-xs text-slate-400 font-medium">{sub}</p>}
    {showBar && barValue !== undefined && (
      <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barValue}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-indigo-500 rounded-full"
        />
      </div>
    )}
  </div>
);

export const PlacementStats: React.FC<PlacementStatsProps> = ({ stats }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <PlacementStatBox
        icon={TrendingUp}
        label="Placement Rate"
        value={`${stats.placementRate}%`}
        showBar
        barValue={stats.placementRate}
      />
      <PlacementStatBox
        icon={DollarSign}
        label="Average Package"
        value={`₹${stats.averagePackage} LPA`}
        sub="Median annual package"
      />
      <PlacementStatBox
        icon={Award}
        label="Highest Package"
        value={`₹${stats.highestPackage} LPA`}
        sub="Top placement offer"
      />
      <PlacementStatBox
        icon={Briefcase}
        label="Internship Rate"
        value={`${stats.internshipRate || 0}%`}
        sub="Pre-placement offers"
        showBar
        barValue={stats.internshipRate || 0}
      />
    </div>

    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-wide">
        <Briefcase className="w-4 h-4 text-indigo-500" /> Top Recruiters
      </h4>
      <div className="flex flex-wrap gap-2">
        {stats.topRecruiters.map((recruiter, i) => (
          <div key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
            {recruiter}
          </div>
        ))}
      </div>
    </div>
  </div>
);
