import React from "react";
import { Sparkles, Database } from "lucide-react";

interface ProfileHeaderProps {
    name: string;
    onUpdate: () => void;
    onView: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, onUpdate, onView }) => {
    return (
        <div className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10 gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-200">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                            Welcome back, <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{name}</span>! 👋
                        </h2>
                        <p className="text-slate-500 font-bold mt-1">Your AI-curated college matches are ready.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={onUpdate} className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                        Update Profile
                    </button>
                    <button onClick={onView} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                        View Analytics
                    </button>
                </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-10 scale-150 rotate-12">
                    <Database className="w-48 h-48" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest">Profile: 95% Complete</span>
                            <span className="px-3 py-1 bg-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest">Active Search</span>
                        </div>
                        <h3 className="text-3xl font-black mb-3">AI Engine is Running</h3>
                        <p className="text-indigo-100 text-lg font-medium max-w-xl">
                            We've analyzed 2,500+ data points for your rank to find these specific institutional matches.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-center">
                            <div className="text-4xl font-black">42</div>
                            <div className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Total Matches</div>
                        </div>
                        <div className="w-px h-12 bg-white/20 self-center" />
                        <div className="text-center">
                            <div className="text-4xl font-black">12</div>
                            <div className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Safe Picks</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
