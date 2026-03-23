import React from "react";
import { Check } from "lucide-react";

interface StepIndicatorProps {
    currentStep: number;
    steps: string[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
    return (
        <div className="flex items-center justify-between mb-16 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
            {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const isActive = currentStep === stepNum;
                const isCompleted = currentStep > stepNum;

                return (
                    <div key={step} className="relative z-10 flex flex-col items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-200' :
                                isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-110' :
                                    'bg-white border-2 border-slate-100 text-slate-300'
                            }`}>
                            {isCompleted ? <Check className="w-6 h-6" /> : <span className="text-sm font-black">{stepNum}</span>}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                            {step}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
