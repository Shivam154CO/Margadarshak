import { useState, useEffect, useMemo, useDeferredValue, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  MapPin, ChevronDown,
  Grid3x3, List, Brain,
  Search, X, Bookmark, BookmarkCheck,
  Info, Layers, Filter, ArrowRight, Zap, CheckCircle2, AlertTriangle
} from "lucide-react";
import SEO from "@/components/SEO";
import Loader from "@/components/Loader";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { CollegeCardImage } from "@/features/colleges/components/CollegeCardImage";
import NoResultsFoundImg from "@/assets/No-results-found.svg";
import { useFavorites } from "@/hooks/useFavorites";
import { APP_CONFIG } from "@/constants/config";

const ML_API_URL = import.meta.env.VITE_ML_API_URL ?? 'http://127.0.0.1:5001';

import { useCollegeData } from "./hooks/useCollegeData";
import type { College } from "@/types/college";

// ---------- MAIN COMPONENT ----------
export default function CollegeSearch() {
  const { colleges: predictedColleges, allColleges, userProfile, loading } = useCollegeData();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [search, setSearch] = useState("");
  const [branchModal, setBranchModal] = useState<College | null>(null);
  const [viewMode, setViewMode] = useState<"predicted" | "all">("all");
  const [sortBy, setSortBy] = useState("match_score");
  const [activeTab, setActiveTab] = useState<"list" | "grid">("grid");
  
  // Performance: Lazy rendering state
  const [visibleCount, setVisibleCount] = useState(24);
  const deferredSearch = useDeferredValue(search);

  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    collegeType: "All Types",
    branch: "All Branches",
    location: "",
    minFees: "",
    maxFees: "",
    admissionChance: "",
    placementRate: "",
  });

  useEffect(() => {
    if (!loading && predictedColleges.length === 0 && viewMode === "predicted") {
      setViewMode("all");
    }
  }, [loading, predictedColleges.length, viewMode]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const branchesResponse = await axios.get(`${ML_API_URL}/branches`);
        if (branchesResponse.data.branches) setAvailableBranches(branchesResponse.data.branches);
        const citiesResponse = await axios.get(`${ML_API_URL}/cities`);
        if (citiesResponse.data.cities) setAvailableLocations(citiesResponse.data.cities);
      } catch (error) {
        if (allColleges.length > 0) {
          const branchesSet = new Set<string>();
          const locationsSet = new Set<string>();
          allColleges.forEach(college => {
            if (college.city) locationsSet.add(college.city);
            (college.branches || []).forEach(branch => { if (branch.branch_name) branchesSet.add(branch.branch_name); });
          });
          setAvailableBranches(["All Branches", ...Array.from(branchesSet).sort()]);
          setAvailableLocations(["All Locations", ...Array.from(locationsSet).sort()]);
        }
      }
    };
    fetchFilterOptions();
  }, [allColleges]);

  const currentColleges = useMemo(() =>
    viewMode === "predicted" ? predictedColleges : allColleges,
    [viewMode, predictedColleges, allColleges]
  );

  const filteredColleges = useMemo(() => {
    let filtered = [...currentColleges];
    
    // Applying Search with Deferred Value
    if (deferredSearch.trim()) {
      const query = deferredSearch.toLowerCase();
      filtered = filtered.filter(college =>
        (college.college_name?.toLowerCase() || "").includes(query) ||
        (college.city?.toLowerCase() || "").includes(query) ||
        (college.branches || []).some(b => (b.branch_name?.toLowerCase() || "").includes(query))
      );
    }
    
    // Applying Filters
    if (filters.collegeType !== "All Types") filtered = filtered.filter(c => c.autonomy_status === filters.collegeType);
    if (filters.branch !== "All Branches") filtered = filtered.filter(c => c.branches?.some(b => b.branch_name === filters.branch));
    if (filters.location) filtered = filtered.filter(c => c.city === filters.location);
    if (filters.minFees) filtered = filtered.filter(c => c.branches?.some(b => (b.fees || 0) >= parseInt(filters.minFees)));
    if (filters.maxFees) filtered = filtered.filter(c => c.branches?.some(b => (b.fees || 0) <= parseInt(filters.maxFees)));
    if (filters.admissionChance) filtered = filtered.filter(c => c.branches?.some(b => (b.admission_chance || 0) >= parseInt(filters.admissionChance)));
    if (filters.placementRate) filtered = filtered.filter(c => (c.placement_rate || 0) >= parseInt(filters.placementRate));

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "match_score":
          const aScore = Math.max(...(a.branches?.map(b => b.match_score || 0) || [0]), 0);
          const bScore = Math.max(...(b.branches?.map(b => b.match_score || 0) || [0]), 0);
          return bScore - aScore;
        default: return 0;
      }
    });
  }, [currentColleges, deferredSearch, filters, sortBy]);

  // Performance: Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(24);
  }, [deferredSearch, filters, viewMode]);

  const clearFilters = () => {
    setFilters({ collegeType: "All Types", branch: "All Branches", location: "", minFees: "", maxFees: "", admissionChance: "", placementRate: "" });
    setSearch("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar activeTab="search" userProfile={userProfile} />
        <div className="flex-grow flex flex-col items-center justify-center gap-12">
          <Loader />
          <p className="text-slate-600 font-bold tracking-tight text-lg">Loading college intelligence...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SEO title="College Explorer" description="Explore engineering colleges with AI matching." />
      <Navbar activeTab="search" userProfile={userProfile} />

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">College Explorer</h1>
          <p className="text-sm text-slate-500 mt-1">Discover and analyze India's premier engineering institutions</p>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total Institutions", value: allColleges.length, color: "border-l-slate-400" },
            { label: "AI Recommendations", value: predictedColleges.length, color: "border-l-indigo-500" },
            { label: "Cities Covered", value: availableLocations.length, color: "border-l-emerald-500" },
            { label: "Specializations", value: availableBranches.length, color: "border-l-amber-500" },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-xl border border-slate-200 border-l-4 ${s.color} p-4 shadow-sm transition-all hover:shadow-md`}>
              <div className="text-2xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-8 shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Main Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by college name, city, or branch..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
              
              <button
                onClick={() => setViewMode(viewMode === "predicted" ? "all" : "predicted")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === "predicted" ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
              >
                <Brain className="w-3.5 h-3.5" />
                AI Mode: {viewMode === "predicted" ? "ON" : "OFF"}
              </button>

              <div className="h-4 w-px bg-slate-200 mx-1" />

              <FilterSelectSmall
                label="Type"
                value={filters.collegeType}
                onChange={(v: string) => setFilters(p => ({ ...p, collegeType: v }))}
                options={["All Types", "Government", "Private", "Autonomous"]}
              />

              <FilterSelectSmall
                label="City"
                value={filters.location || "All Locations"}
                onChange={(v: string) => setFilters(p => ({ ...p, location: v === "All Locations" ? "" : v }))}
                options={["All Locations", ...availableLocations.filter(l => l !== "All Locations")]}
              />

              <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Sort By:</span>
                <select 
                  value={sortBy} 
                  onChange={e => setSortBy(e.target.value)} 
                  className="pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg outline-none appearance-none text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <option value="match_score">AI Match Score</option>
                  <option value="package_high">Highest Package</option>
                  <option value="package_low">Lowest Package</option>
                  <option value="a_z">Alphabetical (A-Z)</option>
                </select>
              </div>

              {(filters.collegeType !== "All Types" || filters.location || search || viewMode === "predicted") && (
                <button 
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Reset
                </button>
              )}

              <div className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <button 
                  onClick={() => setActiveTab("grid")} 
                  className={`px-3 py-1.5 flex items-center gap-2 rounded-md transition-all text-xs font-bold ${activeTab === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"}`}
                >
                  <Grid3x3 className="w-3.5 h-3.5" /> Grid
                </button>
                <button 
                  onClick={() => setActiveTab("list")} 
                  className={`px-3 py-1.5 flex items-center gap-2 rounded-md transition-all text-xs font-bold ${activeTab === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"}`}
                >
                  <List className="w-3.5 h-3.5" /> List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-medium text-slate-600">
            Showing <span className="text-slate-900 font-bold">{filteredColleges.length}</span> results
          </p>
        </div>

        {/* Colleges Grid/List */}
        <div className="min-h-[400px]">
          {filteredColleges.length > 0 ? (
            <div className={activeTab === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8" : "space-y-4 lg:space-y-6"}>
              {filteredColleges.slice(0, visibleCount).map((college, i) => (
                activeTab === "grid" ? (
                  <CollegeCard
                    key={college.college_code}
                    college={college}
                    index={i}
                    saved={isFavorite(college.college_code, college.branches?.[0]?.branch_name || "N/A")}
                    onToggleSaved={() => toggleFavorite({ ...college, branch: college.branch || college.branches?.[0]?.branch_name || "N/A" } as any)}
                    onOpenBranches={() => setBranchModal(college)}
                    isPredicted={viewMode === "predicted"}
                    userProfile={userProfile}
                  />
                ) : (
                  <CollegeListCard
                    key={college.college_code}
                    college={college}
                    index={i}
                    saved={isFavorite(college.college_code, college.branches?.[0]?.branch_name || "N/A")}
                    onToggleSaved={() => toggleFavorite({ ...college, branch: college.branch || college.branches?.[0]?.branch_name || "N/A" } as any)}
                    onOpenBranches={() => setBranchModal(college)}
                    isPredicted={viewMode === "predicted"}
                    userProfile={userProfile}
                  />
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <img src={NoResultsFoundImg} alt="No results found" className="w-40 h-40 mx-auto mb-4 opacity-50 contrast-50" />
              <h3 className="text-lg font-bold text-slate-900">No institutions found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
              <button 
                onClick={clearFilters} 
                className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {filteredColleges.length > visibleCount && (
          <div className="flex justify-center mt-12 mb-8">
            <button
              onClick={() => setVisibleCount(prev => prev + 24)}
              className="px-8 py-3 bg-white border border-slate-200 text-indigo-600 font-bold rounded-xl shadow-sm hover:shadow-md transition-all hover:bg-slate-50 flex items-center gap-2 group"
            >
              <span>Load More Institutions</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </main>

      <AnimatePresence>
        {branchModal && <BranchModal college={branchModal} onClose={() => setBranchModal(null)} />}
      </AnimatePresence>
      <Footer />
    </div>
  );
}

// ---------- COMPONENTS ----------

const FilterSelectSmall = memo(({ label, value, onChange, options }: any) => {
  return (
    <div className="relative">
      <select 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className="pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg outline-none appearance-none text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <option value={options[0]}>{label}: {value || options[0]}</option>
        {options.slice(1).map((o: any) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
    </div>
  );
});

const CollegeCard = memo(({ college, index, saved, onToggleSaved, onOpenBranches, isPredicted, userProfile }: any) => {
  const navigate = useNavigate();
  const preferredBranches = userProfile?.preferred_branches || [];
  
  const bestBranch = useMemo(() => {
    const branchesToConsider = (college.branches || []).filter((b: any) =>
      preferredBranches.length === 0 ||
      preferredBranches.some((pref: string) =>
        b.branch_name.toLowerCase().includes(pref.toLowerCase()) ||
        pref.toLowerCase().includes(b.branch_name.toLowerCase())
      )
    ).length > 0 ? (college.branches || []).filter((b: any) =>
      preferredBranches.length === 0 ||
      preferredBranches.some((pref: string) =>
        b.branch_name.toLowerCase().includes(pref.toLowerCase()) ||
        pref.toLowerCase().includes(b.branch_name.toLowerCase())
      )
    ) : (college.branches || []);

    return branchesToConsider.length > 0
      ? branchesToConsider.reduce((a: any, b: any) => (a.admission_chance || 0) > (b.admission_chance || 0) ? a : b)
      : { branch_name: "N/A", admission_chance: 0 };
  }, [college.branches, preferredBranches]);
  
  const prob = useMemo(() => {
    const chance = isPredicted ? bestBranch.admission_chance : 0;
    if (chance >= 80) return { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2, label: "Best Match" };
    if (chance >= 60) return { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: Zap, label: "Good Match" };
    if (chance >= 40) return { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Info, label: "Stretch" };
    return { color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", icon: AlertTriangle, label: "Reach" };
  }, [isPredicted, bestBranch.admission_chance]);

  const IconComp = prob.icon;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.2 }} 
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group relative flex flex-col h-full"
    >
      <div className="h-40 relative overflow-hidden">
        <CollegeCardImage 
          src={college.image} 
          collegeCode={college.college_code}
          fallbackIndex={index} 
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        <button 
          onClick={onToggleSaved} 
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm hover:bg-white transition-colors"
        >
          {saved ? <BookmarkCheck className="w-4 h-4 text-indigo-600 fill-indigo-600" /> : <Bookmark className="w-4 h-4 text-slate-400" />}
        </button>
        <div className="absolute bottom-3 left-3 right-3">
           <div className="flex items-center gap-2 flex-wrap">
              <span className="px-1.5 py-0.5 bg-indigo-600 text-white rounded text-[9px] font-black uppercase tracking-wider">
                {college.autonomy_status}
              </span>
              {isPredicted && (
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${prob.bg} ${prob.color} border ${prob.border}`}>
                  <IconComp className="w-2.5 h-2.5" /> {prob.label}
                </span>
              )}
           </div>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
          <div className="mb-3">
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 text-sm">{college.college_name}</h3>
            <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-semibold"><MapPin className="w-2.5 h-2.5 text-indigo-400" />{college.city}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100 flex-1">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">AI Top Branch</span>
                {isPredicted && <span className={`text-[10px] font-black ${prob.color}`}>{(bestBranch.admission_chance || 0).toFixed(1)}%</span>}
            </div>
            <p className="text-xs font-bold text-slate-700 line-clamp-1">{bestBranch.branch_name}</p>
          </div>

          <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100 mt-auto">
            <div className="flex flex-col">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Avg Package</span>
                <span className="text-xs font-bold text-slate-800">₹{college.average_package_lpa}L</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={onOpenBranches} 
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-50 transition-colors"
              >
                Branches
              </button>
              <button 
                onClick={() => navigate(`${ROUTES.COLLEGE_DETAILS}?code=${college.college_code}&branch=${encodeURIComponent(bestBranch.branch_name || "")}`, { state: { college } })} 
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                View Details <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
      </div>
    </motion.div>
  );
});

const CollegeListCard = memo(({ college, index, saved, onToggleSaved, onOpenBranches, isPredicted, userProfile }: any) => {
  const navigate = useNavigate();
  const preferredBranches = userProfile?.preferred_branches || [];
  
  const bestBranch = useMemo(() => {
    const branchesOfInfluence = (college.branches || []).filter((b: any) =>
      preferredBranches.length === 0 ||
      preferredBranches.some((pref: string) =>
        b.branch_name.toLowerCase().includes(pref.toLowerCase()) ||
        pref.toLowerCase().includes(b.branch_name.toLowerCase())
      )
    );
    const branchesToConsider = branchesOfInfluence.length > 0 ? branchesOfInfluence : (college.branches || []);
    return branchesToConsider.length > 0 
      ? branchesToConsider.reduce((a: any, b: any) => (a.admission_chance || 0) > (b.admission_chance || 0) ? a : b)
      : { branch_name: "N/A", admission_chance: 0 };
  }, [college.branches, preferredBranches]);

  return (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.2 }} 
        className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-all group"
    >
      <div className="w-full md:w-72 h-48 relative rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-100 block">
        <CollegeCardImage 
          src={college.image} 
          collegeCode={college.college_code}
          fallbackIndex={index} 
          sizes="(max-width: 768px) 100vw, 300px" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
      </div>
      <div className="flex-1 min-w-0 py-2">
        <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-black uppercase tracking-wider">{college.autonomy_status}</span>
            {saved && <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-black uppercase tracking-wider">Saved</span>}
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{college.college_name}</h3>
        <p className="text-sm text-slate-500 flex items-center gap-5 mt-2 font-medium">
          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-indigo-400" />{college.city}</span>
          <span className="text-indigo-600 font-bold line-clamp-1 max-w-[300px]">{bestBranch.branch_name}</span>
        </p>
      </div>
      <div className="flex items-center gap-8 flex-shrink-0 pr-4 mt-4 md:mt-0">
        {isPredicted && (
            <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Match</p>
                <p className="text-lg md:text-xl font-black text-indigo-600">{(bestBranch.admission_chance || 0).toFixed(1)}%</p>
            </div>
        )}
        <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Package</p>
            <p className="text-lg md:text-xl font-bold text-slate-900">₹{college.average_package_lpa}L</p>
        </div>
        <div className="flex gap-2">
            <button onClick={onToggleSaved} className="p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
                {saved ? <BookmarkCheck className="w-5 h-5 text-indigo-600 fill-indigo-600" /> : <Bookmark className="w-5 h-5 text-slate-400" />}
            </button>
            <button onClick={onOpenBranches} className="p-3 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100 text-slate-400 hover:text-indigo-600"><Layers className="w-5 h-5" /></button>
            <button 
                onClick={() => navigate(`${ROUTES.COLLEGE_DETAILS}?code=${college.college_code}&branch=${encodeURIComponent(bestBranch.branch_name || "")}`, { state: { college } })} 
                className="px-5 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 text-xs font-bold"
            >
                View <ArrowRight className="w-4 h-4" />
            </button>
        </div>
      </div>
    </motion.div>
  );
});

const BranchModal = memo(({ college, onClose }: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      onClick={onClose} 
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        exit={{ scale: 0.98, opacity: 0 }} 
        onClick={e => e.stopPropagation()} 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-xl flex flex-col border border-slate-200"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900 line-clamp-1">{college.college_name}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Available Branches & Cutoffs</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/30">
          {(college.branches || []).map((b: any, i: number) => {
            const chanceColor = (b.admission_chance || 0) >= 80 ? 'text-emerald-600' : 
                               (b.admission_chance || 0) >= 50 ? 'text-indigo-600' : 'text-slate-600';
            
            return (
              <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="min-w-0">
                    <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">{b.branch_code}</span>
                    <h4 className="text-sm font-bold text-slate-800 mt-2 leading-snug">{b.branch_name}</h4>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">AI Match</span>
                    <span className={`text-base font-black ${chanceColor}`}>{(b.admission_chance || 0).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Cutoff</p>
                    <p className="text-xs font-bold text-slate-700">{b.cutoff_rank ? b.cutoff_rank.toLocaleString() : 'N/A'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Seats</p>
                    <p className="text-xs font-bold text-slate-700">{b.seats}</p>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Fees</p>
                    <p className="text-xs font-bold text-indigo-600">₹{b.fees?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-medium italic">{APP_CONFIG.DATA_SOURCE_LABEL}</p>
        </div>
      </motion.div>
    </motion.div>
  );
});
