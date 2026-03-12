import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bookmark,
  Share2,
  MapPin,
  BookOpen,
  Clock,
  Building,
  Trophy,
  Globe,
  Phone,
  FileText,
  Target,
  AlertTriangle,
  CheckCircle,
  Cpu,
  ShieldCheck,
  Brain,
  RefreshCw,
  AlertCircle,
  School,
  Eye,
  Layers,
  CreditCard,
  Bot,
  Home,
  Newspaper,
  MessageSquare,
  Briefcase,
  ChevronDown,
  Download,
  Users,
  Users as UserGroup,
  Star,
  X,
  Send,
  DollarSign,
  Award,
  TrendingUp,
  Mail,
  Calendar,
  Wifi,
  Car,
  Library,
  ThumbsUp,
  Percent,
  Navigation,
  Route,
  Locate,
  MapPinned,
  ChevronUp,
  Image as ImageIcon,
  Tag,
  PieChart,
  GraduationCap,
  ExternalLink,
  ClipboardList,
  Zap
} from 'lucide-react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Breadcrumbs from "../components/Breadcrumbs";
import ReviewModal from "../components/ReviewModal";
import { getCategoryColor } from '../utils/collegeHelpers';
import seatMatrixMap from "../assets/seat_matrix_map.json";
import seatMatrixPDF from "../assets/2025-26.pdf";

// Add new interfaces
interface BranchInfo {
  branch_code: string;
  branch_name: string;
  seats?: number;
  fees?: number;
  cutoff_rank?: number;
  duration_years?: number;
  degree_type?: string;
  total_intake?: number;
  available_seats?: number;
  categories?: {
    category: string;
    seats: number;
    percentage: number;
    color: string;
  }[];
}


interface SeatMatrix {
  category: string;
  seats: number;
  percentage: number;
  color: string;
}

interface AdmissionProcess {
  step: number;
  title: string;
  description: string;
  deadline?: string;
  required_docs: string[];
}

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: string;
  eligibility: string;
  application_link: string;
  deadline: string;
  type: string;
}

interface Feedback {
  id: string;
  rating: number;
  comment: string;
  user_name: string;
  date: string;
  verified: boolean;
  helpful_count: number;
}

interface College {
  college_code?: string;
  college_name: string;
  short_name?: string;
  city: string;
  district?: string;
  region?: string;
  university?: string;
  autonomy_status: string;
  established_year?: number;
  branch_code?: string;
  branch_name?: string;
  degree_type?: string;
  duration_years?: number;
  shift?: string;
  accreditation?: string;
  year?: number;
  round?: string;
  category?: string;
  cutoff_rank?: number;
  cutoff_percentile?: number;
  total_intake?: number;
  seats?: number;
  fees?: number;
  hostel_fees?: number;
  bus_fees?: number;
  placement_rate: number;
  average_package_lpa?: number;
  highest_package_lpa?: number;
  internship_rate?: number;
  foreign_offers?: number;
  top_recruiters?: string;
  placement_cell_contact?: string;
  hostel_available: string;
  hostel_type?: string;
  labs_count?: number;
  wifi_campus?: string;
  transport_facility?: string;
  medical_facility?: string;
  hostel_capacity?: number;
  image_url?: string;
  logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
  website_url: string;

  fit?: string;
  fit_reason?: string;
  match_score?: number;
  admission_chance?: number;
  is_most_probable?: boolean;
  probability_level?: string;
  display_fees?: string;
  display_cutoff?: string;
  display_placement?: string;

  student_faculty_ratio?: number;
  campus_area?: number;
  library_books?: number;
  sports_facilities?: string;
  clubs_count?: number;
  scholarship_opportunities?: string;
  international_collaborations?: string;
  industry_tie_ups?: number;
  research_papers?: number;
  patents?: number;
  alumni_strength?: number;
  rating?: number;

  image?: string;
  branch?: string;
  cutoff_score?: number;
  Seats?: number;

  // New properties
  branches?: BranchInfo[];
  seat_matrix?: SeatMatrix[];
  admission_process?: AdmissionProcess[];
  scholarships?: Scholarship[];
  feedbacks?: Feedback[];
  average_rating?: number;
  total_feedbacks?: number;
  required_documents?: string[];
  admission_dates?: {
    application_start: string;
    application_end: string;
    merit_list_date: string;
    admission_start: string;
    admission_end: string;
  };
  admission_contacts?: {
    name: string;
    phone: string;
    email: string;
    role: string;
  }[];
}

// Function to get college image from local assets
const getCollegeImage = (collegeCode: string): string => {
  if (!collegeCode) {
    return "/src/assets/fallback-campus.jpg";
  }

  const imagePath = `/ src / assets / ${collegeCode}/campus.png`;
  return imagePath;
};

// Function to get college logo from local assets
const getCollegeLogo = (collegeCode: string): string => {
  if (!collegeCode) {
    return "/src/assets/fallback-logo.jpg";
  }

  const logoPath = `/src/assets/${collegeCode}/logo.png`;
  return logoPath;
};

// Fallback Unsplash images for error cases
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
];

const getRandomFallbackImage = (): string => {
  return FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
};

const RECOMMENDED_SCHOLARSHIPS: Scholarship[] = [
  {
    id: "s1",
    name: "MahaDBT Post-Matric Scholarship",
    provider: "Social Justice & Special Assistance Dept",
    amount: "100% Tuition Fee",
    eligibility: "SC/ST Category Students, Income < 2.5 LPA",
    application_link: "https://mahadbt.maharashtra.gov.in/",
    deadline: "Dec 31, 2025",
    type: "Government"
  },
  {
    id: "s2",
    name: "EBC Fee Reimbursement Scheme",
    provider: "Directorate of Technical Education",
    amount: "50% Tuition Fee",
    eligibility: "Open/SEBC/EWS category, Income < 8 LPA",
    application_link: "https://mahadbt.maharashtra.gov.in/",
    deadline: "Nov 30, 2025",
    type: "Government"
  },
  {
    id: "s3",
    name: "OBC/VJNT Post-Matric Scholarship",
    provider: "VJNT, OBC & SBC Welfare Department",
    amount: "50-100% Tuition Fee",
    eligibility: "OBC/VJNT/SBC category, Income < 1.5 LPA (100%), 1.5-8L (50%)",
    application_link: "https://mahadbt.maharashtra.gov.in/",
    deadline: "Dec 31, 2025",
    type: "Government"
  },
  {
    id: "s4",
    name: "Dr. Panjabrao Deshmukh Hostel Allowance",
    provider: "Directorate of Technical Education",
    amount: "₹30,000 per year",
    eligibility: "Children of Registered Laborers / Small Land Holders",
    application_link: "https://mahadbt.maharashtra.gov.in/",
    deadline: "Jan 15, 2026",
    type: "Government"
  },
  {
    id: "s5",
    name: "Tuition Fee Waiver Scheme (TFWS)",
    provider: "State Common Entrance Test Cell",
    amount: "100% Tuition Fee",
    eligibility: "Merit based seat, Parents' income < 8 LPA",
    application_link: "https://cetcell.mahacet.org/",
    deadline: "July 31, 2025",
    type: "National"
  }
];

interface CollegeImageProps {
  collegeCode: string;
  type: 'campus' | 'logo';
  className?: string;
  alt?: string;
}

const CollegeImage: React.FC<CollegeImageProps> = ({
  collegeCode,
  type,
  className = '',
  alt = 'College',
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      setError(false);

      try {
        const localImageUrl = type === 'campus'
          ? getCollegeImage(collegeCode)
          : getCollegeLogo(collegeCode);

        const img = new Image();
        img.onload = () => {
          setImageSrc(localImageUrl);
          setLoading(false);
        };
        img.onerror = () => {
          console.log(`Local ${type} image not found for college ${collegeCode}, using fallback`);
          setImageSrc(type === 'logo'
            ? "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
            : getRandomFallbackImage()
          );
          setError(true);
          setLoading(false);
        };
        img.src = localImageUrl;

      } catch (err) {
        console.error('Error loading image:', err);
        setImageSrc(type === 'logo'
          ? "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
          : getRandomFallbackImage()
        );
        setError(true);
        setLoading(false);
      }
    };

    loadImage();
  }, [collegeCode, type]);

  if (loading) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center rounded-xl`}>
        <div className="text-center p-4">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-gray-600">Loading {type}...</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`${className} ${error && type === 'logo' ? 'rounded-full object-cover' : 'object-cover'}`}
      loading="lazy"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = type === 'logo'
          ? "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
          : getRandomFallbackImage();
      }}
    />
  );
};

const normalizeCollegeData = (collegeData: any): College => {
  if (!collegeData) {
    return {
      college_name: "Unknown College",
      city: "N/A",
      autonomy_status: "N/A",
      hostel_available: "N/A",
      placement_rate: 0,
      website_url: "",
    } as College;
  }

  const safeParse = (value: any, defaultValue: any = '') => {
    if (value === null || value === undefined || value === '') return defaultValue;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      if (!isNaN(Number(value)) && value.trim() !== '') {
        return Number(value);
      }
      return value.trim();
    }
    return String(value);
  };



  const normalized: College = {
    college_code: safeParse(collegeData.college_code || collegeData.collegeCode, ''),
    college_name: safeParse(collegeData.college_name || collegeData.collegeName || collegeData.name, 'Unknown College'),
    short_name: safeParse(collegeData.short_name || collegeData.shortName, ''),
    city: safeParse(collegeData.city, 'N/A'),
    district: safeParse(collegeData.district, 'N/A'),
    region: safeParse(collegeData.region, 'N/A'),
    university: safeParse(collegeData.university, 'N/A'),
    autonomy_status: safeParse(collegeData.autonomy_status || collegeData.autonomyStatus, 'N/A'),
    established_year: safeParse(collegeData.established_year || collegeData.establishedYear, 0),
    branch_code: safeParse(collegeData.branch_code || collegeData.branchCode, ''),
    branch_name: safeParse(collegeData.branch_name || collegeData.branchName || collegeData.branch, 'N/A'),

    degree_type: safeParse(
      collegeData.degree_type ||
      collegeData.degreeType ||
      collegeData.Degree_type ||
      collegeData.degree ||
      collegeData.Degree,
      'Not Available'
    ),

    duration_years: safeParse(collegeData.duration_years || collegeData.durationYears, 4),
    shift: safeParse(collegeData.shift, 'Full Time'),

    accreditation: safeParse(
      collegeData.accreditation ||
      collegeData.Accreditation ||
      collegeData.accreditation_status ||
      collegeData.accreditationStatus ||
      collegeData.accreditation_grade,
      'Not Available'
    ),

    category: safeParse(collegeData.category, 'GOPEN'),
    cutoff_rank: safeParse(collegeData.cutoff_rank || collegeData.cutoffRank || collegeData.cutoff_score, 0),
    cutoff_percentile: safeParse(collegeData.cutoff_percentile || collegeData.cutoffPercentile, 0),
    total_intake: safeParse(collegeData.total_intake || collegeData.totalIntake, 0),
    seats: safeParse(collegeData.seats || collegeData.Seats, 0),
    fees: safeParse(collegeData.fees, 0),
    hostel_fees: safeParse(collegeData.hostel_fees || collegeData.hostelFees, 0),
    bus_fees: safeParse(collegeData.bus_fees || collegeData.busFees, 0),
    placement_rate: safeParse(collegeData.placement_rate || collegeData.placementRate, 0),
    average_package_lpa: safeParse(collegeData.average_package_lpa || collegeData.averagePackageLpa, 0),
    highest_package_lpa: safeParse(collegeData.highest_package_lpa || collegeData.highestPackageLpa, 0),
    internship_rate: safeParse(collegeData.internship_rate || collegeData.internshipRate, 0),
    foreign_offers: safeParse(collegeData.foreign_offers || collegeData.foreignOffers, 0),
    top_recruiters: safeParse(collegeData.top_recruiters || collegeData.topRecruiters, ''),
    placement_cell_contact: safeParse(collegeData.placement_cell_contact || collegeData.placementCellContact, ''),
    hostel_available: safeParse(collegeData.hostel_available || collegeData.hostelAvailable, 'N/A'),
    hostel_type: safeParse(collegeData.hostel_type || collegeData.hostelType, ''),
    labs_count: safeParse(collegeData.labs_count || collegeData.labsCount, 0),
    wifi_campus: safeParse(collegeData.wifi_campus || collegeData.wifiCampus, 'N/A'),
    transport_facility: safeParse(collegeData.transport_facility || collegeData.transportFacility, 'N/A'),
    medical_facility: safeParse(collegeData.medical_facility || collegeData.medicalFacility, 'N/A'),
    hostel_capacity: safeParse(collegeData.hostel_capacity || collegeData.hostelCapacity, 0),
    image_url: safeParse(collegeData.image_url || collegeData.imageUrl || collegeData.image, ''),
    logo_url: safeParse(collegeData.logo_url || collegeData.logoUrl, ''),
    contact_email: safeParse(collegeData.contact_email || collegeData.contactEmail, ''),
    contact_phone: safeParse(collegeData.contact_phone || collegeData.contactPhone, ''),
    website_url: safeParse(collegeData.website_url || collegeData.websiteUrl, ''),

    student_faculty_ratio: safeParse(collegeData.student_faculty_ratio || collegeData.studentFacultyRatio, 20),
    campus_area: safeParse(collegeData.campus_area || collegeData.campusArea, 0),
    library_books: safeParse(collegeData.library_books || collegeData.libraryBooks, 0),
    sports_facilities: safeParse(collegeData.sports_facilities || collegeData.sportsFacilities, ''),
    clubs_count: safeParse(collegeData.clubs_count || collegeData.clubsCount, 0),
    scholarship_opportunities: safeParse(collegeData.scholarship_opportunities || collegeData.scholarshipOpportunities, ''),
    international_collaborations: safeParse(collegeData.international_collaborations || collegeData.internationalCollaborations, ''),
    industry_tie_ups: safeParse(collegeData.industry_tie_ups || collegeData.industryTieUps, 0),
    research_papers: safeParse(collegeData.research_papers || collegeData.researchPapers, 0),
    patents: safeParse(collegeData.patents, 0),
    alumni_strength: safeParse(collegeData.alumni_strength || collegeData.alumniStrength, 0),
    rating: safeParse(collegeData.rating || collegeData.college_rating, 0),

    fit: safeParse(collegeData.fit, ''),
    fit_reason: safeParse(collegeData.fit_reason || collegeData.fitReason, ''),
    match_score: safeParse(collegeData.match_score || collegeData.matchScore, 0),
    admission_chance: safeParse(collegeData.admission_chance || collegeData.admissionChance, 0),
    is_most_probable: Boolean(collegeData.is_most_probable || collegeData.isMostProbable || false),
    probability_level: safeParse(collegeData.probability_level || collegeData.probabilityLevel, ''),
    display_fees: safeParse(collegeData.display_fees || collegeData.displayFees, ''),
    display_cutoff: safeParse(collegeData.display_cutoff || collegeData.displayCutoff, ''),
    display_placement: safeParse(collegeData.display_placement || collegeData.displayPlacement, ''),

    image: safeParse(collegeData.image || collegeData.image_url, ''),
    branch: safeParse(collegeData.branch || collegeData.branch_name, ''),
    cutoff_score: safeParse(collegeData.cutoff_score || collegeData.cutoffScore || collegeData.cutoff_rank, 0),
    Seats: safeParse(collegeData.Seats || collegeData.seats, 0),

    // New properties with defaults
    branches: Array.isArray(collegeData.branches) ? collegeData.branches : [],
    seat_matrix: Array.isArray(collegeData.seat_matrix) ? collegeData.seat_matrix : [],
    admission_process: Array.isArray(collegeData.admission_process) ? collegeData.admission_process : [],
    scholarships: Array.isArray(collegeData.scholarships) ? collegeData.scholarships : [],
  };

  return normalized;
};

// Helper functions defined outside the component
const formatYear = (year: any) => {
  if (!year || year === 0 || year === "0" || year === "N/A") return "N/A";
  return year;
};

const getBranchFullName = (branchName: string) => {
  const branch = (branchName || "").toUpperCase();
  if (branch.includes("CSE") || branch.includes("COMPUTER")) return "Computer Science and Engineering";
  if (branch.includes("IT")) return "Information Technology";
  if (branch.includes("ECE")) return "Electronics and Communication Engineering";
  if (branch.includes("EEE")) return "Electrical and Electronics Engineering";
  if (branch.includes("MECH")) return "Mechanical Engineering";
  if (branch.includes("CIVIL")) return "Civil Engineering";
  if (branch.includes("E&TC")) return "Electronics and Telecommunication";
  if (branch.includes("AIDS") || branch.includes("AI&DS")) return "Artificial Intelligence and Data Science";
  if (branch.includes("AI&ML") || branch.includes("AIML")) return "Artificial Intelligence and Machine Learning";
  if (branch.includes("CS")) return "Computer Science";
  if (branch.includes("EI")) return "Electronics and Instrumentation";
  if (branch.includes("PROD")) return "Production Engineering";
  if (branch.includes("TEXTILE")) return "Textile Engineering";
  if (branch.includes("CHEM")) return "Chemical Engineering";
  if (branch.includes("BIOTECH")) return "Biotechnology";
  if (branch.includes("BIOMED")) return "Biomedical Engineering";
  return branchName || "Engineering";
};

const formatPercentage = (value: number) => {
  if (!value || value === 0) return "N/A";
  return `${value}%`;
};
// Helper function to get city coordinates (from CollegeMap.tsx)
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

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// AI Assistant response function
const getAIResponse = (message: string, college: College): string => {
  const lowerMessage = message.toLowerCase();

  // Admission related questions
  if (lowerMessage.includes('admission') || lowerMessage.includes('apply') || lowerMessage.includes('eligibility')) {
    return `For admission to ${college.college_name}, you need to meet the following criteria:
• Minimum cutoff rank: ${college.cutoff_rank || 'Check official website'}
• Category: ${college.category || 'GOPEN'}
• Degree: ${college.degree_type || 'Engineering'}
• Duration: ${college.duration_years || 4} years

The admission process typically involves:
1. Online application through DTE Maharashtra
2. Document verification
3. Merit-based seat allocation
4. Fee payment and confirmation

For detailed admission dates and process, visit the college website or contact the admission office.`;
  }

  // Fee related questions
  if (lowerMessage.includes('fee') || lowerMessage.includes('cost') || lowerMessage.includes('tuition') || lowerMessage.includes('payment')) {
    return `Fee structure for ${college.college_name}:
• Tuition Fee: ₹${college.fees?.toLocaleString() || 'Contact college'}
• Hostel Fee: ₹${college.hostel_fees?.toLocaleString() || 'Not available'}
• Bus Fee: ₹${college.bus_fees?.toLocaleString() || 'Not available'}

Total annual fees: ₹${(college.fees || 0) + (college.hostel_fees || 0) + (college.bus_fees || 0)} approximately.

Fee payment is typically done in two semesters. Scholarships and financial aid options may be available. Contact the college administration for detailed fee breakdown and payment procedures.`;
  }

  // Placement related questions
  if (lowerMessage.includes('placement') || lowerMessage.includes('job') || lowerMessage.includes('salary') || lowerMessage.includes('package')) {
    return `Placement statistics for ${college.college_name}:
• Placement Rate: ${college.placement_rate || 0}%
• Average Package: ₹${college.average_package_lpa || 0} LPA
• Highest Package: ₹${college.highest_package_lpa || 0} LPA
• Internship Rate: ${college.internship_rate || 0}%

Top recruiters include: ${college.top_recruiters || 'Various companies from IT, manufacturing, and other sectors'}

The college has a dedicated placement cell that organizes campus recruitment drives, training programs, and industry connections.`;
  }

  // Hostel related questions
  if (lowerMessage.includes('hostel') || lowerMessage.includes('accommodation') || lowerMessage.includes('stay')) {
    return `Hostel facilities at ${college.college_name}:
• Hostel Available: ${college.hostel_available || 'Check with college'}
• Hostel Type: ${college.hostel_type || 'Separate for boys and girls'}
• Hostel Capacity: ${college.hostel_capacity || 'Contact college'} students
• Hostel Fee: ₹${college.hostel_fees?.toLocaleString() || 'Contact college'}

Hostels provide 24/7 security, mess facilities, WiFi, and recreational areas. Both AC and non-AC rooms are available. Application for hostel accommodation is usually done after admission confirmation.`;
  }

  // Course/Branch related questions
  if (lowerMessage.includes('course') || lowerMessage.includes('branch') || lowerMessage.includes('program') || lowerMessage.includes('subject')) {
    return `${college.college_name} offers:
• Branch: ${getBranchFullName(college.branch_name || '')}
• Degree Type: ${college.degree_type || 'Bachelor of Engineering'}
• Duration: ${college.duration_years || 4} years
• Shift: ${college.shift || 'Full Time'}

The curriculum includes theoretical knowledge, practical training, and industry exposure. The program is designed to meet industry standards and prepare students for professional careers.`;
  }

  // Infrastructure related questions
  if (lowerMessage.includes('infrastructure') || lowerMessage.includes('facility') || lowerMessage.includes('campus') || lowerMessage.includes('lab')) {
    return `Campus facilities at ${college.college_name}:
• Laboratories: ${college.labs_count || 'Multiple'} specialized labs
• WiFi Campus: ${college.wifi_campus || 'Available'}
• Transport: ${college.transport_facility || 'Available'}
• Medical Facility: ${college.medical_facility || 'Available'}
• Library: ${college.library_books?.toLocaleString() || 'Well-stocked'} books
• Sports Facilities: ${college.sports_facilities || 'Available'}
• Campus Area: ${college.campus_area || 'Spacious'} acres

The college provides a conducive learning environment with modern amenities and well-maintained infrastructure.`;
  }

  // Accreditation and ranking questions
  if (lowerMessage.includes('accreditation') || lowerMessage.includes('ranking') || lowerMessage.includes('grade') || lowerMessage.includes('quality')) {
    return `${college.college_name} details:
• Accreditation: ${college.accreditation || 'NBA Accredited'}
• Autonomy Status: ${college.autonomy_status || 'Affiliated to University'}
• Established: ${college.established_year || 'Contact college'}
• University: ${college.university || 'State University'}

The college maintains high academic standards and is recognized for quality education in engineering and technology.`;
  }

  // Contact information
  if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email') || lowerMessage.includes('address')) {
    return `Contact information for ${college.college_name}:
• Email: ${college.contact_email || 'Contact college website'}
• Phone: ${college.contact_phone || 'Contact college website'}
• Website: ${college.website_url || 'Visit college website'}
• Address: ${college.city}, ${college.district || 'Maharashtra'}, India

For admission inquiries, please contact the admission office directly.`;
  }

  // Default response
  return `I'm here to help you with information about ${college.college_name}. You can ask me about:
• Admission process and eligibility
• Fee structure and scholarships
• Placement statistics and careers
• Hostel facilities and accommodation
• Course details and curriculum
• Campus infrastructure and facilities
• Contact information and important dates

What specific information would you like to know about ${college.college_name}?`;
};

export default function CollegeDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const getInitialCollege = (): any => {
    if (location.state?.college) {
      return location.state.college;
    }

    try {
      const savedCollege = localStorage.getItem('selectedCollege');
      if (savedCollege) {
        return JSON.parse(savedCollege);
      }
    } catch (error) {
      console.error("Error parsing college from localStorage:", error);
    }

    const params = new URLSearchParams(location.search);
    const collegeParam = params.get('college');
    if (collegeParam) {
      try {
        return JSON.parse(decodeURIComponent(collegeParam));
      } catch (error) {
        console.error("Error parsing college from URL:", error);
      }
    }

    return null;
  };

  const initialCollegeData = getInitialCollege();
  const [college, setCollege] = useState<College>(() => normalizeCollegeData(initialCollegeData));
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [saved, setSaved] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const { data: profile } = useQuery<any>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [collegeReviews, setCollegeReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    const fetchCollegeReviews = async () => {
      if (!college.college_code) return;
      setReviewsLoading(true);
      try {
        const { data, error } = await supabase
          .from('college_reviews_with_profiles')
          .select('*')
          .eq('college_code', college.college_code)
          .order('created_at', { ascending: false });

        if (error) console.error("Error fetching reviews:", error);
        else setCollegeReviews(data || []);
      } catch (err) {
        console.error("Error fetching reviews list:", err);
      } finally {
        setReviewsLoading(false);
      }
    };
    
    fetchCollegeReviews();

    if (!college.college_code) return;

    // Supabase Realtime subscription for reviews specific to this college
    const channel = supabase
      .channel(`public:college_reviews:${college.college_code}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'college_reviews', filter: `college_code=eq.${college.college_code}` },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setCollegeReviews((prev) =>
              prev.map((r) =>
                r.id === payload.new.id
                  ? { ...r, upvotes: payload.new.upvotes }
                  : r
              )
            );
          } else if (payload.eventType === 'INSERT') {
            fetchCollegeReviews();
          } else if (payload.eventType === 'DELETE') {
            setCollegeReviews((prev) => prev.filter((r) => r.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [college.college_code]);


  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackName, setFeedbackName] = useState("");
  void feedbackRating; void setFeedbackRating;
  void feedbackComment; void setFeedbackComment;
  void feedbackName; void setFeedbackName;

  // Distance Calculator State
  const [distance, setDistance] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // AI Assistant State
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: `Hi! I'm your AI assistant for ${college.college_name || 'this college'}. I can help you with information about admissions, fees, placements, courses, hostel facilities, and more. What would you like to know?` }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAIThinking, setIsAIThinking] = useState(false);

  // Expand/Collapse State
  const [isAvailableBranchesExpanded, setIsAvailableBranchesExpanded] = useState(true);
  const [isSeatMatrixExpanded, setIsSeatMatrixExpanded] = useState(true);

  // Initialize with all admission steps expanded by default (show complete/whole view)
  // The actual steps will be populated when college.admission_process is loaded
  const [expandedAdmissionSteps, setExpandedAdmissionSteps] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8]);

  // Toggle admission step expansion
  const toggleAdmissionStep = (stepNumber: number) => {
    setExpandedAdmissionSteps(prev =>
      prev.includes(stepNumber)
        ? prev.filter(step => step !== stepNumber)
        : [...prev, stepNumber]
    );
  };

  // Handle getting user's location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        void { lat: latitude, lng: longitude }; // userLocation calculated but only distance is used
        setIsGettingLocation(false);

        // Calculate distance after getting location
        const collegeCoords = getCityCoordinates(college.city);
        const dist = calculateDistance(latitude, longitude, collegeCoords.lat, collegeCoords.lng);
        setDistance(dist);
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied. Please enable location access.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out.");
            break;
          default:
            setLocationError("An unknown error occurred.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Handle sending message to AI
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAIThinking) return;

    const userMessage = chatInput.trim();
    setChatInput("");

    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsAIThinking(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = getAIResponse(userMessage, college);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsAIThinking(false);
    }, 1000);
  };

  // Helper functions inside the component
  const getEstablishedYear = () => {
    return formatYear(college.established_year);
  };

  const getAccreditation = () => {
    return college.accreditation || "Not Available";
  };

  const getDegreeType = () => {
    return college.degree_type || "Not Available";
  };

  const getTotalCollegeIntake = () => {

    // Fallback to existing logic
    if (college.total_intake && college.total_intake > 0) {
      return college.total_intake;
    }
    if (college.Seats && college.Seats > 0) {
      return college.Seats;
    }
    if (college.seats && college.seats > 0) {
      return college.seats;
    }
    return "N/A";
  };

  const getCurrentCategorySeats = () => {
    return college.seats || college.Seats || 0;
  };

  const getOtherCategoriesSeats = () => {
    const total = typeof getTotalCollegeIntake() === 'number' ? getTotalCollegeIntake() as number : 0;
    const current = getCurrentCategorySeats();
    return Math.max(0, total - current);
  };

  const getSeatData = () => {
    const totalIntake = getTotalCollegeIntake();
    const currentSeats = getCurrentCategorySeats();
    const otherSeats = getOtherCategoriesSeats();

    return {
      totalIntake,
      currentSeats,
      otherSeats,
      totalSeats: totalIntake
    };
  };

  const getFeeStructure = () => {
    const fees = [];

    if (college.fees && college.fees > 0) {
      fees.push({
        category: "Tuition Fee",
        amount: college.fees,
        color: "bg-gradient-to-r from-blue-500 to-indigo-500",
        icon: BookOpen
      });
    }

    if (college.hostel_fees && college.hostel_fees > 0) {
      fees.push({
        category: "Hostel Fee",
        amount: college.hostel_fees,
        color: "bg-gradient-to-r from-purple-500 to-pink-500",
        icon: Home
      });
    }

    if (college.bus_fees && college.bus_fees > 0) {
      fees.push({
        category: "Transport Fee",
        amount: college.bus_fees,
        color: "bg-gradient-to-r from-yellow-500 to-orange-500",
        icon: Car
      });
    }

    return {
      totalFees: fees.reduce((sum, fee) => sum + fee.amount, 0),
      categories: fees
    };
  };

  const getInfrastructureData = () => {
    const infrastructure = [];

    if (college.labs_count && college.labs_count > 0) {
      infrastructure.push({
        icon: Cpu,
        label: "Laboratories",
        value: college.labs_count,
        color: "text-blue-600",
        bgColor: "bg-blue-50/80"
      });
    }

    if (college.hostel_available && college.hostel_available !== "N/A") {
      infrastructure.push({
        icon: Home,
        label: "Hostel",
        value: college.hostel_available,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50/80"
      });
    }

    if (college.wifi_campus && college.wifi_campus !== "N/A") {
      infrastructure.push({
        icon: Wifi,
        label: "WiFi Campus",
        value: college.wifi_campus,
        color: "text-cyan-600",
        bgColor: "bg-cyan-50/80"
      });
    }

    if (college.transport_facility && college.transport_facility !== "N/A") {
      infrastructure.push({
        icon: Car,
        label: "Transport",
        value: college.transport_facility,
        color: "text-teal-600",
        bgColor: "bg-teal-50/80"
      });
    }

    if (college.medical_facility && college.medical_facility !== "N/A") {
      infrastructure.push({
        icon: ShieldCheck,
        label: "Medical",
        value: college.medical_facility,
        color: "text-rose-600",
        bgColor: "bg-rose-50/80"
      });
    }

    if (college.hostel_capacity && college.hostel_capacity > 0) {
      infrastructure.push({
        icon: Building,
        label: "Hostel Capacity",
        value: college.hostel_capacity,
        color: "text-indigo-600",
        bgColor: "bg-indigo-50/80"
      });
    }

    if (college.library_books && college.library_books > 0) {
      infrastructure.push({
        icon: Library,
        label: "Library Books",
        value: college.library_books,
        color: "text-violet-600",
        bgColor: "bg-violet-50/80"
      });
    }

    if (college.campus_area && college.campus_area > 0) {
      infrastructure.push({
        icon: Globe,
        label: "Campus Area",
        value: `${college.campus_area} acres`,
        color: "text-orange-600",
        bgColor: "bg-orange-50/80"
      });
    }

    if (college.student_faculty_ratio && college.student_faculty_ratio > 0) {
      infrastructure.push({
        icon: Users,
        label: "Student-Faculty Ratio",
        value: `1:${college.student_faculty_ratio}`,
        color: "text-lime-600",
        bgColor: "bg-lime-50/80"
      });
    }

    if (college.clubs_count && college.clubs_count > 0) {
      infrastructure.push({
        icon: UserGroup,
        label: "Student Clubs",
        value: college.clubs_count,
        color: "text-pink-600",
        bgColor: "bg-pink-50/80"
      });
    }

    return infrastructure;
  };

  const getPlacementData = () => {
    const topRecruiters = college.top_recruiters
      ? college.top_recruiters.split(",").map((r: string) => r.trim()).filter((r: string) => r)
      : [];

    return {
      placementRate: college.placement_rate || 0,
      averagePackage: college.average_package_lpa || 0,
      highestPackage: college.highest_package_lpa || 0,
      internshipRate: college.internship_rate || 0,
      foreignOffers: college.foreign_offers || 0,
      topRecruiters: topRecruiters,
      placementContact: college.placement_cell_contact || "Not Available",
      industryTieUps: college.industry_tie_ups || 0,
      researchPapers: college.research_papers || 0,
      patents: college.patents || 0,
    };
  };

  const getAcademicData = () => {
    return {
      degreeType: getDegreeType(),
      accreditation: getAccreditation(),
      duration: college.duration_years || 4,
      shift: college.shift || "N/A",
      university: college.university || "Not Available",
      establishedYear: getEstablishedYear(),
      autonomyStatus: college.autonomy_status || "N/A",
      researchPapers: college.research_papers || 0,
      patents: college.patents || 0,
      internationalCollaborations: college.international_collaborations || "N/A",
    };
  };

  const getQuickStats = () => {
    const stats = [];

    if (college.admission_chance && college.admission_chance > 0) {
      stats.push({
        label: "Admission Chance",
        value: `${college.admission_chance}%`,
        icon: Brain,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50"
      });
    }

    if (college.placement_rate && college.placement_rate > 0) {
      stats.push({
        label: "Placement Rate",
        value: `${college.placement_rate}%`,
        icon: TrendingUp,
        color: "text-purple-600",
        bgColor: "bg-purple-50"
      });
    }

    if (college.fees && college.fees > 0) {
      stats.push({
        label: "Annual Fees",
        value: `₹${college.fees.toLocaleString()}`,
        icon: CreditCard,
        color: "text-cyan-600",
        bgColor: "bg-cyan-50"
      });
    }

    if (college.cutoff_rank && college.cutoff_rank > 0) {
      stats.push({
        label: "Cutoff Rank",
        value: college.cutoff_rank.toLocaleString(),
        icon: Target,
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      });
    }

    if (college.match_score && college.match_score > 0) {
      stats.push({
        label: "Match Score",
        value: `${college.match_score}%`,
        icon: Star,
        color: "text-amber-600",
        bgColor: "bg-amber-50"
      });
    }

    if (college.seats && college.seats > 0) {
      stats.push({
        label: "Available Seats",
        value: college.seats.toLocaleString(),
        icon: Users,
        color: "text-green-600",
        bgColor: "bg-green-50"
      });
    }

    return stats;
  };

  const getCutoffDisplay = () => {
    if (college.cutoff_rank && college.cutoff_rank > 0) return `${college.cutoff_rank.toLocaleString()}`;
    if (college.cutoff_percentile && college.cutoff_percentile > 0) return `${college.cutoff_percentile}%`;
    if (college.cutoff_score && college.cutoff_score > 0) return `${college.cutoff_score}`;
    return "N/A";
  };

  const seatData = getSeatData();
  const feeData = getFeeStructure();
  const infrastructure = getInfrastructureData();
  const placementData = getPlacementData();
  const academicData = getAcademicData();
  const quickStats = getQuickStats();

  useEffect(() => {
    try {
      const bookmarks = JSON.parse(localStorage.getItem('collegeBookmarks') || '[]');
      const isBookmarked = bookmarks.some((b: any) =>
        b.college_code === college.college_code &&
        b.branch_name === college.branch_name
      );
      setSaved(isBookmarked);
    } catch (error) {
      console.error("Error checking bookmarks:", error);
    }
  }, [college.college_code, college.branch_name]);

  useEffect(() => {
    const fetchCollegeDetails = async () => {
      const collegeToFetch = college;

      if (!collegeToFetch?.college_code || !collegeToFetch?.branch_name) {
        const altCollegeCode = initialCollegeData?.college_code || initialCollegeData?.collegeCode;
        const altBranchName = initialCollegeData?.branch_name || initialCollegeData?.branchName || initialCollegeData?.branch;

        if (altCollegeCode && altBranchName) {
          const updatedCollege = {
            ...collegeToFetch,
            college_code: altCollegeCode,
            branch_name: altBranchName
          };
          setCollege(normalizeCollegeData(updatedCollege));
          return;
        }

        setError("Missing college information. Please select a college from the dashboard.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("http://localhost:5001/college_details", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            college_code: collegeToFetch.college_code,
            branch_name: collegeToFetch.branch_name,
            category: collegeToFetch.category || "ALL",
          })
        });

        if (response.ok) {
          const data = await response.json();

          if (data.error) {
            setError(data.error);
            if (initialCollegeData) {
              setCollege(normalizeCollegeData(initialCollegeData));
            }
          } else {
            const normalizedData = normalizeCollegeData(data);
            setCollege(normalizedData);
            setSelectedBranch(collegeToFetch.branch_name);

            try {
              localStorage.setItem('selectedCollege', JSON.stringify(normalizedData));
            } catch (e) {
              console.warn("Could not save to localStorage:", e);
            }
          }
        } else {
          let errorMessage = `HTTP ${response.status}: Failed to load college details`;
          setError(errorMessage);

          if (initialCollegeData) {
            setCollege(normalizeCollegeData(initialCollegeData));
          }
        }
      } catch (error: any) {
        console.error("❌ Network error fetching college details:", error);
        setError(`Network error: ${error.message || 'Cannot connect to server'}`);

        if (initialCollegeData) {
          setCollege(normalizeCollegeData(initialCollegeData));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCollegeDetails();
  }, [college.college_code, college.branch_name, retryCount]);

  // Fetch all branches for the college with seat distribution
  useEffect(() => {
    const fetchBranches = async () => {
      if (!college.college_code) return;

      // setBranchesLoading - loading is tracked inline
      try {
        const { data, error } = await supabase
          .from('colleges_2025')
          .select('*')
          .eq('college_code', college.college_code);

        if (error) {
          console.error("Error fetching branches:", error?.message || 'Unknown error');
          return;
        }

        if (data && Array.isArray(data)) {
          // Group data by branch_name and aggregate seats by category
          interface InternalBranch {
            branch_code: string;
            branch_name: string;
            total_intake: number;
            categories: Map<string, SeatMatrix>;
          }
          const branchMap = new Map<string, InternalBranch>();

          data.forEach((row: any) => {
            const branchKey = row.branch_name.trim().toUpperCase(); // Normalize branch name
            if (!branchMap.has(branchKey)) {
              branchMap.set(branchKey, {
                branch_code: row.branch_code,
                branch_name: row.branch_name,
                total_intake: parseInt(row.total_intake) || 0,
                categories: new Map<string, SeatMatrix>()
              });
            }

            const branch = branchMap.get(branchKey)!;
            const categoryKey = row.category;
            if (!branch.categories.has(categoryKey)) {
              branch.categories.set(categoryKey, {
                category: row.category,
                seats: 0,
                percentage: 0,
                color: getCategoryColor(row.category)
              });
            }
            // Sum seats for each category within the branch
            branch.categories.get(categoryKey)!.seats += parseInt(row.seats) || 0;
          });

          // Calculate percentages based on total intake (sum of all category seats)
          const branches = Array.from(branchMap.values()).map(branch => {
            const categories = Array.from(branch.categories.values());
            // Calculate total intake as sum of all category seats for this branch
            const totalIntake = categories.reduce((sum, cat) => sum + cat.seats, 0);
            return {
              ...branch,
              total_intake: totalIntake,
              categories: categories.map(cat => ({
                ...cat,
                percentage: totalIntake > 0 ? (cat.seats / totalIntake) * 100 : 0
              }))
            };
          });

          setCollege(prev => ({
            ...prev,
            branches: branches
          }));
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
      } finally {
        // branchesLoading done
      }
    };

    fetchBranches();
  }, [college.college_code]);

  // Fetch seat matrix for the college and current branch
  useEffect(() => {
    const fetchSeatMatrix = async () => {
      if (!college.college_code || !college.branch_name) return;

      try {
        const { data, error } = await supabase
          .from('colleges_2025')
          .select('*')
          .eq('college_code', college.college_code)
          .eq('branch_name', college.branch_name);

        if (error) {
          console.error("Error fetching seat matrix:", error?.message || error);
          return;
        }

        if (data && Array.isArray(data)) {
          // Calculate total intake from the seat matrix data for this specific branch
          const totalIntake = data.reduce((sum: number, item: any) => {
            const seats = typeof item.seats === 'number' ? item.seats : parseInt(item.seats) || 0;
            return sum + seats;
          }, 0);

          const processedData = data.map((item: any, _index: number) => {
            const seats = typeof item.seats === 'number' ? item.seats : parseInt(item.seats) || 0;
            return {
              category: item.category,
              seats: seats,
              percentage: totalIntake > 0 ? (seats / totalIntake) * 100 : 0,
              color: getCategoryColor(item.category)
            };
          });

          setCollege(prev => ({
            ...prev,
            seat_matrix: processedData
          }));
        }
      } catch (error) {
        console.error("Error fetching seat matrix:", error);
      }
    };

    fetchSeatMatrix();
  }, [college.college_code, college.branch_name]);

  // Fetch scholarships for the college
  useEffect(() => {
    const fetchScholarships = async () => {
      if (!college.college_code) return;

      try {
        const { data, error } = await supabase
          .from('scholarships')
          .select('*')
          .eq('college_code', college.college_code);

        if (error) {
          if (error.code !== 'PGRST205') {
            console.error("Error fetching scholarships:", error);
          }
          return;
        }

        if (data && Array.isArray(data)) {
          setCollege(prev => ({
            ...prev,
            scholarships: data
          }));
        }
      } catch (error) {
        console.error("Error fetching scholarships:", error);
      }
    };

    fetchScholarships();
  }, [college.college_code]);

  // Fetch required documents for the college
  useEffect(() => {
    const fetchRequiredDocuments = async () => {
      if (!college.college_code) return;

      try {
        const { data, error } = await supabase
          .from('required_documents')
          .select('*')
          .eq('college_code', college.college_code);

        if (error) {
          if (error.code !== 'PGRST205') {
            console.error("Error fetching required documents:", error);
          }
          return;
        }

        if (data && Array.isArray(data)) {
          setCollege(prev => ({
            ...prev,
            required_documents: data.map(doc => doc.document_name)
          }));
        }
      } catch (error) {
        console.error("Error fetching required documents:", error);
      }
    };

    fetchRequiredDocuments();
  }, [college.college_code]);

  const handleSaveCollege = () => {
    setSaved(!saved);
    try {
      const bookmarks = JSON.parse(localStorage.getItem('collegeBookmarks') || '[]');

      if (!saved) {
        const collegeToSave = {
          college_code: college.college_code,
          college_name: college.college_name,
          branch_name: college.branch_name,
          city: college.city,
          category: college.category,
          degree_type: college.degree_type,
          accreditation: college.accreditation,
          savedAt: new Date().toISOString()
        };

        const exists = bookmarks.find((b: any) =>
          b.college_code === college.college_code &&
          b.branch_name === college.branch_name
        );

        if (!exists) {
          bookmarks.push(collegeToSave);
          localStorage.setItem('collegeBookmarks', JSON.stringify(bookmarks));
        }
      } else {
        const filtered = bookmarks.filter((b: any) =>
          !(b.college_code === college.college_code &&
            b.branch_name === college.branch_name)
        );
        localStorage.setItem('collegeBookmarks', JSON.stringify(filtered));
      }
    } catch (error) {
      console.error("Error saving bookmark:", error);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${college.college_name} - ${college.branch_name}`,
      text: `Check out ${college.college_name} in ${college.city}. ${college.branch_name} program (${college.degree_type}) with ${college.accreditation} accreditation.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Sharing cancelled:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          const toast = document.createElement('div');
          toast.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
          toast.textContent = 'Link copied to clipboard!';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);
        })
        .catch(err => console.error('Failed to copy:', err));
    }
  };



  const handleBranchSelect = (branchName: string) => {
    setSelectedBranch(branchName);
  };

  const StatCard = ({ label, value, icon: Icon, color, bgColor }: any) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 sm:p-5 shadow-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      <div className="flex items-center space-x-3 relative z-10">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${bgColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">{label}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
        </div>
      </div>
    </motion.div>
  );

  const InfoCard = ({ title, icon: Icon, children, gradient }: any) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-sm border border-white/20 backdrop-blur-sm relative overflow-hidden group hover:shadow-xl transition-shadow duration-300`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>

      <div className="flex items-center space-x-3 mb-6 relative z-10">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );

  // Render Seat Matrix Section - ALL visible with single collapse/expand
  const renderSeatMatrixSection = () => {
    const seatMatrix = college.seat_matrix || [];

    if (!seatMatrix || seatMatrix.length === 0) {
      return (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Seat Matrix - Category Wise</h3>
          <div className="text-center py-8">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Seat matrix data for {college.branch_name} will be loaded soon</p>
          </div>
        </div>
      );
    }

    const branchCategories = seatMatrix;
    const totalSeats = seatMatrix.reduce((sum: number, cat: any) => sum + cat.seats, 0);

    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <h3 className="text-xl font-bold text-gray-900">Seat Matrix - {college.branch_name}</h3>
          <button
            onClick={() => setIsSeatMatrixExpanded(!isSeatMatrixExpanded)}
            className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
          >
            {isSeatMatrixExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Collapse All</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>View All Categories</span>
              </>
            )}
          </button>
        </div>

        <div className="mb-8">
          <div className="flex justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-900">Branch Intake: {totalSeats} seats</h4>
              <p className="text-sm text-gray-600">Category distribution for {college.branch_name}</p>
            </div>
            {college.category && (
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">Your Category: {college.category}</div>
                <div className="text-sm text-gray-500">Highlighted below</div>
              </div>
            )}
          </div>

          {/* Categories with collapse/expand functionality */}
          <AnimatePresence>
            {isSeatMatrixExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {branchCategories.map((category: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`p-4 rounded-xl border ${category.category === college.category ? 'border-2 border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-gray-900">{category.category}</span>
                        <span className="text-lg font-bold" style={{ color: category.color }}>
                          {category.seats}
                        </span>
                      </div>
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${category.percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-sm text-gray-600">
                        <span>{category.percentage.toFixed(1)}%</span>
                        <span>{category.seats} seats</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    );
  };

  // Render Available Branches Section
  const renderAvailableBranches = () => {
    const branches = college.branches || [];

    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-wrap justify-between items-center mb-4 sm:mb-6 gap-2">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Available Branches</h3>
          <span className="text-xs sm:text-sm text-gray-600">{branches.length} branches available</span>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {branches.map((branch, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 sm:p-6 rounded-xl border transition-all duration-300 ${branch.branch_name === selectedBranch
                ? 'border-blue-500 bg-blue-50/50 shadow-md'
                : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:shadow-sm'
                }`}
              onClick={() => handleBranchSelect(branch.branch_name)}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4 gap-2">
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-1 break-words">{branch.branch_name}</h4>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <span>Intake: {branch.total_intake} seats</span>
                    {branch.branch_name === selectedBranch && (
                      <span className="text-blue-600 font-medium">✓ Selected</span>
                    )}
                  </div>
                </div>
                <div className="sm:text-right flex-shrink-0">
                  <div className="text-xs text-gray-500 mb-1">Seat Distribution</div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 sm:justify-end">
                    {branch.categories && branch.categories.map((category: any, catIndex: number) => (
                      <div key={catIndex} className="flex items-center space-x-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-xs font-medium text-gray-700">
                          {category.category}: {category.seats}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Seat Distribution Visualization - Collapsible */}
              {branch.categories && branch.categories.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAvailableBranchesExpanded(!isAvailableBranchesExpanded);
                      }}
                      className="flex items-center space-x-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                    >
                      {isAvailableBranchesExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          <span>Collapse</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          <span>Expand</span>
                        </>
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {isAvailableBranchesExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-wrap gap-3">
                          {branch.categories.map((category, catIndex) => (
                            <div key={catIndex} className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {category.category}: {category.seats} seats
                              </span>
                              <span className="text-xs text-gray-500">
                                ({category.percentage.toFixed(1)}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {branches.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No branch information available</p>
          </div>
        )}
      </div>
    );
  };

  // Render Admission Process Section
  const renderAdmissionProcess = () => {
    const admissionProcess = college.admission_process || [];

    return (
      <div className="space-y-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Admission Process & Timeline</h3>

          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {college.admission_dates && (
                <>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">Application Period</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      {college.admission_dates.application_start} to {college.admission_dates.application_end}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-4 rounded-xl border border-emerald-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-emerald-600" />
                      <span className="font-semibold text-gray-900">Merit List Date</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      {college.admission_dates.merit_list_date}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4">
              {admissionProcess.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col gap-2 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200/50 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{step.step}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{step.title}</h4>
                        {step.deadline && (
                          <span className="self-start text-xs sm:text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded whitespace-nowrap">
                            Deadline: {step.deadline}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                    {/* Collapsible toggle button */}
                    <button
                      onClick={() => toggleAdmissionStep(step.step)}
                      className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {expandedAdmissionSteps.includes(step.step) ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>

                  {/* Collapsible content */}
                  <AnimatePresence>
                    {expandedAdmissionSteps.includes(step.step) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-14 mt-2 overflow-hidden"
                      >
                        {step.required_docs && step.required_docs.length > 0 && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">Required Documents:</p>
                            <div className="flex flex-wrap gap-2">
                              {step.required_docs.map((doc, docIndex) => (
                                <span key={docIndex} className="text-xs bg-white text-gray-700 px-2 py-1 rounded border border-gray-200">
                                  {doc}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Admission Contacts */}
        {college.admission_contacts && college.admission_contacts.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Admission Help Desk</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {college.admission_contacts.map((contact, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
                  <div className="font-semibold text-gray-900 mb-1">{contact.name}</div>
                  <div className="text-sm text-gray-600 mb-2">{contact.role}</div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <a href={`tel:${contact.phone}`} className="text-blue-700 hover:text-blue-800">
                        {contact.phone}
                      </a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <a href={`mailto:${contact.email}`} className="text-blue-700 hover:text-blue-800">
                        {contact.email}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Scholarships Section
  const renderScholarshipsSection = () => {
    const collegeScholarships = college.scholarships || [];

    // Filter recommended scholarships based on user's category
    const userCategory = (profile?.category || "").toUpperCase();
    const recommended = RECOMMENDED_SCHOLARSHIPS.filter(s => {
      const eligibility = s.eligibility.toUpperCase();
      if (userCategory.includes("SC") || userCategory.includes("ST")) {
        return eligibility.includes("SC") || eligibility.includes("ST") || eligibility.includes("ALL");
      }
      if (userCategory.includes("OBC") || userCategory.includes("VJ") || userCategory.includes("NT") || userCategory.includes("SBC")) {
        return eligibility.includes("OBC") || eligibility.includes("VJ") || eligibility.includes("NT") || eligibility.includes("SBC") || eligibility.includes("ALL");
      }
      if (userCategory.includes("OPEN") || userCategory.includes("EWS") || userCategory.includes("SEBC")) {
        return eligibility.includes("OPEN") || eligibility.includes("EWS") || eligibility.includes("SEBC") || eligibility.includes("ALL");
      }
      return true;
    });

    const scholarshipsToShow = collegeScholarships.length > 0 ? collegeScholarships : recommended;

    const handleDownloadBrochure = (scholarship: Scholarship) => {
      // In a real app, this would be a real PDF
      // For now, we'll simulate a download by opening the portal
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
      toast.textContent = `Downloading details for ${scholarship.name}...`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

      window.open(scholarship.application_link, '_blank');
    };

    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Scholarship Opportunities</h3>
            <p className="text-sm text-gray-600">
              {collegeScholarships.length > 0
                ? `${collegeScholarships.length} scholarships identified for this college`
                : `We've found ${recommended.length} scholarships matching your category: ${profile?.category || 'General'}`}
            </p>
          </div>
          {collegeScholarships.length === 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
              <Zap className="w-3.5 h-3.5 fill-amber-500" />
              AI Recommended for You
            </div>
          )}
        </div>

        <div className="space-y-6">
          {scholarshipsToShow.map((scholarship, index) => (
            <motion.div
              key={scholarship.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200/50 hover:border-blue-200 hover:shadow-sm transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start mb-3 sm:mb-4 gap-3">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-base sm:text-lg mb-1 break-words">{scholarship.name}</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {scholarship.provider}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${scholarship.type === 'Government'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : scholarship.type === 'National'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      }`}>
                      {scholarship.type}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end">
                  <div className="text-2xl font-black text-emerald-600">{scholarship.amount}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scholarship Value</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
                <div className="bg-white/50 p-3 rounded-xl border border-dashed border-gray-200">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    Eligibility Criteria
                  </p>
                  <p className="text-gray-700 text-sm font-medium leading-relaxed">{scholarship.eligibility}</p>
                </div>
                <div className="bg-white/50 p-3 rounded-xl border border-dashed border-gray-200">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Clock className="w-3 h-3 text-amber-500" />
                    Crucial Timeline
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-700 font-bold">
                    <span>Deadline:</span>
                    <span className="text-rose-600">{scholarship.deadline}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <a
                  href={scholarship.application_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-md active:scale-95"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Official Application Portal</span>
                </a>
                <button
                  onClick={() => handleDownloadBrochure(scholarship)}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Info Brochure</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {scholarshipsToShow.length === 0 && (
          <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <Award className="w-20 h-20 text-slate-200 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-slate-400">No Scholarships Identified</h4>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              We couldn't find any specific scholarships matching your profile at the moment.
            </p>
          </div>
        )}
      </div>
    );
  };

  // Render Facilities & Scholarships Section (Merged)
  const renderFacilitiesSection = () => {
    return (
      <div className="space-y-8">
        {/* Scholarship Section */}
        {renderScholarshipsSection()}

        {/* Hostel Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-gray-200/50 shadow-sm">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-5 sm:mb-8">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Hostel & Housing</h2>
              <p className="text-gray-600">On-campus accommodation details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Hostel Available</p>
              <p className="text-xl font-bold text-gray-900">{college.hostel_available || "N/A"}</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Hostel Capacity</p>
              <p className="text-xl font-bold text-gray-900">{college.hostel_capacity ? `${college.hostel_capacity} Students` : "N/A"}</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-gray-100 text-center flex flex-col items-center justify-center">
              <p className="text-gray-400 text-sm">More details coming soon</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Ultimate Automation Section (PDF Page Viewer)
  const renderUltimateAutomation = () => {
    const code = college.college_code;
    const branch = college.branch_name;
    const map = seatMatrixMap as Record<string, Record<string, number>>;

    let pageNumber = 1;
    if (code && map[code] && branch) {
      // Find branch match - exact or fuzzy
      const collegeBranches = map[code];
      const match = Object.keys(collegeBranches).find(b =>
        branch.toLowerCase().includes(b.toLowerCase()) ||
        b.toLowerCase().includes(branch.toLowerCase())
      );

      if (match) {
        pageNumber = collegeBranches[match];
      } else if (Object.keys(collegeBranches).length > 0) {
        // Fallback to first branch of that college if no direct match
        pageNumber = Object.values(collegeBranches)[0];
      }
    }

    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 sm:p-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full translate-y-24 -translate-x-24 blur-2xl"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center space-x-3 sm:space-x-5">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner flex-shrink-0">
                <Bot className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight mb-1">Ultimate Automation</h2>
                <p className="text-blue-100 font-medium flex items-center gap-2 text-sm sm:text-base">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></span>
                  AI Seat Matrix Analysis 2025-26
                </p>
              </div>
            </div>

            <div className="flex flex-col md:items-end gap-2">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30">
                <span className="text-sm font-semibold">Matched Page: {pageNumber}</span>
              </div>
              <p className="text-xs text-blue-200">Automatically syncs with state-wide seat matrix data</p>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200 overflow-hidden min-h-[800px] flex flex-col">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-bold text-gray-700">Official Seat Matrix - Round I</span>
            </div>
            <a
              href={`${seatMatrixPDF}#page=${pageNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              Open in New Tab
            </a>
          </div>

          <iframe
            src={`${seatMatrixPDF}#page=${pageNumber}&view=FitH`}
            className="w-full flex-1 border-none min-h-[750px]"
            title="Seat Matrix Viewer"
          />

          <div className="p-4 bg-blue-50 border-t border-blue-100">
            <p className="text-xs text-blue-700 font-medium text-center">
              The AI has pinpointed the exact location for <strong>{college.branch_name}</strong> at <strong>{college.college_name}</strong>.
              The page above shows the specific intake, lateral entry seats, and category-wise distribution.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Render Feedback Section
  const renderFeedbackSection = () => {
    const feedbacks = collegeReviews;
    const totalFeedbacks = feedbacks.length;
    const averageRating = totalFeedbacks > 0
      ? feedbacks.reduce((acc, r: any) => acc + r.overall_rating, 0) / totalFeedbacks
      : 0;

    return (
      <div className="space-y-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Student Feedback & Reviews</h3>
              <p className="text-gray-600">Real feedback from current and former students</p>
            </div>
            {totalFeedbacks > 0 && (
              <div className="text-right flex-shrink-0">
                <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl">
                  <div className="text-3xl font-black text-indigo-700">{averageRating.toFixed(1)}</div>
                  <div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-50'
                            }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-indigo-600 font-bold mt-0.5">{totalFeedbacks} reviews</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center mb-8 pb-8 border-b border-gray-100">
            <button
              onClick={() => {
                if (!profile) alert("Please log in to submit a review.");
                else setShowFeedbackModal(true);
              }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-3"
            >
              <MessageSquare className="w-5 h-5 fill-white/20" />
              <span>Submit Your Own Review</span>
            </button>
          </div>

          <div className="space-y-6">
            {reviewsLoading ? (
              <div className="text-center py-10 font-medium text-slate-500 animate-pulse">Loading verified student reviews...</div>
            ) : totalFeedbacks > 0 ? (
              feedbacks.map((review: any) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 sm:p-8 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200/60 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center font-black text-indigo-700 text-xl border border-indigo-200/50 shadow-inner">
                        {review.reviewer_name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900">{review.reviewer_name || 'Alumnus'}</h4>
                          {review.is_verified_student && (
                            <span className="flex items-center gap-1 bg-sky-50 text-sky-700 border border-sky-200/50 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold">
                              <CheckCircle className="w-3 h-3" /> Verified Student
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{new Date(review.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/50 px-3 py-1.5 rounded-lg shrink-0">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-amber-700">{review.overall_rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Micro Ratings */}
                  <div className="grid grid-cols-5 gap-2 mb-6">
                    <div className="text-center bg-white border border-slate-100 p-2 rounded-lg">
                      <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Acad</div>
                      <div className="font-black text-slate-700">{review.academics_rating}</div>
                    </div>
                    <div className="text-center bg-white border border-slate-100 p-2 rounded-lg">
                      <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Place</div>
                      <div className="font-black text-slate-700">{review.placement_rating}</div>
                    </div>
                    <div className="text-center bg-white border border-slate-100 p-2 rounded-lg">
                      <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Life</div>
                      <div className="font-black text-slate-700">{review.campus_rating}</div>
                    </div>
                    <div className="text-center bg-white border border-slate-100 p-2 rounded-lg">
                      <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Infra</div>
                      <div className="font-black text-slate-700">{review.infrastructure_rating}</div>
                    </div>
                    <div className="text-center bg-white border border-slate-100 p-2 rounded-lg">
                      <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">ROI</div>
                      <div className="font-black text-slate-700">{review.roi_rating}</div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <h5 className="flex items-center gap-2 text-sm font-bold text-emerald-600 uppercase tracking-widest mb-2">
                        <ThumbsUp className="w-4 h-4 text-emerald-500" /> The Best Thing
                      </h5>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed bg-emerald-50/50 block p-4 rounded-xl border border-emerald-100/50">
                        {review.best_thing}
                      </p>
                    </div>
                    <div>
                      <h5 className="flex items-center gap-2 text-sm font-bold text-rose-600 uppercase tracking-widest mb-2">
                        <AlertTriangle className="w-4 h-4 text-rose-500" /> The Reality Check
                      </h5>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed bg-rose-50/50 block p-4 rounded-xl border border-rose-100/50">
                        {review.reality_check}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                    <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors group">
                      <div className="p-1.5 rounded bg-slate-100 group-hover:bg-indigo-50 transition-colors">
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </div>
                      Helpful ({review.upvotes?.length || 0})
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-16 px-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <MessageSquare className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="text-lg font-bold text-slate-800 mb-2">No reviews for this college yet</h4>
                <p className="text-slate-500 max-w-sm mx-auto mb-6">Your insights matter! Be the first to share your honest experience about placements, infrastructure, and campus life here.</p>
                <button
                  onClick={() => {
                    if (!profile) alert("Please log in to submit a review.");
                    else setShowFeedbackModal(true);
                  }}
                  className="px-6 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
                >
                  Write the First Review
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // The manual basic feedback form block has been deleted in favor of the full modal component

  // Render other tabs (simplified versions)
  const renderFeeStructure = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold mb-2">Annual Fee Structure</h2>
            <p className="text-blue-100">Complete breakdown of fees for {college.branch_name}</p>
          </div>
          {feeData.totalFees > 0 && (
            <div className="text-right">
              <div className="text-4xl font-bold mb-1">₹{feeData.totalFees.toLocaleString('en-IN')}</div>
              <div className="text-blue-100">Total Annual Fees</div>
            </div>
          )}
        </div>
      </div>

      {feeData.totalFees > 0 ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Fee Components</h3>
                  <div className="text-sm text-gray-500">All amounts in ₹ (INR)</div>
                </div>
                <div className="space-y-4">
                  {feeData.categories.map((fee, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200/50 hover:border-gray-300 hover:shadow-sm transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${fee.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <fee.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{fee.category}</div>
                          <div className="text-sm text-gray-600">Annual charges</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">₹{fee.amount.toLocaleString('en-IN')}</div>
                        <div className="text-sm text-gray-500">
                          {((fee.amount / feeData.totalFees) * 100).toFixed(1)}% of total
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                <h3 className="text-lg font-semibold mb-4 relative z-10">Fee Summary</h3>
                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-center p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <span>Total Annual Fees</span>
                    <span className="font-bold">₹{feeData.totalFees.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <span>Per Semester</span>
                    <span className="font-bold">₹{(feeData.totalFees / 2).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <span>4-Year Total</span>
                    <span className="font-bold">₹{(feeData.totalFees * 4).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-sm border border-gray-200/50 text-center">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Fee Data Available</h3>
          <p className="text-gray-600 mb-6">Contact the college administration for fee details</p>
          {college.contact_email && (
            <a
              href={`mailto:${college.contact_email}`}
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
            >
              Contact College
            </a>
          )}
        </div>
      )}
    </div>
  );

  const renderInfrastructure = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24"></div>
        <div className="flex items-center space-x-4 relative z-10">
          <Building className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Campus Infrastructure</h2>
            <p className="text-emerald-100">College facilities and amenities</p>
          </div>
        </div>
      </div>

      {infrastructure.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {infrastructure.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`${item.bgColor} backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <div className="flex flex-col h-full relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.label}</h3>
                <p className={`text-2xl font-bold ${item.color} mb-2`}>
                  {typeof item.value === 'string' ? item.value :
                    typeof item.value === 'number' ? item.value.toLocaleString() :
                      "Available"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-sm border border-gray-200/50 text-center">
          <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Infrastructure Data Available</h3>
          <p className="text-gray-600">Infrastructure details will be updated soon</p>
        </div>
      )}
    </div>
  );

  const renderPlacement = () => {
    const hasPlacementData = placementData.placementRate > 0 || placementData.averagePackage > 0;

    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-4 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24"></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between relative z-10 gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Placement Statistics</h2>
              <p className="text-purple-100 text-sm sm:text-base">Career opportunities and placement records</p>
            </div>
            {hasPlacementData && (
              <div className="sm:text-right flex-shrink-0">
                <div className="text-3xl sm:text-4xl font-bold mb-1">{placementData.placementRate}%</div>
                <div className="text-purple-100 text-sm">Placement Rate</div>
              </div>
            )}
          </div>
        </div>

        {hasPlacementData ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {[
                { label: "Placement Rate", value: `${placementData.placementRate}%`, gradient: "from-blue-500 to-indigo-600", icon: TrendingUp, show: placementData.placementRate > 0 },
                { label: "Average Package", value: `${placementData.averagePackage} LPA`, gradient: "from-emerald-500 to-teal-600", icon: DollarSign, show: placementData.averagePackage > 0 },
                { label: "Highest Package", value: `${placementData.highestPackage} LPA`, gradient: "from-purple-500 to-pink-600", icon: Trophy, show: placementData.highestPackage > 0 },
                { label: "Internship Rate", value: `${placementData.internshipRate}%`, gradient: "from-amber-500 to-orange-600", icon: Briefcase, show: placementData.internshipRate > 0 },
              ].filter(metric => metric.show).map((metric, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-gradient-to-br ${metric.gradient} rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden group hover:shadow-xl transition-shadow duration-300`}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                  <div className="flex items-center space-x-2 mb-2 relative z-10">
                    <metric.icon className="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" />
                    <h3 className="text-xs sm:text-lg font-semibold leading-tight">{metric.label}</h3>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold mb-1 relative z-10">{metric.value}</div>
                  <div className="text-white/80 text-xs sm:text-sm relative z-10">Current Year</div>
                </motion.div>
              ))}
            </div>

            {placementData.topRecruiters.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
                <div className="flex flex-wrap items-center justify-between mb-4 sm:mb-6 gap-2">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Top Recruiting Companies</h3>
                  <div className="text-sm text-gray-500">{placementData.topRecruiters.length} companies</div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {placementData.topRecruiters.map((recruiter, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-gray-50 to-white border border-gray-200/50 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all duration-300 group hover:-translate-y-0.5"
                    >
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <span className="font-medium text-gray-800">{recruiter}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {placementData.placementContact && placementData.placementContact !== "Not Available" && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Placement Cell Contact</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">{placementData.placementContact}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-sm border border-gray-200/50 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Placement Data Available</h3>
            <p className="text-gray-600">Placement details will be updated soon</p>
          </div>
        )}
      </div>
    );
  };

  const renderNewsMedia = () => {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <ImageIcon className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold mb-2">College Information & Gallery</h2>
              <p className="text-gray-300">Contact details and campus visuals</p>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">College Campus</h3>
            <button
              onClick={() => setShowImageModal(true)}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-300 text-sm"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">View Fullscreen</span>
              <span className="sm:hidden">Fullscreen</span>
            </button>
          </div>

          <div className="relative h-48 sm:h-64 md:h-96 rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => setShowImageModal(true)}
          >
            {college.college_code ? (
              <CollegeImage
                collegeCode={college.college_code}
                type="campus"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt={`${college.college_name} campus`}
              />
            ) : (
              <img
                src={getRandomFallbackImage()}
                alt={college.college_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
              <div className="text-white">
                <p className="text-lg font-semibold">{college.college_name}</p>
                <p className="text-white/90">{college.city}, Maharashtra</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
            <div className="space-y-4">
              {college.contact_email && college.contact_email !== "N/A" && (
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50 hover:border-blue-300 transition-colors group">
                  <Mail className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a
                      href={`mailto:${college.contact_email}`}
                      className="font-medium text-blue-700 hover:text-blue-800 transition-colors"
                    >
                      {college.contact_email}
                    </a>
                  </div>
                </div>
              )}

              {college.contact_phone && college.contact_phone !== "N/A" && (
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200/50 hover:border-emerald-300 transition-colors group">
                  <Phone className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a
                      href={`tel:${college.contact_phone}`}
                      className="font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      {college.contact_phone}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl border border-amber-200/50 hover:border-amber-300 transition-colors group">
                <MapPin className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-amber-700">{college.city}, {college.district || "Maharashtra"}, India</p>
                </div>
              </div>

              {college.website_url && college.website_url !== "N/A" && (
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50 hover:border-purple-300 transition-colors group">
                  <Globe className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-sm text-gray-600">Website</p>
                    <a
                      href={college.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-purple-700 hover:text-purple-800 transition-colors flex items-center"
                    >
                      Visit College Website
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6">College Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl">
                <span className="text-gray-700">Established Year</span>
                <span className="font-bold text-gray-900">{academicData.establishedYear}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl">
                <span className="text-gray-700">Accreditation</span>
                <span className="font-bold text-gray-900">{academicData.accreditation}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl">
                <span className="text-gray-700">Autonomy Status</span>
                <span className="font-bold text-gray-900">{college.autonomy_status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderImageModal = () => {
    return (
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
                <button
                  onClick={() => setShowImageModal(false)}
                  className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="h-full overflow-y-auto">
                {college.college_code ? (
                  <CollegeImage
                    collegeCode={college.college_code}
                    type="campus"
                    className="w-full h-auto max-h-[70vh] object-contain"
                    alt={`${college.college_name} campus`}
                  />
                ) : (
                  <img
                    src={getRandomFallbackImage()}
                    alt={college.college_name}
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                )}
                <div className="p-8 bg-gradient-to-b from-white to-gray-50">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{college.college_name}</h3>
                  <p className="text-gray-600 mb-4">{college.city}, {college.district || "Maharashtra"}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">Established: {academicData.establishedYear}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">Accreditation: {academicData.accreditation}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">University: {academicData.university}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">Degree: {academicData.degreeType}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderSeatMatrixTab = () => {
    const seatMatrix = college.seat_matrix || [];
    const totalIntake = seatMatrix.length > 0 ? seatMatrix.reduce((sum, cat) => sum + cat.seats, 0) : (college.total_intake || 0);

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden group hover:shadow-xl transition-shadow duration-300"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
            <div className="flex items-center space-x-3 mb-2 relative z-10">
              <Users className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Total Intake</h3>
            </div>
            <p className="text-3xl font-bold mb-1">{totalIntake.toLocaleString()}</p>
            <p className="text-blue-100 text-sm">Seats available across all categories</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden group hover:shadow-xl transition-shadow duration-300"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
            <div className="flex items-center space-x-3 mb-2 relative z-10">
              <Tag className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Your Category</h3>
            </div>
            <p className="text-3xl font-bold mb-1">{
              (college.category && seatMatrix.find(cat => cat.category === college.category)?.seats) || 0
            }</p>
            <p className="text-emerald-100 text-sm">{college.category || "GOPEN"} seats available</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden group hover:shadow-xl transition-shadow duration-300"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
            <div className="flex items-center space-x-3 mb-2 relative z-10">
              <PieChart className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Categories</h3>
            </div>
            <p className="text-3xl font-bold mb-1">{seatMatrix.length}</p>
            <p className="text-purple-100 text-sm">Different reservation categories</p>
          </motion.div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-8 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
          <div className="mb-5 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Detailed Seat Matrix</h3>
            <p className="text-gray-600">Category-wise seat allocation for {college.branch_name}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                  <th className="pb-3 px-4">Category</th>
                  <th className="pb-3 px-4">Seats</th>
                  <th className="pb-3 px-4">Percentage</th>
                  <th className="pb-3 px-4">Allocation</th>
                  <th className="pb-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {seatMatrix.map((category, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium text-gray-900">{category.category}</span>
                        {category.category === college.category && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Your Category</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{category.seats.toLocaleString()}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Percent className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{category.percentage}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${category.percentage}%`,
                            backgroundColor: category.color
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${category.seats > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {category.seats > 0 ? 'Available' : 'Filled'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
              <div className="text-sm text-gray-600 mb-1">Total Available Seats</div>
              <div className="text-2xl font-bold text-gray-900">{totalIntake.toLocaleString()}</div>
            </div>
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200">
              <div className="text-sm text-gray-600 mb-1">Your Category Seats</div>
              <div className="text-2xl font-bold text-gray-900">
                {(college.category && seatMatrix.find(cat => cat.category === college.category)?.seats) || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6 sm:space-y-8">
      {quickStats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {quickStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Seat Matrix */}
          {renderSeatMatrixSection()}

          {/* Available Branches */}
          {renderAvailableBranches()}

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">College Overview</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200/50">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Established</p>
                    <p className="font-semibold text-gray-900">{academicData.establishedYear}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200/50">
                  <Building className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">University</p>
                    <p className="font-semibold text-gray-900">{academicData.university}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200/50">
                  <Award className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-sm text-gray-600">Accreditation</p>
                    <p className="font-semibold text-gray-900">{academicData.accreditation}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200/50">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Intake</p>
                    <p className="font-semibold text-gray-900">
                      {typeof seatData.totalIntake === 'number' ? seatData.totalIntake.toLocaleString() : seatData.totalIntake}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200/50">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Degree Type</p>
                    <p className="font-semibold text-gray-900">{academicData.degreeType}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200/50">
                  <MapPin className="w-5 h-5 text-rose-600" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold text-gray-900">{college.city}, {college.district || "Maharashtra"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Program Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50">
                  <p className="text-sm text-blue-700 font-medium">Degree Type</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{academicData.degreeType}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200/50">
                  <p className="text-sm text-emerald-700 font-medium">Branch Name</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{getBranchFullName(college.branch_name || "")}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50">
                  <p className="text-sm text-purple-700 font-medium">Duration</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{academicData.duration} years</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl border border-amber-200/50">
                  <p className="text-sm text-amber-700 font-medium">Shift</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{academicData.shift}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Admission Process */}
          {renderAdmissionProcess()}

          {/* Scholarships */}
          {renderScholarshipsSection()}

          {/* Feedback */}
          {renderFeedbackSection()}
        </div>

        <div className="space-y-8">
          <InfoCard
            title="Admission & Placement"
            icon={Target}
            gradient="from-blue-500 to-indigo-600"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/15 transition-colors">
                <span className="text-white/90">Cutoff Rank</span>
                <span className="text-white font-bold">{getCutoffDisplay()}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/15 transition-colors">
                <span className="text-white/90">Placement Rate</span>
                <span className="text-white font-bold">{formatPercentage(placementData.placementRate)}</span>
              </div>

              {placementData.averagePackage > 0 && (
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/15 transition-colors">
                  <span className="text-white/90">Avg Package</span>
                  <span className="text-white font-bold">{placementData.averagePackage} LPA</span>
                </div>
              )}

              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm hover:bg-white/15 transition-colors">
                <span className="text-white/90">Category Seats</span>
                <span className="text-white font-bold">{seatData.currentSeats > 0 ? seatData.currentSeats.toLocaleString() : "N/A"}</span>
              </div>
            </div>
          </InfoCard>

          {/* Right Sidebar: Required Documents (Moved from Dashboard) */}
          <div className="bg-white rounded-[24px] border border-slate-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-50 rounded-xl">
                <ClipboardList className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Admission Docs</h3>
            </div>

            <div className="space-y-4">
              {[
                "SSC (10th) Marksheet",
                "HSC (12th) Marksheet",
                "Diploma Marksheet (All Sem)",
                "Leaving Certificate (LC)",
                "Domicile Certificate",
                "Nationality Certificate",
                "Caste & Validity (if reg.)",
                "Non-Creamy Layer (NCL)",
                "Income Certificate (TFWS)"
              ].map((doc, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="mt-1 w-5 h-5 rounded-md border-2 border-slate-200 flex items-center justify-center group-hover:border-indigo-500 transition-colors">
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{doc}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Important Note</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Ensure all documents are scavenged and scanned as PDFs below 500KB for the CAP portal.
              </p>
            </div>

            <button
              onClick={() => navigate("/help")}
              className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Documentation Guide
            </button>
          </div>

          {/* Admission Timeline Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[24px] p-6 text-white shadow-lg overflow-hidden relative">
            <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 blur-3xl rounded-full" />
            <div className="relative z-10">
              <h4 className="font-black text-xs uppercase tracking-[0.2em] opacity-70 mb-4">Live Updates</h4>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 animate-pulse" />
                  <div>
                    <div className="text-sm font-bold">CAP Round 1</div>
                    <div className="text-[10px] opacity-70 font-medium whitespace-nowrap">Starting July 2026 Expected</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Distance Calculator */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <div className="flex items-center space-x-3">
                <Navigation className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Distance Calculator</h3>
              </div>
              <button
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm"
              >
                {isGettingLocation ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Getting Location...</span>
                  </>
                ) : (
                  <>
                    <Locate className="w-4 h-4" />
                    <span>Get Distance</span>
                  </>
                )}
              </button>
            </div>

            {locationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700 text-sm">{locationError}</span>
                </div>
              </div>
            )}

            {distance !== null ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 gap-3">
                  <div className="flex items-center space-x-3">
                    <Route className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Distance from your location</p>
                      <p className="text-2xl font-bold text-gray-900">{distance.toFixed(1)} km</p>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-sm text-gray-500">Approx. travel time</p>
                    <p className="text-lg font-semibold text-gray-700">
                      {distance < 10 ? `${Math.round(distance * 6)} min` :
                        distance < 50 ? `${Math.round(distance * 2)} min` :
                          `${Math.round(distance / 50)} hr`}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <MapPinned className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">Click "Get Distance" to calculate distance from your current location</p>
              </div>
            )}
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              {college.contact_email && college.contact_email !== "N/A" && (
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <a
                    href={`mailto:${college.contact_email}`}
                    className="font-medium text-blue-700 hover:text-blue-800 transition-colors truncate"
                  >
                    {college.contact_email}
                  </a>
                </div>
              )}

              {college.contact_phone && college.contact_phone !== "N/A" && (
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  <a
                    href={`tel:${college.contact_phone}`}
                    className="font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    {college.contact_phone}
                  </a>
                </div>
              )}

              {college.website_url && college.website_url !== "N/A" && (
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl">
                  <Globe className="w-5 h-5 text-purple-600" />
                  <a
                    href={college.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-purple-700 hover:text-purple-800 transition-colors truncate"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div >
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <Navbar activeTab="search" />
        <div className="flex-grow flex items-center justify-center p-4 py-20">
          <div className="text-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                <RefreshCw className="w-10 h-10 text-white animate-spin" />
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur-xl opacity-20"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading College Details</h2>
            <p className="text-gray-600">Fetching complete information...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <Navbar activeTab="search" />
        <div className="flex-grow flex items-center justify-center p-4 py-20">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-gradient-to-r from-rose-100 to-rose-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-rose-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Details</h2>
            <p className="text-gray-600 mb-6">{error}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity hover:shadow-lg"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => setRetryCount(prev => prev + 1)}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity hover:shadow-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!college || !college.college_name || college.college_name === "Unknown College") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <Navbar activeTab="search" />
        <div className="flex-grow flex items-center justify-center p-4 py-20">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-300 to-gray-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <School className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">College Not Found</h2>
            <p className="text-gray-600 mb-6">The requested college information could not be loaded.</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity hover:shadow-lg"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <Navbar activeTab="search" />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-3">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium transition-colors px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 hover:border-gray-300 hover:shadow-sm self-start"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleSaveCollege}
                className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-300 ${saved
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-sm'
                  }`}
              >
                <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                <span>{saved ? 'Saved' : 'Save'}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:border-gray-400 hover:shadow-sm transition-all duration-300"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm rounded-3xl p-4 sm:p-8 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                  {college.college_code ? (
                    <CollegeImage
                      collegeCode={college.college_code}
                      type="logo"
                      className="w-full h-full object-cover"
                      alt={`${college.college_name} logo`}
                    />
                  ) : (
                    <School className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-xl opacity-20 -z-10"></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                  <div className="min-w-0">
                    <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">{college.college_name}</h1>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-600 mb-3 text-sm">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{college.city}{college.district && college.district !== "N/A" ? `, ${college.district}` : ''}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{college.branch_name}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Tag className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{college.category}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Award className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{academicData.accreditation}</span>
                      </div>
                    </div>
                  </div>
                  {college.is_most_probable && (
                    <div className="self-start px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap">
                      🎯 Most Probable
                    </div>
                  )}
                </div>

                {college.university && college.university !== "N/A" && (
                  <p className="text-sm text-gray-500">
                    Affiliated to: <span className="font-medium text-gray-700">{college.university}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="sticky top-0 sm:top-4 z-10 mb-4 sm:mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
            <div className="flex overflow-x-auto scrollbar-hide">
              {[
                { id: "overview", label: "Overview", icon: Eye },
                { id: "seats", label: "Seat Matrix", icon: Layers },
                { id: "fees", label: "Fee Structure", icon: CreditCard },
                { id: "infrastructure", label: "Infrastructure", icon: Building },
                { id: "placement", label: "Placements", icon: Trophy },
                { id: "facilities", label: "Facilities", icon: Home },
                { id: "automation", label: "Ultimate Automation", icon: Bot },
                { id: "news", label: "College Info", icon: Newspaper },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap border-b-2 ${activeTab === tab.id
                    ? "text-blue-600 border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50"
                    : "text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-[600px]"
          >
            {activeTab === "overview" && renderOverview()}
            {activeTab === "seats" && renderSeatMatrixTab()}
            {activeTab === "fees" && renderFeeStructure()}
            {activeTab === "infrastructure" && renderInfrastructure()}
            {activeTab === "placement" && renderPlacement()}
            {activeTab === "news" && renderNewsMedia()}
            {activeTab === "facilities" && renderFacilitiesSection()}
            {activeTab === "automation" && renderUltimateAutomation()}
          </motion.div>
        </AnimatePresence>
      </div>

      <ReviewModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        collegeCode={college.college_code || ''}
        collegeName={college.college_name}
        profile={profile}
        onSuccess={() => {
          // Re-fetch reviews or update state directly after success
          setShowFeedbackModal(false);
          window.location.reload();
        }}
      />
      {renderImageModal()}

      {/* AI Assistant Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowAIChat(!showAIChat)}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        >
          {showAIChat ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Bot className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      {/* AI Assistant Chat Modal */}
      <AnimatePresence>
        {showAIChat && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Assistant</h3>
                    <p className="text-xs text-blue-100">Ask me about {college.college_name}</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </motion.div>
                ))}

                {isAIThinking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 p-3 rounded-2xl">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-gray-500">AI is thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Quick Reply Suggestions */}
              {chatMessages.length === 1 && !isAIThinking && (
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-2">
                    {[
                      "What are the admission requirements?",
                      "Tell me about fees",
                      "How are placements?",
                      "What facilities are available?"
                    ].map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setChatInput(suggestion)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask me anything about this college..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={isAIThinking}
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isAIThinking}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <Footer />
    </div>
  );
}
