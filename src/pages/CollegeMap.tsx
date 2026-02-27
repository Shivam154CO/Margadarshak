import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
  Users,
  Map,
} from "lucide-react";
import axios from "axios";
import { supabase } from "../lib/supabase";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup as LeafletPopup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons for Leaflet
const createLeafletIcon = (chance: number) => {
  let color = "#EF4444";
  if (chance >= 80) color = "#10B981";
  else if (chance >= 60) color = "#3B82F6";
  else if (chance >= 40) color = "#8B5CF6";
  
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
      <span style="color: white; font-size: 10px; font-weight: bold;">${Math.round(chance)}%</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

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
    fees: number;
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

const MAHARASHTRA_CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "Mumbai": { lat: 19.0760, lng: 72.8777 },
  "Pune": { lat: 18.5204, lng: 73.8567 },
  "Nagpur": { lat: 21.1458, lng: 79.0882 },
  "Thane": { lat: 19.1861, lng: 72.9752 },
  "Nashik": { lat: 20.0059, lng: 73.7920 },
  "Aurangabad": { lat: 19.8762, lng: 75.3213 },
  "Navi Mumbai": { lat: 19.0330, lng: 73.0297 },
  "Solapur": { lat: 17.6599, lng: 75.9064 },
  "Kolhapur": { lat: 16.7050, lng: 74.2439 },
  "Amravati": { lat: 20.9333, lng: 77.7500 },
  "Jalgaon": { lat: 20.9969, lng: 75.5636 },
  "Ahmednagar": { lat: 19.0946, lng: 74.7380 },
  "Nanded": { lat: 18.9544, lng: 77.3301 },
  "Sangli": { lat: 16.8544, lng: 74.5643 },
  "Miraj": { lat: 16.8202, lng: 74.2964 },
  "Akola": { lat: 20.7096, lng: 76.9871 },
  "Latur": { lat: 18.4008, lng: 76.5604 },
  "Dhule": { lat: 20.8997, lng: 74.7682 },
  "Chandrapur": { lat: 19.9615, lng: 79.2963 },
  "Parbhani": { lat: 19.2602, lng: 76.4109 },
  "Ratnagiri": { lat: 16.9908, lng: 73.3122 },
  "Gadchiroli": { lat: 19.5089, lng: 80.2867 },
  "Gondia": { lat: 21.4544, lng: 80.2548 },
  "Bhandara": { lat: 21.0768, lng: 79.6525 },
  "Washim": { lat: 20.1154, lng: 77.0478 },
  "Hingoli": { lat: 19.5707, lng: 77.6125 },
  "Osmanabad": { lat: 18.1802, lng: 76.0389 },
  "Beed": { lat: 18.8413, lng: 75.7481 },
  "Jalna": { lat: 19.8322, lng: 75.8817 },
  "Yavatmal": { lat: 20.3889, lng: 78.1209 },
  "Wardha": { lat: 20.7469, lng: 78.5982 },
  "Satara": { lat: 17.6805, lng: 74.0183 },
  "Sangamner": { lat: 19.5656, lng: 74.2142 },
  "Shrirampur": { lat: 19.6247, lng: 74.6569 },
  "Kopargaon": { lat: 19.8788, lng: 74.4773 },
  "Rahuri": { lat: 19.3975, lng: 74.6446 },
  "Malegaon": { lat: 20.5443, lng: 74.5250 },
  "Manmad": { lat: 20.3107, lng: 74.4418 },
  "Yeola": { lat: 20.0427, lng: 74.4818 },
  "Satana": { lat: 20.1609, lng: 74.4750 },
  "Bhiwandi": { lat: 19.2246, lng: 73.0565 },
  "Ulhasnagar": { lat: 19.2095, lng: 73.1647 },
  "Kalyan": { lat: 19.2403, lng: 73.1305 },
  "Dombivli": { lat: 19.2183, lng: 73.0875 },
  "Panvel": { lat: 18.9894, lng: 73.1115 },
  "Karjat": { lat: 18.9104, lng: 73.3267 },
  "Murbad": { lat: 19.0428, lng: 73.3517 },
  "Dahisar": { lat: 19.2494, lng: 72.8522 },
  "Borivali": { lat: 19.2288, lng: 72.8569 },
  "Kandivali": { lat: 19.2051, lng: 72.8496 },
  "Malad": { lat: 19.1831, lng: 72.8429 },
  "Goregaon": { lat: 19.1647, lng: 72.8491 },
  "Andheri": { lat: 19.1197, lng: 72.8468 },
  "Bandra": { lat: 19.0544, lng: 72.8405 },
  "Dadar": { lat: 19.0176, lng: 72.8578 },
  "Worli": { lat: 18.9947, lng: 72.8157 },
  "Chembur": { lat: 19.0526, lng: 72.9005 },
  "Vashi": { lat: 19.0660, lng: 73.0090 },
  "Sanpada": { lat: 19.0631, lng: 73.0223 },
  "Nerul": { lat: 19.0330, lng: 73.0188 },
  "Kharghar": { lat: 19.0469, lng: 73.0665 },
  "Kamothe": { lat: 18.9883, lng: 73.0726 },
  "Taloja": { lat: 18.9500, lng: 73.1333 },
  "Pimpri": { lat: 18.6286, lng: 73.8034 },
  "Chinchwad": { lat: 18.6328, lng: 73.8205 },
  "Bhosari": { lat: 18.6461, lng: 73.8421 },
  "Dapodi": { lat: 18.5644, lng: 73.8168 },
  "Khadki": { lat: 18.5632, lng: 73.8397 },
  "Shivajinagar": { lat: 18.5308, lng: 73.8475 },
  "Swargate": { lat: 18.5018, lng: 73.8636 },
  "Bibwewadi": { lat: 18.4569, lng: 73.8681 },
  "Kondhwa": { lat: 18.4403, lng: 73.8841 },
  "Katraj": { lat: 18.4252, lng: 73.9037 },
  "Warje": { lat: 18.4766, lng: 73.7911 },
  "Kothrud": { lat: 18.5073, lng: 73.8057 },
  "Bavdhan": { lat: 18.5207, lng: 73.7703 },
  "Pashan": { lat: 18.5389, lng: 73.7645 },
  "Baner": { lat: 18.5581, lng: 73.7806 },
  "Aundh": { lat: 18.5600, lng: 73.8001 },
  "Pimple Saudagar": { lat: 18.5990, lng: 73.7853 },
  "Wakad": { lat: 18.5966, lng: 73.7657 },
  "Hinjewadi": { lat: 18.5917, lng: 73.7380 },
  "Moshi": { lat: 18.6728, lng: 73.7239 },
  "Kharadi": { lat: 18.5352, lng: 73.9353 },
  "Wagholi": { lat: 18.4775, lng: 73.9637 },
  "Lohegaon": { lat: 18.4861, lng: 73.9085 },
  "Yerawada": { lat: 18.5047, lng: 73.8843 },
  "Chalisgaon": { lat: 20.4667, lng: 75.0000 },
  "Pachora": { lat: 20.6667, lng: 75.2167 },
  "Jamner": { lat: 20.9500, lng: 75.7833 },
  "Sinnar": { lat: 19.8333, lng: 74.0000 },
  "Dindori": { lat: 20.1167, lng: 73.9333 },
  "Igatpuri": { lat: 19.6833, lng: 73.5667 },
  "Trimbak": { lat: 19.9500, lng: 73.5333 },
  "Khamgaon": { lat: 20.3333, lng: 76.5667 },
  "Malkapur": { lat: 20.9000, lng: 76.5333 },
  "Shegaon": { lat: 20.7833, lng: 76.7000 },
  "Bhusawal": { lat: 21.0033, lng: 75.7919 },
  "Delhi": { lat: 28.7041, lng: 77.1025 },
  "Bangalore": { lat: 12.9716, lng: 77.5946 },
  "Chennai": { lat: 13.0827, lng: 80.2707 },
  "Hyderabad": { lat: 17.3850, lng: 78.4867 },
  "Kolkata": { lat: 22.5726, lng: 88.3639 },
  "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
  "Jaipur": { lat: 26.9124, lng: 75.7873 },
  "Lucknow": { lat: 26.8467, lng: 80.9462 },
  "Bhopal": { lat: 23.2599, lng: 77.4126 },
  "Chandigarh": { lat: 30.7333, lng: 76.7794 },
};

const getCityCoordinates = (city: string): { lat: number; lng: number } => {
  if (!city) return { lat: 19.75, lng: 75.75 };
  const normalizedCity = city.trim();
  if (MAHARASHTRA_CITY_COORDS[normalizedCity]) {
    return MAHARASHTRA_CITY_COORDS[normalizedCity];
  }
  const cityKey = Object.keys(MAHARASHTRA_CITY_COORDS).find(
    key => key.toLowerCase() === normalizedCity.toLowerCase()
  );
  if (cityKey) return MAHARASHTRA_CITY_COORDS[cityKey];
  return { lat: 19.75 + (Math.random() - 0.5) * 2, lng: 75.75 + (Math.random() - 0.5) * 2 };
};

const getStateFromCity = (city: string): string => {
  const cityStateMap: Record<string, string> = {
    "Mumbai": "Maharashtra", "Pune": "Maharashtra", "Nagpur": "Maharashtra",
    "Thane": "Maharashtra", "Nashik": "Maharashtra", "Aurangabad": "Maharashtra",
    "Navi Mumbai": "Maharashtra", "Solapur": "Maharashtra", "Kolhapur": "Maharashtra",
    "Amravati": "Maharashtra", "Jalgaon": "Maharashtra", "Ahmednagar": "Maharashtra",
    "Nanded": "Maharashtra", "Sangli": "Maharashtra", "Akola": "Maharashtra",
    "Latur": "Maharashtra", "Dhule": "Maharashtra", "Chandrapur": "Maharashtra",
    "Parbhani": "Maharashtra", "Ratnagiri": "Maharashtra", "Gadchiroli": "Maharashtra",
    "Gondia": "Maharashtra", "Bhandara": "Maharashtra", "Washim": "Maharashtra",
    "Hingoli": "Maharashtra", "Osmanabad": "Maharashtra", "Beed": "Maharashtra",
    "Jalna": "Maharashtra", "Yavatmal": "Maharashtra", "Wardha": "Maharashtra",
    "Satara": "Maharashtra", "Delhi": "Delhi", "Bangalore": "Karnataka",
    "Chennai": "Tamil Nadu", "Hyderabad": "Telangana", "Kolkata": "West Bengal",
    "Ahmedabad": "Gujarat", "Jaipur": "Rajasthan", "Lucknow": "Uttar Pradesh",
    "Bhopal": "Madhya Pradesh", "Chandigarh": "Chandigarh",
  };
  return cityStateMap[city] || "Maharashtra";
};

export default function InteractiveCollegeMap() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedChance, setSelectedChance] = useState("All Chances");
  const [savedColleges, setSavedColleges] = useState<string[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(8);
  const [mapCenter, setMapCenter] = useState({ lat: 19.75, lng: 75.75 });
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"predicted" | "all">("all");
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [mapProvider, setMapProvider] = useState<"google" | "osm">("osm");

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      const { data: prof } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      return prof as UserProfile | null;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    let isMounted = true;
    const loadColleges = async () => {
      try {
        let allColleges: College[] = [];
        let predictedColleges: College[] = [];

        try {
          const { data: dbColleges, error: dbError } = await supabase.from('colleges_2025').select('*');
          if (dbColleges && !dbError) {
            const collegeMap = new Map<string, College>();
            dbColleges.forEach((college: any) => {
              const coords = getCityCoordinates(college.city);
              if (!collegeMap.has(college.college_code)) {
                collegeMap.set(college.college_code, {
                  college_code: college.college_code,
                  college_name: college.college_name,
                  city: college.city,
                  state: getStateFromCity(college.city),
                  latitude: coords.lat,
                  longitude: coords.lng,
                  autonomy_status: college.autonomy_status || 'Government',
                  placement_rate: college.placement_rate || 0,
                  average_package_lpa: college.average_package_lpa || 0,
                  highest_package_lpa: college.highest_package_lpa || 0,
                  hostel_available: college.hostel_available || 'No',
                  branches: [],
                  is_predicted: false,
                  match_score: 0,
                });
              }
            });
            allColleges = Array.from(collegeMap.values());
            console.log(`✅ Loaded ${allColleges.length} unique colleges from Supabase`);
          }
        } catch (dbErr) {
          console.error("Database fetch error:", dbErr);
        }

        if (profile && allColleges.length > 0) {
          const rank = profile.exam_type === "CET" ? parseFloat(profile.cet_rank || "0") : parseFloat(profile.diploma_rank || "0");
          const score = profile.exam_type === "CET" ? parseFloat(profile.cet_score || "0") : parseFloat(profile.diploma_score || "0");
          const category = profile.category || "OPEN";
          const preferredBranches = profile.preferred_branches || [];

          if (rank && score && preferredBranches.length) {
            try {
              const res = await axios.post("http://127.0.0.1:5001/predict_admission", { score, rank, category, branches: preferredBranches }, { timeout: 30000 });
              const rawData = res.data.colleges || [];
              const predictedMap = new Map<string, College>();

              rawData.forEach((college: any) => {
                const coords = getCityCoordinates(college.city);
                if (!predictedMap.has(college.college_code)) {
                  predictedMap.set(college.college_code, {
                    college_code: college.college_code,
                    college_name: college.college_name,
                    city: college.city,
                    state: getStateFromCity(college.city),
                    latitude: coords.lat,
                    longitude: coords.lng,
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
                  branch_code: college.branch_code || '',
                  admission_chance: college.admission_chance || 50,
                  probability_level: college.probability_level || college.fit || 'Unknown',
                  is_most_probable: college.is_most_probable || false,
                  fees: college.fees || 0,
                  cutoff_rank: college.cutoff_rank || 0,
                  seats: college.seats || 0,
                });
              });
              predictedColleges = Array.from(predictedMap.values());
            } catch (apiErr) {
              console.error("Prediction API failed:", apiErr);
            }
          }
        }

        const finalCollegeMap = new Map<string, College>();
        allColleges.forEach(college => finalCollegeMap.set(college.college_code, { ...college }));
        predictedColleges.forEach(predicted => {
          if (finalCollegeMap.has(predicted.college_code)) {
            const existing = finalCollegeMap.get(predicted.college_code)!;
            finalCollegeMap.set(predicted.college_code, { ...existing, ...predicted, branches: predicted.branches, is_predicted: true, match_score: predicted.match_score });
          } else {
            finalCollegeMap.set(predicted.college_code, predicted);
          }
        });

        const finalColleges = Array.from(finalCollegeMap.values());
        if (isMounted) {
          setColleges(finalColleges);
          const uniqueStates = Array.from(new Set(finalColleges.map(c => c.state))).sort();
          setStates(["All States", ...uniqueStates]);

          const markers = finalColleges.map(college => {
            const coords = getCityCoordinates(college.city);
            return {
              id: college.college_code,
              name: college.college_name,
              city: college.city,
              state: college.state,
              lat: college.latitude || coords.lat,
              lng: college.longitude || coords.lng,
              admission_chance: college.is_predicted && college.branches.length > 0 ? Math.max(...college.branches.map(b => b.admission_chance)) : 50,
              branch_count: college.branches.length || 1,
              placement_rate: college.placement_rate,
              type: college.autonomy_status,
              is_predicted: !!college.is_predicted,
            };
          });
          setMapMarkers(markers);
        }
      } catch (err) {
        console.error("Failed to load colleges", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadColleges();
  }, [profile]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedColleges") || "[]");
    setSavedColleges(saved);
  }, []);

  const filteredMarkers = useMemo(() => {
    return mapMarkers.filter(marker => {
      if (searchTerm && !marker.name.toLowerCase().includes(searchTerm.toLowerCase()) && !marker.city.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedState !== "All States" && marker.state !== selectedState) return false;
      if (selectedType !== "All Types" && marker.type !== selectedType) return false;
      if (selectedChance !== "All Chances") {
        const chance = marker.admission_chance;
        if (selectedChance === "High (80%+)" && chance < 80) return false;
        if (selectedChance === "Good (60-79%)" && (chance < 60 || chance >= 80)) return false;
        if (selectedChance === "Average (40-59%)" && (chance < 40 || chance >= 60)) return false;
        if (selectedChance === "Low (<40%)" && chance >= 40) return false;
      }
      if (viewMode === "predicted" && !marker.is_predicted) return false;
      return true;
    });
  }, [mapMarkers, searchTerm, selectedState, selectedType, selectedChance, viewMode]);

  const filteredColleges = useMemo(() => {
    return colleges.filter(college => filteredMarkers.some(marker => marker.id === college.college_code)).sort((a, b) => {
      const maxA = a.branches.length > 0 ? Math.max(...a.branches.map(b => b.admission_chance)) : 0;
      const maxB = b.branches.length > 0 ? Math.max(...b.branches.map(b => b.admission_chance)) : 0;
      return maxB - maxA;
    });
  }, [colleges, filteredMarkers]);

  const getMarkerColor = (chance: number) => {
    if (chance >= 80) return "#10B981";
    if (chance >= 60) return "#3B82F6";
    if (chance >= 40) return "#8B5CF6";
    return "#EF4444";
  };

  const getChanceLabel = (chance: number) => {
    if (chance >= 80) return "High Chance";
    if (chance >= 60) return "Best Chance";
    if (chance >= 40) return "Good Chance";
    return "Low Chance";
  };

  const getFitColor = (chance: number) => {
    if (chance >= 80) return "bg-gradient-to-r from-emerald-500 to-green-600";
    if (chance >= 60) return "bg-gradient-to-r from-blue-500 to-cyan-600";
    if (chance >= 40) return "bg-gradient-to-r from-indigo-500 to-purple-600";
    return "bg-gradient-to-r from-rose-500 to-pink-600";
  };

  const { isLoaded } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY, libraries: LIBRARIES });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center space-y-6">
          <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1.5, repeat: Infinity } }} className="w-20 h-20 mx-auto">
            <Globe className="w-full h-full text-indigo-500" />
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Loading Interactive Map</h3>
            <p className="text-gray-400">Visualizing colleges across Maharashtra...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render OpenStreetMap (Leaflet)
  const renderOpenStreetMap = () => (
    <MapContainer 
      center={[mapCenter.lat, mapCenter.lng]} 
      zoom={zoomLevel} 
      style={{ width: '100%', height: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {filteredMarkers.map(marker => (
        <LeafletMarker 
          key={marker.id} 
          position={[marker.lat, marker.lng]}
          icon={createLeafletIcon(marker.admission_chance)}
          eventHandlers={{
            click: () => {
              const college = colleges.find(c => c.college_code === marker.id);
              if (college) setSelectedCollege(college);
            },
          }}
        >
          <LeafletPopup>
            <div className="p-2 min-w-[200px]">
              <div className="font-bold text-gray-900 truncate">{marker.name}</div>
              <div className="text-sm text-gray-600 mb-2">{marker.city}, {marker.state}</div>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-green-600" />
                  {Math.round(marker.admission_chance)}% chance
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-600" />
                  {marker.branch_count} branches
                </span>
              </div>
              {marker.is_predicted && (
                <div className="flex items-center gap-1 mt-2">
                  <Sparkles className="w-3 h-3 text-yellow-600" />
                  <span className="text-xs text-yellow-600 font-medium">AI Recommended</span>
                </div>
              )}
            </div>
          </LeafletPopup>
        </LeafletMarker>
      ))}
    </MapContainer>
  );

  // Render Google Maps
  const renderGoogleMap = () => {
    if (!isLoaded) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">Loading Google Maps...</p>
            <p className="text-sm text-gray-400 mt-2">If this takes too long, try switching to OpenStreetMap</p>
          </div>
        </div>
      );
    }

    return (
      <GoogleMap 
        mapContainerStyle={{ width: '100%', height: '100%' }} 
        center={mapCenter} 
        zoom={zoomLevel} 
        options={{ zoomControl: true, streetViewControl: false, mapTypeControl: false, fullscreenControl: false, minZoom: 4, maxZoom: 18 }}
      >
        {filteredMarkers.map(marker => {
          const color = getMarkerColor(marker.admission_chance);
          return (
            <Marker 
              key={marker.id} 
              position={{ lat: marker.lat, lng: marker.lng }} 
              onClick={() => { const college = colleges.find(c => c.college_code === marker.id); if (college) setSelectedCollege(college); }} 
              icon={{ url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="3"/><circle cx="16" cy="16" r="8" fill="white"/><text x="16" y="20" text-anchor="middle" fill="${color}" font-size="10" font-weight="bold">${Math.round(marker.admission_chance)}%</text></svg>`)}`, scaledSize: new google.maps.Size(32, 32), anchor: new google.maps.Point(16, 32) }} 
            />
          );
        })}
        {selectedCollege && (
          <InfoWindow 
            position={{ lat: selectedCollege.latitude || getCityCoordinates(selectedCollege.city).lat, lng: selectedCollege.longitude || getCityCoordinates(selectedCollege.city).lng }} 
            onCloseClick={() => setSelectedCollege(null)}
          >
            <div className="p-3 max-w-sm">
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: getMarkerColor(selectedCollege.branches.length > 0 ? Math.max(...selectedCollege.branches.map(b => b.admission_chance)) : 50) }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-900 truncate">{selectedCollege.college_name}</div>
                  <div className="text-xs text-gray-600 mb-2">{selectedCollege.city}, {selectedCollege.state}</div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-green-600" />
                      {selectedCollege.branches.length > 0 ? Math.round(Math.max(...selectedCollege.branches.map(b => b.admission_chance))) : 50}% chance
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
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 text-gray-900">
      <Navbar activeTab="map" userProfile={profile} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6 lg:gap-8">
          <AnimatePresence>
            {showFilters && !isFullScreen && (
              <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="xl:w-80 space-y-6 order-2 xl:order-1">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                      <FilterIcon className="w-5 h-5 text-blue-500" />Filters
                    </h3>
                    <button 
                      onClick={() => { setSelectedState("All States"); setSelectedType("All Types"); setSelectedChance("All Chances"); setSearchTerm(""); }} 
                      className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1"
                    >
                      <RotateCw className="w-4 h-4" />Reset
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
                          {states.map(state => <option key={state} value={state} className="bg-white">{state}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">College Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["All Types", "Government", "Private", "Autonomous"].map(type => (
                          <motion.button 
                            key={type} 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }} 
                            onClick={() => setSelectedType(type)} 
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedType === type ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                          >
                            {type}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Admission Chance</label>
                      <div className="space-y-2">
                        {["All Chances", "High (80%+)", "Good (60-79%)", "Average (40-59%)", "Low (<40%)"].map(level => (
                          <motion.button 
                            key={level} 
                            whileHover={{ scale: 1.02 }} 
                            whileTap={{ scale: 0.98 }} 
                            onClick={() => setSelectedChance(level)} 
                            className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${selectedChance === level ? "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-700" : "hover:bg-gray-100 text-gray-700"}`}
                          >
                            <span>{level}</span>
                            {selectedChance === level && <CheckCircle className="w-4 h-4 text-blue-500" />}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-6 shadow-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                    <BarChart3 className="w-5 h-5 text-emerald-500" />Statistics
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
                        <div className="text-2xl font-bold text-blue-600">{colleges.filter(c => c.is_predicted).length}</div>
                        <div className="text-xs text-gray-600">AI Matches</div>
                      </div>
                      <div className="text-center p-3 bg-emerald-50 rounded-xl">
                        <div className="text-2xl font-bold text-emerald-600">{savedColleges.length}</div>
                        <div className="text-xs text-gray-600">Saved</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <div className="flex-1">
            <div className="flex flex-col gap-6">
              <div className={`${isFullScreen ? 'fixed inset-0 z-50' : 'bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 overflow-hidden relative h-[600px] shadow-lg'}`}>
                
                {/* Map Provider Toggle */}
                <div className="absolute top-4 right-36 z-10">
                  <div className="flex gap-1 p-1 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300 shadow-md">
                    <motion.button 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }} 
                      onClick={() => setMapProvider("osm")} 
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${mapProvider === "osm" ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg" : "hover:bg-gray-100 text-gray-700"}`}
                    >
                      <Map className="w-4 h-4" />OSM
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }} 
                      onClick={() => setMapProvider("google")} 
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${mapProvider === "google" ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg" : "hover:bg-gray-100 text-gray-700"}`}
                    >
                      <Globe className="w-4 h-4" />Google
                    </motion.button>
                  </div>
                </div>

                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))} className="p-2 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-md">
                    <ZoomIn className="w-5 h-5 text-gray-700" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setZoomLevel(prev => Math.max(prev - 1, 4))} className="p-2 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-md">
                    <ZoomOut className="w-5 h-5 text-gray-700" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setZoomLevel(8); setMapCenter({ lat: 19.75, lng: 75.75 }); }} className="p-2 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-md">
                    <RotateCw className="w-5 h-5 text-gray-700" />
                  </motion.button>
                </div>

                <div className="absolute top-4 right-56 z-10">
                  <div className="flex gap-1 p-1 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-300 shadow-md">
                    <motion.button 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }} 
                      onClick={() => setViewMode("predicted")} 
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "predicted" ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg" : "hover:bg-gray-100 text-gray-700"}`}
                    >
                      <Brain className="w-4 h-4" />AI
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }} 
                      onClick={() => setViewMode("all")} 
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "all" ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg" : "hover:bg-gray-100 text-gray-700"}`}
                    >
                      <Database className="w-4 h-4" />All
                    </motion.button>
                  </div>
                </div>

                <div className="absolute top-4 left-4 z-10">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-300 shadow-md">
                      <span className="text-sm font-medium text-gray-900">{filteredMarkers.length} colleges</span>
                    </div>
                    <div className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 backdrop-blur-sm rounded-lg border border-blue-200 shadow-md">
                      <span className="text-sm font-medium flex items-center gap-2 text-blue-700">
                        <Satellite className="w-4 h-4" />Zoom: {zoomLevel}x
                      </span>
                    </div>
                  </div>
                </div>

                {/* Map Rendering - Switch between OSM and Google */}
                {mapProvider === "osm" ? renderOpenStreetMap() : renderGoogleMap()}

                <div className="absolute bottom-4 left-4 z-10">
                  <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <TargetIcon className="w-4 h-4" />Admission Chance
                    </h4>
                    <div className="space-y-2">
                      {[{ label: "High (80%+)", color: "#10B981" }, { label: "Good (60-79%)", color: "#3B82F6" }, { label: "Average (40-59%)", color: "#8B5CF6" }, { label: "Low (<40%)", color: "#EF4444" }].map(item => (
                        <div key={item.label} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-gray-300">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
