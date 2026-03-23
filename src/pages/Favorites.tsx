import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {

  MapPin,
  Award,
  Layers,
  Trophy,
  ExternalLink,
  Trash2,
  Search,
  Filter,
  ArrowLeft,
  Target,
  CheckCircle,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useColleges } from "../context/CollegesContext";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useFavorites } from "../hooks/useFavorites";
import type { UserProfile } from "../types/user";


// Illustrations
import EmptyInboxImg from "../assets/Empty-inbox.svg";
import NoResultsImg from "../assets/No-results-found.svg";

interface College {
  college_code: string;
  college_name: string;
  city: string;
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
  probability_level: string;
  is_most_probable: boolean;
  admission_chance: number;
  admission_chance_percentage: string;
  fit: string;
  fit_reason: string;
  match_score: number;
  match_percentage: string;
  display_fees: string;
  display_seats: string;
  display_cutoff: string;
  display_placement?: string;
}


// Function to get college image from local assets
const getCollegeImage = (collegeCode: string): string => {
  if (!collegeCode) {
    return "/src/assets/fallback-campus.jpg";
  }

  // Try to load image from assets folder based on college code
  // Format: /src/assets/{college_code}/campus.jpg
  const imagePath = `/src/assets/${collegeCode}/campus.png`;

  return imagePath;
};

// Fallback Unsplash images for error cases
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80",
];

const getRandomFallbackImage = (): string => {
  return FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
};

interface CollegeImageProps {
  collegeCode: string;
  className?: string;
  alt?: string;
}

const CollegeImage: React.FC<CollegeImageProps> = ({
  collegeCode,
  className = '',
  alt = 'College campus',
}) => {
  const [imgSrc, setImgSrc] = useState<string>(getCollegeImage(collegeCode));
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Update image source if collegeCode changes
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
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={handleError}
      />
    </div>
  );
};

export default function Favorites() {
  const navigate = useNavigate();
  useColleges();
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [viewMode, setViewMode] = useState<'grid-3' | 'grid-4' | 'list'>('grid-3');
  const [activeFilter, setActiveFilter] = useState("all");

  // ── Supabase-backed favorites ──────────────────────────────────────────────
  const { favorites: savedColleges, isLoading: favLoading, removeFavorite } = useFavorites();

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
        return null;
      }
      return profile as UserProfile;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
  });

  // Filter colleges based on search and branch
  const filteredColleges = savedColleges.filter((college) => {
    const matchesSearch = college.college_name.toLowerCase().includes(search.toLowerCase()) ||
      college.city.toLowerCase().includes(search.toLowerCase());
    const matchesBranch = selectedBranch === "" || college.branch_name === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  // Get unique branches for filter dropdown
  const uniqueBranches = Array.from(new Set(savedColleges.map(college => college.branch_name))).filter(Boolean).sort();

  // Handle removing a favorite — delegates to Supabase hook (optimistic)
  const handleRemoveFavorite = (college_code: string, branch: string) => {
    removeFavorite({ college_code, branch });
  };

  const getAdmissionInfo = (college: College) => {
    const fitCategory = college.probability_level || college.fit;

    if (college.is_most_probable || fitCategory === "Most Probable") {
      return {
        percentage: college.admission_chance_percentage || "95%",
        color: "text-purple-700",
        bgColor: "bg-slate-50 border border-slate-200",
        label: "Most Probable",
        gradient: "from-purple-600 via-purple-500 to-pink-500",
        icon: <Zap className="w-4 h-4" />,
        badgeColor: "bg-gradient-to-r from-purple-600 to-pink-600",
        glow: "shadow-lg shadow-purple-500/20",
        order: 1,
      };
    }

    switch (fitCategory) {
      case "Best Fit":
        return {
          percentage: college.admission_chance_percentage || "85%",
          color: "text-green-700",
          bgColor: "bg-slate-50 border border-slate-200",
          label: "Best Fit",
          gradient: "from-green-500 via-emerald-500 to-teal-500",
          icon: <CheckCircle className="w-4 h-4" />,
          badgeColor: "bg-gradient-to-r from-green-500 to-emerald-600",
          glow: "shadow-lg shadow-green-500/20",
          order: 2,
        };
      case "Good Fit":
        return {
          percentage: college.admission_chance_percentage || "70%",
          color: "text-blue-700",
          bgColor: "bg-slate-50 border border-slate-200",
          label: "Good Fit",
          gradient: "from-blue-500 via-cyan-500 to-sky-500",
          icon: <Target className="w-4 h-4" />,
          badgeColor: "bg-gradient-to-r from-blue-500 to-cyan-600",
          glow: "shadow-lg shadow-blue-500/20",
          order: 3,
        };
      case "Stretch":
        return {
          percentage: college.admission_chance_percentage || "50%",
          color: "text-orange-700",
          bgColor: "bg-slate-50 border border-slate-200",
          label: "Stretch",
          gradient: "from-orange-500 via-amber-500 to-red-500",
          icon: <TrendingUp className="w-4 h-4" />,
          badgeColor: "bg-gradient-to-r from-orange-500 to-red-600",
          glow: "shadow-lg shadow-orange-500/20",
          order: 4,
        };
      case "Unlikely Fit":
        return {
          percentage: college.admission_chance_percentage || "30%",
          color: "text-red-700",
          bgColor: "bg-slate-50 border border-slate-200",
          label: "Unlikely Fit",
          gradient: "from-red-500 via-rose-500 to-pink-500",
          icon: <TrendingDown className="w-4 h-4" />,
          badgeColor: "bg-gradient-to-r from-red-500 to-rose-600",
          glow: "shadow-lg shadow-red-500/20",
          order: 5,
        };
      default:
        return {
          percentage: college.admission_chance_percentage || "25%",
          color: "text-gray-700",
          bgColor: "bg-slate-50 border border-slate-200",
          label: "Unknown",
          gradient: "from-gray-500 to-gray-600",
          icon: <AlertCircle className="w-4 h-4" />,
          badgeColor: "bg-gradient-to-r from-gray-500 to-gray-600",
          glow: "",
          order: 6,
        };
    }
  };

  const getFilteredColleges = () => {
    let result = filteredColleges;

    switch (activeFilter) {
      case "most-probable":
        result = result.filter(
          (c) => c.is_most_probable || c.probability_level === "Most Probable"
        );
        break;
      case "best-fit":
        result = result.filter(
          (c) =>
            (c.fit === "Best Fit" || c.probability_level === "Best Fit") &&
            !c.is_most_probable
        );
        break;
      case "good-fit":
        result = result.filter(
          (c) => c.fit === "Good Fit" || c.probability_level === "Good Fit"
        );
        break;
      case "stretch":
        result = result.filter(
          (c) => c.fit === "Stretch" || c.probability_level === "Stretch"
        );
        break;
      default:
        break;
    }

    return result;
  };

  const displayedColleges = getFilteredColleges();

  // Helper helper to get sort order without creating full admission info object (avoids JSX creation in sort loop)
  const getSortOrder = (college: College) => {
    const fitCategory = college.probability_level || college.fit;
    if (college.is_most_probable || fitCategory === "Most Probable") return 1;
    switch (fitCategory) {
      case "Best Fit": return 2;
      case "Good Fit": return 3;
      case "Stretch": return 4;
      case "Unlikely Fit": return 5;
      default: return 6;
    }
  };

  const sortedColleges = useMemo(() => {
    return [...displayedColleges].sort((a, b) => {
      const aOrder = getSortOrder(a);
      const bOrder = getSortOrder(b);

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      return (b.admission_chance || 0) - (a.admission_chance || 0);
    });
  }, [displayedColleges]);

  const getStatistics = () => {
    return {
      total: savedColleges.length,
      mostProbable: savedColleges.filter(
        (c) => c.is_most_probable || c.probability_level === "Most Probable"
      ).length,
      bestFit: savedColleges.filter(
        (c) =>
          (c.fit === "Best Fit" || c.probability_level === "Best Fit") &&
          !c.is_most_probable
      ).length,
      goodFit: savedColleges.filter(
        (c) => c.fit === "Good Fit" || c.probability_level === "Good Fit"
      ).length,
      stretch: savedColleges.filter(
        (c) => c.fit === "Stretch" || c.probability_level === "Stretch"
      ).length,
      uniqueColleges: new Set(savedColleges.map((c) => c.college_code)).size,
    };
  };

  const stats = getStatistics();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar activeTab="favorites" userProfile={profile} />

      {/* ===== Mobile Search ===== */}
      <div className="lg:hidden px-6 py-4 bg-white/50 border-b border-gray-200/50">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search favorites by college name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full bg-white border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <div className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col pt-6">
        {/* ===== Header Section ===== */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center mb-4 text-gray-500 hover:text-indigo-600 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Favorites</h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  {savedColleges.length} saved colleges
                </p>
              </div>
            </div>
          </div>


        </div>

        {/* ===== Filters & Controls ===== */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeFilter === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                All Favorites ({stats.total})
              </button>
              <button
                onClick={() => setActiveFilter("most-probable")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeFilter === "most-probable"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <span className="flex items-center space-x-1">
                  <Zap className="w-4 h-4" />
                  <span>Most Probable ({stats.mostProbable})</span>
                </span>
              </button>
              <button
                onClick={() => setActiveFilter("best-fit")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeFilter === "best-fit"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <span className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Best Fit ({stats.bestFit})</span>
                </span>
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="pl-10 pr-8 py-2.5 w-full bg-white border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none appearance-none transition-all shadow-sm hover:shadow-md"
                >
                  <option value="">All Branches</option>
                  {uniqueBranches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Loading State ===== */}
        {favLoading && savedColleges.length === 0 ? (
          <div className="text-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Loading your saved colleges…</p>
          </div>
        ) : savedColleges.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-3xl border-2 border-dashed border-gray-300/50 shadow-sm">
            <img src={EmptyInboxImg} alt="No favorites yet" className="w-40 h-40 mx-auto mb-6 opacity-90" />
            <h4 className="text-xl font-semibold text-gray-900 mb-2">
              No favorites yet
            </h4>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Start exploring colleges and save your favorites for quick access to your preferred matches.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm"
            >
              Explore Colleges
            </button>
          </div>
        ) : sortedColleges.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-3xl border-2 border-dashed border-gray-300/50 shadow-sm">
            <img src={NoResultsImg} alt="No matches found" className="w-40 h-40 mx-auto mb-6 opacity-90" />
            <h4 className="text-xl font-semibold text-gray-900 mb-2">
              No matches found
            </h4>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Try adjusting your search terms or filter criteria.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedBranch("");
                setActiveFilter("all");
              }}
              className="px-6 py-3 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-sm"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* ===== Results Summary ===== */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Showing {sortedColleges.length} favorite college matches
                </h3>
                <p className="text-gray-600 text-sm">
                  Sorted by probability (Highest chance first)
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {/* View Mode Controls */}
                <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-1">
                  <button
                    onClick={() => setViewMode('grid-3')}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center space-x-1.5 ${viewMode === 'grid-3'
                      ? 'bg-indigo-600 text-white shadow-sm'
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
                      ? 'bg-indigo-600 text-white shadow-sm'
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
                      ? 'bg-indigo-600 text-white shadow-sm'
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

            {/* ===== College Cards Grid ===== */}
            <div className={`grid gap-6 ${viewMode === 'grid-3'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : viewMode === 'grid-4'
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
                : 'grid-cols-1'
              }`}>
              {sortedColleges.map((college, index) => {
                const admissionInfo = getAdmissionInfo(college);

                return (
                  <div
                    key={`${college.college_code}_${college.branch}_${index}`}
                    className="group bg-white rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {/* College Image Component */}
                      <CollegeImage
                        collegeCode={college.college_code}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        alt={`${college.college_name} campus`}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveFavorite(college.college_code, college.branch)}
                        className="absolute top-4 right-4 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all z-10"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Fit Badge */}
                      <div
                        className={`absolute top-4 left-4 px-2 py-1 rounded-md bg-white/90 text-gray-800 flex items-center space-x-1 text-sm font-medium z-10`}
                      >
                        {admissionInfo.icon}
                        <span>{admissionInfo.label}</span>
                      </div>

                      {/* College Info Overlay */}
                      <div className="absolute bottom-4 left-4 right-4 z-10">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
                              {college.college_name}
                            </h3>
                            <div className="flex items-center text-white/90 text-sm">
                              <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                              <span className="truncate">{college.city}</span>
                            </div>
                          </div>
                          <div
                            className="px-2 py-1 rounded bg-gray-800 text-white text-sm font-bold ml-2 flex-shrink-0"
                          >
                            {college.match_percentage}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* College Details */}
                    <div className="p-6">
                      {/* Branch Display */}
                      <div className="mb-4">
                        <div className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium mb-2">
                          <span className="flex items-center space-x-1">
                            <Layers className="w-4 h-4" />
                            <span>{college.branch}</span>
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Award className="w-4 h-4 mr-2 text-gray-500" />
                          <span>
                            {college.category} Category
                          </span>
                        </div>
                      </div>

                      {/* Quick Stats - 4 Columns */}
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="text-center bg-gray-50 p-2 rounded">
                          <div className="text-sm font-bold text-gray-900">
                            {college.cutoff_rank > 0
                              ? college.cutoff_rank
                              : Math.round(college.cutoff_percentile)}
                          </div>
                          <div className="text-xs text-gray-500">Cutoff</div>
                        </div>
                        <div className="text-center bg-gray-50 p-2 rounded">
                          <div className="text-sm font-bold text-gray-900">
                            {college.seats || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">Seats</div>
                        </div>
                        <div className="text-center bg-gray-50 p-2 rounded">
                          <div className="text-sm font-bold text-gray-900">
                            {college.fees
                              ? `₹${(college.fees / 100000).toFixed(1)}L`
                              : "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">Fees/Year</div>
                        </div>
                        <div className="text-center bg-gray-50 p-2 rounded">
                          <div className="text-sm font-bold text-gray-900">
                            {college.placement_rate
                              ? `${college.placement_rate.toFixed(0)}%`
                              : "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Placements
                          </div>
                        </div>
                      </div>

                      {/* Admission Chance Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-600 text-sm">
                            Admission Chance
                          </span>
                          <span className="font-bold text-gray-900">
                            {college.admission_chance_percentage}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gray-600 transition-all duration-500"
                            style={{
                              width: `${college.admission_chance || 0}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {college.fit_reason}
                        </p>
                      </div>

                      {/* Package Info if Available */}
                      {(college.average_package_lpa > 0 ||
                        college.highest_package_lpa > 0) && (
                          <div className="mb-4 p-3 bg-gray-50 rounded">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700 text-sm flex items-center space-x-1">
                                <Trophy className="w-4 h-4 text-gray-500" />
                                <span>Package (LPA)</span>
                              </span>
                              <div className="text-right">
                                {college.average_package_lpa > 0 && (
                                  <div className="text-gray-900 font-bold">
                                    Avg: {college.average_package_lpa.toFixed(1)}L
                                  </div>
                                )}
                                {college.highest_package_lpa > 0 && (
                                  <div className="text-gray-600 text-xs">
                                    High: {college.highest_package_lpa.toFixed(1)}
                                    L
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <button
                          onClick={() =>
                            navigate("/college-details", { state: { college } })
                          }
                          className="flex-1 bg-indigo-600 text-white py-2 rounded font-medium hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
                        >
                          <span>View Details</span>
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>

      {/* Footer */}
      <footer className="mt-auto">
        <Footer />
      </footer>
    </div>
  );
}
