import { useEffect, useMemo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/Loader";

// Services & Hooks
import { supabase } from "@/lib/supabase";
import { useColleges } from "@/context/CollegesContext";
import { useFavorites } from "../../hooks/useFavorites";
import { useDashboardFilters } from "@/features/dashboard/hooks/useDashboardFilters";
import { fetchUserProfile } from "@/services/supabase/users";
import { predictAdmission } from "@/services/ml-api/predictions";
import { exportToPDF, exportToCSV, exportDreamList, exportDreamCSV, exportStrategicForm } from "@/utils/exportUtils";

// Components
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import Navbar from "@/components/Navbar";
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader";
import { StatsBar } from "@/features/dashboard/components/StatsBar";
import { FilterBar } from "@/features/dashboard/components/FilterBar";
import { CollegeCard } from "@/features/dashboard/components/CollegeCard";

// Types & Constants
import type { College } from "@/types/college";
import { ROUTES } from "@/constants/routes";
import { FileDown, FileText, ClipboardList } from "lucide-react";



export const getCollegeImage = (collegeCode: string): string => {
  if (!collegeCode) {
    return "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  }
  return new URL(`../assets/${collegeCode}/campus.png`, import.meta.url).href;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { colleges, setColleges } = useColleges();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [aiInsights, setAiInsights] = useState<string>("");
  const [dreamList, setDreamList] = useState<College[]>([]);
  const [dreamLimit, setDreamLimit] = useState<number>(20);

  // ── Profile Query ──────────────────────────────────────────────────────────
  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate(ROUTES.LOGIN, { replace: true });
        throw new Error("No session");
      }
      const userProfile = await fetchUserProfile(session.user.id);
      if (!userProfile.profile_complete) {
        navigate(ROUTES.PROFILE, { replace: true });
        throw new Error("Profile not complete");
      }
      return userProfile;
    },
    staleTime: 1000 * 60 * 5,
  });

  // ── Predictions Query ──────────────────────────────────────────────────────
  const predictionsQuery = useQuery({
    queryKey: ['predictions', profile?.id],
    queryFn: async () => {
      try {
        if (!profile?.preferred_branches || profile.preferred_branches.length === 0) return [];

        const requestData = {
          score: profile.exam_type === "CET" ? parseFloat(profile.cet_score || "0") : parseFloat(profile.diploma_score || "0"),
          rank: profile.exam_type === "CET" ? parseFloat(profile.cet_rank || "0") : parseFloat(profile.diploma_rank || "0"),
          category: profile.category as any,
          branches: profile.preferred_branches,
          limit: 100,
        };

        const data = await predictAdmission(requestData);

        if (data.ai_insights) {
          setAiInsights(data.ai_insights);
        }

        if (data.dream_list) {
          setDreamList(data.dream_list);
        }

        if (data.colleges && data.colleges.length > 0) {
          return data.colleges.map((college: College) => ({
            ...college,
            image: getCollegeImage(college.college_code),
            display_fees: `₹${(college.fees || 0).toLocaleString()}`,
          }));
        }
        throw new Error("API empty");
      } catch (err) {
        setAiInsights("AI Analysis failing, using base data matches.");
        const { data: dbData } = await supabase.from('colleges_2025').select('*');
        if (!dbData) return [];

        const preferredBranches = profile?.preferred_branches || [];
        const uniqueMap = new Map<string, College>();

        dbData.forEach((c: any) => {
          const collegeCode = c.college_code;
          const branchName = c.branch_name || c.Branch_name || '';

          // Check if this row matches one of the user's preferred branches
          const isPreferred = preferredBranches.length === 0 || preferredBranches.some(pref =>
            branchName.toLowerCase().includes(pref.toLowerCase()) ||
            pref.toLowerCase().includes(branchName.toLowerCase())
          );

          if (!isPreferred) return;

          if (!uniqueMap.has(collegeCode)) {
            uniqueMap.set(collegeCode, {
              ...c,
              branch: branchName, // Normalize to 'branch' for the UI
              branch_name: branchName,
              image: getCollegeImage(collegeCode),
              display_fees: `₹${(c.fees || 0).toLocaleString()}`,
            });
          }
        });

        // If we filtered out EVERYTHING, return at least one branch per college as last resort
        if (uniqueMap.size === 0 && dbData.length > 0) {
          dbData.forEach((c) => {
            if (!uniqueMap.has(c.college_code)) {
              uniqueMap.set(c.college_code, { ...c, branch: c.branch_name, image: getCollegeImage(c.college_code) });
            }
          });
        }

        return Array.from(uniqueMap.values());
      }
    },
    enabled: !!profile,
    staleTime: 1000 * 60 * 10,
  });

  const predictionsData = predictionsQuery.data;
  const predictionsLoading = predictionsQuery.isLoading;

  useEffect(() => {
    if (predictionsData && predictionsData.length > 0) {
      setColleges(predictionsData);
    }
  }, [predictionsData, setColleges]);

  // ── Filters & Formatting ───────────────────────────────────────────────────
  const {
    activeFilter, setActiveFilter,
    selectedBranch, setSelectedBranch,
    selectedCity, setSelectedCity,
    selectedDistrict, setSelectedDistrict,
    searchInput, handleSearch,
    filtered, onClearFilters
  } = useDashboardFilters(colleges);

  const getStatistics = useCallback(() => {
    return {
      total: colleges.length,
      mostProbable: colleges.filter((c: College) => c.is_most_probable || c.probability_level === "Most Probable").length,
      bestFit: colleges.filter((c: College) => (c.fit === "Best Fit" || c.probability_level === "Best Fit") && !c.is_most_probable).length,
      goodFit: colleges.filter((c: College) => c.fit === "Good Fit" || c.probability_level === "Good Fit").length,
      stretch: colleges.filter((c: College) => c.fit === "Stretch" || c.probability_level === "Stretch").length,
      reach: colleges.filter((c: College) => c.fit === "Reach" || c.probability_level === "Reach").length,
      uniqueColleges: new Set(colleges.map((c: College) => c.college_code)).size,
    };
  }, [colleges]);

  const stats = useMemo(() => getStatistics(), [getStatistics]);

  const getAdmissionInfo = useCallback((college: College) => {
    const fitCategory = college.probability_level || college.fit;
    if (college.is_most_probable || fitCategory === "Most Probable") {
      return {
        percentage: college.admission_chance ? `${college.admission_chance.toFixed(1)}%` : (college.admission_chance_percentage || "95.0%"),
        color: "text-purple-700",
        bgColor: "bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200",
        label: "Most Probable",
        gradient: "from-purple-600 via-purple-500 to-pink-500",
        iconName: "Zap",
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
          order: 4,
        };
      case "Reach":
        return {
          percentage: college.admission_chance ? `${college.admission_chance.toFixed(1)}%` : (college.admission_chance_percentage || "25.0%"),
          color: "text-red-700",
          bgColor: "bg-gradient-to-r from-red-50 to-rose-50 border border-red-200",
          label: "Reach",
          gradient: "from-red-500 via-rose-500 to-pink-600",
          iconName: "AlertTriangle",
          order: 5,
        };
      default:
        return {
          percentage: college.admission_chance ? `${college.admission_chance.toFixed(1)}%` : (college.admission_chance_percentage || "25.0%"),
          color: "text-gray-700",
          bgColor: "bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200",
          label: "Unknown",
          gradient: "from-gray-500 to-gray-600",
          iconName: "AlertCircle",
          order: 5,
        };
    }
  }, []);

  const sortedColleges = useMemo(() => {
    let result = filtered;
    if (activeFilter !== "all") {
      if (activeFilter === "saved") {
        result = result.filter(c => isFavorite(c.college_code, c.branch!));
      } else {
        result = result.filter(c => (c.fit?.toLowerCase() === activeFilter.replace("-", " ") || c.probability_level?.toLowerCase() === activeFilter.replace("-", " ")));
      }
    }

    result = [...result].sort((a, b) => {
      // Sort by cutoff_rank ascending (hardest cutoffs to easiest)
      // This will flow from Stretch -> Best Fit -> Good Fit -> Most Probable sequentially.
      const rankA = a.cutoff_rank || 0;
      const rankB = b.cutoff_rank || 0;

      // Secondary: if cutoff_rank is identical, fall back to match score
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return (b.match_score || 0) - (a.match_score || 0);
    });

    return result;
  }, [filtered, activeFilter, isFavorite, getAdmissionInfo]);

  const branches = useMemo(() => [...new Set(colleges.map((c) => c.branch!))].sort(), [colleges]);
  const cities = useMemo(() => [...new Set(colleges.map((c) => c.city))].sort(), [colleges]);
  const districts = useMemo(() => [...new Set(colleges.map((c) => c.district!).filter(Boolean))].sort(), [colleges]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchInput, selectedBranch, selectedCity, selectedDistrict]);

  const totalPages = Math.ceil(sortedColleges.length / itemsPerPage);
  const paginatedColleges = sortedColleges.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!profile || predictionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center flex flex-col items-center gap-12">
          <Loader />
          <p className="text-slate-600 font-bold tracking-tight">Crunching probability for your rank...</p>
        </div>
      </div>
    );
  }

  const handleExportPDF = () => {
    if (sortedColleges.length) {
      exportToPDF(sortedColleges, profile as any, aiInsights);
    }
  };

  const handleExportCSV = () => {
    if (sortedColleges.length) {
      exportToCSV(sortedColleges);
    }
  };

  const handleExportDream = () => {
    if (dreamList.length) {
      exportDreamList(dreamList.slice(0, dreamLimit), profile);
    }
  };

  const handleExportDreamCSV = () => {
    if (dreamList.length) {
      exportDreamCSV(dreamList.slice(0, dreamLimit), profile);
    }
  };

  const handleExportStrategic = () => {
    if (!colleges.length) return;

    // Strategic Partition (5% / 55% / 40%)
    const ambition = colleges.filter(c => c.fit === "Reach" || c.fit === "Stretch");
    const target = colleges.filter(c => c.fit === "Best Fit" || c.fit === "Good Fit");
    const backup = colleges.filter(c => c.fit === "Most Probable");

    const totalLimit = dreamLimit;
    const ambitionCount = Math.max(1, Math.ceil(totalLimit * 0.05));
    const targetCount = Math.max(1, Math.ceil(totalLimit * 0.55));
    const backupCount = Math.max(1, Math.floor(totalLimit * 0.40));

    const strategicList = [
      ...ambition.slice(0, ambitionCount),
      ...target.slice(0, targetCount),
      ...backup.slice(0, backupCount)
    ];

    exportStrategicForm(strategicList, profile);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar activeTab="dashboard" userProfile={profile} />

      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        <Breadcrumbs />

        <DashboardHeader profile={profile} />
        <StatsBar stats={stats} />

        <FilterBar
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          stats={stats}
          searchInput={searchInput}
          handleSearch={handleSearch}
          selectedBranch={selectedBranch}
          handleBranchFilter={setSelectedBranch}
          branches={branches}
          selectedCity={selectedCity}
          handleCityFilter={setSelectedCity}
          cities={cities}
          selectedDistrict={selectedDistrict}
          handleDistrictFilter={setSelectedDistrict}
          districts={districts}
          onClearFilters={onClearFilters}
        />

        {/* Results Body */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Showing {sortedColleges.length} matches
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-start sm:justify-end w-full sm:w-auto">
            <button
              onClick={handleExportPDF}
              className="px-3 sm:px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-all flex items-center space-x-2"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span className="sm:inline">PDF</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 sm:px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-all flex items-center space-x-2"
            >
              <FileDown className="w-4 h-4 text-emerald-600" />
              <span className="sm:inline">CSV</span>
            </button>
            <button
              onClick={handleExportDream}
              className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-indigo-700 shadow-sm transition-all flex items-center space-x-2"
            >
              <FileText className="w-4 h-4 text-amber-200" />
              <span className="sm:inline">Dream</span>
            </button>
            <button
              onClick={handleExportDreamCSV}
              className="px-3 sm:px-4 py-2 bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-900 shadow-sm transition-all flex items-center space-x-2"
            >
              <FileDown className="w-4 h-4 text-amber-200" />
              <span className="sm:inline">Dream</span>
            </button>
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 sm:px-3 py-1">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 mr-2">Limit:</span>
              <input
                type="number"
                min="1"
                max="300"
                value={dreamLimit}
                onChange={(e) => setDreamLimit(Math.min(300, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-8 sm:w-12 bg-transparent border-none text-xs sm:text-sm font-bold text-slate-800 focus:ring-0 p-0"
              />
            </div>
            <button
              onClick={handleExportStrategic}
              className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-purple-700 shadow-sm transition-all flex items-center space-x-2"
            >
              <ClipboardList className="w-4 h-4 text-purple-200" />
              <span className="sm:inline">Options</span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {paginatedColleges.map((college, index) => (
            <CollegeCard
              key={`${college.college_code}_${college.branch}_${index}`}
              college={college}
              index={index}
              isSaved={isFavorite(college.college_code, college.branch || '')}
              toggleSaveCollege={() => toggleFavorite({
                ...college,
                branch: college.branch || '',
                branch_name: college.branch_name || '',
                branch_code: college.branch_code || '',
                display_fees: `₹${(college.fees || 0).toLocaleString()}`,
                display_seats: `${college.seats || 0}`,
                display_cutoff: `${college.cutoff_rank || 0}`,
              } as any)}
              getAdmissionInfo={getAdmissionInfo}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-10 flex flex-wrap justify-center items-center gap-2 sm:gap-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 sm:px-4 sm:py-2 flex-shrink-0 text-sm sm:text-base rounded-xl border border-gray-200 bg-white text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNumber = idx + 1;
                // Show a limited number of pagination dots if there are many pages
                if (totalPages > 7) {
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl font-medium transition-colors text-xs sm:text-sm ${currentPage === pageNumber
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return <span key={idx} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl font-medium transition-colors text-xs sm:text-sm ${currentPage === pageNumber
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 sm:px-4 sm:py-2 flex-shrink-0 text-sm sm:text-base rounded-xl border border-gray-200 bg-white text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
