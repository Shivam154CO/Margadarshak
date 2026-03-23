import type { College } from "@/types/college";

export const normalizeCollegeData = (collegeData: any): College => {
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

  const safeParseJson = (val: any, fallback: any) => {
    if (!val) return fallback;
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return fallback;
      }
    }
    return val;
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

    // Detailed lists
    branches: safeParseJson(collegeData.branches, []),
    seat_matrix: safeParseJson(collegeData.seat_matrix || collegeData.seatMatrix, []),
    admission_process: safeParseJson(collegeData.admission_process || collegeData.admissionSteps, []),
    scholarships: safeParseJson(collegeData.scholarships, []),
    feedback: safeParseJson(collegeData.feedback, []),
    admission_dates: safeParseJson(collegeData.admission_dates || collegeData.admissionDates, null),
    admission_contacts: safeParseJson(collegeData.admission_contacts || collegeData.admissionContacts, []),
  };

  return normalized;
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
  if (branch.includes("EI")) return "Electronics and Instrumentation";
  if (branch.includes("PROD")) return "Production Engineering";
  if (branch.includes("TEXTILE")) return "Textile Engineering";
  if (branch.includes("CHEM")) return "Chemical Engineering";
  if (branch.includes("BIOTECH")) return "Biotechnology";
  if (branch.includes("BIOMED")) return "Biomedical Engineering";
  return branchName || "Engineering";
};

export const formatPercentage = (value: number) => {
  if (!value || value === 0) return "N/A";
  return `${value}%`;
};
