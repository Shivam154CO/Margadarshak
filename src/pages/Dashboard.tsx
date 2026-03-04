import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Bookmark,
  BookmarkCheck,
  User,
  Search,
  Filter,
  TrendingUp,
  Award,
  ExternalLink,
  Target,
  CheckCircle,
  AlertCircle,
  Zap,
  Target as TargetIcon,
  Layers,
  Trophy,
  Database,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useColleges } from "../context/CollegesContext";
import Footer from "../components/Footer";
import Breadcrumbs from "../components/Breadcrumbs";
import Navbar from "../components/Navbar";

interface College {
  college_code: string;
  college_name: string;
  city: string;
  district?: string;
  region?: string;
  branch: string;
  branch_name: string;
  branch_code: string;
  fees: number;
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
  logo_url: string;
  contact_email: string;
  contact_phone: string;
  website_url: string;
  probability_level?: string;
  is_most_probable?: boolean;
  admission_chance?: number;
  admission_chance_percentage?: string;
  fit?: string;
  fit_reason?: string;
  match_score?: number;
  match_percentage?: string;
  display_fees?: string;
  display_seats?: string;
  display_cutoff?: string;
  display_placement?: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  state: string;
  category: string;
  exam_type: string;
  cet_rank: string;
  cet_score: string;
  diploma_rank: string;
  diploma_score: string;
  preferred_branches: string[];
  university_preference: string;
  address: string;
  receive_updates: boolean;
  profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

const getCollegeImage = (collegeCode: string): string => {
  if (!collegeCode) {
    return "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  }
  return new URL(`../assets/${collegeCode}/campus.png`, import.meta.url).href;
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
];

const getRandomFallbackImage = (): string => {
  return FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
};

interface CollegeImageProps {
  collegeCode: string;
  className?: string;
  alt?: string;
  priority?: boolean;
}

const CollegeImage: React.FC<CollegeImageProps> = ({
  collegeCode,
  className = '',
  alt = 'College campus',
  priority = false,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(getCollegeImage(collegeCode));
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setImgSrc(getCollegeImage(collegeCode));
    setHasError(false);
    setLoaded(false);
  }, [collegeCode]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(getRandomFallbackImage());
    }
  };

  return (
    <div className={`relative ${className} overflow-hidden bg-gray-200`}>
      {!loaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${hasError ? 'grayscale opacity-75' : ''}`}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        onError={handleError}
      />
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { colleges, setColleges } = useColleges();
  const [savedColleges, setSavedColleges] = useState<string[]>(() => {
    const saved = localStorage.getItem("favoriteColleges");
    if (saved) {
      try {
        const parsed: College[] = JSON.parse(saved);
        return parsed.map((c) => `${c.college_code}_${c.branch}`);
      } catch (e) {
        console.error("Failed to parse saved colleges", e);
        return [];
      }
    }
    return [];
  });
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'grid-3' | 'grid-4' | 'list'>('grid-3');
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Debounced value for filtering
  const [searchInput, setSearchInput] = useState(""); // Instant value for input display

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        navigate("/login", { replace: true });
        throw new Error("No session");
      }
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (profileError) {
        console.error("Profile fetch error:", profileError);
        navigate("/profile", { replace: true });
        throw new Error("Profile not complete");
      }
      if (!profile.profile_complete) {
        navigate("/profile", { replace: true });
        throw new Error("Profile not complete");
      }
      return profile as UserProfile;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
  });

  const predictionsQuery = useQuery({
    queryKey: ['predictions', profile?.id],
    queryFn: async () => {
      try {
        if (!profile?.preferred_branches || profile.preferred_branches.length === 0) return [];

        const requestData = {
          score: profile.exam_type === "CET" ? parseFloat(profile.cet_score || "0") : parseFloat(profile.diploma_score || "0"),
          rank: profile.exam_type === "CET" ? parseFloat(profile.cet_rank || "0") : parseFloat(profile.diploma_rank || "0"),
          category: profile.category,
          branches: profile.preferred_branches,
          limit: 100,
        };

        const response = await axios.post("http://127.0.0.1:5001/predict_admission", requestData, {
          headers: { "Content-Type": "application/json" },
          timeout: 5000,
        });

        if (response.data.colleges && response.data.colleges.length > 0) {
          return response.data.colleges.map((college: College) => ({
            ...college,
            image: getCollegeImage(college.college_code),
            display_fees: `₹${(college.fees || 0).toLocaleString()}`,
          }));
        }
        throw new Error("API empty");
      } catch (err) {
        console.warn("Prediction API failed, using base data from Supabase", err);
        const { data } = await supabase.from('colleges_2025').select('*').limit(50);
        if (!data) return [];
        const uniqueMap = new Map<string, College>();
        data.forEach((c: any) => {
          if (!uniqueMap.has(c.college_code)) {
            uniqueMap.set(c.college_code, {
              ...c,
              image: getCollegeImage(c.college_code),
              display_fees: `₹${(c.fees || 0).toLocaleString()}`,
            });
          }
        });
        return Array.from(uniqueMap.values());
      }
    },
    enabled: !!profile,
    staleTime: 1000 * 60 * 10,
  });

  // Synchronize query data with CollegesContext
  const predictionsData = predictionsQuery.data;
  const predictionsLoading = predictionsQuery.isLoading;

  useEffect(() => {
    if (predictionsData && predictionsData.length > 0 && colleges.length === 0) {
      setColleges(predictionsData);
    }
  }, [predictionsData, colleges.length, setColleges]);

  const filtered = useMemo(() => {
    let result = colleges;

    if (selectedBranch) {
      result = result.filter((c) => c.branch === selectedBranch);
    }
    if (selectedCity) {
      result = result.filter((c) => c.city.toLowerCase() === selectedCity.toLowerCase());
    }
    if (selectedDistrict) {
      result = result.filter((c) => c.district?.toLowerCase() === selectedDistrict.toLowerCase());
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.college_name.toLowerCase().includes(term) ||
          c.city.toLowerCase().includes(term) ||
          c.district?.toLowerCase().includes(term) ||
          c.college_code.toLowerCase().includes(term) ||
          c.branch.toLowerCase().includes(term)
      );
    }

    return result;
  }, [colleges, selectedBranch, selectedCity, selectedDistrict, searchTerm]);

  const isLoading = !profile || predictionsLoading;


  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearchTerm(value), 300),
    []
  );

  const handleSearch = useCallback((value: string) => {
    setSearchInput(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleBranchFilter = useCallback((branch: string) => {
    setSelectedBranch(branch);
  }, []);

  const handleCityFilter = useCallback((city: string) => {
    setSelectedCity(city);
  }, []);

  const handleDistrictFilter = useCallback((district: string) => {
    setSelectedDistrict(district);
  }, []);

  const toggleSaveCollege = (college: College) => {
    const key = `${college.college_code}_${college.branch}`;
    let newSavedColleges: string[];
    let newLocalStorage: College[];

    const existingStorageRaw = localStorage.getItem("favoriteColleges");
    let existingStorage: College[] = [];
    if (existingStorageRaw) {
      try {
        existingStorage = JSON.parse(existingStorageRaw);
      } catch (e) {
        console.error("Error parsing localStorage", e);
      }
    }

    if (savedColleges.includes(key)) {
      newSavedColleges = savedColleges.filter((k) => k !== key);
      newLocalStorage = existingStorage.filter(
        (c) => `${c.college_code}_${c.branch}` !== key
      );
    } else {
      newSavedColleges = [...savedColleges, key];
      const alreadyInStorage = existingStorage.some(
        (c) => `${c.college_code}_${c.branch}` === key
      );
      if (!alreadyInStorage) {
        newLocalStorage = [...existingStorage, college];
      } else {
        newLocalStorage = existingStorage;
      }
    }

    setSavedColleges(newSavedColleges);
    localStorage.setItem("favoriteColleges", JSON.stringify(newLocalStorage));
  };

  const getAvailableBranches = () => {
    const branches = [...new Set(colleges.map((c) => c.branch))];
    return branches.sort();
  };

  const getAvailableCities = () => {
    const cities = [...new Set(colleges.map((c) => c.city))];
    return cities.sort();
  };

  const getAvailableDistricts = () => {
    const districts = [...new Set(colleges.map((c) => c.district).filter(Boolean))];
    return districts.sort();
  };

  const branches = getAvailableBranches();
  const cities = getAvailableCities();
  const districts = getAvailableDistricts();

  const getFilteredColleges = () => {
    let result = filtered;
    switch (activeFilter) {
      case "most-probable":
        result = result.filter((c) => c.is_most_probable || c.probability_level === "Most Probable");
        break;
      case "best-fit":
        result = result.filter((c) => (c.fit === "Best Fit" || c.probability_level === "Best Fit") && !c.is_most_probable);
        break;
      case "good-fit":
        result = result.filter((c) => c.fit === "Good Fit" || c.probability_level === "Good Fit");
        break;
      case "stretch":
        result = result.filter((c) => c.fit === "Stretch" || c.probability_level === "Stretch");
        break;
      case "saved":
        result = result.filter((c) => savedColleges.includes(`${c.college_code}_${c.branch}`));
        break;
      default:
        break;
    }
    return result;
  };

  const displayedColleges = getFilteredColleges();

  // Helper to get sort order efficiently without creating JSX
  const getSortOrder = (college: College) => {
    const fitCategory = college.probability_level || college.fit;
    if (college.is_most_probable || fitCategory === "Most Probable") return 1;
    switch (fitCategory) {
      case "Best Fit": return 2;
      case "Good Fit": return 3;
      case "Stretch": return 4;
      default: return 5;
    }
  };

  const sortedColleges = useMemo(() => {
    // Separate stretch colleges from good matches
    const stretchColleges: College[] = [];
    const goodMatches: College[] = [];

    // Single pass to categorize
    for (const c of displayedColleges) {
      if (getSortOrder(c) === 4) { // Stretch
        stretchColleges.push(c);
      } else {
        goodMatches.push(c);
      }
    }

    // Sort good matches by cutoff rank (ascending: lowest first)
    goodMatches.sort((a, b) => {
      const aCutoff = a.cutoff_rank || a.cutoff_percentile || 0;
      const bCutoff = b.cutoff_rank || b.cutoff_percentile || 0;
      return aCutoff - bCutoff;
    });

    // Randomly insert stretch colleges throughout the list
    const result = [...goodMatches];

    // Deterministic insertion to avoid hydration mismatches or random jumps on re-render
    stretchColleges.forEach((stretchCollege, index) => {
      // spread them out evenly
      const position = Math.floor(((index + 1) * result.length) / (stretchColleges.length + 1));
      result.splice(position, 0, stretchCollege);
    });

    return result;
  }, [displayedColleges]);

  const getStatistics = () => {
    return {
      total: colleges.length,
      mostProbable: colleges.filter((c) => c.is_most_probable || c.probability_level === "Most Probable").length,
      bestFit: colleges.filter((c) => (c.fit === "Best Fit" || c.probability_level === "Best Fit") && !c.is_most_probable).length,
      goodFit: colleges.filter((c) => c.fit === "Good Fit" || c.probability_level === "Good Fit").length,
      stretch: colleges.filter((c) => c.fit === "Stretch" || c.probability_level === "Stretch").length,
      saved: savedColleges.length,
      uniqueColleges: new Set(colleges.map((c) => c.college_code)).size,
    };
  };

  const stats = getStatistics();

  const getAdmissionInfo = (college: College) => {
    const fitCategory = college.probability_level || college.fit;

    if (college.is_most_probable || fitCategory === "Most Probable") {
      return {
        percentage: college.admission_chance ? `${college.admission_chance.toFixed(1)}%` : (college.admission_chance_percentage || "95.0%"),
        color: "text-purple-700",
        bgColor: "bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200",
        label: "Most Probable",
        gradient: "from-purple-600 via-purple-500 to-pink-500",
        iconName: "Zap",
        badgeColor: "bg-gradient-to-r from-purple-600 to-pink-600",
        glow: "shadow-lg shadow-purple-500/20",
        order: 1,
      };
    }

    switch (fitCategory) {
      case "Best Fit":
        return {
          percentage: college.admission_chance ? `${college.admission_chance.toFixed(1)}%` : (college.admission_chance_percentage || "85.0%"),
          color: "text-green-700",
          bgColor: "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200",
          label: "Best Fit",
          gradient: "from-green-500 via-emerald-500 to-teal-500",
          iconName: "CheckCircle",
          badgeColor: "bg-gradient-to-r from-green-500 to-emerald-600",
          glow: "shadow-lg shadow-green-500/20",
          order: 2,
        };
      case "Good Fit":
        return {
          percentage: college.admission_chance ? `${college.admission_chance.toFixed(1)}%` : (college.admission_chance_percentage || "70.0%"),
          color: "text-blue-700",
          bgColor: "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200",
          label: "Good Fit",
          gradient: "from-blue-500 via-cyan-500 to-sky-500",
          iconName: "Target",
          badgeColor: "bg-gradient-to-r from-blue-500 to-cyan-600",
          glow: "shadow-lg shadow-blue-500/20",
          order: 3,
        };
      case "Stretch":
        return {
          percentage: college.admission_chance ? `${college.admission_chance.toFixed(1)}%` : (college.admission_chance_percentage || "45.0%"),
          color: "text-orange-700",
          bgColor: "bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200",
          label: "Stretch",
          gradient: "from-orange-500 via-amber-500 to-red-500",
          iconName: "TrendingUp",
          badgeColor: "bg-gradient-to-r from-orange-500 to-red-600",
          glow: "shadow-lg shadow-orange-500/20",
          order: 4,
        };
      default:
        return {
          percentage: college.admission_chance ? `${college.admission_chance.toFixed(1)}%` : (college.admission_chance_percentage || "25.0%"),
          color: "text-gray-700",
          bgColor: "bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200",
          label: "Unknown",
          gradient: "from-gray-500 to-gray-600",
          iconName: "AlertCircle",
          badgeColor: "bg-gradient-to-r from-gray-500 to-gray-600",
          glow: "",
          order: 5,
        };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar activeTab="dashboard" userProfile={profile} />

      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        <Breadcrumbs />
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
            <div className="flex-1">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                  Welcome back, {profile?.name?.split(" ")[0] || "User"}!
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/profile")}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Update Profile</span>
              </button>
            </div>
          </div>

          {/* Profile Quick Access */}
          {profile && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 mb-8 shadow-sm transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                      Your Profile Overview
                    </h3>
                    <p className="text-sm text-slate-500 font-medium line-clamp-1">
                      Managed by Ikigai Smart Analysis Engine
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <div className="flex items-center justify-center space-x-2 text-sm text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-200 flex-1 sm:flex-none">
                    <Database className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">AI Analysis</span>
                  </div>
                  <button
                    onClick={() => navigate("/profile-view")}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm inline-flex justify-center items-center space-x-2 flex-1 sm:flex-none"
                  >
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">View Profile</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white border border-slate-200 border-l-4 border-l-purple-500 rounded-xl p-4 shadow-sm hover:-translate-y-0.5 transition-transform">
              <div className="text-2xl font-bold text-slate-800">{stats.mostProbable}</div>
              <p className="text-sm font-medium text-slate-700 mt-1">Most Probable</p>
              <p className="text-xs text-slate-400 mt-0.5">Near-exact matches</p>
            </div>
            <div className="bg-white border border-slate-200 border-l-4 border-l-emerald-500 rounded-xl p-4 shadow-sm hover:-translate-y-0.5 transition-transform">
              <div className="text-2xl font-bold text-slate-800">{stats.bestFit}</div>
              <p className="text-sm font-medium text-slate-700 mt-1">Best Fit</p>
              <p className="text-xs text-slate-400 mt-0.5">High probability</p>
            </div>
            <div className="bg-white border border-slate-200 border-l-4 border-l-blue-500 rounded-xl p-4 shadow-sm hover:-translate-y-0.5 transition-transform">
              <div className="text-2xl font-bold text-slate-800">{stats.goodFit}</div>
              <p className="text-sm font-medium text-slate-700 mt-1">Good Fit</p>
              <p className="text-xs text-slate-400 mt-0.5">Solid chance</p>
            </div>
            <div className="bg-white border border-slate-200 border-l-4 border-l-orange-400 rounded-xl p-4 shadow-sm hover:-translate-y-0.5 transition-transform">
              <div className="text-2xl font-bold text-slate-800">{stats.stretch}</div>
              <p className="text-sm font-medium text-slate-700 mt-1">Stretch</p>
              <p className="text-xs text-slate-400 mt-0.5">Backup options</p>
            </div>
            <div className="bg-white border border-slate-200 border-l-4 border-l-slate-400 rounded-xl p-4 shadow-sm hover:-translate-y-0.5 transition-transform">
              <div className="text-2xl font-bold text-slate-800">{stats.uniqueColleges}</div>
              <p className="text-sm font-medium text-slate-700 mt-1">Unique Colleges</p>
              <p className="text-xs text-slate-400 mt-0.5">Different institutions</p>
            </div>
          </div>
        </div>

        {/* Filter Buttons - Horizontal Layout Above Search */}
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
              onClick={() => setActiveFilter("saved")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-1.5 ${activeFilter === "saved"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Saved ({stats.saved})</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search colleges, cities, districts..."
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full bg-white border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm hover:shadow-md"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
              <div className="relative w-full sm:w-[160px] md:w-[180px]">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedBranch}
                  onChange={(e) => handleBranchFilter(e.target.value)}
                  className="pl-10 pr-8 py-2.5 bg-white border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none transition-all shadow-sm hover:shadow-md w-full truncate"
                >
                  <option value="">All Branches</option>
                  {branches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="relative w-full sm:w-[140px] md:w-[160px]">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedCity}
                  onChange={(e) => handleCityFilter(e.target.value)}
                  className="pl-10 pr-8 py-2.5 bg-white border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none transition-all shadow-sm hover:shadow-md w-full truncate"
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div className="relative w-full sm:w-[140px] md:w-[160px]">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictFilter(e.target.value)}
                  className="pl-10 pr-8 py-2.5 bg-white border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none transition-all shadow-sm hover:shadow-md w-full truncate"
                >
                  <option value="">All Districts</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State — only skeleton the cards grid; stats & filters already rendered above */}
        {(isLoading || predictionsLoading) && sortedColleges.length === 0 ? (
          <div className={`grid gap-6 ${viewMode === 'grid-3' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : viewMode === 'grid-4' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'}`}>
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-100"></div>
                <div className="p-6 space-y-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedColleges.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-3xl border-2 border-dashed border-gray-300/50 shadow-sm">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">No college matches found</h4>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {!profile?.preferred_branches || profile.preferred_branches.length === 0
                ? "Please select your preferred branches in your profile."
                : "No colleges match your current criteria. Try adjusting your search or preferences."}
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm"
            >
              Update Preferences
            </button>
          </div>
        ) : (
          <>
            {/* Results Summary and View Mode */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Showing {sortedColleges.length} college-branch matches
                </h3>
                <p className="text-gray-600 text-sm">
                  Sorted by cutoff (Stretch colleges mixed in)
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-1">
                  <button
                    onClick={() => setViewMode('grid-3')}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-1.5 ${viewMode === 'grid-3'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <div className="grid grid-cols-3 gap-0.5">
                      <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                      <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                      <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                      <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                      <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                      <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                    </div>
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode('grid-4')}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-1.5 ${viewMode === 'grid-4'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <div className="grid grid-cols-4 gap-0.5">
                      <div className="w-1 h-1 bg-current rounded-sm"></div>
                      <div className="w-1 h-1 bg-current rounded-sm"></div>
                      <div className="w-1 h-1 bg-current rounded-sm"></div>
                      <div className="w-1 h-1 bg-current rounded-sm"></div>
                      <div className="w-1 h-1 bg-current rounded-sm"></div>
                      <div className="w-1 h-1 bg-current rounded-sm"></div>
                      <div className="w-1 h-1 bg-current rounded-sm"></div>
                      <div className="w-1 h-1 bg-current rounded-sm"></div>
                    </div>
                    <span className="hidden sm:inline">Compact</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-1.5 ${viewMode === 'list'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <div className="flex flex-col space-y-0.5">
                      <div className="w-4 h-0.5 bg-current rounded-sm"></div>
                      <div className="w-4 h-0.5 bg-current rounded-sm"></div>
                      <div className="w-4 h-0.5 bg-current rounded-sm"></div>
                    </div>
                    <span className="hidden sm:inline">List</span>
                  </button>
                </div>
              </div>
            </div>

            {/* College Cards Grid */}
            <motion.div
              layout
              className={`grid gap-6 ${viewMode === 'grid-3'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : viewMode === 'grid-4'
                  ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
                  : 'grid-cols-1'
                }`}>
              <AnimatePresence mode="popLayout">
                {sortedColleges.map((college, index) => {
                  const admissionInfo = getAdmissionInfo(college);
                  const saveKey = `${college.college_code}_${college.branch}`;
                  const isSaved = savedColleges.includes(saveKey);

                  // Render the icon dynamically based on the name
                  const IconComponent = {
                    Zap, CheckCircle, Target, TrendingUp, AlertCircle
                  }[admissionInfo.iconName] || AlertCircle;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      transition={{
                        duration: 0.4,
                        delay: Math.min(index * 0.05, 0.3),
                        ease: [0.23, 1, 0.32, 1]
                      }}
                      key={`${college.college_code}_${college.branch}_${index}`}
                      className="group bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12)] hover:border-indigo-100 transition-all duration-500 overflow-hidden hover:-translate-y-1.5 flex flex-col h-full"
                    >
                      {/* Image Header with Heavy Glassmorphism */}
                      <div className="relative h-56 overflow-hidden">
                        <CollegeImage
                          collegeCode={college.college_code}
                          className="w-full h-full object-cover group-hover:scale-[1.07] transition-transform duration-700 ease-out"
                          alt={`${college.college_name} campus`}
                          priority={index < 4}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>

                        {/* Floating Save Button */}
                        <button
                          onClick={() => toggleSaveCollege(college)}
                          className="absolute top-4 right-4 w-9 h-9 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:border-white transition-all duration-300 shadow-xl z-20 group/save"
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 text-white group-hover/save:text-indigo-600 transition-colors" />
                          ) : (
                            <Bookmark className="w-4 h-4 text-white group-hover/save:text-indigo-600 transition-colors" />
                          )}
                        </button>

                        {/* Status Badge */}
                        <div
                          className={`absolute top-4 left-4 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 ${admissionInfo.bgColor.replace('bg-gradient-to-r', '').replace('bg-white', 'bg-white/90')} text-slate-900 flex items-center space-x-1.5 text-xs font-bold z-20 shadow-lg`}
                        >
                          <IconComponent className={`w-3.5 h-3.5 ${admissionInfo.color.replace('text-', 'text-').split(' ')[0]}`} />
                          <span>{admissionInfo.label}</span>
                        </div>

                        {/* Title & Location Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-5 z-20 flex flex-col justify-end">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white tracking-tight leading-tight line-clamp-2 mb-2 group-hover:text-indigo-100 transition-colors">
                                {college.college_name}
                              </h3>
                              <div className="flex items-center text-slate-300 text-xs font-medium">
                                <MapPin className="w-3.5 h-3.5 mr-1" />
                                <span className="truncate">{college.city}</span>
                              </div>
                            </div>
                            <div className="flex-shrink-0 flex flex-col items-end">
                              <div className="px-3 py-1 rounded-lg bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 text-indigo-100 text-sm font-black shadow-lg">
                                {college.match_score ? `${college.match_score.toFixed(1)}/100` : (college.match_percentage || "N/A")}
                              </div>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Match Score</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Data Details Section */}
                      <div className="p-5 flex flex-col flex-grow">

                        {/* Branch & Category */}
                        <div className="flex flex-wrap items-center gap-2 mb-5">
                          <div className="inline-flex items-center space-x-1.5 bg-slate-50 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border border-slate-200/60">
                            <Layers className="w-3 h-3 text-indigo-500" />
                            <span className="line-clamp-1 max-w-[180px]">{college.branch}</span>
                          </div>
                          <div className="inline-flex items-center space-x-1.5 bg-slate-50 text-slate-600 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border border-slate-200/60">
                            <Award className="w-3 h-3 text-emerald-500" />
                            <span>{college.category}</span>
                          </div>
                        </div>

                        {/* 4-Grid Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                          <div className="flex flex-col justify-center bg-white p-2 text-center border-b md:border-b-0 border-r md:border-r-0 border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cutoff</span>
                            <span className="text-sm font-black text-slate-800">
                              {college.cutoff_rank > 0 ? college.cutoff_rank : Math.round(college.cutoff_percentile)}
                            </span>
                          </div>
                          <div className="flex flex-col justify-center bg-white p-2 text-center border-b md:border-b-0 md:border-l border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Seats</span>
                            <span className="text-sm font-black text-slate-800">
                              {college.seats || "N/A"}
                            </span>
                          </div>
                          <div className="flex flex-col justify-center bg-white p-2 text-center border-r md:border-r-0 md:border-l border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fees</span>
                            <span className="text-sm font-black text-slate-800">
                              {college.fees ? `₹${(college.fees / 100000).toFixed(1)}L` : "N/A"}
                            </span>
                          </div>
                          <div className="flex flex-col justify-center bg-white p-2 text-center md:border-l border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Placements</span>
                            <span className="text-sm font-black text-emerald-600">
                              {college.placement_rate ? `${college.placement_rate.toFixed(0)}%` : "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Admission Probability Bar */}
                        <div className="mb-6 mt-auto">
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Admission Probability</span>
                            <span className={`text-xs font-black ${admissionInfo.color}`}>
                              {admissionInfo.percentage}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${admissionInfo.gradient} transition-all duration-1000`}
                              style={{ width: `${college.admission_chance || 0}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Package Highlights */}
                        {(college.average_package_lpa > 0 || college.highest_package_lpa > 0) && (
                          <div className="mb-6 bg-slate-50 rounded-xl border border-slate-200/60 p-3 mt-auto">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 flex-shrink-0">
                                <Trophy className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Package (LPA)</span>
                              </span>
                              <div className="flex flex-wrap items-center gap-3">
                                {college.average_package_lpa > 0 && (
                                  <div className="text-[11px] font-black text-slate-800">Avg: {college.average_package_lpa.toFixed(1)}L</div>
                                )}
                                {college.highest_package_lpa > 0 && (
                                  <div className="text-[10px] font-bold text-slate-500 border-l border-slate-300 pl-3">High: {college.highest_package_lpa.toFixed(1)}L</div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Call to Action Button */}
                        <button
                          onClick={() => navigate("/college-details", { state: { college } })}
                          className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-colors duration-300 shadow-sm flex items-center justify-center space-x-2 group/btn mt-auto"
                        >
                          <span>View Details</span>
                          <ExternalLink className="w-4 h-4 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </>
        )}

        {/* Footer CTA */}
        {!isLoading && sortedColleges.length > 0 && (
          <div className="mt-auto bg-slate-800 rounded-2xl p-8 text-center text-white shadow-xl">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-bold mb-2">Need More Personalized Recommendations?</h3>
              <p className="text-slate-300 mb-6">
                Update your profile with detailed preferences to get even better college matches tailored just for you.
              </p>
              <button
                onClick={() => navigate("/profile")}
                className="bg-white text-slate-800 px-8 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl inline-flex items-center space-x-2"
              >
                <User className="w-5 h-5" />
                <span>Complete Your Profile</span>
              </button>
            </div>
          </div>
        )}
        <footer className="mt-auto">
          <Footer />
        </footer>
      </div>
    </div>
  );
}
