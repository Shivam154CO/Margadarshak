import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

// High-fidelity DTE Maharashtra Portal Recreation
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Exhaustive DSE Engineering Branch List (Maharashtra CAP Round)
const HARDCODED_BRANCHES = [
    "Aeronautical Engineering",
    "Agricultural Engineering",
    "Artificial Intelligence (AI) and Machine Learning",
    "Artificial Intelligence and Data Science",
    "Automation and Robotics",
    "Automobile Engineering",
    "Bio Medical Engineering",
    "Bio Technology",
    "Ceramic Technology",
    "Chemical Engineering",
    "Civil Engineering",
    "Civil Engineering (Environmental Engineering)",
    "Computer Engineering",
    "Computer Science and Business Systems",
    "Computer Science and Design",
    "Computer Science and Engineering",
    "Computer Science and Engineering (Artificial Intelligence and Machine Learning)",
    "Computer Science and Engineering (Cyber Security)",
    "Computer Science and Engineering (Data Science)",
    "Computer Science and Engineering (IoT)",
    "Computer Technology",
    "Cyber Security",
    "Data Science",
    "Dyestuff Technology",
    "Electrical Engg [Electronics and Power]",
    "Electrical Engineering",
    "Electronics and Communication Technology",
    "Electronics and Computer Engineering",
    "Electronics and Telecommunication Engg",
    "Electronics Engineering",
    "Fashion Technology",
    "Fibres and Textile Processing Technology",
    "Food Technology",
    "Information Technology",
    "Instrumentation and Control Engineering",
    "Instrumentation Engineering",
    "Leather Technology",
    "Machine Learning and Artificial Intelligence",
    "Man Made Textile Technology",
    "Marine Engineering",
    "Mechanical Engineering",
    "Mechanical Engineering (Sandwich Design)",
    "Mechatronics Engineering",
    "Metallurgy Engineering",
    "Mining Engineering",
    "Oil and Paint Technology",
    "Paper and Pulp Technology",
    "Petro Chemical Engineering",
    "Pharmaceutical and Fine Chemicals Technology",
    "Plastic and Polymer Engineering",
    "Printing Technology",
    "Production Engineering",
    "Production Engineering (Sandwich)",
    "Robotics and Automation",
    "Surface Coating Technology",
    "Textile Chemistry",
    "Textile Plant Engineering",
    "Textile Technology"
].sort();

export default function DseOptionForm() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState<any>(null);

    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [shortlistedKeys, setShortlistedKeys] = useState<string[]>([]);
    const [rankedChoices, setRankedChoices] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [filters, setFilters] = useState({
        types: [] as string[],
        autonomy: "" as string,
        minority: "" as string,
        districts: [] as string[],
        selectedBranches: [] as string[],
        search: ""
    });

    const [availableBranches, setAvailableBranches] = useState<string[]>(HARDCODED_BRANCHES);

    const regions = {
        "Amravati": ["Akola", "Amravati", "Buldhana", "Washim", "Yavatmal"],
        "Chhatrapati Sambhajinagar": ["Beed", "Chhatrapati Sambhajinagar", "Dharashiv", "Hingoli", "Jalna", "Latur", "Nanded", "Parbhani"],
        "Mumbai": ["Mumbai City", "Mumbai Suburban", "Palghar", "Raigad", "Ratnagiri", "Sindhururg", "Thane"],
        "Nagpur": ["Bhandara", "Chandrapur", "Gadchiroli", "Gondia", "Nagpur", "Wardha"],
        "Nashik": ["Ahilyanagar", "Dhule", "Jalgaon", "Nandurbar", "Nashik"],
        "Pune": ["Kolhapur", "Pune", "Sangli", "Satara", "Solapur"]
    };

    const districtMapping: Record<string, string[]> = {
        "Ahilyanagar": ["Ahilyanagar", "Ahmednagar"],
        "Chhatrapati Sambhajinagar": ["Chhatrapati Sambhajinagar", "Aurangabad"],
        "Dharashiv": ["Dharashiv", "Osmanabad"],
        "Mumbai City": ["Mumbai City", "Mumbai"],
        "Mumbai Suburban": ["Mumbai Suburban", "Suburban"]
    };

    useEffect(() => {
        const init = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) { navigate("/login"); return; }
                const { data: profile } = await supabase.from("users").select("*").eq("id", session.user.id).single();
                setUserProfile(profile);

                // Fetch Available Branches using branch_name
                try {
                    const { data } = await supabase.from('colleges_2025').select('branch_name').limit(1500);
                    if (data && data.length > 0) {
                        const dbUnique = Array.from(new Set(data.map(b => b.branch_name).filter(Boolean))) as string[];
                        const final = Array.from(new Set([...HARDCODED_BRANCHES, ...dbUnique])).sort();
                        setAvailableBranches(final);
                    }
                } catch (e) {
                    console.log("Supabase Fetch Error (expected column mismatch), using Registry.");
                }

                setLoading(false);
            } catch (err) { console.error(err); setLoading(false); }
        };
        init();
    }, [navigate]);

    const handleSearch = async () => {
        if (filters.selectedBranches.length === 0) {
            alert("Please select at least one Course (Branch) to continue.");
            return;
        }
        setIsSearching(true);
        try {
            let query = supabase.from('colleges_2025').select('*');
            
            // 1. LOCATION FILTER (Server-side)
            const targetCities = filters.districts.flatMap(d => districtMapping[d] || [d]);
            if (targetCities.length > 0) {
                const cityMatch = targetCities.map(c => `city.ilike.%${c}%`).join(',');
                const distMatch = targetCities.map(c => `district.ilike.%${c}%`).join(',');
                const regMatch = targetCities.map(c => `region.ilike.%${c}%`).join(',');
                query = query.or(`${cityMatch},${distMatch},${regMatch}`);
            }

            // 2. BRANCH FILTER (Server-side) - This is the critical fix!
            // We explicitly tell Supabase to find rows matching ANY of our selected branches
            const branchMatches = filters.selectedBranches.map(b => `branch_name.ilike.%${b}%`).join(',');
            const branchMatchesUpper = filters.selectedBranches.map(b => `Branch_name.ilike.%${b}%`).join(',');
            const branchMatchesSimple = filters.selectedBranches.map(b => `branch.ilike.%${b}%`).join(',');
            
            // Calling .or() again on the same query object act as an AND with the previous .or() group
            query = query.or(`${branchMatches},${branchMatchesUpper},${branchMatchesSimple}`);

            // Fetch a wide batch of matching results
            const { data, error } = await query.limit(5000);
            
            if (error) throw error;

            if (data) {
                const branchArrayLower = filters.selectedBranches.map(b => b.toLowerCase().trim());
                const seenKeys = new Set();
                const uniqueResults: any[] = [];

                data.forEach(c => {
                    const bName = (c.branch_name || c.Branch_name || c.branch || "").toString().toLowerCase().trim();
                    const cCode = (c.college_code || c.College_code || "").toString();
                    const bCode = (c.branch_code || c.Branch_code || "").toString();
                    const comboKey = `${cCode}-${bCode}`;

                    // Match logic
                    const matchesBranch = branchArrayLower.length === 0 || 
                        branchArrayLower.some(sel => bName.includes(sel) || sel.includes(bName));
                    
                    const searchVal = filters.search.toLowerCase();
                    const matchesSearch = !searchVal || 
                        (c.college_name || c.College_name || "").toLowerCase().includes(searchVal) ||
                        cCode.includes(searchVal);

                    if (matchesBranch && matchesSearch && !seenKeys.has(comboKey)) {
                        seenKeys.add(comboKey);
                        uniqueResults.push(c);
                    }
                });
                setSearchResults(uniqueResults);
            }
        } catch (err) {
            console.error("Advanced fetch failed:", err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const toggleFilter = (type: 'types' | 'districts' | 'selectedBranches', value: string) => {
        setFilters(f => ({
            ...f,
            [type]: f[type].includes(value) ? f[type].filter(v => v !== value) : [...f[type], value]
        }));
    };

    const handleSelectAllAction = (checked: boolean) => {
        if (checked) {
            const allKeys = searchResults.map(r => `${r.college_code || r.College_code}-${r.branch_code || r.Branch_code}`);
            setShortlistedKeys(prev => Array.from(new Set([...prev, ...allKeys])));
        } else {
            setShortlistedKeys([]);
        }
    };

    const proceedToRanking = () => {
        const selected = searchResults.filter(r => shortlistedKeys.includes(`${r.college_code || r.College_code}-${r.branch_code || r.Branch_code}`));
        const ranked = selected.map(s => ({
            college_code: s.college_code || s.College_code,
            branch_code: s.branch_code || s.Branch_code,
            branch: s.branch_name || s.Branch_name || 'N/A',
            college_name: s.college_name || s.College_name,
            city: s.city || s.City,
            autonomy_status: s.autonomy_status || s.Autonomy_status
        }));
        setRankedChoices(prev => [...prev, ...ranked]);
        setCurrentStep(2);
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFont("times", "bold");
        doc.text("GOVERNMENT OF MAHARASHTRA", 105, 15, { align: 'center' });
        doc.text("STATE COMMON ENTRANCE TEST CELL", 105, 23, { align: 'center' });
        doc.text("PRINT OF OPTION FORM (DSE 2025-26)", 105, 31, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Application ID: ${userProfile?.application_id || 'DSE25103429'} - ${userProfile?.name?.toUpperCase()}`, 20, 45);
        doc.text(`Merit Rank: ${userProfile?.merit_rank || '---'} | Category: ${userProfile?.category || 'OPEN'}`, 20, 52);

        autoTable(doc, {
            startY: 60,
            head: [['Pref', 'Choice Code', 'Course', 'Type', 'Institute Name', 'District', 'Medium']],
            body: rankedChoices.map((c, i) => [
                i + 1,
                `${c.college_code}${c.branch_code}`,
                c.branch,
                c.autonomy_status?.toUpperCase() || 'UN-AIDED',
                c.college_name,
                c.city,
                'Marathi-English'
            ]),
            theme: 'grid',
            headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], lineWidth: 0.1 },
            styles: { font: 'times', fontSize: 10, cellPadding: 3 }
        });
        doc.save("DSE_Option_Form_Receipt.pdf");
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-black overflow-x-hidden uppercase">
            <Navbar activeTab="dse-option-form" userProfile={userProfile} />

            <div className="bg-[#f0f2f5] p-6 border-b border-gray-300 no-print">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-2xl font-bold">Print of Option Form</div>
                    <div className="bg-[#eff6ff] text-[#1e40af] px-6 py-3 border border-[#bfdbfe] rounded font-bold text-base">
                        OPTION FORM FOR CAP ROUND - I
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">

                {currentStep === 1 && (
                    <div className="space-y-8">
                        <h2 className="text-xl font-bold border-b-2 border-gray-100 pb-2">Select Course, Institute Type, Universities and Districts</h2>

                        <div className="space-y-6">
                            <div className="border border-blue-200 overflow-hidden shadow-sm">
                                <div className="bg-[#4299e1] text-white p-3 text-xs font-bold uppercase tracking-wider">Select Courses (Required)</div>
                                <div className="p-5 bg-[#ebf8ff] max-h-72 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {availableBranches.map(b => (
                                        <label key={b} className="flex items-center gap-3 text-xs cursor-pointer hover:bg-white p-2 rounded transition-colors group">
                                            <input type="checkbox" className="w-4 h-4 cursor-pointer" checked={filters.selectedBranches.includes(b)} onChange={() => toggleFilter('selectedBranches', b)} />
                                            <span className="group-hover:text-blue-700 font-medium">{b}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-stretch overflow-hidden border border-[#badbcc]">
                                <div className="bg-[#48bb78] text-white p-4 text-xs w-full md:w-56 font-bold uppercase shrink-0 flex items-center">Select Institute Types</div>
                                <div className="flex-1 flex flex-wrap gap-6 p-4 bg-[#d1e7dd] text-xs items-center">
                                    {["Government", "Government-Aided", "Un-Aided", "University Department"].map(t => (
                                        <label key={t} className="flex items-center gap-2 cursor-pointer font-medium hover:text-green-800">
                                            <input type="checkbox" className="w-4 h-4" checked={filters.types.includes(t)} onChange={() => toggleFilter('types', t)} /> {t}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="border border-[#feebc8] overflow-hidden shadow-sm">
                                <div className="bg-[#ecc94b] text-white p-3 text-xs font-bold flex justify-between items-center uppercase tracking-wider">
                                    <span>Select the districts from which institutes you are looking</span>
                                    <label className="flex items-center gap-2 text-[11px] cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4" 
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    const all = Object.values(regions).flat();
                                                    setFilters(f => ({ ...f, districts: all }));
                                                } else {
                                                    setFilters(f => ({ ...f, districts: [] }));
                                                }
                                            }} 
                                        /> Select All
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 bg-[#fffaf0] divide-x divide-[#feebc8]">
                                    {Object.entries(regions).map(([region, cities]) => (
                                        <div key={region} className="flex flex-col text-[11px]">
                                            <div className="bg-[#feebc8] p-2 font-bold border-b border-[#feebc8] text-center uppercase tracking-tighter">{region}</div>
                                            <div className="flex flex-col p-2 gap-2">
                                                {cities.map(c => <label key={c} className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"><input type="checkbox" className="w-3 h-3" checked={filters.districts.includes(c)} onChange={() => toggleFilter('districts', c)} /> {c}</label>)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 pt-4">
                            <input type="text" className="flex-1 border-2 border-gray-300 p-4 text-sm font-bold uppercase focus:border-blue-500 outline-none placeholder:font-normal" placeholder="Search by Institute Code or Keywords..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
                            <button onClick={handleSearch} className="bg-[#2d3748] text-white px-12 py-4 text-sm font-bold tracking-widest hover:bg-black transition-all shadow-md active:scale-95">
                                {isSearching ? "Processing..." : "Fetch Available Institutes"}
                            </button>
                        </div>

                        <div className="mt-8 border-2 border-gray-200 rounded-lg overflow-hidden shadow-lg">
                            <div className="bg-gray-100 p-4 text-sm font-bold border-b-2 border-gray-200 flex justify-between items-center">
                                <span>Search Findings ({searchResults.length} Institutes Found)</span>
                                <label className="flex items-center gap-2 text-xs cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4" onChange={(e) => handleSelectAllAction(e.target.checked)} /> Select All Results
                                </label>
                            </div>
                            <div className="overflow-x-auto min-h-[400px]">
                                <table className="w-full text-xs border-collapse">
                                    <thead className="bg-[#2d3748] text-white text-left uppercase">
                                        <tr>
                                            <th className="p-4 border-r border-gray-500 w-16 text-center">Sr.</th>
                                            <th className="p-4 border-r border-gray-500 w-16 text-center">Sel</th>
                                            <th className="p-4 border-r border-gray-500 w-32">Choice Code</th>
                                            <th className="p-4 border-r border-gray-500">Course Name</th>
                                            <th className="p-4 border-r border-gray-500 w-32">Status</th>
                                            <th className="p-4 border-r border-gray-500">Institute Name</th>
                                            <th className="p-4">District</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {searchResults.map((res, i) => (
                                            <tr key={`${res.college_code || res.College_code}-${res.branch_code || res.Branch_code}`} className="hover:bg-blue-50 transition-colors">
                                                <td className="p-4 border-r border-gray-200 text-center font-medium bg-gray-50">{i + 1}</td>
                                                <td className="p-4 border-r border-gray-200 text-center"><input type="checkbox" className="w-5 h-5 cursor-pointer" checked={shortlistedKeys.includes(`${res.college_code || res.College_code}-${res.branch_code || res.Branch_code}`)} onChange={() => { const k = `${res.college_code || res.College_code}-${res.branch_code || res.Branch_code}`; setShortlistedKeys(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]); }} /></td>
                                                <td className="p-4 border-r border-gray-200 font-bold text-gray-700 tracking-wider font-mono bg-blue-50/30">{res.college_code || res.College_code}{res.branch_code || res.Branch_code}</td>
                                                <td className="p-4 border-r border-gray-200 font-bold text-blue-900 border-l-4 border-l-blue-500">{res.branch_name || res.Branch_name}</td>
                                                <td className="p-4 border-r border-gray-200 font-semibold">{res.autonomy_status || res.Autonomy_status || 'Un-Aided'}</td>
                                                <td className="p-4 border-r border-gray-200 font-bold text-gray-800 tracking-tight leading-snug">{res.college_name || res.College_name}</td>
                                                <td className="p-4 font-medium uppercase tracking-tighter text-gray-500">{res.city || res.City}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end gap-6 pb-12">
                            <button className="border-2 border-gray-300 text-gray-600 px-10 py-3 text-sm font-bold uppercase hover:bg-gray-50 transition-colors" onClick={() => navigate(-1)}>Back</button>
                            <button className="bg-[#f56565] text-white px-16 py-3 text-sm font-bold uppercase shadow-xl hover:bg-red-700 transition-colors transform hover:-translate-y-1" onClick={proceedToRanking}>Save and Proceed</button>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-8">
                        <div className="bg-[#fff3cd] border-l-4 border-[#856404] p-5 text-[#856404] text-xs leading-relaxed shadow-sm">
                            <h4 className="font-bold border-b border-[#ffeeba] pb-2 mb-3 text-sm uppercase">Instructions :</h4>
                            <ul className="list-inside space-y-2 uppercase font-medium">
                                <li>· Click on institute and use up arrow button to move preference upside.</li>
                                <li>· Click on institute and use down arrow button to move preference downside.</li>
                            </ul>
                        </div>

                        <div className="border-2 border-[#6b8e23] rounded-lg overflow-hidden shadow-xl">
                            <div className="bg-[#6b8e23] text-white p-3 text-center text-sm font-bold uppercase">Selected Options in Order</div>
                            <div className="flex">
                                <div className="flex-1 overflow-x-auto">
                                    <table className="w-full text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100 border-b-2 border-gray-200 text-gray-600 font-bold uppercase text-left">
                                                <th className="p-4 border-r border-gray-200 w-24">Pref No.</th>
                                                <th className="p-4">Institute & Course Detail</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 uppercase">
                                            {rankedChoices.map((rc, idx) => (
                                                <tr key={`${rc.college_code}-${rc.branch_code}`} className="hover:bg-gray-50">
                                                    <td className="p-4 border-r border-gray-300 font-bold text-lg text-center bg-[#f0f9ff] text-blue-800">{idx + 1}</td>
                                                    <td className="p-4 font-bold text-gray-700 leading-relaxed py-5">
                                                        <span className="text-sm border-b-2 border-gray-300 pb-1">{rc.college_code}{rc.branch_code}</span><br />
                                                        <span className="text-blue-900 mt-2 block">{rc.branch}</span>
                                                        <span className="text-gray-500 font-normal mt-1 block">{rc.college_name}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="w-20 bg-gray-50 border-l-2 border-[#6b8e23] flex flex-col items-center py-10 gap-8">
                                    <button className="p-2 hover:scale-125 transition-transform bg-white border border-gray-300 rounded shadow-sm hover:shadow-md" onClick={() => { }}><div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[20px] border-b-[#48bb78]" /></button>
                                    <button className="p-2 hover:scale-125 transition-transform bg-white border border-gray-300 rounded shadow-sm hover:shadow-md" onClick={() => { }}><div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-[#48bb78]" /></button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center py-12">
                            <button className="bg-[#f56565] text-white px-20 py-4 text-sm font-bold uppercase shadow-2xl hover:bg-red-700 transition-all" onClick={() => setCurrentStep(3)}>Save and Proceed</button>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="max-w-6xl mx-auto space-y-8">
                        <div className="bg-[#d1e7dd] border-l-8 border-[#0f5132] p-6 text-center shadow-lg">
                            <div className="text-sm font-bold text-[#0f5132] uppercase tracking-[0.2em] mb-2">{userProfile?.application_id || 'DSE25103429'} - {userProfile?.name?.toUpperCase() || 'CANDIDATE NAME'}</div>
                            <div className="text-lg font-black text-[#0f5132] uppercase tracking-wider">Option Form for CAP Round - I has been confirmed on {new Date().toLocaleString()} with Version 1.</div>
                        </div>

                        <div className="border-2 border-gray-300 rounded shadow-xl overflow-hidden">
                            <table className="w-full text-xs border-collapse font-bold uppercase text-center">
                                <thead className="bg-[#2d3748] text-white border-b-2 border-gray-400">
                                    <tr>
                                        <th className="p-4 border-r border-gray-500 w-16">Pref</th>
                                        <th className="p-4 border-r border-gray-500 w-32">Choice Code</th>
                                        <th className="p-4 border-r border-gray-500">Course</th>
                                        <th className="p-4 border-r border-gray-500 w-24">Type</th>
                                        <th className="p-2 border-r border-gray-500">Institute Name</th>
                                        <th className="p-4 border-r border-gray-500 w-24">District</th>
                                        <th className="p-2 border-r border-gray-300 text-[10px]">Medium</th>
                                        <th className="p-4 text-[10px]">Quota</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-300">
                                    {rankedChoices.map((rc, i) => (
                                        <tr key={`${rc.college_code}-${rc.branch_code}`} className="hover:bg-gray-50 font-bold">
                                            <td className="p-4 border-r border-gray-200 text-lg font-black bg-gray-50">{i + 1}</td>
                                            <td className="p-4 border-r border-gray-200 tracking-wider text-sm">{rc.college_code}{rc.branch_code}</td>
                                            <td className="p-4 border-r border-gray-200 text-blue-900">{rc.branch}</td>
                                            <td className="p-4 border-r border-gray-200 text-[10px] uppercase">{rc.autonomy_status || 'UN-AIDED'}</td>
                                            <td className="p-4 border-r border-gray-200 text-left text-xs leading-normal">{rc.college_name}</td>
                                            <td className="p-4 border-r border-gray-200">{rc.city}</td>
                                            <td className="p-4 border-r border-gray-200 text-[9px]">Marathi-English</td>
                                            <td className="p-4 font-black">OHD</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="border-[4px] border-[#f56565] p-12 flex flex-col items-center gap-8 no-print bg-[#fff5f5] shadow-2xl rounded-2xl border-dashed">
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <span className="font-black text-xl text-[#c53030] uppercase">Confirm with Password</span>
                                <input type="password" placeholder="********" className="border-4 border-red-100 p-4 text-lg w-80 focus:border-red-500 outline-none shadow-inner rounded-lg text-center font-bold tracking-[0.5em]" />
                            </div>
                            <button className="bg-[#f56565] text-white px-24 py-5 font-black uppercase text-xl shadow-xl hover:bg-black transition-all" onClick={generatePDF}>Confirm</button>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
