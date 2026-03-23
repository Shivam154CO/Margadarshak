import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { normalizeCollegeData } from '@/utils';
import type { College } from '@/types/college';
import { useFavorites } from '@/hooks/useFavorites';
import seatMatrixMap from '@/assets/seat_matrix_map.json';
import { 
  Building, Calendar, GraduationCap, Users, 
  TrendingUp, DollarSign, Briefcase, Trophy, Home
} from 'lucide-react';
import { useSearchParams, useParams } from 'react-router-dom';

const getCategoryColor = (category: string) => {
  const cat = category.toUpperCase();
  if (cat.includes('OPEN') || cat.includes('GOPN') || cat.includes('LOPN')) return '#2563eb'; // blue
  if (cat.includes('OBC') || cat.includes('GOBC') || cat.includes('LOBC')) return '#7c3aed'; // purple
  if (cat.includes('SC') || cat.includes('GSC') || cat.includes('LSC')) return '#dc2626'; // red
  if (cat.includes('ST') || cat.includes('GST') || cat.includes('LST')) return '#ea580c'; // orange
  if (cat.includes('EWS')) return '#059669'; // emerald
  if (cat.includes('TFWS')) return '#0891b2'; // cyan
  if (cat.includes('VJ') || cat.includes('DT')) return '#be185d'; // pink
  if (cat.includes('NT')) return '#4338ca'; // indigo
  return '#64748b'; // slate
};

export function useCollegeDetails() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { code: pathCode } = useParams();
  
  const urlCollegeCode = searchParams.get('code') || pathCode;
  const urlBranchName = searchParams.get('branch');
  
  const getInitialCollege = useCallback((): any => {
    // 1. Priority: Location state (passed from Search/Dashboard)
    if (location.state?.college) {
      const stateCollege = location.state.college;
      localStorage.setItem('selectedCollege', JSON.stringify(stateCollege));
      return stateCollege;
    }
    
    // 2. Secondary: URL Parameters (for refresh/bookmarks)
    if (urlCollegeCode) {
        return {
            college_code: urlCollegeCode,
            branch_name: urlBranchName || 'N/A'
        };
    }

    // 3. Last Resort: LocalStorage
    try {
      const savedCollege = localStorage.getItem('selectedCollege');
      if (savedCollege) return JSON.parse(savedCollege);
    } catch (e) { console.error(e); }
    return null;
  }, [location.state, urlCollegeCode, urlBranchName]);

  const [college, setCollege] = useState<College>(() => normalizeCollegeData(getInitialCollege()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [collegeReviews, setCollegeReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const { data: profile } = useQuery<any>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const [collegeInsights, setCollegeInsights] = useState<string>("");
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);

  const fetchCollegeInsights = useCallback(async () => {
    if (!college.college_code || !profile) return;
    setIsInsightsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_ML_API_URL || 'http://127.0.0.1:5001'}/college_insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          college_code: college.college_code,
          user_rank: profile.exam_type === 'CET' ? profile.cet_rank : profile.diploma_rank,
          branch_name: college.branch_name
        })
      });
      const data = await response.json();
      setCollegeInsights(data.insights || "");
    } catch (err) {
      console.error("Failed to fetch college insights:", err);
    } finally {
      setIsInsightsLoading(false);
    }
  }, [college.college_code, profile, college.branch_name]);

  // Fetch full college data if missing or incomplete
  useEffect(() => {
    const fetchFullData = async () => {
      const code = college.college_code || urlCollegeCode;
      if (!code) {
        setLoading(false);
        return;
      }

      // Check if we need to fetch (if branches or seat matrix missing)
      const hasFullData = college.branches && college.branches.length > 0 && 
                         college.branches[0].categories && college.branches[0].categories.length > 0;
      
      if (hasFullData && college.college_code === code) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch ALL rows for this college to aggregate branches and categories
        const { data: rows, error: fetchError } = await supabase
          .from('colleges_2025')
          .select('*')
          .eq('college_code', code);

        if (fetchError) throw fetchError;
        
        if (rows && rows.length > 0) {
          // 1. Identify primary branch (prioritize URL/State)
          const searchBranch = (urlBranchName || college.branch_name || college.branch || rows[0].branch_name || '').toLowerCase().replace(/engineering/g, '').replace(/engg/g, '').trim();
          
          // Case-insensitive match find
          const primaryRow = rows.find(r => {
            const rowBranch = (r.branch_name || '').toLowerCase().replace(/engineering/g, '').replace(/engg/g, '').trim();
            return rowBranch.includes(searchBranch) || searchBranch.includes(rowBranch);
          }) || rows[0];
          
          const targetBranch = primaryRow.branch_name;

          // 2. Aggregate available branches and their specific seat matrices
          const branchMap = new Map<string, any>();
          
          rows.forEach(row => {
            const bName = row.branch_name || 'N/A';
            const bKey = bName.toLowerCase().trim();
            if (!branchMap.has(bKey)) {
              branchMap.set(bKey, {
                branch_name: bName,
                branch_code: row.branch_code,
                total_intake: 0, // We'll sum it up
                categories: []
              });
            }
            
            const b = branchMap.get(bKey);
            const rowSeats = typeof row.seats === 'number' ? row.seats : (parseInt(row.seats) || 0);
            const rowCategory = (row.category || '').toUpperCase().trim();
            
            // Prioritize the minimum non-zero total_intake if available in any row for this branch
            // This avoids inflated numbers from supernumerary seats (like EWS/TFWS)
            const rowIntake = row.total_intake || row.Total_Intake || 0;
            if (rowIntake > 0) {
              if (b.total_intake === 0 || rowIntake < b.total_intake) {
                 b.total_intake = rowIntake;
              }
            } else if (b.total_intake === 0 || !row.total_intake) {
              // Only sum seats if total_intake is missing
              // CRITICAL: Excluding supernumerary seats (EWS/TFWS) from official intake sum
              if (rowCategory !== 'EWS' && rowCategory !== 'TFWS' && !rowCategory.includes('ORPHAN')) {
                b.total_intake += rowSeats;
              }
            }
            
            // Add category to this branch's seat matrix
            if (row.category && rowSeats > 0) {
              b.categories.push({
                category: row.category,
                seats: rowSeats,
                color: getCategoryColor(row.category)
              });
            }
          });

          // Sort and compute percentages
          const branches = Array.from(branchMap.values()).map(b => {
             const intake = b.total_intake || 1;
             return {
                ...b,
                categories: b.categories.map((c: any) => ({
                   ...c,
                   percentage: (c.seats / intake) * 100
                }))
             };
          }).sort((a, b) => b.total_intake - a.total_intake);
          
          const currentBranchData = branches.find(b => b.branch_name === targetBranch) || branches[0];
          const totalIntake = currentBranchData?.total_intake || 0;

          const fullCollege = normalizeCollegeData({
            ...primaryRow,
            total_intake: totalIntake,
            seats: totalIntake,
            branches,
            seat_matrix: currentBranchData?.categories?.map((c: any) => ({
                ...c,
                percentage: (c.seats / (totalIntake || 1)) * 100
            })) || []
          });

          setCollege(fullCollege);
          localStorage.setItem('selectedCollege', JSON.stringify(fullCollege));
          
          // Update URL silently if possible to reflect the state
          if (!urlCollegeCode) {
             const newUrl = new URL(window.location.href);
             newUrl.searchParams.set('code', code);
             newUrl.searchParams.set('branch', targetBranch);
             window.history.replaceState({}, '', newUrl.toString());
          }
        } else {
            setError("College data not found in our 2025-26 database.");
        }
      } catch (err: any) {
        console.error("[useCollegeDetails] Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFullData();
  }, [college.college_code, urlCollegeCode]);

  useEffect(() => {
    if (profile && college?.college_code) {
      fetchCollegeInsights();
    }
  }, [profile?.id, college?.college_code, fetchCollegeInsights]);

  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = useMemo(() => 
    college.college_code && college.branch_name ? isFavorite(college.college_code, college.branch_name) : false,
    [college.college_code, college.branch_name, isFavorite]
  );

  // Fetch reviews logic
  const fetchReviews = useCallback(async () => {
    if (!college.college_code) return;
    setReviewsLoading(true);
    try {
      const { data } = await supabase
        .from('college_reviews_with_profiles')
        .select('*')
        .eq('college_code', college.college_code)
        .order('created_at', { ascending: false });
      setCollegeReviews(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  }, [college.college_code]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Derived stats
  const academicData = {
    establishedYear: college.established_year || "N/A",
    accreditation: college.accreditation || "NBA Accredited",
    university: college.university || "State University",
    degreeType: college.degree_type || "Bachelor of Engineering",
    duration: college.duration_years || 4,
    shift: college.shift || "Full Time"
  };

  const quickStats = [
    { label: "Est. Year", value: academicData.establishedYear, icon: Calendar, color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: "University", value: academicData.university, icon: Building, color: "text-purple-600", bgColor: "bg-purple-50" },
    { label: "Degree", value: academicData.degreeType, icon: GraduationCap, color: "text-emerald-600", bgColor: "bg-emerald-50" },
    { label: "Intake", value: college.total_intake || college.seats || "N/A", icon: Users, color: "text-amber-600", bgColor: "bg-amber-50" }
  ];

  const seatData = {
    totalIntake: college.total_intake || college.seats || 0,
    currentSeats: college.seats || 0,
    otherSeats: Math.max(0, (college.total_intake || 0) - (college.seats || 0))
  };

  const feeData = {
    totalFees: (college.fees || 0) + (college.hostel_fees || 0) + (college.bus_fees || 0),
    categories: [
      { category: "Tuition Fee", amount: college.fees || 0, icon: DollarSign, color: "bg-blue-500" },
      { category: "Hostel Fee", amount: college.hostel_fees || 0, icon: Home, color: "bg-purple-500" },
      { category: "Bus Fee", amount: college.bus_fees || 0, icon: Briefcase, color: "bg-amber-500" }
    ]
  };

  const placementData = {
    placementRate: college.placement_rate || 0,
    averagePackage: college.average_package_lpa || 0,
    highestPackage: college.highest_package_lpa || 0,
    internshipRate: college.internship_rate || 0,
    topRecruiters: college.top_recruiters?.split(',').map(s => s.trim()) || [],
    placementContact: "Contact Placement Cell"
  };

  const infrastructure = [
    { label: "Labs", value: college.labs_count || "Multiple", icon: Building, color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: "WiFi", value: college.wifi_campus || "Available", icon: TrendingUp, color: "text-emerald-600", bgColor: "bg-emerald-50" },
    { label: "Library", value: college.library_books || "Well-stocked", icon: Briefcase, color: "text-purple-600", bgColor: "bg-purple-50" },
    { label: "Sports", value: "Available", icon: Trophy, color: "text-amber-600", bgColor: "bg-amber-50" }
  ];

  const automationData = useMemo(() => {
    const collegeCode = college.college_code;
    const branchName = college.branch_name;
    
    let pageNumber = 1;
    if (collegeCode && (seatMatrixMap as any)[collegeCode]) {
      const collegeBranches = (seatMatrixMap as any)[collegeCode];
      if (branchName && collegeBranches[branchName]) {
        pageNumber = collegeBranches[branchName];
      } else if (branchName) {
        // Robust matching for branch names
        const searchName = branchName.toLowerCase().replace(/engineering/g, '').replace(/engg/g, '').trim();
        const match = Object.keys(collegeBranches).find(key => {
          const keyNorm = key.toLowerCase().replace(/engineering/g, '').replace(/engg/g, '').trim();
          return keyNorm.includes(searchName) || searchName.includes(keyNorm);
        });
        if (match) pageNumber = collegeBranches[match];
      }
    }
    
    return {
      pageNumber,
      pdfUrl: "/assets/2025-26.pdf"
    };
  }, [college.college_code, college.branch_name]);

  const handleSaveCollege = () => {
    toggleFavorite({
      ...college,
      branch: college.branch || college.branch_name || '',
      branch_name: college.branch_name || '',
      branch_code: college.branch_code || '',
      display_fees: `₹${(college.fees || 0).toLocaleString()}`,
      display_seats: `${college.seats || 0}`,
      display_cutoff: `${college.cutoff_rank || 0}`,
    } as any);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: college.college_name,
        text: `Check out ${college.college_name} on Ikigai!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
        () => {
            setDistance(15.5); // Mocked for now
            setIsGettingLocation(false);
        },
        () => {
            setLocationError("Failed to get location");
            setIsGettingLocation(false);
        }
    );
  };

  const updateBranch = useCallback((newBranchName: string) => {
    setCollege(prev => {
      const branchData = prev.branches?.find(b => b.branch_name === newBranchName);
      return {
        ...prev,
        branch_name: newBranchName,
        branch_code: branchData?.branch_code || prev.branch_code,
        seat_matrix: branchData?.categories || [],
        total_intake: branchData?.total_intake || prev.total_intake,
        seats: branchData?.total_intake || prev.seats
      };
    });
    // Update URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('branch', newBranchName);
    window.history.replaceState({}, '', newUrl.toString());
  }, []);

  return {
    college,
    loading,
    error,
    saved,
    handleSaveCollege,
    handleShare,
    profile,
    collegeReviews,
    reviewsLoading,
    distance,
    isGettingLocation,
    locationError,
    handleGetLocation,
    quickStats,
    academicData,
    seatData,
    feeData,
    infrastructure,
    placementData,
    automationData,
    collegeInsights,
    isInsightsLoading,
    updateBranch
  };
}
