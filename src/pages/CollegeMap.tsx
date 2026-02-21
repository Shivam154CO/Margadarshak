import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Search,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Target,
  TrendingUp,
  Layers,
  Sparkles,
  Globe,
  Brain,
  BarChart3,
  Satellite,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Filter as FilterIcon,
  X,
  Database,
  TargetIcon,
  IndianRupee,
  Building2,
  Home,
  Shield,
  CheckCircle,
  Users
} from "lucide-react";
import axios from "axios";
import { supabase } from "../lib/supabase";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import Navbar from "../components/Navbar";

// Google Maps configuration
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = [];

interface College {
  college_code: string;
  college_name: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  autonomy_status: string;
  placement_rate: number;
  average_package_lpa: number;
  highest_package_lpa: number;
  hostel_available: string;
  branches: Array<{
    branch: string;
    branch_code: string;
    admission_chance: number;
    probability_level: string;
    is_most_probable: boolean;
    Fees: number;
    cutoff_rank: number;
    seats: number;
  }>;
  is_predicted?: boolean;
  match_score?: number;
}

interface MapMarker {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  admission_chance: number;
  branch_count: number;
  placement_rate: number;
  type: string;
  is_predicted: boolean;
}

export default function InteractiveCollegeMap() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedChance, setSelectedChance] = useState("All Chances");
  const [savedColleges, setSavedColleges] = useState<string[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(7);
  const [mapCenter, setMapCenter] = useState({ lat: 18.8, lng: 76.75 }); // Center of Maharashtra (geographical center)
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userCategory, setUserCategory] = useState("");
  const [viewMode, setViewMode] = useState<"predicted" | "all">("all");
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [states, setStates] = useState<string[]>([]);



  // Initialize map with user data
  useEffect(() => {
    let isMounted = true;

    const loadColleges = async () => {
      try {
        let allColleges: College[] = [];
        let predictedColleges: College[] = [];

        // First, fetch all colleges from Supabase (same table as ML API)
        try {
          const { data: dbColleges, error: dbError } = await supabase
            .from('colleges_2025')
            .select('*');

          if (dbColleges && !dbError) {
            // Group colleges by college_code to ensure uniqueness
            const collegeMap = new Map<string, College>();

            dbColleges.forEach((college: any) => {
              if (!collegeMap.has(college.college_code)) {
                collegeMap.set(college.college_code, {
                  college_code: college.college_code,
                  college_name: college.college_name,
                  city: college.city,
                  state: getStateFromCity(college.city),
                  latitude: getCityCoordinates(college.city).lat,
                  longitude: getCityCoordinates(college.city).lng,
                  autonomy_status: college.autonomy_status || 'Government',
                  placement_rate: college.placement_rate || 0,
                  average_package_lpa: college.average_package_lpa || 0,
                  highest_package_lpa: college.highest_package_lpa || 0,
                  hostel_available: college.hostel_available || 'No',
                  branches: [], // Will be populated from prediction API
                  is_predicted: false,
                  match_score: 0,
                });
              }
            });

            allColleges = Array.from(collegeMap.values());
            console.log(`✅ Loaded ${allColleges.length} unique colleges from Supabase`);
          } else {
            console.error("Failed to fetch colleges from Supabase:", dbError);
            allColleges = [];
          }
        } catch (dbErr) {
          console.error("Database fetch error:", dbErr);
          allColleges = [];
        }

        // Check if user is authenticated and get prediction data
        const { data: { user } } = await supabase.auth.getUser();
        if (user && allColleges.length > 0) {
          const { data: prof, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (prof && !error) {
            const rank = prof.rank || prof.cetRank || prof.diplomaRank || null;
            const score = prof.cetScore || prof.diplomaScore || null;
            const category = prof.category || "OPEN";
            const preferredBranches = prof.preferredBranches || [];

            setUserRank(rank);
            setUserCategory(category);

            if (rank && score && preferredBranches.length) {
              try {
                console.log("🔮 Getting admission predictions...");
                const res = await axios.post("http://127.0.0.1:5001/predict_admission", {
                  score: parseFloat(score),
                  rank: parseInt(rank),
                  category,
                  branches: preferredBranches,
                });

                const rawData = res.data.colleges || [];

                // Group predicted colleges by college_code
                const predictedMap = new Map<string, College>();
                rawData.forEach((college: any) => {
                  if (!predictedMap.has(college.college_code)) {
                    predictedMap.set(college.college_code, {
                      college_code: college.college_code,
                      college_name: college.college_name,
                      city: college.city,
                      state: getStateFromCity(college.city),
                      latitude: getCityCoordinates(college.city).lat,
                      longitude: getCityCoordinates(college.city).lng,
                      autonomy_status: college.autonomy_status || 'Government',
                      placement_rate: college.placement_rate || 0,
                      average_package_lpa: college.average_package_lpa || 0,
                      highest_package_lpa: college.highest_package_lpa || 0,
                      hostel_available: college.hostel_available || 'No',
                      branches: [],
                      is_predicted: true,
                      match_score: college.match_score || 0,
                    });
                  }

                  const existingCollege = predictedMap.get(college.college_code)!;
                  existingCollege.branches.push({
                    branch: college.branch,
                    branch_code: college.branch_code,
                    admission_chance: college.admission_chance,
                    probability_level: college.probability_level,
                    is_most_probable: college.is_most_probable,
                    Fees: college.fees || college.Fees || 0,
                    cutoff_rank: college.cutoff_rank,
                    seats: college.seats,
                  });
                });

                predictedColleges = Array.from(predictedMap.values());
                console.log(`🎯 Got predictions for ${predictedColleges.length} colleges`);
              } catch (apiErr) {
                console.error("Prediction API failed:", apiErr);
                predictedColleges = [];
              }
            }
          }
        }

        // Combine all colleges with predictions, ensuring uniqueness by college_code
        const finalCollegeMap = new Map<string, College>();

        // Add all colleges first
        allColleges.forEach(college => {
          finalCollegeMap.set(college.college_code, { ...college });
        });

        // Override with predicted colleges (they have prediction data)
        predictedColleges.forEach(predicted => {
          if (finalCollegeMap.has(predicted.college_code)) {
            const existing = finalCollegeMap.get(predicted.college_code)!;
            finalCollegeMap.set(predicted.college_code, {
              ...existing,
              ...predicted,
              branches: predicted.branches, // Use predicted branches
              is_predicted: true,
              match_score: predicted.match_score,
            });
          } else {
            finalCollegeMap.set(predicted.college_code, predicted);
          }
        });

        const finalColleges = Array.from(finalCollegeMap.values());

        if (isMounted) {
          setColleges(finalColleges);

          // Extract unique states
          const uniqueStates = Array.from(new Set(finalColleges.map(c => c.state))).sort();
          setStates(["All States", ...uniqueStates]);

          // Create map markers
          const markers = finalColleges.map(college => ({
            id: college.college_code,
            name: college.college_name,
            city: college.city,
            state: college.state,
            lat: college.latitude || getCityCoordinates(college.city).lat,
            lng: college.longitude || getCityCoordinates(college.city).lng,
            admission_chance: college.is_predicted
              ? Math.max(...college.branches.map(b => b.admission_chance))
              : 50, // Default for non-predicted
            branch_count: college.branches.length || 1,
            placement_rate: college.placement_rate,
            type: college.autonomy_status,
            is_predicted: !!college.is_predicted,
          }));

          setMapMarkers(markers);
          console.log(`🗺️ Created ${markers.length} map markers`);
        }
      } catch (err) {
        console.error("Failed to load colleges", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Load colleges immediately
    loadColleges();

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Reload colleges when auth state changes
      loadColleges();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to get state from city
  const getStateFromCity = (city: string): string => {
    const cityStateMap: Record<string, string> = {
      "Mumbai": "Maharashtra",
      "Pune": "Maharashtra",
      "Nagpur": "Maharashtra",
      "Delhi": "Delhi",
      "New Delhi": "Delhi",
      "Bangalore": "Karnataka",
      "Chennai": "Tamil Nadu",
      "Hyderabad": "Telangana",
      "Kolkata": "West Bengal",
      "Ahmedabad": "Gujarat",
      "Jaipur": "Rajasthan",
      "Lucknow": "Uttar Pradesh",
      "Bhopal": "Madhya Pradesh",
      "Chandigarh": "Chandigarh",
      "Thiruvananthapuram": "Kerala",
      "Bhubaneswar": "Odisha",
      "Guwahati": "Assam",
      "Patna": "Bihar",
    };
    return cityStateMap[city] || "Unknown State";
  };

  // Helper function to get city coordinates
  const getCityCoordinates = (city: string): { lat: number; lng: number } => {
    const cityCoords: Record<string, { lat: number; lng: number }> = {
      "Mumbai": { lat: 19.0760, lng: 72.8777 },
      "Delhi": { lat: 28.7041, lng: 77.1025 },
      "Bangalore": { lat: 12.9716, lng: 77.5946 },
      "Chennai": { lat: 13.0827, lng: 80.2707 },
      "Hyderabad": { lat: 17.3850, lng: 78.4867 },
      "Pune": { lat: 18.5204, lng: 73.8567 },
      "Kolkata": { lat: 22.5726, lng: 88.3639 },
      "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
      "Jaipur": { lat: 26.9124, lng: 75.7873 },
      "Lucknow": { lat: 26.8467, lng: 80.9462 },
      "Nagpur": { lat: 21.1458, lng: 79.0882 },
      "Bhopal": { lat: 23.2599, lng: 77.4126 },
      "Chandigarh": { lat: 30.7333, lng: 76.7794 },
      "Thiruvananthapuram": { lat: 8.5241, lng: 76.9366 },
      "Bhubaneswar": { lat: 20.2961, lng: 85.8245 },
      "Guwahati": { lat: 26.1445, lng: 91.7362 },
      "Patna": { lat: 25.5941, lng: 85.1376 },
    };
    return cityCoords[city] || { lat: 20.5937 + (Math.random() - 0.5) * 10, lng: 78.9629 + (Math.random() - 0.5) * 10 };
  };



  // Filtered markers based on selections
  const filteredMarkers = useMemo(() => {
    return mapMarkers.filter(marker => {
      // Filter by search term
      if (searchTerm && !marker.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !marker.city.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filter by state
      if (selectedState !== "All States" && marker.state !== selectedState) {
        return false;
      }

      // Filter by type
      if (selectedType !== "All Types") {
        const typeMap: Record<string, string> = {
          "Government": "Government",
          "Private": "Private",
          "Autonomous": "Autonomous"
        };
        if (typeMap[selectedType] && marker.type !== typeMap[selectedType]) {
          return false;
        }
      }

      // Filter by admission chance
      if (selectedChance !== "All Chances") {
        const chance = marker.admission_chance;
        switch (selectedChance) {
          case "High (80%+)":
            if (chance < 80) return false;
            break;
          case "Good (60-79%)":
            if (chance < 60 || chance >= 80) return false;
            break;
          case "Average (40-59%)":
            if (chance < 40 || chance >= 60) return false;
            break;
          case "Low (<40%)":
            if (chance >= 40) return false;
            break;
        }
      }

      // Filter by view mode
      if (viewMode === "predicted" && !marker.is_predicted) {
        return false;
      }

      return true;
    });
  }, [mapMarkers, searchTerm, selectedState, selectedType, selectedChance, viewMode]);

  // Filtered colleges for details panel
  const filteredColleges = useMemo(() => {
    return colleges.filter(college =>
      filteredMarkers.some(marker => marker.id === college.college_code)
    ).sort((a, b) => {
      const maxA = Math.max(...a.branches.map(b => b.admission_chance));
      const maxB = Math.max(...b.branches.map(b => b.admission_chance));
      return maxB - maxA;
    });
  }, [colleges, filteredMarkers]);

  // Get marker color based on admission chance
  const getMarkerColor = (chance: number) => {
    if (chance >= 80) return "#10B981"; // Emerald green
    if (chance >= 60) return "#3B82F6"; // Blue
    if (chance >= 40) return "#8B5CF6"; // Purple
    return "#EF4444"; // Red
  };

  // Get chance label
  const getChanceLabel = (chance: number) => {
    if (chance >= 80) return "High Chance";
    if (chance >= 60) return "Best Chance";
    if (chance >= 40) return "Good Chance";
    return "Low Chance";
  };

  // Get fit color class
  const getFitColor = (chance: number) => {
    if (chance >= 80) return "bg-gradient-to-r from-emerald-500 to-green-600";
    if (chance >= 60) return "bg-gradient-to-r from-blue-500 to-cyan-600";
    if (chance >= 40) return "bg-gradient-to-r from-indigo-500 to-purple-600";
    return "bg-gradient-to-r from-rose-500 to-pink-600";
  };

  // Map interaction handlers
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 1, 10));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 1, 1));
  };

  const handleResetView = () => {
    setZoomLevel(7);
    setMapCenter({ lat: 19.0760, lng: 72.8777 }); // Reset to Maharashtra center
  };

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    // Convert pixel movement to map coordinates (simplified)
    const scale = 0.1 / zoomLevel;
    setMapCenter(prev => ({
      lat: prev.lat - dy * scale,
      lng: prev.lng + dx * scale,
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Save college
  const toggleSaveCollege = (collegeCode: string) => {
    setSavedColleges(prev =>
      prev.includes(collegeCode)
        ? prev.filter(id => id !== collegeCode)
        : [...prev, collegeCode]
    );
    // Save to localStorage
    localStorage.setItem("savedColleges", JSON.stringify(
      savedColleges.includes(collegeCode)
        ? savedColleges.filter(id => id !== collegeCode)
        : [...savedColleges, collegeCode]
    ));
  };

  // Load saved colleges
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedColleges") || "[]");
    setSavedColleges(saved);
  }, []);

  // Google Maps hook
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  // Helper function to get marker position on custom map
  const getMarkerPosition = (marker: MapMarker) => {
    const mapWidth = mapContainerRef.current?.clientWidth || 800;
    const mapHeight = mapContainerRef.current?.clientHeight || 500;

    // Calculate relative position from map center
    const latDiff = marker.lat - mapCenter.lat;
    const lngDiff = marker.lng - mapCenter.lng;

    // Convert to pixels (simplified projection)
    const x = mapWidth / 2 + (lngDiff * 10 * zoomLevel);
    const y = mapHeight / 2 - (latDiff * 10 * zoomLevel);

    return { x, y };
  };

  // College types
  const collegeTypes = ["All Types", "Government", "Private", "Autonomous"];
  const chanceLevels = ["All Chances", "High (80%+)", "Good (60-79%)", "Average (40-59%)", "Low (<40%)"];

  // State for selected marker on map
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center space-y-6">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity }
            }}
            className="w-20 h-20 mx-auto"
          >
            <Globe className="w-full h-full text-indigo-500" />
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Loading Interactive Map</h3>
            <p className="text-gray-400">Visualizing colleges across India...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 text-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: ["0%", "100%", "0%"],
            y: ["0%", "100%", "0%"]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-500/5 to-cyan-500/5 blur-3xl"
        />
      </div>

      <Navbar activeTab="map" />

      {/* Main Content Layout */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6 lg:gap-8">

          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && !isFullScreen && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="xl:w-80 space-y-6 order-2 xl:order-1"
              >


                {/* Filters Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                      <FilterIcon className="w-5 h-5 text-blue-500" />
                      Filters
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedState("All States");
                        setSelectedType("All Types");
                        setSelectedChance("All Chances");
                        setSearchTerm("");
                      }}
                      className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1"
                    >
                      <RotateCw className="w-4 h-4" />
                      Reset
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Search Colleges</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Type college or city..."
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <div className="relative">
                        <select
                          value={selectedState}
                          onChange={(e) => setSelectedState(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
                        >
                          {states.slice(0, 20).map(state => (
                            <option key={state} value={state} className="bg-white">
                              {state}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">College Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {collegeTypes.map(type => (
                          <motion.button
                            key={type}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedType(type)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedType === type
                                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                              }`}
                          >
                            {type}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Admission Chance</label>
                      <div className="space-y-2">
                        {chanceLevels.map(level => (
                          <motion.button
                            key={level}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedChance(level)}
                            className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${selectedChance === level
                                ? "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-700"
                                : "hover:bg-gray-100 text-gray-700"
                              }`}
                          >
                            <span>{level}</span>
                            {selectedChance === level && (
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                    Statistics
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Showing</span>
                        <span className="font-medium text-gray-900">{filteredMarkers.length}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(filteredMarkers.length / mapMarkers.length) * 100}%` }}
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600">
                          {colleges.filter(c => c.is_predicted).length}
                        </div>
                        <div className="text-xs text-gray-600">AI Matches</div>
                      </div>
                      <div className="text-center p-3 bg-emerald-50 rounded-xl">
                        <div className="text-2xl font-bold text-emerald-600">
                          {savedColleges.length}
                        </div>
                        <div className="text-xs text-gray-600">Saved</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col gap-6">
              {/* Map Container */}
              <div className={`${isFullScreen ? 'fixed inset-0 z-50' : 'bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 overflow-hidden relative h-screen shadow-lg'}`}>
                {/* Map Controls */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleZoomIn}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-md"
                  >
                    <ZoomIn className="w-5 h-5 text-gray-700" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleZoomOut}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-md"
                  >
                    <ZoomOut className="w-5 h-5 text-gray-700" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleResetView}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-md"
                  >
                    <RotateCw className="w-5 h-5 text-gray-700" />
                  </motion.button>
                </div>

                {/* View Mode Toggle Overlay */}
                <div className="absolute top-4 right-20 z-10">
                  <div className="flex gap-1 p-1 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300 shadow-md">
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode("predicted")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "predicted"
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25"
                          : "hover:bg-gray-100 text-gray-700"
                        }`}
                    >
                      <Brain className="w-4 h-4" />
                      AI
                    </motion.button>
                    <motion.button
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode("all")}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "all"
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25"
                          : "hover:bg-gray-100 text-gray-700"
                        }`}
                    >
                      <Database className="w-4 h-4" />
                      All
                    </motion.button>
                  </div>
                </div>

                {/* Map Header */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-300 shadow-md">
                      <span className="text-sm font-medium text-gray-900">
                        {filteredMarkers.length} colleges
                      </span>
                    </div>
                    <div className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 backdrop-blur-sm rounded-lg border border-blue-200 shadow-md">
                      <span className="text-sm font-medium flex items-center gap-2 text-blue-700">
                        <Satellite className="w-4 h-4" />
                        Zoom: {zoomLevel}x
                      </span>
                    </div>
                  </div>
                </div>

                {/* Google Maps */}
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={{
                      width: '100%',
                      height: '100%'
                    }}
                    center={mapCenter}
                    zoom={zoomLevel}
                    options={{
                      zoomControl: true,
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: false,
                      minZoom: 7,
                      maxZoom: 15,
                      styles: [
                        {
                          featureType: 'administrative',
                          elementType: 'geometry',
                          stylers: [{ visibility: 'off' }]
                        },
                        {
                          featureType: 'poi',
                          stylers: [{ visibility: 'off' }]
                        },
                        {
                          featureType: 'road',
                          elementType: 'labels.icon',
                          stylers: [{ visibility: 'off' }]
                        },
                        {
                          featureType: 'transit',
                          stylers: [{ visibility: 'off' }]
                        },
                        {
                          featureType: 'administrative.country',
                          elementType: 'geometry.stroke',
                          stylers: [{ visibility: 'off' }]
                        },
                        {
                          featureType: 'administrative.province',
                          elementType: 'geometry.stroke',
                          stylers: [{ color: '#ffffff', weight: 2 }]
                        }
                      ]
                    }}
                    onLoad={(map) => {
                      // Restrict view to Maharashtra state only
                      const maharashtraBounds = {
                        north: 22.0,
                        south: 15.6,
                        east: 80.9,
                        west: 72.6
                      };
                      map.fitBounds(maharashtraBounds);
                    }}
                  >
                    {filteredMarkers.map(marker => {
                      const color = getMarkerColor(marker.admission_chance);

                      return (
                        <Marker
                          key={marker.id}
                          position={{ lat: marker.lat, lng: marker.lng }}
                          onClick={() => {
                            const college = colleges.find(c => c.college_code === marker.id);
                            if (college) setSelectedCollege(college);
                          }}
                          icon={{
                            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="3"/>
                                <circle cx="16" cy="16" r="8" fill="white"/>
                                <text x="16" y="20" text-anchor="middle" fill="${color}" font-size="10" font-weight="bold">
                                  ${Math.round(marker.admission_chance)}%
                                </text>
                                ${marker.is_predicted && viewMode === "predicted" ? `
                                  <polygon points="24,6 28,10 24,10" fill="yellow"/>
                                ` : ''}
                              </svg>
                            `)}`,
                            scaledSize: new google.maps.Size(32, 32),
                            anchor: new google.maps.Point(16, 32)
                          }}
                        />
                      );
                    })}

                    {selectedCollege && (
                      <InfoWindow
                        position={{
                          lat: selectedCollege.latitude || getCityCoordinates(selectedCollege.city).lat,
                          lng: selectedCollege.longitude || getCityCoordinates(selectedCollege.city).lng
                        }}
                        onCloseClick={() => setSelectedCollege(null)}
                      >
                        <div className="p-3 max-w-sm">
                          <div className="flex items-start gap-3">
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                              style={{ backgroundColor: getMarkerColor(Math.max(...selectedCollege.branches.map(b => b.admission_chance))) }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-gray-900 truncate">{selectedCollege.college_name}</div>
                              <div className="text-xs text-gray-600 mb-2">{selectedCollege.city}, {selectedCollege.state}</div>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="flex items-center gap-1">
                                  <Target className="w-3 h-3 text-green-600" />
                                  {Math.round(Math.max(...selectedCollege.branches.map(b => b.admission_chance)))}% chance
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3 text-blue-600" />
                                  {selectedCollege.branches.length} branches
                                </span>
                              </div>
                              {selectedCollege.is_predicted && (
                                <div className="flex items-center gap-1 mt-2">
                                  <Sparkles className="w-3 h-3 text-yellow-600" />
                                  <span className="text-xs text-yellow-600 font-medium">AI Recommended</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Globe className="w-12 h-12 text-gray-400 mx-auto mb-3 animate-spin" />
                      <p className="text-gray-500">Loading Google Maps...</p>
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 z-10">
                  <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <TargetIcon className="w-4 h-4" />
                      Admission Chance
                    </h4>
                    <div className="space-y-2">
                      {[
                        { label: "High (80%+)", color: "#10B981" },
                        { label: "Good (60-79%)", color: "#3B82F6" },
                        { label: "Average (40-59%)", color: "#8B5CF6" },
                        { label: "Low (<40%)", color: "#EF4444" }
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-gray-300">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Colleges List */}
              {!isFullScreen && (
                <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden">
                  <div className="p-4 border-b border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-400" />
                        Colleges ({filteredColleges.length})
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search colleges..."
                            className="pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-64"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto p-2">
                    {filteredColleges.length === 0 ? (
                      <div className="text-center py-8">
                        <Globe className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No colleges found with current filters</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredColleges.map((college) => {
                          const isSaved = savedColleges.includes(college.college_code);
                          const maxChance = Math.max(...college.branches.map(b => b.admission_chance));
                          const fitColor = getFitColor(maxChance);

                          return (
                            <motion.div
                              key={college.college_code}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              whileHover={{ scale: 1.01 }}
                              onClick={() => setSelectedCollege(college)}
                              className={`p-3 rounded-xl cursor-pointer transition-all ${selectedCollege?.college_code === college.college_code
                                  ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/50'
                                  : 'hover:bg-gray-800/50'
                                }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-2 h-2 rounded-full ${fitColor}`} />
                                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${fitColor} text-white`}>
                                      {getChanceLabel(maxChance)} ({Math.round(maxChance)}%)
                                    </span>
                                    {college.is_predicted && (
                                      <span className="text-xs px-2 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-lg flex items-center gap-1">
                                        <Brain className="w-3 h-3" />
                                        AI Match
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-400">
                                      {college.branches.length} branches
                                    </span>
                                  </div>

                                  <h4 className="font-semibold truncate">{college.college_name}</h4>
                                  <div className="flex items-center text-gray-400 text-sm mt-1">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    <span className="truncate">{college.city}, {college.state}</span>
                                    <span className="mx-2">•</span>
                                    <span className="flex items-center gap-1">
                                      <IndianRupee className="w-3 h-3" />
                                      ₹{college.average_package_lpa}L avg
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {college.branches.slice(0, 3).map((branch, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 bg-gray-900/50 text-gray-300 rounded text-xs"
                                      >
                                        {branch.branch}
                                      </span>
                                    ))}
                                    {college.branches.length > 3 && (
                                      <span className="px-2 py-1 bg-gray-900/50 text-gray-400 rounded text-xs">
                                        +{college.branches.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSaveCollege(college.college_code);
                                  }}
                                  className="ml-2 text-gray-400 hover:text-yellow-400 transition-colors"
                                >
                                  {isSaved ? (
                                    <BookmarkCheck className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                  ) : (
                                    <Bookmark className="w-5 h-5" />
                                  )}
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Selected College Details */}
              {!isFullScreen && (
                <AnimatePresence>
                  {selectedCollege && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold">{selectedCollege.college_name}</h3>
                            {selectedCollege.is_predicted && (
                              <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-sm font-medium flex items-center gap-2">
                                <Brain className="w-4 h-4" />
                                AI Recommended
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-gray-400">
                            <span className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {selectedCollege.city}, {selectedCollege.state}
                            </span>
                            <span className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              {selectedCollege.autonomy_status}
                            </span>
                            <span className="flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Placement: {selectedCollege.placement_rate}%
                            </span>
                            <span className="flex items-center gap-2">
                              <Home className="w-4 h-4" />
                              Hostel: {selectedCollege.hostel_available}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedCollege(null)}
                          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Admission Chances */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-3">Admission Probability by Branch</h4>
                            <div className="space-y-3">
                              {selectedCollege.branches.map((branch, idx) => (
                                <div key={idx} className="bg-gray-900/50 rounded-xl p-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium">{branch.branch}</span>
                                    <span className={`px-2 py-1 rounded-lg text-sm font-medium ${getFitColor(branch.admission_chance)}`}>
                                      {Math.round(branch.admission_chance)}%
                                    </span>
                                  </div>
                                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${branch.admission_chance}%` }}
                                      transition={{ duration: 1, delay: idx * 0.1 }}
                                      className={`h-full ${getFitColor(branch.admission_chance)}`}
                                    />
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                                    <span>Rank ≤ {branch.cutoff_rank}</span>
                                    <span>₹{branch.Fees.toLocaleString()} fees</span>
                                    <span>{branch.seats} seats</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* College Stats */}
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-gray-900/30 rounded-xl">
                              <div className="text-2xl font-bold text-emerald-400">
                                ₹{selectedCollege.average_package_lpa}L
                              </div>
                              <div className="text-sm text-gray-400">Avg Package</div>
                            </div>
                            <div className="text-center p-4 bg-gray-900/30 rounded-xl">
                              <div className="text-2xl font-bold text-blue-400">
                                ₹{selectedCollege.highest_package_lpa}L
                              </div>
                              <div className="text-sm text-gray-400">Highest Package</div>
                            </div>
                            <div className="text-center p-4 bg-gray-900/30 rounded-xl">
                              <div className="text-2xl font-bold text-purple-400">
                                {selectedCollege.branches.length}
                              </div>
                              <div className="text-sm text-gray-400">Branches</div>
                            </div>
                            <div className="text-center p-4 bg-gray-900/30 rounded-xl">
                              <div className="text-2xl font-bold text-indigo-400">
                                {selectedCollege.placement_rate}%
                              </div>
                              <div className="text-sm text-gray-400">Placement Rate</div>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-3">Quick Actions</h4>
                            <div className="flex gap-3">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(`/college/${selectedCollege.college_code}`)}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Full Details
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleSaveCollege(selectedCollege.college_code)}
                                className="px-4 py-3 border border-gray-700 rounded-lg font-semibold hover:bg-gray-800 transition-all flex items-center gap-2"
                              >
                                {savedColleges.includes(selectedCollege.college_code) ? (
                                  <>
                                    <BookmarkCheck className="w-4 h-4" />
                                    Saved
                                  </>
                                ) : (
                                  <>
                                    <Bookmark className="w-4 h-4" />
                                    Save
                                  </>
                                )}
                              </motion.button>
                            </div>
                          </div>
                        </div>

                        {/* Location & Map */}
                        <div className="space-y-6">
                          <div className="bg-gray-900/30 rounded-xl p-4">
                            <h4 className="text-sm font-medium text-gray-300 mb-3">Location Details</h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{selectedCollege.city}, {selectedCollege.state}</span>
                              </div>
                              {selectedCollege.latitude && selectedCollege.longitude && (
                                <div className="text-sm text-gray-400">
                                  Coordinates: {selectedCollege.latitude.toFixed(4)}°N, {selectedCollege.longitude.toFixed(4)}°E
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="bg-gray-900/30 rounded-xl p-4">
                            <h4 className="text-sm font-medium text-gray-300 mb-3">AI Insights</h4>
                            <div className="space-y-2">
                              {selectedCollege.branches
                                .filter(b => b.is_most_probable)
                                .map((branch, idx) => (
                                  <div key={idx} className="flex items-center gap-2 p-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg">
                                    <Target className="w-4 h-4 text-indigo-400" />
                                    <span className="text-sm">
                                      <span className="font-medium">{branch.branch}</span> is your most probable branch
                                    </span>
                                  </div>
                                ))}
                              <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg">
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm">
                                  Match score: {selectedCollege.match_score || 4}/5
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
