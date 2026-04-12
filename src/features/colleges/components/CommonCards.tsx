import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: any;
  color?: string;
  bgColor?: string;
  gradient?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
}) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all duration-300 group"
  >
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 sm:w-11 sm:h-11 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors duration-300">
        <Icon className="w-5 h-5 text-indigo-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] sm:text-xs text-slate-500 font-extrabold uppercase tracking-wider">{label}</p>
        <p className="text-sm sm:text-lg font-black text-slate-900 mt-0.5 leading-tight">{value}</p>
      </div>
    </div>
  </motion.div>
);

interface InfoCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  gradient?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, icon: Icon, children }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
    <div className="flex items-center space-x-3 mb-5">
      <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center">
        <Icon className="w-4 h-4 text-indigo-500" />
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
    </div>
    <div>{children}</div>
  </div>
);
