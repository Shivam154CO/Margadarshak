import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import {
  Radar,
  Bar,
} from "react-chartjs-2";
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
  Filter,
  GraduationCap,
  MapPin,
  Award,
  DollarSign,
  TrendingUp,
  Star,
  Target,
  Layers,
  User,
  Users,
  ChevronDown,
  ChevronUp,
  Trophy,
  Download,
  Share2,
  BarChart3,
  GitCompare,
  Check,
  CheckCheck,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

// College interface (matching Dashboard and CollegeDetails)
interface College {
  college_code: string;
  college_name: string;
  city: string;
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

  // Prediction fields from Dashboard
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

// Comparison metrics interface
interface ComparisonMetric {
  key: keyof College;
  label: string;
  icon: React.ReactNode;
  unit?: string;
  higherIsBetter: boolean;
  weight: number;
  category: "academic" | "financial" | "infrastructure" | "career";
  description?: string;
}

// Function to get college image from local assets
const getCollegeImage = (collegeCode: string): string => {
  if (!collegeCode) {
    return "/src/assets/fallback-campus.jpg";
  }
  const imagePath = `/src/assets/${collegeCode}/campus.png`;
  return imagePath;
};

// Fallback Unsplash images
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

// College Image Component
const CollegeImage: React.FC<{
  collegeCode: string;
  className?: string;
  alt?: string;
}> = ({ collegeCode, className = "", alt = "College campus" }) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true);
      setError(false);
      try {
        const localImageUrl = getCollegeImage(collegeCode);
        const img = new Image();
        img.onload = () => {
          setImageSrc(localImageUrl);
          setLoading(false);
        };
        img.onerror = () => {
          setImageSrc(getRandomFallbackImage());
          setError(true);
          setLoading(false);
        };
        img.src = localImageUrl;
      } catch (err) {
        setImageSrc(getRandomFallbackImage());
        setError(true);
        setLoading(false);
      }
    };
    loadImage();
  }, [collegeCode]);

  if (loading) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center`}
      >
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`${className} ${error ? "grayscale opacity-75" : ""}`}
      loading="lazy"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = getRandomFallbackImage();
      }}
    />
  );
};

// Comparison Metrics Configuration
const COMPARISON_METRICS: ComparisonMetric[] = [
  {
    key: "placement_rate",
    label: "Placement Rate",
    icon: <TrendingUp className="w-4 h-4" />,
    unit: "%",
    higherIsBetter: true,
    weight: 25,
    category: "career",
    description: "Percentage of students placed"
  },
  {
    key: "average_package_lpa",
    label: "Avg Package",
    icon: <DollarSign className="w-4 h-4" />,
    unit: " LPA",
    higherIsBetter: true,
    weight: 20,
    category: "career",
    description: "Average annual salary package"
  },
  {
    key: "fees",
    label: "Annual Fees",
    icon: <DollarSign className="w-4 h-4" />,
    unit: " ₹",
    higherIsBetter: false,
    weight: 15,
    category: "financial",
    description: "Annual tuition fees"
  },
  {
    key: "cutoff_percentile",
    label: "Cutoff Score",
    icon: <Award className="w-4 h-4" />,
    unit: "%",
    higherIsBetter: true,
    weight: 15,
    category: "academic",
    description: "Required percentile for admission"
  },
  {
    key: "total_intake",
    label: "Total Intake",
    icon: <Users className="w-4 h-4" />,
    unit: "",
    higherIsBetter: true,
    weight: 10,
    category: "academic",
    description: "Total number of students admitted"
  },
  {
    key: "seats",
    label: "Available Seats",
    icon: <User className="w-4 h-4" />,
    unit: "",
    higherIsBetter: true,
    weight: 8,
    category: "academic",
    description: "Number of available seats"
  },
  {
    key: "highest_package_lpa",
    label: "Highest Package",
    icon: <Trophy className="w-4 h-4" />,
    unit: " LPA",
    higherIsBetter: true,
    weight: 12,
    category: "career",
    description: "Highest salary package offered"
  },
  {
    key: "rating",
    label: "College Rating",
    icon: <Star className="w-4 h-4" />,
    unit: "/5",
    higherIsBetter: true,
    weight: 10,
    category: "academic",
    description: "Overall college rating"
  },
  {
    key: "nirf_ranking",
    label: "NIRF Ranking",
    icon: <Target className="w-4 h-4" />,
    unit: "",
    higherIsBetter: false,
    weight: 8,
    category: "academic",
    description: "Lower ranking number is better"
  },
  {
    key: "alumni_strength",
    label: "Alumni Strength",
    icon: <Layers className="w-4 h-4" />,
    unit: "",
    higherIsBetter: true,
    weight: 7,
    category: "career",
    description: "Strength of alumni network"
  },
];



// Smart scoring algorithm with weighted criteria
const calculateSmartScore = (college: College, weights: Record<string, number> = {}): {
  total: number;
  breakdown: Record<string, number>;
} => {
  const defaultWeights = {
    placement_rate: 0.25,
    average_package_lpa: 0.20,
    fees: 0.15,
    cutoff_percentile: 0.15,
    student_faculty_ratio: 0.10,
    campus_area: 0.05,
    library_books: 0.05,
    research_papers: 0.05,
  };

  const finalWeights = { ...defaultWeights, ...weights };
  let totalScore = 0;
  const breakdown: Record<string, number> = {};

  COMPARISON_METRICS.forEach((metric) => {
    const value = Number(college[metric.key]) || 0;
    let normalizedScore = 0;

    if (value > 0) {
      if (metric.key === "fees") {
        // Invert fees score (lower fees = higher score)
        normalizedScore = Math.max(0, 100 - (value / 100000));
      } else if (metric.key === "student_faculty_ratio") {
        normalizedScore = Math.max(0, 100 - value * 10);
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
  const [showFilters, setShowFilters] = useState(true);
  const [comparisonView, setComparisonView] = useState<"table" | "radar" | "bar">("table");
  const [showComparisonSummary, setShowComparisonSummary] = useState(true);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Fetch colleges data
  useEffect(() => {
    fetchColleges();
  }, []);

  // Extract unique branches and cities
  useEffect(() => {
    if (colleges.length > 0) {
      const uniqueBranches = Array.from(new Set(colleges.map(c => c.branch_name).filter(Boolean)));
      const uniqueCities = Array.from(new Set(colleges.map(c => c.city).filter(Boolean)));
      setBranches(uniqueBranches);
      setCities(uniqueCities);
    }
  }, [colleges]);

  const fetchColleges = async () => {
    try {
      const { data, error } = await supabase
        .from('colleges_2025')
        .select('*');

      if (error) throw error;
      // Filter unique colleges by college_code to ensure no duplicates
      const uniqueColleges = data ? data.filter((college, index, self) =>
        index === self.findIndex(c => c.college_code === college.college_code)
      ) : [];
      setColleges(uniqueColleges);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter colleges based on search and filters
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

  // Add/Remove college from comparison
  const addToComparison = (college: College) => {
    if (selectedColleges.length >= 4) return;
    if (!selectedColleges.find(c => c.college_code === college.college_code)) {
      setSelectedColleges([...selectedColleges, college]);
    }
  };

  const removeFromComparison = (collegeCode: string) => {
    setSelectedColleges(selectedColleges.filter(c => c.college_code !== collegeCode));
  };

  const clearComparison = () => {
    setSelectedColleges([]);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedBranch("");
    setSelectedCity("");
  };



  // Get comparison winner for each metric
  const getMetricWinner = (metric: ComparisonMetric): College | null => {
    if (selectedColleges.length < 2) return null;

    let winner = selectedColleges[0];
    let bestValue = winner[metric.key] || 0;

    selectedColleges.forEach(college => {
      const value = college[metric.key] || 0;
      if (metric.higherIsBetter ? value > bestValue : value < bestValue) {
        bestValue = value;
        winner = college;
      }
    });

    return winner;
  };

  // Get overall winner based on smart score
  const getOverallWinner = (): College | null => {
    if (selectedColleges.length < 2) return null;

    let winner = selectedColleges[0];
    let highestScore = calculateSmartScore(winner).total;

    selectedColleges.forEach(college => {
      const score = calculateSmartScore(college).total;
      if (score > highestScore) {
        highestScore = score;
        winner = college;
      }
    });

    return winner;
  };

  // Generate radar chart data
  const getRadarChartData = (): {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
      pointBackgroundColor: string;
    }[];
  } => {
    const labels = COMPARISON_METRICS.map(m => m.label);
    const datasets = selectedColleges.map((college, index) => {
      const colors = [
        'rgba(99, 102, 241, 0.6)',
        'rgba(236, 72, 153, 0.6)',
        'rgba(34, 197, 94, 0.6)',
        'rgba(234, 179, 8, 0.6)',
      ];
      const borderColors = [
        'rgb(99, 102, 241)',
        'rgb(236, 72, 153)',
        'rgb(34, 197, 94)',
        'rgb(234, 179, 8)',
      ];

      return {
        label: college.college_name,
        data: COMPARISON_METRICS.map(metric => {
          const value = Number(college[metric.key]) || 0;
          if (metric.key === 'fees') {
            return Math.max(0, 100 - value / 10000);
          } else if (metric.key === 'nirf_ranking') {
            return Math.max(0, 100 - value);
          } else {
            return Math.min(100, value);
          }
        }),
        backgroundColor: colors[index % colors.length],
        borderColor: borderColors[index % borderColors.length],
        borderWidth: 2,
        pointBackgroundColor: borderColors[index % borderColors.length],
      };
    });

    return {
      labels,
      datasets,
    };
  };

  // Generate bar chart data for specific metric
  const getBarChartData = (metric: ComparisonMetric) => {
    const labels = selectedColleges.map(c => c.college_name);
    const data = selectedColleges.map(c => c[metric.key] || 0);

    return {
      labels,
      datasets: [
        {
          label: metric.label,
          data,
          backgroundColor: selectedColleges.map((_, index) =>
            `hsl(${index * 90}, 70%, 60%)`
          ),
          borderColor: selectedColleges.map((_, index) =>
            `hsl(${index * 90}, 70%, 40%)`
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  // Export to PDF
  const exportToPDF = () => {
    setExporting(true);
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text('College Comparison Report', 14, 22);

    // Date
    doc.setFontSize(10);
    const formatDate = (date: Date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    doc.text(`Generated on: ${formatDate(new Date())}`, 14, 32);

    // College information table
    const collegeData = selectedColleges.map(college => [
      college.college_name,
      college.city,
      college.branch_name,
      `₹${college.fees.toLocaleString()}`,
      `${college.placement_rate}%`,
      `${college.average_package_lpa} LPA`,
    ]);

    autoTable(doc, {
      head: [['College', 'City', 'Branch', 'Fees', 'Placement', 'Avg Package']] as any,
      body: collegeData as any,
      startY: 40,
      theme: 'striped',
    });

    // Comparison table
    let yPosition = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(16);
    doc.text('Detailed Comparison', 14, yPosition);

    const comparisonData = COMPARISON_METRICS.map(metric => {
      const row = [metric.label];
      selectedColleges.forEach(college => {
        row.push(`${college[metric.key] || 0}${metric.unit || ''}`);
      });
      return row;
    });

    autoTable(doc, {
      head: ['Metric', ...selectedColleges.map(c => c.college_name)] as any,
      body: comparisonData as any,
      startY: yPosition + 10,
      theme: 'grid',
    });

    doc.save('college-comparison.pdf');
    setExporting(false);
  };

  // Export to Excel
  const exportToExcel = () => {
    // Create CSV content
    const headers = ['Metric', ...selectedColleges.map(c => c.college_name)];
    const rows = COMPARISON_METRICS.map(metric => {
      return [
        metric.label,
        ...selectedColleges.map(college => `${college[metric.key] || 0}${metric.unit || ''}`)
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'college-comparison.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Share comparison link
  const shareComparison = async () => {
    const collegeCodes = selectedColleges.map(c => c.college_code).join(',');
    const url = `${window.location.origin}/compare?colleges=${collegeCodes}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'College Comparison',
          text: 'Check out this college comparison I created!',
          url,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format value for display
  const formatValue = (value: any, metric: ComparisonMetric): string => {
    if (value === undefined || value === null) return 'N/A';

    if (metric.key === 'fees') {
      return `₹${value.toLocaleString()}`;
    }

    return `${value}${metric.unit || ''}`;
  };

  // Get category color
  const getCategoryColor = (category: string): string => {
    const colors = {
      academic: 'bg-purple-100 text-purple-800',
      financial: 'bg-blue-100 text-blue-800',
      infrastructure: 'bg-green-100 text-green-800',
      career: 'bg-orange-100 text-orange-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">College Comparison</h1>
              <p className="text-gray-600 mt-2">
                Compare up to 4 colleges side-by-side with detailed metrics and visualizations
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {activeTab === "compare" && selectedColleges.length > 0 && (
                <>
                  <button
                    onClick={shareComparison}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {copied ? <CheckCheck className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
                    {copied ? "Copied!" : "Share"}
                  </button>

                  <button
                    onClick={exportToPDF}
                    disabled={exporting}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {exporting ? "Exporting..." : "Export PDF"}
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-2 p-1 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm max-w-md">
            <button
              onClick={() => setActiveTab("browse")}
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all ${
                activeTab === "browse"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-center">
                <Search className="w-4 h-4 mr-2" />
                Browse Colleges
              </div>
            </button>
            <button
              onClick={() => setActiveTab("compare")}
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === "compare"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-center">
                <GitCompare className="w-4 h-4 mr-2" />
                Compare ({selectedColleges.length})
                {selectedColleges.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {selectedColleges.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {activeTab === "browse" && (
          <>
            {/* Filters Section */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 mb-8 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Filter className="w-6 h-6 text-indigo-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Filters & Search</h3>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  {showFilters ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Hide Filters
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      Show Filters
                    </>
                  )}
                </button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Search */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Search Colleges
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            placeholder="College name or city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          />
                        </div>
                      </div>

                      {/* Branch Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Branch
                        </label>
                        <select
                          value={selectedBranch}
                          onChange={(e) => setSelectedBranch(e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        >
                          <option value="">All Branches</option>
                          {branches.map((branch) => (
                            <option key={branch} value={branch}>
                              {branch}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* City Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <select
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        >
                          <option value="">All Cities</option>
                          {cities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={clearFilters}
                        className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:opacity-90 transition-all"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* College Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {filteredColleges.map((college) => (
                  <motion.div
                    key={college.college_code}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -4 }}
                    className="group"
                  >
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                      {/* Image Section */}
                      <div className="relative h-48 overflow-hidden">
                        <CollegeImage
                          collegeCode={college.college_code}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={`${college.college_name} campus`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Add to Comparison Button */}
                        <div className="absolute top-4 right-4">
                          <button
                            onClick={() => addToComparison(college)}
                            disabled={selectedColleges.length >= 4 || selectedColleges.some(c => c.college_code === college.college_code)}
                            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
                              selectedColleges.some(c => c.college_code === college.college_code)
                                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                                : selectedColleges.length >= 4
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-white/90 text-indigo-600 hover:bg-white hover:shadow-lg"
                            }`}
                          >
                            {selectedColleges.find(c => c.college_code === college.college_code) ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Plus className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        {/* College Name Overlay */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-xl font-bold text-white line-clamp-2">
                            {college.college_name}
                          </h3>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-5 flex-1 flex flex-col">
                        {/* Location & Branch */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="text-sm truncate">{college.city}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <GraduationCap className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="text-sm truncate">{college.branch_name}</span>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-3">
                            <div className="text-2xl font-bold text-indigo-700">
                              ₹{(college.fees / 1000).toFixed(0)}K
                            </div>
                            <div className="text-xs text-indigo-600 font-medium">Annual Fees</div>
                          </div>
                          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3">
                            <div className="text-2xl font-bold text-emerald-700">
                              {college.placement_rate}%
                            </div>
                            <div className="text-xs text-emerald-600 font-medium">Placement Rate</div>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-auto space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-600">
                              <Award className="w-4 h-4 mr-1" />
                              <span>Rank: {college.cutoff_rank}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <DollarSign className="w-4 h-4 mr-1" />
                              <span>{college.average_package_lpa} LPA</span>
                            </div>
                          </div>

                          {/* Smart Score */}
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-600">Smart Score</span>
                              <span className="text-xs font-bold text-indigo-600">
                                {calculateSmartScore(college).total}/100
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                                style={{ width: `${calculateSmartScore(college).total}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
        {activeTab === "compare" && selectedColleges.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Comparison Summary */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Comparison Summary</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setComparisonView("table")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      comparisonView === "table"
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Table
                  </button>
                  <button
                    onClick={() => setComparisonView("radar")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      comparisonView === "radar"
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Radar
                  </button>
                  <button
                    onClick={() => setComparisonView("bar")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      comparisonView === "bar"
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Bar
                  </button>
                </div>
              </div>
              {/* Selected Colleges */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {selectedColleges.map((college) => (
                  <div key={college.college_code} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">{college.college_name}</h3>
                      <button
                        onClick={() => removeFromComparison(college.college_code)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">{college.city}</div>
                    <div className="text-sm text-gray-600">{college.branch_name}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={clearComparison}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
                >
                  Clear All
                </button>
              </div>
            </div>
            {/* Comparison View */}
            {comparisonView === "table" && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Detailed Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-medium text-gray-700">Metric</th>
                        {selectedColleges.map((college) => (
                          <th key={college.college_code} className="text-center py-2 font-medium text-gray-700">
                            {college.college_name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARISON_METRICS.map((metric) => (
                        <tr key={metric.key} className="border-b border-gray-100">
                          <td className="py-3 font-medium text-gray-900">{metric.label}</td>
                          {selectedColleges.map((college) => {
                            const value = college[metric.key];
                            const isWinner = getMetricWinner(metric)?.college_code === college.college_code;
                            return (
                              <td key={college.college_code} className={`py-3 text-center ${isWinner ? 'bg-yellow-100 font-bold' : ''}`}>
                                {formatValue(value, metric)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {comparisonView === "radar" && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Radar Comparison</h3>
                <Radar data={getRadarChartData()} />
              </div>
            )}
            {comparisonView === "bar" && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Bar Comparison</h3>
                <Bar data={getBarChartData(COMPARISON_METRICS[0])} />
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
export default CollegeComparison;
