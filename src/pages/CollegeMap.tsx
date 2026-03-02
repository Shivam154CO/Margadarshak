import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  LucideMap, Globe, Target, Sparkles, RotateCw, ZoomIn, ZoomOut, Database
} from "lucide-react";
import axios from "axios";
import { supabase } from "../lib/supabase";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup as LeafletPopup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "../components/Navbar";

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const getCollegeImage = (collegeCode: string): string => {
  if (!collegeCode) {
    return "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  }
  try {
    const viteUrl = new URL(`../assets/${collegeCode}/campus.png`, import.meta.url).href;
    if (viteUrl && !viteUrl.includes('undefined')) return viteUrl;
    return `/src/assets/${collegeCode}/campus.png`;
  } catch (e) {
    return "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  }
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  e.currentTarget.onerror = null;
};

// Custom marker icons for Leaflet
const createLeafletIcon = (chance: number) => {
  let color = "#EF4444";
  if (chance >= 80) color = "#10B981";
  else if (chance >= 60) color = "#3B82F6";
  else if (chance >= 40) color = "#8B5CF6";

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
      <span style="color: white; font-size: 10px; font-weight: bold;">${chance.toFixed(1)}%</span>
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
  image?: string;
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
  // Deterministic random if city not found
  let hash = 0;
  for (let i = 0; i < normalizedCity.length; i++) {
    hash = normalizedCity.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = (hash % 200) / 100 - 1;
  const lngOffset = ((hash >> 8) % 200) / 100 - 1;
  return { lat: 19.75 + latOffset, lng: 75.75 + lngOffset };
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
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [zoomLevel, setZoomLevel] = useState(8);
  const [mapCenter, setMapCenter] = useState({ lat: 19.75, lng: 75.75 });
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
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
              const collegeCode = college.college_code?.toString() || college.id?.toString();

              if (!collegeCode) return;

              if (!collegeMap.has(collegeCode)) {
                collegeMap.set(collegeCode, {
                  college_code: collegeCode,
                  college_name: college.college_name || 'Unknown College',
                  city: college.city || 'Unknown',
                  state: getStateFromCity(college.city),
                  latitude: coords.lat,
                  longitude: coords.lng,
                  autonomy_status: college.autonomy_status || 'Government',
                  placement_rate: college.placement_rate || 0,
                  average_package_lpa: college.average_package_lpa || 0,
                  highest_package_lpa: college.highest_package_lpa || 0,
                  hostel_available: college.hostel_available || 'No',
                  image: college.image_url || getCollegeImage(collegeCode),
                  branches: [],
                  is_predicted: false,
                  match_score: 0,
                });
              }

              const existingCollege = collegeMap.get(collegeCode)!;
              const branchCode = college.branch_code?.toString();
              if (branchCode && !existingCollege.branches.find(b => b.branch_code === branchCode)) {
                existingCollege.branches.push({
                  branch: college.branch_name || college.branch || 'Unknown',
                  branch_code: branchCode,
                  admission_chance: 50,
                  probability_level: 'View Details',
                  is_most_probable: false,
                  fees: college.fees || 0,
                  cutoff_rank: college.cutoff_rank || 0,
                  seats: college.seats || 0,
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
                    image: college.image || getCollegeImage(college.college_code),
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

  const filteredMarkers = useMemo(() => {
    return mapMarkers;
  }, [mapMarkers]);

  const getMarkerColor = (chance: number) => {
    if (chance >= 80) return "#10B981";
    if (chance >= 60) return "#3B82F6";
    if (chance >= 40) return "#8B5CF6";
    return "#EF4444";
  };

  const { isLoaded } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY, libraries: LIBRARIES });

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden">
        <Navbar activeTab="map" userProfile={profile} />
        <main className="flex-1 relative w-full overflow-hidden flex flex-col items-center justify-center">
          {/* Subtle themed background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative z-10 text-center space-y-8 max-w-md px-6">
            <div className="relative mx-auto w-24 h-24">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-blue-500 rounded-full blur-3xl"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="relative w-full h-full border-2 border-dashed border-blue-200 rounded-full flex items-center justify-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl rotate-12 shadow-xl flex items-center justify-center">
                  <Globe className="w-8 h-8 text-white -rotate-12" />
                </div>
              </motion.div>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Syncing Live Map</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                Aggregating real-time database results for over 13,000 engineering colleges...
              </p>
            </div>

            {/* Skeleton Loading Bar */}
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-1/2 h-full bg-gradient-to-r from-transparent via-blue-600 to-transparent"
              />
            </div>

            <div className="flex justify-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">13K+</div>
                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Colleges</div>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">LIVE</div>
                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Database</div>
              </div>
            </div>
          </div>
        </main>
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
            <div className="p-0 min-w-[220px]">
              <div className="relative h-24 w-full overflow-hidden rounded-t-lg mb-2">
                <img
                  src={getCollegeImage(marker.id)}
                  alt={marker.name}
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                />
                {marker.is_predicted && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> AI RECOMMENDED
                  </div>
                )}
              </div>
              <div className="px-2 pb-2">
                <div className="font-bold text-gray-900 truncate leading-tight mb-1">{marker.name}</div>
                <div className="text-[11px] text-gray-600 mb-2 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> {marker.city}, {marker.state}
                </div>
                <div className="flex items-center justify-between text-[11px] font-medium border-t border-gray-100 pt-2">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Target className="w-3 h-3" /> {marker.admission_chance.toFixed(1)}% Chance
                  </span>
                  <span className="flex items-center gap-1 text-blue-600">
                    <Database className="w-3 h-3" /> {marker.branch_count} Branches
                  </span>
                </div>
              </div>
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
            <div className="p-0 min-w-[240px]">
              <div className="relative h-28 w-full overflow-hidden rounded-t-lg mb-2">
                <img
                  src={getCollegeImage(selectedCollege.college_code)}
                  alt={selectedCollege.college_name}
                  onError={handleImageError}
                  className="w-full h-full object-cover"
                />
                {selectedCollege.is_predicted && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> AI RECOMMENDED
                  </div>
                )}
              </div>
              <div className="px-3 pb-3">
                <div className="font-bold text-gray-900 truncate mb-1">{selectedCollege.college_name}</div>
                <div className="text-[11px] text-gray-600 mb-3 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> {selectedCollege.city}, {selectedCollege.state}
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold border-t border-gray-100 pt-3">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Target className="w-3.5 h-3.5" />
                    {selectedCollege.branches.length > 0 ? Math.max(...selectedCollege.branches.map(b => b.admission_chance)).toFixed(1) : "50.0"}% Chance
                  </span>
                  <span className="flex items-center gap-1 text-blue-600">
                    <Database className="w-3.5 h-3.5" />
                    {selectedCollege.branches.length} Branches
                  </span>
                </div>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 overflow-hidden">
      <Navbar activeTab="map" userProfile={profile} />

      <main className="flex-1 relative w-full overflow-hidden">
        {/* Map Rendering */}
        {mapProvider === "osm" ? renderOpenStreetMap() : renderGoogleMap()}

        {/* Floating Controls Overlay */}
        <div className="absolute inset-x-0 top-0 pointer-events-none p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl border border-gray-200 shadow-xl flex items-center gap-2">
                <LucideMap className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-bold text-gray-900">{filteredMarkers.length} Colleges Found</span>
              </div>
            </div>

            <div className="flex gap-2 p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMapProvider("osm")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${mapProvider === "osm" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "hover:bg-gray-100 text-gray-600"}`}
              >
                OSM
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMapProvider("google")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${mapProvider === "google" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "hover:bg-gray-100 text-gray-600"}`}
              >
                Google
              </motion.button>
            </div>
          </div>
        </div>

        {/* Action Controls - Right Side */}
        <div className="absolute right-4 top-24 z-10 flex flex-col gap-2">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))} className="p-3 bg-white/90 backdrop-blur-md rounded-xl border border-gray-200 hover:bg-gray-50 shadow-xl">
            <ZoomIn className="w-6 h-6 text-gray-700" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setZoomLevel(prev => Math.max(prev - 1, 4))} className="p-3 bg-white/90 backdrop-blur-md rounded-xl border border-gray-200 hover:bg-gray-50 shadow-xl">
            <ZoomOut className="w-6 h-6 text-gray-700" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setZoomLevel(8); setMapCenter({ lat: 19.75, lng: 75.75 }); }} className="p-3 bg-white/90 backdrop-blur-md rounded-xl border border-gray-200 hover:bg-gray-50 shadow-xl">
            <RotateCw className="w-6 h-6 text-gray-700" />
          </motion.button>
        </div>

        {/* Legend - Bottom */}
        <div className="absolute bottom-6 left-6 z-10">
          <div className="bg-gray-950/90 backdrop-blur-md rounded-2xl border border-gray-800 p-5 shadow-2xl">
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              Admission Chance
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {[{ label: "Very High", color: "#10B981" }, { label: "High", color: "#3B82F6" }, { label: "Moderate", color: "#8B5CF6" }, { label: "Low", color: "#EF4444" }].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full shadow-inner" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-bold text-gray-300">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
