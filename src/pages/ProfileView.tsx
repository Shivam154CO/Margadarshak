/// <reference types="vite/client" />
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import type { UserProfile } from "../types/user";

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
  const [isDigilockerVerified, setIsDigilockerVerified] = useState(
    localStorage.getItem("digilockerVerified") === "true"
  );

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-['Nunito_Sans'] font-bold text-slate-400">
        Loading...
    </div>
  );

  if (!userProfile) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-['Nunito_Sans'] font-bold text-slate-800">
      <Navbar activeTab="profile" userProfile={userProfile} />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 mt-16 pb-24">
        {/* Header - Reduced Font Sizes and No Colors */}
        <div className="mb-10 border-b border-slate-200 pb-6">
            <div className="mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Profile View</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">{userProfile.name}</h1>
                    <p className="text-slate-400 font-bold mt-1 text-xs uppercase tracking-wide">Candidate Identity Data</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => copyToClipboard(window.location.href)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition uppercase tracking-wider">
                        {copied ? "Link Copied" : "Share"}
                    </button>
                    <button onClick={() => navigate("/profile")} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold hover:bg-black transition uppercase tracking-wider">
                        Edit
                    </button>
                </div>
            </div>
        </div>

        {/* Info Blocks - Reduced Sizes & Monochrome */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
                { l: "Examination", v: userProfile.exam_type },
                { l: "Category", v: userProfile.category },
                { l: "State Rank", v: userProfile.exam_type === 'CET' ? (userProfile.cet_rank || 'N/A') : (userProfile.diploma_rank || 'N/A') },
                { l: "Streak", v: analytics?.login_streak || 1 }
            ].map(s => (
                <div key={s.l} className="bg-white p-4 border border-slate-200 rounded-xl">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.l}</div>
                    <div className="text-lg font-black text-slate-800 lowercase">{s.v}</div>
                </div>
            ))}
        </div>

        {/* Verification Status - Subtle */}
        <div className="mb-8 p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Authentication</span>
            <div className="flex items-center gap-3">
                {isDigilockerVerified ? (
                    <span className="text-[10px] font-bold text-slate-600 border border-slate-200 px-3 py-1 rounded-md uppercase">Verified Account</span>
                ) : (
                    <button onClick={() => setIsAuthenticating(true)} className="text-[10px] font-bold text-slate-900 underline underline-offset-4 uppercase">Link DigiLocker</button>
                )}
            </div>
        </div>

        {/* Tab Selection - Reduced Sizes, Solid White/Slate */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-4 scrollbar-none border-b border-slate-100">
            {[
                { id: 'overview', label: 'Primary' },
                { id: 'academics', label: 'Metrics' },
                { id: 'predictions', label: 'Forecast' },
                { id: 'skills', label: 'Grid' },
                { id: 'achievements', label: 'Badges' },
                { id: 'activities', label: 'Logs' },
                { id: 'scholarships', label: 'Grants' }
            ].map((f) => (
                <button
                    key={f.id}
                    onClick={() => setActiveSection(f.id)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap border ${
                        activeSection === f.id ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                    } uppercase tracking-widest`}
                >
                    {f.label}
                </button>
            ))}
        </div>

        {/* Detail Sections - Focus on reduced font sizes/monochrome */}
        <AnimatePresence mode="wait">
            {activeSection === 'overview' && (
                <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-50 pb-3">Dossier Data</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {[
                                { l: "Name", v: userProfile.name },
                                { l: "Email", v: userProfile.email },
                                { l: "Phone", v: userProfile.phone || "Missing" },
                                { l: "Caste", v: userProfile.category },
                                { l: "Exam", v: userProfile.exam_type },
                                { l: "Joined", v: new Date(userProfile.created_at).toLocaleDateString("en-IN") }
                            ].map(x => (
                                <div key={x.l}>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">{x.l}</span>
                                    <p className="text-sm font-bold text-slate-700">{x.v}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">University Pref</span>
                             <p className="text-sm font-bold text-slate-700">{userProfile.university_preference || "Standard Institutions"}</p>
                        </div>
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">State Target</span>
                             <p className="text-sm font-bold text-slate-700">{userProfile.state || "Maharashtra"}</p>
                        </div>
                        <div className="col-span-1 md:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Address</span>
                             <p className="text-sm font-bold text-slate-700">{userProfile.address || "No address provided"}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {activeSection === 'academics' && (
                <motion.div key="acad" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="bg-slate-900 rounded-2xl p-8 text-white">
                        <div className="mb-6">
                            <h2 className="text-xl font-black tracking-tight uppercase">{userProfile.exam_type} Profile</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="border-l-2 border-slate-700 pl-4">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">State Rank</span>
                                <p className="text-3xl font-black tabular-nums">#{userProfile.exam_type === 'CET' ? (userProfile.cet_rank || '--') : (userProfile.diploma_rank || '--')}</p>
                            </div>
                            <div className="border-l-2 border-slate-700 pl-4">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Score</span>
                                <p className="text-3xl font-black tabular-nums">{userProfile.exam_type === 'CET' ? (userProfile.cet_score || '--') : (userProfile.diploma_score || '--')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { l: "10th %", v: userProfile.tenth_percentage },
                            { l: "12th/Dip %", v: userProfile.twelfth_percentage }
                        ].map(q => (
                            <div key={q.l} className="bg-white border border-slate-200 p-6 rounded-2xl">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{q.l}</span>
                                <p className="text-2xl font-black text-slate-800">{q.v || "--"}%</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white border border-slate-200 p-6 rounded-2xl">
                        <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Interests</h5>
                        <div className="flex flex-wrap gap-2">
                            {userProfile.preferred_branches?.map((b: string) => (
                                <span key={b} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[9px] font-black uppercase tracking-wider">{b}</span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {activeSection === 'predictions' && (
                <motion.div key="pred" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    {predictions.length > 0 ? predictions.map((p, i) => (
                        <div key={i} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <h4 className="font-extrabold text-slate-800 text-sm tracking-tight uppercase mb-1">{p.college_name}</h4>
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="text-[8px] font-black bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-slate-400 uppercase whitespace-nowrap">{p.branch}</span>
                                    <span className="text-[8px] font-black text-slate-300 uppercase truncate shrink-0">• {p.city}</span>
                                </div>
                            </div>
                            <div className="text-right shrink-0 border-l border-slate-100 pl-4">
                                <div className="text-xl font-black text-slate-900">{Math.round(p.admission_chance)}%</div>
                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{p.fit}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 text-center bg-white border border-slate-200 rounded-2xl">
                            <p className="text-slate-300 text-xs font-black uppercase">{predictions.length === 0 ? "Analyzing Datasets..." : "No Predictions available"}</p>
                        </div>
                    )}
                </motion.div>
            )}

            {activeSection === 'skills' && (
                <motion.div key="skill" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skills.length > 0 ? skills.map((s, i) => (
                        <div key={i} className="bg-white p-4 border border-slate-200 rounded-xl">
                            <div className="flex justify-between mb-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                <span>{s.skill_name}</span>
                                <span>{s.proficiency_level}%</span>
                            </div>
                            <div className="h-2 bg-slate-50 rounded-full border border-slate-100">
                                <div className="h-full bg-slate-400 rounded-full" style={{ width: `${s.proficiency_level}%` }} />
                            </div>
                        </div>
                    )) : <p className="col-span-2 text-center py-10 text-slate-300 text-xs uppercase font-black">Recordset empty</p>}
                </motion.div>
            )}

            {activeSection === 'achievements' && (
                <motion.div key="ach" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((a, i) => (
                        <div key={i} className={`p-6 bg-white border border-slate-200 rounded-2xl ${a.is_unlocked ? "" : "opacity-30 grayscale"}`}>
                            <h4 className="font-extrabold text-sm text-slate-900 uppercase mb-1">{a.achievement_name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold leading-normal">{a.achievement_description}</p>
                        </div>
                    ))}
                </motion.div>
            )}

            {activeSection === 'activities' && (
                <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    {activities.map((act, i) => (
                        <div key={i} className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center">
                            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{act.activity_type.replace('_', ' ')}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(act.created_at).toLocaleDateString()}</p>
                        </div>
                    ))}
                </motion.div>
            )}

            {activeSection === 'scholarships' && (
                <motion.div key="sch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scholarships.map((s, i) => (
                        <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl">
                            <h4 className="text-xs font-black text-slate-900 uppercase mb-3">{s.scholarship_name}</h4>
                            <p className="text-2xl font-black text-slate-800">₹{s.estimated_amount.toLocaleString()}</p>
                            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between text-[9px] font-black text-slate-400 uppercase">
                                <span>Eligibility Match</span>
                                <span>{s.eligibility_score}%</span>
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>

        {/* Auth Modal - Monochrome, Minimalist */}
        <AnimatePresence>
            {isAuthenticating && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-slate-200 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 text-center">
                            <button onClick={() => setIsAuthenticating(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-all font-black">X</button>
                            <h3 className="text-sm font-black uppercase text-slate-900 tracking-widest">Document Vault</h3>
                        </div>
                        <div className="p-8">
                            {authStep === 0 && (
                                <div className="text-center">
                                    <p className="text-slate-400 text-[10px] mb-8 font-bold leading-relaxed px-4 text-center">Verification required via DigiLocker servers.</p>
                                    <button onClick={() => {
                                        setAuthStep(1);
                                        setTimeout(() => setAuthStep(2), 2000);
                                        setTimeout(() => {
                                            setIsDigilockerVerified(true);
                                            localStorage.setItem("digilockerVerified", "true");
                                            setAuthStep(3);
                                            setTimeout(() => setIsAuthenticating(false), 2000);
                                        }, 4000);
                                    }} className="w-full bg-slate-900 text-white py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Authorize</button>
                                </div>
                            )}
                            {authStep > 0 && authStep < 3 && (
                                <div className="text-center py-6">
                                    <div className="w-8 h-8 border-2 border-slate-100 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase animate-pulse">Establishing Link</p>
                                </div>
                            )}
                            {authStep === 3 && (
                                <div className="text-center py-6 text-slate-900 text-xs font-black uppercase">Success</div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}