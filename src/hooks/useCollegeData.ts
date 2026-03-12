import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../lib/supabase";
import type { College, RawCollege } from "../types/college";

const ML_API_URL = import.meta.env.VITE_ML_API_URL ?? "http://127.0.0.1:5001";

export function useCollegeData() {
    const [predictedColleges, setPredictedColleges] = useState<College[]>([]);
    const [allColleges, setAllColleges] = useState<College[]>([]);
    const [userRank, setUserRank] = useState<number | null>(null);
    const [userCategory, setUserCategory] = useState("");
    const [userProfile, setUserProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);

    // Maps a city string to a state name
    const getStateFromCity = (city: string): string => {
        const cityStateMap: Record<string, string> = {
            "Mumbai": "Maharashtra", "Pune": "Maharashtra", "Nagpur": "Maharashtra",
            "Nashik": "Maharashtra", "Aurangabad": "Maharashtra", "Thane": "Maharashtra",
            "Delhi": "Delhi", "Bangalore": "Karnataka", "Chennai": "Tamil Nadu",
            "Hyderabad": "Telangana", "Kolkata": "West Bengal", "Ahmedabad": "Gujarat",
            "Jaipur": "Rajasthan", "Lucknow": "Uttar Pradesh", "Bhopal": "Madhya Pradesh",
            "Chandigarh": "Chandigarh", "Thiruvananthapuram": "Kerala",
            "Bhubaneswar": "Odisha", "Guwahati": "Assam", "Patna": "Bihar",
        };
        return cityStateMap[city] || "Maharashtra";
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
                    region: getStateFromCity(rawCollege.city),
                    // Real data only — no random generation
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

    // Fetches all colleges from Supabase (paginated to avoid 50k row blowup)
    const fetchAllCollegesFromSupabase = async (): Promise<College[]> => {
        try {
            const PAGE_SIZE = 1000;
            let allRows: any[] = [];
            let from = 0;
            let hasMore = true;

            while (hasMore) {
                const { data: batch, error } = await supabase
                    .from('colleges_2025')
                    .select('college_code, college_name, city, autonomy_status, hostel_available, placement_rate, average_package_lpa, highest_package_lpa, branch_name, branch_code, cutoff_rank, cutoff_percentile, seats, fees, established_year, naac_grade, website_url, contact_email, contact_phone')
                    .range(from, from + PAGE_SIZE - 1);

                if (error) {
                    console.error("Supabase fetch error:", error);
                    break;
                }

                if (!batch || batch.length === 0) {
                    hasMore = false;
                } else {
                    allRows = [...allRows, ...batch];
                    from += PAGE_SIZE;
                    if (batch.length < PAGE_SIZE) hasMore = false;
                }
            }

            const collegeMap = new Map<string, College>();

            allRows.forEach((college: any) => {
                const collegeCode = (college.college_code || college.id || "UNKNOWN").toString();
                const collegeName = college.college_name || "Unknown College";
                const city = college.city || "Unknown";

                if (!collegeCode || collegeCode === "UNKNOWN") return;

                if (!collegeMap.has(collegeCode)) {
                    collegeMap.set(collegeCode, {
                        college_code: collegeCode,
                        college_name: collegeName,
                        city: city,
                        image: college.image_url || "",
                        autonomy_status: college.autonomy_status || "Government",
                        hostel_available: college.hostel_available || "No",
                        placement_rate: parseFloat(college.placement_rate || 0),
                        average_package_lpa: parseFloat(college.average_package_lpa || 0),
                        highest_package_lpa: parseFloat(college.highest_package_lpa || 0),
                        branches: [],
                        is_predicted: false,
                        region: getStateFromCity(city),
                        established_year: college.established_year || undefined,
                        naac_grade: college.naac_grade || undefined,
                        website: college.website_url || undefined,
                        contact_email: college.contact_email || undefined,
                        phone: college.contact_phone || undefined,
                        address: `${collegeName}, ${city}`
                    } as College);
                }

                const existingCollege = collegeMap.get(collegeCode)!;
                const branchCode = (college.branch_code || "N/A").toString();

                if (!existingCollege.branches?.find(b => b.branch_code === branchCode)) {
                    existingCollege.branches?.push({
                        branch_name: college.branch_name || "N/A",
                        branch_code: branchCode,
                        cutoff_rank: college.cutoff_rank || 0,
                        cutoff_percentile: college.cutoff_percentile || 0,
                        seats: college.seats || 0,
                        fees: college.fees || 0,
                        admission_chance: 0,
                        admission_chance_percentage: "0%",
                        match_score: 0,
                        probability_level: "Unknown",
                        is_most_probable: false,
                    });
                }
            });

            return Array.from(collegeMap.values());
        } catch (err) {
            console.error("Failed to fetch colleges from Supabase:", err);
            return [];
        }
    };

    const deduplicateColleges = (colleges: College[]): College[] => {
        const seenCodes = new Set<string>();
        const uniqueColleges: College[] = [];
        for (const college of colleges) {
            if (college.college_code && !seenCodes.has(college.college_code)) {
                seenCodes.add(college.college_code);
                uniqueColleges.push(college);
            }
        }
        return uniqueColleges;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // 1. Fetch all colleges from Supabase
                const allCollegesFromDB = await fetchAllCollegesFromSupabase();
                setAllColleges(allCollegesFromDB);

                // 2. Get current Supabase session (replaces Firebase auth)
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    setLoading(false);
                    setAiLoading(false);
                    return;
                }

                // 3. Fetch user profile from Supabase users table
                const { data: prof, error: profError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (profError) {
                    console.error("Profile fetch error:", profError);
                    setLoading(false);
                    return;
                }

                if (!prof) {
                    setLoading(false);
                    return;
                }

                const rank = prof.diploma_rank || prof.cet_rank || null;
                const score = prof.diploma_score || prof.cet_score || null;
                const category = prof.category || "OPEN";
                const branches = prof.preferred_branches || [];

                setUserRank(rank ? Number(rank) : null);
                setUserCategory(category);
                setUserProfile(prof);

                // 4. Call ML API if user has rank + score + branches
                if (rank && score && branches.length) {
                    try {
                        setAiLoading(true);
                        const res = await axios.post(`${ML_API_URL}/predict_admission`, {
                            score: parseFloat(score),
                            rank: parseInt(rank),
                            category,
                            branches,
                        });

                        const raw: RawCollege[] = res.data.colleges || [];
                        const predicted = deduplicateColleges(groupCollegesByCode(raw));

                        setPredictedColleges(predicted);

                        // Merge predicted into all colleges map
                        const allCollegesMap = new Map<string, College>();
                        allCollegesFromDB.forEach(c => allCollegesMap.set(c.college_code, c));

                        predicted.forEach(p => {
                            if (allCollegesMap.has(p.college_code)) {
                                const existing = allCollegesMap.get(p.college_code)!;
                                allCollegesMap.set(p.college_code, {
                                    ...existing,
                                    ...p,
                                    is_predicted: true
                                });
                            } else {
                                allCollegesMap.set(p.college_code, p);
                            }
                        });

                        setAllColleges(Array.from(allCollegesMap.values()));
                    } catch (err) {
                        console.error("❌ Prediction API failed:", err);
                    } finally {
                        setAiLoading(false);
                    }
                }

                setLoading(false);

                // 5. Listen for auth state changes (e.g., logout)
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
                    if (event === 'SIGNED_OUT') {
                        setPredictedColleges([]);
                        setUserRank(null);
                        setUserCategory("");
                        setUserProfile(null);
                    }
                });

                return () => subscription.unsubscribe();

            } catch (err) {
                console.error("❌ Data load failed:", err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return {
        predictedColleges,
        allColleges,
        userRank,
        userCategory,
        userProfile,
        loading,
        aiLoading
    };
}
