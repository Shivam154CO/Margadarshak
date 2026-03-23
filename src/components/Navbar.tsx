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
  Calendar,
  CheckSquare,
  Users,
  Award,
  TrendingUp,
  GraduationCap,
  Compass,
  Layers,
  Heart,
  Wrench
} from "lucide-react";

// Constants & Types
import { ROUTES } from "../constants/routes";
import type { UserProfile } from "../types/user";

interface NavbarProps {
  activeTab?: string;
  userProfile?: UserProfile | null;
}

// ─── Static nav config — defined once at module scope, never recreated ─────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: ROUTES.DASHBOARD, hasDropdown: false, dropdownItems: [] },
  { id: "search", label: "Colleges", icon: Search, path: ROUTES.COLLEGE_EXPLORER, hasDropdown: false, dropdownItems: [] },
  {
    id: "explore",
    label: "Explore",
    icon: Compass,
    hasDropdown: true,
    path: "",
    dropdownItems: [
      { id: "compare", label: "Compare Colleges", icon: Layers, path: ROUTES.COLLEGE_COMPARISON },
      { id: "map", label: "College Map", icon: MapPin, path: ROUTES.COLLEGE_MAP },
      { id: "favorites", label: "My Favorites", icon: Heart, path: ROUTES.FAVORITES },
      { id: "community", label: "Community", icon: MessageSquare, path: ROUTES.COMMUNITY },
    ]
  },
  {
    id: "student-hub",
    label: "Student Hub",
    icon: GraduationCap,
    hasDropdown: true,
    path: "",
    dropdownItems: [
      { id: "timeline", label: "Admission Timeline", icon: Calendar, path: ROUTES.ADMISSION_TIMELINE },
      { id: "documents", label: "Document Checklist", icon: CheckSquare, path: ROUTES.DOCUMENT_CHECKLIST },
      { id: "vacancy", label: "Seat Vacancy", icon: Users, path: ROUTES.SEAT_VACANCY },
      { id: "scholarships", label: "Scholarships", icon: Award, path: ROUTES.SCHOLARSHIP_FINDER },
      { id: "cutoff-trends", label: "Cutoff Trends", icon: TrendingUp, path: ROUTES.CUTOFF_TRENDS },
      { id: "post-admission", label: "Post-Admission", icon: HelpCircle, path: ROUTES.POST_ADMISSION },
    ]
  },
  {
    id: "tools",
    label: "Tools",
    icon: Wrench,
    hasDropdown: true,
    path: "",
    dropdownItems: [
      { id: "cap-generator", label: "Smart CAP Form", icon: FileText, path: ROUTES.CAP_ROUND_GENERATOR },
      { id: "dse-option-form", label: "Manual Option Form", icon: CheckSquare, path: ROUTES.DSE_OPTION_FORM },
      { id: "scorecard-ocr", label: "OCR Auto-fill", icon: Scan, path: ROUTES.SCORECARD_OCR },
      { id: "analytics", label: "Advanced Analytics", icon: TrendingUp, path: ROUTES.ANALYTICS },
      { id: "data-pipeline", label: "Data Pipeline", icon: BarChart3, path: ROUTES.DATA_PIPELINE },
    ]
  },
  { id: "help", label: "Help", icon: HelpCircle, path: ROUTES.HELP, hasDropdown: false, dropdownItems: [] },
] as const;

const Navbar: React.FC<NavbarProps> = React.memo(({ activeTab, userProfile: propProfile }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const isScrolled = false;

  // Scroll collapse behavior is disabled. Navbar remains expanded.

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

  return (
    <>
      <nav className={`sticky top-0 z-50 w-full pointer-events-none transition-all duration-500 ${isScrolled ? 'py-4 md:py-6' : 'py-4 md:py-6'}`}>
        <div className={`transition-all duration-700 pointer-events-auto ${isScrolled ? 'ml-4 md:ml-8 w-[56px] h-[56px] md:w-[72px] md:h-[72px]' : 'mx-auto w-full px-4 md:px-6'}`}>
          <div className={`flex items-center transition-all duration-700 ${isScrolled ? 'justify-center w-full h-full bg-transparent md:bg-white/90 md:backdrop-blur-xl md:rounded-full md:border md:border-gray-200/50 md:shadow-2xl' : 'justify-between px-4 py-3 md:px-6 md:py-4 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/60 shadow-sm'}`}>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 ${isScrolled ? 'opacity-0 -translate-x-4 pointer-events-none' : 'opacity-100 translate-x-0'}`}
                aria-label="Toggle mobile menu"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div
                className="flex items-center transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(ROUTES.HOME)}
                role="button"
                aria-label="Go to home"
              >
                <IkigaiLogo size="sm" showText={!isScrolled} className={`transition-all duration-300 ${isScrolled ? 'scale-[0.65] md:scale-100' : 'scale-100'}`} />
              </div>
            </div>

            <div className={`hidden lg:flex items-center space-x-1 bg-white/80 backdrop-blur-sm rounded-2xl px-2 py-1.5 border border-gray-200/50 shadow-sm relative transition-all duration-500 ${isScrolled ? 'opacity-0 scale-95 pointer-events-none w-0 overflow-hidden px-0' : 'opacity-100 scale-100'}`}>
              {NAV_ITEMS.map((item) => (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => {
                      if (item.hasDropdown) {
                        setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                      } else {
                        setOpenDropdownId(null);
                        navigate(item.path);
                      }
                    }}
                    aria-label={`Open ${item.label}`}
                    className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2 ${item.id === activeTab || (item.hasDropdown && openDropdownId === item.id)
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                      }`}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span>{item.label}</span>
                    {item.hasDropdown && (
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdownId === item.id ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {item.hasDropdown && openDropdownId === item.id && (
                    <div className="absolute top-12 left-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200/60 overflow-hidden z-50">
                      {item.dropdownItems.map((subItem: any) => (
                        <button
                          key={subItem.id}
                          onClick={() => {
                            setOpenDropdownId(null);
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

            <div className={`flex items-center space-x-4 transition-all duration-500 ${isScrolled ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
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
                          navigate(ROUTES.PROFILE);
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
                          navigate(ROUTES.LOGIN);
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
              {NAV_ITEMS.map((item) => (
                <div key={item.id}>
                  {item.hasDropdown ? (
                    <div>
                      <button
                        onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${openDropdownId === item.id ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50 bg-transparent"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon && <item.icon className="w-5 h-5" />}
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${openDropdownId === item.id ? 'rotate-180' : ''}`} />
                      </button>
                      {openDropdownId === item.id && (
                        <div className="mt-1 ml-4 pl-4 border-l-2 border-indigo-100 space-y-1">
                          {item.dropdownItems.map((subItem: any) => (
                            <button
                              key={subItem.id}
                              onClick={() => {
                                setOpenDropdownId(null);
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
