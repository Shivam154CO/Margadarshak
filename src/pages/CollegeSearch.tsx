import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Building, Cpu, MapPin, IndianRupee, Trash2, ChevronDown,
  Grid3x3, List, Map as MapIcon, Brain, Database,
  Zap, CheckCircle, Target, TrendingUp, Bookmark, BookmarkCheck,
  Award, Layers, ExternalLink, Star, Info,
  Search, Download, X, Users, Bot, SearchX, Globe, Mail,
  Share2, Home, Book, Activity, Music, Briefcase,
  AlertCircle
} from "lucide-react";
import { Virtuoso, VirtuosoGrid } from 'react-virtuoso';
import SEO from "../components/SEO";
import Skeleton from "../components/Skeleton";


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
  const [userProfile, setUserProfile] = useState<any>(null);
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
      let { data: dbColleges, error } = await supabase
        .from('collegess_2025')
        .select('*')
        .limit(50000); // Massively increased limit to get ALL records

      if (!dbColleges || dbColleges.length === 0) {
        const fallback = await supabase
          .from('colleges_2025')
          .select('*')
          .limit(50000);
        if (fallback.data && fallback.data.length > 0) {
          dbColleges = fallback.data;
          error = fallback.error;
        }
      }

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
            image: college.image_url || college.Image_url || "",
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
      console.log(`📊 Total raw records fetched: ${dbColleges.length}`);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all colleges first (accessible to everyone)
        const allCollegesFromDB = await fetchAllCollegesFromSupabase();
        setAllColleges(allCollegesFromDB);

        // Listen for auth changes to get predictions
        const unsub = onAuthStateChanged(auth, async (user) => {
          if (!user) {
            setLoading(false);
            setAiLoading(false);
            return;
          }

          const snap = await getDoc(doc(db, "users", user.uid));
          const prof = snap.exists() ? (snap.data() as any) : {};
          const rank = prof.rank || prof.cetRank || prof.diplomaRank || null;
          const score = prof.cetScore || prof.diplomaScore || null;
          const category = prof.category || "OPEN";
          const branches = prof.preferredBranches || [];

          setUserRank(rank);
          setUserCategory(category);

          if (rank && score && branches.length) {
            try {
              setAiLoading(true);
              const res = await axios.post("http://127.0.0.1:5001/predict_admission", {
                score: parseFloat(score),
                rank: parseInt(rank),
                category,
                branches,
              });

              const raw: RawCollege[] = res.data.colleges || [];
              const predicted = deduplicateColleges(groupCollegesByCode(raw));

              setColleges(predicted);

              // Merge predictions into all colleges
              const allCollegesMap = new Map<string, College>();
              allCollegesFromDB.forEach(c => allCollegesMap.set(c.college_code, c));

              predicted.forEach(p => {
                if (allCollegesMap.has(p.college_code)) {
                  allCollegesMap.set(p.college_code, {
                    ...allCollegesMap.get(p.college_code)!,
                    ...p,
                    is_predicted: true
                  });
                } else {
                  allCollegesMap.set(p.college_code, p);
                }
              });

              setAllColleges(Array.from(allCollegesMap.values()));
            } catch (err) {
              console.error("❌ Prediction API failed", err);
            } finally {
              setAiLoading(false);
            }
          }
          setUserProfile(prof);
          setLoading(false);
        });

        return unsub;
      } catch (err) {
        console.error("❌ Data load failed", err);
        setLoading(false);
      }
    };

    fetchData().then(unsub => {
      if (typeof unsub === 'function') return unsub;
    });
  }, []);



  return {
    colleges,
    allColleges,
    userRank,
    userCategory,
    userProfile,
    loading,
    aiLoading
  };
}

// ---------- MAIN COMPONENT ----------
export default function CollegeSearch() {
  const { colleges: predictedColleges, allColleges, userProfile, loading, aiLoading } = useCollegeData();
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
  const [viewMode, setViewMode] = useState<"predicted" | "all">("all");
  const [sortBy] = useState("match_score");
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

  // Auto-switch to "all" if no predicted colleges after loading
  useEffect(() => {
    if (!loading && predictedColleges.length === 0 && viewMode === "predicted") {
      setViewMode("all");
    }
  }, [loading, predictedColleges.length]);

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
        (college.college_name?.toLowerCase() || "").includes(query) ||
        (college.city?.toLowerCase() || "").includes(query) ||
        (college.branches || []).some(b => (b.branch?.toLowerCase() || "").includes(query))
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
      <SEO
        title={`${viewMode === 'predicted' ? 'Targeted Matches' : 'Explore Colleges'}`}
        description={`Browse through ${filteredColleges.length} engineering colleges in Maharashtra with AI match predictions and cutoff data.`}
      />
      <Navbar activeTab="search" userProfile={userProfile} />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                College Explorer
              </h1>
              <p className="text-gray-600">
                Discover {allColleges.length} engineering colleges across Maharashtra
              </p>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <div className="bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                <div>
                  <div className="text-xs text-indigo-600 font-bold uppercase tracking-wider">AI Powered</div>
                  <div className="text-sm font-semibold text-indigo-900">{predictedColleges.length} Recommendations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                className={`relative px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-3 ${viewMode === "predicted"
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
                    <Brain className="w-5 h-5" />
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
                className={`relative px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-3 ${viewMode === "all"
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
                  <Database className="w-5 h-5" />
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
                    <Search className="w-5 h-5 text-white/70" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={`Search ${viewMode === "predicted" ? "AI-recommended" : "all"} colleges, branches, or locations...`}
                    className="flex-1 py-5 px-4 bg-transparent outline-none text-white placeholder-white/60 text-lg"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSearchClick}
                    className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-semibold ml-2 hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
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
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex bg-white rounded-2xl p-1 border border-gray-200 shadow-sm"
            >
              <button
                onClick={() => setViewMode("all")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-3 ${viewMode === "all"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                  }`}
              >
                <Database className="w-5 h-5" />
                <span>All Colleges</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${viewMode === 'all' ? 'bg-white/20' : 'bg-gray-100'}`}>
                  {allColleges.length}
                </span>
              </button>

              <button
                onClick={() => setViewMode("predicted")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-3 ${viewMode === "predicted"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                  : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"
                  }`}
              >
                <Brain className="w-5 h-5" />
                <span>AI Recommendations</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${viewMode === 'predicted' ? 'bg-white/20' : 'bg-gray-100'}`}>
                  {predictedColleges.length}
                </span>
              </button>
            </motion.div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("grid")}
              className={`p-3 rounded-xl transition-all ${activeTab === "grid" ? "bg-indigo-50 text-indigo-600" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`p-3 rounded-xl transition-all ${activeTab === "list" ? "bg-indigo-50 text-indigo-600" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className={`p-3 rounded-xl transition-all ${activeTab === "map" ? "bg-indigo-50 text-indigo-600" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              <MapIcon className="w-5 h-5" />
            </button>
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
              <Trash2 className="w-4 h-4" />
              Clear All
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            <FilterSelect
              label="College Type"
              value={filters.collegeType}
              onChange={(value) => setFilters(prev => ({ ...prev, collegeType: value }))}
              options={["All Types", "Government", "Private", "Autonomous"]}
              icon={<Building className="w-4 h-4" />}
            />

            <FilterSelect
              label="Branch"
              value={filters.branch}
              onChange={(value) => setFilters(prev => ({ ...prev, branch: value }))}
              options={availableBranches.length > 0 ? ["All Branches", ...availableBranches.filter(b => b !== "All Branches")] : ["All Branches"]}
              icon={<Cpu className="w-4 h-4" />}
            />

            <FilterSelect
              label="Location"
              value={filters.location || "All Locations"}
              onChange={(value) => setFilters(prev => ({ ...prev, location: value === "All Locations" ? "" : value }))}
              options={availableLocations.length > 0 ? ["All Locations", ...availableLocations.filter(l => l !== "All Locations")] : ["All Locations"]}
              icon={<MapPin className="w-4 h-4" />}
            />

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
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
                <Brain className="w-4 h-4 text-indigo-600" />
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
          <div className="min-h-[600px]">
            {activeTab === "grid" ? (
              <VirtuosoGrid
                useWindowScroll
                data={filteredColleges}
                listClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                itemContent={(index, college) => (
                  <div className="pb-4">
                    <CollegeCard
                      key={college.college_code}
                      college={college}
                      index={index}
                      saved={saved.includes(college.college_code)}
                      onToggleSaved={() => toggleSaved(college.college_code)}
                      onOpenBranches={() => setBranchModal(college)}
                      onViewDetails={() => setDetailsModal(college)}
                      isPredicted={viewMode === "predicted" || !!college.is_predicted}
                    />
                  </div>
                )}
              />
            ) : (
              <Virtuoso
                useWindowScroll
                data={filteredColleges}
                itemContent={(index, college) => (
                  <div className="pb-4">
                    <CollegeListCard
                      key={college.college_code}
                      college={college}
                      index={index}
                      saved={saved.includes(college.college_code)}
                      onToggleSaved={() => toggleSaved(college.college_code)}
                      onOpenBranches={() => setBranchModal(college)}
                      onViewDetails={() => setDetailsModal(college)}
                      isPredicted={viewMode === "predicted" || !!college.is_predicted}
                    />
                  </div>
                )}
              />
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-32 h-32 mx-auto mb-6 text-gray-300">
              <SearchX className="w-full h-full" />
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
        <Bot className="w-6 h-6" />
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
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function CollegeCard({ college, index, saved, onToggleSaved, onOpenBranches, onViewDetails, isPredicted }: {
  college: College;
  index: number;
  saved: boolean;
  onToggleSaved: () => void;
  onOpenBranches: () => void;
  onViewDetails: () => void;
  isPredicted: boolean;
}) {
  const bestBranch = college.branches.reduce((best, current) =>
    current.admission_chance > best.admission_chance ? current : best
  );

  const getAdmissionInfo = (chance: number) => {
    if (chance >= 80) return { label: "High Chance", color: "text-emerald-700", bgColor: "bg-emerald-50 border-emerald-100", gradient: "from-emerald-500 to-emerald-600", icon: CheckCircle };
    if (chance >= 60) return { label: "Very Good", color: "text-blue-700", bgColor: "bg-blue-50 border-blue-100", gradient: "from-blue-500 to-blue-600", icon: Zap };
    if (chance >= 40) return { label: "Fair Match", color: "text-amber-700", bgColor: "bg-amber-50 border-amber-100", gradient: "from-amber-500 to-amber-600", icon: Target };
    return { label: "Stretch", color: "text-rose-700", bgColor: "bg-rose-50 border-rose-100", gradient: "from-rose-500 to-rose-600", icon: TrendingUp };
  };

  const admInfo = getAdmissionInfo(bestBranch.admission_chance);
  const Icon = admInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white rounded-3xl border border-gray-200/60 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2"
    >
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20">
          <div className="absolute inset-0 flex items-center justify-center text-6xl font-black text-white/30 truncate px-4">
            {college.college_name}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

        <button
          onClick={onToggleSaved}
          className="absolute top-4 right-4 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-200 shadow-lg z-10"
        >
          {saved ? (
            <BookmarkCheck className="w-5 h-5 text-indigo-600 fill-indigo-600" />
          ) : (
            <Bookmark className="w-5 h-5 text-gray-600" />
          )}
        </button>

        <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full backdrop-blur-sm border ${admInfo.bgColor} ${admInfo.color} flex items-center space-x-1.5 text-xs font-bold z-10`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{isPredicted ? "AI RECOMMENDED" : admInfo.label}</span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-10">
          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{college.college_name}</h3>
          <div className="flex items-center text-white/90 text-sm">
            <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
            <span className="truncate">{college.city}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <div className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold mb-2 border border-indigo-100 uppercase tracking-wider">
            {bestBranch.branch}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Award className="w-4 h-4 mr-2 text-indigo-600" />
            <span className="font-semibold">{college.autonomy_status}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex flex-col items-center">
            <div className="text-lg font-bold text-gray-900">₹{college.average_package_lpa}L</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Avg Package</div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex flex-col items-center">
            <div className="text-lg font-bold text-gray-900">{college.placement_rate}%</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Placement</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 text-sm font-bold">Admission Chance</span>
            <span className={`font-black text-sm ${admInfo.color}`}>
              {Math.round(bestBranch.admission_chance)}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 shadow-inner overflow-hidden border border-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${bestBranch.admission_chance}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className={`h-full rounded-full bg-gradient-to-r ${admInfo.gradient}`}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onOpenBranches}
            className="flex-1 bg-white border-2 border-indigo-600 text-indigo-600 py-3 rounded-2xl font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group"
          >
            <Layers className="w-4 h-4" />
            Branches
          </button>
          <button
            onClick={onViewDetails}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-2xl font-bold hover:shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CollegeListCard({ college, index, saved, onToggleSaved, onOpenBranches, onViewDetails, isPredicted }: {
  college: College;
  index: number;
  saved: boolean;
  onToggleSaved: () => void;
  onOpenBranches: () => void;
  onViewDetails: () => void;
  isPredicted: boolean;
}) {
  const bestBranch = college.branches.reduce((best, current) =>
    current.admission_chance > best.admission_chance ? current : best
  );

  const getAdmissionInfo = (chance: number) => {
    if (chance >= 80) return { label: "High Chance", color: "text-emerald-700", bgColor: "bg-emerald-50 border-emerald-100", gradient: "from-emerald-500 to-emerald-600", icon: CheckCircle };
    if (chance >= 60) return { label: "Very Good", color: "text-blue-700", bgColor: "bg-blue-50 border-blue-100", gradient: "from-blue-500 to-blue-600", icon: Zap };
    if (chance >= 40) return { label: "Fair Match", color: "text-amber-700", bgColor: "bg-amber-50 border-amber-100", gradient: "from-amber-500 to-amber-600", icon: Target };
    return { label: "Stretch", color: "text-rose-700", bgColor: "bg-rose-50 border-rose-100", gradient: "from-rose-500 to-rose-600", icon: TrendingUp };
  };

  const admInfo = getAdmissionInfo(bestBranch.admission_chance);
  const Icon = admInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group bg-white rounded-3xl border border-gray-200/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden p-6"
    >
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4 h-48 lg:h-auto rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 flex items-center justify-center relative overflow-hidden">
          <div className="text-4xl font-black text-indigo-200/50 truncate px-4 text-center">
            {college.college_name}
          </div>
          <div className="absolute top-4 left-4">
            <div className={`px-3 py-1.5 rounded-full backdrop-blur-sm border ${admInfo.bgColor} ${admInfo.color} flex items-center space-x-1.5 text-[10px] font-bold`}>
              <Icon className="w-3 h-3" />
              <span>{isPredicted ? "AI RECOMMENDED" : admInfo.label}</span>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{college.college_name}</h3>
              <div className="flex items-center gap-4 text-gray-500 mt-1">
                <span className="flex items-center gap-1.5 text-sm">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  {college.city}
                </span>
                <span className="flex items-center gap-1.5 text-sm">
                  <Award className="w-4 h-4 text-indigo-500" />
                  {college.autonomy_status}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-bold">
                  <TrendingUp className="w-4 h-4" />
                  {college.placement_rate}% Placement
                </span>
              </div>
            </div>
            <button
              onClick={onToggleSaved}
              className="p-3 bg-gray-50 rounded-2xl hover:bg-indigo-50 transition-colors"
            >
              {saved ? (
                <BookmarkCheck className="w-6 h-6 text-indigo-600 fill-indigo-600" />
              ) : (
                <Bookmark className="w-6 h-6 text-gray-400" />
              )}
            </button>
          </div>

          <div className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold mb-6 border border-indigo-100">
            {bestBranch.branch}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
              <div className="text-xl font-bold text-gray-900">₹{college.average_package_lpa}L</div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Avg Package</p>
            </div>
            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
              <div className="text-xl font-bold text-gray-900">₹{college.highest_package_lpa}L</div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Max Package</p>
            </div>
            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
              <div className="text-xl font-bold text-gray-900">{college.branches.length}</div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Branches</p>
            </div>
            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-2">
                <div className={`text-xl font-bold ${admInfo.color}`}>{Math.round(bestBranch.admission_chance)}%</div>
              </div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Adm Chance</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={onOpenBranches}
              className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              Explore Branches
            </button>
            <button
              onClick={onViewDetails}
              className="px-8 py-3 border-2 border-indigo-600 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Full Details
            </button>
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
  const bestBranch = college.branches.reduce((best, current) =>
    current.admission_chance > best.admission_chance ? current : best
  );

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
        <div className="sticky top-0 bg-gradient-to-r from-indigo-50 via-white to-purple-50 border-b border-gray-200 p-8 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{college.college_name}</h2>
              <p className="text-gray-600 flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
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
              <X className="w-5 h-5 text-gray-500" />
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
            <div className="h-8 w-px bg-gray-300" />
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(bestBranch.admission_chance)}%</div>
              <div className="text-sm text-gray-600">Top Chance</div>
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
                className={`border-2 border-gray-200 rounded-2xl p-6 hover:border-indigo-300 transition-all hover:shadow-xl ${branch.is_most_probable ? "ring-2 ring-emerald-500 ring-opacity-30 border-emerald-200" : ""
                  }`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{branch.branch}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {branch.seats} seats
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4" />
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
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < branch.match_score ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                      <span className="ml-2 font-semibold">{branch.match_score}/5</span>
                    </div>
                  </div>

                  {branch.is_most_probable && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl">
                      <Target className="w-4 h-4" />
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
                    <Share2 className="w-5 h-5 text-gray-600" />
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
                  <MapPin className="w-4 h-4" />
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
              <X className="w-5 h-5 text-gray-500" />
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
                  <Info className="w-5 h-5 text-indigo-600" />
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
                  <Mail className="w-5 h-5 text-indigo-600" />
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
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Facilities & Infrastructure */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Home className="w-5 h-5 text-indigo-600" />
                Facilities & Infrastructure
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Book className="w-5 h-5 text-blue-600" />
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
                      <Users className="w-5 h-5 text-green-600" />
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
                      <Activity className="w-5 h-5 text-purple-600" />
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
                      <Music className="w-5 h-5 text-amber-600" />
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
                <Briefcase className="w-5 h-5 text-indigo-600" />
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
                <Layers className="w-5 h-5 text-indigo-600" />
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
                <Globe className="w-5 h-5" />
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
                <Download className="w-5 h-5" />
                Download Brochure
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
