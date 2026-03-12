import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useToast } from "../context/ToastContext";
import axios from "axios";
import {
  ChevronRight,
  Check,
  AlertCircle,
  Award,
  GraduationCap,
  BookOpen,
  Target,
  ChevronDown,
} from "lucide-react";

const ML_API_URL = import.meta.env.VITE_ML_API_URL ?? 'http://127.0.0.1:5001';

export default function Profile() {
  const navigate = useNavigate();
  const { success, error: toastError, warning, info } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPredicting, setIsPredicting] = useState(false);
  const [branches, setBranches] = useState<string[]>([]);
  const [showCETAlert, setShowCETAlert] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [serverError, setServerError] = useState<string>("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    state: "Maharashtra",
    category: "",
    examType: "Diploma",
    cetRank: "",
    cetScore: "",
    diplomaRank: "",
    diplomaScore: "",
    preferredBranches: [] as string[],
    homeUniversity: "",
    universityPreference: "All Universities",
    address: "",
    receiveUpdates: true,
  });

  const maharashtraUniversities = [
    "Savitribai Phule Pune University (SPPU)",
    "University of Mumbai (MU)",
    "Rashtrasant Tukadoji Maharaj Nagpur Universitssy (RTMNU)",
    "Shivaji University, Kolhapur",
    "Dr. Babasaheb Ambedkar Marathwada University (BAMU)",
    "Sant Gadge Baba Amravati University (SGBAU)",
    "North Maharashtra University (NMU)",
    "Swami Ramanand Teerth Marathwada University (SRTMUN)",
    "Solapur University",
    "Gondwana University",
    "Dr. Babasaheb Ambedkar Technological University (BATU)",
    "Other"
  ];

  const steps = ["Basic Info", "Academic Details", "Preferences"];

  const categories = [
    "OPEN",
    "OBC",
    "SC",
    "ST",
    "EWS",
    "VJ/DT-NT(A)",
    "NT(B)",
    "NT(C)",
    "NT(D)",
    "SBC",
  ];

  const universityOptions = ["All Universities", "Prioritize Home University (HU)", "Consider Others Also (OHU)"];

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(`${ML_API_URL}/branches`);
        setBranches(response.data.branches);
      } catch (error) {
        console.error("Error fetching branches:", error);
        setBranches([
          "Computer Science",
          "Information Technology",
          "Electronics & Communication",
          "Mechanical Engineering",
          "Civil Engineering",
          "Electrical Engineering",
          "Chemical Engineering",
          "Aerospace Engineering",
          "Biotechnology",
          "Automobile Engineering",
        ]);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          info("Login Required", "Please log in to access your profile.");
          navigate("/login", { replace: true });
          return;
        }

        console.log("User session:", session.user.id);

        // Get user profile from users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        console.log("Profile data:", profile);
        console.log("Profile error:", profileError);

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Profile fetch error:", profileError);
        }

        // Intentionally allowing users with completed profiles to stay on this page to update their details
        // if (profile && profile.profile_complete) {
        //   navigate("/overview", { replace: true });
        //   return;
        // }

        // Load existing data or start fresh
        if (profile) {
          setForm({
            name: profile.name || "",
            email: profile.email || session.user.email || "",
            state: profile.state || "Maharashtra",
            category: profile.category || "",
            examType: profile.exam_type || "Diploma",
            cetRank: profile.cet_rank || "",
            cetScore: profile.cet_score || "",
            diplomaRank: profile.diploma_rank || "",
            diplomaScore: profile.diploma_score || "",
            preferredBranches: profile.preferred_branches || [],
            homeUniversity: profile.home_university || "",
            universityPreference: profile.university_preference || "All Universities",
            address: profile.address || "",
            receiveUpdates: profile.receive_updates ?? true,
          });
        } else {
          // New user - start with minimal info from auth
          setForm(prev => ({
            ...prev,
            name: session.user.user_metadata?.name || "",
            email: session.user.email || "",
          }));
        }
      } catch (e: any) {
        console.error("Error in loadUser:", e);
        setServerError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [navigate]);

  const handleBranchToggle = (branch: string) => {
    setForm((prev) => ({
      ...prev,
      preferredBranches: prev.preferredBranches.includes(branch)
        ? prev.preferredBranches.filter((b) => b !== branch)
        : [...prev.preferredBranches, branch],
    }));
    // Clear branch error when user selects one
    if (errors.preferredBranches) {
      setErrors(prev => ({ ...prev, preferredBranches: '' }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: { [key: string]: string } = {};

    if (step === 0) {
      if (!form.name.trim()) newErrors.name = "Name is required";
      if (!form.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email is invalid";
      if (!form.category) newErrors.category = "Category is required";
      if (!form.state) newErrors.state = "State is required";
    } else if (step === 1) {
      if (form.examType === "Diploma") {
        if (!form.diplomaRank.trim()) newErrors.diplomaRank = "Diploma rank is required";
        if (!form.diplomaScore.trim()) newErrors.diplomaScore = "Diploma score is required";
        else if (isNaN(Number(form.diplomaScore)) || Number(form.diplomaScore) <= 0)
          newErrors.diplomaScore = "Enter a valid score greater than 0";
      }
      if (form.preferredBranches.length === 0) {
        newErrors.preferredBranches = "Please select at least one branch";
      }
    } else if (step === 2) {
      if (!form.homeUniversity) {
        newErrors.homeUniversity = "Please select your Home University";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleExamTypeChange = (type: string) => {
    if (type === "CET") {
      setShowCETAlert(true);
      return;
    }
    setForm({ ...form, examType: type });
  };



  const handleSubmit = async () => {
    // Validate all steps before submitting
    const allValid = [0, 1, 2].every(step => validateStep(step));
    if (!allValid) {
      warning("Incomplete Form", "Please fix all errors before submitting.");
      return;
    }

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      info("Login Required", "Please log in to save your profile.");
      navigate("/login", { replace: true });
      return;
    }

    if (!form.name || !form.email || form.preferredBranches.length === 0) {
      warning("Missing Required Fields", "Please fill in all required fields.");
      return;
    }

    if (form.examType === "Diploma" && (!form.diplomaRank || !form.diplomaScore)) {
      warning("Missing Score", "Please enter your Diploma Rank and Score.");
      return;
    }

    setIsPredicting(true);
    setServerError("");

    try {
      console.log("Saving profile for user:", session.user.id);

      // Prepare the data for Supabase
      const profileData = {
        id: session.user.id,
        email: form.email,
        name: form.name,
        address: form.address || null,
        state: form.state,
        category: form.category,
        exam_type: form.examType,
        cet_rank: form.cetRank || null,
        cet_score: form.cetScore || null,
        diploma_rank: form.diplomaRank || null,
        diploma_score: form.diplomaScore || null,
        preferred_branches: form.preferredBranches,
        home_university: form.homeUniversity,
        university_preference: form.universityPreference,
        receive_updates: form.receiveUpdates,
        profile_complete: true,
        updated_at: new Date().toISOString()
      };

      console.log("Profile data to save:", profileData);

      // Try upsert first
      const { error: upsertError } = await supabase
        .from('users')
        .upsert(profileData, {
          onConflict: 'id'
        });

      if (upsertError) {
        console.error("Upsert error:", upsertError);

        // Try insert instead
        const { error: insertError } = await supabase
          .from('users')
          .insert([profileData]);

        if (insertError) {
          console.error("Insert error:", insertError);
          throw insertError;
        }
      }

      console.log("✅ Profile saved successfully");

      const userScore = Number(form.diplomaScore);
      if (!userScore || userScore === 0) {
        warning("Invalid Score", "Please enter a valid diploma score greater than 0.");
        setIsPredicting(false);
        return;
      }

      // Profile saved — navigate to overview
      success("Profile Saved!", "Your admission profile is ready. Fetching personalised predictions...");
      localStorage.setItem('profileComplete', 'true');

      setTimeout(() => {
        setIsPredicting(false);
        navigate("/overview", { replace: true });
      }, 1200);

    } catch (error: any) {
      console.error("Error saving profile:", error);
      setServerError(error.message || "Unknown error occurred");
      toastError("Save Failed", error.message || "Could not save your profile. Please try again.");
      setIsPredicting(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <div className="text-slate-600 font-medium">Loading your profile...</div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fafafa] p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500/5 blur-[120px] rounded-full" />
      </div>

      {/* CET Alert Modal */}
      <AnimatePresence>
        {showCETAlert && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[32px] max-w-md w-full p-8 shadow-2xl border border-white/20"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-rose-100 rounded-full mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 text-center mb-3">
                CET Feature Coming Soon
              </h3>
              <p className="text-slate-500 text-center mb-8 leading-relaxed">
                The CET score analysis feature is currently under development.
                Please select Diploma for now to complete your profile setup.
              </p>
              <button
                onClick={() => setShowCETAlert(false)}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
              >
                Continue with Diploma
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full"
        >
          <div className="flex flex-col lg:flex-row bg-white/60 backdrop-blur-3xl border border-white/20 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.05)] overflow-hidden min-h-[600px]">

            {/* Mobile Header Strip - visible only on small screens */}
            <div className="lg:hidden bg-slate-900 px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black text-white tracking-widest uppercase">Smart College Finder</h1>
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Profile Setup · Step {currentStep + 1} of {steps.length}</p>
              </div>
              <div className="ml-auto">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden w-24">
                  <div className="h-full bg-rose-500 transition-all duration-500 ease-out" style={{ width: `${((currentStep) / steps.length) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Left Panel - Hero Section - hidden on mobile */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="hidden lg:flex lg:w-[400px] xl:w-[480px] bg-slate-900 p-12 flex-col justify-between relative overflow-hidden flex-shrink-0"
            >
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-12">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-sm font-black text-white tracking-widest uppercase">
                      Smart College Finder
                    </h1>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Profile Setup</p>
                  </div>
                </div>

                <div className="mb-12">
                  <h2 className="text-3xl lg:text-4xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                    Let's Build Your <br />
                    <span className="text-rose-500 italic">Dream Profile.</span>
                  </h2>

                  <div className="space-y-8">
                    <div className="flex items-start gap-4 group">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-rose-500/20 transition-colors border border-white/10">
                        <Target className="w-6 h-6 text-white group-hover:text-rose-400 transition-colors" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white mb-1">Accurate Predictions</h4>
                        <p className="text-white/60 text-xs leading-relaxed">
                          Get precise college admission predictions based on your academic scores
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 group">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-rose-500/20 transition-colors border border-white/10">
                        <BookOpen className="w-6 h-6 text-white group-hover:text-rose-400 transition-colors" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white mb-1">Smart Matching</h4>
                        <p className="text-white/60 text-xs leading-relaxed">
                          Find colleges that perfectly align with your preferred branches and location
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 group">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-rose-500/20 transition-colors border border-white/10">
                        <Award className="w-6 h-6 text-white group-hover:text-rose-400 transition-colors" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white mb-1">Success Roadmap</h4>
                        <p className="text-white/60 text-xs leading-relaxed">
                          Your profile is the key to unlocking personalized admission insights
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Indicatior */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Progress</span>
                    <span className="text-xs font-bold text-rose-400">{Math.round(((currentStep) / steps.length) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 transition-all duration-500 ease-out"
                      style={{ width: `${((currentStep) / steps.length) * 100}%` }}
                    />
                  </div>
                  <div className="mt-4 flex justify-between items-center text-[10px] font-medium text-white/40 uppercase tracking-wider">
                    <span>Step {currentStep + 1} of {steps.length}</span>
                    <span>{steps[currentStep]}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Panel - Form Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex-1 p-5 sm:p-8 lg:p-12 xl:p-16 flex flex-col bg-white/40 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">
                    {steps[currentStep]}
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">Please provide your details below</p>
                </div>
                <div className="hidden sm:flex gap-2">
                  {steps.map((_, idx) => (
                    <div key={idx} className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentStep ? 'bg-rose-500 w-8' : idx < currentStep ? 'bg-rose-500/40' : 'bg-slate-200'}`} />
                  ))}
                </div>
              </div>

              {/* Display server error if any */}
              {serverError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-red-600 text-sm font-semibold">Server Error</p>
                    <p className="text-red-500 text-xs">{serverError}</p>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="wait">
                  {currentStep === 0 && (
                    <motion.div
                      key="step1"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            First Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.name.split(' ')[0] || ''}
                            onChange={(e) => {
                              const lastName = form.name.split(' ').slice(1).join(' ');
                              setForm({ ...form, name: `${e.target.value} ${lastName}`.trim() });
                            }}
                            placeholder="First Name"
                            className={`w-full bg-white border ${errors.name ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm`}
                            required
                          />
                          {errors.name && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.name}</p>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Last Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.name.split(' ').slice(1).join(' ') || ''}
                            onChange={(e) => {
                              const firstName = form.name.split(' ')[0] || '';
                              setForm({ ...form, name: `${firstName} ${e.target.value}`.trim() });
                            }}
                            placeholder="Last Name"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="john@example.com"
                          className={`w-full bg-white border ${errors.email ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm`}
                          required
                        />
                        {errors.email && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.email}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          State <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value="Maharashtra"
                          readOnly
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 cursor-not-allowed focus:outline-none transition-all shadow-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Contact Address
                        </label>
                        <textarea
                          placeholder="Enter your full address (Optional)"
                          value={form.address}
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                          rows={2}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm resize-none"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Category <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {categories.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setForm({ ...form, category: cat });
                                if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
                              }}
                              className={`p-2.5 rounded-lg border text-center transition-all duration-200 text-xs font-bold ${form.category === cat
                                ? "border-rose-500 bg-rose-50 text-rose-600 shadow-sm"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                        {errors.category && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.category}</p>}
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 1 && (
                    <motion.div
                      key="step2"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6"
                    >
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Exam Type <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex gap-4">
                          {["CET", "Diploma"].map((type) => (
                            <button
                              key={type}
                              onClick={() => handleExamTypeChange(type)}
                              className={`flex-1 p-4 rounded-xl border-2 transition-all ${form.examType === type
                                ? "border-rose-500 bg-rose-50 text-rose-700 shadow-sm"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                } ${type === "CET" ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-bold text-sm">{type}</span>
                                {type === "CET" && (
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Coming Soon</span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {form.examType === "Diploma" && (
                        <>
                          <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Diploma Rank <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="number"
                                min="1"
                                placeholder="e.g. 1500"
                                value={form.diplomaRank}
                                onChange={(e) => {
                                  if (Number(e.target.value) < 0) return;
                                  setForm({ ...form, diplomaRank: e.target.value });
                                  if (errors.diplomaRank) setErrors(prev => ({ ...prev, diplomaRank: '' }));
                                }}
                                className={`w-full bg-white border ${errors.diplomaRank ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm`}
                                required
                              />
                              {errors.diplomaRank && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.diplomaRank}</p>}
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Diploma Score <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="e.g. 85.50"
                                value={form.diplomaScore}
                                onChange={(e) => {
                                  if (Number(e.target.value) < 0) return;
                                  setForm({ ...form, diplomaScore: e.target.value });
                                  if (errors.diplomaScore) setErrors(prev => ({ ...prev, diplomaScore: '' }));
                                }}
                                className={`w-full bg-white border ${errors.diplomaScore ? 'border-red-500' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm`}
                                required
                              />
                              {errors.diplomaScore && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.diplomaScore}</p>}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Preferred Branches <span className="text-rose-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                              {branches.map((b) => (
                                <button
                                  key={b}
                                  type="button"
                                  onClick={() => handleBranchToggle(b)}
                                  className={`p-3 rounded-xl border text-left transition-all group ${form.preferredBranches.includes(b)
                                    ? "border-rose-500 bg-rose-50 text-rose-700 shadow-sm"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                    }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold leading-tight">{b}</span>
                                    {form.preferredBranches.includes(b) && (
                                      <Check className="w-4 h-4 text-rose-500" />
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                            {errors.preferredBranches && (
                              <p className="text-rose-500 text-xs mt-1 font-medium">{errors.preferredBranches}</p>
                            )}
                            <p className="text-xs text-slate-400 font-medium">
                              {form.preferredBranches.length} branches selected
                            </p>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step3"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="space-y-6"
                    >
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Home University <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <GraduationCap className="h-5 w-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                          </div>
                          <select
                            value={form.homeUniversity}
                            onChange={(e) => {
                              setForm({ ...form, homeUniversity: e.target.value });
                              if (errors.homeUniversity) setErrors(prev => ({ ...prev, homeUniversity: '' }));
                            }}
                            className={`w-full bg-white border ${errors.homeUniversity ? 'border-red-500' : 'border-slate-200'} rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm appearance-none cursor-pointer`}
                          >
                            <option value="" disabled>Select your Home University</option>
                            {maharashtraUniversities.map((uni) => (
                              <option key={uni} value={uni}>{uni}</option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          </div>
                        </div>
                        {errors.homeUniversity && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.homeUniversity}</p>}
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                          Your Home University is typically the university associated with your Diploma college district.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          University Preferences
                        </label>
                        <div className="space-y-3">
                          {universityOptions.map((option) => (
                            <label
                              key={option}
                              className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${form.universityPreference === option
                                ? "border-rose-500 bg-rose-50 ring-1 ring-rose-500"
                                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                            >
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${form.universityPreference === option
                                ? "border-rose-600 bg-white"
                                : "border-slate-300 bg-white"
                                }`}>
                                {form.universityPreference === option && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                                )}
                              </div>
                              <input
                                type="radio"
                                name="university"
                                value={option}
                                checked={form.universityPreference === option}
                                onChange={(e) => setForm({ ...form, universityPreference: e.target.value })}
                                className="hidden"
                              />
                              <span className={`text-sm font-bold ${form.universityPreference === option ? "text-rose-900" : "text-slate-700"
                                }`}>
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${form.receiveUpdates ? 'bg-rose-600 border-rose-600' : 'border-slate-300 bg-white group-hover:border-slate-400'
                            }`}>
                            {form.receiveUpdates && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <input
                            type="checkbox"
                            checked={form.receiveUpdates}
                            onChange={(e) => setForm({ ...form, receiveUpdates: e.target.checked })}
                            className="hidden"
                          />
                          <div>
                            <span className="block text-sm font-bold text-slate-700">Receive Updates</span>
                            <span className="block text-xs text-slate-500 mt-1">
                              Get notified about admission deadlines and counseling rounds.
                            </span>
                          </div>
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation Buttons */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-center gap-4">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${currentStep === 0
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                >
                  Back
                </button>

                {currentStep === steps.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isPredicting}
                    className="flex-1 sm:flex-none sm:w-auto px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isPredicting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Profile</span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex-1 sm:flex-none sm:w-auto px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}