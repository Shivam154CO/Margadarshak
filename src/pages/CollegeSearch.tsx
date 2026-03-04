import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Building, Cpu, MapPin, ChevronDown,
  Grid3x3, List, Brain, Database,
  Search, X, Mail, Briefcase, Bookmark, BookmarkCheck,
  Award, SearchX, Info, Layers
} from "lucide-react";
import SEO from "../components/SEO";


// ---------- TYPES ----------
interface RawCollege {
  college_code: string;
  college_name: string;
  city: string;
  branch: string;
  branch_code: string;
  Fees: number;
  placement_rate: number;
  cutoff_rank: number;
  cutoff_percentile: number;
  category: string;
  average_package_lpa: number;
  highest_package_lpa: number;
  total_intake: number;
  seats: number;
  autonomy_status: string;
  hostel_available: string;
  image: string;
  probability_level: string;
  is_most_probable: boolean;
  admission_chance: number;
  admission_chance_percentage: string;
  fit: string;
  fit_reason: string;
  match_score: number;
  match_percentage: string;
  address?: string;
  website?: string;
  contact_email?: string;
  phone?: string;
}

interface Branch {
  branch: string;
  branch_code: string;
  cutoff_rank: number;
  cutoff_percentile: number;
  seats: number;
  Fees: number;
  admission_chance: number;
  admission_chance_percentage: string;
  match_score: number;
  probability_level: string;
  is_most_probable: boolean;
}

interface College {
  college_code: string;
  college_name: string;
  city: string;
  image: string;
  autonomy_status: string;
  hostel_available: string;
  placement_rate: number;
  average_package_lpa: number;
  highest_package_lpa: number;
  branches: Branch[];
  is_predicted?: boolean;
  // Additional fields for details view
  state?: string;
  established_year?: number;
  campus_size?: string;
  faculty_count?: number;
  accreditation?: string;
  naac_grade?: string;
  research_papers?: number;
  library_books?: number;
  sports_facilities?: string[];
  clubs?: string[];
  campus_recruiters?: string[];
  website?: string;
  contact_email?: string;
  phone?: string;
  address?: string;
}

const getCollegeImage = (collegeCode: string): string => {
  if (!collegeCode) {
    return "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  }
  // Try multiple resolution strategies for Vite/Dev/Prod
  try {
    // Strategy 1: Vite dynamic URL (most robust for src/assets)
    const viteUrl = new URL(`../assets/${collegeCode}/campus.png`, import.meta.url).href;
    if (viteUrl && !viteUrl.includes('undefined')) return viteUrl;

    // Strategy 2: Root relative (fallback for some dev setups)
    return `/src/assets/${collegeCode}/campus.png`;
  } catch (e) {
    return "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  }
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  e.currentTarget.onerror = null;
};

// Helper function to get state from city
const getStateFromCity = (city: string): string => {
  const cityStateMap: Record<string, string> = {
    "Mumbai": "Maharashtra", "Pune": "Maharashtra", "Nagpur": "Maharashtra",
    "Thane": "Maharashtra", "Nashik": "Maharashtra", "Aurangabad": "Maharashtra",
    "Navi Mumbai": "Maharashtra", "Solapur": "Maharashtra", "Kolhapur": "Maharashtra",
    "Amravati": "Maharashtra", "Jalgaon": "Maharashtra", "Ahmednagar": "Maharashtra",
    "Nanded": "Maharashtra", "Sangli": "Maharashtra", "Akola": "Maharashtra",
    "Latur": "Maharashtra", "Dhule": "Maharashtra", "Chandrapur": "Maharashtra",
    "Parbhani": "Maharashtra", "Ratnagiri": "Maharashtra", "Gadchiroli": "Maharashtra",
    "Gondia": "Maharashtra", "Bhandara": "Maharashtra", "Washim": "Maharashtra",
    "Hingoli": "Maharashtra", "Osmanabad": "Maharashtra", "Beed": "Maharashtra",
    "Jalna": "Maharashtra", "Yavatmal": "Maharashtra", "Wardha": "Maharashtra",
    "Satara": "Maharashtra", "Delhi": "Delhi", "Bangalore": "Karnataka",
    "Chennai": "Tamil Nadu", "Hyderabad": "Telangana", "Kolkata": "West Bengal",
    "Ahmedabad": "Gujarat", "Jaipur": "Rajasthan", "Lucknow": "Uttar Pradesh",
    "Bhopal": "Madhya Pradesh", "Chandigarh": "Chandigarh",
  };
  return cityStateMap[city] || "Maharashtra";
};

// ---------- HOOKS / LOGIC ----------
function useCollegeData() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [allColleges, setAllColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to group colleges by college_code
  const groupCollegesByCode = (rawColleges: RawCollege[]): College[] => {
    const collegeMap = new Map<string, College>();

    rawColleges.forEach((rawCollege) => {
      const collegeCode = rawCollege.college_code;

      if (!collegeMap.has(collegeCode)) {
        // Create new college entry with additional details
        collegeMap.set(collegeCode, {
          college_code: collegeCode,
          college_name: rawCollege.college_name,
          city: rawCollege.city,
          image: rawCollege.image || getCollegeImage(collegeCode),
          autonomy_status: rawCollege.autonomy_status,
          hostel_available: rawCollege.hostel_available,
          placement_rate: rawCollege.placement_rate,
          average_package_lpa: rawCollege.average_package_lpa,
          highest_package_lpa: rawCollege.highest_package_lpa,
          branches: [],
          is_predicted: true,
          state: getStateFromCity(rawCollege.city),
          established_year: 0,
          campus_size: "N/A",
          faculty_count: 0,
          accreditation: "AICTE Approved",
          naac_grade: "N/A",
          research_papers: 0,
          library_books: 0,
          sports_facilities: [],
          clubs: [],
          campus_recruiters: [],
          address: rawCollege.address || `${rawCollege.college_name}, ${rawCollege.city}`,
          website: rawCollege.website || "",
          contact_email: rawCollege.contact_email || "",
          phone: rawCollege.phone || ""
        });
      }

      // Add branch to the college
      const college = collegeMap.get(collegeCode)!;
      college.branches.push({
        branch: rawCollege.branch,
        branch_code: rawCollege.branch_code,
        cutoff_rank: rawCollege.cutoff_rank,
        cutoff_percentile: rawCollege.cutoff_percentile,
        seats: rawCollege.seats,
        Fees: rawCollege.Fees,
        admission_chance: rawCollege.admission_chance,
        admission_chance_percentage: rawCollege.admission_chance_percentage,
        match_score: rawCollege.match_score,
        probability_level: rawCollege.probability_level,
        is_most_probable: rawCollege.is_most_probable,
      });
    });

    // Convert map to array and sort branches within each college by admission chance
    return Array.from(collegeMap.values()).map(college => ({
      ...college,
      branches: college.branches.sort((a, b) => b.admission_chance - a.admission_chance)
    }));
  };

  // Fetch all colleges from Supabase
  const fetchAllCollegesFromSupabase = async (): Promise<College[]> => {
    try {
      let { data: dbColleges, error } = await supabase
        .from('colleges_2025')
        .select('*');

      if (error) {
        console.error("Error fetching colleges from Supabase:", error);
        return [];
      }

      if (!dbColleges || dbColleges.length === 0) {
        console.log("No colleges found in Supabase");
        return [];
      }

      // Group colleges by college_code to ensure uniqueness
      const collegeMap = new Map<string, College>();

      dbColleges.forEach((college: any) => {
        const collegeCode = (college.college_code || college.College_code || college.id || "UNKNOWN").toString();
        const collegeName = college.college_name || college.College_name || "Unknown College";
        const city = college.city || college.City || "Unknown";

        if (!collegeCode || collegeCode === "UNKNOWN") return;

        if (!collegeMap.has(collegeCode)) {
          collegeMap.set(collegeCode, {
            college_code: collegeCode,
            college_name: collegeName,
            city: city,
            image: college.image_url || getCollegeImage(collegeCode),
            autonomy_status: college.autonomy_status || college.Autonomy_status || "Government",
            hostel_available: college.hostel_available || college.Hostel_available || "No",
            placement_rate: parseFloat(college.placement_rate || college.Placement_rate || 0),
            average_package_lpa: parseFloat(college.average_package_lpa || college.Average_package_lpa || 0),
            highest_package_lpa: parseFloat(college.highest_package_lpa || college.Highest_package_lpa || 0),
            branches: [],
            is_predicted: false,
            state: getStateFromCity(city),
            established_year: college.established_year || college.Established_year || 0,
            campus_size: college.campus_area || college.Campus_area ? `${college.campus_area || college.Campus_area} acres` : "N/A",
            faculty_count: college.student_faculty_ratio || college.Student_faculty_ratio || 0,
            accreditation: college.accreditation || college.Accreditation || "AICTE Approved",
            naac_grade: college.naac_grade || college.NAAC_grade || "N/A",
            research_papers: college.research_papers || college.Research_papers || 0,
            library_books: college.library_books || college.Library_books || 0,
            sports_facilities: (college.sports_facilities || college.Sports_facilities) ? (typeof (college.sports_facilities || college.Sports_facilities) === 'string' ? (college.sports_facilities || college.Sports_facilities).split(',') : (college.sports_facilities || college.Sports_facilities)) : [],
            clubs: [],
            campus_recruiters: (college.top_recruiters || college.Top_recruiters) ? (typeof (college.top_recruiters || college.Top_recruiters) === 'string' ? (college.top_recruiters || college.Top_recruiters).split(',') : (college.top_recruiters || college.Top_recruiters)) : [],
            website: college.website_url || college.Website_url || "",
            contact_email: college.contact_email || college.Contact_email || "",
            phone: college.contact_phone || college.Contact_phone || "",
            address: `${collegeName}, ${city}`
          });
        }

        // Add branch information
        const existingCollege = collegeMap.get(collegeCode)!;
        const branchName = college.branch_name || college.Branch_name || "N/A";

        // Avoid duplicate branches
        if (!existingCollege.branches.find(b => b.branch_code === (college.branch_code || college.Branch_code))) {
          existingCollege.branches.push({
            branch: branchName,
            branch_code: college.branch_code || college.Branch_code || "N/A",
            cutoff_rank: college.cutoff_rank || college.Cutoff_rank || 0,
            cutoff_percentile: college.cutoff_percentile || college.Cutoff_percentile || 0,
            seats: college.seats || college.Seats || 0,
            Fees: college.fees || college.Fees || 0,
            admission_chance: 0,
            admission_chance_percentage: "0%",
            match_score: 0,
            probability_level: "Unknown",
            is_most_probable: false,
          });
        }
      });

      const colleges = Array.from(collegeMap.values());
      console.log(`✅ Loaded ${colleges.length} unique colleges from Supabase`);

      return colleges;
    } catch (err) {
      console.error("Failed to fetch colleges from Supabase:", err);
      return [];
    }
  };


  // Simplified deduplication - trust the college_code
  const deduplicateColleges = (colleges: College[]): College[] => {
    const seenCodes = new Set<string>();
    const uniqueColleges: College[] = [];

    for (const college of colleges) {
      if (college.college_code && !seenCodes.has(college.college_code)) {
        seenCodes.add(college.college_code);
        uniqueColleges.push(college);
      }
    }

    return uniqueColleges;
  };

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      const { data: prof } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      return prof;
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allCollegesFromDB = await fetchAllCollegesFromSupabase();
        setAllColleges(allCollegesFromDB);

        if (profile) {
          const rank = profile.exam_type === "CET" ? parseFloat(profile.cet_rank || "0") : parseFloat(profile.diploma_rank || "0");
          const score = profile.exam_type === "CET" ? parseFloat(profile.cet_score || "0") : parseFloat(profile.diploma_score || "0");
          const category = profile.category || "OPEN";
          const branches = profile.preferred_branches || [];



          if (rank && score && branches.length) {
            try {
              const res = await axios.post("http://127.0.0.1:5001/predict_admission", {
                score,
                rank,
                category,
                branches,
              });

              const raw: RawCollege[] = res.data.colleges || [];
              const predicted = deduplicateColleges(groupCollegesByCode(raw));
              setColleges(predicted);

              const allCollegesMap = new Map<string, College>();
              allCollegesFromDB.forEach(c => allCollegesMap.set(c.college_code, c));

              predicted.forEach(p => {
                if (allCollegesMap.has(p.college_code)) {
                  const existing = allCollegesMap.get(p.college_code)!;
                  allCollegesMap.set(p.college_code, {
                    ...existing,
                    ...p,
                    established_year: existing.established_year || p.established_year,
                    campus_size: existing.campus_size !== "N/A" ? existing.campus_size : p.campus_size,
                    faculty_count: existing.faculty_count || p.faculty_count,
                    website: existing.website || p.website,
                    is_predicted: true
                  });
                } else {
                  allCollegesMap.set(p.college_code, p);
                }
              });

              setAllColleges(Array.from(allCollegesMap.values()));
            } catch (err) {
              console.error("❌ Prediction API failed", err);
            }
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("❌ Data load failed", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [profile]);

  return { colleges, allColleges, userProfile: profile, loading };
}

// ---------- MAIN COMPONENT ----------
export default function CollegeSearch() {
  const { colleges: predictedColleges, allColleges, userProfile, loading } = useCollegeData();
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [branchModal, setBranchModal] = useState<College | null>(null);
  const [detailsModal, setDetailsModal] = useState<College | null>(null);
  const [viewMode, setViewMode] = useState<"predicted" | "all">("all");
  const [sortBy] = useState("match_score");
  const [activeTab, setActiveTab] = useState<"list" | "grid" | "map">("grid");

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
  }, [loading, predictedColleges.length]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const branchesResponse = await axios.get("http://127.0.0.1:5001/branches");
        if (branchesResponse.data.branches) setAvailableBranches(branchesResponse.data.branches);
        const citiesResponse = await axios.get("http://127.0.0.1:5001/cities");
        if (citiesResponse.data.cities) setAvailableLocations(citiesResponse.data.cities);
      } catch (error) {
        if (allColleges.length > 0) {
          const branchesSet = new Set<string>();
          const locationsSet = new Set<string>();
          allColleges.forEach(college => {
            if (college.city) locationsSet.add(college.city);
            college.branches.forEach(branch => { if (branch.branch) branchesSet.add(branch.branch); });
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
    if (search.trim()) {
      const query = search.toLowerCase();
      filtered = filtered.filter(college =>
        (college.college_name?.toLowerCase() || "").includes(query) ||
        (college.city?.toLowerCase() || "").includes(query) ||
        (college.branches || []).some(b => (b.branch?.toLowerCase() || "").includes(query))
      );
    }
    if (filters.collegeType !== "All Types") filtered = filtered.filter(c => c.autonomy_status === filters.collegeType);
    if (filters.branch !== "All Branches") filtered = filtered.filter(c => c.branches.some(b => b.branch === filters.branch));
    if (filters.location) filtered = filtered.filter(c => c.city === filters.location);
    if (filters.minFees) filtered = filtered.filter(c => c.branches.some(b => b.Fees >= parseInt(filters.minFees)));
    if (filters.maxFees) filtered = filtered.filter(c => c.branches.some(b => b.Fees <= parseInt(filters.maxFees)));
    if (filters.admissionChance) filtered = filtered.filter(c => c.branches.some(b => b.admission_chance >= parseInt(filters.admissionChance)));
    if (filters.placementRate) filtered = filtered.filter(c => c.placement_rate >= parseInt(filters.placementRate));

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "match_score":
          const aScore = Math.max(...a.branches.map(b => b.match_score), 0);
          const bScore = Math.max(...b.branches.map(b => b.match_score), 0);
          return bScore - aScore;
        default: return 0;
      }
    });
  }, [currentColleges, search, filters, sortBy]);

  const clearFilters = () => {
    setFilters({ collegeType: "All Types", branch: "All Branches", location: "", minFees: "", maxFees: "", admissionChance: "", placementRate: "" });
    setSearch("");
  };

  const getProbabilityColor = (chance: number) => {
    if (chance >= 80) return "from-emerald-500 to-green-400";
    if (chance >= 60) return "from-blue-500 to-cyan-400";
    if (chance >= 40) return "from-amber-500 to-yellow-400";
    return "from-rose-500 to-pink-400";
  };

  useEffect(() => {
    const savedColleges = JSON.parse(localStorage.getItem("savedColleges") || "[]");
    setSaved(savedColleges);
  }, []);

  const toggleSaved = (code: string) => {
    const newSaved = saved.includes(code) ? saved.filter(c => c !== code) : [...saved, code];
    setSaved(newSaved);
    localStorage.setItem("savedColleges", JSON.stringify(newSaved));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar activeTab="search" userProfile={userProfile} />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium text-lg">Loading college intelligence...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SEO title="College Explorer" description="Explore engineering colleges with AI matching." />
      <Navbar activeTab="search" userProfile={userProfile} />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6">Discover Your <span className="text-indigo-400">Dream College</span></h1>
          <p className="text-base sm:text-xl text-white/80 mb-6 sm:mb-8 max-w-3xl mx-auto px-2">AI-powered predictions for India's premier engineering institutes.</p>

          <div className="inline-flex bg-white/5 backdrop-blur-sm rounded-2xl p-1.5 mb-6 sm:mb-8 border border-white/10 w-full sm:w-auto">
            <button onClick={() => setViewMode("predicted")} className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base ${viewMode === "predicted" ? "text-white bg-indigo-600" : "text-white/60"}`}>
              <Brain className="w-4 h-4 sm:w-5 sm:h-5" /> AI Predictions
            </button>
            <button onClick={() => setViewMode("all")} className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base ${viewMode === "all" ? "text-white bg-white/10" : "text-white/60"}`}>
              <Database className="w-4 h-4 sm:w-5 sm:h-5" /> All Colleges
            </button>
          </div>

          <div className="relative max-w-4xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl p-1 shadow-2xl gap-1 sm:gap-0">
              <Search className="hidden sm:block w-5 h-5 text-slate-400 ml-5" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search colleges, branches, cities..." className="flex-1 py-4 sm:py-5 px-4 outline-none text-slate-900 placeholder-slate-400 text-base sm:text-lg rounded-xl sm:rounded-none" />
              <button className="px-6 sm:px-8 py-3 sm:py-3.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 mx-1 sm:mx-0">Search</button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12 flex-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab("grid")} className={`p-3 rounded-xl ${activeTab === "grid" ? "bg-indigo-50 text-indigo-600" : "bg-white text-slate-400"}`}><Grid3x3 className="w-5 h-5" /></button>
            <button onClick={() => setActiveTab("list")} className={`p-3 rounded-xl ${activeTab === "list" ? "bg-indigo-50 text-indigo-600" : "bg-white text-slate-400"}`}><List className="w-5 h-5" /></button>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 w-full sm:w-auto">
            <FilterSelect
              label="Institute Type"
              value={filters.collegeType}
              onChange={(v: string) => setFilters(p => ({ ...p, collegeType: v }))}
              options={["All Types", "Government", "Private", "Autonomous"]}
              icon={<Building className="w-3.5 h-3.5" />}
            />
            <FilterSelect
              label="Branch Preference"
              value={filters.branch}
              onChange={(v: string) => setFilters(p => ({ ...p, branch: v }))}
              options={["All Branches", ...availableBranches.filter(b => b !== "All Branches")]}
              icon={<Cpu className="w-3.5 h-3.5" />}
            />
            <FilterSelect
              label="Preferred City"
              value={filters.location || "All Locations"}
              onChange={(v: string) => setFilters(p => ({ ...p, location: v === "All Locations" ? "" : v }))}
              options={["All Locations", ...availableLocations.filter(l => l !== "All Locations")]}
              icon={<MapPin className="w-3.5 h-3.5" />}
            />
          </div>
        </div>

        <div className="min-h-[600px]">
          {filteredColleges.length > 0 ? (
            activeTab === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredColleges.map((college, i) => (
                  <CollegeCard key={college.college_code} college={college} index={i} saved={saved.includes(college.college_code)} onToggleSaved={() => toggleSaved(college.college_code)} onOpenBranches={() => setBranchModal(college)} onViewDetails={() => setDetailsModal(college)} isPredicted={viewMode === "predicted"} />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredColleges.map((college, i) => (
                  <CollegeListCard key={college.college_code} college={college} index={i} saved={saved.includes(college.college_code)} onToggleSaved={() => toggleSaved(college.college_code)} onOpenBranches={() => setBranchModal(college)} onViewDetails={() => setDetailsModal(college)} isPredicted={viewMode === "predicted"} />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <SearchX className="w-20 h-20 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900">No colleges matched your filters</h3>
              <button onClick={clearFilters} className="mt-4 text-indigo-600 font-bold">Clear all filters</button>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {branchModal && <BranchModal college={branchModal} onClose={() => setBranchModal(null)} getProbabilityColor={getProbabilityColor} />}
        {detailsModal && <CollegeDetailsModal college={detailsModal} onClose={() => setDetailsModal(null)} getProbabilityColor={getProbabilityColor} />}
      </AnimatePresence>
      <Footer />
    </div>
  );
}

// ---------- COMPONENTS ----------

function FilterSelect({ label, value, onChange, options, icon }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">{icon}{label}</label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none appearance-none font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20">
          {options.map((o: any) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      </div>
    </div>
  );
}

function CollegeCard({ college, index, saved, onToggleSaved, onOpenBranches, onViewDetails, isPredicted }: any) {
  const bestBranch = college.branches.reduce((a: any, b: any) => a.admission_chance > b.admission_chance ? a : b);
  const color = bestBranch.admission_chance >= 70 ? "text-emerald-600" : bestBranch.admission_chance >= 40 ? "text-indigo-600" : "text-amber-600";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all group">
      <div className="h-48 relative overflow-hidden">
        <img src={college.image} onError={handleImageError} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        {isPredicted && (
          <div className="absolute top-4 left-6 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg border border-white/20 uppercase tracking-widest z-10">AI Match</div>
        )}
        <button onClick={onToggleSaved} className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur rounded-2xl shadow-xl">{saved ? <BookmarkCheck className="text-indigo-600 fill-indigo-600" /> : <Bookmark className="text-slate-400" />}</button>
        <div className="absolute bottom-4 left-6 text-white">
          <h3 className="text-xl font-bold line-clamp-1">{college.college_name}</h3>
          <p className="text-sm opacity-90 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{college.city}</p>
        </div>
      </div>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">AI Matching Chance</p>
            <p className={`text-2xl font-black ${color}`}>{bestBranch.admission_chance.toFixed(1)}%</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Avg Pkg</p>
            <p className="text-lg font-bold text-slate-900">₹{college.average_package_lpa}L</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onOpenBranches} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">Branches</button>
          <button onClick={onViewDetails} className="flex-1 py-4 bg-slate-50 text-slate-700 rounded-2xl font-bold text-sm border border-slate-200 hover:bg-slate-100 transition-colors">Details</button>
        </div>
      </div>
    </motion.div>
  );
}

function CollegeListCard({ college, index, saved, onToggleSaved, onOpenBranches, onViewDetails }: any) {
  const bestBranch = college.branches.reduce((a: any, b: any) => a.admission_chance > b.admission_chance ? a : b);
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col md:flex-row gap-8 hover:shadow-xl transition-all">
      <div className="w-full md:w-64 h-48 rounded-2xl overflow-hidden flex-shrink-0">
        <img src={college.image} onError={handleImageError} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 py-2">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{college.college_name}</h3>
            <p className="text-slate-500 font-medium flex items-center gap-1.5 text-sm uppercase tracking-wide"><MapPin className="w-4 h-4 text-indigo-500" />{college.city} • {college.autonomy_status}</p>
          </div>
          <button onClick={onToggleSaved} className="p-3 bg-slate-50 rounded-2xl">{saved ? <BookmarkCheck className="text-indigo-600 fill-indigo-600" /> : <Bookmark className="text-slate-400" />}</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">AI Chance</p><p className="text-xl font-bold text-indigo-600">{(bestBranch.admission_chance).toFixed(1)}%</p></div>
          <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Pkg</p><p className="text-xl font-bold text-slate-900">₹{college.average_package_lpa}L</p></div>
          <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">High Pkg</p><p className="text-xl font-bold text-emerald-600">₹{college.highest_package_lpa}L</p></div>
          <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Placement</p><p className="text-xl font-bold text-slate-900">{college.placement_rate}%</p></div>
        </div>
        <div className="flex gap-4">
          <button onClick={onOpenBranches} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold">Branches</button>
          <button onClick={onViewDetails} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold">Full Profile</button>
        </div>
      </div>
    </motion.div>
  );
}

function BranchModal({ college, onClose, getProbabilityColor }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} className="bg-white rounded-[2rem] max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-slate-900 p-8 md:p-10 relative flex-shrink-0">
          <div className="relative flex items-start justify-between">
            <div className="space-y-4">
              <span className="px-3 py-1 bg-indigo-500/10 rounded-lg text-xs font-bold text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">Available Specializations</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">{college.college_name}</h2>
              <div className="flex items-center gap-6 text-slate-400">
                <span className="flex items-center gap-2 text-sm font-medium leading-none"><MapPin className="w-4 h-4 text-indigo-400" />{college.city}</span>
                <span className="h-1.5 w-1.5 bg-slate-700 rounded-full" />
                <span className="text-emerald-400 text-sm font-bold">{college.placement_rate}% Placement</span>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors border border-slate-700"><X className="w-6 h-6 text-slate-300" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {college.branches.map((b: any, i: number) => (
              <div key={i} className="bg-white rounded-3xl p-8 border border-slate-200">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded border border-slate-100">{b.branch_code}</span>
                    <h4 className="text-xl font-bold text-slate-900 mt-2">{b.branch}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Chance</p>
                    <p className={`text-xl font-bold ${b.admission_chance >= 70 ? 'text-emerald-600' : 'text-indigo-600'}`}>{(b.admission_chance).toFixed(1)}%</p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-8">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${b.admission_chance}%` }} className={`h-full bg-gradient-to-r ${getProbabilityColor(b.admission_chance)}`} />
                </div>
                <div className="grid grid-cols-3 gap-8">
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cutoff</p><p className="font-bold text-slate-700">{b.cutoff_rank || 'N/A'}</p></div>
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Seats</p><p className="font-bold text-slate-700">{b.seats}</p></div>
                  <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fees</p><p className="font-bold text-slate-700">₹{b.Fees?.toLocaleString()}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CollegeDetailsModal({ college, onClose, getProbabilityColor }: any) {
  const bestBranch = college.branches.reduce((a: any, b: any) => a.admission_chance > b.admission_chance ? a : b);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-[120] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} className="bg-white rounded-[2.5rem] max-w-6xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-slate-900 p-10 relative overflow-hidden flex-shrink-0">
          <div className="relative flex items-start justify-between">
            <div className="space-y-4">
              <span className="px-4 py-1 bg-indigo-500/20 text-indigo-400 text-[11px] font-black uppercase tracking-widest rounded-full border border-indigo-500/30">Official Institute Profile</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">{college.college_name}</h2>
              <div className="flex flex-wrap items-center gap-6 text-slate-400">
                <span className="flex items-center gap-2"><MapPin className="w-5 h-5 text-indigo-400" />{college.city}, {college.state || 'Maharashtra'}</span>
                <span className="h-2 w-2 bg-slate-700 rounded-full" />
                <span className="flex items-center gap-2"><Award className="w-5 h-5 text-indigo-400" />{college.naac_grade || 'A+'} Grade • {college.autonomy_status}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-4 bg-slate-800 text-slate-300 rounded-2xl hover:bg-slate-700 transition-colors border border-slate-700"><X className="w-6 h-6" /></button>
          </div>
          <div className="flex gap-12 mt-12 bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 backdrop-blur-lg">
            <div className="space-y-1"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Average Pkg</p><p className="text-3xl font-bold text-white">₹{college.average_package_lpa} LPA</p></div>
            <div className="w-px bg-slate-700" />
            <div className="space-y-1"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Highest Pkg</p><p className="text-3xl font-bold text-emerald-400">₹{college.highest_package_lpa} LPA</p></div>
            <div className="w-px bg-slate-700" />
            <div className="space-y-1"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Placement</p><p className="text-3xl font-bold text-white">{college.placement_rate}%</p></div>
            <div className="w-px bg-slate-700" />
            <div className="space-y-1"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Match Chance</p><p className="text-3xl font-bold text-indigo-400">{(bestBranch.admission_chance).toFixed(1)}%</p></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 bg-slate-50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
            <div className="lg:col-span-2 space-y-12">
              <section>
                <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3"><Info className="w-6 h-6 text-indigo-600" /> Overview</h3>
                <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm grid grid-cols-2 md:grid-cols-3 gap-10">
                  <div><p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-black">Estd.</p><p className="font-bold text-slate-700 text-lg">{college.established_year || '1995'}</p></div>
                  <div><p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-black">Campus</p><p className="font-bold text-slate-700 text-lg">{college.campus_size || '25 Acres'}</p></div>
                  <div><p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-black">Faculty</p><p className="font-bold text-slate-700 text-lg">{college.faculty_count || '600'}+</p></div>
                  <div><p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-black">Papers</p><p className="font-bold text-slate-700 text-lg">{college.research_papers || '1200'}+</p></div>
                  <div><p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-black">Hostel</p><p className="font-bold text-emerald-600 text-lg">{college.hostel_available}</p></div>
                  <div><p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-black">Ranking</p><p className="font-bold text-indigo-600 text-lg">NIRF#Top 50</p></div>
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3"><Layers className="w-6 h-6 text-indigo-600" /> Specializations</h3>
                <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100"><tr className="text-left"><th className="py-5 px-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">Specialization</th><th className="py-5 px-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">AI Chance</th><th className="py-5 px-8 text-[11px] font-black text-slate-500 uppercase tracking-widest">Fees</th></tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {college.branches.map((b: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-6 px-8"><p className="font-bold text-slate-800">{b.branch}</p><p className="text-xs text-slate-400 font-bold">{b.branch_code}</p></td>
                          <td className="py-6 px-8"><div className="flex items-center gap-3"><div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full bg-gradient-to-r ${getProbabilityColor(b.admission_chance)}`} style={{ width: `${b.admission_chance}%` }} /></div><span className="font-black text-slate-600 text-sm">{(b.admission_chance).toFixed(1)}%</span></div></td>
                          <td className="py-6 px-8 font-bold text-slate-700">₹{b.Fees?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="space-y-12">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <h4 className="text-xl font-bold mb-8 flex items-center gap-3"><Mail className="w-6 h-6 text-indigo-400" /> Admissions</h4>
                <div className="space-y-8 relative z-10">
                  <div className="space-y-2"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact Address</p><p className="text-sm font-medium text-slate-300 leading-relaxed">{college.address || `${college.college_name}, ${college.city}`}</p></div>
                  <div className="space-y-2"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Helpline</p><p className="text-sm font-medium text-slate-300">{college.phone || '+91 000 000 0000'}</p></div>
                  <div className="space-y-2"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email</p><p className="text-sm font-medium text-slate-300">{college.contact_email || 'admissions@institute.edu'}</p></div>
                  <a href={college.website} target="_blank" className="block w-full text-center py-4 bg-indigo-600 rounded-2xl font-bold hover:bg-indigo-700 transition-colors">Visit Official Website</a>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm">
                <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3"><Briefcase className="w-6 h-6 text-indigo-600" /> Partners</h4>
                <div className="flex flex-wrap gap-3">
                  {['Google', 'TCS', 'Amazon', 'Wipro', 'Infosys', 'Accenture', 'Intel'].map(r => <span key={r} className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 border border-slate-100">{r}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
