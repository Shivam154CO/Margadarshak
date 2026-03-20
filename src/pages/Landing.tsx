import { useEffect, useRef, useMemo, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, motionValue, useSpring, AnimatePresence } from "framer-motion";
import ScrollAnimationWrapper from "../components/ScrollAnimationWrapper";
import LiveFeatureIcon from "../components/LiveFeatureIcon";
import IkigaiLogo from "../components/IkigaiLogo";
import SEO from "../components/SEO";
import { LiveCastePreview, LiveMatchSimulator, LiveTrendPulse, LiveAIAssistant, LiveDistanceTracker, LiveScholarshipGuide } from "../components/LiveFeatureShowcase";
import Magnetic from "../components/Magnetic";

// Import custom illustrations
import clgImg from "../assets/illustrations/clg.png";

// Lazy load heavy components
const ProblemShowcase = lazy(() => import("../features/landing/components/spatial-product-showcase"));
const DomeGallery = lazy(() => import("../components/DomeGallery"));
const Footer = lazy(() => import("../components/Footer"));

// Loading fallback component
const SectionLoader = () => (
  <div className="w-full h-96 flex items-center justify-center bg-slate-50/50 rounded-[40px] animate-pulse">
    <div className="w-12 h-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin" />
  </div>
);

export default function Landing() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavDark, setIsNavDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of the navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsMobileMenuOpen(false);
    }
  };

  // Scroll-aware navbar: detect when over dark sections
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    // Optimized approach: track which sections are "active" relative to the navbar
    const handleThemeChange = () => {
      const nav = navRef.current;
      if (!nav) return;
      
      const navRect = nav.getBoundingClientRect();
      const navCenter = navRect.top + navRect.height / 2;
      
      const darkSections = document.querySelectorAll('[data-theme="dark"]');
      let overDark = false;
      for (const section of Array.from(darkSections)) {
        const rect = section.getBoundingClientRect();
        if (navCenter >= rect.top && navCenter <= rect.bottom) {
          overDark = true;
          break;
        }
      }
      setIsNavDark(overDark);
    };

    // Debounce the heavy theme check
    let timeoutId: number;
    const debouncedThemeCheck = () => {
      if (timeoutId) window.cancelAnimationFrame(timeoutId);
      timeoutId = window.requestAnimationFrame(handleThemeChange);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', debouncedThemeCheck, { passive: true });
    
    handleScroll();
    handleThemeChange();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', debouncedThemeCheck);
    };
  }, []);
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



  const journeySteps = useMemo(() => [
    { title: "Enter Your Diploma Rank", description: "Share your rank and category details.", icon: "student" as const },
    { title: "Pick Preferred Branches", description: "Select branches you're interested in.", icon: "brain" as const },
    { title: "Get Your College List", description: "Instantly see colleges you can get into.", icon: "chart" as const },
    { title: "Make Informed Choice", description: "Lock your future with confidence.", icon: "trophy" as const },
  ], []);

  const features = useMemo(() => [
    { title: "Caste-Wise Seats", desc: "Instantly see how ranking shifts based on your category and seat availability.", showcase: "caste", badge: "Real-Time" },
    { title: "AI Assistant", desc: "Expert guidance for your legal and technical admission doubts, available 24/7.", showcase: "ai", badge: "AI Powered" },
    { title: "Distance Tracker", desc: "Calculate exact travel times from your home to any college campus in Maharashtra.", showcase: "distance", badge: "Maps API" },
    { title: "Scholarship Guide", desc: "Unlock fee benefits like Post-Matric and TFWS with our automated checklist.", showcase: "scholarship", badge: "Official Data" },
    { title: "Trend Pulse", desc: "Analyze placement statistics and median packages for every college branch.", showcase: "trend", badge: "Live Feed" },
    { title: "Precision Match", desc: "Our neural engine predicts your best college match with 95.7% accuracy.", showcase: "match", badge: "95.7% Accurate" },
  ] as const, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-slate-100 selection:text-slate-900 dark:selection:bg-indigo-800 dark:selection:text-white">
      <SEO
        title="SmartCF | Maharashtra's #1 Engineering Admission Predictor"
        description="Predict your engineering college admission chances with 95.7% accuracy. Diploma to Engineering pathway for Maharashtra students — real-time cutoffs, seat matrix, and AI guidance."
        keywords="engineering admission predictor, Maharashtra diploma, CET cutoff, college finder, seat matrix, placement stats"
      />
      {/* Navigation */}
      <nav ref={navRef} className={`fixed w-full z-[100] transition-all duration-700 ${isScrolled ? 'top-4 md:top-6 px-4 md:px-6' : 'top-0 px-4 md:px-6'}`}>
        <div className={`flex items-center transition-all duration-700 ${isScrolled
          ? 'w-[56px] h-[56px] md:w-[70px] md:h-[70px] justify-center bg-transparent md:bg-white/80 md:backdrop-blur-xl md:rounded-full md:border md:border-white/20 md:shadow-2xl'
          : `mx-auto w-full max-w-7xl h-16 md:h-20 rounded-2xl px-6 md:px-10 justify-between backdrop-blur-2xl ${isNavDark ? 'bg-white/5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]' : 'bg-white/80 border border-slate-100/50 shadow-[0_20px_50px_rgba(0,0,0,0.05)]'}`
          } relative z-50`}> { /* justify-center is used only when scrolled */}
          <IkigaiLogo size={isScrolled ? "sm" : "sm"} showText={!isScrolled} lightText={isNavDark} className={`${isScrolled ? 'scale-75 md:scale-100' : 'scale-100'} transition-all duration-500`} />

          {/* Desktop Menu */}
          <div className={`hidden md:flex items-center gap-12 transition-all duration-500 ${isScrolled ? 'opacity-0 scale-90 pointer-events-none w-0 overflow-hidden' : 'opacity-100 scale-100'}`}>
            {[
              { label: 'Home', id: 'predictor' },
              { label: 'Features', id: 'features' },
              { label: 'Journey', id: 'how-it-works' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`font-semibold text-xs uppercase tracking-[0.2em] transition-colors ${isNavDark ? 'text-white/60 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className={`hidden md:flex items-center gap-8 transition-all duration-500 ${isScrolled ? 'opacity-0 scale-90 pointer-events-none w-0 overflow-hidden' : 'opacity-100 scale-100'}`}>
            <button onClick={() => navigate("/login")} className={`font-extrabold text-xs uppercase tracking-widest hover:opacity-70 transition-all ${isNavDark ? 'text-white' : 'text-slate-900'}`}>Login</button>
            <button onClick={() => navigate("/signup")} className={`px-8 py-3 rounded-xl font-extrabold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95 ${isNavDark ? 'bg-white text-slate-900 hover:bg-white/90' : 'bg-slate-900 text-white hover:bg-black'}`}>Get Started</button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 transition-all duration-500 ${isNavDark ? 'text-white' : 'text-slate-900'} ${isScrolled ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
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
                {[
                  { label: 'Home', id: 'predictor' },
                  { label: 'Features', id: 'features' },
                  { label: 'Journey', id: 'how-it-works' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-left text-slate-600 font-bold text-sm uppercase tracking-widest py-2 border-b border-slate-50"
                  >
                    {item.label}
                  </button>
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
      <section id="predictor" className="relative min-h-screen flex flex-col items-center pt-24 pb-12 md:pt-28 md:pb-20 overflow-hidden bg-[#fafafa]">
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
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full h-auto drop-shadow-[-100px_40px_160px_rgba(0,0,0,0.1)] animate-float scale-100 md:scale-110"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Ribbon - Anchoring the Hero */}
      <section id="colleges" className="relative z-50 -mt-10 mb-12 md:mb-20 px-4 md:px-6">
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

      {/* Problem Section - Spatial Showcase */}
      <Suspense fallback={<SectionLoader />}>
        <ProblemShowcase />
      </Suspense>

      {/* Visual USP - The "Proof" Section (Showing Project Power) */}
      <section className="py-20 md:py-40 px-6 bg-[#080808] relative overflow-hidden" data-theme="dark">
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
            <ScrollAnimationWrapper animation="slideUp" delay={0.3} className="lg:col-span-6">
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

            <ScrollAnimationWrapper animation="slideUp" delay={0.5} className="lg:col-span-6">
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
      <section id="features" className="py-20 md:py-40 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollAnimationWrapper animation="slideUp">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-4xl md:text-7xl font-extrabold text-slate-900 tracking-tighter leading-none mb-4">Powerful Features <br /> <span className="bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent italic text-4xl md:text-7xl">Simple to Use.</span></h2>
            </div>
          </ScrollAnimationWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature: any, idx: number) => (
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
                      {feature.badge}
                    </div>
                  </div>
                </div>
              </ScrollAnimationWrapper>
            ))}
          </div>
        </div>
      </section>      {/* Redesigned Journey Section - Sleek Vertical Pathway */}
      <section id="how-it-works" className="relative bg-slate-950 py-32 md:py-48 overflow-hidden" data-theme="dark">
        {/* Ambient background effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-600/10 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 blur-[150px] rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <ScrollAnimationWrapper animation="slideUp" className="text-center mb-32">
            <div className="inline-flex items-center px-4 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-500 font-extrabold text-[10px] uppercase tracking-[0.5em] mb-6">
              The Protocol
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
              Your Journey <span className="text-rose-600 italic">Redefined.</span>
            </h2>
          </ScrollAnimationWrapper>

          <div className="relative">
            {/* The Central Connective Rail */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-rose-600/0 via-rose-600/40 to-rose-600/0 hidden md:block" />

            <div className="space-y-24 md:space-y-40">
              {journeySteps.map((step: any, index: number) => {
                const isEven = index % 2 === 0;
                return (
                  <ScrollAnimationWrapper 
                    key={index} 
                    animation={isEven ? "slideRight" : "slideLeft"}
                    className={`relative flex flex-col md:flex-row items-center gap-12 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    {/* The Path Node */}
                    <div className="absolute left-8 md:left-1/2 top-0 -translate-x-1/2 z-20 hidden md:flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-slate-950 border-2 border-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.5)]" />
                      <div className="absolute w-8 h-8 rounded-full bg-rose-600/20 animate-ping" />
                    </div>

                    {/* Content Card */}
                    <div className="w-full md:w-[45%] group">
                      <div className="relative p-8 md:p-10 rounded-[30px] bg-white/[0.03] border border-white/10 backdrop-blur-xl transition-all duration-500 hover:border-rose-500/30 hover:bg-white/[0.05] group">
                        {/* Phase Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-rose-500 uppercase tracking-widest mb-6">
                          <span className="w-1 h-1 rounded-full bg-rose-500" />
                          Phase 0{index + 1}
                        </div>

                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight group-hover:text-rose-500 transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-sm md:text-base text-white/40 font-medium leading-relaxed mb-8">
                          {step.description}
                        </p>

                        <div className="flex items-center gap-4 text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
                          <div className="h-px flex-1 bg-white/5" />
                          <span>Initialized</span>
                        </div>
                      </div>
                    </div>

                    {/* Icon Visual */}
                    <div className="w-full md:w-[40%] flex justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-rose-500/10 blur-3xl rounded-full scale-150 group-hover:bg-rose-500/20 transition-all duration-700" />
                        <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white rounded-[24px] md:rounded-[32px] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-700">
                          <LiveFeatureIcon type={step.icon} size={64} />
                        </div>
                      </div>
                    </div>
                  </ScrollAnimationWrapper>
                );
              })}
            </div>
          </div>

          {/* Final Call to Action */}
          <ScrollAnimationWrapper animation="scale" className="mt-40 text-center">
            <div className="p-10 md:p-20 rounded-[40px] md:rounded-[60px] bg-gradient-to-br from-rose-600 to-rose-700 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
              
              <div className="relative z-10 space-y-8">
                <h3 className="text-4xl md:text-5xl font-black tracking-tight leading-none italic uppercase">
                  Ready to <br /> Own Your Future?
                </h3>
                <button 
                  onClick={() => navigate("/signup")}
                  className="px-8 py-4 bg-white text-rose-600 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-slate-900 hover:text-white transition-all transform hover:scale-105 active:scale-95"
                >
                  Start Prediction Protocol →
                </button>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </section>

      {/* Dedicated CET 2026 Launch Section - The "Wow" Experience */}
      <section className="py-20 md:py-40 px-4 md:px-6 relative overflow-hidden bg-white" data-theme="light">
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

                <h2 className="text-5xl md:text-[140px] font-black text-slate-900 tracking-tighter leading-[0.9] md:leading-[0.75]">
                  CET 2026 <br />
                  <span className="italic text-rose-600">Live Soon.</span>
                </h2>

                <p className="text-xl md:text-3xl text-slate-500 font-semibold max-w-4xl mx-auto leading-relaxed">
                  We're re-engineering our precision models for the 2026 Maharashtra diploma engineering prediction cycle.
                  Get ready for the most accurate prediction engine ever built.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10">
                  {[
                    { label: "Predictor", value: "95.7%", sub: "Precision Ready" },
                    { label: "Institutions", value: "340+", sub: "Official Data" },
                    { label: "Status", value: "Optimizing", sub: "Final Testing" }
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-[40px] p-10 group-hover:border-slate-300 transition-colors">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">{stat.label}</div>
                      <div className="text-4xl font-extrabold text-slate-900 mb-2">{stat.value}</div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{stat.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollAnimationWrapper>
          </div>
        </div>
      </section>

      {/* College Campus Showcase - The Dome Gallery */}
      <section className="h-[80vh] w-full relative overflow-hidden bg-slate-950">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-10 text-center pointer-events-none">
          <div className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-extrabold text-[10px] uppercase tracking-[0.4em] mb-4">
            Campus Experience
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
            Explore Your <span className="text-rose-600">Future Campus</span>
          </h2>
        </div>
        <Suspense fallback={<SectionLoader />}>
          <DomeGallery 
            fit={0.8}
            minRadius={600}
            maxVerticalRotationDeg={5}
            segments={34}
            dragDampening={2}
            grayscale={false}
            overlayBlurColor="#020617"
          />
        </Suspense>
      </section>

      {/* Final Simple CTA */}
      <section className="py-20 md:py-40 px-6 text-center bg-[#050505]" data-theme="dark">
        <div className="max-w-4xl mx-auto space-y-10 md:space-y-16">
          <ScrollAnimationWrapper animation="slideUp">
            <h2 className="text-4xl md:text-9xl font-extrabold text-white tracking-tighter leading-[0.85]">
              Secure Your <br /> <span className="italic text-rose-600">Future Today.</span>
            </h2>
            <div className="pt-16 space-y-10">
              <motion.button
                onClick={() => navigate("/signup")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 md:px-24 md:py-8 bg-white text-slate-950 rounded-full font-extrabold text-xl md:text-3xl shadow-3xl hover:bg-rose-600 hover:text-white transition-all"
              >
                Sign Up Now →
              </motion.button>
              <p className="text-white/20 font-extrabold text-xs uppercase tracking-[0.5em]">JOIN 52,000+ DIPLOMA ASPIRANTS</p>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </section>

      {/* Footer */}
      <Suspense fallback={<div className="h-64 bg-slate-950" />}>
        <Footer />
      </Suspense>
    </div>
  );
}

