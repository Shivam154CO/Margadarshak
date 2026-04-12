import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
} from "chart.js";
import {
  ArrowLeft,
  Search,
  Plus,
  X,
  Download,
  Share2,
  GitCompare,
  Check,
  CheckCheck,
  Settings2,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Import extracted modular components
import { CollegeImage } from "./components/CollegeImage";
import { ComparisonCharts } from "./components/ComparisonCharts";
import { ComparisonTable } from "./components/ComparisonTable";
import type { College } from "./types/comparison";
import { COMPARISON_METRICS } from "./types/comparison";

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title
);

// Smart scoring algorithm with weighted criteria
const calculateSmartScore = (college: College, weights: Record<string, number> = {}): {
  total: number;
  breakdown: Record<string, number>;
} => {
  const defaultWeights = {
    placement_rate: 0.30,
    average_package_lpa: 0.25,
    highest_package_lpa: 0.10,
    fees: 0.15,
    cutoff_percentile: 0.10,
    total_intake: 0.05,
    rating: 0.05,
  };

  const finalWeights = { ...defaultWeights, ...weights };
  let totalScore = 0;
  const breakdown: Record<string, number> = {};

  COMPARISON_METRICS.forEach((metric) => {
    const value = Number(college[metric.key]) || 0;
    let normalizedScore = 0;

    if (value > 0) {
      if (metric.key === "fees") {
        normalizedScore = Math.max(0, 100 - (value / 100000));
      } else {
        normalizedScore = Math.min(100, value);
      }
    }

    const weightedScore = normalizedScore * (finalWeights[metric.key as keyof typeof finalWeights] || 0);
    breakdown[metric.key] = weightedScore;
    totalScore += weightedScore;
  });

  return {
    total: Math.round(totalScore),
    breakdown
  };
};

function CollegeComparison() {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"browse" | "compare">("browse");
  const [selectedColleges, setSelectedColleges] = useState<College[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [branches, setBranches] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [comparisonView, setComparisonView] = useState<"table" | "radar" | "bar">("table");
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Dynamic User-Controlled Algorithm Weights
  const [smartWeights, setSmartWeights] = useState({
    placement_rate: 0.30,
    average_package_lpa: 0.25,
    highest_package_lpa: 0.10,
    fees: 0.15,
    cutoff_percentile: 0.10,
    total_intake: 0.05,
    rating: 0.05,
  });
  const [showWeightSettings, setShowWeightSettings] = useState(false);

  // Fetch colleges data
  useEffect(() => {
    fetchColleges();
  }, []);

  // Extract unique branches and cities
  useEffect(() => {
    if (colleges.length > 0) {
      const uniqueBranches = Array.from(new Set(colleges.map(c => c.branch_name).filter(Boolean)));
      const uniqueCities = Array.from(new Set(colleges.map(c => c.city).filter(Boolean)));
      setBranches(uniqueBranches.sort());
      setCities(uniqueCities.sort());
    }
  }, [colleges]);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      let allData: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        let { data, error } = await supabase
          .from('colleges_2025')
          .select('*')
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;
        
        if (data && data.length > 0) {
          allData = [...allData, ...data];
          if (data.length < pageSize) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }

      const uniqueMap = new Map<string, College>();
      (allData).forEach((row: any) => {
        const code = (row.college_code || row.College_code || "").toString().trim();
        const name = (row.college_name || row.College_name || "Unknown").toString().trim();
        const branch = (row.branch_name || row.Branch_name || "Generic").toString().trim();
        
        // Use college_code + name as unique key to ensure each college appears only once
        const collegeKey = `${code}|${name}`; 

        if (!code || code === "") return;

        if (!uniqueMap.has(collegeKey)) {
          uniqueMap.set(collegeKey, {
            college_code: code,
            college_name: name,
            city: row.city || row.City || "Unknown",
            branch: branch,
            branch_name: branch,
            branch_code: row.branch_code || row.Branch_code || "",
            fees: parseFloat(row.fees || row.Fees || 0),
            placement_rate: parseFloat(row.placement_rate || row.Placement_rate || 0),
            cutoff_rank: row.cutoff_rank || row.Cutoff_rank || 0,
            cutoff_percentile: parseFloat(row.cutoff_percentile || row.Cutoff_percentile || 0),
            category: row.category || row.Category || "",
            average_package_lpa: parseFloat(row.average_package_lpa || row.Average_package_lpa || 0),
            highest_package_lpa: parseFloat(row.highest_package_lpa || row.Highest_package_lpa || 0),
            total_intake: row.total_intake || row.Total_intake || 0,
            seats: row.seats || row.Seats || 0,
            autonomy_status: row.autonomy_status || row.Autonomy_status || "Government",
            hostel_available: row.hostel_available || row.Hostel_available || "No",
            image: row.image_url || row.Image_url || "",
            logo_url: row.logo_url || row.Logo_url || "",
            contact_email: row.contact_email || row.Contact_email || "",
            contact_phone: row.contact_phone || row.Contact_phone || "",
            website_url: row.website_url || row.Website_url || "",
            accreditation: row.accreditation || row.Accreditation || "",
            rating: parseFloat(row.rating || row.Rating || 0),
            nirf_ranking: row.nirf_ranking || row.NIRF_ranking || 0,
            status: row.status || row.Status || row.institution_type || "Unaided",
            naac_grade: row.naac_grade || row.Naac_grade || row.NAAC_Grade || "N/A",
            campus_area: parseFloat(row.campus_area || row.Campus_area || 0),
            library_books: parseInt(row.library_books || row.Library_books || 0),
            sports_facilities: row.sports_facilities || row.Sports_facilities || "Available",
            internship_rate: parseFloat(row.internship_rate || row.Internship_rate || 0),
            university: row.university || row.University || "State University",
          } as College);
        }
      });

      setColleges(Array.from(uniqueMap.values()));
    } catch (error) {
      console.error('Error fetching colleges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredColleges = useMemo(() => {
    return colleges.filter(college => {
      const matchesSearch = searchTerm === '' ||
        college.college_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.city.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBranch = !selectedBranch || college.branch_name === selectedBranch;
      const matchesCity = !selectedCity || college.city === selectedCity;

      return matchesSearch && matchesBranch && matchesCity;
    });
  }, [colleges, searchTerm, selectedBranch, selectedCity]);

  const addToComparison = (college: College) => {
    if (selectedColleges.length >= 4) return;
    if (!selectedColleges.find(c => c.college_code === college.college_code)) {
      setSelectedColleges([...selectedColleges, college]);
    }
  };

  const removeFromComparison = (collegeCode: string) => {
    setSelectedColleges(selectedColleges.filter(c => c.college_code !== collegeCode));
  };

  const clearComparison = () => setSelectedColleges([]);

  const exportToPDF = () => {
    setExporting(true);
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('College Comparison Report', 14, 22);
    
    autoTable(doc, {
      head: [['College', 'City', 'Branch', 'Fees', 'Placement', 'Avg Package']] as any,
      body: selectedColleges.map(c => [c.college_name, c.city, c.branch_name, `₹${c.fees.toLocaleString()}`, `${c.placement_rate}%`, `${c.average_package_lpa} LPA`]),
      startY: 40,
    });

    autoTable(doc, {
      head: ['Metric', ...selectedColleges.map(c => c.college_name)] as any,
      body: COMPARISON_METRICS.map(m => [m.label, ...selectedColleges.map(c => `${c[m.key] || 0}${m.unit || ''}`)]),
      startY: (doc as any).lastAutoTable.finalY + 15,
    });

    doc.save('college-comparison.pdf');
    setExporting(false);
  };

  const shareComparison = async () => {
    const collegeCodes = selectedColleges.map(c => c.college_code).join(',');
    const url = `${window.location.origin}/compare?colleges=${collegeCodes}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'College Comparison', url }); } catch (err) { }
    } else {
      await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar activeTab="compare" />

      <main className="flex-grow p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 mb-2 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-1" /> Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">College Comparison</h1>
              <p className="text-gray-500 text-sm mt-1">Make informed decisions by comparing top colleges side-by-side.</p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
               {selectedColleges.length > 0 && activeTab === 'compare' && (
                 <>
                   <button onClick={shareComparison} className="flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold transition shadow-sm hover:shadow-lg">
                     {copied ? <CheckCheck className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />} {copied ? "Copied" : "Share"}
                   </button>
                   <button onClick={exportToPDF} disabled={exporting} className="flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold transition shadow-sm hover:shadow-lg disabled:opacity-50">
                     <Download className="w-4 h-4 mr-2" /> {exporting ? "..." : "PDF"}
                   </button>
                 </>
               )}
               <button onClick={() => setShowWeightSettings(true)} className="flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold transition hover:bg-gray-50 hover:shadow-sm shadow-sm">
                  <Settings2 className="w-4 h-4 mr-2" /> Algorithm Rules
               </button>
            </div>
          </header>

          <AnimatePresence>
            {showWeightSettings && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-8 overflow-hidden">
                <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm relative">
                  <button onClick={() => setShowWeightSettings(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600"><X className="w-4 h-4" /></button>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Dynamic Smart Score Rules</h3>
                  <p className="text-sm text-gray-500 mb-6">You control the AI algorithm. Adjust the multipliers to sort colleges by what matters most to YOU.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(smartWeights).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex justify-between">
                          {key.replace(/_/g, ' ')} <span className="text-indigo-600">{(value * 100).toFixed(0)}%</span>
                        </label>
                        <input type="range" min="0" max="1" step="0.05" value={value}
                          onChange={(e) => setSmartWeights(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                          className="w-full accent-indigo-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-8 p-1 bg-gray-200/50 rounded-2xl w-fit flex gap-1">
            {['browse', 'compare'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:bg-white/50"}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'compare' && `(${selectedColleges.length})`}
              </button>
            ))}
          </div>

          {activeTab === "browse" ? (
            <div className="space-y-6">
              <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" placeholder="Search college..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium" />
                  </div>
                  <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium capitalize">
                    <option value="">All Branches</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-medium capitalize">
                    <option value="">All Cities</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatePresence>
                  {filteredColleges.map(college => {
                    const isSelected = selectedColleges.some(c => c.college_code === college.college_code);
                    return (
                      <motion.div layout key={college.college_code} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col group">
                        <div className="relative h-44">
                          <CollegeImage collegeCode={college.college_code} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <button onClick={() => addToComparison(college)} disabled={selectedColleges.length >= 4 && !isSelected} className={`absolute top-4 right-4 p-2 rounded-xl backdrop-blur-md transition ${isSelected ? "bg-green-500 text-white" : "bg-white/90 text-indigo-600 hover:scale-110"}`}>
                            {isSelected ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                          </button>
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-bold line-clamp-1">{college.college_name}</h3>
                          </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{college.city}</div>
                          <div className="text-sm font-bold text-gray-700 line-clamp-1 mb-4">{college.branch_name}</div>
                          <div className="grid grid-cols-2 gap-2 mb-6">
                             <div className="bg-slate-50 p-2 rounded-xl text-center">
                               <div className="text-indigo-600 font-black">₹{(college.fees / 1000).toFixed(0)}K</div>
                               <div className="text-[9px] font-bold text-gray-400 uppercase">Fees</div>
                             </div>
                             <div className="bg-slate-50 p-2 rounded-xl text-center">
                               <div className="text-emerald-600 font-black">{college.placement_rate}%</div>
                               <div className="text-[9px] font-bold text-gray-400 uppercase">Placed</div>
                             </div>
                          </div>
                          <div className="mt-auto">
                            <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase mb-1">
                              <span>Smart Score</span>
                              <span className="text-indigo-600">{calculateSmartScore(college, smartWeights).total}%</span>
                            </div>
                            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${calculateSmartScore(college, smartWeights).total}%` }} className="h-full bg-indigo-500" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {selectedColleges.length === 0 ? (
                <div className="bg-white rounded-[40px] py-16 text-center border-2 border-dashed border-gray-200">
                  <GitCompare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-400">Add colleges to compare</h3>
                </div>
              ) : (
                <>
                  <section className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-full md:w-auto">
                        {['table', 'radar', 'bar'].map(v => (
                          <button key={v} onClick={() => setComparisonView(v as any)} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition ${comparisonView === v ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:bg-white/50"}`}>
                            {v.charAt(0).toUpperCase() + v.slice(1)}
                          </button>
                        ))}
                      </div>
                      <button onClick={clearComparison} className="text-red-500 font-bold text-sm hover:underline">Clear Selection</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {selectedColleges.map(c => (
                        <div key={c.college_code} className="relative p-5 bg-slate-50 rounded-3xl border border-slate-100">
                          <button onClick={() => removeFromComparison(c.college_code)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition">
                            <X className="w-4 h-4" />
                          </button>
                          <h4 className="font-bold text-gray-900 pr-4 leading-tight">{c.college_name}</h4>
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block mt-2">{c.branch_name}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {comparisonView === 'table' ? (
                      <ComparisonTable selectedColleges={selectedColleges} />
                    ) : (
                      <ComparisonCharts selectedColleges={selectedColleges} view={comparisonView} />
                    )}
                  </motion.div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CollegeComparison;