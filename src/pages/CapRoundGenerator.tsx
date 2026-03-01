import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import axios from "axios";
import {
    FileText, Sparkles, Download, Settings, ChevronRight,
    MapPin, AlertCircle, CheckCircle, Target, TrendingUp,
    Brain, Zap, ShieldCheck, Printer, FileDown
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
        branches: [] as string[]
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
                    branches: data.preferred_branches || data.preferredBranches || []
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

    const handleGenerate = async () => {
        if (!preferences.rank || !preferences.score || !preferences.branches || preferences.branches.length === 0) {
            setError("Please ensure your Rank, Score, and Preferred Branches are set in your profile.");
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

            const response = await axios.post("http://127.0.0.1:5001/generate_cap_form", payload);

            if (response.data && response.data.form) {
                setResults(response.data.form);
            } else {
                setError("Failed to generate form. Unexpected API response.");
            }

        } catch (err: any) {
            console.error("Prediction API Error:", err);
            setError(err.response?.data?.error || "Failed to communicate with prediction server.");
        } finally {
            setGenerating(false);
        }
    };

    const exportToPDF = () => {
        if (!results) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFillColor(79, 70, 229); // Indigo 600
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("Smart CAP Round Option Form", 14, 25);

        // Profile Info
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(11);
        doc.text(`Generated for: ${userProfile?.name || "Student"}`, 14, 50);
        doc.text(`Category: ${preferences.category}`, 14, 57);
        doc.text(`Rank: ${preferences.rank} | Score: ${preferences.score}%`, 14, 64);

        let currentY = 75;

        const addSection = (title: string, data: CollegeResult[], colorTheme: [number, number, number]) => {
            if (data.length === 0) return;

            doc.setFontSize(14);
            doc.setTextColor(colorTheme[0], colorTheme[1], colorTheme[2]);
            doc.text(title, 14, currentY);
            currentY += 8;

            const tableData = data.map((c, i) => [
                (i + 1).toString(),
                c.college_code || "N/A",
                c.college_name,
                c.branch,
                `${Math.round(c.admission_chance)}%`,
                c.cutoff_percentile > 0 ? `${c.cutoff_percentile.toFixed(2)}%` : c.cutoff_rank.toString()
            ]);

            autoTable(doc, {
                startY: currentY,
                head: [['#', 'Inst. Code', 'Institute Name', 'Branch', 'Admission Chance', 'Prev. Cutoff']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: colorTheme, textColor: 255 },
                styles: { fontSize: 8, cellPadding: 2 },
                columnStyles: {
                    0: { cellWidth: 10 },
                    1: { cellWidth: 20 },
                    2: { cellWidth: 80 },
                    3: { cellWidth: 40 },
                    4: { cellWidth: 20, halign: 'center' },
                    5: { cellWidth: 20, halign: 'right' }
                }
            });

            currentY = (doc as any).lastAutoTable.finalY + 15;
        };

        // Add Sections
        addSection("Dream / Ambitious Choices (Stretch)", results.dream, [245, 158, 11]); // Amber
        addSection("Best Fit / Probable Choices (Target)", results.best_fit, [16, 185, 129]); // Emerald
        addSection("Safe / Backup Choices (Guaranteed)", results.safe, [59, 130, 246]); // Blue

        doc.save(`CAP_Option_Form_${preferences.rank}.pdf`);
    };

    const renderCollegeList = (title: string, colleges: CollegeResult[], type: 'dream' | 'fit' | 'safe') => {
        if (!colleges || colleges.length === 0) return null;

        const styles = {
            dream: { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-800', iconBg: 'bg-amber-100', iconText: 'text-amber-600', icon: TrendingUp },
            fit: { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-800', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', icon: Target },
            safe: { border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-800', iconBg: 'bg-blue-100', iconText: 'text-blue-600', icon: ShieldCheck }
        };
        const s = styles[type];
        const Icon = s.icon;

        return (
            <div className={`mb-8 rounded-2xl border ${s.border} overflow-hidden bg-white shadow-sm`}>
                <div className={`px-6 py-4 flex items-center gap-3 ${s.bg} border-b ${s.border}`}>
                    <div className={`p-2 rounded-xl ${s.iconBg} ${s.iconText}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className={`text-xl font-bold ${s.text}`}>{title}</h3>
                        <p className={`text-sm opacity-80 ${s.text}`}>{colleges.length} options recommended</p>
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    {colleges.map((college, idx) => (
                        <div key={`${college.college_code}-${college.branch}-${idx}`} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm flex-shrink-0">
                                    {idx + 1}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{college.college_code}</span>
                                        <h4 className="font-bold text-gray-900 line-clamp-1">{college.college_name}</h4>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {college.city}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1 font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{college.branch}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-6 sm:pl-12 w-full sm:w-auto mt-4 sm:mt-0">
                                <div className="text-center w-1/3 sm:w-auto">
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Your Score</div>
                                    <div className="font-bold text-gray-900">{preferences.score}%</div>
                                </div>
                                <div className="text-center w-1/3 sm:w-auto border-l border-gray-200 pl-4 sm:pl-6">
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Prev. Cutoff</div>
                                    <div className="font-bold text-gray-900">
                                        {college.cutoff_percentile > 0 ? `${college.cutoff_percentile.toFixed(2)}%` : college.cutoff_rank}
                                    </div>
                                </div>
                                <div className="text-center w-1/3 sm:w-auto border-l border-gray-200 pl-4 sm:pl-6">
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Chance</div>
                                    <div className={`font-black ${s.iconText}`}>{Math.round(college.admission_chance)}%</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar activeTab="cap-generator" userProfile={userProfile} />

            {/* Hero Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                            <Brain className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">One-Click CAP Form Generator</h1>
                            <p className="text-lg text-gray-600 mt-1">AI-counseled, mathematically optimized college option lists.</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

                {/* Profile Warning if incomplete */}
                {(!preferences.rank || !preferences.branches || preferences.branches.length === 0) && (
                    <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-bold text-amber-800">Incomplete Profile</h3>
                            <p className="text-sm text-amber-700 mt-1">Please update your Rank and Preferred Branches in your profile to generate accurate CAP round forms.</p>
                        </div>
                    </div>
                )}

                {/* Generate Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
                    <div className="p-6 sm:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready for Admission?</h2>
                                <p className="text-gray-600 mb-6">
                                    Our AI algorithm uses historical cutoffs and prediction models to create the perfect option form structure:
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                        20% Dream Colleges (Ambitious stretch)
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        60% Best Fit Colleges (Highly probable)
                                    </li>
                                    <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                        20% Safe Colleges (Guaranteed backups)
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Your Parameters</h3>
                                    <button onClick={() => navigate("/profile")} className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1">
                                        <Settings className="w-4 h-4" /> Edit Profile
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="text-xs text-gray-500 mb-1">Rank</div>
                                        <div className="font-bold text-gray-900">{preferences.rank || "Not Set"}</div>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="text-xs text-gray-500 mb-1">Category</div>
                                        <div className="font-bold text-gray-900">{preferences.category || "OPEN"}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={generating || !preferences.rank || !preferences.branches || preferences.branches.length === 0}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {generating ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Generating AI Strategy...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                                            Generate My Option Form
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Section */}
                <AnimatePresence>
                    {results && !generating && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Your Optimized CAP Form</h2>
                                <div className="flex gap-3">
                                    <button
                                        onClick={exportToPDF}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-md"
                                    >
                                        <FileDown className="w-4 h-4" /> Export PDF
                                    </button>
                                    <button
                                        onClick={() => window.print()}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                                    >
                                        <Printer className="w-4 h-4" /> Print
                                    </button>
                                </div>
                            </div>

                            {renderCollegeList("Dream / Ambitious Choices", results.dream, 'dream')}
                            {renderCollegeList("Best Fit / Probable Choices", results.best_fit, 'fit')}
                            {renderCollegeList("Safe / Backup Choices", results.safe, 'safe')}

                        </motion.div>
                    )}
                </AnimatePresence>

            </main>

            <Footer />
        </div>
    );
}
