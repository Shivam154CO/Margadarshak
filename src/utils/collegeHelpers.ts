import type { College } from "../types/college";

export const getCollegeImage = (collegeCode: string): string => {
    if (!collegeCode) return "/src/assets/fallback-campus.jpg";
    return `/src/assets/${collegeCode}/campus.png`;
};

export const getCollegeLogo = (collegeCode: string): string => {
    if (!collegeCode) return "/src/assets/fallback-logo.jpg";
    return `/src/assets/${collegeCode}/logo.png`;
};

export const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
];

export const getRandomFallbackImage = (): string => {
    return FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
};

export const formatYear = (year: any) => {
    if (!year || year === 0 || year === "0" || year === "N/A") return "N/A";
    return year;
};

export const getBranchFullName = (branchName: string) => {
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
    return branchName || "Engineering";
};

export const formatPercentage = (value: number) => {
    if (!value || value === 0) return "N/A";
    return `${value}%`;
};

export const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
        'GOPEN': '#FF6384',
        'GST': '#36A2EB',
        'GOBC': '#FFCE56',
        'LOPEN': '#4BC0C0',
        'LSC': '#9966FF',
        'LSEBC': '#FF9F40',
        'EWS': '#FF6384',
        'LOBC': '#36A2EB',
        'LST': '#FFCE56',
        'LNT': '#4BC0C0',
        'LNTC': '#9966FF',
        'PWDR-SC': '#FF9F40',
        'PWDR-ST': '#FF6384',
        'GNTA': '#36A2EB',
        'GNTB': '#FFCE56',
        'GNTC': '#4BC0C0',
        'GNTD': '#9966FF',
        'GSEBC': '#FF9F40',
        'GSC': '#FF6384',
    };
    return colors[category] || '#FF6384';
};

export const getCityCoordinates = (city: string): { lat: number; lng: number } => {
    const cityCoords: Record<string, { lat: number; lng: number }> = {
        "Mumbai": { lat: 19.0760, lng: 72.8777 },
        "Pune": { lat: 18.5204, lng: 73.8567 },
        "Nagpur": { lat: 21.1458, lng: 79.0882 },
        "Bangalore": { lat: 12.9716, lng: 77.5946 },
        "Hyderabad": { lat: 17.3850, lng: 78.4867 },
    };
    return cityCoords[city] || { lat: 20.5937, lng: 78.9629 };
};

export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const normalizeCollegeData = (collegeData: any): College => {
    if (!collegeData) {
        return { college_name: "Unknown College", city: "N/A", autonomy_status: "N/A" } as College;
    }

    const safeParse = (value: any, defaultValue: any = '') => {
        if (value === null || value === undefined || value === '') return defaultValue;
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            if (!isNaN(Number(value)) && value.trim() !== '') return Number(value);
            return value.trim();
        }
        return String(value);
    };

    return {
        college_code: safeParse(collegeData.college_code || collegeData.collegeCode, ''),
        college_name: safeParse(collegeData.college_name || collegeData.collegeName || collegeData.name, 'Unknown College'),
        city: safeParse(collegeData.city, 'N/A'),
        autonomy_status: safeParse(collegeData.autonomy_status || collegeData.autonomyStatus, 'N/A'),
        placement_rate: safeParse(collegeData.placement_rate || collegeData.placementRate, 0),
        average_package_lpa: safeParse(collegeData.average_package_lpa || collegeData.averagePackageLpa, 0),
        highest_package_lpa: safeParse(collegeData.highest_package_lpa || collegeData.highestPackageLpa, 0),
        website: safeParse(collegeData.website_url || collegeData.websiteUrl || collegeData.website, ''),
        contact_email: safeParse(collegeData.contact_email || collegeData.contactEmail, ''),
        phone: safeParse(collegeData.contact_phone || collegeData.contactPhone, ''),
        hostel_available: safeParse(collegeData.hostel_available || collegeData.hostelAvailable, 'N/A'),
        branches: Array.isArray(collegeData.branches) ? collegeData.branches : [],
        admission_process: Array.isArray(collegeData.admission_process) ? collegeData.admission_process : [],
        scholarships: Array.isArray(collegeData.scholarships) ? collegeData.scholarships : [],
        image: safeParse(collegeData.image || collegeData.image_url, ''),
        logo_url: safeParse(collegeData.logo_url || collegeData.logoUrl, ''),
    } as College;
};
