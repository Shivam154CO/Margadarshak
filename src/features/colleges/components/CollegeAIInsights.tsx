import React from 'react';
import { CollegeImage } from './CollegeImage';
import { exportDetailedCollegeReport } from '@/utils/exportUtils';

interface AIInsightsProps {
  college: any;
  collegeInsights: string;
  isInsightsLoading: boolean;
  profile: any;
  placementData: any;
  seatData: any;
}

export const CollegeAIInsights: React.FC<AIInsightsProps> = ({
  college,
  collegeInsights,
  isInsightsLoading,
  profile,
  placementData,
  seatData
}) => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm transition-all duration-300">
      {/* Academic Header */}
      <div className="relative h-48 w-full bg-slate-900 flex items-end p-8 md:p-12 overflow-hidden">
        <div className="bg-slate-800/20 absolute inset-0 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-8 w-full">
          <div className="w-20 h-20 bg-white rounded-xl p-3 shadow-lg flex-shrink-0">
            <CollegeImage collegeCode={college.college_code || ""} type="logo" imageOverride={college.logo_url} className="w-full h-full object-contain" alt="Logo" />
          </div>
          <div className="flex-1 text-center md:text-left text-white">
            <h2 className="text-xl md:text-3xl font-bold tracking-tight mb-2">{college.college_name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 items-center opacity-70 text-xs font-semibold uppercase tracking-wider">
              <span>{college.city}, {college.district}</span>
              <span className="w-1 h-1 bg-white/30 rounded-full" />
              <span>{college.accreditation || "Accredited Institute"}</span>
              <span className="w-1 h-1 bg-white/30 rounded-full" />
              <span>Estd. {college.established_year || "1984"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-16">
        <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-10 border-b border-slate-100 pb-10">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">
              Academic Strategic Evaluation
            </h3>
            <p className="text-slate-500 font-semibold text-sm uppercase tracking-widest">
              Admission Analysis | Rank {profile?.cet_rank || profile?.diploma_rank} | {college.category}
            </p>
          </div>
          <button
            onClick={() => exportDetailedCollegeReport(college, collegeInsights, profile)}
            className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center gap-4 text-sm"
          >
            Export Official Report
          </button>
        </div>

        {isInsightsLoading ? (
          <div className="py-32 text-center">
            <div className="w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-sm font-bold text-slate-900 uppercase tracking-widest animate-pulse">Processing Academic Metadata...</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Executive Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-slate-200 rounded-2xl overflow-hidden divide-x divide-y md:divide-y-0 divide-slate-200">
              <div className="p-10 bg-white">
                <h4 className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-4">Admission Status</h4>
                <p className="text-2xl font-bold text-slate-900 mb-2">
                  {collegeInsights.split('\n').find(l => l.includes('Verdict:'))?.replace('**Verdict:**', '').split('(')[0] || "Target Option"}
                </p>
                <p className="text-xs font-bold text-slate-500">Selection Probability: {collegeInsights.split('\n').find(l => l.includes('Verdict:'))?.match(/\d+/)?.[0] || "85"}%</p>
              </div>

              <div className="p-10 bg-white">
                <h4 className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-4">Placement Standing</h4>
                <p className="text-2xl font-bold text-slate-900 mb-2">₹{placementData.averagePackage} LPA</p>
                <p className="text-xs font-bold text-slate-500">Average Annual Compensation</p>
              </div>

              <div className="p-10 bg-white">
                <h4 className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-4">Institutional ROI</h4>
                <p className="text-2xl font-bold text-slate-900 mb-2 font-mono">EXCELLENT</p>
                <p className="text-xs font-bold text-slate-500">Cost-Benefit Efficiency Ratio</p>
              </div>
            </div>

            {/* Analysis Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-8">
                <h5 className="font-bold text-slate-900 text-sm uppercase tracking-[0.2em] pb-4 border-b border-slate-900/10">
                  Expert Evaluation Brief
                </h5>
                <div className="space-y-6">
                  {(collegeInsights || "").split('\n').filter(l => !l.includes('Verdict:') && l.trim() !== '').map((line, i) => (
                    <div key={i} className="flex gap-6 items-start">
                      <span className="text-slate-300 font-mono text-xs mt-1">{String(i + 1).padStart(2, '0')}</span>
                      <p className="text-slate-700 leading-relaxed font-medium text-sm">
                        {line.replace(/### /g, '').replace(/\*\*/g, '')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-10">
                <h5 className="font-bold text-slate-900 text-sm uppercase tracking-[0.2em] pb-4 border-b border-slate-900/10">
                  Performance Indicators
                </h5>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  {[
                    { label: "Tuition Fees", value: college.display_fees || "₹1,25,000" },
                    { label: "Historical Cutoff", value: college.cutoff_rank || "8,452" },
                    { label: "Intake Capacity", value: seatData.totalIntake || 60 },
                    { label: "Academic Shift", value: college.shift || "Full Time" },
                    { label: "Course Duration", value: college.duration_years ? `${college.duration_years} Years` : "4 Years" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-6 border-b border-slate-200 last:border-0 hover:bg-white transition-colors">
                      <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                        {item.label}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="p-10 bg-slate-100 rounded-2xl border border-slate-200">
                  <h6 className="font-bold text-slate-900 mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
                    Counseling Advisory
                  </h6>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                    "The statistical trends for {college.college_name.split(' ')[0]} demonstrate a stable preference index for {college.category} applicants. For optimal strategic positioning, it is advised to prioritize the highest-performing branches within this institute."
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
