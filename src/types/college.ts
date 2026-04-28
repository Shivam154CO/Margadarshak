export interface BranchSeatMatrix {
    category: string;
    seats: number;
    percentage: number;
    color: string;
}

export interface BranchInfo {
    branch_code: string;
    branch_name: string;
    seats?: number;
    fees?: number;
    cutoff_rank?: number;
    cutoff_percentile?: number;
    duration_years?: number;
    degree_type?: string;
    total_intake?: number;
    available_seats?: number;
    categories?: BranchSeatMatrix[];
    admission_chance?: number;
    admission_chance_percentage?: string;
    match_score?: number;
    probability_level?: string;
    is_most_probable?: boolean;
}

export interface AdmissionStep {
    step: number;
    title: string;
    description: string;
    deadline?: string;
    required_docs: string[];
}

export interface Scholarship {
    id: string;
    name: string;
    provider: string;
    amount: string;
    eligibility: string;
    application_link: string;
    deadline: string;
    type: string;
}

export interface Feedback {
    id: string;
    rating: number;
    comment: string;
    user_name: string;
    date: string;
    verified: boolean;
    helpful_count: number;
}

export interface CollegeContact {
    website?: string;
    website_url?: string;
    contact_email?: string;
    contact_phone?: string;
    phone?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    social_media?: {
        facebook: string;
        twitter: string;
        linkedin: string;
        instagram: string;
        youtube: string;
    };
}

export interface CollegeInfrastructure {
    hostel_available?: string;
    library_books?: number;
    labs_count?: number;
    wifi_available?: boolean;
    wifi_campus?: string;
    sports_facilities?: any;
    transport_facility?: string;
    medical_facility?: string;
    campus_area?: number;
    cafeteria_count?: number;
    hostel_capacity?: number;
    wifi_coverage?: boolean;
}

export interface PlacementStats {
    placement_rate?: number;
    average_package_lpa?: number;
    highest_package_lpa?: number;
    placement_companies?: string[];
    top_recruiters?: string;
    internship_rate?: number;
    foreign_offers?: number;
    placement_cell_contact?: string;
}

export interface AdmissionContact {
    name: string;
    role: string;
    phone: string;
    email: string;
}

export interface AdmissionMeta {
    admission_start?: string;
    admission_end?: string;
    merit_list_date?: string;
    important_dates?: {
        event: string;
        date: string;
    }[];
    admission_dates?: {
        application_start: string;
        application_end: string;
        merit_list_date: string;
        admission_start: string;
        admission_end: string;
    };
    admission_contacts?: AdmissionContact[];
}

export interface College extends CollegeContact, CollegeInfrastructure, PlacementStats, AdmissionMeta {
    // Common fields
    college_code: string;
    college_name: string;
    short_name?: string;
    city: string;
    district?: string;
    region?: string;
    university?: string;
    autonomy_status?: string;
    established_year?: number;
    image?: string;
    logo_url?: string;
    status?: string | 'Government' | 'Private' | 'Aided';
    nirf_ranking?: number;
    naac_grade?: string;
    accreditation?: string | string[];

    // Branch specific (often used in search results)
    branch?: string;
    branch_name?: string;
    branch_code?: string;
    fees?: number;
    cutoff_rank?: number;
    cutoff_percentile?: number;
    category?: string;
    seats?: number;

    // Numerical Data
    total_intake?: number;
    student_count?: number;
    faculty_count?: number;
    student_faculty_ratio?: number;

    // Predictions/Match (UI state)
    probability_level?: string;
    is_most_probable?: boolean;
    admission_chance?: number;
    admission_chance_percentage?: string;
    fit?: string;
    fit_reason?: string;
    match_score?: number;
    match_percentage?: string;
    available_branches?: string[];

    // Display helpers
    display_fees?: string;
    display_seats?: string;
    display_cutoff?: string;
    display_placement?: string;

    // Extended data
    id?: string;
    state?: string;
    description?: string;
    facilities?: string[];
    courses_offered?: string[];
    
    // Detailed Lists
    branches?: BranchInfo[];
    seat_matrix?: BranchSeatMatrix[];
    is_predicted?: boolean;
    rating?: number;
    total_feedbacks?: number;
    admission_process?: AdmissionStep[];
    scholarships?: Scholarship[];
    feedback?: Feedback[];
    
    // Additional Info
    degree_type?: string;
    duration_years?: number;
    shift?: string;
    hostel_fees?: number;
    hostel_type?: string;
    bus_fees?: number;
    location_data?: { lat: number; lng: number };
    clubs_count?: number;
    image_url?: string;
    
    // Academic & Extracurricular Data
    scholarship_opportunities?: string;
    international_collaborations?: string;
    industry_tie_ups?: number;
    research_papers?: number;
    patents?: number;
    alumni_strength?: number;
}

export const _TYPE_MARKER = true;

export interface RawCollege extends College {
    // Used for data mapping from Supabase/Machine Learning
    [key: string]: any;
}
