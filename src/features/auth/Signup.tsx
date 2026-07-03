import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Check, Award } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/context/ToastContext";

export default function Signup() {
  const navigate = useNavigate();
  const { success, error: toastError, warning } = useToast();
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

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      warning("Missing Fields", "Please fill in all required fields.");
      return;
    }
    if (form.password.length < 6) {
      warning("Weak Password", "Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      warning("Password Mismatch", "Your passwords don't match. Please check and try again.");
      return;
    }
    if (!agreedToTerms) {
      warning("Terms Required", "Please agree to the Terms and Privacy Policy to continue.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { name: form.name }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Upsert basic user profile — safe even if trigger already created the row
        const { error: profileError } = await supabase
          .from('users')
          .upsert([{
            id: data.user.id,
            email: form.email,
            name: form.name,
            address: form.address || null,
            receive_updates: receiveUpdates,
            profile_complete: false
          }], { onConflict: 'id', ignoreDuplicates: true });

        if (profileError) {
          // Log but don't block the user — trigger may have already handled it
          console.error("Profile upsert error:", profileError);
        }

        success(
          "Account Created! 🎉",
          "Please check your email to verify your account, then log in."
        );
        navigate("/login");
      }
    } catch (err: any) {
      const msg = err.message || "An error occurred during signup";
      if (msg.includes("already registered") || msg.includes("already been registered")) {
        toastError("Email Already Used", "An account with this email already exists. Try logging in.");
      } else {
        toastError("Signup Failed", msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-4 md:p-6 relative overflow-hidden">
      {/* Background blobs */}
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

          {/* ── Left Panel ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:w-2/5 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden bg-slate-900 border-r border-white/10"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-black text-white tracking-widest uppercase">Smart College Finder</h1>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">AI-Powered Admissions</p>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-[0.9] tracking-tighter">
                  Start Your <br /><span className="text-rose-500 italic">Journey.</span>
                </h2>
                <p className="text-white/60 text-sm leading-relaxed font-medium max-w-xs">
                  Create your free account and get instant access to our AI admission predictor and college insights.
                </p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 relative z-10 mt-auto space-y-4">
              {[
                "95.7% Prediction Accuracy",
                "Real-time Seat Matrix",
                "Completely Free to Use",
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                    <Check className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-xs font-bold text-white">{feat}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right Panel ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:w-3/5 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white/40 backdrop-blur-xl"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Create Account</h2>
              <p className="text-slate-500 text-sm font-medium">Join thousands of students securing their future.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">First Name</label>
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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Last Name</label>
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

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
                  required
                />
              </div>

              {/* Password Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 6 characters"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 pr-10 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Toggle password">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repeat password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className={`w-full bg-white border rounded-xl px-4 pr-10 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-200 focus:ring-rose-500/20 focus:border-rose-500'}`}
                      required
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Toggle confirm password">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.confirmPassword && form.password !== form.confirmPassword && (
                    <p className="text-xs text-rose-500 font-medium">Passwords don't match</p>
                  )}
                </div>
              </div>

              {/* Address (optional) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Contact Address <span className="normal-case font-normal text-slate-400">(optional)</span>
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
              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    id="receive-updates-toggle"
                    onClick={() => setReceiveUpdates(!receiveUpdates)}
                    aria-pressed={receiveUpdates}
                    className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${receiveUpdates ? 'bg-rose-600 border-rose-600' : 'border-slate-300 hover:border-slate-400 bg-white'}`}
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
                    id="terms-toggle"
                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                    aria-pressed={agreedToTerms}
                    className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${agreedToTerms ? 'bg-rose-600 border-rose-600' : 'border-slate-300 hover:border-slate-400 bg-white'}`}
                  >
                    {agreedToTerms && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                  <label className="text-xs font-semibold text-slate-600 leading-tight pt-0.5">
                    I agree to the{" "}
                    <span className="text-slate-900 underline cursor-pointer hover:text-rose-600">Terms</span>
                    {" "}and{" "}
                    <span className="text-slate-900 underline cursor-pointer hover:text-rose-600">Privacy Policy</span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="signup-submit-btn"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm tracking-wide hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : "Create Account"}
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