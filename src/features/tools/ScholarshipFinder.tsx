import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import {
    Search, ExternalLink, ChevronDown, ChevronUp,
    CheckCircle, FileText, Calendar, Info
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Scholarship {
    id: string;
    name: string;
    provider: string;
    amount: string;
    amountValue: number;
    type: "merit" | "income" | "category" | "special";
    eligibleCategories: string[];
    incomeLimit?: string;
    incomeLimitValue?: number;
    meritCriteria?: string;
    description: string;
    benefits: string[];
    requiredDocuments: string[];
    applicationDeadline: string;
    applicationLink?: string;
    renewalPolicy?: string;
    tips?: string;
    coverage: "tuition" | "full" | "partial" | "stipend";
    popular: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SCHOLARSHIPS: Scholarship[] = [
    {
        id: "rajarshishahu",
        name: "Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulk Shishyavrutti",
        provider: "Govt. of Maharashtra – Social Justice Dept.",
        amount: "Full Tuition Fee Waiver",
        amountValue: 100000,
        type: "category",
        eligibleCategories: ["OBC", "SBC", "VJ/DT-NT(A)", "NT(B)", "NT(C)", "NT(D)"],
        incomeLimit: "₹8,00,000/year",
        incomeLimitValue: 800000,
        description: "Complete tuition fee exemption for backward class students pursuing professional courses in Maharashtra.",
        benefits: ["Full tuition fee waiver", "Exam fee reimbursement", "Applicable at govt. and aided colleges"],
        requiredDocuments: ["Caste Certificate", "Non-Creamy Layer Certificate", "Income Certificate", "Aadhaar Card", "Bank Passbook", "Admission Receipt"],
        applicationDeadline: "September 2026",
        applicationLink: "https://mahadbtmahait.gov.in",
        renewalPolicy: "Auto-renewed if student passes all subjects",
        tips: "Apply on MahaDBT portal within 60 days of admission. Keep all original documents ready.",
        coverage: "tuition",
        popular: true,
    },
    {
        id: "postmatric-sc",
        name: "Post-Matric Scholarship for SC Students",
        provider: "Ministry of Social Justice, Govt. of India",
        amount: "Up to ₹1,30,000/year",
        amountValue: 130000,
        type: "category",
        eligibleCategories: ["SC"],
        incomeLimit: "₹2,50,000/year",
        incomeLimitValue: 250000,
        description: "Central government scholarship for SC students covering maintenance allowance and non-refundable fees.",
        benefits: ["₹550/month hostellers, ₹230/month day scholars", "Non-refundable fee reimbursement", "Book allowance"],
        requiredDocuments: ["Caste Certificate", "Income Certificate", "Marksheet", "Aadhaar Card", "Bank Account", "College Bonafide"],
        applicationDeadline: "October 2026",
        applicationLink: "https://scholarships.gov.in",
        renewalPolicy: "Annual renewal based on academic performance",
        tips: "Apply on National Scholarship Portal. Verify Aadhaar-bank linking beforehand.",
        coverage: "full",
        popular: true,
    },
    {
        id: "postmatric-st",
        name: "Post-Matric Scholarship for ST Students",
        provider: "Ministry of Tribal Affairs, Govt. of India",
        amount: "Up to ₹1,30,000/year",
        amountValue: 130000,
        type: "category",
        eligibleCategories: ["ST"],
        incomeLimit: "₹2,50,000/year",
        incomeLimitValue: 250000,
        description: "Scholarship for ST students covering tuition, maintenance, and academic expenses.",
        benefits: ["Full tuition fee waiver", "Monthly stipend for hostellers", "Book bank facility", "Study tour grants"],
        requiredDocuments: ["Tribe Certificate", "Income Certificate", "Previous marksheet", "Aadhaar Card", "Bank Account"],
        applicationDeadline: "October 2026",
        applicationLink: "https://scholarships.gov.in",
        coverage: "full",
        popular: true,
    },
    {
        id: "ews-freeship",
        name: "EBC / EWS Fee Concession",
        provider: "DTE Maharashtra",
        amount: "50% – 100% Fee Concession",
        amountValue: 60000,
        type: "income",
        eligibleCategories: ["OPEN", "OBC", "SC", "ST", "EWS", "SBC", "VJ/DT-NT(A)", "NT(B)", "NT(C)", "NT(D)"],
        incomeLimit: "₹8,00,000/year",
        incomeLimitValue: 800000,
        description: "Fee concession for Economically Backward Class students. Open to all categories based on family income.",
        benefits: ["50% fee concession (income ₹4.5L–₹8L)", "Full freeship (income < ₹4.5L, OPEN)", "Govt. & aided colleges"],
        requiredDocuments: ["Income Certificate from Tahsildar", "Aadhaar Card", "Bank Passbook", "Fee receipt", "Bonafide Certificate"],
        applicationDeadline: "August 2026",
        applicationLink: "https://mahadbtmahait.gov.in",
        tips: "Income certificate must be for current FY. Get it early from Tahsildar office.",
        coverage: "partial",
        popular: true,
    },
    {
        id: "merit-aicte",
        name: "AICTE Pragati Scholarship (for Girls)",
        provider: "AICTE, Govt. of India",
        amount: "₹50,000/year",
        amountValue: 50000,
        type: "merit",
        eligibleCategories: ["OPEN", "OBC", "SC", "ST", "EWS", "SBC", "VJ/DT-NT(A)", "NT(B)", "NT(C)", "NT(D)"],
        incomeLimit: "₹8,00,000/year",
        incomeLimitValue: 800000,
        meritCriteria: "Female students in AICTE-approved colleges",
        description: "Encourages girls to pursue technical education. Covers tuition and incidental charges.",
        benefits: ["₹30,000 tuition fee waiver", "₹20,000 for books, laptop, equipment", "Up to 2 girls per family eligible"],
        requiredDocuments: ["12th / Diploma Marksheet", "Aadhaar Card", "Income Certificate", "Admission Proof", "Bank Account"],
        applicationDeadline: "November 2026",
        applicationLink: "https://www.aicte-india.org/schemes/students-development-schemes/Pragati",
        renewalPolicy: "Renewed annually if student passes all subjects",
        tips: "Limited seats — apply early. Preference given to first-generation learners.",
        coverage: "partial",
        popular: false,
    },
    {
        id: "merit-saksham",
        name: "AICTE Saksham Scholarship (Differently Abled)",
        provider: "AICTE, Govt. of India",
        amount: "₹50,000/year",
        amountValue: 50000,
        type: "special",
        eligibleCategories: ["OPEN", "OBC", "SC", "ST", "EWS", "SBC", "VJ/DT-NT(A)", "NT(B)", "NT(C)", "NT(D)"],
        incomeLimit: "₹8,00,000/year",
        incomeLimitValue: 800000,
        description: "For differently-abled students (40%+ disability) pursuing technical education.",
        benefits: ["₹30,000 tuition fee", "₹20,000 for books/equipment", "Assistive devices support"],
        requiredDocuments: ["Disability Certificate (40%+)", "Income Certificate", "Aadhaar", "Admission proof", "Bank details"],
        applicationDeadline: "November 2026",
        applicationLink: "https://www.aicte-india.org/schemes/students-development-schemes/Saksham",
        coverage: "partial",
        popular: false,
    },
    {
        id: "merit-cum-means",
        name: "Central Sector Scheme of Scholarships (CSSS)",
        provider: "Ministry of Education, Govt. of India",
        amount: "₹20,000–₹25,000/year",
        amountValue: 20000,
        type: "merit",
        eligibleCategories: ["OPEN", "OBC", "SC", "ST", "EWS", "SBC", "VJ/DT-NT(A)", "NT(B)", "NT(C)", "NT(D)"],
        incomeLimit: "₹4,50,000/year",
        incomeLimitValue: 450000,
        meritCriteria: "Top 20th percentile in 12th / Diploma",
        description: "Merit-based scholarship for students from economically weaker families who scored in the top 20th percentile.",
        benefits: ["₹20,000/year for 3 years", "₹25,000 in final year", "No bond or service requirement"],
        requiredDocuments: ["12th / Diploma Marksheet", "Income Certificate", "Aadhaar", "Bank Account", "College Bonafide"],
        applicationDeadline: "December 2026",
        applicationLink: "https://scholarships.gov.in",
        tips: "Very competitive. Must score in top 20% of board/university exam.",
        coverage: "stipend",
        popular: false,
    },
    {
        id: "moma-minority",
        name: "Post-Matric Scholarship for Minority Communities",
        provider: "Ministry of Minority Affairs, Govt. of India",
        amount: "Up to ₹1,25,000/year",
        amountValue: 125000,
        type: "category",
        eligibleCategories: ["OPEN"],
        incomeLimit: "₹2,00,000/year",
        incomeLimitValue: 200000,
        description: "For students belonging to notified minority communities — Muslim, Christian, Sikh, Buddhist, Jain, Parsi.",
        benefits: ["Course fee reimbursement up to ₹25,000", "Maintenance allowance", "Book allowance"],
        requiredDocuments: ["Minority Community Certificate", "Income Certificate", "Marksheet", "Aadhaar", "Bank Account"],
        applicationDeadline: "October 2026",
        applicationLink: "https://scholarships.gov.in",
        tips: "Minority certificate can be a self-declaration attested by college principal.",
        coverage: "partial",
        popular: false,
    },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScholarshipFinder() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);

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

    const userCategory = profile?.category || "OPEN";

    const eligible = useMemo(() => {
        return SCHOLARSHIPS.filter(s =>
            s.eligibleCategories.includes(userCategory) ||
            s.eligibleCategories.includes("OPEN")
        );
    }, [userCategory]);

    const filtered = useMemo(() => {
        return eligible.filter(s => {
            if (typeFilter !== "all" && s.type !== typeFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                if (!s.name.toLowerCase().includes(q) && !s.provider.toLowerCase().includes(q)) return false;
            }
            return true;
        });
    }, [eligible, typeFilter, search]);

    const typeStats = useMemo(() => ({
        merit: eligible.filter(s => s.type === "merit").length,
        income: eligible.filter(s => s.type === "income").length,
        category: eligible.filter(s => s.type === "category").length,
        special: eligible.filter(s => s.type === "special").length,
    }), [eligible]);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar activeTab="scholarships" userProfile={profile} />

            <div className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header — same style as Dashboard */}
                <div className="mb-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                        Scholarships & Fee Concessions
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {eligible.length} scholarships available for <span className="font-semibold text-slate-700">{userCategory}</span> category
                    </p>
                </div>

                {/* Quick Stats — border-l-4 style like Dashboard */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-slate-200 border-l-4 border-l-purple-500 rounded-xl p-4 shadow-sm">
                        <div className="text-2xl font-bold text-slate-800">{eligible.length}</div>
                        <p className="text-sm font-medium text-slate-700 mt-1">Total Eligible</p>
                        <p className="text-xs text-slate-400 mt-0.5">Based on your category</p>
                    </div>
                    <div className="bg-white border border-slate-200 border-l-4 border-l-emerald-500 rounded-xl p-4 shadow-sm">
                        <div className="text-2xl font-bold text-slate-800">{typeStats.category}</div>
                        <p className="text-sm font-medium text-slate-700 mt-1">Category-Based</p>
                        <p className="text-xs text-slate-400 mt-0.5">SC/ST/OBC/EWS etc.</p>
                    </div>
                    <div className="bg-white border border-slate-200 border-l-4 border-l-blue-500 rounded-xl p-4 shadow-sm">
                        <div className="text-2xl font-bold text-slate-800">{typeStats.merit}</div>
                        <p className="text-sm font-medium text-slate-700 mt-1">Merit-Based</p>
                        <p className="text-xs text-slate-400 mt-0.5">Percentile / rank</p>
                    </div>
                    <div className="bg-white border border-slate-200 border-l-4 border-l-orange-400 rounded-xl p-4 shadow-sm">
                        <div className="text-2xl font-bold text-slate-800">{typeStats.income + typeStats.special}</div>
                        <p className="text-sm font-medium text-slate-700 mt-1">Income / Special</p>
                        <p className="text-xs text-slate-400 mt-0.5">EWS, PWD, etc.</p>
                    </div>
                </div>

                {/* Filter Buttons — same pill style as Dashboard */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: "all", label: `All (${eligible.length})` },
                            { id: "category", label: `Category (${typeStats.category})` },
                            { id: "merit", label: `Merit (${typeStats.merit})` },
                            { id: "income", label: `Income (${typeStats.income})` },
                            { id: "special", label: `Special (${typeStats.special})` },
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setTypeFilter(f.id)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${typeFilter === f.id
                                        ? "bg-slate-800 text-white shadow-sm"
                                        : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search */}
                <div className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search scholarships by name or provider..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2.5 w-full bg-white border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm hover:shadow-md"
                        />
                    </div>
                </div>

                {/* Results summary */}
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Showing {filtered.length} scholarship{filtered.length !== 1 ? "s" : ""}
                    </h3>
                </div>

                {/* Scholarship Cards — white card with border, like Dashboard college cards */}
                <div className="space-y-4">
                    <AnimatePresence>
                        {filtered.map((s, idx) => {
                            const isExpanded = expandedId === s.id;

                            return (
                                <motion.div
                                    key={s.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(idx * 0.04, 0.3) }}
                                    className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    {/* Card Header — clickable */}
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : s.id)}
                                        className="w-full text-left p-5 hover:bg-slate-50/50 transition-colors"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                {/* Tags row */}
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${s.type === "category" ? "bg-purple-50 text-purple-700 border-purple-200"
                                                            : s.type === "merit" ? "bg-blue-50 text-blue-700 border-blue-200"
                                                                : s.type === "income" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                    : "bg-orange-50 text-orange-700 border-orange-200"
                                                        }`}>
                                                        {s.type === "category" ? "Category" : s.type === "merit" ? "Merit" : s.type === "income" ? "Income" : "Special"}
                                                    </span>
                                                    {s.popular && (
                                                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                                                            Popular
                                                        </span>
                                                    )}
                                                    {s.incomeLimit && (
                                                        <span className="text-xs text-slate-400">
                                                            Income ≤ {s.incomeLimit}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Name */}
                                                <h4 className="font-semibold text-slate-900 text-base leading-snug line-clamp-2">{s.name}</h4>
                                                <p className="text-xs text-slate-500 mt-1">{s.provider}</p>
                                                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{s.description}</p>
                                            </div>

                                            {/* Right — amount + chevron */}
                                            <div className="flex items-center gap-3 flex-shrink-0 sm:text-right">
                                                <div>
                                                    <div className="text-base font-bold text-slate-800">{s.amount}</div>
                                                    <div className="text-xs text-slate-400 flex items-center gap-1 sm:justify-end mt-0.5">
                                                        <Calendar className="w-3 h-3" />
                                                        {s.applicationDeadline}
                                                    </div>
                                                </div>
                                                {isExpanded
                                                    ? <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                                    : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                                }
                                            </div>
                                        </div>
                                    </button>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                                                    {/* Benefits */}
                                                    <div>
                                                        <h5 className="text-sm font-semibold text-slate-800 mb-2">Benefits</h5>
                                                        <ul className="space-y-1.5">
                                                            {s.benefits.map((b, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                                    {b}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    {/* Required Documents */}
                                                    <div>
                                                        <h5 className="text-sm font-semibold text-slate-800 mb-2">Required Documents</h5>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {s.requiredDocuments.map((doc, i) => (
                                                                <span key={i} className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
                                                                    {doc}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Renewal + Merit Criteria */}
                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                        {s.renewalPolicy && (
                                                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex-1">
                                                                <span className="text-xs font-semibold text-slate-500 block mb-1">Renewal</span>
                                                                <span className="text-sm text-slate-700">{s.renewalPolicy}</span>
                                                            </div>
                                                        )}
                                                        {s.meritCriteria && (
                                                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex-1">
                                                                <span className="text-xs font-semibold text-slate-500 block mb-1">Eligibility</span>
                                                                <span className="text-sm text-slate-700">{s.meritCriteria}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Tip */}
                                                    {s.tips && (
                                                        <div className="flex items-start gap-2 bg-blue-50/60 rounded-lg p-3 border border-blue-100">
                                                            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                                            <span className="text-sm text-blue-800">{s.tips}</span>
                                                        </div>
                                                    )}

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-3 pt-1">
                                                        {s.applicationLink && (
                                                            <a
                                                                href={s.applicationLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm inline-flex items-center gap-1.5 text-sm"
                                                            >
                                                                <ExternalLink className="w-4 h-4" /> Apply Now
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={() => navigate("/documents")}
                                                            className="px-4 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors text-sm inline-flex items-center gap-1.5"
                                                        >
                                                            <FileText className="w-4 h-4" /> Check Documents
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-16 bg-white/50 rounded-xl border-2 border-dashed border-gray-300/50 shadow-sm">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="text-xl font-semibold text-gray-900 mb-2">No scholarships found</h4>
                        <p className="text-gray-600 max-w-md mx-auto">
                            Try adjusting your filters or search query.
                        </p>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
