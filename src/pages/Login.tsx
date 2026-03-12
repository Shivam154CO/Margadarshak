import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Award, Check, Mail, ArrowLeft } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../context/ToastContext";

export default function Login() {
  const navigate = useNavigate();
  const { success, error: toastError, info, warning } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      warning("Missing Fields", "Please fill in your email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) throw error;

      if (data.user) {
        if (rememberMe) {
          localStorage.setItem("user_email", form.email);
        }

        // Check if profile exists in users table
        const { data: existingProfile, error: fetchError } = await supabase
          .from('users')
          .select('name, profile_complete')
          .eq('id', data.user.id)
          .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        if (!existingProfile) {
          // New user — create basic record
          await supabase.from('users').insert([{
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || "",
            profile_complete: false
          }]);
          info("Welcome!", "Please complete your profile to get started.");
          navigate("/profile");
          return;
        }

        if (!existingProfile.profile_complete) {
          info(`Welcome, ${existingProfile.name || data.user.email}!`, "Please complete your profile to continue.");
          navigate("/profile");
        } else {
          success(`Welcome back, ${existingProfile.name || data.user.email}! 🎓`);
          navigate("/dashboard");
        }
      }
    } catch (err: any) {
      const msg = err.message || "An error occurred during sign-in.";
      if (msg.includes("Invalid login credentials")) {
        toastError("Invalid Credentials", "Your email or password is incorrect. Please try again.");
      } else if (msg.includes("Email not confirmed")) {
        toastError("Email Not Verified", "Please check your inbox and verify your email first.");
      } else {
        toastError("Sign In Failed", msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/profile`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      toastError("Google Sign-In Failed", err.message);
    }
  };

  const handleForgotPassword = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      warning("Enter Email", "Please enter your registered email address.");
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/profile`
      });
      if (error) throw error;
      setResetSent(true);
      success("Reset Email Sent!", `Check ${forgotEmail} for the password reset link.`, );
    } catch (err: any) {
      toastError("Reset Failed", err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-4 md:p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl relative z-10"
      >
        <div className="flex flex-col lg:flex-row bg-white/60 backdrop-blur-3xl border border-white/20 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.05)] overflow-hidden min-h-[85vh] md:max-h-[750px]">

          {/* ── Left Panel ──────────────────────────────────────────── */}
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
                  Welcome to <br /> <span className="text-rose-500 italic">The Future.</span>
                </h2>
                <p className="text-white/60 text-sm leading-relaxed font-medium max-w-xs">
                  Join 52,000+ top rankers using AI to predict and secure their dream engineering seats.
                </p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 relative z-10 mt-auto">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] text-white font-bold relative z-${30 - i * 10}`}>
                      <span className="opacity-50">U{i}</span>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-white/80 font-medium">
                  <span className="text-white font-bold">12k+</span> students joined today.
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Right Panel ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:w-3/5 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white/40 backdrop-blur-xl overflow-y-auto"
          >
            <AnimatePresence mode="wait">

              {/* ── Forgot Password view ── */}
              {showForgotPassword ? (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <button
                    onClick={() => { setShowForgotPassword(false); setResetSent(false); setForgotEmail(""); }}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-8 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                  </button>

                  {resetSent ? (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-emerald-600" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 mb-2">Check Your Email</h2>
                      <p className="text-slate-500 text-sm mb-6">
                        We've sent a password reset link to <span className="font-bold text-slate-700">{forgotEmail}</span>.
                        Check your inbox (and spam folder).
                      </p>
                      <button
                        onClick={() => { setShowForgotPassword(false); setResetSent(false); setForgotEmail(""); }}
                        className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all"
                      >
                        Back to Login
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-8">
                        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Forgot Password?</h2>
                        <p className="text-slate-500 text-sm font-medium">Enter your email and we'll send you a reset link.</p>
                      </div>

                      <form onSubmit={handleForgotPassword} className="space-y-5">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Registered Email
                          </label>
                          <input
                            type="email"
                            placeholder="Enter your email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={resetLoading}
                          className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm tracking-wide hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                          {resetLoading ? "Sending..." : "Send Reset Link"}
                        </button>
                      </form>
                    </>
                  )}
                </motion.div>

              ) : (

                /* ── Login view ── */
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-8 md:mb-10">
                    <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Login</h2>
                    <p className="text-slate-500 text-sm font-medium">Welcome back! Please enter your details.</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
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

                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
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
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember me + Forgot Password */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          id="remember-me-toggle"
                          onClick={() => setRememberMe(!rememberMe)}
                          className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${rememberMe ? 'bg-rose-600 border-rose-600' : 'border-slate-300 hover:border-slate-400 bg-white'}`}
                          aria-pressed={rememberMe}
                        >
                          {rememberMe && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <label className="text-xs font-semibold text-slate-600 cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
                          Remember for 30 days
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      id="login-submit-btn"
                      disabled={isLoading}
                      className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm tracking-wide hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Signing in...
                        </span>
                      ) : "Sign In"}
                    </button>
                  </form>

                  <div className="my-6 flex items-center gap-4">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>

                  {/* Social Login */}
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      id="google-login-btn"
                      onClick={handleGoogleLogin}
                      className="w-full bg-white text-slate-700 py-2.5 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                    </button>
                  </div>

                  <p className="text-center text-slate-500 mt-8 text-xs font-semibold">
                    Don't have an account?{" "}
                    <button
                      onClick={() => navigate("/signup")}
                      className="text-rose-600 hover:text-rose-700 font-bold hover:underline transition-all"
                    >
                      Sign up for free
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}