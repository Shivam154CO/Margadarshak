import { useEffect, useRef, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, motionValue, useSpring, AnimatePresence } from "framer-motion";
import ScrollAnimationWrapper from "../components/ScrollAnimationWrapper";
import LiveFeatureIcon from "../components/LiveFeatureIcon";
import IkigaiLogo from "../components/IkigaiLogo";
import Footer from "../components/Footer";
import { LiveCastePreview, LiveMatchSimulator, LiveTrendPulse, LiveAIAssistant, LiveDistanceTracker, LiveScholarshipGuide } from "../components/LiveFeatureShowcase";
import Magnetic from "../components/Magnetic";

// Import custom illustrations
import clgImg from "../assets/illustrations/clg.png";
import problemOverwhelmed from "../assets/illustrations/problem-overwhelmed.png";
import dataAnalysis from "../assets/illustrations/data-analysis.png";
import problemUncertainty from "../assets/illustrations/problem-uncertainty.png";

export default function Landing() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  // Optimized Animated counters using Framer Motion springs
  const collegesCount = motionValue(0);
  const studentsCount = motionValue(0);
  const accuracyCount = motionValue(0);

  const springConfig = { damping: 30, stiffness: 100 };
  const collegesSpring = useSpring(collegesCount, springConfig);
  const studentsSpring = useSpring(studentsCount, springConfig);
  const accuracySpring = useSpring(accuracyCount, springConfig);

  const collegesDisplay = useTransform(collegesSpring, (v) => Math.floor(v));
  const studentsDisplay = useTransform(studentsSpring, (v) => Math.floor(v).toLocaleString());
  const accuracyDisplay = useTransform(accuracySpring, (v) => v.toFixed(1));

  useEffect(() => {
    collegesCount.set(340);
    studentsCount.set(13600);
    accuracyCount.set(95.7);
  }, []);

  const heroScrollY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);

  const problemRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: problemScrollY } = useScroll({
    target: problemRef,
    offset: ["start end", "end start"]
  });
  const parallax1 = useTransform(problemScrollY, [0, 1], [80, -80]);
  const parallax2 = useTransform(problemScrollY, [0, 1], [-80, 80]);
  const parallax3 = useTransform(problemScrollY, [0, 1], [80, -80]);

  const journeySteps = useMemo(() => [
    { title: "Enter Your Diploma Rank", description: "Share your rank and category details.", icon: "student" as const },
    { title: "Pick Preferred Branches", description: "Select branches you're interested in.", icon: "brain" as const },
    { title: "Get Your College List", description: "Instantly see colleges you can get into.", icon: "chart" as const },
    { title: "Make Informed Choice", description: "Lock your future with confidence.", icon: "trophy" as const },
  ], []);

  const features = useMemo(() => [
    { title: "Caste-Wise Seats", desc: "Instantly see how ranking shifts based on your category and seat availability.", showcase: "caste" },
    { title: "AI Assistant", desc: "Expert guidance for your legal and technical admission doubts, available 24/7.", showcase: "ai" },
    { title: "Distance Tracker", desc: "Calculate exact travel times from your home to any college campus in Maharashtra.", showcase: "distance" },
    { title: "Scholarship Guide", desc: "Unlock fee benefits like Post-Matric and TFWS with our automated checklist.", showcase: "scholarship" },
    { title: "Trend Pulse", desc: "Analyze placement statistics and median packages for every college branch.", showcase: "trend" },
    { title: "Precision Match", desc: "Our neural engine predicts your best college match with 95.7% accuracy.", showcase: "match" },
  ], []);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-slate-100 selection:text-slate-900">
      {/* Navigation */}
      <nav className="fixed w-full z-[100] px-4 py-4 md:px-6 md:py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/80 backdrop-blur-2xl border border-slate-100/50 rounded-2xl px-6 py-4 md:px-10 md:h-20 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative z-50">
          <IkigaiLogo size="sm" showText={true} />

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-12">
            {['Predictor', 'How it Works', 'Colleges'].map(item => (
              <button key={item} className="text-slate-600 font-semibold text-xs uppercase tracking-[0.2em] hover:text-slate-900 transition-colors">{item}</button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate("/login")} className="text-slate-900 font-extrabold text-xs uppercase tracking-widest hover:opacity-70 transition-opacity">Login</button>
            <button onClick={() => navigate("/signup")} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-extrabold text-xs uppercase tracking-widest hover:bg-black hover:scale-105 transition-all shadow-lg active:scale-95">Get Started</button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-900"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-4 right-4 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 md:hidden z-40 flex flex-col gap-6"
            >
              <div className="flex flex-col gap-4">
                {['Predictor', 'How it Works', 'Colleges'].map(item => (
                  <button key={item} className="text-left text-slate-600 font-bold text-sm uppercase tracking-widest py-2 border-b border-slate-50">{item}</button>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                <button onClick={() => navigate("/login")} className="w-full py-3 text-slate-900 font-extrabold text-xs uppercase tracking-widest border border-slate-200 rounded-xl">Login</button>
                <button onClick={() => navigate("/signup")} className="w-full py-3 bg-slate-900 text-white rounded-xl font-extrabold text-xs uppercase tracking-widest shadow-lg">Get Started</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>



      {/* Hero Section - Premium Split-3D Impact (High Overlap) */}
      <section className="relative min-h-screen flex flex-col items-center pt-24 pb-12 md:pt-28 md:pb-20 overflow-hidden bg-[#fafafa]">
        <div className="w-full flex-1 flex flex-col lg:flex-row items-center justify-between">
          {/* Dynamic Background Elements */}
          <div className="absolute top-20 left-1 w-96 h-96 bg-slate-200/50 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-slate-100/50 blur-[200px] rounded-full" />

          <div className="relative z-30 w-full lg:w-3/5 px-6 lg:pl-6">
            <ScrollAnimationWrapper animation="slideRight">
              {/* The Glass Content Card */}
              <div className="bg-white/40 backdrop-blur-2xl border border-slate-200/50 p-6 md:p-14 rounded-[40px] md:rounded-[60px] shadow-[0_40px_100px_rgba(0,0,0,0.03)] relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-slate-100/50 blur-3xl rounded-full" />

                <div className="relative z-10 space-y-8 group-hover:translate-x-2 transition-transform duration-700">
                  <div className="inline-flex items-center px-4 py-2 bg-slate-900/5 rounded-full border border-slate-900/10 text-slate-900 font-extrabold text-[9px] md:text-[10px] uppercase tracking-widest md:tracking-[0.5em] backdrop-blur-md whitespace-nowrap">
                    Maharashtra's #1 Diploma Portal
                  </div>

                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter">
                    Find Your Dream <br />
                    <span className="italic opacity-90 underline decoration-rose-500/30 text-rose-600">Engineering</span> <br />
                    College
                  </h1>

                  <p className="text-base md:text-xl text-slate-500 font-semibold max-w-lg leading-relaxed tracking-tight">
                    Predict your admission chances with <span className="text-slate-900 underline decoration-rose-500/30">95.7% accuracy</span> specifically for Maharashtra diploma students.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-10 pt-4 w-full">
                    <Magnetic>
                      <motion.button
                        onClick={() => navigate("/signup")}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full md:w-auto px-6 py-4 md:px-10 md:py-5 bg-slate-900 text-white rounded-2xl font-extrabold text-lg md:text-xl shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 md:gap-5"
                      >
                        Predict Now <span className="text-xl md:text-2xl text-rose-500">→</span>
                      </motion.button>
                    </Magnetic>
                  </div>
                </div>
              </div>
            </ScrollAnimationWrapper>
          </div>

          {/* The Overlying Asset - Dramatic Side-by-Side Massive Impact */}
          <motion.div
            style={{ y: heroScrollY }}
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative lg:absolute lg:right-[-28%] lg:top-[15%] lg:-translate-y-1/2 w-full lg:w-[82%] z-40 pointer-events-none mt-10 md:mt-20 lg:mt-0"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-rose-500/5 blur-[160px] rounded-full scale-90 group-hover:scale-100 transition-transform duration-1000" />
              <img
                src={clgImg}
                alt="Engineering Success"
                className="w-full h-auto drop-shadow-[-100px_40px_160px_rgba(0,0,0,0.1)] animate-float scale-100 md:scale-110"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Ribbon - Anchoring the Hero */}
      <section className="relative z-50 -mt-10 mb-12 md:mb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto bg-gray-900 rounded-[40px] md:rounded-[60px] p-6 md:p-10 shadow-3xl border border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            <div className="space-y-1">
              <div className="text-3xl md:text-5xl font-extrabold text-rose-600 tracking-tighter">
                <motion.span>{collegesDisplay}</motion.span>+
              </div>
              <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.4em]">Integrated Colleges</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-5xl font-extrabold text-white tracking-tighter">
                <motion.span>{studentsDisplay}</motion.span>+
              </div>
              <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.4em]">Real Time Data</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-5xl font-extrabold text-rose-600 tracking-tighter">
                <motion.span>{accuracyDisplay}</motion.span>%
              </div>
              <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.4em]">Model Precision</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-5xl font-extrabold text-white tracking-tighter">Live</div>
              <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.4em]">Diploma DATA 2026</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section - The Diploma Struggle */}
      <section ref={problemRef} className="py-20 md:py-40 px-6 bg-white relative z-30 overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-24 md:space-y-40">

          {/* Problem 1: Choice Chaos */}
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <ScrollAnimationWrapper animation="slideRight">
              <div className="space-y-10">
                <div className="inline-flex items-center px-4 py-1.5 bg-rose-50 border border-rose-100 rounded-full text-rose-600 font-extrabold text-[10px] uppercase tracking-widest">Problem #01</div>
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[0.85] tracking-tighter">
                  Too Many <br /> <span className="text-rose-600 italic text-4xl md:text-5xl lg:text-7xl">Colleges.</span>
                </h2>
                <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-lg">
                  With over 340 colleges and 2,000+ branches, picking just one is a nightmare for most diploma students.
                </p>
                <div className="flex items-center gap-6 pt-6 underline decoration-rose-100 decoration-4 underline-offset-8">
                  <div className="text-4xl font-extrabold text-slate-900">340+</div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Choice Combinations</div>
                </div>
              </div>
            </ScrollAnimationWrapper>
            <ScrollAnimationWrapper animation="scale">
              <div className="relative p-6 md:p-10 rounded-[60px] overflow-hidden group border border-slate-100 shadow-2xl max-w-lg mx-auto flex justify-center">
                {/* Glass Background Layer - Isolated to prevent blur */}
                <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl z-0" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-100/40 blur-3xl rounded-full z-0" />

                {/* Image Content - Above glass layer */}
                <div className="relative z-10 flex justify-center py-4">
                  <motion.img
                    style={{ y: parallax1 }}
                    src={problemOverwhelmed}
                    alt="Too Many Choices"
                    className="w-full h-auto rounded-[30px] shadow-lg transform transition-transform duration-700"
                  />
                </div>
              </div>
            </ScrollAnimationWrapper>
          </div>

          {/* Problem 2: Data Overload */}
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <ScrollAnimationWrapper animation="scale" className="order-2 lg:order-1">
              <div className="relative p-6 md:p-10 rounded-[60px] overflow-hidden group border border-slate-100 shadow-2xl max-w-lg mx-auto flex justify-center">
                {/* Glass Background Layer */}
                <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl z-0" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-slate-100/60 blur-3xl rounded-full z-0" />

                {/* Image Content */}
                <div className="relative z-10 flex justify-center py-4">
                  <motion.img
                    style={{ y: parallax2 }}
                    src={dataAnalysis}
                    alt="Complex Cutoffs"
                    className="w-full h-auto rounded-[30px] shadow-lg transform transition-transform duration-700"
                  />
                </div>
              </div>
            </ScrollAnimationWrapper>
            <ScrollAnimationWrapper animation="slideLeft" className="order-1 lg:order-2">
              <div className="space-y-10">
                <div className="inline-flex items-center px-4 py-1.5 bg-rose-50 border border-rose-100 rounded-full text-rose-600 font-extrabold text-[10px] uppercase tracking-widest">Problem #02</div>
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[0.85] tracking-tighter">
                  Complex <br /> <span className="text-rose-600 italic text-4xl md:text-5xl lg:text-7xl">Data Overload.</span>
                </h2>
                <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-lg">
                  Searching through hundreds of pages of PDF cutoffs manually is slow, boring, and leads to mistakes.
                </p>
                <div className="flex items-center gap-6 pt-6 underline decoration-rose-100 decoration-4 underline-offset-8">
                  <div className="text-4xl font-extrabold text-slate-900">500+</div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Pages of Raw Data</div>
                </div>
              </div>
            </ScrollAnimationWrapper>
          </div>

          {/* Problem 3: Uncertain Trends */}
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <ScrollAnimationWrapper animation="slideRight">
              <div className="space-y-10">
                <div className="inline-flex items-center px-4 py-1.5 bg-rose-50 border border-rose-100 rounded-full text-rose-600 font-extrabold text-[10px] uppercase tracking-widest">Problem #03</div>
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[0.85] tracking-tighter">
                  Uncertain <br /> <span className="text-rose-600 italic text-4xl md:text-5xl lg:text-7xl">Yearly Changes.</span>
                </h2>
                <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-lg">
                  Cutoffs change every year. Relying on old ranks is risky and can lead to you losing your dream seat.
                </p>
                <div className="flex items-center gap-6 pt-6 underline decoration-rose-100 decoration-4 underline-offset-8">
                  <div className="text-4xl font-extrabold text-slate-900">20%</div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Average Yearly Shift</div>
                </div>
              </div>
            </ScrollAnimationWrapper>
            <ScrollAnimationWrapper animation="scale">
              <div className="relative p-6 md:p-10 rounded-[60px] overflow-hidden group border border-slate-100 shadow-2xl max-w-lg mx-auto flex justify-center">
                {/* Glass Background Layer */}
                <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl z-0" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-rose-500/10 blur-3xl rounded-full z-0" />

                {/* Image Content */}
                <div className="relative z-10 flex justify-center py-4">
                  <motion.img
                    style={{ y: parallax3 }}
                    src={problemUncertainty}
                    alt="Uncertain Trends"
                    className="w-full h-auto rounded-[30px] shadow-lg transform transition-transform duration-700"
                  />
                </div>
              </div>
            </ScrollAnimationWrapper>
          </div>

        </div>
      </section>

      {/* Visual USP - The "Proof" Section (Showing Project Power) */}
      <section className="py-20 md:py-40 px-6 bg-[#080808] relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-rose-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-500/10 blur-[150px] rounded-full" />

        <div className="max-w-7xl mx-auto">
          <ScrollAnimationWrapper animation="slideUp" className="text-center mb-32">
            <div className="inline-flex items-center px-4 py-1.5 bg-rose-900/5 border border-rose-900/10 rounded-full text-rose-600 font-extrabold text-[10px] uppercase tracking-[0.4em] mb-8">
              Why SmartCF Dominates
            </div>
            <h2 className="text-4xl md:text-8xl font-black text-white/95 tracking-tighter leading-none mb-8">
              Precision Powered by <br />
              <span className="bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent italic">Real Data.</span>
            </h2>
          </ScrollAnimationWrapper>

          <div className="grid lg:grid-cols-12 gap-10">
            {/* Visual 1: Branch-Wise Precision Mockup */}
            <ScrollAnimationWrapper animation="scale" className="lg:col-span-6">
              <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-3xl border border-white/10 rounded-[40px] md:rounded-[60px] p-6 md:p-14 h-full relative group overflow-hidden">
                <div className="relative z-10 space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-4xl font-extrabold text-white tracking-tight">Branch-Wise <br /> Performance.</h3>
                    <p className="text-lg text-white/60 font-medium leading-relaxed">
                      Compare Computer, IT, and Mechanical cutoffs across all 340+ colleges instantly. No more manual PDF hunting.
                    </p>
                  </div>

                  {/* Mockup UI Component - Branch List */}
                  <div className="bg-white/5 rounded-[30px] md:rounded-[40px] border border-white/10 p-5 md:p-8 space-y-6 shadow-2xl group-hover:translate-y-[-10px] transition-transform duration-700">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <div className="text-xs font-black text-white px-3 py-1 bg-white/10 rounded-md uppercase tracking-widest">COEP, Pune</div>
                      <div className="text-[10px] font-black text-rose-500 tracking-[0.2em] uppercase">Smart Match</div>
                    </div>
                    {[
                      { b: "Computer Engineering", p: "99.2%" },
                      { b: "Information Technology", p: "98.5%" },
                      { b: "Mechanical Engineering", p: "94.2%" }
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-white/60">{item.b}</span>
                          <span className="text-white">{item.p}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: item.p }}
                            transition={{ duration: 1, delay: i * 0.2 }}
                            className="h-full bg-rose-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollAnimationWrapper>

            {/* Visual 2: Detailed Seat Matrix - Caste-Wise */}
            <ScrollAnimationWrapper animation="scale" delay={0.2} className="lg:col-span-6">
              <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-3xl border border-white/10 rounded-[40px] md:rounded-[60px] p-6 md:p-14 h-full relative group overflow-hidden">
                <div className="relative z-10 space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-4xl font-extrabold text-white tracking-tight">Category-Wise <br /> Seat Matrix.</h3>
                    <p className="text-lg text-white/60 font-medium leading-relaxed">
                      Deep-dive into specific seat distribution for <span className="text-white">GOPEN, GSC, GOBC, and EWS</span> categories for every branch.
                    </p>
                  </div>

                  {/* Mockup UI Component - High-Fidelity Seat Matrix */}
                  <div className="bg-[#0a0a0a] rounded-[30px] md:rounded-[40px] border border-white/10 p-5 md:p-8 space-y-6 shadow-2xl group-hover:translate-y-[-10px] transition-transform duration-700">
                    <div className="grid grid-cols-2 gap-3 pb-2">
                      {[
                        { label: 'GOPEN', count: 2, color: 'bg-rose-500', p: '22%' },
                        { label: 'GSC', count: 1, color: 'bg-rose-400', p: '11%' },
                        { label: 'GOBC', count: 1, color: 'bg-orange-400', p: '11%' },
                        { label: 'EWS', count: 2, color: 'bg-rose-600', p: '22%' },
                      ].map((item, i) => (
                        <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-black text-white/40 tracking-widest">{item.label}</span>
                            <span className="text-[10px] font-black text-white">{item.count}</span>
                          </div>
                          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: item.p }}
                              className={`h-full ${item.color}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimationWrapper>

            {/* Visual 3: Exact Accuracy Proof (The 2026 Standard) */}
            <ScrollAnimationWrapper animation="scale" delay={0.2} className="lg:col-span-4">
              <div className="bg-rose-900 rounded-[40px] md:rounded-[60px] p-8 md:p-16 h-full flex flex-col justify-between text-white relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-3xl rounded-full" />
                <div className="relative z-10 space-y-6">
                  <h3 className="text-4xl font-black tracking-tight leading-none">The 2026 <br /> Standard.</h3>
                  <div className="text-7xl md:text-[150px] font-black tracking-tighter leading-none opacity-20 group-hover:opacity-100 transition-opacity duration-700">95.7%</div>
                  <p className="text-lg font-bold text-white/80">Prediction precision that eliminates the "Maybe" from your admission journey.</p>
                </div>
              </div>
            </ScrollAnimationWrapper>

            {/* Row 2: Advanced Feature Blocks */}
            <ScrollAnimationWrapper animation="slideUp" delay={0.3} className="lg:col-span-4">
              <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-3xl border border-white/10 rounded-[40px] md:rounded-[60px] p-8 md:p-12 h-full relative group">
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center border border-rose-500/30">
                    <LiveFeatureIcon type="brain" size={44} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">AI Virtual Assistance.</h3>
                  <p className="text-white/60 text-sm leading-relaxed">24/7 dedicated AI support to answer every legal, process, or technical doubt about your admission.</p>
                </div>
              </div>
            </ScrollAnimationWrapper>

            <ScrollAnimationWrapper animation="slideUp" delay={0.4} className="lg:col-span-4">
              <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-3xl border border-white/10 rounded-[40px] md:rounded-[60px] p-8 md:p-12 h-full relative group">
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    <LiveFeatureIcon type="target" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Distance Tracker.</h3>
                  <p className="text-white/60 text-sm leading-relaxed">Calculate the exact distance and travel time from your doorstep to every potential college campus.</p>
                </div>
              </div>
            </ScrollAnimationWrapper>

            <ScrollAnimationWrapper animation="slideUp" delay={0.5} className="lg:col-span-4">
              <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-3xl border border-white/10 rounded-[40px] md:rounded-[60px] p-8 md:p-12 h-full relative group">
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    <LiveFeatureIcon type="chart" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Placement Stats.</h3>
                  <p className="text-white/60 text-sm leading-relaxed">Access real-time placement data, average packages, and top recruiter lists for every college branch.</p>
                </div>
              </div>
            </ScrollAnimationWrapper>
          </div>
        </div>
      </section>

      {/* Simplified Features Section */}
      <section className="py-20 md:py-40 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollAnimationWrapper animation="slideUp">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-4xl md:text-7xl font-extrabold text-slate-900 tracking-tighter leading-none mb-4">Powerful Features <br /> <span className="bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent italic text-4xl md:text-7xl">Simple to Use.</span></h2>
            </div>
          </ScrollAnimationWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <ScrollAnimationWrapper key={idx} animation="scale" delay={idx * 0.05}>
                <div className="group bg-gradient-to-br from-white to-slate-50/50 rounded-[50px] p-8 border border-slate-100 hover:border-rose-100 shadow-sm hover:shadow-[0_20px_50px_rgba(225,29,72,0.06)] transition-all duration-700 h-full flex flex-col items-center text-center space-y-6">

                  {/* Feature Showcase Simulation - Visual on Top */}
                  <div className="w-full">
                    <div className="bg-white/40 rounded-[35px] p-2 border border-white/60 overflow-hidden shadow-inner flex justify-center items-center h-[220px]">
                      <div className="scale-[0.7] origin-center w-full flex justify-center">
                        {feature.showcase === "caste" && <LiveCastePreview />}
                        {feature.showcase === "ai" && <LiveAIAssistant />}
                        {feature.showcase === "distance" && <LiveDistanceTracker />}
                        {feature.showcase === "scholarship" && <LiveScholarshipGuide />}
                        {feature.showcase === "trend" && <LiveTrendPulse />}
                        {feature.showcase === "match" && <LiveMatchSimulator />}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-rose-600 transition-colors uppercase">{feature.title}</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[220px] mx-auto opacity-80">{feature.desc}</p>
                  </div>

                  <div className="mt-auto pt-2">
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] bg-rose-50/50 px-3 py-1 rounded-full border border-rose-100/50">
                      <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                      Live Feed
                    </div>
                  </div>
                </div>
              </ScrollAnimationWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic 3D Depth Journey */}
      <section ref={sectionRef} className="relative h-[500vh] bg-[#050505]">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">

          {/* Tunnel Atmosphere */}
          <div className="absolute inset-0 z-0">
            {/* Dynamic Light Streaks */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent blur-xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-rose-500/20 to-transparent blur-xl" />

            {/* Deep Field Glows */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-rose-900/10 blur-[150px] rounded-full"
            />
            <motion.div
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-900/10 blur-[150px] rounded-full"
            />
          </div>

          {/* Heading - Floating in Deep Space */}
          <motion.div
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]),
              scale: useTransform(scrollYProgress, [0, 0.1], [1, 0.8]),
              y: useTransform(scrollYProgress, [0, 0.1], [0, -100])
            }}
            className="absolute top-24 text-center z-50 w-full px-4"
          >
            <h2 className="text-4xl md:text-7xl font-black text-white tracking-widest uppercase italic">Your Journey <br /> <span className="text-rose-600 not-italic">Starts Now.</span></h2>
            <p className="text-[10px] text-white/30 font-black tracking-[1em] mt-4 uppercase">Scroll to enter the dimension</p>
          </motion.div>

          {/* 3D Steps Stack */}
          <div className="relative w-full max-w-4xl h-[600px] flex items-center justify-center perspective-[2000px]">
            {journeySteps.map((step, index) => {
              const start = index * 0.22;
              const end = start + 0.35;

              const scale = useTransform(scrollYProgress, [start, start + 0.15, end], [0, 1, 3]);
              const opacity = useTransform(scrollYProgress, [start, start + 0.05, start + 0.25, end], [0, 1, 1, 0]);
              const z = useTransform(scrollYProgress, [start, end], [-1000, 1000]);
              const blur = useTransform(scrollYProgress, [start, start + 0.05, start + 0.25, end], ["12px", "0px", "0px", "20px"]);
              const rotateX = useTransform(scrollYProgress, [start, end], [20, -20]);

              return (
                <motion.div
                  key={index}
                  style={{ scale, opacity, z, filter: `blur(${blur})`, rotateX }}
                  className="absolute w-full max-w-[90vw] md:max-w-lg px-4"
                >
                  <div className="relative group p-8 md:p-12 rounded-[50px] md:rounded-[80px] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden">
                    {/* Animated Border Glow */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />

                    <div className="flex flex-col items-center text-center space-y-10">
                      <motion.div
                        initial={{ rotate: -10 }}
                        animate={{ rotate: 10 }}
                        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                        className="w-32 h-32 rounded-[45px] bg-white flex items-center justify-center shadow-[0_20px_60px_rgba(225,29,72,0.2)]"
                      >
                        <LiveFeatureIcon type={step.icon} size={64} />
                      </motion.div>

                      <div className="space-y-4">
                        <div className="inline-block px-4 py-1 bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full mb-2 shadow-lg">Step 0{index + 1}</div>
                        <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">{step.title}</h3>
                        <p className="text-lg text-white/50 font-medium leading-relaxed max-w-sm mx-auto">{step.description}</p>
                      </div>

                      {/* Progress Indicator */}
                      <div className="flex gap-2 justify-center">
                        {[0, 1, 2, 3].map(i => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === index ? 'bg-rose-500 w-6' : 'bg-white/10'} transition-all duration-300`} />
                        ))}
                      </div>
                    </div>

                    {/* Background Index Number */}
                    <span className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 text-[100px] md:text-[180px] font-black text-white/[0.03] select-none pointer-events-none">0{index + 1}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Depth UI - Side Trackers */}
          <div className="absolute left-10 md:left-20 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-8 opacity-40">
            <div className="h-64 w-[1px] bg-gradient-to-b from-transparent via-rose-500 to-transparent" />
            <div className="text-[10px] font-black text-rose-500 uppercase vertical-text tracking-[1em]">Scanning Dimension</div>
          </div>
          <div className="absolute right-10 md:right-20 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-8 opacity-40">
            <div className="text-[10px] font-black text-white uppercase vertical-text tracking-[1em]">Trajectory Ready</div>
            <div className="h-64 w-[1px] bg-gradient-to-b from-transparent via-white to-transparent" />
          </div>

          {/* Goal Glimmer at the end */}
          <motion.div
            style={{
              opacity: useTransform(scrollYProgress, [0.85, 0.95], [0, 1]),
              scale: useTransform(scrollYProgress, [0.85, 0.95], [0.5, 1])
            }}
            className="absolute z-10 text-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-rose-500 blur-[100px] rounded-full opacity-50" />
              <h4 className="relative text-3xl font-black text-white uppercase tracking-[0.5em]">Goal Reached</h4>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dedicated CET 2026 Launch Section - The "Wow" Experience */}
      <section className="py-20 md:py-40 px-4 md:px-6 relative overflow-hidden bg-[#0a0a0a]">
        {/* Massive Ambient Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-rose-500/5 blur-[200px] rounded-full" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[60px] md:rounded-[100px] p-8 md:p-32 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <ScrollAnimationWrapper animation="scale">
              <div className="space-y-16">
                <div className="inline-flex items-center px-8 py-3 bg-rose-600 rounded-full text-white font-extrabold text-xs uppercase tracking-[0.6em] shadow-[0_0_40px_rgba(225,29,72,0.2)]">
                  The Next Generation
                </div>

                <h2 className="text-5xl md:text-[140px] font-black text-white tracking-tighter leading-[0.9] md:leading-[0.75] drop-shadow-3xl">
                  CET 2026 <br />
                  <span className="italic text-rose-600">Live Soon.</span>
                </h2>

                <p className="text-xl md:text-3xl text-white/70 font-semibold max-w-4xl mx-auto leading-relaxed">
                  We're re-engineering our precision models for the 2026 Maharashtra diploma engineeering prediction cycle.
                  Get ready for the most accurate prediction engine ever built.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10">
                  {[
                    { label: "Predictor", value: "95.7%", sub: "Precision Ready" },
                    { label: "Institutions", value: "340+", sub: "Official Data" },
                    { label: "Status", value: "Optimizing", sub: "Final Testing" }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-[40px] p-10 group-hover:border-white/20 transition-colors">
                      <div className="text-[10px] font-extrabold text-white/40 uppercase tracking-widest mb-4">{stat.label}</div>
                      <div className="text-4xl font-extrabold text-white mb-2">{stat.value}</div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{stat.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollAnimationWrapper>
          </div>
        </div>
      </section>

      {/* Final Simple CTA */}
      <section className="py-20 md:py-40 px-6 text-center bg-white">
        <div className="max-w-4xl mx-auto space-y-10 md:space-y-16">
          <ScrollAnimationWrapper animation="slideUp">
            <h2 className="text-4xl md:text-9xl font-extrabold text-slate-900 tracking-tighter leading-[0.85]">
              Secure Your <br /> <span className="italic text-rose-600">Future Today.</span>
            </h2>
            <div className="pt-16 space-y-10">
              <motion.button
                onClick={() => navigate("/signup")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 md:px-24 md:py-8 bg-slate-900 text-white rounded-full font-extrabold text-xl md:text-3xl shadow-3xl hover:bg-rose-700 transition-all"
              >
                Sign Up Now →
              </motion.button>
              <p className="text-slate-400 font-extrabold text-xs uppercase tracking-[0.5em]">JOIN 52,000+ DIPLOMA ASPIRANTS</p>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
