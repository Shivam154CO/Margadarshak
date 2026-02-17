import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Check, Award } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [receiveUpdates, setReceiveUpdates] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      alert("Please fill all required fields");
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    if (!agreedToTerms) {
      alert("Please agree to Terms and Privacy Policy");
      return;
    }

    setIsLoading(true);
    try {
      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create only basic user profile - no default values
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: form.email,
              name: form.name,
              address: form.address || null,
              receive_updates: receiveUpdates,
              profile_complete: false // Mark as incomplete
              // DON'T set any other fields - they remain null
            }
          ]);

        if (profileError) {
          // If user already exists (maybe from Firebase migration), just update
          const { error: updateError } = await supabase
            .from('users')
            .update({
              name: form.name,
              address: form.address || null,
              receive_updates: receiveUpdates,
              profile_complete: false
            })
            .eq('email', form.email);

          if (updateError) throw updateError;
        }

        alert("Account created successfully! Please check your email to verify your account.");
        setIsLoading(false);
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Signup error:", error.message);
      alert(error.message || "An error occurred during signup");
      setIsLoading(false);
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-4 md:p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-500/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl relative z-10"
      >
        <div className="flex flex-col lg:flex-row bg-white/60 backdrop-blur-3xl border border-white/20 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.05)] overflow-hidden">

          {/* Left Panel - Hero Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:w-2/5 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden bg-slate-900 border-r border-white/10"
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-black text-white tracking-widest uppercase">
                    Smart College Finder
                  </h1>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">AI-Powered Admissions</p>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-[0.9] tracking-tighter">
                  Start Your <br /> <span className="text-rose-500 italic">Journey.</span>
                </h2>

                <p className="text-white/60 text-sm leading-relaxed font-medium max-w-xs">
                  Create your free account and get instant access to our AI admission predictor and college insights.
                </p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 relative z-10 mt-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                    <Check className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-xs font-bold text-white">95.7% Prediction Accuracy</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                    <Check className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-xs font-bold text-white">Real-time Seat Matrix</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:w-3/5 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white/40 backdrop-blur-xl"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                Create Account
              </h2>
              <p className="text-slate-500 text-sm font-medium">Join thousands of students securing their future.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Fields Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={form.name.split(' ')[0] || ''}
                    onChange={(e) => {
                      const lastName = form.name.split(' ').slice(1).join(' ');
                      setForm({ ...form, name: `${e.target.value} ${lastName}`.trim() });
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={form.name.split(' ').slice(1).join(' ') || ''}
                    onChange={(e) => {
                      const firstName = form.name.split(' ')[0] || '';
                      setForm({ ...form, name: `${firstName} ${e.target.value}`.trim() });
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
                  required
                />
              </div>

              {/* Password Fields Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 pr-10 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 pr-10 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Contact Address (Optional)
                </label>
                <textarea
                  placeholder="Enter your contact address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm resize-none"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setReceiveUpdates(!receiveUpdates)}
                    className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${receiveUpdates ? 'bg-rose-600 border-rose-600' : 'border-slate-300 hover:border-slate-400 bg-white'
                      }`}
                  >
                    {receiveUpdates && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                  <label className="text-xs font-semibold text-slate-600 leading-tight pt-0.5 cursor-pointer" onClick={() => setReceiveUpdates(!receiveUpdates)}>
                    Send me important updates and college deadline reminders
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                    className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${agreedToTerms ? 'bg-rose-600 border-rose-600' : 'border-slate-300 hover:border-slate-400 bg-white'
                      }`}
                  >
                    {agreedToTerms && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                  <label className="text-xs font-semibold text-slate-600 leading-tight pt-0.5" >
                    I agree to the <span className="text-slate-900 underline cursor-pointer hover:text-rose-600">Terms</span> and <span className="text-slate-900 underline cursor-pointer hover:text-rose-600">Privacy Policy</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm tracking-wide hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="text-center text-slate-500 mt-8 text-xs font-semibold">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-rose-600 hover:text-rose-700 font-bold hover:underline transition-all"
              >
                Sign In
              </button>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}