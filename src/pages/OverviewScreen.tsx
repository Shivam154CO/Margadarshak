import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { supabase } from "../lib/supabase";
import {
  Search, Target, TrendingUp,
  Zap, GraduationCap,
  Heart, CheckCircle,
  Eye, BarChart,
  Map as MapIcon,
  User, X, Download,
  File, Sun, Moon,
  FileText,
  Sparkles,
  MessageSquare
} from "lucide-react";

// Shared Components
const CodeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

import { SimulatedAI } from "../components/SimulatedAI";
import { AgenticAssistant } from "../components/AgenticAssistant";


// Types
interface College {
  id: string;
  college_code: string;
  college_name: string;
  city: string;
  state: string;
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
  hostel_available: boolean;
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
  description: string;
  facilities: string[];
  courses_offered: string[];
  placement_companies: string[];
  rating: number;
  reviews_count: number;
  established_year: number;
  campus_size: number;
  faculty_count: number;
  student_count: number;
  library_books: number;
  sports_facilities: boolean;
  medical_facilities: boolean;
  transport_facilities: boolean;
  cafeteria_count: number;
  hostel_capacity: number;
  wifi_coverage: boolean;
  labs_count: number;
  research_centers: number;
  international_tieups: number;
  accreditation: string[];
  ranking_national: number;
  ranking_state: number;
  keywords: string[];
  tags: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  social_media: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    youtube: string;
  };
  admission_process: string[];
  important_dates: {
    event: string;
    date: string;
  }[];
  scholarship_details: string[];
  fee_structure: {
    year: number;
    tuition_fee: number;
    hostel_fee: number;
    other_charges: number;
    total: number;
  }[];
  placement_statistics: {
    year: number;
    average_package: number;
    highest_package: number;
    placement_rate: number;
    students_placed: number;
    total_students: number;
  }[];
  cutoff_trends: {
    year: number;
    rank: number;
    percentile: number;
    category: string;
  }[];
  faculty_details: {
    name: string;
    qualification: string;
    experience: number;
    specialization: string;
  }[];
  infrastructure_details: {
    facility: string;
    description: string;
    count: number;
  }[];
  created_at: string;
  updated_at: string;
  views_count: number;
  saves_count: number;
  compares_count: number;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  phone: string;
  state: string;
  category: string;
  exam_type: string;
  cet_rank: number;
  cet_percentile: number;
  cet_score: number;
  diploma_rank: number;
  diploma_percentile: number;
  diploma_score: number;
  preferred_branches: string[];
  home_university: string;
  university_preference: string[];
  address: string;
  receive_updates: boolean;
  profile_complete: boolean;
  preferences: {
    min_fees: number;
    max_fees: number;
    min_package: number;
    location_preference: string[];
    hostel_required: boolean;
    sports_facilities: boolean;
    library_required: boolean;
    research_focus: boolean;
    international_exposure: boolean;
  };
  activity: {
    last_login: string;
    searches_count: number;
    colleges_viewed: string[];
    colleges_saved: string[];
    comparisons_made: number;
  };
  created_at: string;
  updated_at: string;
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'danger';
  priority: number;
  data: any;
  timestamp: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
  action?: {
    label: string;
    path: string;
  };
}

interface FilterState {
  branches: string[];
  fees: { min: number; max: number };
  location: string[];
  placement: { min: number; max: number };
  admission_chance: { min: number; max: number };
  hostel_available: boolean | null;
  autonomy_status: string[];
  rating: number;
  category: string[];
}

interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
}

interface DashboardStats {
  total_colleges: number;
  total_branches: number;
  average_admission_chance: number;
  average_fees: number;
  average_package: number;
  most_probable_count: number;
  best_fit_count: number;
  good_fit_count: number;
  stretch_count: number;
  saved_count: number;
  viewed_count: number;
  comparison_count: number;
  trending_count: number;
  ai_insights_count: number;
}

interface ExportFormat {
  id: string;
  name: string;
  format: 'csv' | 'json' | 'pdf' | 'excel';
  icon: any;
  description: string;
}

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  stats: string;
  link: string;
}

export default function OverviewScreen() {
  const navigate = useNavigate();

  // State Management
  const [scrollProgress, setScrollProgress] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [compareItems, setCompareItems] = useState<{ college_id: string; branch: string; college_name: string }[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [_searchHistory, setSearchHistory] = useState<any[]>([]);

  // Dashboard States
  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<College[]>([]);
  const [savedColleges, setSavedColleges] = useState<Set<string>>(new Set());
  const [viewedColleges, setViewedColleges] = useState<Set<string>>(new Set());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [spotlightCollege, setSpotlightCollege] = useState<College | null>(null);

  // AI and Data States
  const [trendingColleges, setTrendingColleges] = useState<College[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    total_colleges: 0,
    total_branches: 0,
    average_admission_chance: 0,
    average_fees: 0,
    average_package: 0,
    most_probable_count: 0,
    best_fit_count: 0,
    good_fit_count: 0,
    stretch_count: 0,
    saved_count: 0,
    viewed_count: 0,
    comparison_count: 0,
    trending_count: 0,
    ai_insights_count: 0
  });

  const [isOracleSimulating, setIsOracleSimulating] = useState(true);

  const oracleSimulationSteps = [
    "Initializing Neural Engine...",
    "Scanning 340+ Colleges...",
    "Analyzing Category Ranks...",
    "Calculating ROI Trajectory...",
    "Finalizing Master Match..."
  ];

  // Filter State
  const [_filters, setFilters] = useState<FilterState>({
    branches: [],
    fees: { min: 0, max: 5000000 },
    location: [],
    placement: { min: 0, max: 100 },
    admission_chance: { min: 0, max: 100 },
    hostel_available: null,
    autonomy_status: [],
    rating: 0,
    category: []
  });

  // Refs
  const notificationRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    initializeDashboard();

    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ==================== DATA FETCHING FUNCTIONS ====================
  const initializeDashboard = async () => {
    try {
      setIsLoading(true);

      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Fetch user profile
      await fetchUserProfile(session.user.id);

      // Fetch all dashboard data
      await fetchAllDashboardData(session.user.id);

    } catch (error) {
      console.error("Error initializing dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        // Create default user profile
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: (await supabase.auth.getSession()).data.session?.user.email,
            name: "New User",
            profile_complete: false,
            preferences: {
              min_fees: 0,
              max_fees: 5000000,
              min_package: 0,
              location_preference: [],
              hostel_required: true,
              sports_facilities: false,
              library_required: true,
              research_focus: false,
              international_exposure: false
            },
            activity: {
              last_login: new Date().toISOString(),
              searches_count: 0,
              colleges_viewed: [],
              colleges_saved: [],
              comparisons_made: 0
            }
          })
          .select()
          .single();

        if (createError) throw createError;
        setUserProfile(newProfile);
      } else {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchAllDashboardData = async (userId: string) => {
    try {
      // Fetch colleges with user-specific predictions
      const { data: collegesData, error: collegesError } = await supabase
        .from('colleges_2025')
        .select('*');

      if (collegesError) throw collegesError;

      if (collegesData && collegesData.length > 0) {
        // Calculate admission chances based on user profile
        const collegesWithPredictions = await calculateAdmissionChances(collegesData, userId);
        setColleges(collegesWithPredictions);
        setFilteredColleges(collegesWithPredictions);

        // Pick dynamic spotlight college
        const highMatchColleges = collegesWithPredictions.filter(c => c.admission_chance >= 70);
        if (highMatchColleges.length > 0) {
          const randomIndex = Math.floor(Math.random() * highMatchColleges.length);
          setSpotlightCollege(highMatchColleges[randomIndex]);
        } else if (collegesWithPredictions.length > 0) {
          setSpotlightCollege(collegesWithPredictions[0]);
        }

        // Extract unique branches and locations
        const branches = [...new Set(collegesWithPredictions.map(c => c.branch))].sort();
        const locations = [...new Set(collegesWithPredictions.map(c => `${c.city}, ${c.state}`))].sort();
        setAvailableBranches(branches);
        setAvailableLocations(locations);

        // Calculate statistics
        _calculateStats(collegesWithPredictions);

        // Fetch trending colleges (most viewed)
        await fetchTrendingColleges();

        // Fetch user-specific data
        await Promise.all([
          fetchUserSavedColleges(userId),
          fetchUserViewedColleges(userId),
          fetchUserCompareItems(userId),
          fetchUserSearchHistory(userId),
          fetchNotifications(userId),
          generateAIInsights(userId, collegesWithPredictions)
        ]);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const calculateAdmissionChances = async (collegesData: College[], userId: string): Promise<College[]> => {
    try {
      // Get user's profile and scores
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('cet_score, diploma_score, cet_rank, diploma_rank, category, preferred_branches')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        console.warn("User data not found for predictions, using base data.");
        return collegesData;
      }

      // Preparation of ML request
      const score = userData.cet_score || userData.diploma_score || 0;
      const rank = userData.cet_rank || userData.diploma_rank || 0;
      const category = userData.category || "OPEN";
      const branches = userData.preferred_branches || [];

      if (!branches || branches.length === 0) {
        console.warn("No branches selected for predictions.");
        return collegesData;
      }

      console.log("📡 Calling ML API for real-time predictions...");
      const response = await axios.post("http://localhost:5001/predict_admission", {
        score: parseFloat(score.toString()),
        rank: parseInt(rank.toString()),
        category: category,
        branches: branches
      }, {
        headers: { "Content-Type": "application/json" },
        timeout: 30000
      });

      if (response.data && response.data.colleges) {
        const mlColleges = response.data.colleges;
        console.log(`✅ Received ${mlColleges.length} real predictions from ML Engine.`);

        // Create a map for fast lookup by code and branch
        const mlMap = new Map();
        mlColleges.forEach((c: any) => {
          const key = `${c.college_code.toLowerCase()}_${c.branch.toLowerCase()}`;
          mlMap.set(key, c);
        });

        // Merge ML predictions into the local colleges list
        return collegesData.map(college => {
          const mlMatch = mlMap.get(`${college.college_code.toLowerCase()}_${college.branch.toLowerCase()}`);

          if (mlMatch) {
            return {
              ...college,
              admission_chance: mlMatch.admission_chance,
              admission_chance_percentage: `${Math.round(mlMatch.admission_chance)}%`,
              fit: mlMatch.fit,
              probability_level: mlMatch.probability_level,
              is_most_probable: mlMatch.is_most_probable,
              fit_reason: mlMatch.fit_reason,
              match_score: mlMatch.match_score
            };
          }

          // If not in ML results (e.g. didn't match filters), provide a "Stretch" fallback
          return {
            ...college,
            admission_chance: 30,
            admission_chance_percentage: "30%",
            fit: "Stretch",
            probability_level: "Stretch",
            is_most_probable: false,
            fit_reason: "Outside your score-rank trajectory."
          };
        });
      }

      return collegesData;
    } catch (error) {
      console.error("❌ ML API Connection Error:", error);
      // Fallback to local simplified logic if API is down
      return collegesData.map(college => ({
        ...college,
        admission_chance: 50,
        admission_chance_percentage: "50%",
        fit: "Stretch",
        probability_level: "Stretch",
        is_most_probable: false,
        fit_reason: "Neural Link Offline. Using local estimate."
      }));
    }
  };


  const fetchTrendingColleges = async () => {
    try {
      const { data: trending, error } = await supabase
        .from('colleges')
        .select('*')
        .order('views_count', { ascending: false })
        .limit(6);

      if (error) throw error;
      if (trending) {
        setTrendingColleges(trending);
      }
    } catch (error) {
      console.error("Error fetching trending colleges:", error);
    }
  };

  const fetchUserSavedColleges = async (userId: string) => {
    try {
      const { data: saved, error } = await supabase
        .from('user_saved_colleges')
        .select('college_id, branch')
        .eq('user_id', userId);

      if (error) throw error;
      if (saved) {
        const savedSet = new Set(saved.map(item => `${item.college_id}_${item.branch}`));
        setSavedColleges(savedSet);
      }
    } catch (error) {
      console.error("Error fetching saved colleges:", error);
    }
  };

  const fetchUserViewedColleges = async (userId: string) => {
    try {
      const { data: viewed, error } = await supabase
        .from('user_college_views')
        .select('college_id')
        .eq('user_id', userId);

      if (error) throw error;
      if (viewed) {
        const viewedSet = new Set(viewed.map(item => item.college_id));
        setViewedColleges(viewedSet);
      }
    } catch (error) {
      console.error("Error fetching viewed colleges:", error);
    }
  };

  const fetchUserCompareItems = async (userId: string) => {
    try {
      const { data: compare, error } = await supabase
        .from('user_compare_items')
        .select('college_id, branch, college_name')
        .eq('user_id', userId)
        .limit(4);

      if (error) throw error;
      if (compare) {
        setCompareItems(compare);
      }
    } catch (error) {
      console.error("Error fetching compare items:", error);
    }
  };

  const fetchUserSearchHistory = async (userId: string) => {
    try {
      const { data: searches, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      if (searches) {
        setSearchHistory(searches);
        setRecentSearches(searches.map(s => s.query));
      }
    } catch (error) {
      console.error("Error fetching search history:", error);
    }
  };

  const fetchNotifications = async (userId: string) => {
    try {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      if (notifications) {
        setNotifications(notifications);
        const unread = notifications.filter(n => !n.read).length;
        setUnreadNotifications(unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const generateAIInsights = async (_userId: string, colleges: College[]) => {
    try {
      const insights: AIInsight[] = [];
      const topMatches = colleges.filter(c => c.admission_chance >= 80).slice(0, 3);

      if (topMatches.length > 0) {
        insights.push({
          id: "1",
          title: "Top Matches Found",
          description: `Found ${topMatches.length} colleges with high admission chance (80%+)`,
          type: 'success',
          priority: 1,
          data: { colleges: topMatches.map(c => c.college_name) },
          timestamp: new Date().toISOString()
        });
      }

      setAiInsights(insights);
    } catch (error) {
      console.error("Error generating AI insights:", error);
    }
  };

  const _calculateStats = (collegesData: College[]) => {
    const total = collegesData.length;
    const branches = new Set(collegesData.map(c => c.branch)).size;
    const avgChance = collegesData.reduce((sum, c) => sum + (c.admission_chance || 0), 0) / total;
    const avgFees = collegesData.reduce((sum, c) => sum + (c.fees || 0), 0) / total;
    const avgPackage = collegesData.reduce((sum, c) => sum + (c.average_package_lpa || 0), 0) / total;

    setStats({
      total_colleges: total,
      total_branches: branches,
      average_admission_chance: Math.round(avgChance),
      average_fees: Math.round(avgFees),
      average_package: Math.round(avgPackage * 10) / 10,
      most_probable_count: collegesData.filter(c => c.probability_level === "Most Probable").length,
      best_fit_count: collegesData.filter(c => c.fit === "Best Fit").length,
      good_fit_count: collegesData.filter(c => c.fit === "Good Fit").length,
      stretch_count: collegesData.filter(c => c.fit === "Stretch").length,
      saved_count: savedColleges.size,
      viewed_count: viewedColleges.size,
      comparison_count: compareItems.length,
      trending_count: trendingColleges.length,
      ai_insights_count: aiInsights.length
    });
  };

  // ==================== USER INTERACTIONS ====================
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setFilteredColleges(colleges);
      return;
    }

    try {
      const filtered = colleges.filter(college =>
        college.college_name.toLowerCase().includes(query.toLowerCase()) ||
        college.city.toLowerCase().includes(query.toLowerCase()) ||
        college.branch.toLowerCase().includes(query.toLowerCase()) ||
        college.state.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredColleges(filtered);
    } catch (error) {
      console.error("Error searching colleges:", error);
    }
  };

  const handleSaveCollege = async (collegeId: string, branch: string, collegeName: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const key = `${collegeId}_${branch}`;
      if (savedColleges.has(key)) {
        await supabase.from('user_saved_colleges').delete().match({ user_id: session.user.id, college_id: collegeId, branch: branch });
        savedColleges.delete(key);
      } else {
        await supabase.from('user_saved_colleges').insert({ user_id: session.user.id, college_id: collegeId, branch: branch, college_name: collegeName, saved_at: new Date().toISOString() });
        savedColleges.add(key);
      }
      setSavedColleges(new Set(savedColleges));
    } catch (error) {
      console.error("Error saving college:", error);
    }
  };

  const exportData = async (format: string) => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setShowExportMenu(false);
      alert(`Exporting as ${format}...`);
    }, 1000);
  };

  const getAdmissionInfo = useCallback((college: College) => {
    const fitCategory = college.probability_level || college.fit;
    if (college.is_most_probable || fitCategory === "Most Probable") {
      return {
        percentage: college.admission_chance_percentage || "95%",
        color: "text-purple-700",
        bgColor: "bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200",
        label: "🎯 Most Probable",
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
          bgColor: "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200",
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
          bgColor: "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200",
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
          bgColor: "bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200",
          label: "Stretch",
          gradient: "from-orange-500 via-amber-500 to-red-500",
          icon: <TrendingUp className="w-4 h-4" />,
          badgeColor: "bg-gradient-to-r from-orange-500 to-red-600",
          glow: "shadow-lg shadow-orange-500/20",
          order: 4,
        };
      default:
        return {
          percentage: college.admission_chance_percentage || "25%",
          color: "text-gray-700",
          bgColor: "bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200",
          label: "Unknown",
          gradient: "from-gray-500 to-gray-600",
          icon: <Eye className="w-4 h-4" />,
          badgeColor: "bg-gradient-to-r from-gray-500 to-gray-600",
          glow: "",
          order: 6,
        };
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...colleges];
    if (searchQuery) {
      filtered = filtered.filter(college =>
        college.college_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        college.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        college.branch.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedBranch !== "all") {
      filtered = filtered.filter(college => college.branch === selectedBranch);
    }
    if (activeFilter === "most-probable") {
      filtered = filtered.filter(college => college.is_most_probable || college.probability_level === "Most Probable");
    } else if (activeFilter === "saved") {
      filtered = filtered.filter(college => savedColleges.has(`${college.id}_${college.branch}`));
    }
    setFilteredColleges(filtered);
  }, [colleges, searchQuery, selectedBranch, activeFilter, savedColleges]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Neural Dashboard...</p>
        </div>
      </div>
    );
  }

  const exportFormats: ExportFormat[] = [
    { id: 'csv', name: 'CSV', format: 'csv', icon: FileText, description: 'Spreadsheet format' },
    { id: 'json', name: 'JSON', format: 'json', icon: CodeIcon, description: 'Structured data format' },
    { id: 'pdf', name: 'PDF Report', format: 'pdf', icon: File, description: 'Printable report' },
    { id: 'excel', name: 'Excel', format: 'excel', icon: BarChart, description: 'Excel compatible' }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50/30'}`}>
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-[100] dark:bg-gray-800">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${scrollProgress}%` }}
        />
      </div>

      <nav className={`backdrop-blur-2xl border-b sticky top-0 z-50 transition-all duration-500 ${darkMode ? 'bg-gray-900/60 border-white/5' : 'bg-white/40 border-white/20'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/")}>
                <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 rounded-[18px] flex items-center justify-center shadow-xl shadow-indigo-500/20">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">SCF</h1>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">Predictor</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 opacity-50 hover:opacity-100 transition-opacity">
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate("/profile")}>
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
                  {userProfile?.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="space-y-40 pb-40 pt-20">
        {/* Section 1: THE ORACLE */}
        <section id="oracle-section" className="relative px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {isOracleSimulating ? (
                <motion.div
                  key="simulating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`rounded-[60px] p-20 border flex flex-col items-center justify-center ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-2xl'}`}
                >
                  <SimulatedAI
                    steps={oracleSimulationSteps}
                    onComplete={() => setIsOracleSimulating(false)}
                  />
                  <p className="mt-8 text-[10px] font-black uppercase tracking-[0.5em] opacity-30 animate-pulse">Neural Matrix Synchronization</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
                >
                  <div className="lg:col-span-12 mb-12">
                    <h2 className={`text-6xl md:text-8xl font-black tracking-tighter leading-none ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Found Your <br />
                      <span className="italic text-indigo-600 underline decoration-indigo-500/30">Master Match.</span>
                    </h2>
                  </div>
                  {(() => {
                    const pick = spotlightCollege || colleges.find(c => c.is_most_probable) || colleges[0];
                    if (!pick) return null;
                    return (
                      <div className="lg:col-span-12 xl:col-span-7">
                        <div className={`rounded-[60px] p-12 border transition-all duration-1000 ${darkMode ? 'bg-gradient-to-br from-indigo-900/60 to-purple-900/40 border-white/10' : 'bg-gradient-to-br from-white to-indigo-50/50 border-indigo-100 shadow-3xl'}`}>
                          <div className="flex items-center space-x-4 mb-8">
                            <div className="w-14 h-14 rounded-[20px] bg-indigo-600 flex items-center justify-center text-white font-black text-2xl uppercase">{pick.college_name.charAt(0)}</div>
                            <div className="text-xl font-black tracking-tight">{pick.college_name}</div>
                          </div>
                          <div className={`p-8 rounded-[40px] mb-10 border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-indigo-50/50 border-indigo-100'}`}>
                            <p className="text-sm font-medium leading-relaxed opacity-70 italic">"{pick.fit_reason}. Identified as your strongest trajectory."</p>
                          </div>
                          <button onClick={() => navigate(`/college/${pick.id}`)} className="px-10 py-5 rounded-[25px] bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all">Claim Seat →</button>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Section 2: THE CLASH */}
        <section id="the-clash" className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className={`text-5xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'}`}>The Clash</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-purple-600 mt-4 opacity-60">Auto-Benchmarking Live</p>
            </div>
            <div className={`rounded-[50px] p-12 border overflow-hidden ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-3xl'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="pb-8 text-[10px] font-black uppercase tracking-widest opacity-30">Metric Cluster</th>
                      {(() => {
                        const probable = colleges.filter(c => c.is_most_probable || c.admission_chance > 90);
                        const compareColleges = (probable.length > 0 ? probable : colleges.slice(0, 3)).slice(0, 3);
                        return compareColleges.map((c) => (
                          <th key={c.id} className="pb-8 px-6 text-sm font-black">{c.college_name}</th>
                        ));
                      })()}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { label: "Admission Chance", key: "admission_chance", suffix: "%", color: "text-emerald-500" },
                      { label: "Avg Package", key: "average_package_lpa", suffix: " LPA", color: "text-indigo-400" },
                      { label: "Placement Rate", key: "placement_rate", suffix: "%", color: "text-indigo-400" },
                      { label: "Fees", key: "fees", prefix: "₹", formatter: (v: number) => (v / 100000).toFixed(1) + "L" },
                    ].map((metric) => (
                      <tr key={metric.label} className="group/row hover:bg-white/5">
                        <td className="py-8 text-[10px] font-black uppercase tracking-widest opacity-40">{metric.label}</td>
                        {(() => {
                          const probable = colleges.filter(c => c.is_most_probable || c.admission_chance > 90);
                          const compareColleges = (probable.length > 0 ? probable : colleges.slice(0, 3)).slice(0, 3);
                          return compareColleges.map((c: any) => (
                            <td key={c.id} className="py-8 px-6 text-lg font-black text-indigo-500">
                              {metric.prefix}{metric.formatter ? metric.formatter(c[metric.key]) : c[metric.key]}{metric.suffix}
                            </td>
                          ));
                        })()}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: CITY POWER HUBS */}
        <section id="city-hubs" className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className={`text-6xl font-black tracking-tighter mb-16 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Power Hubs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {['Mumbai', 'Pune', 'Nagpur', 'Nashik'].map((cityName) => (
                <div key={cityName} className={`rounded-[60px] p-10 border flex flex-col justify-between h-[400px] ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-2xl'}`}>
                  <div>
                    <div className="text-4xl font-black mb-1">{cityName}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-40 text-indigo-500">Regional Power Grid</div>
                  </div>
                  <button onClick={() => { setFilters(prev => ({ ...prev, location: [cityName] })); window.scrollTo({ top: document.getElementById('discovery-hub')?.offsetTop, behavior: 'smooth' }); }} className="w-full py-5 rounded-[25px] bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest">Enter Hub →</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Layer 4: THE COMMONS - Tri-Layer Match Hub */}
        <section id="discovery-hub" className="relative py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-32 relative z-10">
              {[
                { title: "Best of Good", description: "Platinum tier opportunities with 95%+ probability.", colleges: filteredColleges.filter(c => c.admission_chance > 90 && c.placement_rate > 90).slice(0, 4), accent: "from-emerald-500 to-teal-600", icon: Sparkles },
                { title: "Best Probable", description: "Balanced targets for high probability ROI.", colleges: filteredColleges.filter(c => c.admission_chance >= 70 && c.admission_chance <= 90).slice(0, 4), accent: "from-indigo-500 to-purple-600", icon: Target },
                { title: "Perfect Fit", description: "Aligned with your geography and preferences.", colleges: filteredColleges.filter(c => c.city === userProfile?.city || c.autonomy_status === 'Autonomous').slice(0, 4), accent: "from-pink-500 to-rose-600", icon: Heart }
              ].map((category, idx) => (
                <div key={category.title}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
                    <div className="max-w-xl">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${category.accent} flex items-center justify-center shadow-lg`}><category.icon className="w-4 h-4 text-white" /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Category 0{idx + 1}</span>
                      </div>
                      <h3 className={`text-4xl font-black tracking-tighter mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{category.title}</h3>
                      <p className="text-lg font-medium opacity-50">{category.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {category.colleges.map((college) => (
                      <motion.div key={college.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className={`rounded-[40px] border p-8 h-[400px] flex flex-col justify-between ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'}`}>
                        <div>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black bg-gradient-to-br ${category.accent} mb-6`}>{college.college_name.charAt(0)}</div>
                          <h4 className="text-xl font-black mb-2 line-clamp-2">{college.college_name}</h4>
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6">{college.branch}</div>
                          <div className="text-emerald-500 font-black text-sm">{college.admission_chance}% Chance</div>
                        </div>
                        <button onClick={() => navigate(`/college/${college.id}`)} className="w-full py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest">Enter Campus</button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Export Data", desc: "PDF/CSV Neural Dump", icon: Download, action: () => setShowExportMenu(true) },
                { title: "Network Chat", desc: "Live Student Feed", icon: MessageSquare, action: () => { } },
                { title: "Trend Pulse", desc: "Cutoff Volatility", icon: TrendingUp, action: () => { } },
                { title: "Logistics", desc: "Commute Mapping", icon: MapIcon, action: () => navigate("/college-map") }
              ].map(tool => (
                <button key={tool.title} onClick={tool.action} className={`p-10 rounded-[40px] border text-left flex flex-col items-start ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5 shadow-xl'}`}>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 flex items-center justify-center mb-6"><tool.icon className="w-5 h-5 text-indigo-600" /></div>
                  <h4 className="text-lg font-black mb-2">{tool.title}</h4>
                  <p className="text-xs font-medium opacity-50">{tool.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showSearchModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
            <div className={`w-full max-w-2xl rounded-3xl p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-40" />
                <input autoFocus type="text" placeholder="Search..." className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <button onClick={() => setShowSearchModal(false)} className="absolute right-4 top-1/2 transform -translate-y-1/2"><X className="w-5 h-5" /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AgenticAssistant darkMode={darkMode} userProfile={userProfile} colleges={colleges} />
    </div>
  );
}
