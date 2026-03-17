import React from 'react';
import { motion } from 'framer-motion';
import { Award, GraduationCap, ExternalLink, Download } from 'lucide-react';
import type { Scholarship } from '../../../types/college';
import { RECOMMENDED_SCHOLARSHIPS } from '../../../constants/scholarships';

interface ScholarshipsSectionProps {
  collegeScholarships: Scholarship[];
  userCategory?: string;
}

export const ScholarshipsSection: React.FC<ScholarshipsSectionProps> = ({
  collegeScholarships,
  userCategory = "",
}) => {
  // Filter recommended scholarships based on user's category
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
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
          <Award className="w-5 h-5 text-amber-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Scholarships & Financial Aid</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scholarshipsToShow.map((scholarship, index) => (
          <motion.div
            key={scholarship.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 hover:border-amber-300 hover:bg-amber-50/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">{scholarship.type}</span>
                <h4 className="font-bold text-gray-900 mt-1">{scholarship.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{scholarship.provider}</p>
              </div>
              <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                {scholarship.amount}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start space-x-2">
                <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5" />
                <p className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-semibold">Eligibility:</span> {scholarship.eligibility}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-600">
                  <span className="font-semibold">Deadline:</span> {scholarship.deadline}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href={scholarship.application_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span>Apply Now</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                className="p-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
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
