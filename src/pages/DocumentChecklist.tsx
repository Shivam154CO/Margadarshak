import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useQuery } from "@tanstack/react-query";
import {
    FileText, CheckCircle2, Circle, AlertTriangle,
    ChevronDown, ChevronUp, Info, Printer, Shield
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface Document {
    id: string;
    name: string;
    description: string;
    required: boolean;
    category: string;
    applicableTo?: string[];
    tips?: string;
    copies: number;
}

const ALL_DOCUMENTS: Document[] = [
    // Core Documents
    { id: "ssc-marksheet", name: "SSC Marksheet (10th)", description: "Original SSC/10th standard marksheet from your board", required: true, category: "Academic", copies: 3, tips: "If lost, apply for duplicate at your board office — takes 15-20 days" },
    { id: "hsc-marksheet", name: "HSC / Diploma Marksheet (12th)", description: "Latest semester marksheet or final year result", required: true, category: "Academic", copies: 3, tips: "Provisional certificate is accepted if final result is pending" },
    { id: "diploma-certificate", name: "Diploma Certificate / Passing Certificate", description: "Proof of completing your diploma course", required: true, category: "Academic", copies: 3 },
    { id: "score-card", name: "CET / Diploma Entrance Score Card", description: "Official score card from DTE Maharashtra", required: true, category: "Academic", copies: 3, tips: "Download from DTE portal — print on A4 paper" },
    { id: "transfer-cert", name: "Transfer Certificate (TC)", description: "Transfer certificate from your previous institution", required: true, category: "Academic", copies: 2, tips: "Collect this before leaving your current college/school" },
    { id: "migration-cert", name: "Migration Certificate", description: "Required if transferring between universities", required: true, category: "Academic", copies: 2, tips: "Apply at your current university — takes 7-15 days" },
    { id: "gap-cert", name: "Gap Certificate / Affidavit", description: "Notarized affidavit if there's a gap in education", required: false, category: "Academic", applicableTo: ["gap-year"], copies: 2, tips: "Get notarized affidavit from a lawyer — costs ₹100-200" },

    // Identity Documents
    { id: "aadhaar", name: "Aadhaar Card", description: "For identity verification and address proof", required: true, category: "Identity", copies: 3 },
    { id: "pan-card", name: "PAN Card (Student or Parent)", description: "Required for fee payment and financial documentation", required: false, category: "Identity", copies: 2 },
    { id: "domicile", name: "Domicile Certificate", description: "Proof of Maharashtra domicile for state quota seats", required: true, category: "Identity", copies: 3, tips: "Apply at Tahsildar office — takes 7-15 days" },
    { id: "nationality", name: "Nationality Certificate / Birth Certificate", description: "Proof of Indian nationality", required: true, category: "Identity", copies: 2 },
    { id: "passport-photo", name: "Passport-Size Photographs", description: "Recent photographs with white background", required: true, category: "Identity", copies: 8, tips: "Get 20 copies — you'll need them everywhere. White background, formal attire." },

    // Category Documents
    { id: "caste-cert", name: "Caste Certificate", description: "Issued by Tahsildar for reserved category students", required: false, category: "Category", applicableTo: ["SC", "ST", "OBC", "VJ/DT-NT(A)", "NT(B)", "NT(C)", "NT(D)", "SBC"], copies: 3, tips: "Must be issued in student's name, not parent's" },
    { id: "caste-validity", name: "Caste Validity Certificate", description: "Verification of caste certificate by Caste Scrutiny Committee", required: false, category: "Category", applicableTo: ["SC", "ST", "OBC", "VJ/DT-NT(A)", "NT(B)", "NT(C)", "NT(D)", "SBC"], copies: 2, tips: "Apply at Caste Verification Committee — can take 30-60 days, apply early!" },
    { id: "non-creamy", name: "Non-Creamy Layer Certificate", description: "Annual income certificate proving family income is below threshold", required: false, category: "Category", applicableTo: ["OBC", "VJ/DT-NT(A)", "NT(B)", "NT(C)", "NT(D)", "SBC", "EWS"], copies: 3, tips: "Valid for 3 years. Get from Tahsildar office." },
    { id: "ews-cert", name: "EWS Certificate", description: "Economically Weaker Section certificate for EWS quota", required: false, category: "Category", applicableTo: ["EWS"], copies: 3, tips: "Family annual income must be below ₹8 lakh" },
    { id: "income-cert", name: "Income Certificate", description: "Family income proof for fee concession / scholarships", required: false, category: "Category", copies: 3, tips: "Required for freeship and scholarship. Get from Tahsildar." },

    // Additional
    { id: "leaving-cert", name: "School/College Leaving Certificate", description: "Proof of character and conduct from previous institution", required: true, category: "Additional", copies: 2 },
    { id: "anti-ragging", name: "Anti-Ragging Affidavit", description: "Online affidavit from the AICTE anti-ragging portal", required: true, category: "Additional", copies: 2, tips: "Fill at antiragging.in — submit both student and parent affidavits" },
    { id: "medical-fitness", name: "Medical Fitness Certificate", description: "From a registered medical practitioner", required: false, category: "Additional", copies: 2, tips: "Some colleges require this at reporting. Get from any MBBS doctor." },
];

export default function DocumentChecklist() {
    const [checked, setChecked] = useState<Record<string, boolean>>({});
    const [expandedCategory, setExpandedCategory] = useState<string | null>("Academic");

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

    // Load saved state from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("ikigai-doc-checklist");
            if (saved) setChecked(JSON.parse(saved));
        } catch { }
    }, []);

    // Save state
    useEffect(() => {
        localStorage.setItem("ikigai-doc-checklist", JSON.stringify(checked));
    }, [checked]);

    const userCategory = profile?.category || "OPEN";

    const relevantDocs = useMemo(() => {
        return ALL_DOCUMENTS.filter(doc => {
            if (!doc.applicableTo) return true;
            return doc.applicableTo.includes(userCategory) || doc.applicableTo.includes("gap-year");
        });
    }, [userCategory]);

    const categories = useMemo(() => {
        const cats: Record<string, Document[]> = {};
        relevantDocs.forEach(doc => {
            if (!cats[doc.category]) cats[doc.category] = [];
            cats[doc.category].push(doc);
        });
        return cats;
    }, [relevantDocs]);

    const toggle = (id: string) => {
        setChecked(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const totalRelevant = relevantDocs.length;
    const totalChecked = relevantDocs.filter(d => checked[d.id]).length;
    const totalRequired = relevantDocs.filter(d => d.required).length;
    const requiredChecked = relevantDocs.filter(d => d.required && checked[d.id]).length;
    const progress = totalRelevant > 0 ? Math.round((totalChecked / totalRelevant) * 100) : 0;
    const requiredProgress = totalRequired > 0 ? Math.round((requiredChecked / totalRequired) * 100) : 0;

    const missingRequired = relevantDocs.filter(d => d.required && !checked[d.id]);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar activeTab="documents" userProfile={profile} />
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Document Checklist</h1>
                    <p className="text-sm text-slate-500 mt-1">Track every document needed for your admission</p>
                </div>

                {/* Progress Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {/* Overall Progress */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-slate-600">Overall Progress</span>
                            <span className="text-sm font-bold text-slate-800">{totalChecked}/{totalRelevant}</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                            <motion.div
                                className="h-full bg-indigo-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        </div>
                        <span className="text-2xl font-black text-slate-800">{progress}%</span>
                    </div>

                    {/* Required Documents */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-slate-600">Required Docs</span>
                            <span className="text-sm font-bold text-slate-800">{requiredChecked}/{totalRequired}</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                            <motion.div
                                className={`h-full rounded-full ${requiredProgress === 100 ? "bg-emerald-500" : "bg-amber-500"}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${requiredProgress}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        </div>
                        <span className={`text-2xl font-black ${requiredProgress === 100 ? "text-emerald-600" : "text-amber-600"}`}>{requiredProgress}%</span>
                    </div>

                    {/* Category */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-semibold text-slate-600">Your Category</span>
                        </div>
                        <div className="text-2xl font-black text-indigo-600 mb-1">{userCategory}</div>
                        <p className="text-xs text-slate-400">Documents filtered for your category</p>
                    </div>
                </div>

                {/* Missing Required Alert */}
                {missingRequired.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-bold text-amber-800 mb-1">
                                {missingRequired.length} Required Document{missingRequired.length > 1 ? "s" : ""} Missing
                            </h3>
                            <p className="text-xs text-amber-700">
                                {missingRequired.slice(0, 3).map(d => d.name).join(", ")}
                                {missingRequired.length > 3 ? ` and ${missingRequired.length - 3} more...` : ""}
                            </p>
                        </div>
                    </div>
                )}

                {/* Print Button */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <Printer className="w-4 h-4" /> Print Checklist
                    </button>
                </div>

                {/* Document Groups */}
                <div className="space-y-4">
                    {Object.entries(categories).map(([category, docs]) => {
                        const catChecked = docs.filter(d => checked[d.id]).length;
                        const isExpanded = expandedCategory === category;
                        const allDone = catChecked === docs.length;

                        return (
                            <div key={category} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setExpandedCategory(isExpanded ? null : category)}
                                    className="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {allDone ? (
                                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                                <FileText className="w-4 h-4 text-slate-500" />
                                            </div>
                                        )}
                                        <div className="text-left">
                                            <h3 className="font-bold text-slate-800">{category} Documents</h3>
                                            <p className="text-xs text-slate-400">{catChecked} of {docs.length} ready</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${allDone ? "bg-emerald-500" : "bg-indigo-500"}`}
                                                style={{ width: `${docs.length > 0 ? (catChecked / docs.length) * 100 : 0}%` }}
                                            />
                                        </div>
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="border-t border-slate-100 divide-y divide-slate-50">
                                        {docs.map(doc => {
                                            const isChecked = !!checked[doc.id];
                                            return (
                                                <div
                                                    key={doc.id}
                                                    className={`flex items-start gap-4 p-4 px-6 cursor-pointer hover:bg-slate-50/50 transition-colors ${isChecked ? "bg-emerald-50/30" : ""}`}
                                                    onClick={() => toggle(doc.id)}
                                                >
                                                    <div className="mt-0.5 flex-shrink-0">
                                                        {isChecked ? (
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                        ) : (
                                                            <Circle className="w-5 h-5 text-slate-300" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                            <span className={`font-semibold text-sm ${isChecked ? "text-slate-500 line-through" : "text-slate-800"}`}>
                                                                {doc.name}
                                                            </span>
                                                            {doc.required && (
                                                                <span className="px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded text-[10px] font-bold">REQUIRED</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-400 mb-1">{doc.description}</p>
                                                        <span className="text-xs text-slate-400">Copies needed: <span className="font-bold text-slate-600">{doc.copies}</span></span>
                                                        {doc.tips && (
                                                            <div className="flex items-start gap-1.5 mt-2 bg-blue-50 rounded-lg p-2 border border-blue-100">
                                                                <Info className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
                                                                <span className="text-xs text-blue-700">{doc.tips}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Completion Banner */}
                {progress === 100 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 bg-white rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 p-6 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">All Documents Ready!</h3>
                                <p className="text-sm text-slate-500">Your document preparation is complete. You're ready for document verification!</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>
            <Footer />
        </div>
    );
}
