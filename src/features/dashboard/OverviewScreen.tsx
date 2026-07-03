import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Briefcase, IndianRupee, X, CheckCircle2, FileText, Calendar, ShieldCheck, AlertCircle, ChevronRight, ChevronDown, Globe, Bell, ArrowUpRight, BookOpen, Zap, Award, Search, MapPin } from "lucide-react";
import { CollegeCardImage } from "@/features/colleges/components/CollegeCardImage";

const ML_API_URL = import.meta.env.VITE_ML_API_URL ?? 'http://127.0.0.1:5001';

import type { UserProfile } from "@/types/user";
import type { College } from "@/types/college";

// ─── Types ────────────────────────────────────────────────────────────────────

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCollegeImage = (code: string) =>
  code ? `/src/assets/${code}/campus.png` : "/src/assets/fallback-campus.jpg";



const fitColor = (fit: string) => {
  if (fit === "Most Probable") return { bg: "bg-purple-50 border-purple-200", text: "text-purple-700", bar: "bg-purple-500" };
  if (fit === "Best Fit") return { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", bar: "bg-emerald-500" };
  if (fit === "Good Fit") return { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", bar: "bg-blue-500" };
  return { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", bar: "bg-orange-500" };
};


// ─── Small Components ─────────────────────────────────────────────────────────

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
      {action && (
        <button onClick={onAction} className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
          {action} <span className="text-base">&rsaquo;</span>
        </button>
      )}
    </div>
  );
}

function MiniCollegeImg({ code, className = "" }: { code: string; className?: string }) {
  const fallbackIdx = parseInt(code.replace(/\D/g, '') || '0', 10);
  return (
    <CollegeCardImage
      src={getCollegeImage(code)}
      className={`object-cover w-full h-full ${className}`}
      fallbackIndex={fallbackIdx}
      sizes="128px"
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OverviewScreen() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [predictionsLoading, setPredictionsLoading] = useState(false);
  const [spotlightIdx, setSpotlightIdx] = useState(0);

  // ── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { navigate("/login", { replace: true }); return; }
        const { data: prof } = await supabase.from("users").select("*").eq("id", session.user.id).single();
        if (!prof?.profile_complete) { navigate("/profile", { replace: true }); return; }
        setProfile(prof as UserProfile);
      } catch { navigate("/login", { replace: true }); }
      finally { setLoading(false); }
    })();
  }, [navigate]);

  useEffect(() => {
    const branches = profile?.preferred_branches || [];
    if (!branches.length) return;
    (async () => {
      setPredictionsLoading(true);
      try {
        const score = profile?.exam_type === "CET" ? parseFloat(profile?.cet_score || "0") : parseFloat(profile?.diploma_score || "0");
        const rank = profile?.exam_type === "CET" ? parseFloat(profile?.cet_rank || "0") : parseFloat(profile?.diploma_rank || "0");
        const res = await axios.post(`${ML_API_URL}/predict_admission`,
          { score, rank, category: profile?.category, branches: branches },
          { timeout: 30000 }
        );
        if (res.data?.colleges?.length) {
          setColleges(res.data.colleges.map((c: any) => ({
            ...c,
            image: getCollegeImage(c.college_code),
            probability_level: c.is_most_probable ? "Most Probable" : c.fit ?? "Unknown",
            admission_chance_percentage: c.admission_chance_percentage ?? `${(c.admission_chance ?? 0).toFixed(1)}%`,
          })));
        }
      } catch (e) { console.error("Prediction error:", e); }
      finally { setPredictionsLoading(false); }
    })();
  }, [profile]);

  // Auto-rotate spotlight
  useEffect(() => {
    if (colleges.length === 0) return;
    const spotlightCandidates = colleges.filter(c => (c.admission_chance ?? 0) >= 60);
    if (spotlightCandidates.length === 0) return;
    const interval = setInterval(() => setSpotlightIdx(i => (i + 1) % spotlightCandidates.length), 6000);
    return () => clearInterval(interval);
  }, [colleges]);

  // ── Derived Data ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const mp = colleges.filter(c => c.is_most_probable || c.probability_level === "Most Probable");
    const bf = colleges.filter(c => (c.fit === "Best Fit" || c.probability_level === "Best Fit") && !c.is_most_probable);
    const gf = colleges.filter(c => c.fit === "Good Fit" || c.probability_level === "Good Fit");
    const st = colleges.filter(c => c.fit === "Stretch" || c.probability_level === "Stretch");
    return { mostProbable: mp, bestFit: bf, goodFit: gf, stretch: st, total: colleges, unique: new Set(colleges.map(c => c.college_code)).size };
  }, [colleges]);

  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [expandedTier, setExpandedTier] = useState<string | null>(null);
  const [expandedFeeTier, setExpandedFeeTier] = useState<string | null>(null);
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);

  // States for Admission Action Plan deep-input
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [readyDocs, setReadyDocs] = useState<string[]>([]);

  // States for AI Mad-Libs Query Engine
  const [mlTier, setMlTier] = useState<string>("Best Fit");
  const [mlCity, setMlCity] = useState<string>("Any City");
  const [mlBranch, setMlBranch] = useState<string>("Any Branch");
  const [mlFee, setMlFee] = useState<string>("Any Fee");

  // Dynamic Intelligence Feed State
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  // Fetch Central Intelligence
  useEffect(() => {
    axios.post(`${ML_API_URL}/college_intelligence`, { college_name: "General", exam_type: "DSE" })
      .then(res => setNewsItems(res.data.central || []))
      .catch((err) => console.error("News fetch error:", err))
      .finally(() => setNewsLoading(false));
  }, []);

  const mlCities = useMemo(() => ["Any City", ...Array.from(new Set(colleges.map(c => c.city))).sort()], [colleges]);
  const mlBranches = useMemo(() => ["Any Branch", ...Array.from(new Set(colleges.map(c => c.branch))).sort()], [colleges]);

  const mlResults = useMemo(() => {
    return [...colleges].filter(c => {
      if (mlTier !== "Any Tier") {
        const tierMapping: Record<string, string> = { "Most Probable": "Most Probable", "Best Fit": "Best Fit", "Good Fit": "Good Fit", "Stretch": "Stretch" };
        const cFitText = c.probability_level || c.fit || "Unknown";
        if (cFitText !== tierMapping[mlTier] && !(mlTier === "Most Probable" && c.is_most_probable)) return false;
      }
      if (mlCity !== "Any City" && c.city !== mlCity) return false;
      if (mlBranch !== "Any Branch" && c.branch !== mlBranch) return false;
      if (mlFee !== "Any Fee") {
        const fee = c.fees ?? Infinity;
        if (mlFee === "Under ₹50K" && fee > 50000) return false;
        if (mlFee === "Under ₹1 Lakh" && fee > 100000) return false;
        if (mlFee === "Under ₹2 Lakhs" && fee > 200000) return false;
      }
      return true;
    }).sort((a, b) => (b.admission_chance ?? 0) - (a.admission_chance ?? 0)).slice(0, 10);
  }, [colleges, mlTier, mlCity, mlBranch, mlFee]);

  // Calculate dynamic documents based on user category
  const requiredDocuments = useMemo(() => {
    if (!profile) return [];
    const baseDocs = ["10th / SSC Marksheet", "12th / HSC / Diploma Marksheet", "MHT-CET / JEE Scorecard", "Domicile & Nationality Certificate", "Leaving Certificate (LC)"];
    const cat = profile.category?.toUpperCase() || "OPEN";

    if (["SC", "ST"].includes(cat)) {
      baseDocs.push("Caste Certificate", "Caste Validity Certificate");
    } else if (["OBC", "SBC", "VJDT(NTA)", "NTB", "NTC", "NTD"].includes(cat)) {
      baseDocs.push("Caste Certificate", "Caste Validity Certificate", "Non-Creamy Layer (NCL) Certificate (Valid up to 31 March)");
    } else if (cat === "SEBC") {
      baseDocs.push("SEBC Caste Certificate", "SEBC Non-Creamy Layer (NCL)", "Caste Validity Certificate (if applicable)");
    } else if (cat === "EWS") {
      baseDocs.push("EWS Certificate for Maharashtra State");
    }
    // Assume all Open might want Income cert just in case
    baseDocs.push("Income Certificate (Optional but recommended)");

    return baseDocs;
  }, [profile]);



  // City distribution for heatmap
  const cityDistribution = useMemo(() => {
    const map = new Map<string, number>();
    colleges.forEach(c => map.set(c.city, (map.get(c.city) || 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [colleges]);



  // Top 3 comparison colleges
  const comparisonColleges = useMemo(() => {
    const uniqueMap = new Map<string, College>();
    [...colleges].sort((a, b) => (b.admission_chance ?? 0) - (a.admission_chance ?? 0))
      .forEach(c => { if (!uniqueMap.has(c.college_code) && uniqueMap.size < 3) uniqueMap.set(c.college_code, c); });
    return Array.from(uniqueMap.values());
  }, [colleges]);

  // Top 6 recommended colleges (unique)
  const topRecommendedColleges = useMemo(() => {
    const uniqueMap = new Map<string, College>();
    [...colleges].sort((a, b) => (b.admission_chance ?? 0) - (a.admission_chance ?? 0))
      .forEach(c => { if (!uniqueMap.has(c.college_code) && uniqueMap.size < 6) uniqueMap.set(c.college_code, c); });
    return Array.from(uniqueMap.values());
  }, [colleges]);

  // Spotlight college
  const spotlightCandidates = useMemo(() => colleges.filter(c => (c.admission_chance ?? 0) >= 60), [colleges]);
  const spotlightCollege = spotlightCandidates.length > 0 ? spotlightCandidates[spotlightIdx % spotlightCandidates.length] : colleges[0] ?? null;

  // Branch-wise stats
  const branchStats = useMemo(() => {
    const map = new Map<string, { count: number; avgChance: number; topCollege: string }>();
    colleges.forEach(c => {
      const b = c.branch || "Unknown";
      const prev = map.get(b);
      if (!prev) map.set(b, { count: 1, avgChance: c.admission_chance ?? 0, topCollege: c.college_name || "Unknown" });
      else {
        prev.count++;
        prev.avgChance = ((prev.avgChance * (prev.count - 1)) + (c.admission_chance ?? 0)) / prev.count;
        if ((c.admission_chance ?? 0) > prev.avgChance) prev.topCollege = c.college_name || "Unknown";
      }
    });
    return Array.from(map.entries()).map(([b, d]) => ({ branch: b, ...d })).sort((a, b) => b.avgChance - a.avgChance);
  }, [colleges]);

  // Quick nav features
  const features = [
    { title: "AI Search", desc: "Smart college finder", color: "from-indigo-500 to-blue-500", link: "/college-explorer" },
    { title: "Compare", desc: "Side-by-side analysis", color: "from-purple-500 to-pink-500", link: "/compare-college" },
    { title: "Interactive Map", desc: "Geographic explorer", color: "from-emerald-500 to-teal-500", link: "/college-map" },
    { title: "Rank Predictor", desc: "Estimate merit rank", color: "from-orange-500 to-red-500", link: "/rank-predictor" },
    { title: "Favorites", desc: "Saved colleges", color: "from-pink-500 to-rose-500", link: "/favorites" },
    { title: "Analytics", desc: "Trends & insights", color: "from-cyan-500 to-blue-500", link: "/analytics" },
  ];

  // Fee Analysis
  const feeAnalysis = useMemo(() => {
    const withFees = colleges.filter(c => c.fees && c.fees > 0);
    if (withFees.length === 0) return null;
    const sorted = [...withFees].sort((a, b) => (a.fees ?? 0) - (b.fees ?? 0));
    const avg = Math.round(withFees.reduce((s, c) => s + (c.fees ?? 0), 0) / withFees.length);
    const ranges = [
      { label: "Under ₹50K", count: withFees.filter(c => (c.fees ?? 0) < 50000).length, color: "bg-emerald-500" },
      { label: "₹50K – 1L", count: withFees.filter(c => (c.fees ?? 0) >= 50000 && (c.fees ?? 0) < 100000).length, color: "bg-blue-500" },
      { label: "₹1L – 2L", count: withFees.filter(c => (c.fees ?? 0) >= 100000 && (c.fees ?? 0) < 200000).length, color: "bg-purple-500" },
      { label: "Above ₹2L", count: withFees.filter(c => (c.fees ?? 0) >= 200000).length, color: "bg-orange-500" },
    ];
    return { avg, min: sorted[0].fees ?? 0, max: sorted[sorted.length - 1].fees ?? 0, cheapest: sorted[0], ranges, total: withFees.length };
  }, [colleges]);

  // Placement Insights
  const placementInsights = useMemo(() => {
    const withPkg = colleges.filter(c => c.average_package_lpa && c.average_package_lpa > 0);
    const withPlacement = colleges.filter(c => c.placement_rate && c.placement_rate > 0);
    if (withPkg.length === 0) return null;
    const topPkg = [...withPkg].sort((a, b) => (b.average_package_lpa ?? 0) - (a.average_package_lpa ?? 0)).slice(0, 5);
    const topPlacement = [...withPlacement].sort((a, b) => (b.placement_rate ?? 0) - (a.placement_rate ?? 0)).slice(0, 5);
    const avgPkg = (withPkg.reduce((s, c) => s + (c.average_package_lpa ?? 0), 0) / withPkg.length).toFixed(1);
    const avgPlacement = withPlacement.length > 0 ? Math.round(withPlacement.reduce((s, c) => s + (c.placement_rate ?? 0), 0) / withPlacement.length) : 0;
    return { topPkg, topPlacement, avgPkg, avgPlacement };
  }, [colleges]);

  // Hostel & Autonomy
  const infraStats = useMemo(() => {
    const hostelYes = colleges.filter(c => c.hostel_available?.toLowerCase() === "yes" || c.hostel_available?.toLowerCase() === "available").length;
    const autonomous = colleges.filter(c => {
      const s = (c.autonomy_status || '').toLowerCase().replace(/autonoumous/g, 'autonomous');
      return s.includes('autonomous');
    }).length;
    const affiliated = colleges.filter(c => {
      const s = (c.autonomy_status || '').toLowerCase().replace(/autonoumous/g, 'autonomous');
      return s.includes('affiliated') || (!s.includes('autonomous') && c.autonomy_status);
    }).length;
    return { hostelYes, hostelNo: colleges.length - hostelYes, autonomous, affiliated, total: colleges.length };
  }, [colleges]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar activeTab="overview" />
        <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-9 bg-gray-200 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-48"></div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 bg-gray-200 rounded-xl w-28"></div>
              <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
            </div>
          </div>
          {/* Profile bar skeleton */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 mb-8">
            <div className="flex gap-4">
              <div className="h-5 bg-gray-200 rounded w-32"></div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
              <div className="h-5 bg-gray-200 rounded w-48 ml-auto"></div>
            </div>
          </div>
          {/* Stats grid skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 border-l-4 border-l-slate-200 rounded-xl p-5">
                <div className="h-8 bg-gray-200 rounded w-14 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar activeTab="overview" userProfile={profile as any} />

      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">

        {/* ═══════════ Header ═══════════ */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Welcome, {profile?.name?.split(" ")[0] ?? "User"}!
              </h1>
              <p className="text-sm text-slate-500 mt-1">Your AI-powered college admission command center</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/profile-view")} className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition flex items-center gap-2 shadow-sm">
              View Profile
            </button>
            <button onClick={() => navigate("/profile")} className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm flex items-center gap-2">
              Update Profile
            </button>
          </div>
        </div>


        {profile && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 mb-8 shadow-sm">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="font-bold text-slate-900 text-base">{profile.name}</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-semibold">{profile.exam_type}</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-semibold">{profile.category}</span>
              <span className="text-slate-500">
                Score: <span className="font-bold text-slate-700">{profile.exam_type === "CET" ? profile.cet_score : profile.diploma_score}</span>
                {" · "}
                Rank: <span className="font-bold text-slate-700">{profile.exam_type === "CET" ? profile.cet_rank : profile.diploma_rank}</span>
              </span>
              <div className="flex gap-1.5 ml-auto flex-wrap">
                {(profile.preferred_branches ?? []).slice(0, 5).map(b => (
                  <span key={b} className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg font-semibold text-xs">{b}</span>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* ═══════════ Category Reservation Breakdown ═══════════ */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
          <SectionTitle title="Category-wise Reservation Breakdown" />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300 text-sm">
              <thead>
                <tr className="bg-slate-50">
                  {["Category", "General", "SC", "ST", "VJDT(NTA)", "NTB", "NTC", "NTD", "OBC", "SEBC", "Total"].map(h => (
                    <th key={h} className="border border-slate-300 px-4 py-3 text-sm font-bold text-slate-800 text-center whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 text-center">% Reservation</td>
                  {["40.00%", "13.0%", "7.0%", "3.0%", "2.5%", "3.5%", "2.0%", "19.0%", "10.0%", "100.00%"].map((val, i) => (
                    <td key={i} className={`border border-slate-300 px-4 py-3 text-sm text-center font-semibold ${i === 9 ? "bg-slate-50 text-slate-900 font-bold" : "text-slate-700"}`}>
                      {val}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Legends */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-800 mb-3">Legends :</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { abbr: "EWS", full: "Economically Weaker Section" },
                { abbr: "PWD", full: "Persons with Disability" },
                { abbr: "DEF", full: "Defence" },
                { abbr: "G", full: "General, L: Ladies, F: Only for Female" },
                { abbr: "SC", full: "Scheduled Caste" },
                { abbr: "ST", full: "Scheduled Tribe" },
                { abbr: "OBC", full: "Other Backward Class" },
                { abbr: "SEBC", full: "Socially and Educationally Backward Class" },
                { abbr: "NTB / NTC / NTD", full: "Nomadic Tribes (Sub-categories)" },
                { abbr: "VJDT(NTA)", full: "Vimukta Jati / De-notified Tribes (NT-A)" },
              ].map(l => (
                <p key={l.abbr} className="text-sm text-slate-600">
                  <span className="font-bold text-slate-800">{l.abbr}</span> : {l.full}
                </p>
              ))}
            </div>
          </div>
        </div>

        {predictionsLoading ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center"><div className="w-3 h-3 bg-white rounded-full" /></div>
              <div><p className="text-sm font-semibold text-indigo-900">AI Engine Running</p><p className="text-xs text-indigo-600">Analysing {profile?.preferred_branches?.length ?? 0} branches across 340+ colleges...</p></div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100" />)}</div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white rounded-2xl border border-slate-100" />)}</div>
          </div>
        ) : colleges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4"><span className="text-2xl font-bold text-indigo-300">?</span></div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Predictions Yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-4">Complete your profile to get AI-powered college matches.</p>
            <button onClick={() => navigate("/profile")} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md">Complete Profile</button>
          </div>
        ) : (
          <>
            {/* ═══════════ SECTION 1: Fit Distribution Stats ═══════════ */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
              {[
                { label: "Most Probable", data: stats.mostProbable, sub: "Near-exact match", accent: "border-l-purple-500", key: "Most Probable" },
                { label: "Best Fit", data: stats.bestFit, sub: "High chance", accent: "border-l-emerald-500", key: "Best Fit" },
                { label: "Good Fit", data: stats.goodFit, sub: "Solid match", accent: "border-l-blue-500", key: "Good Fit" },
                { label: "Stretch", data: stats.stretch, sub: "Backup option", accent: "border-l-orange-400", key: "Stretch" },
                { label: "Total Matches", data: stats.total, sub: `${stats.unique} unique colleges`, accent: "border-l-slate-400", key: "Total" },
              ].map((s) => {
                const isSelected = expandedTier === s.key && s.key !== "Total";
                return (
                  <div
                    key={s.label}
                    onClick={() => s.key !== "Total" && setExpandedTier(isSelected ? null : s.key)}
                    className={`bg-white border border-l-4 rounded-xl p-5 shadow-sm transition-all duration-300 ${s.key === "Total" ? 'cursor-default border-slate-200 ' + s.accent : 'cursor-pointer hover:-translate-y-1 hover:shadow-md ' + (isSelected ? `ring-2 ring-offset-2 ${s.key === 'Most Probable' ? 'ring-purple-500 border-purple-500' : s.key === 'Best Fit' ? 'ring-emerald-500 border-emerald-500' : s.key === 'Good Fit' ? 'ring-blue-500 border-blue-500' : 'ring-orange-400 border-orange-400'} bg-slate-50` : 'border-slate-200 ' + s.accent)}`}
                  >
                    <span className={`text-3xl font-bold ${isSelected ? 'text-indigo-600' : 'text-slate-800'}`}>{s.data.length}</span>
                    <p className="text-sm font-semibold text-slate-700 mt-2">{s.label}</p>
                    <p className={`text-xs mt-0.5 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`}>{s.sub}</p>
                    {s.key !== "Total" && (
                      <div className={`mt-2 text-[10px] font-bold tracking-wide uppercase ${isSelected ? 'text-indigo-500' : 'text-slate-300 group-hover:text-slate-400'}`}>
                        {isSelected ? 'Close Panel ▼' : 'Click to View ▶'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* EXPANDED TIER PANEL */}
            <div className={`transition-all duration-500 origin-top overflow-hidden ${expandedTier ? 'max-h-[1000px] opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'}`}>
              {expandedTier && (() => {
                const dataMap: Record<string, College[]> = { "Most Probable": stats.mostProbable, "Best Fit": stats.bestFit, "Good Fit": stats.goodFit, "Stretch": stats.stretch };
                const activeData = dataMap[expandedTier] || [];

                if (activeData.length === 0) return (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
                    <p className="text-slate-500 font-semibold">No colleges match this tier currently.</p>
                  </div>
                );

                // Sort logic for subpanels
                const highestPkg = [...activeData].sort((a, b) => (b.average_package_lpa ?? 0) - (a.average_package_lpa ?? 0)).slice(0, 3);
                const lowestFee = [...activeData].filter(c => c.fees && c.fees > 0).sort((a, b) => (a.fees ?? 0) - (b.fees ?? 0)).slice(0, 3);

                return (
                  <div className="bg-white border text-left border-indigo-100 rounded-2xl shadow-lg shadow-indigo-100/50 p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>

                    <div className="flex-1 relative z-10 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-xl p-5 border border-emerald-100/50">
                      <h4 className="text-emerald-800 font-bold mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-emerald-600" /> Highest Package in "{expandedTier}"</h4>
                      <div className="space-y-3">
                        {highestPkg.map((c, idx) => (
                          <div key={idx} onClick={() => navigate("/college-details", { state: { college_code: c.college_code, branch: c.branch, college: c } })} className="flex items-center justify-between bg-white/80 backdrop-blur p-3 rounded-lg border border-emerald-100 hover:border-emerald-300 hover:shadow-sm cursor-pointer transition-all">
                            <div className="min-w-0 pr-4">
                              <p className="text-sm font-bold text-slate-700 truncate">{c.college_name}</p>
                              <p className="text-[10px] text-slate-500 uppercase tracking-wide truncate mt-0.5">{c.branch} • {c.city}</p>
                            </div>
                            <span className="text-emerald-600 font-black text-sm whitespace-nowrap">₹{c.average_package_lpa}L</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 relative z-10 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl p-5 border border-blue-100/50">
                      <h4 className="text-blue-800 font-bold mb-4 flex items-center gap-2"><IndianRupee className="w-5 h-5 text-blue-600" /> Most Affordable in "{expandedTier}"</h4>
                      <div className="space-y-3">
                        {lowestFee.map((c, idx) => (
                          <div key={idx} onClick={() => navigate("/college-details", { state: { college_code: c.college_code, branch: c.branch, college: c } })} className="flex items-center justify-between bg-white/80 backdrop-blur p-3 rounded-lg border border-blue-100 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all">
                            <div className="min-w-0 pr-4">
                              <p className="text-sm font-bold text-slate-700 truncate">{c.college_name}</p>
                              <p className="text-[10px] text-slate-500 uppercase tracking-wide truncate mt-0.5">{c.branch} • {c.city}</p>
                            </div>
                            <span className="text-blue-600 font-black text-sm whitespace-nowrap">₹{((c.fees ?? 0) / 1000).toFixed(0)}K</span>
                          </div>
                        ))}
                        {lowestFee.length === 0 && <p className="text-xs text-slate-400 italic">No fee data available</p>}
                      </div>
                    </div>

                    <button onClick={() => setExpandedTier(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-white shadow-sm border border-slate-200 rounded-full w-8 h-8 flex items-center justify-center z-20">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* ═══════════ SECTION 2: Admission Action Plan & Smart Checklist ═══════════ */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8 overflow-hidden">
              <SectionTitle title="MHT-CET Admission Roadmap" />
              <p className="text-sm text-slate-500 mb-6">Interactive deep-dive roadmap customized for your <span className="font-bold text-slate-700">{profile?.category}</span> profile.</p>

              <div className="space-y-4">
                {[
                  { id: "reg", title: "1. CAP Round Registration", icon: <Calendar className="w-5 h-5 text-indigo-500" />, desc: "Create your central admission portal account.", status: "Upcoming" },
                  { id: "docs", title: "2. Document Verification", icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />, desc: `Requires ${requiredDocuments.length} mandatory documents based on your category.`, status: "Action Required" },
                  { id: "form", title: "3. Option Form Filling", icon: <FileText className="w-5 h-5 text-blue-500" />, desc: "Submit your final college preferences.", status: "Locked" }
                ].map(step => {
                  const isExpanded = expandedAction === step.id;
                  return (
                    <div key={step.id} className={`border rounded-xl transition-all duration-300 ${isExpanded ? 'border-indigo-300 shadow-md bg-indigo-50/20' : 'border-slate-200 hover:border-indigo-200 hover:shadow-sm bg-white'}`}>
                      <div
                        onClick={() => setExpandedAction(isExpanded ? null : step.id)}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isExpanded ? 'bg-white border-indigo-200 shadow-sm' : 'bg-slate-50 border-transparent'}`}>
                            {step.icon}
                          </div>
                          <div>
                            <h4 className={`font-bold transition-colors ${isExpanded ? 'text-indigo-900' : 'text-slate-800'}`}>{step.title}</h4>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">{step.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 self-start sm:self-auto">
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border ${step.status === 'Action Required' ? 'bg-orange-50 text-orange-600 border-orange-200' : step.status === 'Locked' ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>{step.status}</span>
                          {isExpanded ? <ChevronDown className="w-5 h-5 text-indigo-400" /> : <ChevronRight className="w-5 h-5 text-slate-300" />}
                        </div>
                      </div>

                      {/* Deep-Input Panel Content */}
                      <div className={`transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="p-5 border-t border-slate-100 bg-white/50 backdrop-blur">
                          {step.id === 'docs' && (
                            <div className="space-y-4">
                              <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-bold text-emerald-900">Customized Checklist for {profile?.category} Category</p>
                                  <p className="text-xs text-emerald-700 mt-1">Check off the documents as you collect them. The state saves your progress locally.</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {requiredDocuments.map(doc => {
                                  const isReady = readyDocs.includes(doc);
                                  return (
                                    <div
                                      key={doc}
                                      onClick={() => setReadyDocs(p => isReady ? p.filter(d => d !== doc) : [...p, doc])}
                                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${isReady ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                                    >
                                      <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all ${isReady ? 'bg-indigo-500 border-indigo-600 text-white' : 'bg-slate-50 border-slate-300 text-transparent'}`}>
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                      </div>
                                      <span className={`text-sm font-medium transition-colors ${isReady ? 'text-indigo-900' : 'text-slate-700'}`}>{doc}</span>
                                    </div>
                                  )
                                })}
                              </div>

                              <div className="flex justify-end mt-4">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${(readyDocs.length / requiredDocuments.length) * 100}%` }}></div>
                                  </div>
                                  <span className="text-xs font-bold text-slate-500">{readyDocs.length} / {requiredDocuments.length} Ready</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {step.id === 'reg' && (
                            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                              <p className="text-sm text-slate-600">You cannot start registration yet. Keep checking the official State CET Cell website for dates.</p>
                            </div>
                          )}

                          {step.id === 'form' && (
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center">
                              <ShieldCheck className="w-8 h-8 text-slate-300 mb-2" />
                              <p className="text-sm font-bold text-slate-400">Locked Feature</p>
                              <p className="text-xs text-slate-400 mt-1">This feature generates a smart option form. It unlocks after document verification.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>



            {/* ═══════════ SECTION 3: Two-Column — AI Spotlight + Fit Chart ═══════════ */}
            <div className="mb-6">
              {/* AI Spotlight Analysis — Full Width */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <SectionTitle title="AI Spotlight Analysis" action="View Details" onAction={() => spotlightCollege && navigate("/college-details", { state: { college_code: spotlightCollege.college_code, branch: spotlightCollege.branch, college: spotlightCollege } })} />
                {spotlightCollege && (
                  <div className="flex flex-col gap-5">
                    <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden shadow-sm">
                      <MiniCollegeImg code={spotlightCollege.college_code} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 mb-2">
                          {spotlightCollege.probability_level && (() => {
                            const fc = fitColor(spotlightCollege.probability_level!);
                            return <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${fc.bg} ${fc.text}`}>{spotlightCollege.probability_level}</span>;
                          })()}
                        </div>
                        <h3 className="text-white text-xl sm:text-2xl font-bold line-clamp-2">{spotlightCollege.college_name}</h3>
                        <p className="text-white/80 text-sm mt-1">{spotlightCollege.branch} · {spotlightCollege.city}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                          { label: "Admission Chance", value: spotlightCollege.admission_chance_percentage ?? "—" },
                          { label: "Avg Package", value: `₹${spotlightCollege.average_package_lpa ?? 0} LPA` },
                          { label: "Placement Rate", value: `${spotlightCollege.placement_rate ?? 0}%` },
                          { label: "Cutoff Rank", value: spotlightCollege.cutoff_rank ?? "N/A" },
                        ].map(m => (
                          <div key={m.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center sm:text-left">
                            <p className="text-xs text-slate-400 font-semibold uppercase">{m.label}</p>
                            <p className="text-base font-bold text-slate-800 mt-0.5">{m.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100/50">
                        <h4 className="text-sm font-bold text-indigo-900 mb-2">Why this is a great match</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          Based on your profile, {spotlightCollege.college_name} in {spotlightCollege.city} is a strong candidate for your chosen branch of {spotlightCollege.branch}.{' '}
                          {(spotlightCollege.placement_rate ?? 0) > 0
                            ? `It reports a ${spotlightCollege.placement_rate}% placement rate with an avg. package of ₹${spotlightCollege.average_package_lpa} LPA.`
                            : 'Placement data is currently not available for this institution.'
                          }{' '}
                          {spotlightCollege.admission_chance_percentage && spotlightCollege.admission_chance_percentage !== '0%'
                            ? `With your current rank, you have an estimated ${spotlightCollege.admission_chance_percentage} chance of admission.`
                            : 'Contact the college directly for admission eligibility.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ═══════════ SECTION 4: Auto Comparison ═══════════ */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
              <SectionTitle title="Top Colleges — Quick Comparison" action="Full Compare" onAction={() => navigate("/compare-college")} />
              {comparisonColleges.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {["College", "Location", "Chance", "Package", "Placement", "Cutoff", "Fit"].map(h => (
                          <th key={h} className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonColleges.map((c) => {
                        const fc = fitColor(c.probability_level || c.fit || "Stretch");
                        return (
                          <tr key={`${c.college_code}_${c.branch}`} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => navigate("/college-details", { state: { college_code: c.college_code, branch: c.branch, college: c } })}>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"><MiniCollegeImg code={c.college_code} className="w-10 h-10" /></div>
                                <span className="text-sm font-bold text-slate-800 line-clamp-1 max-w-[160px]">{c.college_name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-500">{c.city}{c.district ? `, ${c.district}` : ""}</td>
                            <td className="px-4 py-4 text-sm font-bold text-indigo-600">{c.admission_chance_percentage ?? "—"}</td>
                            <td className="px-4 py-4 text-sm text-slate-700">₹{c.average_package_lpa ?? 0}L</td>
                            <td className="px-4 py-4 text-sm text-slate-700">{c.placement_rate ?? 0}%</td>
                            <td className="px-4 py-4 text-sm text-slate-700">{c.cutoff_rank ?? "N/A"}</td>
                            <td className="px-4 py-4"><span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${fc.bg} ${fc.text}`}>{c.probability_level || c.fit}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : <p className="text-base text-slate-400">Not enough data for comparison.</p>}
            </div>

            {/* ═══════════ SECTION 5: Two-Column — City Heatmap + Branch Stats ═══════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">

              {/* City Breakdown Heatmap */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-hidden">
                <SectionTitle title="Region Wise Distribution" action="Explore All" onAction={() => navigate("/college-explorer")} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {cityDistribution.slice(0, 9).map(([city, count], i) => {
                    const isExpanded = expandedCity === city;

                    return (
                      <div key={city} className="col-span-1">
                        <div
                          onClick={() => setExpandedCity(isExpanded ? null : city)}
                          className={`cursor-pointer group flex flex-col p-4 rounded-xl border transition-all duration-300 ${isExpanded ? 'bg-indigo-600 border-indigo-700 shadow-md transform scale-[1.02]' : 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-white hover:shadow-sm'}`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${isExpanded ? 'bg-white/20 text-white' : i < 3 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                              {i + 1}
                            </div>
                            <span className={`text-xl font-black ${isExpanded ? 'text-white/90' : 'text-slate-300 group-hover:text-indigo-200'}`}>{count}</span>
                          </div>
                          <span className={`text-sm font-bold truncate ${isExpanded ? 'text-white' : 'text-slate-700 group-hover:text-indigo-900'}`}>{city}</span>
                          <span className={`text-xs mt-0.5 ${isExpanded ? 'text-indigo-100' : 'text-slate-400'}`}>{count === 1 ? 'College' : 'Colleges'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Expanded City College List */}
                <div className={`transition-all duration-500 origin-top overflow-hidden ${expandedCity ? 'max-h-[800px] opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}`}>
                  {expandedCity && (
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          Colleges in {expandedCity}
                        </h3>
                        <button onClick={() => setExpandedCity(null)} className="text-xs font-bold text-slate-400 hover:text-slate-700 px-2 py-1 bg-white rounded-md border border-slate-200 shadow-sm">Close</button>
                      </div>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {colleges.filter(c => c.city === expandedCity).map((c, idx) => {
                          const fc = fitColor(c.probability_level || c.fit || "Stretch");
                          return (
                            <div key={idx} onClick={() => navigate("/college-details", { state: { college_code: c.college_code, branch: c.branch, college: c } })} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:shadow-sm cursor-pointer transition-all">
                              <div className="min-w-0 pr-4">
                                <p className="text-sm font-bold text-slate-700 truncate">{c.college_name}</p>
                                <p className="text-xs text-slate-400 truncate mt-0.5">{c.branch}</p>
                              </div>
                              <span className={`text-[10px] whitespace-nowrap font-bold px-2 py-1 rounded-md border ${fc.bg} ${fc.text}`}>
                                {c.probability_level || c.fit}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Branch Performance */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
                <SectionTitle title="Branch-wise Match Rate" action="Explore All" onAction={() => navigate("/college-explorer")} />
                <div className="space-y-4 flex-grow overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
                  {branchStats.slice(0, 10).map((b, i) => {
                    const isExpanded = expandedBranch === b.branch;
                    const branchColleges = colleges.filter(c => c.branch === b.branch).sort((x, y) => (y.admission_chance ?? 0) - (x.admission_chance ?? 0)).slice(0, 3);

                    return (
                      <div key={b.branch} className={`rounded-xl border transition-all duration-300 ${isExpanded ? 'bg-indigo-50/30 border-indigo-200 shadow-sm' : 'border-transparent hover:border-slate-100 hover:bg-slate-50'}`}>
                        <div onClick={() => setExpandedBranch(isExpanded ? null : b.branch)} className="flex items-center gap-4 group p-3 cursor-pointer">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm transition-transform group-hover:scale-110 ${b.avgChance >= 70 ? "bg-emerald-100 text-emerald-700" : b.avgChance >= 50 ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate transition-colors ${isExpanded ? 'text-indigo-800' : 'text-slate-800 group-hover:text-indigo-700'}`}>{b.branch}</p>
                            <p className="text-xs font-semibold text-slate-400 truncate mt-0.5 group-hover:text-slate-500">{b.topCollege}</p>
                          </div>
                          <div className="text-right flex-shrink-0 flex items-center gap-3">
                            <div>
                              <div className="flex items-baseline justify-end gap-1">
                                <span className={`text-base font-black ${b.avgChance >= 70 ? "text-emerald-600" : b.avgChance >= 50 ? "text-blue-600" : "text-orange-500"}`}>{Math.round(b.avgChance)}%</span>
                              </div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">{b.count} Match{b.count !== 1 ? 'es' : ''}</p>
                            </div>
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-indigo-400" /> : <ChevronRight className="w-4 h-4 text-slate-300" />}
                          </div>
                        </div>

                        {/* Deep-Input Panel Content */}
                        <div className={`transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                          <div className="p-4 mx-2 mb-2 bg-white rounded-lg border border-indigo-100 shadow-sm">
                            <h5 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3">Safest Bets for this Branch</h5>
                            <div className="space-y-2">
                              {branchColleges.map((c, idx) => {
                                const fc = fitColor(c.probability_level || c.fit || "Stretch");
                                return (
                                  <div key={idx} onClick={() => navigate("/college-details", { state: { college_code: c.college_code, branch: c.branch, college: c } })} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                                    <div className="min-w-0 pr-3">
                                      <p className="text-sm font-bold text-slate-700 truncate">{c.college_name}</p>
                                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">{c.city}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <span className="text-sm font-black text-indigo-600">{c.admission_chance_percentage}</span>
                                      <span className={`mt-1 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border leading-none ${fc.bg} ${fc.text}`}>{c.probability_level || c.fit}</span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ═══════════ SECTION 5.5: AI Mad-Libs Query Engine ═══════════ */}
            <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl p-6 md:p-10 mb-10 relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg">
                      <Briefcase className="w-6 h-6 text-indigo-300" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-white">AI Strategy Sandbox</h3>
                      <p className="text-slate-400 font-medium text-sm mt-1">Build your exact goal. The AI will find it instantly.</p>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Live Filtering
                    </span>
                  </div>
                </div>

                {/* Mad-libs Interface */}
                <div className="bg-black/20 p-6 md:p-8 rounded-3xl border border-white/5 backdrop-blur-xl mb-10 text-center md:text-left">
                  <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-[2] sm:leading-[2] text-slate-300 tracking-tight">
                    "I am looking for a
                    <select value={mlTier} onChange={(e) => setMlTier(e.target.value)} className="mx-3 inline-block bg-indigo-500 text-white font-bold px-4 py-1.5 rounded-xl border border-indigo-400 shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 cursor-pointer outline-none transition-all appearance-none text-center min-w-[160px] align-baseline">
                      {["Any Tier", "Most Probable", "Best Fit", "Good Fit", "Stretch"].map(t => <option key={t} value={t} className="bg-slate-800 text-white text-lg">{t}</option>)}
                    </select>
                    college in
                    <select value={mlCity} onChange={(e) => setMlCity(e.target.value)} className="mx-3 inline-block bg-rose-500 text-white font-bold px-4 py-1.5 rounded-xl border border-rose-400 shadow-lg shadow-rose-500/20 hover:bg-rose-600 cursor-pointer outline-none transition-all appearance-none text-center min-w-[200px] align-baseline">
                      {mlCities.map(c => <option key={c} value={c} className="bg-slate-800 text-white text-lg">{c}</option>)}
                    </select>
                    <br className="hidden md:block" />
                    for
                    <select value={mlBranch} onChange={(e) => setMlBranch(e.target.value)} className="mx-3 inline-block bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-xl border border-emerald-400 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 cursor-pointer outline-none transition-all appearance-none text-center max-w-[250px] truncate align-baseline">
                      {mlBranches.map(b => <option key={b} value={b} className="bg-slate-800 text-white text-lg">{b}</option>)}
                    </select>
                    with fees
                    <select value={mlFee} onChange={(e) => setMlFee(e.target.value)} className="mx-3 inline-block bg-amber-500 text-white font-bold px-4 py-1.5 rounded-xl border border-amber-400 shadow-lg shadow-amber-500/20 hover:bg-amber-600 cursor-pointer outline-none transition-all appearance-none text-center min-w-[160px] align-baseline">
                      {["Any Fee", "Under ₹50K", "Under ₹1 Lakh", "Under ₹2 Lakhs"].map(f => <option key={f} value={f} className="bg-slate-800 text-white text-lg">{f}</option>)}
                    </select>."
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                      Found {mlResults.length} Exact Matches
                    </h4>
                    <div className="h-px bg-white/10 flex-1" />
                  </div>

                  {mlResults.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <Search className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-lg font-bold text-white mb-2">No perfect matches found.</p>
                      <p className="text-sm text-slate-400">Try adjusting your criteria to find alternative institutions.</p>
                    </div>
                  ) : (
                    <div className="flex gap-5 overflow-x-auto pb-6 pt-2 custom-scrollbar snap-x">
                      {mlResults.map((c, idx) => {
                        const fc = fitColor(c.probability_level || c.fit || "Stretch");
                        return (
                          <div
                            key={idx}
                            onClick={() => navigate("/college-details", { state: { college_code: c.college_code, branch: c.branch, college: c } })}
                            className="snap-start flex-shrink-0 w-80 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/50 rounded-2xl p-6 cursor-pointer transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />

                            <div className="flex justify-between items-start mb-6">
                              <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-lg tracking-widest border bg-black/40 backdrop-blur-md ${fc.text} ${fc.bg.replace('bg-', 'border-')}`}>
                                {c.probability_level || c.fit}
                              </span>
                              <div className="flex flex-col items-end">
                                <span className="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors">{c.admission_chance_percentage}</span>
                                <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Chance</span>
                              </div>
                            </div>

                            <p className="text-lg font-bold text-white line-clamp-2 leading-snug group-hover:text-indigo-200 transition-colors mb-2">
                              {c.college_name}
                            </p>
                            <p className="text-sm text-slate-400 line-clamp-1 mb-6 font-medium">
                              {c.branch}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                              <div className="flex items-center gap-1.5 text-slate-300">
                                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                <p className="text-xs font-bold">{c.city}</p>
                              </div>
                              <p className="text-sm font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-500/20">
                                ₹{((c.fees ?? 0) / 1000).toFixed(0)}K
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ═══════════ SECTION 6: Quick Feature Navigation ═══════════ */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
              <SectionTitle title="Explore Features" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {features.map(f => (
                  <button key={f.title} onClick={() => navigate(f.link)} className="group p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all text-left bg-white hover:bg-indigo-50/30">
                    <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors">
                      <span className="text-sm font-bold text-indigo-700">{f.title.charAt(0)}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mb-0.5">{f.title}</p>
                    <p className="text-xs text-slate-400">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* ═══════════ SECTION 7: Top 6 College Mini-Cards ═══════════ */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
              <SectionTitle title="Top Recommended Colleges" action="See All" onAction={() => navigate("/dashboard")} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {topRecommendedColleges.map(c => {
                  const fc = fitColor(c.probability_level || c.fit || "Stretch");
                  return (
                    <div
                      key={`${c.college_code}_${c.branch}`}
                      className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer bg-slate-50/30 hover:bg-white"
                      onClick={() => navigate("/college-details", { state: { college_code: c.college_code, branch: c.branch, college: c } })}
                    >
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"><MiniCollegeImg code={c.college_code} className="w-14 h-14" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{c.college_name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{c.branch} · {c.city}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-bold text-indigo-600">{c.admission_chance_percentage}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${fc.bg} ${fc.text}`}>{c.probability_level || c.fit}</span>
                        </div>
                      </div>
                      <span className="text-sm text-slate-300 flex-shrink-0">&rsaquo;</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ═══════════ SECTION 8: Fee Range Analysis ═══════════ */}
            {feeAnalysis && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
                <SectionTitle title="Fee Range Analysis" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Summary stats */}
                  <div className="space-y-3">
                    {[
                      { label: "Average Fee", value: `₹${(feeAnalysis.avg / 1000).toFixed(0)}K`, color: "text-indigo-600" },
                      { label: "Lowest Fee", value: `₹${(feeAnalysis.min / 1000).toFixed(0)}K`, color: "text-emerald-600" },
                      { label: "Highest Fee", value: `₹${(feeAnalysis.max / 1000).toFixed(0)}K`, color: "text-orange-600" },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <span className="text-sm text-slate-600 font-medium">{s.label}</span>
                        <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                  {/* Fee ranges bar chart - CLICKABLE ROI SANDBOX */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-600 mb-2">Fee Distribution (Click to view)</p>
                    {feeAnalysis.ranges.map(r => {
                      const isExpanded = expandedFeeTier === r.label;
                      return (
                        <div key={r.label} onClick={() => r.count > 0 && setExpandedFeeTier(isExpanded ? null : r.label)} className={`group cursor-pointer p-2 -mx-2 rounded-lg transition-colors ${r.count > 0 ? 'hover:bg-slate-50' : 'opacity-50 cursor-default'} ${isExpanded ? 'bg-slate-50 ring-1 ring-slate-200' : ''}`}>
                          <div className="flex items-center justify-between mb-1 px-1">
                            <span className={`text-sm font-semibold transition-colors ${isExpanded ? 'text-indigo-600' : 'text-slate-600 group-hover:text-slate-900'}`}>{r.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-700">{r.count}</span>
                              {r.count > 0 && <span className={`text-[10px] uppercase font-bold text-slate-300 transition-opacity ${isExpanded ? 'opacity-100 text-indigo-400' : 'opacity-0 group-hover:opacity-100'}`}>{isExpanded ? 'Selected' : 'View ROI'}</span>}
                            </div>
                          </div>
                          <div className="w-full h-3 mx-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${r.color} rounded-full transition-all duration-500`} style={{ width: `${feeAnalysis.total ? (r.count / feeAnalysis.total) * 100 : 0}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* EXPANDED ROI SANDBOX PANEL */}
                  <div className={`lg:col-span-3 transition-all duration-500 origin-top overflow-hidden ${expandedFeeTier ? 'max-h-[800px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
                    {expandedFeeTier && (() => {
                      let filtered: College[] = [];
                      if (expandedFeeTier === "Under ₹50K") filtered = colleges.filter(c => (c.fees ?? 0) > 0 && (c.fees ?? 0) < 50000);
                      if (expandedFeeTier === "₹50K – 1L") filtered = colleges.filter(c => (c.fees ?? 0) >= 50000 && (c.fees ?? 0) < 100000);
                      if (expandedFeeTier === "₹1L – 2L") filtered = colleges.filter(c => (c.fees ?? 0) >= 100000 && (c.fees ?? 0) < 200000);
                      if (expandedFeeTier === "Above ₹2L") filtered = colleges.filter(c => (c.fees ?? 0) >= 200000);

                      // Sort by best placement rate to act as an ROI calculator
                      const sortedRoi = filtered.sort((a, b) => (b.placement_rate ?? 0) - (a.placement_rate ?? 0));

                      return (
                        <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-200 rounded-xl p-5 relative">
                          <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                            <div>
                              <h4 className="text-slate-800 font-bold text-sm">Best ROI for "{expandedFeeTier}"</h4>
                              <p className="text-xs text-slate-500 mt-0.5">Sorted by highest placement rate</p>
                            </div>
                            <button onClick={() => setExpandedFeeTier(null)} className="text-slate-400 hover:text-slate-700 bg-white shadow-sm border border-slate-200 rounded-full p-1"><X className="w-4 h-4" /></button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {sortedRoi.slice(0, 6).map((c, idx) => (
                              <div key={idx} onClick={() => navigate("/college-details", { state: { college_code: c.college_code, branch: c.branch, college: c } })} className="bg-white p-3 rounded-lg border border-slate-100 hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all">
                                <p className="text-sm font-bold text-slate-800 line-clamp-1">{c.college_name}</p>
                                <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">{c.branch} • {c.city}</p>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                                  <span className="text-xs font-black text-indigo-600">₹{((c.fees ?? 0) / 1000).toFixed(0)}K</span>
                                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{c.placement_rate ?? 0}% Placed</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Most affordable */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Most Affordable Match</p>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"><MiniCollegeImg code={feeAnalysis.cheapest.college_code} className="w-12 h-12" /></div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{feeAnalysis.cheapest.college_name}</p>
                        <p className="text-xs text-slate-500">{feeAnalysis.cheapest.branch} · {feeAnalysis.cheapest.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 font-medium">Annual Fee</span>
                      <span className="text-lg font-bold text-emerald-600">₹{((feeAnalysis.cheapest.fees ?? 0) / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════ SECTION 9: Placement & Package Insights ═══════════ */}
            {placementInsights && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
                {/* Top Packages */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <SectionTitle title="Top Average Packages" />
                  <div className="mb-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between">
                    <span className="text-sm text-indigo-700">Overall Avg Package</span>
                    <span className="text-xl font-bold text-indigo-700">₹{placementInsights.avgPkg} LPA</span>
                  </div>
                  <div className="space-y-3">
                    {placementInsights.topPkg.map((c, i) => (
                      <div key={`${c.college_code}_${c.branch}_pkg`} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors" onClick={() => navigate("/college-details", { state: { college_code: c.college_code, branch: c.branch, college: c } })}>
                        <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-slate-200 text-slate-600" : "bg-orange-100 text-orange-600"}`}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{c.college_name}</p>
                          <p className="text-xs text-slate-400">{c.branch}</p>
                        </div>
                        <span className="text-sm font-bold text-indigo-600">₹{c.average_package_lpa} LPA</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Top Placement Rates */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <SectionTitle title="Top Placement Rates" />
                  <div className="mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <span className="text-sm text-emerald-700">Overall Avg Placement</span>
                    <span className="text-xl font-bold text-emerald-700">{placementInsights.avgPlacement}%</span>
                  </div>
                  <div className="space-y-3">
                    {placementInsights.topPlacement.map((c, i) => (
                      <div key={`${c.college_code}_${c.branch}_pl`} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors" onClick={() => navigate("/college-details", { state: { college_code: c.college_code, branch: c.branch, college: c } })}>
                        <span className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold ${i === 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{c.college_name}</p>
                          <p className="text-xs text-slate-400">{c.branch}</p>
                        </div>
                        <span className="text-sm font-bold text-emerald-600">{c.placement_rate}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════ SECTION 10: Infrastructure Overview ═══════════ */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
              <SectionTitle title="Infrastructure Overview" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{infraStats.hostelYes}</p>
                  <p className="text-sm text-slate-600 font-medium mt-1">Hostel Available</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-2xl font-bold text-slate-700">{infraStats.hostelNo}</p>
                  <p className="text-sm text-slate-500 font-medium mt-1">No Hostel</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-2xl font-bold text-indigo-600">{infraStats.autonomous}</p>
                  <p className="text-sm text-slate-600 font-medium mt-1">Autonomous</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-2xl font-bold text-slate-700">{infraStats.affiliated}</p>
                  <p className="text-sm text-slate-500 font-medium mt-1">Affiliated</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══════════ CAP Round Countdown ═══════════ */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 md:p-10 mb-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest mb-4 backdrop-blur-md border border-white/10">
                <Calendar className="w-3.5 h-3.5" /> DSE Admission 2025
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">CAP Option Form Filling</h2>
              <p className="text-indigo-100 font-semibold max-w-md">The window for Round 1 option form submission is approaching. Keep your preferences ready.</p>
            </div>
            <div className="flex gap-3 md:gap-4 flex-shrink-0">
              {[{ label: "Days", val: "12" }, { label: "Hours", val: "08" }, { label: "Mins", val: "45" }].map((t, i) => (
                <div key={i} className="bg-black/20 backdrop-blur-md rounded-2xl p-4 md:p-5 min-w-[70px] md:min-w-[90px] text-center border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                  <div className="text-3xl md:text-4xl font-black tabular-nums tracking-tight">{t.val}</div>
                  <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mt-1 md:mt-2">{t.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════ Profile Summary Bar ═══════════ */}
        {/* ═══════════ Overall Live Intelligence Feed ═══════════ */}
        <div className="bg-slate-900 rounded-[2.5rem] p-6 lg:p-10 mb-10 overflow-hidden relative shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-slate-800">
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-3">
                  <Globe className="w-full h-full text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    Intelligence Feed
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <p className="text-slate-400 font-medium text-xs uppercase tracking-widest">Live Updates & Alerts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {newsLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className={`bg-white/5 border border-white/10 rounded-3xl animate-pulse ${i === 0 ? "md:col-span-2 min-h-[300px]" : "min-h-[200px]"}`} />
                ))
              ) : (
                (newsItems || []).map((news: any, i: number) => {
                  const isFeatured = i === 0;

                  // Icon picking logic based on type
                  let TypeIcon = Bell;
                  if (news.type === 'URGENT') TypeIcon = AlertCircle;
                  if (news.type === 'ACADEMIC') TypeIcon = BookOpen;
                  if (news.type === 'SCHOLARSHIP') TypeIcon = Award;

                  return (
                    <div
                      key={i}
                      onClick={() => window.open(news.url, '_blank')}
                      className={`relative overflow-hidden group cursor-pointer transition-all duration-500 hover:-translate-y-1 ${isFeatured
                          ? "md:col-span-2 md:row-span-2 bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border-indigo-500/30"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                        } border rounded-3xl p-6 lg:p-8 flex flex-col justify-between`}
                    >
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${news.type === 'URGENT'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : isFeatured
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                            <TypeIcon className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              {news.type}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-900/50 px-2 py-1 rounded-md">{news.date}</span>
                        </div>

                        <div className="mt-auto">
                          <h4 className={`font-black text-white mb-3 leading-snug group-hover:text-indigo-200 transition-colors ${isFeatured ? "text-2xl md:text-3xl lg:text-4xl" : "text-lg md:text-xl line-clamp-3"
                            }`}>
                            {news.title}
                          </h4>

                          {isFeatured && (
                            <p className="text-slate-400 font-medium text-sm md:text-base leading-relaxed mb-6 line-clamp-2 md:line-clamp-3">
                              {news.desc}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-5 border-t border-white/10 mt-auto">
                            <span className="text-xs font-bold text-slate-400">via <span className="text-slate-300">{news.source}</span></span>
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                              <ArrowUpRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* AI Summary note */}
            <div className="mt-6 flex justify-start">
              <div className="inline-flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-5 py-3 text-indigo-200">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold">AI Generated feed based on live state data. Always verify critical deadlines via official portals.</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
