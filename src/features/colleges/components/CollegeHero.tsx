import React from 'react';
import { MapPin, BookOpen, Tag, Award } from 'lucide-react';
import { CollegeImage } from './CollegeImage';

interface CollegeHeroProps {
  college: any;
  academicData: any;
}

export const CollegeHero: React.FC<CollegeHeroProps> = ({ college, academicData }) => {
  return (
    <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-sm border border-gray-200 mb-8">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
        <div className="w-32 h-32 bg-gray-50 rounded-3xl flex-shrink-0 shadow-xl overflow-hidden border border-gray-100 relative">
          <CollegeImage collegeCode={college.college_code || ""} type="logo" imageOverride={college.logo_url} className="absolute inset-0 w-full h-full object-fill" alt="Logo" />
        </div>
        <div className="w-full md:flex-1 md:min-w-0 overflow-hidden">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 break-words whitespace-normal leading-tight">
            {college.college_name}
          </h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-600 text-sm font-medium">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" /> {college.city}{college.district ? `, ${college.district}` : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-500" /> {college.branch_name}
            </span>
            <span className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-500" /> {college.category}
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" /> {academicData.accreditation}
            </span>
          </div>
        </div>
        {college.is_most_probable && (
          <div className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/20">
            🎯 Most Probable
          </div>
        )}
      </div>
    </div>
  );
};
