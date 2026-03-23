import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Sparkles, RotateCw, ZoomIn, ZoomOut,
  X, Building2, MapPin, IndianRupee, GraduationCap, ArrowRight, Activity, Layers,
  Home, Train, Shield, Eye, Compass, Users, Share2, Navigation, Globe
} from "lucide-react";
import axios from "axios";
import { supabase } from "@/lib/supabase";
import { GoogleMap, useLoadScript, Marker, Circle } from "@react-google-maps/api";
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup as LeafletPopup, Circle as LeafletCircle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "@/components/Navbar";
import { ROUTES } from "@/constants/routes";

const ML_API_URL = import.meta.env.VITE_ML_API_URL ?? 'http://127.0.0.1:5001';

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
const createLeafletIcon = (chance: number, pulse = false) => {
  let color = "#EF4444";
  if (chance >= 80) color = "#10B981";
  else if (chance >= 60) color = "#3B82F6";
  else if (chance >= 40) color = "#8B5CF6";

  return L.divIcon({
    className: `custom-marker ${pulse ? 'marker-pulse' : ''}`,
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3); position: relative;">
      ${pulse ? `<div style="position: absolute; inset: -4px; border-radius: 50%; background: ${color}; opacity: 0.3; animation: pulse 2s infinite;"></div>` : ''}
      <span style="color: white; font-size: 10px; font-weight: bold; position: relative; z-index: 10;">${chance.toFixed(1)}%</span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const createNeighborIcon = (type: string) => {
  let color = "#6366f1";
  if (type === "pg") color = "#f59e0b";
  if (type === "transit") color = "#10b981";

  return L.divIcon({
    className: "neighbor-marker",
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 6px; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
      <div style="color: white; transform: scale(0.7);">
        ${type === "pg" ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' :
        type === "transit" ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><path d="M9 18h6"/><path d="M10 8h4"/><path d="M8 12h8"/></svg>' :
          '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></svg>'}
      </div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = ["visualization"];

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

import type { UserProfile } from "@/types/user";

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

// Vector distance calculation
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Mock Neighborhood Generation
const generateNeighborhoodData = (centerLat: number, centerLng: number) => {
  const types = ["pg", "essential", "transit"];
  const markers: any[] = [];

  // Deterministic random seeding
  const seed = (centerLat + centerLng) * 1000;
  const pseudoRandom = (i: number) => {
    const x = Math.sin(seed + i) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < 8; i++) {
    const type = types[i % types.length];
    const angle = pseudoRandom(i) * 2 * Math.PI;
    const dist = 0.005 + pseudoRandom(i + 10) * 0.01; // ~500m to 1.5km
    const lat = centerLat + dist * Math.cos(angle);
    const lng = centerLng + dist * Math.sin(angle);

    markers.push({
      id: `neighbor-${i}-${centerLat}`,
      type,
      lat,
      lng,
      name: type === "pg" ? `Student PG ${i + 1}` : type === "essential" ? `Student Hub ${i + 1}` : `Transit Station ${i + 1}`,
      distance: calculateDistance(centerLat, centerLng, lat, lng).toFixed(1)
    });
  }
  return markers;
};

// Mock Alumni Pings for major hubs
const ALUMNI_HUBS = [
  { name: "Hinjewadi IT Park", lat: 18.5917, lng: 73.7380 },
  { name: "BKC Mumbai", lat: 19.0607, lng: 72.8637 },
  { name: "Magarpatta City", lat: 18.5144, lng: 73.9268 },
  { name: "Manyata Tech Park", lat: 13.0451, lng: 77.6204 },
];

const generateAlumniPings = () => {
  const pings: any[] = [];
  ALUMNI_HUBS.forEach((hub, hubIdx) => {
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const dist = 0.002 + Math.random() * 0.005;
      pings.push({
        id: `alumni-${hubIdx}-${i}`,
        name: hub.name,
        lat: hub.lat + dist * Math.cos(angle),
        lng: hub.lng + dist * Math.sin(angle),
        count: Math.floor(Math.random() * 50) + 10
      });
    }
  });
  return pings;
};

export default function InteractiveCollegeMap() {
  return (
    <>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1); opacity: 0.3; }
        }
        .marker-pulse {
          z-index: 1000 !important;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <CollegeMapContent />
    </>
  );
}

function CollegeMapContent() {
  const navigate = useNavigate();
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [zoomLevel, setZoomLevel] = useState(8);
  const [mapCenter, setMapCenter] = useState({ lat: 19.75, lng: 75.75 });
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [mapProvider, setMapProvider] = useState<"google" | "osm">("osm");

  // Advanced Map Feature States
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [filters, setFilters] = useState({ maxFees: 500000, minPlacement: 0, minChance: 0 });
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(['colleges']));
  const [visitList, setVisitList] = useState<College[]>([]);
  const [showVisitPlanner, setShowVisitPlanner] = useState(false);
  const [rangeRadius, setRangeRadius] = useState(20); // km
  const [heatmapType, setHeatmapType] = useState<"none" | "cutoff" | "safety" | "popularity">("none");
  const [whatIfScore, setWhatIfScore] = useState(0); // Boost to admission chance

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
            console.log(`Database: Loaded ${allColleges.length} unique colleges from Supabase`);
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
              const res = await axios.post(`${ML_API_URL}/predict_admission`, { score, rank, category, branches: preferredBranches }, { timeout: 30000 });
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
    return mapMarkers.filter(m => {
      const college = colleges.find(c => c.college_code === m.id);
      if (!college) return false;

      const simulatedChance = Math.min(100, Math.max(0, m.admission_chance + whatIfScore));
      if (simulatedChance < filters.minChance) return false;
      if (m.placement_rate < filters.minPlacement) return false;

      const averageFee = college.branches.length > 0 ? (college.branches.reduce((sum, b) => sum + (b.fees || 0), 0) / college.branches.length) : 0;
      if (filters.maxFees < 500000 && averageFee > filters.maxFees) return false;

      return true;
    }).map(m => ({
      ...m,
      simulated_chance: Math.min(100, Math.max(0, m.admission_chance + whatIfScore))
    }));
  }, [mapMarkers, colleges, filters, whatIfScore]);

  const getMarkerColor = (chance: number) => {
    if (chance >= 80) return "#10B981";
    if (chance >= 60) return "#3B82F6";
    if (chance >= 40) return "#8B5CF6";
    return "#EF4444";
  };

  const { isLoaded } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY, libraries: LIBRARIES });

  const neighborhoodMarkers = useMemo(() => {
    if (!selectedCollege) return [];
    return generateNeighborhoodData(selectedCollege.latitude!, selectedCollege.longitude!);
  }, [selectedCollege]);

  const alumniMarkers = useMemo(() => {
    if (!activeLayers.has('alumni')) return [];
    return generateAlumniPings();
  }, [activeLayers]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
        <Navbar activeTab="map" userProfile={profile} />
        <main className="flex-1 relative w-full overflow-hidden flex flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="text-xl font-semibold text-slate-900">Loading Map</h3>
            <p className="text-slate-500 text-sm">Fetching college data...</p>
          </div>
        </main>
      </div>
    );
  }


  // Render OpenStreetMap (Leaflet)
  const renderOpenStreetMap = () => {

    return (
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={zoomLevel}
        style={{ width: '100%', height: '100%' }}
        className="z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Heatmap Layer */}
        {heatmapType !== "none" && filteredMarkers.map(marker => {
          let color = "rgba(59, 130, 246, 0.2)"; // Blue
          if (heatmapType === "cutoff") color = marker.admission_chance > 70 ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)";
          if (heatmapType === "safety") color = "rgba(139, 92, 246, 0.2)";
          if (heatmapType === "popularity") color = "rgba(245, 158, 11, 0.2)";

          return (
            <LeafletCircle
              key={`heat-${marker.id}`}
              center={[marker.lat, marker.lng]}
              radius={2000}
              pathOptions={{ fillColor: color, color: 'transparent', fillOpacity: 0.6 }}
            />
          );
        })}

        {/* Dynamic Range Ring */}
        {activeLayers.has('range') && (
          <LeafletCircle
            center={[mapCenter.lat, mapCenter.lng]}
            radius={rangeRadius * 1000}
            pathOptions={{ color: '#6366f1', weight: 1, fillOpacity: 0.05, dashArray: '5, 10' }}
          />
        )}

        {/* Alumni Pings */}
        {activeLayers.has('alumni') && alumniMarkers.map(ping => (
          <LeafletMarker
            key={ping.id}
            position={[ping.lat, ping.lng]}
            icon={L.divIcon({
              className: 'alumni-marker',
              html: `<div class="animate-ping absolute inset-0 rounded-full bg-blue-400 opacity-75"></div>
                     <div class="relative bg-blue-600 w-3 h-3 rounded-full border border-white"></div>`,
              iconSize: [12, 12]
            })}
          >
            <LeafletPopup>
              <div className="p-1 font-bold text-xs">{ping.count}+ Alumni at {ping.name}</div>
            </LeafletPopup>
          </LeafletMarker>
        ))}

        {/* Neighborhood Overlays */}
        {selectedCollege && activeLayers.has('essentials') && neighborhoodMarkers.map(neighbor => (
          <LeafletMarker
            key={neighbor.id}
            position={[neighbor.lat, neighbor.lng]}
            icon={createNeighborIcon(neighbor.type)}
          >
            <LeafletPopup>
              <div className="p-1">
                <div className="font-bold text-xs uppercase text-gray-400">{neighbor.type}</div>
                <div className="font-black text-sm">{neighbor.name}</div>
                <div className="text-[10px] text-gray-500 font-bold">{neighbor.distance} km from campus</div>
              </div>
            </LeafletPopup>
          </LeafletMarker>
        ))}

        {/* Colleges */}
        {activeLayers.has('colleges') && filteredMarkers.map(marker => {
          const isHighPlacement = marker.placement_rate >= 90;
          return (
            <LeafletMarker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={createLeafletIcon((marker as any).simulated_chance, isHighPlacement && activeLayers.has('pulse'))}
              eventHandlers={{
                click: () => {
                  const college = colleges.find(c => c.college_code === marker.id);
                  if (college) setSelectedCollege(college);
                },
              }}
            />
          );
        })}
      </MapContainer>
    );
  };

  // Render Google Maps
  const renderGoogleMap = () => {
    if (!isLoaded) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-3 animate-spin" />
            <p className="text-gray-500">Loading Google Maps...</p>
          </div>
        </div>
      );
    }

    const googleNeighborhoodMarkers = neighborhoodMarkers;
    const googleAlumniMarkers = alumniMarkers;

    return (
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={mapCenter}
        zoom={zoomLevel}
        options={{
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          minZoom: 4,
          maxZoom: 18,
          styles: [
            { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
          ]
        }}
      >
        {/* Heatmap Layer */}
        {heatmapType !== "none" && filteredMarkers.map(marker => {
          let color = "#3b82f6";
          if (heatmapType === "cutoff") color = marker.admission_chance > 70 ? "#10b981" : "#ef4444";
          if (heatmapType === "safety") color = "#8b5cf6";
          if (heatmapType === "popularity") color = "#f59e0b";
          return (
            <Circle
              key={`heat-g-${marker.id}`}
              center={{ lat: marker.lat, lng: marker.lng }}
              radius={2000}
              options={{
                fillColor: color,
                fillOpacity: 0.2,
                strokeWeight: 0,
                clickable: false
              }}
            />
          );
        })}

        {/* Dynamic Range Ring */}
        {activeLayers.has('range') && (
          <Circle
            center={mapCenter}
            radius={rangeRadius * 1000}
            options={{
              strokeColor: '#6366f1',
              strokeOpacity: 0.8,
              strokeWeight: 1,
              fillColor: '#6366f1',
              fillOpacity: 0.05,
              clickable: false
            }}
          />
        )}

        {/* Neighborhood Overlays */}
        {selectedCollege && activeLayers.has('essentials') && googleNeighborhoodMarkers.map(neighbor => {
          let color = "#6366f1";
          if (neighbor.type === "pg") color = "#f59e0b";
          if (neighbor.type === "transit") color = "#10b981";
          return (
            <Marker
              key={neighbor.id}
              position={{ lat: neighbor.lat, lng: neighbor.lng }}
              icon={{
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="24" rx="6" fill="${color}" stroke="white" stroke-width="2"/><path d="M12 6l-6 6h12z" fill="white"/></svg>`)}`,
                scaledSize: { width: 24, height: 24 } as any,
                anchor: { x: 12, y: 12 } as any
              }}
              title={neighbor.name}
            />
          );
        })}

        {/* Alumni Pings */}
        {activeLayers.has('alumni') && googleAlumniMarkers.map(ping => (
          <Marker
            key={ping.id}
            position={{ lat: ping.lat, lng: ping.lng }}
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#6366f1" stroke="white" stroke-width="2"/><path d="M12 7l-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5" stroke="white" fill="none"/></svg>`)}`,
              scaledSize: { width: 18, height: 18 } as any,
              anchor: { x: 9, y: 9 } as any
            }}
            title={`${ping.count}+ Alumni at ${ping.name}`}
            onClick={() => alert(`Connect with ${ping.count} alumni at ${ping.name} through our LinkedIn integration!`)}
          />
        ))}

        {/* Colleges & Placement Pulse */}
        {activeLayers.has('colleges') && filteredMarkers.map(marker => {
          const simChance = (marker as any).simulated_chance;
          const color = getMarkerColor(simChance);
          const isHighPlacement = marker.placement_rate >= 90;
          return (
            <React.Fragment key={marker.id}>
              {isHighPlacement && activeLayers.has('pulse') && (
                <Circle
                  center={{ lat: marker.lat, lng: marker.lng }}
                  radius={500}
                  options={{
                    fillColor: '#10b981',
                    fillOpacity: 0.1,
                    strokeColor: '#10b981',
                    strokeWeight: 1,
                    clickable: false
                  }}
                />
              )}
              <Marker
                position={{ lat: marker.lat, lng: marker.lng }}
                onClick={() => { const college = colleges.find(c => c.college_code === marker.id); if (college) setSelectedCollege(college); }}
                icon={{
                  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="3"/><circle cx="16" cy="16" r="8" fill="white"/><text x="16" y="20" text-anchor="middle" fill="${color}" font-size="10" font-weight="bold">${Math.round(simChance)}%</text></svg>`)}`,
                  scaledSize: { width: 32, height: 32 } as any,
                  anchor: { x: 16, y: 32 } as any
                }}
              />
            </React.Fragment>
          );
        })}
      </GoogleMap>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 overflow-hidden">
      <Navbar activeTab="map" userProfile={profile} />

      <main className="flex-1 relative w-full overflow-hidden">
        {/* Map Rendering */}
        {mapProvider === "osm" ? renderOpenStreetMap() : renderGoogleMap()}

        {/* Slide-out College Panel */}
        <AnimatePresence>
          {selectedCollege && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-0 right-0 h-full w-full sm:w-[460px] bg-white shadow-2xl z-[100] flex flex-col border-l border-gray-200"
            >
              {/* Header Image */}
              <div className="relative h-52 w-full flex-shrink-0">
                <img src={getCollegeImage(selectedCollege.college_code)} onError={handleImageError} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <button onClick={() => setSelectedCollege(null)} className="absolute top-4 right-4 p-2 bg-black/25 hover:bg-black/50 backdrop-blur-sm rounded-full text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
                {selectedCollege.is_predicted && (
                  <div className="absolute top-4 left-4 bg-amber-400 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> AI Recommended
                  </div>
                )}
                <div className="absolute bottom-4 left-5 right-5">
                  <h2 className="text-lg font-bold text-white leading-snug mb-1 pr-6">{selectedCollege.college_name}</h2>
                  <div className="flex items-center gap-3 text-white/75 text-sm">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-indigo-300" />{selectedCollege.city}</span>
                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-indigo-300" />{selectedCollege.autonomy_status}</span>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto bg-white">
                {/* Quick Action Buttons */}
                <div className="px-5 py-4 flex gap-2 border-b border-gray-100">
                  <button
                    onClick={() => {
                      if (!selectedCollege) return;
                      window.open(`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${selectedCollege.latitude},${selectedCollege.longitude}&heading=0&pitch=0`, '_blank');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Street View
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedCollege) return;
                      window.open(`https://www.openstreetmap.org/?mlat=${selectedCollege.latitude}&mlon=${selectedCollege.longitude}#map=18/${selectedCollege.latitude}/${selectedCollege.longitude}`, '_blank');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5" /> View Map
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedCollege) return;
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedCollege.latitude},${selectedCollege.longitude}&travelmode=transit`, '_blank');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors"
                  >
                    <Train className="w-3.5 h-3.5" /> Directions
                  </button>
                </div>

                <div className="p-5 space-y-5">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 rounded-2xl p-4">
                      <p className="text-xs text-emerald-700 font-medium mb-1">Admission Chance</p>
                      <p className="text-2xl font-bold text-emerald-800">
                        {selectedCollege.branches.length > 0 ? Math.min(100, Math.max(...selectedCollege.branches.map(b => b.admission_chance)) + whatIfScore).toFixed(1) : "—"}%
                      </p>
                      {whatIfScore > 0 && (
                        <p className="text-[11px] text-emerald-600 mt-0.5">+{whatIfScore}% simulated</p>
                      )}
                    </div>
                    <div className="bg-blue-50 rounded-2xl p-4">
                      <p className="text-xs text-blue-700 font-medium mb-1">Avg. Package</p>
                      <p className="text-2xl font-bold text-blue-800">
                        {selectedCollege.average_package_lpa > 0 ? `₹${selectedCollege.average_package_lpa}L` : '—'}
                      </p>
                    </div>
                    <div className="bg-violet-50 rounded-2xl p-4">
                      <p className="text-xs text-violet-700 font-medium mb-1">Branches</p>
                      <p className="text-2xl font-bold text-violet-800">{selectedCollege.branches.length}</p>
                    </div>
                    <div className="bg-orange-50 rounded-2xl p-4">
                      <p className="text-xs text-orange-700 font-medium mb-1">Placement</p>
                      <p className="text-2xl font-bold text-orange-800">
                        {selectedCollege.placement_rate > 0 ? `${selectedCollege.placement_rate}%` : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Transit & Neighborhood */}
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Train className="w-4 h-4 text-indigo-500" /> Nearby Locations
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {(() => {
                        const transit = neighborhoodMarkers.find(n => n.type === 'transit');
                        const pg = neighborhoodMarkers.find(n => n.type === 'pg');
                        return (
                          <>
                            <div>
                              <p className="text-xs text-gray-500">Nearest Transit</p>
                              <p className="text-sm font-semibold text-gray-800">{transit ? `${transit.distance} km` : '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Nearest PG</p>
                              <p className="text-sm font-semibold text-gray-800">{pg ? `${pg.distance} km` : '—'}</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                      <p className="text-xs text-gray-500 flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-500" /> {neighborhoodMarkers.length} nearby places</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`w-2.5 h-1 rounded-full ${i < Math.min(5, neighborhoodMarkers.length) ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Branches List */}
                  {selectedCollege.branches.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-500" /> Branches & Admission Chances
                      </p>
                      <div className="space-y-2">
                        {selectedCollege.branches.sort((a, b) => b.admission_chance - a.admission_chance).map((b, i) => {
                          const finalChance = Math.min(100, Math.max(0, b.admission_chance + whatIfScore));
                          return (
                            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 hover:border-indigo-200 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 pr-3">
                                  <p className="text-sm font-semibold text-gray-900 leading-snug">{b.branch}</p>
                                  {b.branch_code && (
                                    <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded mt-1 inline-block">{b.branch_code}</span>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-xs text-gray-400 mb-0.5">Chance</p>
                                  <p className={`text-lg font-bold ${finalChance >= 80 ? 'text-emerald-600' : finalChance >= 50 ? 'text-blue-600' : 'text-red-500'}`}>
                                    {finalChance.toFixed(1)}%
                                  </p>
                                </div>
                              </div>

                              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden my-4 relative">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${finalChance}%` }}
                                  className={`absolute left-0 top-0 h-full ${finalChance >= 80 ? 'bg-emerald-500' : finalChance >= 50 ? 'bg-blue-500' : 'bg-red-500'}`}
                                />
                                {/* What if original vs new indicator */}
                                {whatIfScore > 0 && b.admission_chance > 0 && (
                                  <div className="absolute h-full w-0.5 bg-gray-900 opacity-50 z-10" style={{ left: `${b.admission_chance}%` }} title="Original Chance" />
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm font-bold text-gray-700 pt-2">
                                <span className="flex items-center gap-2"><IndianRupee className="w-4 h-4 text-gray-400" /> ₹{b.fees?.toLocaleString() || 'N/A'}</span>
                                <span className="flex items-center gap-2 justify-end"><GraduationCap className="w-4 h-4 text-gray-400" /> {b.seats} Seats</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                  }
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-5 py-4 bg-white border-t border-gray-100 flex-shrink-0 space-y-2">
                <button
                  className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border ${visitList.some(c => c.college_code === selectedCollege.college_code)
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
                    }`}
                  onClick={() => {
                    if (visitList.some(c => c.college_code === selectedCollege.college_code)) {
                      setVisitList(prev => prev.filter(c => c.college_code !== selectedCollege.college_code));
                    } else {
                      setVisitList(prev => [...prev, selectedCollege]);
                    }
                  }}
                >
                  <Navigation className="w-4 h-4" />
                  {visitList.some(c => c.college_code === selectedCollege.college_code) ? 'Added to Visit List' : 'Add to Visit List'}
                </button>
                <button
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                  onClick={() => {
                    if (selectedCollege?.college_code) {
                      navigate(ROUTES.COLLEGE_BY_CODE.replace(':code', selectedCollege.college_code));
                    }
                  }}
                >
                  View Full Profile <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Filters Dock */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[40]">
          <div className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-[0_10px_50px_-15px_rgba(0,0,0,0.2)] rounded-[1.5rem] p-2 flex flex-col items-center max-w-[90vw]">

            <AnimatePresence>
              {filtersOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="w-[320px] sm:w-[400px] overflow-hidden rounded-t-[1.5rem]"
                >
                  <div className="p-6 space-y-8 pb-8 border-b border-gray-100 w-full bg-white">
                    {/* What-If Simulation */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-800">What-If Simulation</span>
                        <span className="text-sm font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">+{whatIfScore}%</span>
                      </div>
                      <input
                        type="range" min="0" max="30" value={whatIfScore}
                        onChange={(e) => setWhatIfScore(parseInt(e.target.value))}
                        className="w-full accent-indigo-600 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-xs text-gray-400">Simulate your chances if you scored higher in MHT-CET / JEE</p>
                    </div>

                    {/* Minimum Placement */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-800">Min. Placement Rate</span>
                        <span className="text-sm font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">{filters.minPlacement}%+</span>
                      </div>
                      <input
                        type="range" min="0" max="100" step="5" value={filters.minPlacement}
                        onChange={(e) => setFilters(p => ({ ...p, minPlacement: parseInt(e.target.value) }))}
                        className="w-full accent-emerald-600 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Max Budget */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-800">Max Yearly Fees</span>
                        <span className="text-sm font-medium text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg">
                          {filters.maxFees >= 500000 ? "No Limit" : `₹${(filters.maxFees / 1000).toFixed(0)}k`}
                        </span>
                      </div>
                      <input
                        type="range" min="50000" max="500000" step="10000" value={filters.maxFees}
                        onChange={(e) => setFilters(p => ({ ...p, maxFees: parseInt(e.target.value) }))}
                        className="w-full accent-orange-500 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between w-full p-1.5 gap-2 bg-white rounded-xl">
              <button
                onClick={() => { setFiltersOpen(!filtersOpen); setLayersOpen(false); }}
                className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${filtersOpen ? 'bg-gray-900 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'}`}
              >
                Filters
              </button>

              <button
                onClick={() => { setLayersOpen(!layersOpen); setFiltersOpen(false); }}
                className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${layersOpen ? 'bg-gray-900 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'}`}
              >
                Map Layers
              </button>

              {visitList.length > 0 && (
                <button
                  onClick={() => setShowVisitPlanner(true)}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
                >
                  <Navigation className="w-4 h-4" /> Plan ({visitList.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Layers Menu Panel */}
        <AnimatePresence>
          {layersOpen && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[40] w-[320px] sm:w-[450px]"
            >
              <div className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-[1.5rem] p-6 space-y-6">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">Map Layers</h3>
                  <button onClick={() => setLayersOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'colleges', label: 'Colleges', icon: Building2, color: 'text-blue-600' },
                    { id: 'essentials', label: 'Nearby Essentials', icon: Home, color: 'text-orange-500' },
                    { id: 'pulse', label: 'Placement Pulse', icon: Activity, color: 'text-emerald-500' },
                    { id: 'alumni', label: 'Alumni Pings', icon: Users, color: 'text-indigo-500' },
                    { id: 'range', label: 'Travel Radius', icon: Target, color: 'text-purple-500' },
                  ].map(layer => (
                    <button
                      key={layer.id}
                      onClick={() => {
                        const newLayers = new Set(activeLayers);
                        if (newLayers.has(layer.id)) newLayers.delete(layer.id);
                        else newLayers.add(layer.id);
                        setActiveLayers(newLayers);
                      }}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${activeLayers.has(layer.id)
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                        : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-gray-200'
                        }`}
                    >
                      <span className="text-xs font-medium">{layer.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500">Map Provider</p>
                  <div className="flex gap-2">
                    {[
                      { id: 'osm', label: 'OpenStreetMap' },
                      { id: 'google', label: 'Google Maps' },
                    ].map(provider => (
                      <button
                        key={provider.id}
                        onClick={() => setMapProvider(provider.id as any)}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${mapProvider === provider.id
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        {provider.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500">Heatmap Overlay</p>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { id: 'none', label: 'None' },
                      { id: 'cutoff', label: 'Cut-off' },
                      { id: 'safety', label: 'Safety' },
                      { id: 'popularity', label: 'Popularity' },
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => setHeatmapType(type.id as any)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${heatmapType === type.id
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activeLayers.has('range') && (
                  <div className="space-y-2 pt-3">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Travel Radius</span>
                      <span className="font-semibold text-indigo-600">{rangeRadius} km</span>
                    </div>
                    <input
                      type="range" min="5" max="50" step="5" value={rangeRadius}
                      onChange={(e) => setRangeRadius(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Visit Planner Modal */}
        <AnimatePresence>
          {showVisitPlanner && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Route Planner</h2>
                    <p className="text-xs text-gray-400">{visitList.length} college{visitList.length !== 1 ? 's' : ''} in your route</p>
                  </div>
                  <button onClick={() => setShowVisitPlanner(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Route legs */}
                <div className="flex-1 overflow-y-auto p-5 space-y-1">
                  {visitList.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-8">Add colleges from the map to plan your route.</p>
                  ) : (
                    visitList.map((col, idx) => {
                      const next = visitList[idx + 1];
                      const legDist = (next && col.latitude && col.longitude && next.latitude && next.longitude)
                        ? calculateDistance(col.latitude!, col.longitude!, next.latitude!, next.longitude!)
                        : null;
                      const legMins = legDist ? Math.round((legDist / 40) * 60) : null;
                      const legH = legMins ? Math.floor(legMins / 60) : 0;
                      const legM = legMins ? legMins % 60 : 0;
                      return (
                        <div key={col.college_code}>
                          {/* College stop card */}
                          <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 hover:border-indigo-100 transition-colors">
                            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-indigo-600 text-white'
                              : idx === visitList.length - 1 ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-600'
                              }`}>
                              {idx === 0 ? 'S' : idx === visitList.length - 1 ? 'E' : idx}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{col.college_name}</p>
                              <p className="text-xs text-gray-400">{col.city}</p>
                            </div>
                            <button
                              onClick={() => setVisitList(prev => prev.filter(c => c.college_code !== col.college_code))}
                              className="p-1 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Leg connector — distance + time */}
                          {next && (
                            <div className="flex items-center gap-3 px-4 py-2">
                              <div className="w-0.5 h-5 bg-gray-200 ml-3 flex-shrink-0" />
                              {legDist !== null ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                    {legDist.toFixed(1)} km
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    ~{legH > 0 ? `${legH}h ` : ''}{legM} min drive
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-300">No coordinates</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Summary + action */}
                {visitList.length > 1 && (() => {
                  let totalDist = 0;
                  for (let i = 0; i < visitList.length - 1; i++) {
                    const a = visitList[i], b = visitList[i + 1];
                    if (a.latitude && a.longitude && b.latitude && b.longitude)
                      totalDist += calculateDistance(a.latitude!, a.longitude!, b.latitude!, b.longitude!);
                  }
                  const totalMins = Math.round((totalDist / 40) * 60);
                  const h = Math.floor(totalMins / 60);
                  const m = totalMins % 60;
                  return (
                    <div className="border-t border-gray-100 p-5 bg-gray-50 flex-shrink-0 space-y-4">
                      <div className="flex items-center justify-around">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-0.5">Total Distance</p>
                          <p className="text-xl font-bold text-gray-900">{totalDist.toFixed(1)} <span className="text-sm font-normal text-gray-500">km</span></p>
                        </div>
                        <div className="w-px h-10 bg-gray-200" />
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-0.5">Drive Time</p>
                          <p className="text-xl font-bold text-gray-900">{h > 0 ? `${h}h ` : ''}{m} <span className="text-sm font-normal text-gray-500">min</span></p>
                        </div>
                        <div className="w-px h-10 bg-gray-200" />
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-0.5">Stops</p>
                          <p className="text-xl font-bold text-gray-900">{visitList.length}</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-400 text-center">Distances are straight-line (Haversine) · actual road distance will be higher</p>
                      <button
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                        onClick={() => {
                          const origin = visitList[0];
                          const destination = visitList[visitList.length - 1];
                          const waypoints = visitList.slice(1, -1);
                          const url = `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}${waypoints.length ? `&waypoints=${waypoints.map(c => `${c.latitude},${c.longitude}`).join('|')}` : ''}&travelmode=driving`;
                          window.open(url, '_blank');
                        }}
                      >
                        Get turn-by-turn in Google Maps <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })()}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Action Controls - Right Side */}
        <div className="absolute right-6 top-24 z-[40] flex flex-col gap-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))} className="p-3.5 bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-200 shadow-xl transition-colors">
            <ZoomIn className="w-5 h-5" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setZoomLevel(prev => Math.max(prev - 1, 4))} className="p-3.5 bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-200 shadow-xl transition-colors">
            <ZoomOut className="w-5 h-5" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setZoomLevel(8); setMapCenter({ lat: 19.75, lng: 75.75 }); }} className="p-3.5 bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-200 shadow-xl transition-colors mt-2">
            <RotateCw className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Legend - Top Left */}
        <div className="absolute top-24 left-6 z-[40] hidden sm:block">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200 p-5 shadow-xl">
            <h4 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              Admission Chance
            </h4>
            <div className="flex flex-col gap-3">
              {[{ label: ">80% chance", color: "#10B981" }, { label: "60–80%", color: "#3B82F6" }, { label: "40–60%", color: "#8B5CF6" }, { label: "<40%", color: "#EF4444" }].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
