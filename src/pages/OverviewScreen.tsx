import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface College {
  college_code: string;
  college_name: string;
  city: string;
  district?: string;
  branch: string;
  branch_name?: string;
  branch_code?: string;
  fees?: number;
  placement_rate?: number;
  cutoff_rank?: number;
  cutoff_percentile?: number;
  category?: string;
  average_package_lpa?: number;
  highest_package_lpa?: number;
  total_intake?: number;
  seats?: number;
  autonomy_status?: string;
  hostel_available?: string;
  image?: string;
  probability_level?: string;
  is_most_probable?: boolean;
  admission_chance?: number;
  admission_chance_percentage?: string;
  fit?: string;
  fit_reason?: string;
  match_score?: number;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  state?: string;
  city?: string;
  category?: string;
  exam_type?: string;
  cet_rank?: string;
  cet_score?: string;
  diploma_rank?: string;
  diploma_score?: string;
  preferred_branches?: string[];
  profile_complete?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCollegeImage = (code: string) =>
  code ? `/src/assets/${code}/campus.png` : "/src/assets/fallback-campus.jpg";

const FALLBACK_IMGS = [
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
];

const fitColor = (fit: string) => {
  if (fit === "Most Probable") return { bg: "bg-purple-50 border-purple-200", text: "text-purple-700", bar: "bg-purple-500" };
  if (fit === "Best Fit") return { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", bar: "bg-emerald-500" };
  if (fit === "Good Fit") return { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", bar: "bg-blue-500" };
  return { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", bar: "bg-orange-500" };
};

const CITY_COORDS: Record<string, [number, number]> = {
  "Mumbai": [19.08, 72.88], "Pune": [18.52, 73.86], "Nagpur": [21.15, 79.09],
  "Nashik": [19.99, 73.79], "Aurangabad": [19.88, 75.34], "Kolhapur": [16.71, 74.24],
  "Solapur": [17.68, 75.91], "Amravati": [20.93, 77.78], "Nanded": [19.16, 77.31],
  "Sangli": [16.85, 74.56], "Ratnagiri": [16.99, 73.31], "Latur": [18.40, 76.57],
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
  const [src, setSrc] = useState(getCollegeImage(code));

  useEffect(() => {
    setSrc(getCollegeImage(code));
  }, [code]);

  return (
    <img
      src={src}
      alt=""
      className={`object-cover ${className}`}
      onError={() => setSrc(FALLBACK_IMGS[Math.floor(Math.random() * FALLBACK_IMGS.length)])}
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
    if (!profile?.preferred_branches?.length) return;
    (async () => {
      setPredictionsLoading(true);
      try {
        const score = profile.exam_type === "CET" ? parseFloat(profile.cet_score || "0") : parseFloat(profile.diploma_score || "0");
        const rank = profile.exam_type === "CET" ? parseFloat(profile.cet_rank || "0") : parseFloat(profile.diploma_rank || "0");
        const res = await axios.post("http://127.0.0.1:5001/predict_admission",
          { score, rank, category: profile.category, branches: profile.preferred_branches },
          { timeout: 30000 }
        );
        if (res.data?.colleges?.length) {
          setColleges(res.data.colleges.map((c: any) => ({
            ...c,
            image: getCollegeImage(c.college_code),
            probability_level: c.is_most_probable ? "Most Probable" : c.fit ?? "Unknown",
            admission_chance_percentage: c.admission_chance_percentage ?? `${Math.round(c.admission_chance ?? 0)}%`,
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
    return { mostProbable: mp.length, bestFit: bf.length, goodFit: gf.length, stretch: st.length, total: colleges.length, unique: new Set(colleges.map(c => c.college_code)).size };
  }, [colleges]);



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
      const b = c.branch;
      const prev = map.get(b);
      if (!prev) map.set(b, { count: 1, avgChance: c.admission_chance ?? 0, topCollege: c.college_name });
      else {
        prev.count++;
        prev.avgChance = ((prev.avgChance * (prev.count - 1)) + (c.admission_chance ?? 0)) / prev.count;
        if ((c.admission_chance ?? 0) > prev.avgChance) prev.topCollege = c.college_name;
      }
    });
    return Array.from(map.entries()).map(([b, d]) => ({ branch: b, ...d })).sort((a, b) => b.avgChance - a.avgChance);
  }, [colleges]);

  // Quick nav features
  const features = [
    { title: "AI Search", desc: "Smart college finder", color: "from-indigo-500 to-blue-500", link: "/college-explorer" },
    { title: "Compare", desc: "Side-by-side analysis", color: "from-purple-500 to-pink-500", link: "/compare-college" },
    { title: "Interactive Map", desc: "Geographic explorer", color: "from-emerald-500 to-teal-500", link: "/college-map" },
    { title: "Dashboard", desc: "Full predictions", color: "from-orange-500 to-red-500", link: "/dashboard" },
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
    const autonomous = colleges.filter(c => c.autonomy_status?.toLowerCase().includes("autonomous")).length;
    const affiliated = colleges.filter(c => c.autonomy_status?.toLowerCase().includes("affiliated") || (!c.autonomy_status?.toLowerCase().includes("autonomous") && c.autonomy_status)).length;
    return { hostelYes, hostelNo: colleges.length - hostelYes, autonomous, affiliated, total: colleges.length };
  }, [colleges]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <Navbar activeTab="overview" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="relative w-14 h-14"><div className="absolute inset-0 rounded-full border-4 border-indigo-100" /><div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" /></div>
          <p className="text-slate-500 font-medium text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
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
            <button onClick={() => navigate("/profile")} className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 transition shadow-md flex items-center gap-2">
              Update Profile
            </button>
          </div>
        </div>

        {/* ═══════════ Profile Summary Bar ═══════════ */}
        {profile && (
          <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl border border-indigo-200/50 p-5 mb-8 shadow-sm">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="font-bold text-indigo-900 text-base">{profile.name}</span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-semibold">{profile.exam_type}</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg font-semibold">{profile.category}</span>
              <span className="text-slate-500">
                Score: <span className="font-bold text-slate-700">{profile.exam_type === "CET" ? profile.cet_score : profile.diploma_score}</span>
                {" · "}
                Rank: <span className="font-bold text-slate-700">{profile.exam_type === "CET" ? profile.cet_rank : profile.diploma_rank}</span>
              </span>
              <div className="flex gap-1.5 ml-auto flex-wrap">
                {(profile.preferred_branches ?? []).slice(0, 5).map(b => (
                  <span key={b} className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-700 rounded-lg font-semibold text-xs">{b}</span>
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
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center"><div className="w-3 h-3 bg-white rounded-full animate-pulse" /></div>
              <div><p className="text-sm font-semibold text-indigo-900">AI Engine Running</p><p className="text-xs text-indigo-600">Analysing {profile?.preferred_branches?.length ?? 0} branches across 340+ colleges...</p></div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-100" />)}</div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white rounded-2xl animate-pulse border border-slate-100" />)}</div>
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
                { label: "Most Probable", count: stats.mostProbable, sub: "Near-exact", gradient: "from-purple-500 to-pink-500" },
                { label: "Best Fit", count: stats.bestFit, sub: "High chance", gradient: "from-emerald-500 to-teal-500" },
                { label: "Good Fit", count: stats.goodFit, sub: "Solid match", gradient: "from-blue-500 to-cyan-500" },
                { label: "Stretch", count: stats.stretch, sub: "Backup", gradient: "from-orange-500 to-red-500" },
                { label: "Total Matches", count: stats.total, sub: `${stats.unique} colleges`, gradient: "from-slate-700 to-slate-900" },
              ].map(s => (
                <div key={s.label} className={`bg-gradient-to-br ${s.gradient} rounded-2xl p-5 text-white shadow-md hover:-translate-y-0.5 transition-transform cursor-default`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl font-bold">{s.count}</span>
                  </div>
                  <p className="text-base font-semibold text-white/95">{s.label}</p>
                  <p className="text-xs text-white/70 mt-0.5">{s.sub}</p>
                </div>
              ))}
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
                          Based on your profile, {spotlightCollege.college_name} in {spotlightCollege.city} is an excellent candidate for your chosen branch of {spotlightCollege.branch}. It offers a strong placement rate of {spotlightCollege.placement_rate}% and an average package of ₹{spotlightCollege.average_package_lpa} LPA. With your current academic performance, you have a solid {spotlightCollege.admission_chance_percentage} chance of admission, making this a highly recommended option for your career goals.
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
                        {["College", "Branch", "City", "Chance", "Package", "Placement", "Cutoff", "Fit"].map(h => (
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
                                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"><MiniCollegeImg code={c.college_code} className="w-10 h-10" /></div>
                                <span className="text-sm font-bold text-slate-800 line-clamp-1 max-w-[160px]">{c.college_name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-600">{c.branch}</td>
                            <td className="px-4 py-4 text-sm text-slate-500">{c.city}</td>
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

              {/* City Heatmap */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <SectionTitle title="City Distribution Heatmap" action="Open Map" onAction={() => navigate("/college-map")} />
                <div className="space-y-3">
                  {cityDistribution.slice(0, 10).map(([city, count], i) => {
                    const maxCount = cityDistribution[0]?.[1] ?? 1;
                    const pct = Math.round((count / maxCount) * 100);
                    const coords = CITY_COORDS[city];
                    return (
                      <div key={city} className="flex items-center gap-3">
                        <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold ${i < 3 ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>{i + 1}</span>
                        <span className="text-sm font-semibold text-slate-700 w-28 truncate">{city}</span>
                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${i < 3 ? "bg-indigo-500" : i < 6 ? "bg-blue-400" : "bg-slate-300"}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-bold text-slate-600 w-10 text-right">{count}</span>
                        {coords && <span className="text-xs text-slate-300">{coords[0].toFixed(1)}°N</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Branch Performance */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <SectionTitle title="Branch-wise Performance" action="Explore" onAction={() => navigate("/college-explorer")} />
                <div className="space-y-3">
                  {branchStats.slice(0, 8).map((b, i) => (
                    <div key={b.branch} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${b.avgChance >= 70 ? "bg-emerald-100 text-emerald-700" : b.avgChance >= 50 ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{b.branch}</p>
                        <p className="text-xs text-slate-400 truncate">{b.topCollege}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-slate-800">{Math.round(b.avgChance)}%</p>
                        <p className="text-xs text-slate-400">{b.count} entries</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ═══════════ SECTION 6: Quick Feature Navigation ═══════════ */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
              <SectionTitle title="Explore Features" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {features.map(f => (
                  <button key={f.title} onClick={() => navigate(f.link)} className="group p-5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all text-left bg-slate-50/50 hover:bg-white">
                    <div className={`w-11 h-11 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-3 shadow-sm group-hover:shadow-md transition-shadow`}>
                      <span className="text-sm font-bold text-white">{f.title.charAt(0)}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 mb-1">{f.title}</p>
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
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"><MiniCollegeImg code={c.college_code} className="w-14 h-14" /></div>
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
                  {/* Fee ranges bar chart */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-600 mb-2">Fee Distribution</p>
                    {feeAnalysis.ranges.map(r => (
                      <div key={r.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-600">{r.label}</span>
                          <span className="text-sm font-bold text-slate-700">{r.count}</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${r.color} rounded-full transition-all duration-500`} style={{ width: `${feeAnalysis.total ? (r.count / feeAnalysis.total) * 100 : 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Most affordable */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100">
                    <p className="text-sm font-bold text-emerald-800 mb-3">Most Affordable Match</p>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"><MiniCollegeImg code={feeAnalysis.cheapest.college_code} className="w-12 h-12" /></div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{feeAnalysis.cheapest.college_name}</p>
                        <p className="text-xs text-slate-500">{feeAnalysis.cheapest.branch} · {feeAnalysis.cheapest.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-emerald-700 font-medium">Annual Fee</span>
                      <span className="text-lg font-bold text-emerald-700">₹{((feeAnalysis.cheapest.fees ?? 0) / 1000).toFixed(0)}K</span>
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
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
              <SectionTitle title="Infrastructure Overview" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                  <p className="text-2xl font-bold text-emerald-700">{infraStats.hostelYes}</p>
                  <p className="text-sm text-emerald-600 font-medium mt-1">Hostel Available</p>
                </div>
                <div className="p-5 bg-orange-50 rounded-xl border border-orange-100 text-center">
                  <p className="text-2xl font-bold text-orange-700">{infraStats.hostelNo}</p>
                  <p className="text-sm text-orange-600 font-medium mt-1">No Hostel</p>
                </div>
                <div className="p-5 bg-purple-50 rounded-xl border border-purple-100 text-center">
                  <p className="text-2xl font-bold text-purple-700">{infraStats.autonomous}</p>
                  <p className="text-sm text-purple-600 font-medium mt-1">Autonomous</p>
                </div>
                <div className="p-5 bg-blue-50 rounded-xl border border-blue-100 text-center">
                  <p className="text-2xl font-bold text-blue-700">{infraStats.affiliated}</p>
                  <p className="text-sm text-blue-600 font-medium mt-1">Affiliated</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
