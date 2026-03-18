import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { normalizeCollegeData } from '../utils';
import type { College } from '../../../types/college';
import { useFavorites } from '../../../hooks/useFavorites';
import seatMatrixMap from '../../../assets/seat_matrix_map.json';
import { 
  Building, Calendar, GraduationCap, Users, 
  TrendingUp, DollarSign, Briefcase, Trophy, Home
} from 'lucide-react';

export function useCollegeDetails() {
  const location = useLocation();
  
  const getInitialCollege = useCallback((): any => {
    if (location.state?.college) return location.state.college;
    try {
      const savedCollege = localStorage.getItem('selectedCollege');
      if (savedCollege) return JSON.parse(savedCollege);
    } catch (e) { console.error(e); }
    return null;
  }, [location.state]);

  const [college, setCollege] = useState<College>(() => normalizeCollegeData(getInitialCollege()));
  const [loading, setLoading] = useState(!getInitialCollege() || !getInitialCollege()?.branches?.length);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [collegeReviews, setCollegeReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Fetch full college data if missing
  useEffect(() => {
    const fetchFullData = async () => {
      if (!college.college_code) return;
      if (college.branches && college.branches.length > 0) return; // Already have full data

      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('colleges_2025')
          .select('*')
          .eq('college_code', college.college_code)
          .limit(1)
          .single();

        if (fetchError) throw fetchError;
        if (data) {
          setCollege((prev: College) => normalizeCollegeData({ ...prev, ...data }));
        }
      } catch (err: any) {
        console.error("[useCollegeDetails] Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFullData();
  }, [college.college_code]);

  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = useMemo(() => 
    college.college_code && college.branch_name ? isFavorite(college.college_code, college.branch_name) : false,
    [college.college_code, college.branch_name, isFavorite]
  );

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
    automationData
  };
}
