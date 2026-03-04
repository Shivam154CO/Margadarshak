import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import IkigaiLogo from "./IkigaiLogo";
import {
  Search,
  MapPin,
  BarChart3,
  HelpCircle,
  Menu,
  User,
  ChevronDown,
  LogOut,
  Settings,
  LayoutDashboard,
  FileText,
  Scan,
  MessageSquare,
  X,
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

const Navbar: React.FC<NavbarProps> = React.memo(({ activeTab, userProfile: propProfile }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [automationDropdownOpen, setAutomationDropdownOpen] = useState(false);

  // Always have access to the profile — fetches once, then reads from shared cache
  const { data: cachedProfile } = useQuery<UserProfile | null>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      return data as UserProfile;
    },
    staleTime: 1000 * 60 * 10,
    refetchOnMount: false,
  });

  const userProfile = cachedProfile ?? propProfile;

  const navItems: any[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "search", label: "Colleges", icon: Search, path: "/college-explorer" },
    { id: "community", label: "Community", icon: MessageSquare, path: "/community" },
    { id: "map", label: "Map", icon: MapPin, path: "/college-map" },
    { id: "compare", label: "Compare", path: "/compare-college" },
    { id: "favorites", label: "Favorites", path: "/favorites" },
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
    { id: "analytics", label: "Analytics", icon: BarChart3, path: "/analytics" },
    { id: "help", label: "Help", icon: HelpCircle, path: "/help" },
  ];

  return (
    <>
      <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle mobile menu"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div
                className="flex items-center space-x-3 cursor-pointer group"
                onClick={() => navigate('/')}
                role="button"
                aria-label="Go to home"
              >
                <IkigaiLogo size="sm" showText={true} />
              </div>
            </div>

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
                    aria-label={`Open ${item.label}`}
                    className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${item.id === activeTab || (item.hasDropdown && automationDropdownOpen)
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                      }`}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
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
                          {subItem.icon && <subItem.icon className="w-4 h-4" />}
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  className="flex items-center space-x-3 bg-white backdrop-blur-sm rounded-xl px-3 py-2 border border-gray-300/50 hover:bg-gray-50 transition-all cursor-pointer group shadow-sm"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-label="User profile menu"
                >
                  <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-semibold text-gray-900">
                      {userProfile?.name?.split(" ")[0] || "Student"}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200/60 backdrop-blur-sm z-50 overflow-hidden">
                    <div className="bg-slate-800 p-5 text-white">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-bold">{userProfile?.name || "Student"}</h3>
                          <p className="text-slate-300 text-xs">{userProfile?.email || "student@example.com"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200/60 p-4 space-y-2">
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm"
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-white shadow-2xl overflow-y-auto transform transition-transform"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200/60 flex items-center justify-between">
              <IkigaiLogo size="sm" showText={true} />
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <div key={item.id}>
                  {item.hasDropdown ? (
                    <div>
                      <button
                        onClick={() => setAutomationDropdownOpen(!automationDropdownOpen)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${automationDropdownOpen ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50 bg-transparent"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon && <item.icon className="w-5 h-5" />}
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${automationDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {automationDropdownOpen && (
                        <div className="mt-1 ml-4 pl-4 border-l-2 border-indigo-100 space-y-1">
                          {item.dropdownItems.map((subItem: any) => (
                            <button
                              key={subItem.id}
                              onClick={() => {
                                setAutomationDropdownOpen(false);
                                setMobileMenuOpen(false);
                                navigate(subItem.path);
                              }}
                              className="w-full text-left px-4 py-3 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg transition-colors flex items-center gap-3"
                            >
                              {subItem.icon && <subItem.icon className="w-4 h-4" />}
                              {subItem.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate(item.path);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${item.id === activeTab ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-50 bg-transparent"
                        }`}
                    >
                      {item.icon && <item.icon className="w-5 h-5" />}
                      <span>{item.label}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default Navbar;
