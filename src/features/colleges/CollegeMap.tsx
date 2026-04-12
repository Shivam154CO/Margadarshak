import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Sparkles, RotateCw, ZoomIn, ZoomOut,
  X, Building2, MapPin, IndianRupee, GraduationCap, ArrowRight, Activity, Layers,
  Home, Train, Shield, Eye, Compass, Users, Navigation, Globe, Car
} from "lucide-react";
import axios from "axios";
import { supabase } from "@/lib/supabase";
import { GoogleMap, useLoadScript, Marker, Circle, Polyline as GooglePolyline, DirectionsRenderer, TrafficLayer, StreetViewPanorama } from "@react-google-maps/api";
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup as LeafletPopup, Circle as LeafletCircle, Polyline as LeafletPolyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "@/components/Navbar";
import { ROUTES } from "@/constants/routes";
import { calculateDistance } from "./utils/geoUtils";
import { RoutePlannerModal } from "./components/RoutePlannerModal";

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

// Custom marker icons for Leaflet - Replicating Startup Arena Style
// Memoized icon creator to prevent expensive re-renders
const iconCache = new Map<string, L.DivIcon>();

const getLeafletIcon = (college: MapMarker, isSelected: boolean) => {
  const chance = college.admission_chance;
  let color = "#EF4444";
  if (chance >= 80) color = "#10B981";
  else if (chance >= 60) color = "#3B82F6";
  else if (chance >= 40) color = "#8B5CF6";

  const cacheKey = `fast-${isSelected}-${color}`;
  if (iconCache.has(cacheKey)) return iconCache.get(cacheKey)!;

  const icon = L.divIcon({
    className: `custom-marker-container ${isSelected ? 'active-marker z-[1000]' : ''}`,
    html: `
      <div class="map-marker-box ${isSelected ? 'glow' : ''}" style="border-color: ${color}; background: #18181b; outline: ${isSelected ? `2px solid ${color}` : 'none'} ">
        <div style="color: white; font-weight: bold; font-size: 14px; font-family: ui-sans-serif, system-ui, sans-serif;">
           ${isSelected ? '★' : '•'}
        </div>
      </div>
    `,
    iconSize: isSelected ? [36, 36] : [24, 24],
    iconAnchor: isSelected ? [18, 18] : [12, 12],
  });

  iconCache.set(cacheKey, icon);
  return icon;
};

const neighborIconCache = new Map<string, L.DivIcon>();
const getNeighborIcon = (type: string) => {
  if (neighborIconCache.has(type)) return neighborIconCache.get(type)!;

  let color = "#6366f1";
  if (type === "pg") color = "#f59e0b";
  if (type === "transit") color = "#10b981";

  const icon = L.divIcon({
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

  neighborIconCache.set(type, icon);
  return icon;
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
  average_fee?: number;
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

// Vector distance calculation is now imported from geoUtils

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
        @keyframes marker-glow {
          0% { box-shadow: 0 0 5px currentColor; }
          50% { box-shadow: 0 0 20px currentColor; }
          100% { box-shadow: 0 0 5px currentColor; }
        }
        
        .custom-marker-container {
          background: transparent !important;
          border: none !important;
        }

        .map-marker-box {
          width: 100%;
          height: 100%;
          background: #18181b;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease-out;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        }

        .map-marker-box:hover {
          transform: scale(1.2);
          z-index: 999;
          border-color: white !important;
        }

        .active-marker .map-marker-box {
          transform: scale(1.15);
          z-index: 1000;
        }

        .glow {
          box-shadow: 0 0 15px currentColor;
          color: inherit;
        }

        .marker-logo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.9;
        }

        .chance-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid #18181b;
          z-index: 2;
        }

        /* Sleek custom scrollbar for better visibility/scrolling */
        .premium-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .premium-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .premium-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .premium-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .leaflet-container {
          background: #09090b !important;
        }

        .city-label-container {
          background: transparent !important;
          border: none !important;
        }
        
        .city-label {
          color: rgba(255, 255, 255, 0.7);
          font-weight: 800;
          font-size: 15px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          text-shadow: 0 0 10px rgba(0,0,0,0.8);
          pointer-events: none;
          white-space: nowrap;
          text-align: center;
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
              average_fee: college.branches.length > 0 ? (college.branches.reduce((sum, b) => sum + (b.fees || 0), 0) / college.branches.length) : 0,
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

  // Major cities to label on the map for orientation
  const majorCities = useMemo(() => [
    { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
    { name: "Pune", lat: 18.5204, lng: 73.8567 },
    { name: "Nagpur", lat: 21.1458, lng: 79.0882 },
    { name: "Nashik", lat: 20.0059, lng: 73.7920 },
    { name: "Aurangabad", lat: 19.8762, lng: 75.3213 },
    { name: "Kolhapur", lat: 16.7050, lng: 74.2439 },
    { name: "Amravati", lat: 20.9333, lng: 77.7500 },
    { name: "Nanded", lat: 18.9544, lng: 77.3301 },
  ], []);

  const filteredMarkers = useMemo(() => {
    return mapMarkers.filter(m => {
      const simulatedChance = Math.min(100, Math.max(0, m.admission_chance + whatIfScore));
      if (simulatedChance < filters.minChance) return false;
      if (m.placement_rate < filters.minPlacement) return false;

      if (filters.maxFees < 500000 && m.average_fee && m.average_fee > filters.maxFees) return false;

      return true;
    }).map(m => ({
      ...m,
      simulated_chance: Math.min(100, Math.max(0, m.admission_chance + whatIfScore))
    }));
  }, [mapMarkers, filters, whatIfScore]);



  const { isLoaded } = useLoadScript({ googleMapsApiKey: GOOGLE_MAPS_API_KEY, libraries: LIBRARIES });

  const neighborhoodMarkers = useMemo(() => {
    if (!selectedCollege) return [];
    return generateNeighborhoodData(selectedCollege.latitude!, selectedCollege.longitude!);
  }, [selectedCollege]);

  const alumniMarkers = useMemo(() => {
    if (!activeLayers.has('alumni')) return [];
    return generateAlumniPings();
  }, [activeLayers]);

  // Derived coordinates for Route Polyline
  const visitRouteCoords = useMemo(() => {
    return visitList
      .filter(c => c.latitude != null && c.longitude != null)
      .map(c => ({ lat: c.latitude as number, lng: c.longitude as number }));
  }, [visitList]);

  const [osmRouteCoords, setOsmRouteCoords] = useState<{lat: number, lng: number}[]>([]);
  const [googleRouteResponse, setGoogleRouteResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [directionsPanel, setDirectionsPanel] = useState<HTMLElement | null>(null);
  const [isNavPinned, setIsNavPinned] = useState(false);
  const [streetViewPos, setStreetViewPos] = useState<{lat: number, lng: number} | null>(null);
  const [isSplitView, setIsSplitView] = useState(false);

  // Fetch OSRM Route for OpenStreetMap
  useEffect(() => {
    if (mapProvider === 'osm' && visitRouteCoords.length > 1) {
      const fetchOsmRoute = async () => {
        try {
          const coordinatesString = visitRouteCoords.map(c => `${c.lng},${c.lat}`).join(';');
          const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`);
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates;
            setOsmRouteCoords(coords.map((c: any) => ({ lat: c[1], lng: c[0] })));
          }
        } catch (error) {
          console.error("OSRM route fetch failed", error);
        }
      };
      fetchOsmRoute();
    } else {
      setOsmRouteCoords([]);
    }
  }, [visitRouteCoords, mapProvider]);

  // Fetch Google Directions for Google Map
  useEffect(() => {
    if (mapProvider === 'google' && visitRouteCoords.length > 1 && isLoaded) {
      const directionsService = new window.google.maps.DirectionsService();
      const origin = visitRouteCoords[0];
      const destination = visitRouteCoords[visitRouteCoords.length - 1];
      const waypoints = visitRouteCoords.slice(1, -1).map(coord => ({
        location: coord,
        stopover: true
      }));

      directionsService.route({
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING
      }).then(result => {
        setGoogleRouteResponse(result);
      }).catch(err => {
        console.error("Error fetching google directions", err);
      });
    } else {
      setGoogleRouteResponse(null);
    }
  }, [visitRouteCoords, mapProvider, isLoaded]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
        <Navbar activeTab="map" userProfile={profile} />
        <main className="flex-1 relative w-full overflow-hidden flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">Loading Map...</span>
          </div>
        </main>
      </div>
    );
  }


// Smooth Map Recenter Controller
function MapRecenter({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom, {
      animate: true,
      duration: 1.5,
      easeLinearity: 0.25
    });
  }, [center, zoom, map]);
  return null;
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
        preferCanvas={true}
      >
        <MapRecenter center={mapCenter} zoom={zoomLevel} />
        
        {/* City Labels Overlay */}
        {majorCities.map(city => (
          <LeafletMarker
            key={`city-${city.name}`}
            position={[city.lat, city.lng]}
            icon={L.divIcon({
              className: 'city-label-container',
              html: `<div class="city-label">${city.name}</div>`,
              iconSize: [100, 20],
              iconAnchor: [50, 10]
            })}
            interactive={false}
          />
        ))}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          updateWhenIdle={true}
          updateWhenZooming={false}
        />

        {/* Visit Route Polyline */}
        {osmRouteCoords.length > 1 ? (
          <LeafletPolyline
            positions={osmRouteCoords}
            pathOptions={{ color: '#4f46e5', weight: 5, opacity: 0.8 }}
          />
        ) : visitRouteCoords.length > 1 && (
          <LeafletPolyline
            positions={visitRouteCoords}
            pathOptions={{ color: '#4f46e5', weight: 4, opacity: 0.5, dashArray: '5, 10' }}
          />
        )}

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
            icon={getNeighborIcon(neighbor.type)}
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
          const isSelected = selectedCollege?.college_code === marker.id;
          return (
            <LeafletMarker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={getLeafletIcon(marker, isSelected)}
              eventHandlers={{
                click: () => {
                  const college = colleges.find(c => c.college_code === marker.id);
                  if (college) {
                    setSelectedCollege(college);
                    setMapCenter({ lat: marker.lat, lng: marker.lng });
                  }
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
      <div className="relative w-full h-full flex flex-col md:flex-row overflow-hidden">
        {/* Main Map Container */}
        <div className={`relative transition-all duration-500 ease-in-out ${isSplitView ? 'w-full md:w-1/2 h-1/2 md:h-full' : 'w-full h-full'}`}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={zoomLevel}
            options={{
              zoomControl: false,
              streetViewControl: true,
              mapTypeControl: true,
              fullscreenControl: true,
              minZoom: 4,
              maxZoom: 18,
              styles: [
                { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
                { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] }
              ]
            }}
          >
            {/* Real-time Traffic Layer */}
            {activeLayers.has('traffic') && <TrafficLayer />}

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

            {/* Visit Route Polyline / Directions */}
            {googleRouteResponse ? (
              <DirectionsRenderer
                directions={googleRouteResponse}
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: '#4f46e5',
                    strokeOpacity: 0.8,
                    strokeWeight: 5,
                  }
                }}
                panel={(!isNavPinned ? directionsPanel : null) as any}
              />
            ) : visitRouteCoords.length > 1 ? (
              <GooglePolyline
                path={visitRouteCoords}
                options={{
                  strokeColor: '#4f46e5',
                  strokeOpacity: 0.5,
                  strokeWeight: 4,
                }}
              />
            ) : null}

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

            {/* Neighborhood Markers (Filtered/Essentials) */}
            {activeLayers.has('essentials') && googleNeighborhoodMarkers.map(marker => (
              <Marker
                key={marker.id}
                position={{ lat: marker.lat, lng: marker.lng }}
                icon={{
                  url: `https://maps.google.com/mapfiles/ms/icons/${marker.type === 'pg' ? 'orange' : marker.type === 'transit' ? 'green' : 'blue'}-dot.png`,
                  scaledSize: new google.maps.Size(32, 32)
                }}
                title={marker.name}
              />
            ))}

            {/* Alumni Pings */}
            {activeLayers.has('alumni') && googleAlumniMarkers.map(marker => (
              <Marker
                key={marker.id}
                position={{ lat: marker.lat, lng: marker.lng }}
                icon={{
                  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="#6366f1" stroke="white" stroke-width="2"/></svg>`)}`,
                  scaledSize: new google.maps.Size(18, 18),
                  anchor: new google.maps.Point(9, 9)
                }}
                title={`${marker.count}+ Alumni`}
              />
            ))}

            {/* College Markers (Google) */}
            {filteredMarkers.map(marker => (
              <Marker
                key={`g-${marker.id}`}
                position={{ lat: marker.lat, lng: marker.lng }}
                onClick={() => {
                  const college = filteredMarkers.find(c => c.id === marker.id);
                  if (college) {
                     // Find full college data if needed
                     setSelectedCollege(marker as any); 
                     setMapCenter({ lat: marker.lat, lng: marker.lng });
                     setZoomLevel(15);
                     setStreetViewPos({ lat: marker.lat, lng: marker.lng });
                  }
                }}
                icon={{
                  url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="40" height="40" rx="10" fill="#18181b" stroke="${marker.admission_chance > 80 ? '#10b981' : marker.admission_chance > 50 ? '#3b82f6' : '#ef4444'}" stroke-width="2"/>
                      <circle cx="20" cy="20" r="14" fill="white" fill-opacity="0.1"/>
                    </svg>
                  `),
                  scaledSize: new google.maps.Size(40, 40),
                  anchor: new google.maps.Point(20, 20)
                }}
              />
            ))}
          </GoogleMap>

          {/* Floating Navigation Pinned Panel */}
          {isNavPinned && googleRouteResponse && (
            <div className="absolute top-6 left-6 z-[45] w-[300px] h-[400px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
               <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white/90 backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-slate-900">Live Directions</h3>
                  <button onClick={() => setIsNavPinned(false)} className="p-1 hover:bg-slate-100 rounded-md">
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto premium-scrollbar bg-slate-50" ref={setDirectionsPanel} />
            </div>
          )}
        </div>

        {/* Street View / 3D Module Panel */}
        {isSplitView && (
          <div className="w-full md:w-1/2 h-1/2 md:h-full relative bg-slate-900 border-l border-white/10 shadow-2xl">
            <StreetViewPanorama
              options={{
                position: streetViewPos || mapCenter,
                visible: true,
                addressControl: true,
                showRoadLabels: true,
                motionTracking: true,
                zoomControl: true,
                panControl: true,
                enableCloseButton: false
              }}
            />
            <button
              onClick={() => setIsSplitView(false)}
              className="absolute top-6 right-6 z-[60] p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-xl border border-white/20 text-white transition-all shadow-2xl"
            >
              <Globe className="w-5 h-5 mr-1 inline" /> Switch to 2D
            </button>
          </div>
        )}

        {/* Split View Toggle Controls (Bottom Right) */}
        {!isSplitView && googleRouteResponse && (
           <div className="absolute right-6 bottom-32 z-[40]">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSplitView(true)}
                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-2xl transition-all border border-indigo-500/20"
              >
                <Compass className="w-5 h-5" /> 3D Explorer
              </motion.button>
           </div>
        )}
      </div>
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
              className="absolute top-0 right-0 h-full w-full sm:w-[460px] bg-slate-950/80 backdrop-blur-xl z-[100] flex flex-col border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              {/* Header Image */}
              <div className="relative h-52 w-full flex-shrink-0">
                <img src={getCollegeImage(selectedCollege.college_code)} onError={handleImageError} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <button onClick={() => setSelectedCollege(null)} className="absolute top-4 right-4 p-2 bg-black/25 hover:bg-black/50 backdrop-blur-sm rounded-full text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
                {selectedCollege.is_predicted && (
                  <div className="absolute top-4 left-4 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
                    <Sparkles className="w-3.5 h-3.5" /> Predicted Suggestion
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
              <div className="flex-1 overflow-y-auto bg-transparent premium-scrollbar touch-pan-y">
                {/* Quick Action Buttons */}
                <div className="px-5 py-4 flex gap-2 border-b border-white/5">
                  <button
                    onClick={() => {
                      if (!selectedCollege || !selectedCollege.latitude || !selectedCollege.longitude) return;
                      setStreetViewPos({ lat: selectedCollege.latitude, lng: selectedCollege.longitude });
                      setIsSplitView(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 text-white/70 rounded-xl text-[11px] font-bold hover:bg-white/10 transition-colors border border-white/5"
                  >
                    <Eye className="w-3.5 h-3.5" /> Street View
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedCollege || !selectedCollege.latitude || !selectedCollege.longitude) return;
                      setMapCenter({ lat: selectedCollege.latitude, lng: selectedCollege.longitude });
                      setZoomLevel(18);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 text-white/70 rounded-xl text-[11px] font-bold hover:bg-white/10 transition-colors border border-white/5"
                  >
                    <Compass className="w-3.5 h-3.5" /> View Map
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedCollege) return;
                      // Fallback to external for full transit directions if route not planned yet
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedCollege.latitude},${selectedCollege.longitude}&travelmode=transit`, '_blank');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-[11px] font-bold hover:bg-emerald-500/20 transition-colors border border-emerald-500/10"
                  >
                    <Train className="w-3.5 h-3.5" /> Directions
                  </button>
                </div>

                <div className="p-5 space-y-5">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p className="text-xs text-white/50 font-medium mb-1">Admission Chance</p>
                      <p className="text-2xl font-bold text-emerald-400">
                        {selectedCollege.branches.length > 0 ? Math.min(100, Math.max(...selectedCollege.branches.map(b => b.admission_chance)) + whatIfScore).toFixed(1) : "—"}%
                      </p>
                      {whatIfScore > 0 && (
                        <p className="text-[11px] text-emerald-500/70 mt-0.5">+{whatIfScore}% simulation</p>
                      )}
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p className="text-xs text-white/50 font-medium mb-1">Avg. Package</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {selectedCollege.average_package_lpa > 0 ? `₹${selectedCollege.average_package_lpa}L` : '—'}
                      </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p className="text-xs text-white/50 font-medium mb-1">Branches</p>
                      <p className="text-2xl font-bold text-violet-400">{selectedCollege.branches.length}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p className="text-xs text-white/50 font-medium mb-1">Placement</p>
                      <p className="text-2xl font-bold text-orange-400">
                        {selectedCollege.placement_rate > 0 ? `${selectedCollege.placement_rate}%` : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Transit & Neighborhood */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-white/90 flex items-center gap-2">
                      <Train className="w-4 h-4 text-indigo-400" /> Nearby Locations
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {(() => {
                        const transit = neighborhoodMarkers.find(n => n.type === 'transit');
                        const pg = neighborhoodMarkers.find(n => n.type === 'pg');
                        return (
                          <>
                            <div>
                              <p className="text-xs text-white/50">Nearest Transit</p>
                              <p className="text-sm font-semibold text-white/80">{transit ? `${transit.distance} km` : '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-white/50">Nearest PG</p>
                              <p className="text-sm font-semibold text-white/80">{pg ? `${pg.distance} km` : '—'}</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/10">
                      <p className="text-xs text-white/40 flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-500" /> {neighborhoodMarkers.length} nearby places</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className={`w-2.5 h-1 rounded-full ${i < Math.min(5, neighborhoodMarkers.length) ? 'bg-emerald-500' : 'bg-white/10'}`} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Branches List */}
                  {selectedCollege.branches.length > 0 && (
                    <div>
                      <p className="text-sm font-bold text-white/90 mb-4 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-400" /> Admission Odds
                      </p>
                      <div className="space-y-3">
                        {selectedCollege.branches.sort((a, b) => b.admission_chance - a.admission_chance).map((b, i) => {
                          const finalChance = Math.min(100, Math.max(0, b.admission_chance + whatIfScore));
                          return (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all hover:bg-white/[0.08]">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 pr-3">
                                  <p className="text-sm font-bold text-white/90 leading-snug">{b.branch}</p>
                                  {b.branch_code && (
                                    <span className="text-[10px] text-white/40 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded mt-1.5 inline-block font-mono uppercase tracking-tighter">{b.branch_code}</span>
                                  )}
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-[10px] text-white/30 font-bold mb-0.5">Chance</p>
                                  <p className={`text-lg font-bold ${finalChance >= 80 ? 'text-emerald-400' : finalChance >= 50 ? 'text-blue-400' : 'text-rose-500'}`}>
                                    {finalChance.toFixed(1)}%
                                  </p>
                                </div>
                              </div>

                              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden my-4 relative">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${finalChance}%` }}
                                  className={`absolute left-0 top-0 h-full ${finalChance >= 80 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : finalChance >= 50 ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-xs font-black text-white/60 pt-2 uppercase tracking-widest">
                                <span className="flex items-center gap-2"><IndianRupee className="w-3.5 h-3.5 text-white/20" /> ₹{b.fees?.toLocaleString() || 'N/A'}</span>
                                <span className="flex items-center gap-2 justify-end"><GraduationCap className="w-3.5 h-3.5 text-white/20" /> {b.seats} Seats</span>
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
              <div className="px-5 py-4 bg-slate-900/50 backdrop-blur-md border-t border-white/5 flex-shrink-0 space-y-2">
                <button
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${visitList.some(c => c.college_code === selectedCollege.college_code)
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
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
                  className="w-full py-3 bg-white text-black rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
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
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[40]">
          <div className="bg-slate-950/80 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-1.5 flex flex-col items-center max-w-[90vw]">

            <AnimatePresence>
              {filtersOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="w-[320px] sm:w-[400px] overflow-hidden rounded-t-[1.5rem]"
                >
                  <div className="p-6 space-y-8 pb-8 border-b border-white/5 w-full bg-transparent">
                    {/* What-If Simulation */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-white">Score Simulator</p>
                          <p className="text-[10px] text-white/50 uppercase tracking-widest">Adjust potential rank boost</p>
                        </div>
                        <span className="text-xs font-bold text-indigo-400 underline decoration-indigo-500/30 underline-offset-4">+{whatIfScore}%</span>
                      </div>
                      <input
                        type="range" min="0" max="30" value={whatIfScore}
                        onChange={(e) => setWhatIfScore(parseInt(e.target.value))}
                        className="w-full accent-indigo-500 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Minimum Placement */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-white">Min. Placement</p>
                          <p className="text-[10px] text-white/50 uppercase tracking-widest">Filter by campus placements</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 underline decoration-emerald-500/30 underline-offset-4">{filters.minPlacement}%+</span>
                      </div>
                      <input
                        type="range" min="0" max="100" step="5" value={filters.minPlacement}
                        onChange={(e) => setFilters(p => ({ ...p, minPlacement: parseInt(e.target.value) }))}
                        className="w-full accent-emerald-500 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Max Budget */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-white">Max. Fees</p>
                          <p className="text-[10px] text-white/50 uppercase tracking-widest">Yearly tuition budget</p>
                        </div>
                        <span className="text-xs font-bold text-amber-500 underline decoration-amber-500/30 underline-offset-4">
                          {filters.maxFees >= 500000 ? "Any" : `₹${(filters.maxFees / 1000).toFixed(0)}k`}
                        </span>
                      </div>
                      <input
                        type="range" min="50000" max="500000" step="10000" value={filters.maxFees}
                        onChange={(e) => setFilters(p => ({ ...p, maxFees: parseInt(e.target.value) }))}
                        className="w-full accent-amber-500 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between w-full p-1 gap-1 bg-transparent rounded-full">
              <button
                onClick={() => { setFiltersOpen(!filtersOpen); setLayersOpen(false); }}
                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${filtersOpen ? 'bg-white text-black' : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'}`}
              >
                Filters
              </button>

              <button
                onClick={() => { setLayersOpen(!layersOpen); setFiltersOpen(false); }}
                className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${layersOpen ? 'bg-white text-black' : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'}`}
              >
                Layers
              </button>

              {visitList.length > 0 && (
                <button
                  onClick={() => setShowVisitPlanner(true)}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                >
                  <Navigation className="w-3 h-3" /> Plan ({visitList.length})
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
              className="absolute bottom-28 left-1/2 -translate-x-1/2 z-[40] w-[320px] sm:w-[450px]"
            >
              <div className="bg-slate-950/80 border border-white/10 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-8 space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Map Configuration</h3>
                  <button onClick={() => setLayersOpen(false)} className="text-white/20 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all"><X className="w-5 h-5" /></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'colleges', label: 'Colleges', icon: Building2 },
                    { id: 'traffic', label: 'Live Traffic', icon: Car },
                    { id: 'essentials', label: 'Nearby Essentials', icon: Home },
                    { id: 'pulse', label: 'Placement Pulse', icon: Activity },
                    { id: 'alumni', label: 'Alumni Pings', icon: Users },
                    { id: 'range', label: 'Travel Radius', icon: Target },
                  ].map(layer => (
                    <button
                      key={layer.id}
                      onClick={() => {
                        const newLayers = new Set(activeLayers);
                        if (newLayers.has(layer.id)) newLayers.delete(layer.id);
                        else newLayers.add(layer.id);
                        setActiveLayers(newLayers);
                      }}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${activeLayers.has(layer.id)
                        ? 'bg-white text-black border-white shadow-[0_10px_20px_-5px_rgba(255,255,255,0.2)]'
                        : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:text-white/70'
                        }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">{layer.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Map Provider</p>
                  <div className="flex gap-2">
                    {[
                      { id: 'osm', label: 'OpenStreetMap' },
                      { id: 'google', label: 'Google Maps' },
                    ].map(provider => (
                      <button
                        key={provider.id}
                        onClick={() => setMapProvider(provider.id as any)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${mapProvider === provider.id
                          ? 'bg-white text-black border-white'
                          : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
                          }`}
                      >
                        {provider.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Heatmap Overlay</p>
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
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${heatmapType === type.id
                          ? 'bg-indigo-500 text-white border-indigo-500 shadow-[0_10px_20px_-5px_rgba(99,102,241,0.4)]'
                          : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
                          }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activeLayers.has('range') && (
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/30">
                      <span>Travel Radius</span>
                      <span className="text-white">{rangeRadius} km</span>
                    </div>
                    <input
                      type="range" min="5" max="50" step="5" value={rangeRadius}
                      onChange={(e) => setRangeRadius(parseInt(e.target.value))}
                      className="w-full accent-white h-1 bg-white/5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Visit Planner Modal */}
        <RoutePlannerModal
          showVisitPlanner={showVisitPlanner}
          setShowVisitPlanner={setShowVisitPlanner}
          visitList={visitList}
          setVisitList={setVisitList as any}
          mapProvider={mapProvider}
          googleRouteResponse={googleRouteResponse}
          setDirectionsPanel={setDirectionsPanel}
          setMapCenter={setMapCenter}
          setZoomLevel={setZoomLevel}
          isNavPinned={isNavPinned}
          setIsNavPinned={setIsNavPinned}
          setIsSplitView={setIsSplitView}
        />

        {/* Action Controls - Bottom Left (Replicating Startup Arena) */}
        <div className="absolute left-6 bottom-10 z-[40] flex flex-col gap-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))} className="p-3 bg-slate-900/90 backdrop-blur-xl rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/30 shadow-2xl transition-all">
            <ZoomIn className="w-5 h-5" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setZoomLevel(prev => Math.max(prev - 1, 4))} className="p-3 bg-slate-900/90 backdrop-blur-xl rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/30 shadow-2xl transition-all">
            <ZoomOut className="w-5 h-5" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setZoomLevel(8); setMapCenter({ lat: 19.75, lng: 75.75 }); }} className="p-3 bg-slate-900/90 backdrop-blur-xl rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/30 shadow-2xl transition-all mt-2">
            <RotateCw className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Legend - Top Left */}
        <div className="absolute top-24 left-6 z-[40] hidden sm:block">
          <div className="bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-2xl">
            <h4 className="text-[10px] font-black text-white/30 mb-4 flex items-center gap-2 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
              Admission Chance
            </h4>
            <div className="flex flex-col gap-3">
              {[{ label: ">80% chance", color: "#10B981" }, { label: "60–80%", color: "#3B82F6" }, { label: "40–60%", color: "#8B5CF6" }, { label: "<40%", color: "#EF4444" }].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] text-white/60 font-black uppercase tracking-widest">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
