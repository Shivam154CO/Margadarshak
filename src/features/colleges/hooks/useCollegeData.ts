import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import axios from "axios";
import type { College, RawCollege } from "@/types/college";

const ML_API_URL = import.meta.env.VITE_ML_API_URL ?? "http://127.0.0.1:5001";

// Removing hardcoded mapping to make it 100% dynamic.
// The region/state should come from the ML API or Supabase backend.
const getStateFromCity = (city: string, rawRegion?: string): string => {
    return rawRegion || "Unknown";
};

// Groups raw ML prediction rows by college_code
const groupCollegesByCode = (rawColleges: RawCollege[]): College[] => {
    const collegeMap = new Map<string, College>();

    rawColleges.forEach((rawCollege) => {
        const collegeCode = rawCollege.college_code;

        if (!collegeMap.has(collegeCode)) {
            collegeMap.set(collegeCode, {
                college_code: collegeCode,
                college_name: rawCollege.college_name,
                city: rawCollege.city,
                image: rawCollege.image || "",
                autonomy_status: rawCollege.autonomy_status,
                hostel_available: rawCollege.hostel_available,
                placement_rate: rawCollege.placement_rate,
                average_package_lpa: rawCollege.average_package_lpa,
                highest_package_lpa: rawCollege.highest_package_lpa,
                branches: [],
                is_predicted: true,
                region: getStateFromCity(rawCollege.city, rawCollege.region || rawCollege.state),
                established_year: rawCollege.established_year || undefined,
                naac_grade: rawCollege.naac_grade || undefined,
                website: rawCollege.website || rawCollege.website_url || undefined,
                contact_email: rawCollege.contact_email || undefined,
                phone: rawCollege.contact_phone || undefined,
                address: rawCollege.address || `${rawCollege.college_name}, ${rawCollege.city}`
            } as College);
        }

        const college = collegeMap.get(collegeCode)!;
        if (!college.branches) college.branches = [];

        college.branches.push({
            branch_name: rawCollege.branch || "",
            branch_code: rawCollege.branch_code || "N/A",
            cutoff_rank: rawCollege.cutoff_rank,
            cutoff_percentile: rawCollege.cutoff_percentile,
            seats: rawCollege.seats,
            fees: rawCollege.Fees,
            admission_chance: rawCollege.admission_chance,
            admission_chance_percentage: rawCollege.admission_chance_percentage,
            match_score: rawCollege.match_score,
            probability_level: rawCollege.probability_level,
            is_most_probable: rawCollege.is_most_probable,
        });
    });

    return Array.from(collegeMap.values()).map(college => ({
        ...college,
        branches: (college.branches || []).sort((a, b) => (b.admission_chance || 0) - (a.admission_chance || 0))
    }));
};

const CACHE_KEY = "ikigai_colleges_cache";
const CACHE_TIME_KEY = "ikigai_colleges_cache_time";
const CACHE_EXPIRY = 1000 * 60 * 60 * 12; // 12 hours

const fetchAllColleges = async (): Promise<College[]> => {
    // Check local cache first for "instant" feel
    try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        
        if (cachedData && cachedTime) {
            const isExpired = Date.now() - parseInt(cachedTime) > CACHE_EXPIRY;
            if (!isExpired) {
                console.log("Using cached college data");
                return JSON.parse(cachedData);
            }
        }
    } catch (e) {
        console.error("Cache read error", e);
    }

    const PAGE_SIZE = 500; // Smaller chunks for better reliability
    let allRows: any[] = [];
    
    console.log("Fetching colleges from high-speed API cache...");
    const API_URL = import.meta.env.VITE_ML_API_URL || "http://localhost:5001";
    
    try {
        const response = await fetch(`${API_URL}/colleges/all_raw`);
        if (!response.ok) throw new Error("Failed to fetch from API Cache");
        allRows = await response.json();
        console.log(`Successfully fetched ${allRows.length} rows perfectly in one shot.`);
    } catch (apiError) {
        console.warn("API cache failed, falling back to Supabase pagination...", apiError);
        let from = 0;
        let hasMore = true;

        while (hasMore) {
            const { data: batch, error } = await supabase
                .from('colleges_2025')
                .select('*')
                .range(from, from + PAGE_SIZE - 1);

            if (error) throw error;
            if (!batch || batch.length === 0) {
                hasMore = false;
            } else {
                allRows = [...allRows, ...batch];
                from += PAGE_SIZE;
                if (batch.length < PAGE_SIZE) hasMore = false;
            }
        }
    }

    const collegeMap = new Map<string, College>();
    allRows.forEach((row: any) => {
        const code = String(row.college_code || row.id || "N/A");
        if (!collegeMap.has(code)) {
            collegeMap.set(code, {
                ...row,
                college_code: code,
                college_name: row.college_name || row.College_Name,
                city: row.city || row.City,
                autonomy_status: row.autonomy_status || row.Autonomy_Status || "Government",
                hostel_available: row.hostel_available || row.Hostel_Available || "No",
                placement_rate: parseFloat(row.placement_rate || row.Placement_Rate || 0),
                average_package_lpa: parseFloat(row.average_package_lpa || row.Average_Package_LPA || 0),
                highest_package_lpa: parseFloat(row.highest_package_lpa || row.Highest_Package_LPA || 0),
                branches: [],
                is_predicted: false,
                region: getStateFromCity(row.city || row.City, row.region || row.Region || row.state || row.State),
                website: row.website_url || row.Website_Url,
                address: row.address || `${row.college_name || row.College_Name}, ${row.city || row.City}`
            } as College);
        }
        const college = collegeMap.get(code)!;
        college.branches!.push({
            branch_name: row.branch_name || row.Branch_Name || "N/A",
            branch_code: String(row.branch_code || row.Branch_Code || "N/A"),
            cutoff_rank: row.cutoff_rank || row.Cutoff_Rank || 0,
            cutoff_percentile: row.cutoff_percentile || row.Cutoff_Percentile || 0,
            seats: row.seats || row.Seats || 0,
            fees: row.fees || row.Fees || 0,
            admission_chance: 0,
            admission_chance_percentage: "0%",
            match_score: 0,
            probability_level: "Unknown",
            is_most_probable: false,
        });
    });

    const finalColleges = Array.from(collegeMap.values());
    console.log(`Successfully parsed ${finalColleges.length} colleges.`);
    
    // Save to local cache if results were found — don't cache empty results
    if (finalColleges.length > 0) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(finalColleges));
            localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
            console.log("College data cached successfully");
        } catch (e) {
            console.warn("Storage limit exceeded, not caching all colleges", e);
        }
    } else {
        console.warn("No colleges found in database, not caching.");
    }

    return finalColleges;
};

export function useCollegeData() {
    // 1. Fetch user profile
    const { data: userProfile, isLoading: profileLoading } = useQuery({
        queryKey: ["userProfile"],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return null;
            const { data, error } = await supabase.from("users").select("*").eq("id", session.user.id).maybeSingle();
            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    // 2. Fetch all colleges
    const { data: allColleges = [], isLoading: collegesLoading } = useQuery({
        queryKey: ["allColleges"],
        queryFn: fetchAllColleges,
        staleTime: 1000 * 60 * 30, // 30 mins
    });

    // 3. AI Prediction Query
    const rank = userProfile?.diploma_rank || userProfile?.cet_rank;
    const score = userProfile?.diploma_score || userProfile?.cet_score;
    const branches = userProfile?.preferred_branches || [];
    const category = userProfile?.category || "OPEN";

    const { data: predictedColleges = [], isLoading: aiLoading } = useQuery({
        queryKey: ["predictions", rank, score, branches, category],
        queryFn: async () => {
            if (!rank || !score || branches.length === 0) return [];
            const res = await axios.post(`${ML_API_URL}/predict_admission`, {
                score: parseFloat(score),
                rank: parseInt(rank),
                category,
                branches,
            });
            const raw: RawCollege[] = res.data.colleges || [];
            return groupCollegesByCode(raw);
        },
        enabled: !!(rank && score && branches.length && ML_API_URL),
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    // Merge predicted into all colleges for the consumer
    const mergedColleges = (() => {
        if (predictedColleges.length === 0) return allColleges;
        const allMap = new Map(allColleges.map((c) => [c.college_code, c]));
        predictedColleges.forEach((p) => {
            if (allMap.has(p.college_code)) {
                allMap.set(p.college_code, { ...allMap.get(p.college_code)!, ...p, is_predicted: true });
            } else {
                allMap.set(p.college_code, p);
            }
        });
        return Array.from(allMap.values());
    })();

    return {
        colleges: predictedColleges,
        allColleges: mergedColleges,
        userRank: rank ? Number(rank) : null,
        userCategory: category,
        userProfile,
        loading: profileLoading || collegesLoading,
        aiLoading
    };
}
