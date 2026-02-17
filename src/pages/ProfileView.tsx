import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import {
  ChevronLeft,
  User,
  Mail,
  Award,
  BookOpen,
  BarChart3,
  Star,
  Heart,
  School,
  MapPin,
  Settings,
  Calendar,
  CheckCircle,
  Edit,
  TrendingUp,
  Trophy,
  Target,
  Zap,
  Eye,
  Sparkles,
  Flame,
  Search,
  GraduationCap,
  Home,
  Bell,
  Copy,
  Check,
  Loader2,
  Compass,
  Phone,
  Brain,
  Activity,
  Gift,
  Medal,
  Cpu,
} from "lucide-react";
import axios from "axios";

// ==================== INTERFACES ====================

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
  home_university?: string;
  university_preference: string;
  address: string;
  receive_updates: boolean;
  profile_complete: boolean;
  created_at: string;
  updated_at: string;
  phone?: string;
  tenth_percentage?: number;
  twelfth_percentage?: number;
}

interface UserAnalytics {
  id: string;
  user_id: string;
  college_searches: number;
  favorites_added: number;
  comparisons_made: number;
  last_month_searches: number;
  last_month_favorites: number;
  last_month_comparisons: number;
  total_time_spent: number;
  average_session_duration: number;
  login_streak: number;
  last_login_date: string;
  profile_views: number;
  recommendation_clicks: number;
}

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_name: string;
  achievement_description: string;
  achievement_icon: string;
  unlocked_at: string;
  progress: number;
  is_unlocked: boolean;
}

interface CollegePrediction {
  college_code: string;
  college_name: string;
  branch: string;
  admission_chance: number;
  category: string;
  city: string;
  fees: number;
  placement_rate: number;
  average_package: number;
  cutoff_rank: number;
  match_score: number;
  fit: string;
  fit_reason: string;
  is_most_probable: boolean;
}

interface UserSkill {
  skill_name: string;
  proficiency_level: number;
}

interface UserActivity {
  activity_type: string;
  activity_data: any;
  created_at: string;
}

interface UserCareerGoal {
  career_title: string;
  target_salary: number;
  target_year: number;
}

interface UserScholarship {
  scholarship_name: string;
  estimated_amount: number;
  eligibility_score: number;
  application_status: string;
}

// ==================== NAVBAR COMPONENT ====================

const Navbar = ({
  activeTab,
  userProfile
}: {
  activeTab: string;
  userProfile: UserProfile | null;
}) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200'
        : 'bg-white border-b border-gray-200'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              EduPortal
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => navigate("/dashboard")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "dashboard"
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/profile-view")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "profile"
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              Profile
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {userProfile && (
              <div className="flex items-center space-x-3">
                <div className="hidden lg:block text-right">
                  <p className="text-sm font-semibold text-gray-900">{userProfile.name}</p>
                  <p className="text-xs text-gray-500">{userProfile.email}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// ==================== FOOTER COMPONENT ====================

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} EduPortal. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ==================== MAIN PROFILE VIEW COMPONENT ====================

export default function ProfileView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [predictions, setPredictions] = useState<CollegePrediction[]>([]);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [scholarships, setScholarships] = useState<UserScholarship[]>([]);
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  // ==================== FETCH ALL REAL DATA FROM SUPABASE ====================

  useEffect(() => {
    const fetchAllUserData = async () => {
      try {
        setLoading(true);

        // 1. Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          navigate("/login", { replace: true });
          return;
        }

        const userId = session.user.id;

        // 2. Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          navigate("/profile", { replace: true });
          return;
        }

        if (!profile.profile_complete) {
          navigate("/profile", { replace: true });
          return;
        }

        setUserProfile(profile);

        // 3. Fetch user analytics
        const { data: analyticsData, error: analyticsError } = await supabase
          .from('user_analytics')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!analyticsError && analyticsData) {
          setAnalytics(analyticsData);
        } else {
          // Create default analytics if not exists
          const { data: newAnalytics } = await supabase
            .from('user_analytics')
            .insert([{
              user_id: userId,
              college_searches: 0,
              favorites_added: 0,
              comparisons_made: 0,
              last_month_searches: 0,
              last_month_favorites: 0,
              last_month_comparisons: 0,
              total_time_spent: 0,
              average_session_duration: 0,
              login_streak: 1,
              last_login_date: new Date().toISOString(),
              profile_views: 0,
              recommendation_clicks: 0
            }])
            .select()
            .single();

          if (newAnalytics) setAnalytics(newAnalytics);
        }

        // 4. Fetch user achievements
        const { data: achievementsData } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', userId)
          .order('unlocked_at', { ascending: false });

        if (achievementsData) {
          setAchievements(achievementsData);
        }

        // 5. Fetch user skills
        const { data: skillsData } = await supabase
          .from('user_skills')
          .select('*')
          .eq('user_id', userId)
          .order('proficiency_level', { ascending: false });

        if (skillsData) {
          setSkills(skillsData);
        }

        // 6. Fetch user activities (last 10)
        const { data: activitiesData } = await supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (activitiesData) {
          setActivities(activitiesData);
        }

        // 7. Fetch career goals
        const { data: careerGoalsData } = await supabase
          .from('user_career_goals')
          .select('*')
          .eq('user_id', userId)
          .order('priority', { ascending: true });

        if (careerGoalsData) {
          setCareerGoals(careerGoalsData);
        }

        // 8. Fetch eligible scholarships
        const { data: scholarshipsData } = await supabase
          .from('user_scholarships')
          .select('*')
          .eq('user_id', userId)
          .order('eligibility_score', { ascending: false });

        if (scholarshipsData) {
          setScholarships(scholarshipsData);
        }

        // 9. Fetch college predictions from Flask API
        if (profile.preferred_branches && profile.preferred_branches.length > 0) {
          try {
            const requestData = {
              score: profile.exam_type === "CET"
                ? parseFloat(profile.cet_score || "0")
                : parseFloat(profile.diploma_score || "0"),
              rank: profile.exam_type === "CET"
                ? parseFloat(profile.cet_rank || "0")
                : parseFloat(profile.diploma_rank || "0"),
              category: profile.category,
              branches: profile.preferred_branches,
              limit: 10,
            };

            const response = await axios.post(
              "http://127.0.0.1:5001/predict_admission",
              requestData,
              {
                headers: { "Content-Type": "application/json" },
                timeout: 10000,
              }
            );

            if (response.data.colleges && response.data.colleges.length > 0) {
              setPredictions(response.data.colleges.slice(0, 6));
            }
          } catch (error) {
            console.error("Error fetching predictions:", error);
          }
        }

      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUserData();
  }, [navigate]);

  // ==================== HELPER FUNCTIONS ====================

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  const getProfileCompleteness = () => {
    if (!userProfile) return 0;

    let score = 0;
    let total = 0;

    const fields = [
      userProfile.name, userProfile.email, userProfile.category,
      userProfile.exam_type, userProfile.preferred_branches?.length > 0,
      userProfile.address, userProfile.state, userProfile.university_preference,
      userProfile.home_university
    ];

    fields.forEach(field => {
      total += 1;
      if (field) score += 1;
    });

    if (userProfile.exam_type === "CET") {
      if (userProfile.cet_rank) score += 1;
      if (userProfile.cet_score) score += 1;
      total += 2;
    } else {
      if (userProfile.diploma_rank) score += 1;
      if (userProfile.diploma_score) score += 1;
      total += 2;
    }

    if (userProfile.phone) score += 1;
    total += 1;

    if (userProfile.tenth_percentage) score += 1;
    total += 1;

    if (userProfile.twelfth_percentage) score += 1;
    total += 1;

    return Math.round((score / total) * 100);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'search': return Search;
      case 'favorite': return Heart;
      case 'compare': return BarChart3;
      case 'view': return Eye;
      case 'login': return User;
      case 'profile_update': return Edit;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'search': return 'text-blue-600 bg-blue-100';
      case 'favorite': return 'text-red-600 bg-red-100';
      case 'compare': return 'text-purple-600 bg-purple-100';
      case 'view': return 'text-green-600 bg-green-100';
      case 'login': return 'text-indigo-600 bg-indigo-100';
      case 'profile_update': return 'text-amber-600 bg-amber-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPredictionBadge = (chance: number, fit: string, isMostProbable: boolean) => {
    if (isMostProbable || chance >= 80) {
      return {
        label: 'Most Probable',
        color: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
        icon: Zap
      };
    }
    if (chance >= 70 || fit === 'Best Fit') {
      return {
        label: 'Best Fit',
        color: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white',
        icon: CheckCircle
      };
    }
    if (chance >= 50 || fit === 'Good Fit') {
      return {
        label: 'Good Fit',
        color: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white',
        icon: Target
      };
    }
    return {
      label: 'Stretch',
      color: 'bg-gradient-to-r from-orange-600 to-red-600 text-white',
      icon: TrendingUp
    };
  };

  const profileCompleteness = getProfileCompleteness();
  const memberSince = userProfile ? new Date(userProfile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  // ==================== LOADING STATE ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="relative mx-auto w-16 h-16 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-full">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Your Profile</h3>
          <p className="text-gray-600">Fetching your personalized data...</p>
        </div>
      </div>
    );
  }

  // ==================== NO PROFILE STATE ====================

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h4>
          <p className="text-gray-600 mb-6">Please complete your profile setup first.</p>
          <button
            onClick={() => navigate("/profile")}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
          >
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <Navbar activeTab="profile" userProfile={userProfile} />

      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {/* ==================== HEADER SECTION ==================== */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Profile Overview
                </h1>
                <p className="text-gray-600 mt-1 flex items-center">
                  <Sparkles className="w-4 h-4 text-indigo-600 mr-1" />
                  View and manage your complete profile information
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => copyToClipboard(window.location.href)}
                className="px-4 py-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center space-x-2 border border-gray-200"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Share</span>
                  </>
                )}
              </button>

              <button
                onClick={() => navigate("/profile")}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* ==================== PROFILE COMPLETION BAR ==================== */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                  {Math.round(profileCompleteness / 20) || 1}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Profile Completeness</h3>
                <p className="text-sm text-gray-600">
                  {profileCompleteness}% complete • {5 - Math.round(profileCompleteness / 20)} steps remaining
                </p>
              </div>
            </div>
            <div className="flex-1 max-w-md">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"
                  style={{ width: `${profileCompleteness}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Basic</span>
                <span>Academic</span>
                <span>Preferences</span>
                <span>Contact</span>
                <span>Complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== SECTION TABS ==================== */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'academics', label: 'Academics', icon: GraduationCap },
              { id: 'predictions', label: 'Predictions', icon: Brain },
              { id: 'skills', label: 'Skills', icon: Cpu },
              { id: 'achievements', label: 'Achievements', icon: Trophy },
              { id: 'activities', label: 'Activity', icon: Activity },
              { id: 'scholarships', label: 'Scholarships', icon: Gift },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeSection === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                <span className="flex items-center space-x-2">
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ==================== DYNAMIC CONTENT SECTIONS ==================== */}
        <AnimatePresence mode="wait">
          {/* ========== OVERVIEW SECTION ========== */}
          {activeSection === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Profile Summary Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white relative">
                  <div className="absolute top-4 right-4">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border-2 border-white/30">
                      <User className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{userProfile.name}</h2>
                      <p className="text-indigo-100 text-sm mb-2">{userProfile.email}</p>
                      <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-xs font-medium">Profile Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200/50">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="w-5 h-5 text-blue-600" />
                        <span className="text-xs text-blue-700 font-medium">Category</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{userProfile.category}</p>
                      <p className="text-xs text-gray-500 mt-1">Your reservation category</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200/50">
                      <div className="flex items-center space-x-2 mb-2">
                        <BookOpen className="w-5 h-5 text-green-600" />
                        <span className="text-xs text-green-700 font-medium">Exam Type</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{userProfile.exam_type}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {userProfile.exam_type === 'CET' ? 'Maharashtra CET' : 'Diploma Entry'}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200/50">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <span className="text-xs text-purple-700 font-medium">Member Since</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{memberSince}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.floor((new Date().getTime() - new Date(userProfile.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Searches</span>
                        <Search className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{analytics?.college_searches || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">This month</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Favorites</span>
                        <Heart className="w-4 h-4 text-red-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{analytics?.favorites_added || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">This month</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Comparisons</span>
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{analytics?.comparisons_made || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">This month</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Streak</span>
                        <Flame className="w-4 h-4 text-orange-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{analytics?.login_streak || 0} days</p>
                      <p className="text-xs text-gray-500 mt-1">Current streak</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences & Location */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Compass className="w-5 h-5 text-indigo-600 mr-2" />
                  Preferences & Location
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-5 rounded-xl border border-emerald-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="bg-emerald-500 p-2 rounded-lg">
                        <School className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-medium text-gray-900">University Preference</h4>
                    </div>
                    <p className="text-xl font-bold text-emerald-600">
                      {userProfile.university_preference || "Not specified"}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {userProfile.university_preference === "Government" ? "Lower fees, good reputation" :
                        userProfile.university_preference === "Private" ? "Modern facilities, higher fees" :
                          "Open to all options"}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-xl border border-orange-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="bg-orange-500 p-2 rounded-lg">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-medium text-gray-900">Preferred Location</h4>
                    </div>
                    <p className="text-xl font-bold text-orange-600">
                      {userProfile.state || "Not specified"}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {userProfile.state ? `${userProfile.state}, India` : "Update your location preference"}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="bg-indigo-500 p-2 rounded-lg">
                        <GraduationCap className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="font-medium text-gray-900">Home University</h4>
                    </div>
                    <p className="text-xl font-bold text-indigo-600">
                      {userProfile.home_university || "Not specified"}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Used for Home University (HU) vs OHU category matching
                    </p>
                  </div>
                </div>

                {userProfile.address && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Home className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Residential Address</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{userProfile.address}</p>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Mail className="w-5 h-5 text-indigo-600 mr-2" />
                  Contact Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Email Address</p>
                        <p className="font-medium text-gray-900">{userProfile.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(userProfile.email)}
                      className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {userProfile.phone && (
                    <div className="flex items-center justify-between p-3 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-emerald-600" />
                        <div>
                          <p className="text-sm text-gray-600">Phone Number</p>
                          <p className="font-medium text-gray-900">{userProfile.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5 text-indigo-600" />
                      <div>
                        <p className="text-sm text-gray-600">Email Notifications</p>
                        <p className="font-medium text-gray-900">
                          {userProfile.receive_updates ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${userProfile.receive_updates
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {userProfile.receive_updates ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========== ACADEMICS SECTION ========== */}
          {activeSection === 'academics' && (
            <motion.div
              key="academics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <GraduationCap className="w-5 h-5 text-indigo-600 mr-2" />
                  Academic Performance
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userProfile.exam_type === "CET" ? (
                    <>
                      <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <BarChart3 className="w-6 h-6 text-purple-600" />
                            <div>
                              <h4 className="font-semibold text-gray-900">CET Rank</h4>
                              <p className="text-xs text-gray-600">Your entrance rank</p>
                            </div>
                          </div>
                          <span className="text-2xl font-bold text-purple-600">{userProfile.cet_rank || 'N/A'}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          {userProfile.cet_rank && (
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-violet-600"
                              style={{ width: `${Math.max(0, 100 - (parseInt(userProfile.cet_rank) / 1500))}%` }}
                            ></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {userProfile.cet_rank ? `Ranked in top ${Math.round(parseInt(userProfile.cet_rank) / 150)}%` : 'Rank not available'}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Star className="w-6 h-6 text-pink-600" />
                            <div>
                              <h4 className="font-semibold text-gray-900">CET Score</h4>
                              <p className="text-xs text-gray-600">Your percentile</p>
                            </div>
                          </div>
                          <span className="text-2xl font-bold text-pink-600">{userProfile.cet_score || 'N/A'}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          {userProfile.cet_score && (
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-pink-600 to-rose-600"
                              style={{ width: `${userProfile.cet_score}%` }}
                            ></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {userProfile.cet_score ? `Above ${Math.round(100 - parseFloat(userProfile.cet_score))}% candidates` : 'Score not available'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <BarChart3 className="w-6 h-6 text-purple-600" />
                            <div>
                              <h4 className="font-semibold text-gray-900">Diploma Rank</h4>
                              <p className="text-xs text-gray-600">Your merit rank</p>
                            </div>
                          </div>
                          <span className="text-2xl font-bold text-purple-600">{userProfile.diploma_rank || 'N/A'}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Overall merit rank in diploma</p>
                      </div>

                      <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Star className="w-6 h-6 text-pink-600" />
                            <div>
                              <h4 className="font-semibold text-gray-900">Diploma Score</h4>
                              <p className="text-xs text-gray-600">Your percentage</p>
                            </div>
                          </div>
                          <span className="text-2xl font-bold text-pink-600">{userProfile.diploma_score || 'N/A'}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          {userProfile.diploma_score && (
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-pink-600 to-rose-600"
                              style={{ width: `${userProfile.diploma_score}%` }}
                            ></div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 10th & 12th Marks (if available) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {userProfile.tenth_percentage && (
                    <div className="bg-white p-5 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">10th Percentage</span>
                        <span className="text-lg font-bold text-gray-900">{userProfile.tenth_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600"
                          style={{ width: `${userProfile.tenth_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {userProfile.twelfth_percentage && (
                    <div className="bg-white p-5 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">12th Percentage</span>
                        <span className="text-lg font-bold text-gray-900">{userProfile.twelfth_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"
                          style={{ width: `${userProfile.twelfth_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preferred Branches */}
              {userProfile.preferred_branches && userProfile.preferred_branches.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Heart className="w-5 h-5 text-red-600 mr-2" />
                    Preferred Branches ({userProfile.preferred_branches.length})
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {userProfile.preferred_branches.map((branch, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-xl shadow-md"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                          <span className="font-medium text-sm">{branch}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Branch Distribution:</span> You've selected {userProfile.preferred_branches.length} branches
                    </p>
                    <div className="flex space-x-1 mt-3 h-2">
                      {userProfile.preferred_branches.map((_, index) => {
                        const colors = ['bg-indigo-600', 'bg-purple-600', 'bg-pink-600', 'bg-blue-600', 'bg-cyan-600'];
                        const colorIndex = index % colors.length;
                        return (
                          <div
                            key={index}
                            className={`${colors[colorIndex]} rounded-full`}
                            style={{ width: `${100 / userProfile.preferred_branches.length}%` }}
                          ></div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ========== PREDICTIONS SECTION ========== */}
          {activeSection === 'predictions' && (
            <motion.div
              key="predictions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Brain className="w-5 h-5 text-indigo-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">College Predictions</h3>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    Based on your rank & category
                  </span>
                </div>

                {predictions.length > 0 ? (
                  <div className="space-y-4">
                    {predictions.map((college, index) => {
                      const badge = getPredictionBadge(college.admission_chance, college.fit, college.is_most_probable);
                      const BadgeIcon = badge.icon;

                      return (
                        <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{college.college_name}</h4>
                                  <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                                    <span>{college.branch}</span>
                                    <span>•</span>
                                    <span>{college.city}</span>
                                    <span>•</span>
                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                      {college.category}
                                    </span>
                                  </div>
                                </div>
                                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 ${badge.color}`}>
                                  <BadgeIcon className="w-3 h-3" />
                                  <span>{badge.label}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div>
                                  <p className="text-xs text-gray-500">Admission Chance</p>
                                  <p className="text-lg font-bold text-gray-900">{Math.round(college.admission_chance)}%</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Cutoff Rank</p>
                                  <p className="text-lg font-bold text-gray-900">{college.cutoff_rank}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Annual Fees</p>
                                  <p className="text-lg font-bold text-gray-900">₹{(college.fees / 100000).toFixed(1)}L</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Placement Rate</p>
                                  <p className="text-lg font-bold text-gray-900">{college.placement_rate}%</p>
                                </div>
                              </div>

                              {college.fit_reason && (
                                <p className="text-xs text-gray-600 mt-3 bg-gray-50 p-2 rounded-lg">
                                  <span className="font-medium">Why:</span> {college.fit_reason}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {predictions.length >= 6 && (
                      <button className="w-full mt-2 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        View All {predictions.length} Predictions →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Predictions Yet</h4>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                      Complete your profile with preferred branches to get AI-powered college recommendations.
                    </p>
                    <button
                      onClick={() => navigate("/profile")}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
                    >
                      Update Preferences
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ========== SKILLS SECTION ========== */}
          {activeSection === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Cpu className="w-5 h-5 text-indigo-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Your Skills</h3>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {skills.length} skills
                  </span>
                </div>

                {skills.length > 0 ? (
                  <div className="space-y-4">
                    {skills.map((skill, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900">{skill.skill_name}</span>
                          <span className="text-sm font-bold text-indigo-600">{skill.proficiency_level}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"
                            style={{ width: `${skill.proficiency_level}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <Cpu className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Skills Added</h4>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Add your technical and soft skills to get personalized career recommendations.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ========== ACHIEVEMENTS SECTION ========== */}
          {activeSection === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Trophy className="w-5 h-5 text-yellow-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {achievements.filter(a => a.is_unlocked).length} unlocked
                  </span>
                </div>

                {achievements.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className={`relative p-4 rounded-xl border-2 text-center ${achievement.is_unlocked
                          ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
                          : 'bg-gray-50 border-gray-200 opacity-60'
                          }`}
                      >
                        <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                          {achievement.achievement_icon === 'zap' && <Zap className={`w-8 h-8 ${achievement.is_unlocked ? 'text-yellow-600' : 'text-gray-400'}`} />}
                          {achievement.achievement_icon === 'target' && <Target className={`w-8 h-8 ${achievement.is_unlocked ? 'text-blue-600' : 'text-gray-400'}`} />}
                          {achievement.achievement_icon === 'flame' && <Flame className={`w-8 h-8 ${achievement.is_unlocked ? 'text-orange-600' : 'text-gray-400'}`} />}
                          {achievement.achievement_icon === 'brain' && <Brain className={`w-8 h-8 ${achievement.is_unlocked ? 'text-purple-600' : 'text-gray-400'}`} />}
                          {achievement.achievement_icon === 'crown' && <Medal className={`w-8 h-8 ${achievement.is_unlocked ? 'text-amber-600' : 'text-gray-400'}`} />}
                          {achievement.achievement_icon === 'check' && <CheckCircle className={`w-8 h-8 ${achievement.is_unlocked ? 'text-green-600' : 'text-gray-400'}`} />}
                        </div>
                        <h4 className="font-medium text-gray-900 text-sm">{achievement.achievement_name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{achievement.achievement_description}</p>
                        {!achievement.is_unlocked && achievement.progress > 0 && (
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="h-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600"
                                style={{ width: `${achievement.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">{achievement.progress}%</span>
                          </div>
                        )}
                        {achievement.is_unlocked && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white border-2 border-white">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Achievements Yet</h4>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Complete your profile, search colleges, and save favorites to unlock achievements!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ========== ACTIVITIES SECTION ========== */}
          {activeSection === 'activities' && (
            <motion.div
              key="activities"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 text-indigo-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    Last 10 actions
                  </span>
                </div>

                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity, index) => {
                      const Icon = getActivityIcon(activity.activity_type);
                      const colorClass = getActivityColor(activity.activity_type);
                      const date = new Date(activity.created_at);
                      const timeAgo = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60));

                      let activityText = '';
                      if (activity.activity_type === 'search') {
                        activityText = `Searched for colleges`;
                        if (activity.activity_data?.query) activityText += `: "${activity.activity_data.query}"`;
                      } else if (activity.activity_type === 'favorite') {
                        activityText = `Added ${activity.activity_data?.college_name || 'college'} to favorites`;
                      } else if (activity.activity_type === 'compare') {
                        activityText = `Compared ${activity.activity_data?.count || 2} colleges`;
                      } else if (activity.activity_type === 'view') {
                        activityText = `Viewed ${activity.activity_data?.college_name || 'college'} details`;
                      } else if (activity.activity_type === 'login') {
                        activityText = `Logged into your account`;
                      } else if (activity.activity_type === 'profile_update') {
                        activityText = `Updated profile information`;
                      }

                      return (
                        <div key={index} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activityText}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {timeAgo < 1 ? 'Just now' : timeAgo < 24 ? `${timeAgo} hours ago` : date.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Activity Yet</h4>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Start searching for colleges and saving favorites to see your activity here.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ========== SCHOLARSHIPS SECTION ========== */}
          {activeSection === 'scholarships' && (
            <motion.div
              key="scholarships"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Gift className="w-5 h-5 text-emerald-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Eligible Scholarships</h3>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    {scholarships.length} available
                  </span>
                </div>

                {scholarships.length > 0 ? (
                  <div className="space-y-4">
                    {scholarships.map((scholarship, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900">{scholarship.scholarship_name}</h4>
                                <div className="flex items-center space-x-3 mt-1">
                                  <span className="text-sm text-gray-600">Est. Amount: ₹{scholarship.estimated_amount.toLocaleString()}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${scholarship.application_status === 'eligible' ? 'bg-green-100 text-green-800' :
                                    scholarship.application_status === 'applied' ? 'bg-blue-100 text-blue-800' :
                                      scholarship.application_status === 'awarded' ? 'bg-purple-100 text-purple-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                    {scholarship.application_status.charAt(0).toUpperCase() + scholarship.application_status.slice(1)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-600">Eligibility Score:</span>
                                <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="h-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-green-600"
                                    style={{ width: `${scholarship.eligibility_score}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-medium text-emerald-600">{scholarship.eligibility_score}%</span>
                              </div>
                            </div>
                          </div>

                          {scholarship.application_status === 'eligible' && (
                            <button className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg text-sm font-medium hover:from-emerald-700 hover:to-green-700 transition-all shadow-md">
                              Apply Now
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                    <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Scholarships Found</h4>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Scholarships matching your category and academic performance will appear here.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}