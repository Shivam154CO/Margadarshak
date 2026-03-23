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
  color = "text-gray-600", 
  bgColor = "bg-gray-50",
  gradient
}) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    className={`bg-white/90 backdrop-blur-sm rounded-2xl p-3 sm:p-5 shadow-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden group`}
  >
    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
    <div className="flex items-center space-x-3 relative z-10">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${gradient ? 'bg-white/20' : bgColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ${gradient ? 'relative overflow-hidden' : ''}`}>
        {gradient && <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />}
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${gradient ? 'text-gray-700' : color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-sm sm:text-lg font-extrabold text-gray-900 mt-0.5 leading-tight">{value}</p>
      </div>
    </div>
  </motion.div>
);

interface InfoCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  gradient: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ title, icon: Icon, children, gradient }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-sm border border-white/20 backdrop-blur-sm relative overflow-hidden group hover:shadow-xl transition-shadow duration-300`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

    <div className="flex items-center space-x-3 mb-6 relative z-10">
      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    <div className="relative z-10">
      {children}
    </div>
  </div>
);
