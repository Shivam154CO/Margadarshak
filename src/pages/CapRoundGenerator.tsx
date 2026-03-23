import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FileText, Download, AlertCircle,
    Shield, Target, Zap, Briefcase, Layers, X, PlusCircle
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ML_API_URL = import.meta.env.VITE_ML_API_URL ?? 'http://127.0.0.1:5001';

interface CollegeResult {
    college_code: string;
    college_name: string;
    city: string;
    branch: string;
    branch_code: string;
    cutoff_rank: number;
    cutoff_percentile: number;
    placement_rate: number;
    Fees: number;
    admission_chance: number;
    probability_level: string;
    match_score: number;
    category: string;
}

interface FormResults {
    dream: CollegeResult[];
    best_fit: CollegeResult[];
    safe: CollegeResult[];
}

export default function CapRoundGenerator() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [userProfile, setUserProfile] = useState<any>(null);

    const [preferences, setPreferences] = useState({
        rank: "",
        score: "",
        category: "OPEN",
        branches: [] as string[],
        applicationId: "",
        candidatureType: "",
        homeUniversity: "",
        gender: "",
        ewsStatus: "",
        pwdType: "",
        defenceType: "",
        religiousMinority: "",
        linguisticMinority: "",
        diplomaCourseGroup: ""
    });

    const [results, setResults] = useState<FormResults | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !session) {
                    navigate("/login", { replace: true });
                    return;
                }

                const { data, error } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                if (error || !data) {
                    console.error("Error fetching user profile from supabase:", error);
                    return;
                }

                setUserProfile(data);
                const rank = data.cet_rank || data.cetRank || data.diploma_rank || data.diplomaRank || data.rank;
                const score = data.cet_score || data.cetScore || data.diploma_score || data.diplomaScore || data.score;
                setPreferences({
                    rank: rank !== undefined && rank !== null ? String(rank) : "",
                    score: score !== undefined && score !== null ? String(score) : "",
                    category: data.category || "OPEN",
                    branches: data.preferred_branches || data.preferredBranches || [],
                    applicationId: data.application_id || data.applicationId || "",
                    candidatureType: data.candidature_type || data.candidatureType || "",
                    homeUniversity: data.home_university || data.homeUniversity || "",
                    gender: data.gender || "",
                    ewsStatus: data.ews_status || data.ewsStatus || "No",
                    pwdType: data.pwd_type || data.pwdType || "N.A.",
                    defenceType: data.defence_type || data.defenceType || "N.A.",
                    religiousMinority: data.religious_minority || data.religiousMinority || "N.A.",
                    linguisticMinority: data.linguistic_minority || data.linguisticMinority || "N.A.",
                    diplomaCourseGroup: data.diploma_course_group || data.diplomaCourseGroup || ""
                });
            } catch (err) {
                console.error("Error in fetchUserProfile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                navigate("/login", { replace: true });
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const isFormalInfoIncomplete = !preferences.applicationId || !preferences.candidatureType || !preferences.homeUniversity || !preferences.gender || !preferences.diplomaCourseGroup;

    const handleGenerate = async () => {
        if (!preferences.rank || !preferences.score || !preferences.branches || preferences.branches.length === 0) {
            setError("Error: Ensure Merit Rank, Score, and Preferred Branches are set in your profile.");
            return;
        }

        if (isFormalInfoIncomplete) {
            setError("Error: Complete all Formal Information (Student ID, etc.) in your profile to proceed.");
            return;
        }

        try {
            setGenerating(true);
            setError(null);

            const payload = {
                rank: parseInt(preferences.rank),
                score: parseFloat(preferences.score),
                category: preferences.category,
                branches: preferences.branches
            };

            const response = await axios.post(`${ML_API_URL}/generate_cap_form`, payload);

            if (response.data && response.data.form) {
                setResults(response.data.form);
            } else {
                setError("Error: Failed to generate form. Please check API connection.");
            }

        } catch (err: any) {
            console.error("Prediction API Error:", err);
            setError("Error: " + (err.response?.data?.error || "Unable to reach server. Ensure Python ML API is running."));
        } finally {
            setGenerating(false);
        }
    };

    const [showPreview, setShowPreview] = useState(false);
    const [loadingBranches, setLoadingBranches] = useState<string | null>(null);
    const [branchSelector, setBranchSelector] = useState<{
        college: CollegeResult;
        available: CollegeResult[];
        category: keyof FormResults;
    } | null>(null);

    const handleAddBranch = async (college: CollegeResult, targetCategory: keyof FormResults) => {
        try {
            setLoadingBranches(college.college_code);
            
            // Map user category to DB category (e.g., OPEN -> GOPEN)
            const map: Record<string, string> = {
                "OPEN": "GOPEN",
                "OBC": "GOBC",
                "SC": "GSC",
                "ST": "GST",
                "VJ/DT": "GVJ",
                "NT-A": "GVJ",
                "NT-1": "GNT1",
                "NT-2": "GNT2",
                "NT-3": "GNT3",
                "EWS": "EWS"
            };
            const dbCategory = map[preferences.category] || preferences.category;

            const { data, error } = await supabase
                .from('colleges_2025')
                .select('*')
                .eq('college_code', college.college_code)
                .eq('category', dbCategory); // Added category filter

            if (error || !data) throw error || new Error("No data found");

            const currentChoiceCodes = new Set([
                ...results?.dream.map(c => c.college_code + c.branch_code) || [],
                ...results?.best_fit.map(c => c.college_code + c.branch_code) || [],
                ...results?.safe.map(c => c.college_code + c.branch_code) || []
            ]);

            const userPreferredBranches = preferences.branches.map(b => b.toLowerCase());
            const userRank = parseInt(preferences.rank) || 999999;
            
            const options = data.filter((item: any) => {
                const bName = (item.branch_name || item.Branch_name || "").toLowerCase();
                const isPreferred = userPreferredBranches.some(pref => bName.includes(pref) || pref.includes(bName));
                const notAlreadyAdded = !currentChoiceCodes.has(String(item.college_code) + String(item.branch_code));
                return isPreferred && notAlreadyAdded;
            }).map((item: any) => {
                const cutoff = item.cutoff_rank || item.Cutoff_rank || 0;
                
                // Purely local calculation for manual additions
                let chance = 0;
                if (userRank <= cutoff) {
                    chance = Math.min(99, 85 + ((cutoff - userRank) / cutoff) * 15);
                } else {
                    chance = Math.max(5, 75 - ((userRank - cutoff) / cutoff) * 50);
                }

                let status = "Target";
                if (chance >= 85) status = "Safe";
                else if (chance < 65) status = "Dream";

                return {
                    college_code: String(item.college_code || item.College_code),
                    college_name: item.college_name || item.College_name,
                    city: item.city || item.City,
                    branch: item.branch_name || item.Branch_name,
                    branch_code: String(item.branch_code || item.Branch_code),
                    cutoff_rank: cutoff,
                    cutoff_percentile: item.cutoff_percentile || 0,
                    placement_rate: item.placement_rate || 0,
                    Fees: item.fees || item.Fees || 0,
                    admission_chance: Math.round(chance),
                    probability_level: status, // Visual tag based on chance
                    match_score: Math.round(chance),
                    category: item.category || "GOPEN"
                };
            });

            if (options.length === 0) {
                alert(`No other preferred branches found for your category (${dbCategory}) that aren't already in the list.`);
                return;
            }

            setBranchSelector({ college, available: options, category: targetCategory });

        } catch (err) {
            console.error("Error fetching branches:", err);
            alert("Unable to find category-specific branches for this college.");
        } finally {
            setLoadingBranches(null);
        }
    };

    const generatePDF = (shouldDownload: boolean = true) => {
        if (!results) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Headers
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("GOVERNMENT OF MAHARASHTRA", pageWidth / 2, 20, { align: "center" });
        doc.setFontSize(16);
        doc.text("State Common Entrance Test Cell", pageWidth / 2, 30, { align: "center" });
        
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        doc.setFontSize(12);
        doc.text("Provisional Option Form for Direct Second Year Engineering (2025-26)", pageWidth / 2, 45, { align: "center" });

        // Candidate Details
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        let y = 60;
        const details = [
            ["Application ID:", preferences.applicationId || "N/A", "Merit Rank:", preferences.rank || "N/A"],
            ["Candidate Name:", userProfile?.name?.toUpperCase() || "---", "Category:", preferences.category || "OPEN"],
            ["Home University:", preferences.homeUniversity || "N/A", "EWS Status:", preferences.ewsStatus || "No"]
        ];

        details.forEach(row => {
            doc.setFont("helvetica", "bold");
            doc.text(row[0], 25, y);
            doc.setFont("helvetica", "normal");
            doc.text(row[1], 60, y);
            doc.setFont("helvetica", "bold");
            doc.text(row[2], 120, y);
            doc.setFont("helvetica", "normal");
            doc.text(row[3], 155, y);
            y += 10;
        });

        const allChoices = [
            ...results.dream.map((c: CollegeResult) => [c.college_code, c.college_name, c.branch, "Strategic (Dream)"]),
            ...results.best_fit.map((c: CollegeResult) => [c.college_code, c.college_name, c.branch, "Recommended"]),
            ...results.safe.map((c: CollegeResult) => [c.college_code, c.college_name, c.branch, "Backup"])
        ];

        autoTable(doc, {
            startY: y + 10,
            head: [['Code', 'Institution Name', 'Course Name', 'List Type']],
            body: allChoices,
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 8, font: 'helvetica' },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 80 },
                2: { cellWidth: 35 },
                3: { cellWidth: 30 }
            }
        });

        if (shouldDownload) {
            doc.save(`CAP_Option_Form_${preferences.applicationId || 'Preview'}.pdf`);
        }
    };

    const BranchSelectorModal = () => (
        <AnimatePresence>
            {branchSelector && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setBranchSelector(null)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900">Add Available Branch</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{branchSelector.college.college_name}</p>
                            </div>
                            <button onClick={() => setBranchSelector(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        
                        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
                            {branchSelector.available.map((b, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setResults(prev => {
                                            if (!prev) return prev;
                                            return {
                                                ...prev,
                                                [branchSelector.category]: [...prev[branchSelector.category], b]
                                            };
                                        });
                                        setBranchSelector(null);
                                    }}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-white hover:shadow-md border border-slate-100 hover:border-indigo-200 rounded-xl transition-all group"
                                >
                                    <div className="text-left flex-1 min-w-0 pr-4">
                                        <div className="text-sm font-bold text-slate-900 truncate">{b.branch}</div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Choice: {b.college_code}{b.branch_code}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                                b.probability_level === 'Safe' ? 'bg-emerald-100 text-emerald-700' : 
                                                b.probability_level === 'Dream' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                                            }`}>
                                                {b.probability_level}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-4">
                                        <div className="hidden sm:block">
                                            <div className="text-[9px] text-slate-400 font-bold uppercase">Chance</div>
                                            <div className="text-lg font-black text-slate-900 leading-none">{b.admission_chance}%</div>
                                        </div>
                                        <div className="p-2 bg-slate-200 group-hover:bg-indigo-600 rounded-lg group-hover:rotate-90 transition-all">
                                            <PlusCircle className="w-5 h-5 text-slate-500 group-hover:text-white" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    const PreviewModal = () => (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowPreview(false)}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                />
                
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Official Form Preview</h3>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Provisional CAP Strategy Document</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => generatePDF(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-bold transition-colors"
                            >
                                <Download className="w-4 h-4" /> Download
                            </button>
                            <button 
                                onClick={() => setShowPreview(false)}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 overflow-y-auto bg-slate-100 p-8 flex justify-center">
                        <div className="bg-white w-full max-w-[750px] shadow-sm p-10 font-sans border border-slate-200">
                             {/* Mock Document Header */}
                             <div className="text-center border-b-2 border-slate-900 pb-4 mb-8">
                                <h2 className="text-xs font-bold uppercase tracking-tight text-slate-400">Government of Maharashtra</h2>
                                <h3 className="text-lg font-black uppercase mt-1">State Common Entrance Test Cell</h3>
                                <div className="mt-4 bg-slate-900 text-white py-1 px-4 inline-block text-[10px] font-black uppercase tracking-widest">Provisional Option Form 2025-26</div>
                             </div>

                             {/* Candidate Info */}
                             <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8 text-xs font-medium bg-slate-50 p-6 rounded-xl border border-slate-100">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Application ID</span>
                                    <span className="font-bold text-slate-900">{preferences.applicationId}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Total Merit Rank</span>
                                    <span className="font-bold text-slate-900">{preferences.rank}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Candidate Name</span>
                                    <span className="font-bold text-slate-900">{userProfile?.name?.toUpperCase()}</span>
                                </div>
                             </div>

                             {/* Table */}
                             <div className="overflow-hidden rounded-lg border border-slate-200">
                                <table className="w-full border-collapse text-[10px] text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-widest text-[9px]">
                                        <tr>
                                            <th className="border-b border-r border-slate-200 p-3 text-center w-12">PREF</th>
                                            <th className="border-b border-r border-slate-200 p-3 w-28">CODE</th>
                                            <th className="border-b border-slate-200 p-3">INSTITUTION & BRANCH</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {[...(results?.dream || []), ...(results?.best_fit || []), ...(results?.safe || [])].slice(0, 50).map((c, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50">
                                                <td className="border-r border-slate-200 p-3 text-center font-bold text-slate-400">{i + 1}</td>
                                                <td className="border-r border-slate-200 p-3 font-mono font-bold text-slate-600">{c.college_code}</td>
                                                <td className="p-3">
                                                    <div className="font-bold text-slate-900">{c.college_name}</div>
                                                    <div className="text-[9px] mt-1 text-slate-500 flex items-center gap-1 font-semibold uppercase">
                                                        <Briefcase className="w-2.5 h-2.5" /> {c.branch}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>

                             <div className="mt-12 pt-8 flex justify-between text-[9px] border-t border-slate-200 font-bold uppercase text-slate-400 tracking-widest">
                                 <p>Signature of Candidate</p>
                                 <p>Date: {new Date().toLocaleDateString()}</p>
                             </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );

    const renderCollegeList = (title: string, colleges: CollegeResult[]) => {
        if (!colleges || colleges.length === 0) return null;

        const isDream = title.toLowerCase().includes('dream');
        const isSafe = title.toLowerCase().includes('safe');
        const listKey = isDream ? 'dream' : isSafe ? 'safe' : 'best_fit';
        
        const cfg = isDream 
            ? { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Zap, label: "High Strategy (Dream)" }
            : isSafe 
            ? { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: Shield, label: "Safety Pick (Backup)" }
            : { color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200", icon: Target, label: "Major Probability (Target)" };

        const IconComp = cfg.icon;

        return (
            <div className="relative pl-12 sm:pl-16 mb-6">
                <div className={`absolute left-0 top-6 w-3 h-3 rounded-full border-2 bg-white ${
                    isDream ? "border-amber-500" : isSafe ? "border-emerald-500" : "border-indigo-500"
                }`} />

                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <IconComp className={`w-4 h-4 ${cfg.color}`} />
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                {cfg.label}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                                {colleges.length} OPTIONS
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-10 text-center">NO.</th>
                                    <th className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-24">CODE</th>
                                    <th className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">INSTITUTE</th>
                                    <th className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {colleges.map((college, idx) => (
                                    <tr key={idx} className="group">
                                        <td className="px-2 py-3 text-center text-xs text-slate-300 font-bold">{idx + 1}</td>
                                        <td className="px-2 py-3 font-mono text-[10px] text-slate-500 font-bold">{college.college_code}</td>
                                        <td className="px-2 py-3">
                                            <div className="font-bold text-slate-800 text-sm leading-tight">{college.college_name}</div>
                                            <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{college.branch}</div>
                                        </td>
                                        <td className="px-2 py-3 text-right">
                                            <button 
                                                onClick={() => handleAddBranch(college, listKey)}
                                                disabled={loadingBranches === college.college_code}
                                                className={`text-[9px] font-black uppercase tracking-widest border px-2 py-1 rounded transition-all flex items-center gap-1 ml-auto ${
                                                    loadingBranches === college.college_code 
                                                    ? 'bg-slate-100 text-slate-400 border-slate-200' 
                                                    : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
                                                }`}
                                            >
                                                {loadingBranches === college.college_code ? (
                                                    <div className="w-2.5 h-2.5 border border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                                                ) : (
                                                    <Layers className="w-3 h-3" />
                                                )}
                                                Add Branch
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 text-slate-400 font-bold uppercase text-xs tracking-[0.3em]">System Initializing...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar activeTab="cap-generator" userProfile={userProfile} />

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Clean Header exactly like Timeline */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Smart Option Form</h1>
                    <p className="text-sm text-slate-500 mt-1">AI-driven allotment projection engine for direct second year engineering</p>
                </div>

                {/* Stats Section exactly like Timeline */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                    {[
                        { label: "Application ID", value: preferences.applicationId?.slice(-6) || "---", color: "border-l-slate-400" },
                        { label: "Merit Rank", value: preferences.rank || "---", color: "border-l-blue-500" },
                        { label: "Category", value: preferences.category || "---", color: "border-l-indigo-500" },
                        { label: "Status", value: results ? "Generated" : "Pending", color: "border-l-emerald-500" },
                    ].map(s => (
                        <div key={s.label} className={`bg-white rounded-xl border border-slate-200 border-l-4 ${s.color} p-4 shadow-sm`}>
                            <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                            <div className="text-xs font-semibold text-slate-500 mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>

                {isFormalInfoIncomplete && (
                    <div className="mb-8 bg-white rounded-xl border border-slate-200 border-l-4 border-l-amber-500 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Action Required</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Profile Data Missing</h3>
                        <p className="text-slate-500 text-sm">Please complete your formal details in profile to enable the allotment engine.</p>
                    </div>
                )}

                {/* Main Action Banner matches Timeline 'Next Up' style */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 bg-white rounded-xl border border-slate-200 border-l-4 border-l-indigo-500 p-6 shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Allotment Simulator</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Generate Strategy</h3>
                    <p className="text-slate-500 text-sm mb-6">Process your profile against current seat vacancy and historical trends.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleGenerate}
                            disabled={generating || isFormalInfoIncomplete}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm disabled:opacity-50 transition-colors shadow-sm"
                        >
                            {generating ? "Computing Results..." : "Run Engine"}
                        </button>
                        
                        {results && (
                            <button
                                onClick={() => setShowPreview(true)}
                                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
                            >
                                Preview Official Document
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="mt-4 text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-2">
                             <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}
                </motion.div>

                {/* Result Timeline matches Timeline structure */}
                {results && (
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-8">
                             <h2 className="text-xl font-bold text-slate-900">Strategic Projections</h2>
                             <button 
                                onClick={() => generatePDF(true)}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                             >
                                Export PDF
                             </button>
                        </div>

                        <div className="relative">
                            <div className="absolute left-1 sm:left-1.5 top-0 bottom-0 w-0.5 bg-slate-200" />
                            <div className="space-y-4">
                                {renderCollegeList("Dream List", results.dream)}
                                {renderCollegeList("Target List", results.best_fit)}
                                {results && renderCollegeList("Safety Pick (Backup)", results.safe)}
                            </div>
                        </div>
                    </div>
                )}

                {showPreview && <PreviewModal />}
                <BranchSelectorModal />
            </main>
            <Footer />
        </div>
    );
}
