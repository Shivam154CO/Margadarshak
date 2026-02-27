import React from "react";
import { ChevronDown } from "lucide-react";

interface FilterSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    icon?: React.ReactNode;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
    label, value, onChange, options, icon
}) => {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                {label}
            </label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-600 transition-colors">
                    {icon}
                </div>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-700 appearance-none group-hover:bg-white group-hover:shadow-lg"
                >
                    {options.map((opt) => (
                        <option key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
};
