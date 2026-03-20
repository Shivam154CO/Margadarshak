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
  onClearFilters,
}) => {
  return (
    <>
      {/* Filter Buttons */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeFilter === "all"
              ? "bg-slate-800 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setActiveFilter("most-probable")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-1.5 ${activeFilter === "most-probable"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Most Probable ({stats.mostProbable})</span>
          </button>
          <button
            onClick={() => setActiveFilter("best-fit")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-1.5 ${activeFilter === "best-fit"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Best Fit ({stats.bestFit})</span>
          </button>
          <button
            onClick={() => setActiveFilter("good-fit")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-1.5 ${activeFilter === "good-fit"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
          >
            <TargetIcon className="w-3.5 h-3.5" />
            <span>Good Fit ({stats.goodFit})</span>
          </button>
          <button
            onClick={() => setActiveFilter("stretch")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-1.5 ${activeFilter === "stretch"
              ? "bg-orange-500 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Stretch ({stats.stretch})</span>
          </button>
          <button
            onClick={() => setActiveFilter("reach")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-1.5 ${activeFilter === "reach"
              ? "bg-red-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Reach ({stats.reach})</span>
          </button>
          <button
            onClick={() => setActiveFilter("saved")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-1.5 ${activeFilter === "saved"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Saved</span>
          </button>
        </div>
      </div>

      {/* Search and Advanced Filters */}
      <div className="mb-8 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by college name, city, branch..."
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <select
                value={selectedBranch}
                onChange={(e) => handleBranchFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none text-sm cursor-pointer"
              >
                <option value="">All Branches</option>
                {branches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <select
                value={selectedCity}
                onChange={(e) => handleCityFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none text-sm cursor-pointer"
              >
                <option value="">All Cities</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none text-sm cursor-pointer"
              >
                <option value="">All Districts</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={onClearFilters}
            className="px-4 py-2.5 text-slate-500 hover:text-slate-800 font-medium text-sm transition-colors whitespace-nowrap lg:border-l lg:border-slate-200 lg:pl-4"
          >
            Clear All
          </button>
        </div>
      </div>
    </>
  );
};
