import React from "react";
import { User, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

interface ProfileHeaderProps {
    name: string;
    onUpdate?: () => void;
    onView?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, onUpdate, onView }) => {
    const navigate = useNavigate();

    return (
        <div className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
                        <User className="w-8 h-8 text-slate-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Welcome, {name}
                        </h2>
                        <p className="text-slate-500 font-medium mt-1">Manage your academic profile and preferences</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onUpdate || (() => navigate(ROUTES.PROFILE))}
                        className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm"
                    >
                        Update Profile
                    </button>
                    <button 
                        onClick={onView || (() => navigate(ROUTES.PROFILE_VIEW))}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                    >
                        View Public Profile
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                Verification Status
                            </span>
                            <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                                <ShieldCheck className="w-3.5 h-3.5" /> Verified Profile
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Academic Analysis Engine</h3>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-2xl font-medium">
                            Your profile data is being used to analyze 3,500+ admission records. Ensure your CET/Diploma scores are accurate for the most precise predictions.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 md:border-l border-slate-100 md:pl-8">
                        <div>
                            <div className="text-2xl font-bold text-slate-900">42</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Matches Found</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-indigo-600">12</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Top Suggestions</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
