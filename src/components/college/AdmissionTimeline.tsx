import React from "react";
import { motion } from "framer-motion";
import { Clock, FileText, ChevronDown, ChevronUp } from "lucide-react";
import type { AdmissionStep } from "../../types/college";

interface AdmissionTimelineProps {
    steps: AdmissionStep[];
    expandedSteps: number[];
    onToggleStep: (step: number) => void;
}

export const AdmissionTimeline: React.FC<AdmissionTimelineProps> = ({ steps, expandedSteps, onToggleStep }) => {
    const defaultSteps: AdmissionStep[] = [
        { step: 1, title: "Registration", description: "Online registration on the official DTE portal.", required_docs: ["Aadhar Card", "Ssc Marksheet"] },
        { step: 2, title: "Document Verification", description: "Visit the facilitation center for original document verification.", required_docs: ["Original Documents", "Application Printout"] },
        { step: 3, title: "Display of Merit List", description: "Check your rank in the provisional and final merit lists.", required_docs: [] },
        { step: 4, title: "Option Form Filling", description: "Submit your preferences for colleges and branches.", required_docs: [] },
        { step: 5, title: "CAP Round Allotment", description: "Seat allocation based on merit and preferences.", required_docs: [] },
        { step: 6, title: "Reporting to Institute", description: "Confirm admission by paying fees and submitting documents.", required_docs: ["Allotment Letter", "Fee Receipt"] },
    ];

    const displaySteps = steps && steps.length > 0 ? steps : defaultSteps;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Admission Journey</h3>
                <div className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold uppercase tracking-widest">
                    Academic Year 2025-26
                </div>
            </div>

            <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {displaySteps.map((s, i) => (
                    <div key={i} className="relative">
                        <div className="absolute -left-[33px] top-0 w-8 h-8 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center z-10 font-black text-slate-400 text-xs">
                            {s.step}
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                            <button
                                onClick={() => onToggleStep(s.step)}
                                className="w-full p-6 flex items-center justify-between text-left"
                            >
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900">{s.title}</h4>
                                    <p className="text-sm font-medium text-slate-500 mt-1">{s.description}</p>
                                </div>
                                {expandedSteps.includes(s.step) ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </button>

                            {expandedSteps.includes(s.step) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="px-6 pb-6 pt-0 border-t border-slate-50"
                                >
                                    <div className="mt-4 space-y-4">
                                        {s.deadline && (
                                            <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-3 rounded-xl">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-tight">Deadline: {s.deadline}</span>
                                            </div>
                                        )}

                                        {s.required_docs.length > 0 && (
                                            <div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Required Documents</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {s.required_docs.map((doc, idx) => (
                                                        <span key={idx} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold flex items-center gap-2">
                                                            <FileText className="w-3.5 h-3.5" />
                                                            {doc}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
