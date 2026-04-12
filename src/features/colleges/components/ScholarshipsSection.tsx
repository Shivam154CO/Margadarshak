import React from 'react';
import { motion } from 'framer-motion';
import { Award, GraduationCap, ExternalLink, Download } from 'lucide-react';
import type { Scholarship } from '@/types/college';
import { RECOMMENDED_SCHOLARSHIPS } from '@/constants/scholarships';

interface ScholarshipsSectionProps {
  collegeScholarships: Scholarship[];
  userCategory?: string;
}

export const ScholarshipsSection: React.FC<ScholarshipsSectionProps> = ({
  collegeScholarships,
  userCategory = "",
}) => {
  const cat = userCategory.toUpperCase();
  const recommended = RECOMMENDED_SCHOLARSHIPS.filter(s => {
    const eligibility = s.eligibility.toUpperCase();
    if (cat.includes("SC") || cat.includes("ST")) {
      return eligibility.includes("SC") || eligibility.includes("ST") || eligibility.includes("ALL");
    }
    if (cat.includes("OBC") || cat.includes("VJ") || cat.includes("NT") || cat.includes("SBC")) {
      return eligibility.includes("OBC") || eligibility.includes("VJ") || eligibility.includes("NT") || eligibility.includes("SBC") || eligibility.includes("ALL");
    }
    if (cat.includes("OPEN") || cat.includes("EWS") || cat.includes("SEBC")) {
      return eligibility.includes("OPEN") || eligibility.includes("EWS") || eligibility.includes("SEBC") || eligibility.includes("ALL");
    }
    return true;
  });

  const scholarshipsToShow = collegeScholarships.length > 0 ? collegeScholarships : recommended;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center">
          <Award className="w-4 h-4 text-indigo-500" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Scholarships & Financial Aid</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scholarshipsToShow.map((scholarship, index) => (
          <motion.div
            key={scholarship.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
            className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all duration-200 group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0 pr-3">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{scholarship.type}</span>
                <h4 className="font-bold text-slate-800 mt-0.5 text-sm leading-snug">{scholarship.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{scholarship.provider}</p>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 text-indigo-600 px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0">
                {scholarship.amount}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-start space-x-2">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  <span className="font-semibold text-slate-600">Eligibility:</span> {scholarship.eligibility}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-600">Deadline:</span> {scholarship.deadline}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={scholarship.application_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                <span>Apply Now</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                className="p-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
                title="Download Brochure"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
