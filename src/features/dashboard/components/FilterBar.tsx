import React from 'react';
import { Search, Filter, BookmarkCheck, Zap, CheckCircle, Target as TargetIcon, TrendingUp, AlertTriangle } from 'lucide-react';

interface FilterBarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  stats: any;
  searchInput: string;
  handleSearch: (val: string) => void;
  
  selectedBranch: string;
  handleBranchFilter: (val: string) => void;
  branches: string[];
  
  selectedCity: string;
  handleCityFilter: (val: string) => void;
  cities: string[];
  
  selectedDistrict: string;
  handleDistrictFilter: (val: string) => void;
  districts: string[];

  selectedRegion: string;
  handleRegionFilter: (val: string) => void;
  regions: string[];

  selectedState: string;
  handleStateFilter: (val: string) => void;
  states: string[];

  selectedCollegeType: string;
  handleCollegeTypeFilter: (val: string) => void;
  collegeTypes: string[];

  selectedUniversity: string;
  handleUniversityFilter: (val: string) => void;
  universities: string[];

  selectedCategory: string;
  handleCategoryFilter: (val: string) => void;
  categories: string[];

  selectedGender: string;
  handleGenderFilter: (val: string) => void;
  genders: string[];
  
  onClearFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  setActiveFilter,
  stats,
  searchInput,
  handleSearch,
  
  selectedBranch,
  handleBranchFilter,
  branches,
  
  selectedCity,
  handleCityFilter,
  cities,
  
  selectedDistrict,
  handleDistrictFilter,
  districts,

  selectedRegion,
  handleRegionFilter,
  regions,

  selectedState,
  handleStateFilter,
  states,

  selectedCollegeType,
  handleCollegeTypeFilter,
  collegeTypes,

  selectedUniversity,
  handleUniversityFilter,
  universities,

  selectedCategory,
  handleCategoryFilter,
  categories,

  selectedGender,
  handleGenderFilter,
  genders,
  
  onClearFilters,
}) => {
  return (
    <>
      {/* Partition Filters (Most Probable, Best Fit, etc.) */}
      <div className="mb-6">
        <div className="flex overflow-x-auto lg:flex-wrap gap-2 lg:gap-3 justify-start lg:justify-start pb-4 lg:pb-0 scrollbar-hidden -mx-4 px-4 lg:mx-0 lg:px-0 scroll-smooth">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${activeFilter === "all"
              ? "bg-slate-800 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setActiveFilter("most-probable")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-1.5 whitespace-nowrap ${activeFilter === "most-probable"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Most Probable ({stats.mostProbable})</span>
          </button>
          <button
            onClick={() => setActiveFilter("best-fit")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-1.5 whitespace-nowrap ${activeFilter === "best-fit"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Best Fit ({stats.bestFit})</span>
          </button>
          <button
            onClick={() => setActiveFilter("good-fit")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-1.5 whitespace-nowrap ${activeFilter === "good-fit"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
          >
            <TargetIcon className="w-3.5 h-3.5" />
            <span>Good Fit ({stats.goodFit})</span>
          </button>
          <button
            onClick={() => setActiveFilter("stretch")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-1.5 whitespace-nowrap ${activeFilter === "stretch"
              ? "bg-orange-500 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Stretch ({stats.stretch})</span>
          </button>
          <button
            onClick={() => setActiveFilter("reach")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-1.5 whitespace-nowrap ${activeFilter === "reach"
              ? "bg-red-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Reach ({stats.reach})</span>
          </button>
          <button
            onClick={() => setActiveFilter("saved")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-1.5 whitespace-nowrap ${activeFilter === "saved"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Saved</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Controls Panel */}
      <div className="mb-8 p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Top Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by college name, code, city, branch..."
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
            />
          </div>
          
          {/* Mid Dropdowns Grid - 3 cols on sm, 4/5 cols on large screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {/* Branch Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <select
                value={selectedBranch}
                onChange={(e) => handleBranchFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-55 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none text-sm cursor-pointer"
              >
                <option value="">All Branches</option>
                {branches.map((b, idx) => <option key={`branch-${b}-${idx}`} value={b}>{b}</option>)}
              </select>
            </div>

            {/* City Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <select
                value={selectedCity}
                onChange={(e) => handleCityFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-55 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none text-sm cursor-pointer"
              >
                <option value="">All Cities</option>
                {cities.map((c, idx) => <option key={`city-${c}-${idx}`} value={c}>{c}</option>)}
              </select>
            </div>

            {/* District Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-55 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none text-sm cursor-pointer"
              >
                <option value="">All Districts</option>
                {districts.map((d, idx) => <option key={`district-${d}-${idx}`} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Region Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <select
                value={selectedRegion}
                onChange={(e) => handleRegionFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-55 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none text-sm cursor-pointer"
              >
                <option value="">All Regions</option>
                {regions.map((r, idx) => <option key={`region-${r}-${idx}`} value={r}>{r}</option>)}
              </select>
            </div>

            {/* State Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <select
                value={selectedState}
                onChange={(e) => handleStateFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-55 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none text-sm cursor-pointer"
              >
                <option value="">All States</option>
                {states.map((s, idx) => <option key={`state-${s}-${idx}`} value={s}>{s}</option>)}
              </select>
            </div>

            {/* College Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <select
                value={selectedCollegeType}
                onChange={(e) => handleCollegeTypeFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-55 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none text-sm cursor-pointer"
              >
                <option value="">All College Types</option>
                {collegeTypes.map((t, idx) => <option key={`type-${t}-${idx}`} value={t}>{t}</option>)}
              </select>
            </div>

            {/* University Affiliation Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <select
                value={selectedUniversity}
                onChange={(e) => handleUniversityFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-55 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none text-sm cursor-pointer animate-fade-in"
              >
                <option value="">All Universities</option>
                {universities.map((u, idx) => <option key={`uni-${u}-${idx}`} value={u}>{u}</option>)}
              </select>
            </div>

            {/* Quota / Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-55 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none text-sm cursor-pointer"
              >
                <option value="">All Quotas/Categories</option>
                {categories.map((c, idx) => <option key={`cat-${c}-${idx}`} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Co-ed / Girls Only Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <select
                value={selectedGender}
                onChange={(e) => handleGenderFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-55 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none text-sm cursor-pointer"
              >
                <option value="">All Genders</option>
                {genders.map((g, idx) => <option key={`gender-${g}-${idx}`} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Bottom Clear Filters Control */}
          <div className="flex justify-end border-t border-slate-100 pt-3">
            <button
              onClick={onClearFilters}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all focus:outline-none"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
