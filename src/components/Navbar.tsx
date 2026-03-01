import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Search,
  MapPin,
  BarChart3,
  HeartIcon,
  HelpCircle,
  Menu,
  User,
  ChevronDown,
  GraduationCap,
  Mail,
  Award,
  BookOpen,
  MapPin as MapPinIcon,
  LogOut,
  Settings,
  Shield,
  Star,
  Heart,
  School,
  LayoutDashboard,
  FileText,
  Scan,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  state: string;
  category: string;
  exam_type: string;
  cet_rank: string;
  cet_score: string;
  diploma_rank: string;
  diploma_score: string;
  preferred_branches: string[];
  university_preference: string;
  address: string;
  receive_updates: boolean;
  profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

interface NavbarProps {
  activeTab?: string;
  userProfile?: UserProfile | null;
}

const Navbar: React.FC<NavbarProps> = React.memo(({ activeTab, userProfile }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [automationDropdownOpen, setAutomationDropdownOpen] = useState(false);

  const navItems: any[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      id: "search",
      label: "Colleges",
      icon: Search,
      path: "/college-explorer",
    },
    {
      id: "map",
      label: "Map",
      icon: MapPin,
      path: "/college-map",
    },
    {
      id: "compare",
      label: "Compare",
      path: "/compare-college",
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: HeartIcon,
      path: "/favorites",
    },
    {
      id: "automation",
      label: "Automation",
      icon: Settings,
      hasDropdown: true,
      dropdownItems: [
        { id: "cap-generator", label: "CAP Form", icon: FileText, path: "/cap-generator" },
        { id: "data-pipeline", label: "Data Pipeline", icon: BarChart3, path: "/data-pipeline" },
        { id: "scorecard-ocr", label: "OCR Auto-fill", icon: Scan, path: "/scorecard-ocr" }
      ]
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      path: "/analytics",
    },
    {
      id: "help",
      label: "Help",
      icon: HelpCircle,
      path: "/help",
    },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Ikigai
                </h1>
                <p className="text-xs text-gray-500">
                  AI-Powered Admissions Predictor
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Menu */}
          <div className="hidden lg:flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-2xl px-2 py-1.5 border border-gray-200/50 shadow-sm relative">
            {navItems.map((item) => (
              <div key={item.id} className="relative">
                <button
                  onClick={() => {
                    if (item.hasDropdown) {
                      setAutomationDropdownOpen(!automationDropdownOpen);
                    } else {
                      setAutomationDropdownOpen(false);
                      navigate(item.path);
                    }
                  }}
                  className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${item.id === activeTab || (item.hasDropdown && automationDropdownOpen)
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                    }`}
                >
                  {item.icon && React.createElement(item.icon, { className: "w-4 h-4" })}
                  <span>{item.label}</span>
                  {item.hasDropdown && (
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${automationDropdownOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>
                {item.hasDropdown && automationDropdownOpen && (
                  <div className="absolute top-12 left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200/60 overflow-hidden z-50">
                    {item.dropdownItems.map((subItem: any) => (
                      <button
                        key={subItem.id}
                        onClick={() => {
                          setAutomationDropdownOpen(false);
                          navigate(subItem.path);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 border-b border-gray-100 last:border-0 transition-colors"
                      >
                        {subItem.icon && React.createElement(subItem.icon, { className: "w-4 h-4" })}
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right side - Profile */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div
                className="flex items-center space-x-3 bg-white backdrop-blur-sm rounded-xl px-3 py-2 border border-gray-300/50 hover:bg-gray-50 transition-all cursor-pointer group shadow-sm"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-gray-900">
                    {userProfile?.name?.split(" ")[0] || "Student"}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200/60 backdrop-blur-sm z-50 overflow-hidden">
                  {/* Profile Header */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{userProfile?.name || "Student"}</h3>
                        <p className="text-indigo-100 text-sm">{userProfile?.email || "student@example.com"}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-indigo-100">Active Student</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-200/50">
                        <div className="flex items-center space-x-2 mb-1">
                          <Award className="w-4 h-4 text-blue-600" />
                          <span className="text-xs text-blue-700 font-medium">Category</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{userProfile?.category || "OPEN"}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200/50">
                        <div className="flex items-center space-x-2 mb-1">
                          <BookOpen className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-green-700 font-medium">Exam</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{userProfile?.exam_type || "CET"}</p>
                      </div>
                    </div>

                    {userProfile?.exam_type === "CET" ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-3 rounded-xl border border-purple-200/50">
                          <div className="flex items-center space-x-2 mb-1">
                            <BarChart3 className="w-4 h-4 text-purple-600" />
                            <span className="text-xs text-purple-700 font-medium">CET Rank</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{userProfile?.cet_rank || "N/A"}</p>
                        </div>
                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-3 rounded-xl border border-pink-200/50">
                          <div className="flex items-center space-x-2 mb-1">
                            <Star className="w-4 h-4 text-pink-600" />
                            <span className="text-xs text-pink-700 font-medium">CET Score</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{userProfile?.cet_score || "N/A"}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-3 rounded-xl border border-purple-200/50">
                          <div className="flex items-center space-x-2 mb-1">
                            <BarChart3 className="w-4 h-4 text-purple-600" />
                            <span className="text-xs text-purple-700 font-medium">Diploma Rank</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{userProfile?.diploma_rank || "N/A"}</p>
                        </div>
                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-3 rounded-xl border border-pink-200/50">
                          <div className="flex items-center space-x-2 mb-1">
                            <Star className="w-4 h-4 text-pink-600" />
                            <span className="text-xs text-pink-700 font-medium">Diploma Score</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{userProfile?.diploma_score || "N/A"}</p>
                        </div>
                      </div>
                    )}

                    {/* Preferred Branches */}
                    {userProfile?.preferred_branches && userProfile.preferred_branches.length > 0 && (
                      <div className="bg-gradient-to-br from-red-50 to-pink-50 p-3 rounded-xl border border-red-200/50">
                        <div className="flex items-center space-x-2 mb-2">
                          <Heart className="w-4 h-4 text-red-600" />
                          <span className="text-xs text-red-700 font-medium">Preferred Branches</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {userProfile.preferred_branches.slice(0, 3).map((branch, index) => (
                            <span
                              key={index}
                              className="inline-block bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium"
                            >
                              {branch}
                            </span>
                          ))}
                          {userProfile.preferred_branches.length > 3 && (
                            <span className="text-xs text-gray-600 font-medium">
                              +{userProfile.preferred_branches.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* University Preference */}
                    {userProfile?.university_preference && (
                      <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-3 rounded-xl border border-emerald-200/50">
                        <div className="flex items-center space-x-2 mb-1">
                          <School className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs text-emerald-700 font-medium">University Preference</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{userProfile.university_preference}</p>
                      </div>
                    )}

                    {/* Location */}
                    {userProfile?.state && (
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-3 rounded-xl border border-orange-200/50">
                        <div className="flex items-center space-x-2 mb-1">
                          <MapPinIcon className="w-4 h-4 text-orange-600" />
                          <span className="text-xs text-orange-700 font-medium">Location</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{userProfile.state}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-gray-200/60 p-4 space-y-2">
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      <Settings className="w-5 h-5" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={async () => {
                        await supabase.auth.signOut();
                        navigate("/login");
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>

                  {/* Security Note */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-4 py-3 border-t border-gray-200/60">
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Shield className="w-4 h-4 text-indigo-600" />
                      <span>Your profile data is securely encrypted</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-3 border-t border-gray-200/50 pt-4">
            <div className="grid grid-cols-2 gap-3">
              {navItems.map((item) => {
                if (item.hasDropdown) {
                  return item.dropdownItems.map((subItem: any) => (
                    <button
                      key={subItem.id}
                      onClick={() => {
                        navigate(subItem.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex flex-col items-center justify-center space-y-2 ${subItem.id === activeTab
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 border border-gray-200/50"
                        }`}
                    >
                      {subItem.icon && React.createElement(subItem.icon, { className: "w-4 h-4" })}
                      <span className="text-xs">{subItem.label}</span>
                    </button>
                  ));
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-3 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex flex-col items-center justify-center space-y-2 ${item.id === activeTab
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                      : "bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 border border-gray-200/50"
                      }`}
                  >
                    {item.icon && React.createElement(item.icon, { className: "w-4 h-4" })}
                    <span className="text-xs">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});

export default Navbar;
