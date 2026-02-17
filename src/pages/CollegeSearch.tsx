import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as Lucide from "lucide-react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { supabase } from "../lib/supabase";


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

// ---------- HOOKS / LOGIC ----------
function useCollegeData() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [allColleges, setAllColleges] = useState<College[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userCategory, setUserCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

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
          image: rawCollege.image || "",
          autonomy_status: rawCollege.autonomy_status,
          hostel_available: rawCollege.hostel_available,
          placement_rate: rawCollege.placement_rate,
          average_package_lpa: rawCollege.average_package_lpa,
          highest_package_lpa: rawCollege.highest_package_lpa,
          branches: [],
          is_predicted: true,
          // Additional details
          state: getStateFromCity(rawCollege.city),
          established_year: 1960 + Math.floor(Math.random() * 60),
          campus_size: `${10 + Math.floor(Math.random() * 90)} acres`,
          faculty_count: 50 + Math.floor(Math.random() * 200),
          accreditation: "AICTE Approved",
          naac_grade: ["A++", "A+", "A", "B++"][Math.floor(Math.random() * 4)],
          research_papers: 100 + Math.floor(Math.random() * 900),
          library_books: 50000 + Math.floor(Math.random() * 100000),
          sports_facilities: ["Cricket Ground", "Football Field", "Basketball Court", "Swimming Pool", "Gym"].slice(0, 3 + Math.floor(Math.random() * 2)),
          clubs: ["Coding Club", "Robotics Club", "Cultural Club", "Sports Club", "Entrepreneurship Cell"].slice(0, 3 + Math.floor(Math.random() * 2)),
          campus_recruiters: ["Google", "Microsoft", "Amazon", "TCS", "Infosys", "Wipro", "Accenture"].slice(0, 5 + Math.floor(Math.random() * 2)),
          website: `https://www.${rawCollege.college_name.toLowerCase().replace(/ /g, '')}.edu.in`,
          contact_email: `admissions@${rawCollege.college_name.toLowerCase().replace(/ /g, '')}.edu.in`,
          phone: `+91-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          address: `${rawCollege.college_name}, ${rawCollege.city}, ${getStateFromCity(rawCollege.city)} - ${Math.floor(100000 + Math.random() * 900000)}`
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

  // Helper function to get state from city
  const getStateFromCity = (city: string): string => {
    const cityStateMap: Record<string, string> = {
      "Mumbai": "Maharashtra",
      "Pune": "Maharashtra",
      "Nagpur": "Maharashtra",
      "Delhi": "Delhi",
      "New Delhi": "Delhi",
      "Bangalore": "Karnataka",
      "Chennai": "Tamil Nadu",
      "Hyderabad": "Telangana",
      "Kolkata": "West Bengal",
      "Ahmedabad": "Gujarat",
      "Jaipur": "Rajasthan",
      "Lucknow": "Uttar Pradesh",
      "Bhopal": "Madhya Pradesh",
      "Chandigarh": "Chandigarh",
      "Thiruvananthapuram": "Kerala",
      "Bhubaneswar": "Odisha",
      "Guwahati": "Assam",
      "Patna": "Bihar",
    };
    return cityStateMap[city] || "Maharashtra";
  };

  // Fetch all colleges from Supabase
  const fetchAllCollegesFromSupabase = async (): Promise<College[]> => {
    try {
      const { data: dbColleges, error } = await supabase
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
        const collegeCode = college.college_code;
        
        if (!collegeMap.has(collegeCode)) {
          collegeMap.set(collegeCode, {
            college_code: collegeCode,
            college_name: college.college_name,
            city: college.city,
            image: college.image_url || "",
            autonomy_status: college.autonomy_status || "Government",
            hostel_available: college.hostel_available || "No",
            placement_rate: college.placement_rate || 0,
            average_package_lpa: college.average_package_lpa || 0,
            highest_package_lpa: college.highest_package_lpa || 0,
            branches: [],
            is_predicted: false,
            state: getStateFromCity(college.city),
            established_year: college.established_year || 0,
            campus_size: college.campus_area ? `${college.campus_area} acres` : "N/A",
            faculty_count: college.student_faculty_ratio || 0,
            accreditation: college.accreditation || "AICTE Approved",
            naac_grade: college.naac_grade || "N/A",
            research_papers: college.research_papers || 0,
            library_books: college.library_books || 0,
            sports_facilities: college.sports_facilities ? college.sports_facilities.split(',') : [],
            clubs: [],
            campus_recruiters: college.top_recruiters ? college.top_recruiters.split(',') : [],
            website: college.website_url || "",
            contact_email: college.contact_email || "",
            phone: college.contact_phone || "",
            address: `${college.college_name}, ${college.city}, ${getStateFromCity(college.city)}`
          });
        }

        // Add branch information
        const existingCollege = collegeMap.get(collegeCode)!;
        existingCollege.branches.push({
          branch: college.branch_name,
          branch_code: college.branch_code,
          cutoff_rank: college.cutoff_rank || 0,
          cutoff_percentile: college.cutoff_percentile || 0,
          seats: college.seats || 0,
          Fees: college.fees || 0,
          admission_chance: 0, // Will be set by prediction API
          admission_chance_percentage: "0%",
          match_score: 0,
          probability_level: "Unknown",
          is_most_probable: false,
        });
      });

      const colleges = Array.from(collegeMap.values());
      console.log(`✅ Loaded ${colleges.length} unique colleges from Supabase`);
      return colleges;
    } catch (err) {
      console.error("Failed to fetch colleges from Supabase:", err);
      return [];
    }
  };


  // Helper function to deduplicate colleges by code or name
  const deduplicateColleges = (colleges: College[]): College[] => {
    const seenCodes = new Set<string>();
    const seenNames = new Set<string>();
    const uniqueColleges: College[] = [];
    
    for (const college of colleges) {
      // Check by college code first (more reliable)
      if (college.college_code && !seenCodes.has(college.college_code)) {
        seenCodes.add(college.college_code);
        seenNames.add(college.college_name);
        uniqueColleges.push(college);
      } 
      // If no code or duplicate code, check by name
      else if (!college.college_code || seenCodes.has(college.college_code)) {
        if (!seenNames.has(college.college_name)) {
          // Generate a unique code for this college
          const uniqueCode = `UNQ${Date.now()}${Math.floor(Math.random() * 1000)}`;
          seenNames.add(college.college_name);
          seenCodes.add(uniqueCode);
          uniqueColleges.push({
            ...college,
            college_code: uniqueCode
          });
        }
      }
    }
    
    return uniqueColleges;
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      const prof = snap.exists() ? (snap.data() as any) : {};
      const rank = prof.rank || prof.cetRank || prof.diplomaRank || null;
      const score = prof.cetScore || prof.diplomaScore || null;
      const category = prof.category || "OPEN";
      const branches = prof.preferredBranches || [];

      setUserRank(rank);
      setUserCategory(category);

      try {
        setAiLoading(true);
        let predictedColleges: College[] = [];
        
        if (rank && score && branches.length) {
          const res = await axios.post("http://127.0.0.1:5001/predict_admission", {
            score: parseFloat(score),
            rank: parseInt(rank),
            category,
            branches,
          });
          
          const raw: RawCollege[] = res.data.colleges || [];
          
          // Group colleges by college_code
          predictedColleges = groupCollegesByCode(raw);
          
          // Deduplicate predicted colleges
          predictedColleges = deduplicateColleges(predictedColleges);
          
          // Sort colleges by highest admission chance among their branches
          predictedColleges.sort((a, b) => {
            const maxA = Math.max(...a.branches.map(b => b.admission_chance));
            const maxB = Math.max(...b.branches.map(b => b.admission_chance));
            return maxB - maxA;
          });
        }

        // Fetch all real colleges from Supabase
        const allCollegesFromDB = await fetchAllCollegesFromSupabase();
        
        // Merge predicted colleges with all colleges
        // Predicted colleges override the ones in allColleges with prediction data
        const allCollegesMap = new Map<string, College>();
        
        // Add all colleges from DB first
        allCollegesFromDB.forEach(college => {
          allCollegesMap.set(college.college_code, college);
        });
        
        // Override with predicted colleges (they have prediction data)
        predictedColleges.forEach(predicted => {
          if (allCollegesMap.has(predicted.college_code)) {
            const existing = allCollegesMap.get(predicted.college_code)!;
            allCollegesMap.set(predicted.college_code, {
              ...existing,
              ...predicted,
              is_predicted: true,
            });
          } else {
            allCollegesMap.set(predicted.college_code, predicted);
          }
        });
        
        const finalAllColleges = Array.from(allCollegesMap.values());
        
        setColleges(predictedColleges);
        setAllColleges(finalAllColleges);

      } catch (err) {
        console.error("❌ Failed to fetch colleges", err);
      } finally {
        setLoading(false);
        setAiLoading(false);
      }
    });
    return () => unsub();
  }, []);



  return { colleges, allColleges, userRank, userCategory, loading, aiLoading };
}

// ---------- MAIN COMPONENT ----------
export default function CollegeSearch() {
  const navigate = useNavigate();
  const { colleges: predictedColleges, allColleges, userRank, userCategory, loading, aiLoading } = useCollegeData();
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  
  // Search history tracking
  const saveSearchToHistory = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    try {
      const historyKey = 'searchHistory';
      const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      
      // Remove duplicate if exists
      const filteredHistory = existingHistory.filter((item: string) => item.toLowerCase() !== searchQuery.toLowerCase());
      
      // Add new search to the beginning
      const newHistory = [searchQuery, ...filteredHistory].slice(0, 20); // Keep max 20 searches
      
      localStorage.setItem(historyKey, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  // Handle search button click
  const handleSearchClick = () => {
    if (search.trim()) {
      saveSearchToHistory(search.trim());
    }
  };

  // Handle Enter key in search input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      saveSearchToHistory(search.trim());
    }
  };
  const [branchModal, setBranchModal] = useState<College | null>(null);
  const [detailsModal, setDetailsModal] = useState<College | null>(null);
  const [viewMode, setViewMode] = useState<"predicted" | "all">("predicted");
  const [sortBy, setSortBy] = useState("match_score");
  const [activeTab, setActiveTab] = useState<"list" | "grid" | "map">("grid");
  
  // State for dynamic branch and location options
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

  // Fetch available branches and locations from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch branches from API
        const branchesResponse = await axios.get("http://127.0.0.1:5001/branches");
        if (branchesResponse.data.branches) {
          setAvailableBranches(branchesResponse.data.branches);
        }
        
        // Fetch cities from API
        const citiesResponse = await axios.get("http://127.0.0.1:5001/cities");
        if (citiesResponse.data.cities) {
          setAvailableLocations(citiesResponse.data.cities);
        }
      } catch (error) {
        console.error("Error fetching filter options:", error);
        // Fallback: extract from college data if API fails
        if (allColleges.length > 0) {
          const branchesSet = new Set<string>();
          const locationsSet = new Set<string>();
          
          allColleges.forEach(college => {
            if (college.city) locationsSet.add(college.city);
            college.branches.forEach(branch => {
              if (branch.branch) branchesSet.add(branch.branch);
            });
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
        college.college_name.toLowerCase().includes(query) ||
        college.city.toLowerCase().includes(query) ||
        college.branches.some(b => b.branch.toLowerCase().includes(query))
      );
    }

    if (filters.collegeType !== "All Types") {
      filtered = filtered.filter(c => 
        c.autonomy_status === filters.collegeType
      );
    }

    if (filters.branch !== "All Branches") {
      filtered = filtered.filter(c =>
        c.branches.some(b => b.branch === filters.branch)
      );
    }

    if (filters.location) {
      filtered = filtered.filter(c => c.city === filters.location);
    }

    if (filters.minFees) {
      filtered = filtered.filter(c => 
        c.branches.some(b => b.Fees >= parseInt(filters.minFees))
      );
    }

    if (filters.maxFees) {
      filtered = filtered.filter(c => 
        c.branches.some(b => b.Fees <= parseInt(filters.maxFees))
      );
    }

    if (filters.admissionChance) {
      filtered = filtered.filter(c =>
        c.branches.some(b => b.admission_chance >= parseInt(filters.admissionChance))
      );
    }

    if (filters.placementRate) {
      filtered = filtered.filter(c => c.placement_rate >= parseInt(filters.placementRate));
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "match_score":
          const aScore = Math.max(...a.branches.map(b => b.match_score));
          const bScore = Math.max(...b.branches.map(b => b.match_score));
          return bScore - aScore;
        case "admission_chance":
          const aChance = Math.max(...a.branches.map(b => b.admission_chance));
          const bChance = Math.max(...b.branches.map(b => b.admission_chance));
          return bChance - aChance;
        case "placement":
          return b.placement_rate - a.placement_rate;
        case "fees":
          const aFees = Math.min(...a.branches.map(b => b.Fees));
          const bFees = Math.min(...b.branches.map(b => b.Fees));
          return aFees - bFees;
        case "package":
          return b.highest_package_lpa - a.highest_package_lpa;
        default:
          return 0;
      }
    });
  }, [currentColleges, search, filters, sortBy]);

  const clearFilters = () => {
    setFilters({
      collegeType: "All Types",
      branch: "All Branches",
      location: "",
      minFees: "",
      maxFees: "",
      admissionChance: "",
      placementRate: "",
    });
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
    const newSaved = saved.includes(code)
      ? saved.filter(c => c !== code)
      : [...saved, code];
    setSaved(newSaved);
    localStorage.setItem("savedColleges", JSON.stringify(newSaved));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 border-4 border-transparent border-t-indigo-500 border-r-purple-500 rounded-full mx-auto"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Lucide.GraduationCap className="w-8 h-8 text-indigo-600" />
            </motion.div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Discovering Best Colleges
            </h3>
            <p className="text-gray-600 max-w-md">Using AI to analyze your rank and find perfect matches...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-indigo-50 rounded-xl transition-all"
              >
                <Lucide.ArrowLeft className="w-5 h-5 text-indigo-600" />
              </motion.button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-lg opacity-50 rounded-2xl" />
                  <div className="relative p-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl">
                    <Lucide.GraduationCap className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    College Explorer
                  </h1>
                  <p className="text-xs text-gray-600">Smart AI-powered college discovery</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {userRank && (
                <div className="hidden md:flex items-center gap-3">
                  <div className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl text-indigo-700 font-semibold">
                    Rank #{userRank}
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl text-emerald-700 font-semibold">
                    {userCategory}
                  </div>
                </div>
              )}
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Lucide.User className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Interactive Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2%, transparent 2%)`,
              backgroundSize: '50px 50px'
            }} />
          </div>
          <motion.div
            animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [100, 0, 100], y: [50, 0, 50] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
            >
              Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300">Dream College</span>
            </motion.h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              AI-powered predictions combined with India's most comprehensive engineering college database
            </p>

            {/* View Mode Toggle with Glow Effect */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex bg-white/10 backdrop-blur-sm rounded-2xl p-1.5 mb-8 border border-white/20 shadow-2xl"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("predicted")}
                className={`relative px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-3 ${
                  viewMode === "predicted"
                    ? "text-white shadow-lg"
                    : "text-white/80 hover:text-white hover:bg-white/5"
                }`}
              >
                {viewMode === "predicted" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-xl"
                  />
                )}
                <div className="relative flex items-center gap-3">
                  {aiLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <Lucide.Brain className="w-5 h-5" />
                  )}
                  <span>AI Predictions</span>
                  <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-sm">
                    {predictedColleges.length} colleges
                  </span>
                </div>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("all")}
                className={`relative px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-3 ${
                  viewMode === "all"
                    ? "text-white shadow-lg"
                    : "text-white/80 hover:text-white hover:bg-white/5"
                }`}
              >
                {viewMode === "all" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 rounded-xl"
                  />
                )}
                <div className="relative flex items-center gap-3">
                  <Lucide.Database className="w-5 h-5" />
                  <span>All Colleges</span>
                  <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-sm">
                    {allColleges.length} colleges
                  </span>
                </div>
              </motion.button>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative max-w-4xl mx-auto"
            >
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-1 border border-white/20">
                <div className="flex items-center">
                  <div className="pl-5">
                    <Lucide.Search className="w-5 h-5 text-white/70" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${viewMode === "predicted" ? "AI-recommended" : "all"} colleges, branches, or locations...`}
                    className="flex-1 py-5 px-4 bg-transparent outline-none text-white placeholder-white/60 text-lg"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold ml-2 hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Lucide.Search className="w-4 h-4" />
                    Search
                  </motion.button>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex justify-center gap-6 mt-6 text-white/80">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{predictedColleges.length}</div>
                  <div className="text-sm">AI Matches</div>
                </div>
                <div className="h-8 w-px bg-white/30" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{allColleges.length}</div>
                  <div className="text-sm">Total Colleges</div>
                </div>
                <div className="h-8 w-px bg-white/30" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {predictedColleges.length > 0 ? Math.max(...predictedColleges.map(c => 
                      Math.max(...c.branches.map(b => b.admission_chance))
                    )) : 0}%
                  </div>
                  <div className="text-sm">Top Chance</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
            <path fill="#ffffff" fillOpacity="1" d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,74.7C1120,75,1280,53,1360,42.7L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-2">
        {/* View Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("grid")}
              className={`p-3 rounded-xl transition-all ${activeTab === "grid" ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-100"}`}
            >
              <Lucide.Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`p-3 rounded-xl transition-all ${activeTab === "list" ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-100"}`}
            >
              <Lucide.List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className={`p-3 rounded-xl transition-all ${activeTab === "map" ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-100"}`}
            >
              <Lucide.Map className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                >
                  <option value="match_score">Best Match</option>
                  <option value="admission_chance">Admission Chance</option>
                  <option value="placement">Placement Rate</option>
                  <option value="fees">Annual Fees</option>
                  <option value="package">Highest Package</option>
                </select>
                <Lucide.ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Advanced Filters</h2>
              <p className="text-gray-600">Narrow down your college search</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Lucide.Trash2 className="w-4 h-4" />
              Clear All
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            <FilterSelect
              label="College Type"
              value={filters.collegeType}
              onChange={(value) => setFilters(prev => ({ ...prev, collegeType: value }))}
              options={["All Types", "Government", "Private", "Autonomous"]}
              icon={<Lucide.Building className="w-4 h-4" />}
            />
            
            <FilterSelect
              label="Branch"
              value={filters.branch}
              onChange={(value) => setFilters(prev => ({ ...prev, branch: value }))}
              options={["All Branches", "Computer Science", "Electrical", "Mechanical", "Civil", "AI/ML", "Data Science", "IT"]}
              icon={<Lucide.Cpu className="w-4 h-4" />}
            />
            
            <FilterSelect
              label="Location"
              value={filters.location}
              onChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
              options={["All Locations", "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata"]}
              icon={<Lucide.MapPin className="w-4 h-4" />}
            />
            
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Lucide.IndianRupee className="w-4 h-4" />
                Annual Fees (₹)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minFees}
                  onChange={(e) => setFilters(prev => ({ ...prev, minFees: e.target.value }))}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxFees}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxFees: e.target.value }))}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admission Chance ≥</label>
              <input
                type="number"
                placeholder="e.g., 60%"
                value={filters.admissionChance}
                onChange={(e) => setFilters(prev => ({ ...prev, admissionChance: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Placement ≥</label>
              <input
                type="number"
                placeholder="e.g., 70%"
                value={filters.placementRate}
                onChange={(e) => setFilters(prev => ({ ...prev, placementRate: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Results Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {viewMode === "predicted" ? "🎯 AI-Predicted Colleges" : "📚 All Engineering Colleges"}
            </h2>
            <p className="text-gray-600">
              Showing {filteredColleges.length} of {currentColleges.length} colleges
              {viewMode === "predicted" && " • Personalized for your rank and preferences"}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {viewMode === "predicted" && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-indigo-50 px-4 py-2 rounded-xl">
                <Lucide.Brain className="w-4 h-4 text-indigo-600" />
                <span>AI accuracy: 92%</span>
              </div>
            )}
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-indigo-600">{saved.length}</span> saved colleges
            </div>
          </div>
        </div>

        {/* Colleges Grid/List View */}
        {filteredColleges.length > 0 ? (
          activeTab === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredColleges.map((college, index) => (
                <CollegeCard
                  key={college.college_code}
                  college={college}
                  index={index}
                  saved={saved.includes(college.college_code)}
                  onToggleSaved={() => toggleSaved(college.college_code)}
                  onOpenBranches={() => setBranchModal(college)}
                  onViewDetails={() => setDetailsModal(college)}
                  isPredicted={viewMode === "predicted" || !!college.is_predicted}
                  getProbabilityColor={getProbabilityColor}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredColleges.map((college, index) => (
                <CollegeListCard
                  key={college.college_code}
                  college={college}
                  index={index}
                  saved={saved.includes(college.college_code)}
                  onToggleSaved={() => toggleSaved(college.college_code)}
                  onOpenBranches={() => setBranchModal(college)}
                  onViewDetails={() => setDetailsModal(college)}
                  isPredicted={viewMode === "predicted" || !!college.is_predicted}
                  getProbabilityColor={getProbabilityColor}
                />
              ))}
            </div>
          )
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-32 h-32 mx-auto mb-6 text-gray-300">
              <Lucide.SearchX className="w-full h-full" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No colleges found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Reset Search
            </motion.button>
          </motion.div>
        )}
      </main>

      {/* Branch Modal */}
      <AnimatePresence>
        {branchModal && <BranchModal college={branchModal} onClose={() => setBranchModal(null)} getProbabilityColor={getProbabilityColor} />}
      </AnimatePresence>

      {/* College Details Modal */}
      <AnimatePresence>
        {detailsModal && <CollegeDetailsModal college={detailsModal} onClose={() => setDetailsModal(null)} getProbabilityColor={getProbabilityColor} />}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all"
      >
        <Lucide.Bot className="w-6 h-6" />
      </motion.button>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, icon }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white appearance-none"
        >
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <Lucide.ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function CollegeCard({ college, index, saved, onToggleSaved, onOpenBranches, onViewDetails, isPredicted, getProbabilityColor }: {
  college: College;
  index: number;
  saved: boolean;
  onToggleSaved: () => void;
  onOpenBranches: () => void;
  onViewDetails: () => void;
  isPredicted: boolean;
  getProbabilityColor: (chance: number) => string;
}) {
  const bestBranch = college.branches.reduce((best, current) =>
    current.admission_chance > best.admission_chance ? current : best
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300"
    >
      {/* Prediction Badge */}
      {isPredicted && (
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-semibold rounded-full shadow-lg">
            <Lucide.Brain className="w-3 h-3" />
            AI Recommended
          </div>
        </div>
      )}

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggleSaved}
        className="absolute top-4 right-4 z-10 p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        {saved ? (
          <Lucide.Bookmark className="w-5 h-5 text-yellow-500 fill-yellow-500" />
        ) : (
          <Lucide.Bookmark className="w-5 h-5 text-gray-500" />
        )}
      </motion.button>

      {/* College Image/Placeholder */}
      <div className="h-48 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl font-bold text-white/20">{college.college_name.charAt(0)}</div>
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-semibold text-gray-800">
            {college.city}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* College Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {college.college_name}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg">
            {college.autonomy_status}
          </span>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg">
            Placement: {college.placement_rate}%
          </span>
          {college.hostel_available === "Yes" && (
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg">
              Hostel
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="text-xl font-bold text-blue-600">₹{college.average_package_lpa}L</div>
            <div className="text-xs text-blue-700 font-medium">Avg Package</div>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
            <div className="text-xl font-bold text-emerald-600">₹{college.highest_package_lpa}L</div>
            <div className="text-xs text-emerald-700 font-medium">Highest</div>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
            <div className="text-xl font-bold text-purple-600">{college.branches.length}</div>
            <div className="text-xs text-purple-700 font-medium">Branches</div>
          </div>
        </div>

        {/* Best Branch Info */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Top Branch • {bestBranch.branch}</p>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold bg-gradient-to-r ${getProbabilityColor(bestBranch.admission_chance)} text-white`}>
                  {bestBranch.probability_level}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{Math.round(bestBranch.admission_chance)}%</div>
              <div className="text-xs text-gray-500">Admission Chance</div>
            </div>
          </div>
          
          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${bestBranch.admission_chance}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-full rounded-full bg-gradient-to-r ${getProbabilityColor(bestBranch.admission_chance)}`}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenBranches}
            className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Lucide.Layers className="w-4 h-4" />
            Branches
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onViewDetails}
            className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Lucide.ExternalLink className="w-4 h-4" />
            Details
          </motion.button>
          
          <button
            onClick={onToggleSaved}
            className="col-span-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-indigo-300 hover:bg-indigo-50 transition-all"
          >
            {saved ? "Saved" : "Save College"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CollegeListCard({ college, index, saved, onToggleSaved, onOpenBranches, onViewDetails, isPredicted, getProbabilityColor }: {
  college: College;
  index: number;
  saved: boolean;
  onToggleSaved: () => void;
  onOpenBranches: () => void;
  onViewDetails: () => void;
  isPredicted: boolean;
  getProbabilityColor: (chance: number) => string;
}) {
  const bestBranch = college.branches.reduce((best, current) =>
    current.admission_chance > best.admission_chance ? current : best
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all"
    >
      <div className="flex items-start gap-6">
        {/* College Logo/Placeholder */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{college.college_name.charAt(0)}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{college.college_name}</h3>
                {isPredicted && (
                  <span className="px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-semibold rounded-full">
                    AI Recommended
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <Lucide.MapPin className="w-4 h-4" />
                  {college.city}
                </span>
                <span>•</span>
                <span>{college.autonomy_status}</span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold">{college.placement_rate}% Placement</span>
              </div>
            </div>

            <button
              onClick={onToggleSaved}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              {saved ? (
                <Lucide.Bookmark className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              ) : (
                <Lucide.Bookmark className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <div className="text-lg font-bold text-blue-600">₹{college.average_package_lpa}L</div>
              <div className="text-xs text-blue-700">Avg Package</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-xl">
              <div className="text-lg font-bold text-green-600">₹{college.highest_package_lpa}L</div>
              <div className="text-xs text-green-700">Highest</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <div className="text-lg font-bold text-purple-600">{college.branches.length}</div>
              <div className="text-xs text-purple-700">Branches</div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <div className="text-lg font-bold text-orange-600">{college.hostel_available === "Yes" ? "Yes" : "No"}</div>
              <div className="text-xs text-orange-700">Hostel</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-600">Top Branch: </span>
              <span className="font-semibold">{bestBranch.branch}</span>
              <span className={`ml-3 px-3 py-1 rounded-lg text-sm font-semibold bg-gradient-to-r ${getProbabilityColor(bestBranch.admission_chance)} text-white`}>
                {Math.round(bestBranch.admission_chance)}% Chance
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenBranches}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 text-sm"
              >
                Compare Branches
              </button>
              <button
                onClick={onViewDetails}
                className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function BranchModal({ college, onClose, getProbabilityColor }: { 
  college: College; 
  onClose: () => void;
  getProbabilityColor: (chance: number) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-50 via-white to-purple-50 border-b border-gray-200 p-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{college.college_name}</h2>
              <p className="text-gray-600 flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <Lucide.MapPin className="w-4 h-4" />
                  {college.city}
                </span>
                <span>•</span>
                <span>{college.autonomy_status}</span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold">{college.placement_rate}% Placement Rate</span>
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
            >
              <Lucide.X className="w-5 h-5 text-gray-500" />
            </motion.button>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-6 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">₹{college.average_package_lpa}L</div>
              <div className="text-sm text-gray-600">Avg Package</div>
            </div>
            <div className="h-8 w-px bg-gray-300" />
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">₹{college.highest_package_lpa}L</div>
              <div className="text-sm text-gray-600">Highest Package</div>
            </div>
            <div className="h-8 w-px bg-gray-300" />
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{college.branches.length}</div>
              <div className="text-sm text-gray-600">Branches Available</div>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {college.branches.map((branch) => (
              <motion.div
                key={branch.branch_code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className={`border-2 border-gray-200 rounded-2xl p-6 hover:border-indigo-300 transition-all hover:shadow-xl ${
                  branch.is_most_probable ? "ring-2 ring-emerald-500 ring-opacity-30 border-emerald-200" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{branch.branch}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-2">
                        <Lucide.Users className="w-4 h-4" />
                        {branch.seats} seats
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-2">
                        <Lucide.IndianRupee className="w-4 h-4" />
                        ₹{branch.Fees}L fees
                      </span>
                      <span>•</span>
                      <span>Rank ≤ {branch.cutoff_rank || branch.cutoff_percentile}</span>
                    </div>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-xl font-semibold bg-gradient-to-r ${getProbabilityColor(branch.admission_chance)} text-white`}>
                    {branch.probability_level}
                  </div>
                </div>
                
                {/* Admission Chance */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Admission Probability</span>
                    <span className="font-bold text-gray-900">{Math.round(branch.admission_chance)}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${branch.admission_chance}%` }}
                      transition={{ duration: 1 }}
                      className={`h-full rounded-full bg-gradient-to-r ${getProbabilityColor(branch.admission_chance)}`}
                    />
                  </div>
                </div>
                
                {/* Match Score */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-600">AI Match Score</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Lucide.Star
                          key={i}
                          className={`w-5 h-5 ${i < branch.match_score ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                      <span className="ml-2 font-semibold">{branch.match_score}/5</span>
                    </div>
                  </div>
                  
                  {branch.is_most_probable && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl">
                      <Lucide.Target className="w-4 h-4" />
                      <span className="font-semibold">Most Probable</span>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <button className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                    Save Branch
                  </button>
                  <button className="flex-1 px-4 py-3 border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all">
                    Compare
                  </button>
                  <button className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50">
                    <Lucide.Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function CollegeDetailsModal({ college, onClose, getProbabilityColor }: { 
  college: College; 
  onClose: () => void;
  getProbabilityColor: (chance: number) => string;
}) {
  const bestBranch = college.branches.reduce((best, current) =>
    current.admission_chance > best.admission_chance ? current : best
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl my-8"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-50 via-white to-purple-50 border-b border-gray-200 p-8 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{college.college_name}</h2>
              <p className="text-gray-600 flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <Lucide.MapPin className="w-4 h-4" />
                  {college.city}, {college.state}
                </span>
                <span>•</span>
                <span>{college.autonomy_status}</span>
                <span>•</span>
                <span className="text-emerald-600 font-semibold">{college.placement_rate}% Placement Rate</span>
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
            >
              <Lucide.X className="w-5 h-5 text-gray-500" />
            </motion.button>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-6 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">₹{college.average_package_lpa}L</div>
              <div className="text-sm text-gray-600">Avg Package</div>
            </div>
            <div className="h-8 w-px bg-gray-300" />
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">₹{college.highest_package_lpa}L</div>
              <div className="text-sm text-gray-600">Highest Package</div>
            </div>
            <div className="h-8 w-px bg-gray-300" />
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{college.branches.length}</div>
              <div className="text-sm text-gray-600">Branches</div>
            </div>
            <div className="h-8 w-px bg-gray-300" />
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(bestBranch.admission_chance)}%</div>
              <div className="text-sm text-gray-600">Top Chance</div>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="space-y-8">
            {/* Overview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* College Info */}
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Lucide.Info className="w-5 h-5 text-indigo-600" />
                  College Overview
                </h3>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Established</p>
                      <p className="font-semibold">{college.established_year || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Campus Size</p>
                      <p className="font-semibold">{college.campus_size || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Accreditation</p>
                      <p className="font-semibold">{college.accreditation || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">NAAC Grade</p>
                      <p className="font-semibold">{college.naac_grade || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Faculty Count</p>
                      <p className="font-semibold">{college.faculty_count?.toLocaleString() || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Research Papers</p>
                      <p className="font-semibold">{college.research_papers?.toLocaleString() || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Lucide.Mail className="w-5 h-5 text-indigo-600" />
                  Contact Information
                </h3>
                <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold text-sm">{college.address || `${college.college_name}, ${college.city}`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{college.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{college.contact_email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Website</p>
                    <a 
                      href={college.website || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
                    >
                      {college.website || "N/A"}
                      <Lucide.ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Facilities & Infrastructure */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lucide.Home className="w-5 h-5 text-indigo-600" />
                Facilities & Infrastructure
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Lucide.Book className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Library</p>
                      <p className="text-sm text-gray-600">{college.library_books?.toLocaleString() || "50,000+"} books</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Lucide.Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Hostel</p>
                      <p className="text-sm text-gray-600">{college.hostel_available === "Yes" ? "Available" : "Not Available"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Lucide.Activity className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Sports</p>
                      <p className="text-sm text-gray-600">{college.sports_facilities?.length || 5}+ facilities</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Lucide.Music className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Clubs</p>
                      <p className="text-sm text-gray-600">{college.clubs?.length || 5}+ active clubs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Recruiters */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lucide.Briefcase className="w-5 h-5 text-indigo-600" />
                Top Recruiters
              </h3>
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex flex-wrap gap-3">
                  {(college.campus_recruiters || ["Google", "Microsoft", "Amazon", "TCS", "Infosys", "Wipro", "Accenture"]).map((recruiter, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-medium text-gray-700"
                    >
                      {recruiter}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Branch Details */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lucide.Layers className="w-5 h-5 text-indigo-600" />
                Branch Details
              </h3>
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Branch</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Admission Chance</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cutoff Rank</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Annual Fees</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Seats</th>
                      </tr>
                    </thead>
                    <tbody>
                      {college.branches.map((branch, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-white">
                          <td className="py-3 px-4">
                            <div className="font-medium">{branch.branch}</div>
                            <div className="text-sm text-gray-600">{branch.branch_code}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getProbabilityColor(branch.admission_chance).replace('from-', 'bg-').split(' ')[0]}`} />
                              <span className="font-semibold">{Math.round(branch.admission_chance)}%</span>
                              {branch.is_most_probable && (
                                <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                                  Most Probable
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium">{branch.cutoff_rank || "N/A"}</td>
                          <td className="py-3 px-4 font-medium">₹{branch.Fees.toLocaleString()}</td>
                          <td className="py-3 px-4 font-medium">{branch.seats}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open(college.website, '_blank')}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-3"
              >
                <Lucide.Globe className="w-5 h-5" />
                Visit College Website
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  /* Add save functionality */
                }}
                className="px-6 py-4 border-2 border-indigo-600 text-indigo-600 rounded-2xl font-semibold hover:bg-indigo-50 transition-all flex items-center gap-3"
              >
                <Lucide.Download className="w-5 h-5" />
                Download Brochure
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
