import React from "react";

import { Search, Filter as FilterIcon, RotateCw, ChevronDown, CheckCircle } from "lucide-react";

interface MapFiltersProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    selectedState: string;
    setSelectedState: (val: string) => void;
    selectedType: string;
    setSelectedType: (val: string) => void;
    selectedChance: string;
    setSelectedChance: (val: string) => void;
    states: string[];
    collegeTypes: string[];
    chanceLevels: string[];
    onReset: () => void;
}

export const MapFilters: React.FC<MapFiltersProps> = ({
    searchTerm, setSearchTerm,
    selectedState, setSelectedState,
    selectedType, setSelectedType,
    selectedChance, setSelectedChance,
    states, collegeTypes, chanceLevels,
    onReset
}) => {
    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-gray-200/50 p-8 shadow-xl space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black flex items-center gap-3 text-slate-900 uppercase tracking-tighter">
                    <FilterIcon className="w-5 h-5 text-indigo-500" />
                    Map Explorer
                </h3>
                <button onClick={onReset} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400">
                    <RotateCw className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Quick Search</label>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="College, City or Branch..."
                            className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Region</label>
                    <div className="relative">
                        <select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="w-full pl-5 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-700 appearance-none"
                        >
                            {states.map(state => <option key={state} value={state}>{state}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">College Status</label>
                    <div className="grid grid-cols-2 gap-2">
                        {collegeTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${selectedType === type ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Admission Index</label>
                    <div className="space-y-2">
                        {chanceLevels.map(level => (
                            <button
                                key={level}
                                onClick={() => setSelectedChance(level)}
                                className={`w-full px-4 py-3 rounded-xl text-xs font-black uppercase tracking-tighter flex items-center justify-between transition-all ${selectedChance === level ? "bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm" : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent"
                                    }`}
                            >
                                {level}
                                {selectedChance === level && <CheckCircle className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
