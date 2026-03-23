import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import type { UserProfile } from '../../../types/user';
import { ROUTES } from '../../../constants/routes';

interface DashboardHeaderProps {
  profile: UserProfile | null;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ profile }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Welcome back, {profile?.name?.split(" ")[0] || "User"}!
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(ROUTES.PROFILE)}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm flex items-center space-x-2"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Update Profile</span>
          </button>
        </div>
      </div>

      {profile && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-8 shadow-sm transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                  Your Profile Overview
                </h3>
                <p className="text-sm text-slate-500 font-medium line-clamp-1">
                  Managed by Ikigai Smart Analysis Engine
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={() => navigate(ROUTES.PROFILE_VIEW)}
                className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm inline-flex justify-center items-center space-x-2 flex-1 sm:flex-none"
              >
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">View Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
