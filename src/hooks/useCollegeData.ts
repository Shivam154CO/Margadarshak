import { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { supabase } from "../lib/supabase";
import type { College, RawCollege } from "../types/college";

export function useCollegeData() {
    const [predictedColleges, setPredictedColleges] = useState<College[]>([]);
    const [allColleges, setAllColleges] = useState<College[]>([]);
    const [userRank, setUserRank] = useState<number | null>(null);
    const [userCategory, setUserCategory] = useState("");
    const [userProfile, setUserProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);

    // ... helper functions ... (skipping for match)
    const getStateFromCity = (city: string): string => {
        const cityStateMap: Record<string, string> = {
            "Mumbai": "Maharashtra",
            "Pune": "Maharashtra",
            "Nagpur": "Maharashtra",
            "Delhi": "Delhi",
            "Bangalore": "Karnataka",
            "Chennai": "Tamil Nadu",
            "Hyderabad": "Telangana",
            "Kolkata": "West Bengal",
            "Ahmedabad": "Gujarat",
            "Jaipur": "Rajasthan",
            "Lucknow": "Uttar Pradesh",
            "Bhopal": "Madhya Pradesh",
            "Chandigarh": "Chandigarh",
            "Thiruvananthapuram": "Kerala",
            "Bhubaneswar": "Odisha",
            "Guwahati": "Assam",
            "Patna": "Bihar",
        };
        return cityStateMap[city] || "Maharashtra";
    };

    // ... helper function ... 
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
                    established_year: 1960 + Math.floor(Math.random() * 60),
                    naac_grade: ["A++", "A+", "A", "B++"][Math.floor(Math.random() * 4)],
                    website: `https://www.${rawCollege.college_name.toLowerCase().replace(/ /g, '')}.edu.in`,
                    contact_email: `admissions@${rawCollege.college_name.toLowerCase().replace(/ /g, '')}.edu.in`,
                    phone: `+91-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                    address: `${rawCollege.college_name}, ${rawCollege.city}, ${getStateFromCity(rawCollege.city)} - ${Math.floor(100000 + Math.random() * 900000)}`
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

    const fetchAllCollegesFromSupabase = async (): Promise<College[]> => {
        try {
            let { data: dbColleges, error } = await supabase
                .from('collegess_2025')
                .select('*')
                .limit(50000);

            if (!dbColleges || dbColleges.length === 0) {
                const fallback = await supabase
                    .from('collegess_2025')
                    .select('*')
                    .limit(50000);
                if (fallback.data && fallback.data.length > 0) {
                    dbColleges = fallback.data;
                    error = fallback.error;
                }
            }

            if (error || !dbColleges) return [];

            const collegeMap = new Map<string, College>();

            dbColleges.forEach((college: any) => {
                const collegeCode = (college.college_code || college.College_code || college.id || "UNKNOWN").toString();
                const collegeName = college.college_name || college.College_name || "Unknown College";
                const city = college.city || college.City || "Unknown";

                if (!collegeCode || collegeCode === "UNKNOWN") return;

                if (!collegeMap.has(collegeCode)) {
                    collegeMap.set(collegeCode, {
                        college_code: collegeCode,
                        college_name: collegeName,
                        city: city,
                        image: college.image_url || college.Image_url || "",
                        autonomy_status: college.autonomy_status || college.Autonomy_status || "Government",
                        hostel_available: college.hostel_available || college.Hostel_available || "No",
                        placement_rate: parseFloat(college.placement_rate || college.Placement_rate || 0),
                        average_package_lpa: parseFloat(college.average_package_lpa || college.Average_package_lpa || 0),
                        highest_package_lpa: parseFloat(college.highest_package_lpa || college.Highest_package_lpa || 0),
                        branches: [],
                        is_predicted: false,
                        region: getStateFromCity(city),
                        established_year: college.established_year || college.Established_year || 0,
                        naac_grade: college.naac_grade || college.NAAC_grade || "N/A",
                        website: college.website_url || college.Website_url || "",
                        contact_email: college.contact_email || college.Contact_email || "",
                        phone: college.contact_phone || college.Contact_phone || "",
                        address: `${collegeName}, ${city}`
                    } as College);
                }

                const existingCollege = collegeMap.get(collegeCode)!;
                const branchCode = (college.branch_code || college.Branch_code || "N/A").toString();

                if (!existingCollege.branches?.find(b => b.branch_code === branchCode)) {
                    existingCollege.branches?.push({
                        branch_name: college.branch_name || college.Branch_name || "N/A",
                        branch_code: branchCode,
                        cutoff_rank: college.cutoff_rank || college.Cutoff_rank || 0,
                        cutoff_percentile: college.cutoff_percentile || college.Cutoff_percentile || 0,
                        seats: college.seats || college.Seats || 0,
                        fees: college.fees || college.Fees || 0,
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
                const allCollegesFromDB = await fetchAllCollegesFromSupabase();
                setAllColleges(allCollegesFromDB);

                const unsub = onAuthStateChanged(auth, async (user) => {
                    if (!user) {
                        setLoading(false);
                        setAiLoading(false);
                        return;
                    }

                    const snap = await getDoc(doc(db, "users", user.uid));
                    const prof = snap.exists() ? (snap.data() as any) : {};
                    const rank = prof.rank || prof.cetRank || prof.diplomaRank || null;
                    const score = prof.cetScore || prof.diplomaScore || null;
                    const category = prof.category || "OPEN";
                    const branches = prof.preferredBranches || [];

                    setUserRank(rank);
                    setUserCategory(category);
                    setUserProfile(prof);

                    if (rank && score && branches.length) {
                        try {
                            setAiLoading(true);
                            const res = await axios.post("http://127.0.0.1:5001/predict_admission", {
                                score: parseFloat(score),
                                rank: parseInt(rank),
                                category,
                                branches,
                            });

                            const raw: RawCollege[] = res.data.colleges || [];
                            const predicted = deduplicateColleges(groupCollegesByCode(raw));

                            setPredictedColleges(predicted);

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
                            console.error("❌ Prediction API failed", err);
                        } finally {
                            setAiLoading(false);
                        }
                    }
                    setLoading(false);
                });

                return unsub;
            } catch (err) {
                console.error("❌ Data load failed", err);
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
