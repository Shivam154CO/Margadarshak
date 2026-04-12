import React from 'react';
import { TrendingUp, DollarSign, Award, Users, User, Trophy, Star, Target, Layers, Home, Shield, Calendar, MapPin, CheckCircle, GraduationCap, Link2, Mail, Phone, Library, Activity, Maximize2, Briefcase, Landmark } from 'lucide-react';

export interface College {
  college_code: string;
  college_name: string;
  city: string;
  district?: string;
  branch: string;
  branch_name: string;
  branch_code: string;
  fees: number;
  placement_rate: number;
  cutoff_rank: number;
  cutoff_percentile: number;
  category: string;
  average_package_lpa: number;
  highest_package_lpa: number;
  total_intake: number;
  seats: number;
  autonomy_status: string;
  hostel_available: string;
  image: string;
  logo_url: string;
  contact_email: string;
  contact_phone: string;
  website_url: string;
  accreditation?: string;
  established_year?: number;
  university?: string;
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
  nirf_ranking?: number;
  naac_grade?: string;
  status?: string;
  internship_rate?: number;

  // Prediction fields
  probability_level?: string;
  is_most_probable?: boolean;
  admission_chance?: number;
  admission_chance_percentage?: string;
  fit?: string;
  fit_reason?: string;
  match_score?: number;
  match_percentage?: string;

  // Display fields
  display_fees?: string;
  display_seats?: string;
  display_cutoff?: string;
  display_placement?: string;
}

export interface ComparisonMetric {
  key: keyof College;
  label: string;
  icon: React.ReactNode;
  unit?: string;
  higherIsBetter: boolean;
  weight: number;
  category: "academic" | "financial" | "infrastructure" | "career";
  description?: string;
}

export const COMPARISON_METRICS: ComparisonMetric[] = [
  {
    key: "placement_rate",
    label: "Placement Rate",
    icon: React.createElement(TrendingUp, { className: "w-4 h-4" }),
    unit: "%",
    higherIsBetter: true,
    weight: 25,
    category: "career",
    description: "Percentage of students placed"
  },
  {
    key: "average_package_lpa",
    label: "Avg Package",
    icon: React.createElement(DollarSign, { className: "w-4 h-4" }),
    unit: " LPA",
    higherIsBetter: true,
    weight: 20,
    category: "career",
    description: "Average annual salary package"
  },
  {
    key: "fees",
    label: "Annual Fees",
    icon: React.createElement(DollarSign, { className: "w-4 h-4" }),
    unit: " ₹",
    higherIsBetter: false,
    weight: 15,
    category: "financial",
    description: "Annual tuition fees"
  },
  {
    key: "cutoff_percentile",
    label: "Cutoff Score",
    icon: React.createElement(Award, { className: "w-4 h-4" }),
    unit: "%",
    higherIsBetter: true,
    weight: 15,
    category: "academic",
    description: "Required percentile for admission"
  },
  {
    key: "total_intake",
    label: "Total Intake",
    icon: React.createElement(Users, { className: "w-4 h-4" }),
    unit: "",
    higherIsBetter: true,
    weight: 10,
    category: "academic",
    description: "Total number of students admitted"
  },
  {
    key: "seats",
    label: "Available Seats",
    icon: React.createElement(User, { className: "w-4 h-4" }),
    unit: "",
    higherIsBetter: true,
    weight: 8,
    category: "academic",
    description: "Number of available seats"
  },
  {
    key: "highest_package_lpa",
    label: "Highest Package",
    icon: React.createElement(Trophy, { className: "w-4 h-4" }),
    unit: " LPA",
    higherIsBetter: true,
    weight: 12,
    category: "career",
    description: "Highest salary package offered"
  },
  {
    key: "rating",
    label: "College Rating",
    icon: React.createElement(Star, { className: "w-4 h-4" }),
    unit: "/5",
    higherIsBetter: true,
    weight: 10,
    category: "academic",
    description: "Overall college rating"
  },
  {
    key: "nirf_ranking",
    label: "NIRF Ranking",
    icon: React.createElement(Target, { className: "w-4 h-4" }),
    unit: "",
    higherIsBetter: false,
    weight: 8,
    category: "academic",
    description: "Lower ranking number is better"
  },
  {
    key: "alumni_strength",
    label: "Alumni Strength",
    icon: React.createElement(Layers, { className: "w-4 h-4" }),
    unit: "",
    higherIsBetter: true,
    weight: 7,
    category: "career",
    description: "Strength of alumni network"
  },
  {
    key: "city",
    label: "Location",
    icon: React.createElement(MapPin, { className: "w-4 h-4" }),
    unit: "",
    higherIsBetter: true,
    weight: 0,
    category: "infrastructure",
    description: "Base city of the campus"
  },
  {
    key: "status",
    label: "Institution Type",
    icon: React.createElement(Landmark, { className: "w-4 h-4" }),
    unit: "",
    higherIsBetter: true,
    weight: 0,
    category: "academic",
    description: "Government, Private, or Aided Status"
  },
  {
    key: "campus_area",
    label: "Campus Size",
    icon: React.createElement(Maximize2, { className: "w-4 h-4" }),
    unit: " Acres",
    higherIsBetter: true,
    weight: 0,
    category: "infrastructure",
    description: "Total campus area in acres"
  },
  {
    key: "library_books",
    label: "Library Collection",
    icon: React.createElement(Library, { className: "w-4 h-4" }),
    unit: " Books",
    higherIsBetter: true,
    weight: 0,
    category: "infrastructure",
    description: "Volume of books available in digital/physical library"
  },
  {
    key: "sports_facilities",
    label: "Sports Facilities",
    icon: React.createElement(Activity, { className: "w-4 h-4" }),
    unit: "",
    higherIsBetter: true,
    weight: 0,
    category: "infrastructure",
    description: "Availability of sports grounds and equipment"
  },
  {
    key: "internship_rate",
    label: "Internship Rate",
    icon: React.createElement(Briefcase, { className: "w-4 h-4" }),
    unit: "%",
    higherIsBetter: true,
    weight: 0,
    category: "career",
    description: "Percentage of students securing internships"
  },
  {
    key: "website_url",
    label: "Official Website",
    icon: React.createElement(Link2, { className: "w-4 h-4" }),
    unit: "",
    higherIsBetter: true,
    weight: 0,
    category: "academic",
    description: "Link to the college's official domain"
  },
  {
    key: "contact_email",
    label: "Contact Email",
    icon: React.createElement(Mail, { className: "w-4 h-4" }),
    unit: "",
    higherIsBetter: true,
    weight: 0,
    category: "academic",
    description: "Primary academic or admission email"
  },
  {
    key: "contact_phone",
    label: "Contact Phone",
    icon: React.createElement(Phone, { className: "w-4 h-4" }),
    unit: "",
    higherIsBetter: true,
    weight: 0,
    category: "academic",
    description: "Primary contact or reception line"
  },
  {
    key: "established_year",
    label: "Established",
    icon: React.createElement(Calendar, { className: "w-4 h-4" }),
    unit: "",
    higherIsBetter: false,
    weight: 0,
    category: "academic",
    description: "Founding year of the institute"
  },
  {
    key: "autonomy_status",
    label: "Autonomy",
    icon: React.createElement(Shield, { className: "w-4 h-4" }),
    unit: "",
    higherIsBetter: true,
    weight: 0,
    category: "academic",
    description: "Autonomous or Non-Autonomous status"
  },
  {
    key: "hostel_available",
    label: "Hostel Facility",
    icon: React.createElement(Home, { className: "w-4 h-4" }),
    unit: "",
    higherIsBetter: true,
    weight: 0,
    category: "infrastructure",
    description: "Availability of campus hostel"
  },
  {
    key: "accreditation",
    label: "Accreditation",
    icon: React.createElement(CheckCircle, { className: "w-4 h-4" }),
    unit: "",
    higherIsBetter: true,
    weight: 0,
    category: "academic",
    description: "NAAC/NBA Accreditations"
  },
  {
    key: "university",
    label: "University",
    icon: React.createElement(GraduationCap, { className: "w-4 h-4" }),
    unit: "",
    higherIsBetter: true,
    weight: 0,
    category: "academic",
    description: "Affiliating University"
  },
  {
    key: "naac_grade",
    label: "NAAC Grade",
    icon: React.createElement(Award, { className: "w-4 h-4" }),
    unit: "",
    higherIsBetter: true,
    weight: 0,
    category: "academic",
    description: "Specific NAAC grading (e.g., A++, A+)"
  }
];
