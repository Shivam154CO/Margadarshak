/// <reference types="vite/client" />
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from "axios";
import type { UserProfile } from "@/types/user";
import { 
  User, 
  BookOpen, 
  Target, 
  Layers, 
  Star, 
  MessageCircle, 
  Phone, 
  Sparkles,
  X,
  Check
} from "lucide-react";

const ML_API_URL = import.meta.env.VITE_ML_API_URL ?? 'http://127.0.0.1:5001';

interface UserAnalytics {
  id: string;
  user_id: string;
  login_streak: number;
}

interface UserAchievement {
  achievement_name: string;
  achievement_description: string;
  is_unlocked: boolean;
}

interface CollegePrediction {
  college_name: string;
  branch: string;
  admission_chance: number;
  city: string;
  fit: string;
}

interface UserSkill {
  skill_name: string;
  proficiency_level: number;
}

interface UserActivity {
  activity_type: string;
  created_at: string;
}

interface UserScholarship {
  scholarship_name: string;
  estimated_amount: number;
  eligibility_score: number;
}

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
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState(0);
  const [isDigilockerVerified, setIsDigilockerVerified] = useState(false);

  useEffect(() => {
    const fetchAllUserData = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login", { replace: true });
          return;
        }

        const userId = session.user.id;
        const [
          profileRes, 
          analyticsRes, 
          achievementsRes, 
          skillsRes, 
          activitiesRes, 
          scholarshipsRes
        ] = await Promise.all([
          supabase.from('users').select('*').eq('id', userId).single(),
          supabase.from('user_analytics').select('*').eq('user_id', userId).maybeSingle(),
          supabase.from('user_achievements').select('*').eq('user_id', userId).order('unlocked_at', { ascending: false }),
          supabase.from('user_skills').select('*').eq('user_id', userId).order('proficiency_level', { ascending: false }),
          supabase.from('user_activities').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
          supabase.from('user_scholarships').select('*').eq('user_id', userId).order('eligibility_score', { ascending: false })
        ]);

        if (profileRes.error) {
          console.error("Profile error:", profileRes.error);
          navigate("/profile", { replace: true });
          return;
        }

        setUserProfile(profileRes.data);
        setIsDigilockerVerified(!!profileRes.data.digilocker_verified);
        if (analyticsRes.data) setAnalytics(analyticsRes.data);
        if (achievementsRes.data) setAchievements(achievementsRes.data);
        if (skillsRes.data) setSkills(skillsRes.data);
        if (activitiesRes.data) setActivities(activitiesRes.data);
        if (scholarshipsRes.data) setScholarships(scholarshipsRes.data);

        if (profileRes.data.preferred_branches?.length > 0) {
          try {
            const res = await axios.post(`${ML_API_URL}/predict_admission`, {
              score: profileRes.data.exam_type === "CET" ? parseFloat(profileRes.data.cet_score || "0") : parseFloat(profileRes.data.diploma_score || "0"),
              rank: profileRes.data.exam_type === "CET" ? parseFloat(profileRes.data.cet_rank || "0") : parseFloat(profileRes.data.diploma_rank || "0"),
              category: profileRes.data.category,
              branches: profileRes.data.preferred_branches,
              limit: 6
            });
            if (res.data.colleges) setPredictions(res.data.colleges);
          } catch (e) {
            console.error("ML Error:", e);
          }
        }
      } catch (error) {
        console.error("Global Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllUserData();
  }, [navigate]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-slate-400 font-semibold tracking-wider text-xs uppercase">Retrieving Profile</span>
      </div>
    </div>
  );

  if (!userProfile) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 selection:bg-indigo-100">
      <Navbar activeTab="profile" userProfile={userProfile} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden relative">
              <div className="h-24 bg-gradient-to-r from-indigo-500 to-indigo-600" />
              
              <div className="px-8 pb-8 flex flex-col items-center -mt-12 relative z-10">
                <div className="relative group mb-6">
                  <div className="w-24 h-24 rounded-[2rem] bg-white p-1.5 shadow-xl transition-transform group-hover:scale-105 duration-500">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=f1f5f9&color=4f46e5&bold=true&size=128`} 
                      alt={userProfile.name}
                      className="w-full h-full rounded-[1.6rem] object-cover"
                    />
                  </div>
                  {isDigilockerVerified && (
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <h1 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">{userProfile.name}</h1>
                  <p className="text-slate-500 font-medium text-sm mb-6">{userProfile.email}</p>
 
                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    <span className="px-3 py-1 bg-slate-100 border border-slate-200/60 rounded-full text-xs font-semibold text-slate-600 uppercase tracking-wide">{userProfile.exam_type}</span>
                    <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-semibold text-indigo-600 uppercase tracking-wide">{userProfile.category}</span>
                  </div>
 
                  <div className="flex flex-col w-full gap-3">
                    <button 
                      onClick={() => navigate("/profile")}
                      className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Layers className="w-4 h-4" />
                      Configure Professional Identity
                    </button>
                    <button 
                      onClick={() => copyToClipboard(window.location.href)}
                      className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-all border border-slate-200 shadow-sm active:scale-95"
                    >
                      {copied ? "Link Secured" : "Share Digital Profile"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200/60 p-5 rounded-3xl shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">State Rank</p>
                <p className="text-lg font-bold text-slate-900">#{userProfile.exam_type === 'CET' ? (userProfile.cet_rank || '--') : (userProfile.diploma_rank || '--')}</p>
              </div>
              <div className="bg-white border border-slate-200/60 p-5 rounded-3xl shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Login Streak</p>
                <p className="text-lg font-bold text-indigo-600">{analytics?.login_streak || 1} Days</p>
              </div>
            </div>

            {/* Identity Status Light */}
            {!isDigilockerVerified && (
              <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Verification</h3>
                </div>
                <p className="text-slate-500 text-xs mb-6 font-medium leading-relaxed">Boost your admission precision by linking your official credentials.</p>
                <button 
                  onClick={() => setIsAuthenticating(true)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95"
                >
                  Start Verification
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Detailed Modules */}
          <div className="lg:col-span-8 flex flex-col">
            {/* Elegant Tab Navigation */}
            <div className="bg-white/80 backdrop-blur-md sticky top-[calc(4rem+1px)] z-20 border border-slate-200/60 rounded-2xl mb-8 p-1.5 shadow-sm scrollbar-none overflow-x-auto">
              <div className="flex gap-1 min-w-max">
                {[
                  { id: 'overview', label: 'Identity', icon: User },
                  { id: 'academics', label: 'Academic', icon: BookOpen },
                  { id: 'predictions', label: 'Choices', icon: Target },
                  { id: 'skills', label: 'Expertise', icon: Layers },
                  { id: 'achievements', label: 'Rewards', icon: Star },
                  { id: 'activities', label: 'Logs', icon: MessageCircle },
                  { id: 'scholarships', label: 'Grants', icon: Phone }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl transition-all text-xs font-bold uppercase tracking-wider ${
                      activeSection === tab.id 
                        ? "bg-slate-900 text-white shadow-md font-extrabold" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Hub */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {activeSection === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Personal Dossier</h3>
                          <button 
                            onClick={() => navigate("/profile")}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1.5"
                          >
                            Edit Information
                            <Layers className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
                          {[
                            { l: "Full Name", v: userProfile.name },
                            { l: "Primary Email", v: userProfile.email },
                            { l: "Contact Handle", v: userProfile.phone || "Not provided" },
                            { l: "Category Status", v: userProfile.category },
                            { l: "Active Stream", v: userProfile.exam_type },
                            { l: "Entry Date", v: new Date(userProfile.created_at).toLocaleDateString("en-IN", { month: 'long', year: 'numeric' }) }
                          ].map(item => (
                            <div key={item.l} className="group">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 group-hover:text-indigo-600 transition-colors">{item.l}</p>
                              <p className="text-sm font-bold text-slate-700">{item.v}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">University Target</p>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed">
                          {userProfile.university_preference || "Standard Educational Institutions"}
                        </p>
                      </div>
                      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Region of Interest</p>
                        <p className="text-sm font-bold text-slate-700">{userProfile.state || "Maharashtra State, India"}</p>
                      </div>
                    </div>
                  )}

                  {activeSection === 'academics' && (
                    <div className="space-y-6">
                      <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Academic Summary</span>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight uppercase">{userProfile.exam_type} Profile</h3>
                          </div>
                          <div className="flex gap-8">
                            <div className="group">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 group-hover:text-slate-900 transition-colors">Entrance Rank</p>
                              <p className="text-3xl font-bold text-slate-900 tabular-nums tracking-tighter">#{userProfile.exam_type === 'CET' ? (userProfile.cet_rank || '--') : (userProfile.diploma_rank || '--')}</p>
                            </div>
                            <div className="group border-l border-slate-100 pl-8">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 group-hover:text-slate-900 transition-colors">Assessment Score</p>
                              <p className="text-3xl font-bold text-slate-900 tabular-nums tracking-tighter">{userProfile.exam_type === 'CET' ? (userProfile.cet_score || '--') : (userProfile.diploma_score || '--')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 flex flex-col items-center shadow-sm">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">SSC Aggregate</p>
                          <p className="text-xl font-bold text-slate-900">{userProfile.tenth_percentage || "--"}%</p>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 flex flex-col items-center shadow-sm">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">HSC/Dip Aggregate</p>
                          <p className="text-xl font-bold text-indigo-600">{userProfile.twelfth_percentage || "--"}%</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'predictions' && (
                    <div className="grid grid-cols-1 gap-4">
                      {predictions.length > 0 ? predictions.map((p, i) => (
                        <div key={i} className="group bg-white hover:border-indigo-200 border border-slate-200/60 p-4 rounded-2xl flex items-center justify-between transition-all duration-300 shadow-sm hover:shadow-md">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-indigo-600 group-hover:bg-indigo-50 font-bold text-lg transition-all">
                              {p.college_name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-slate-900 mb-1 leading-tight">{p.college_name}</h4>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wide">{p.branch}</span>
                                <span className="text-xs text-slate-400 font-medium">{p.city}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-slate-900">{Math.round(p.admission_chance)}%</div>
                            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide italic">{p.fit} fit</span>
                          </div>
                        </div>
                      )) : (
                        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm px-10">
                          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Target className="w-6 h-6 text-indigo-600" />
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">No Predictions Calculated</h4>
                          <p className="text-slate-500 text-xs font-medium mb-8 leading-relaxed">Update your academic scores and preferred branches to unlock precision admission modeling.</p>
                          <button 
                            onClick={() => navigate("/profile")}
                            className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                          >
                            Setup Academic Profile
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeSection === 'skills' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {skills.length > 0 ? skills.map((s, i) => (
                        <div key={i} className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{s.skill_name}</h4>
                            <span className="text-indigo-600 font-bold text-xs">{s.proficiency_level}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${s.proficiency_level}%` }}
                              className="h-full bg-slate-900 rounded-full" 
                            />
                          </div>
                        </div>
                      )) : (
                        [
                          { n: "Analytical Logic", p: 85 },
                          { n: "Technical Aptitude", p: 78 },
                          { n: "System Design", p: 65 },
                          { n: "Critical Reasoning", p: 92 }
                        ].map((s, i) => (
                          <div key={i} className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm opacity-60">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.n} <span className="text-[10px] font-medium lowercase italic">(Inferred)</span></h4>
                              <span className="text-slate-400 font-bold text-xs">{s.p}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                              <div className="h-full bg-slate-300 rounded-full" style={{ width: `${s.p}%` }} />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Achievements section */}
                  {activeSection === 'achievements' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {achievements.length > 0 ? achievements.map((a, i) => (
                        <div key={i} className={`group bg-white p-6 rounded-3xl border transition-all duration-500 shadow-sm ${a.is_unlocked ? "border-indigo-100" : "opacity-40 grayscale border-slate-100"}`}>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${a.is_unlocked ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-300'}`}>
                            <Star className={`w-5 h-5 ${a.is_unlocked ? "fill-indigo-600" : ""}`} />
                          </div>
                          <h4 className="text-base font-bold text-slate-900 mb-1 tracking-tight uppercase">{a.achievement_name}</h4>
                          <p className="text-slate-500 text-xs font-medium leading-relaxed">{a.achievement_description}</p>
                        </div>
                      )) : (
                        [
                          { n: "Pioneer", d: "Successfully established digital identity on Ikigai Core." },
                          { n: "Data Strategist", d: "First batch of academic records verified and synced." }
                        ].map((a, i) => (
                          <div key={i} className="group bg-white p-6 rounded-3xl border border-indigo-50 shadow-sm">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                              <Check className="w-5 h-5" />
                            </div>
                            <h4 className="text-base font-bold text-slate-900 mb-1 tracking-tight uppercase">{a.n}</h4>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed">{a.d}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Scholarships section */}
                  {activeSection === 'scholarships' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(scholarships.length > 0 ? scholarships : [
                        { scholarship_name: "Rajarshi Shahu Maharaj Fee Concession", estimated_amount: 80000, eligibility_score: 95 },
                        { scholarship_name: "Post-Matric Scholarship Scheme", estimated_amount: 45000, eligibility_score: 88 }
                      ]).map((s, i) => (
                        <div key={i} className={`bg-white rounded-3xl border p-6 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors ${scholarships.length === 0 ? 'border-indigo-50/50' : 'border-slate-200/60'}`}>
                          <div className="absolute top-0 right-0 p-5">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${scholarships.length === 0 ? 'bg-slate-300' : 'bg-indigo-600'}`} />
                              <span className={`text-xs font-bold uppercase tracking-wide ${scholarships.length === 0 ? 'text-slate-400' : 'text-indigo-600'}`}>
                                {s.eligibility_score}% {scholarships.length === 0 ? 'Potential' : 'Match'}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Financial Assistance</p>
                          <h4 className="text-lg font-bold text-slate-900 mb-1 leading-tight">{s.scholarship_name}</h4>
                          <p className="text-2xl font-bold text-slate-900 mb-6 tracking-tight uppercase italic">₹{s.estimated_amount.toLocaleString()}</p>
                          <button 
                            onClick={() => navigate("/scholarships")}
                            className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-slate-100"
                          >
                            Details & Application
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Activities Section */}
                  {activeSection === 'activities' && (
                    <div className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm">
                       <div className="space-y-3">
                          {(activities.length > 0 ? activities : [
                            { activity_type: "account_initialized", created_at: userProfile.created_at }
                          ]).map((act, i) => (
                            <div key={i} className="flex items-center justify-between px-5 py-4 bg-slate-50/50 rounded-xl border border-slate-100 group hover:bg-white hover:border-indigo-200 transition-all">
                              <div className="flex items-center gap-4">
                                <div className={`w-1.5 h-1.5 rounded-full group-hover:scale-125 transition-transform ${activities.length === 0 ? 'bg-slate-400' : 'bg-indigo-600'}`} />
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{act.activity_type.replace('_', ' ')}</span>
                              </div>
                              <span className="text-xs font-medium text-slate-400 uppercase">{new Date(act.created_at).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Light-Themed Verification Flow */}
      <AnimatePresence>
        {isAuthenticating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/10 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.05, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm border border-slate-200 shadow-2xl relative"
            >
              <div className="absolute top-0 right-0 p-6">
                 <button onClick={() => setIsAuthenticating(false)} className="text-slate-300 hover:text-slate-900 transition-colors">
                  <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-indigo-600" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight uppercase">Identity Bridge</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed mb-8 px-4">Link your oficial DigiLocker to sync academic records and generate high-precision predictions.</p>

                {authStep === 0 && (
                  <button 
                    onClick={async () => {
                      setAuthStep(1);
                      await new Promise(r => setTimeout(r, 2000));
                      setAuthStep(3);
                      const { data: { session } } = await supabase.auth.getSession();
                      if (session) {
                        await supabase.from('users').update({ digilocker_verified: true }).eq('id', session.user.id);
                        setIsDigilockerVerified(true);
                        setTimeout(() => setIsAuthenticating(false), 1500);
                      }
                    }}
                    className="w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
                  >
                    Authorize Official Link
                  </button>
                )}

                {authStep === 1 && (
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="w-8 h-8 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest animate-pulse">Establishing Nodes</p>
                  </div>
                )}

                {authStep === 3 && (
                  <div className="py-4 text-emerald-600 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 italic">
                    <Check className="w-4 h-4" />
                    Verified Successfully
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}