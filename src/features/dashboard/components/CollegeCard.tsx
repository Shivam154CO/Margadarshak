import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Bookmark, BookmarkCheck, ExternalLink, Trophy, Layers, Award, Zap, CheckCircle, Target, TrendingUp, AlertCircle, AlertTriangle } from 'lucide-react';
import type { College } from '@/types/college';
import { ROUTES } from '@/constants/routes';

interface CollegeCardProps {
  college: College;
  index: number;
  isSaved: boolean;
  toggleSaveCollege: (college: College) => void;
  getAdmissionInfo: (college: College) => any;
}

const CollegeImage: React.FC<{ collegeCode: string; className?: string; alt?: string; priority?: boolean }> = ({ collegeCode, className, alt, priority }) => {
    // Local getCollegeImage logic if needed, but we pass it as prop or import it
    const imagePath = `/src/assets/${collegeCode}/campus.png`;
    return (
        <img 
            src={imagePath} 
            alt={alt} 
            className={className} 
            loading={priority ? "eager" : "lazy"} 
            onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80";
            }}
        />
    );
};

const CollegeCardComponent: React.FC<CollegeCardProps> = ({
  college,
  index,
  isSaved,
  toggleSaveCollege,
  getAdmissionInfo,
}) => {
  const navigate = useNavigate();
  const admissionInfo = getAdmissionInfo(college);

  // Render the icon dynamically based on the name
  const icons: Record<string, any> = {
    Zap, CheckCircle, Target, TrendingUp, AlertCircle, AlertTriangle
  };
  const IconComponent = icons[admissionInfo.iconName] || AlertCircle;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.05, 0.3),
        ease: [0.23, 1, 0.32, 1]
      }}
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12)] hover:border-indigo-100 transition-all duration-500 overflow-hidden hover:-translate-y-1.5 flex flex-col h-full"
    >
      {/* Image Header with Heavy Glassmorphism */}
      <div className="relative h-56 overflow-hidden">
        <CollegeImage
          collegeCode={college.college_code}
          className="w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-700 ease-out"
          alt={`${college.college_name} campus`}
          priority={index < 4}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>

        {/* Floating Save Button */}
        <button
          onClick={() => toggleSaveCollege(college)}
          className="absolute top-4 right-4 w-9 h-9 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:border-white transition-all duration-300 shadow-xl z-20 group/save"
        >
          {isSaved ? (
            <BookmarkCheck className="w-4 h-4 text-white group-hover/save:text-indigo-600 transition-colors" />
          ) : (
            <Bookmark className="w-4 h-4 text-white group-hover/save:text-indigo-600 transition-colors" />
          )}
        </button>

        {/* Status Badge */}
        <div
          className={`absolute top-4 left-4 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 ${admissionInfo.bgColor.replace('bg-gradient-to-r', '').replace('bg-white', 'bg-white/90')} text-slate-900 flex items-center space-x-1.5 text-xs font-bold z-20 shadow-lg`}
        >
          <IconComponent className={`w-3.5 h-3.5 ${admissionInfo.color.replace('text-', 'text-').split(' ')[0]}`} />
          <span>{admissionInfo.label}</span>
        </div>

        {/* Title & Location Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-20 flex flex-col justify-end">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white tracking-tight leading-tight line-clamp-2 mb-2 group-hover:text-indigo-100 transition-colors">
                {college.college_name}
              </h3>
              <div className="flex items-center text-slate-300 text-xs font-medium">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                <span className="truncate">{college.city}</span>
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-end">
              <div className="px-3 py-1 rounded-lg bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-indigo-100 text-sm font-black shadow-lg">
                {college.match_score ? `${college.match_score.toFixed(1)}/100` : (college.match_percentage || "N/A")}
              </div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Match Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Details Section */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Branch & Category */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <div className="inline-flex items-center space-x-1.5 bg-slate-50 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border border-slate-200/60">
            <Layers className="w-3 h-3 text-indigo-500" />
            <span className="line-clamp-1 max-w-[180px]">{college.branch}</span>
          </div>
          <div className="inline-flex items-center space-x-1.5 bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border border-slate-200/60">
            <Award className="w-3 h-3 text-emerald-500" />
            <span>{college.category}</span>
          </div>
        </div>

        {/* 4-Grid Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          <div className="flex flex-col justify-center bg-white p-2 text-center border-b md:border-b-0 border-r md:border-r-0 border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cutoff</span>
            <span className="text-sm font-black text-slate-800">
              {(college.cutoff_rank ?? 0) > 0 ? college.cutoff_rank : Math.round(college.cutoff_percentile || 0)}
            </span>
          </div>
          <div className="flex flex-col justify-center bg-white p-2 text-center border-b md:border-b-0 md:border-l border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Seats</span>
            <span className="text-sm font-black text-slate-800">
              {college.seats || "N/A"}
            </span>
          </div>
          <div className="flex flex-col justify-center bg-white p-2 text-center border-r md:border-r-0 md:border-l border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fees</span>
            <span className="text-sm font-black text-slate-800">
              {college.fees ? `₹${(college.fees / 100000).toFixed(1)}L` : "N/A"}
            </span>
          </div>
          <div className="flex flex-col justify-center bg-white p-2 text-center md:border-l border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Placements</span>
            <span className="text-sm font-black text-emerald-600">
              {college.placement_rate ? `${college.placement_rate.toFixed(0)}%` : "N/A"}
            </span>
          </div>
        </div>

        {/* Admission Probability Bar */}
        <div className="mb-6 mt-auto">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Admission Probability</span>
            <span className={`text-xs font-black ${admissionInfo.color}`}>
              {admissionInfo.percentage}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${admissionInfo.gradient} transition-all duration-1000`}
              style={{ width: `${college.admission_chance || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Package Highlights */}
        {(college.average_package_lpa! > 0 || college.highest_package_lpa! > 0) && (
          <div className="mb-6 bg-slate-50 rounded-xl border border-slate-200/60 p-3 mt-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 flex-shrink-0">
                <Trophy className="w-3.5 h-3.5 text-indigo-500" />
                <span>Package (LPA)</span>
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {college.average_package_lpa! > 0 && (
                  <div className="text-[11px] font-black text-slate-800">Avg: {college.average_package_lpa!.toFixed(1)}L</div>
                )}
                {college.highest_package_lpa! > 0 && (
                  <div className="text-[10px] font-bold text-slate-500 border-l border-slate-300 pl-3">High: {college.highest_package_lpa!.toFixed(1)}L</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Call to Action Button */}
        <button
          onClick={() => navigate(`${ROUTES.COLLEGE_DETAILS}?code=${college.college_code}&branch=${encodeURIComponent(college.branch || college.branch_name || '')}`, { state: { college } })}
          className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors duration-300 shadow-sm flex items-center justify-center space-x-2 group/btn mt-auto"
        >
          <span>View Details</span>
          <ExternalLink className="w-4 h-4 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

export const CollegeCard = React.memo(CollegeCardComponent);
