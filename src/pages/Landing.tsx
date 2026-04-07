import { useEffect, useRef, useMemo, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import IkigaiLogo from "../components/IkigaiLogo";
import { useCollegeData } from "@/features/colleges/hooks/useCollegeData";
import SEO from "../components/SEO";
import Loader from "../components/Loader";

import Hero from "../features/landing/components/Hero";
import StatsRibbon from "../features/landing/components/StatsRibbon";
import VisualUSP from "../features/landing/components/VisualUSP";
import FeaturesGrid from "../features/landing/components/FeaturesGrid";
import Journey from "../features/landing/components/Journey";
import CET2026Section from "../features/landing/components/CET2026Section";
import FinalCTA from "../features/landing/components/FinalCTA";

const ProblemShowcase = lazy(() => import("../features/landing/components/spatial-product-showcase"));
const DomeGallery = lazy(() => import("../components/DomeGallery"));
const Footer = lazy(() => import("../components/Footer"));

// Asset loader moved to a more efficient lazy-load pattern to avoid blocking the main thread
const campusImageGlob = import.meta.glob("../assets/*/campus.png", {
  eager: false, // Set to false to avoid bloating the main bundle
  import: 'default'
}) as Record<string, () => Promise<string>>;

// Efficiently extract codes without loading the assets
const collegeCodesAvailable = Object.keys(campusImageGlob).map(path => {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 2];
});

// Loading fallback component
const SectionLoader = () => (
  <div className="w-full h-96 flex items-center justify-center bg-slate-50/50 rounded-[40px]">
    <Loader />
  </div>
);

export default function Landing() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavDark, setIsNavDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Prefetch college data from cache or network
  const { allColleges } = useCollegeData();

  const domeImages = useMemo(() => {
    // If database is empty, use available local asset codes
    const baseColleges = (!allColleges || allColleges.length === 0)
      ? collegeCodesAvailable.map(code => ({ college_code: code }))
      : allColleges;

    return baseColleges.slice(0, 300).map(college => {
      const code = String(college.college_code).trim();
      const name = "college_name" in college ? college.college_name : `Institute ${code}`;

      // Source Priority: 1. Local assets (placeholder for now) -> 2. Database image URL -> 3. Fallback
      let src = "";
      if ("image" in college && typeof college.image === 'string' && !college.image.includes('N/A')) {
        src = college.image;
      }

      if (!src) {
        src = `https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60`;
      }

      return {
        src,
        alt: `${name} | ${code}`
      };
    });
  }, [allColleges]);

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

    const darkObserver = new IntersectionObserver((entries) => {
      const topIntersecting = entries.find(entry => entry.isIntersecting);
      if (topIntersecting) {
        setIsNavDark(topIntersecting.target.getAttribute('data-theme') === 'dark');
      } else {
        setIsNavDark(false);
      }
    }, {
      rootMargin: '-0px 0px -95% 0px',
      threshold: 0
    });

    const sections = document.querySelectorAll('section[data-theme]');
    sections.forEach(s => darkObserver.observe(s));

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      darkObserver.disconnect();
    };
  }, []);

  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  const heroScrollY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-slate-100 selection:text-slate-900 dark:selection:bg-indigo-800 dark:selection:text-white" ref={sectionRef}>
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
          } relative z-50`}>
          <IkigaiLogo size={isScrolled ? "sm" : "sm"} showText={!isScrolled} lightText={isNavDark} className={`${isScrolled ? 'scale-75 md:scale-100' : 'scale-100'} transition-all duration-500`} />

          {/* Desktop Menu */}
          <div className={`hidden md:flex items-center gap-12 transition-all duration-500 ${isScrolled ? 'opacity-0 scale-90 pointer-events-none w-0 overflow-hidden' : 'opacity-100 scale-100'}`}>
            {[
              { label: 'Home', id: 'predictor' },
              { label: 'Features', id: 'features' },
              { label: 'Colleges', id: 'colleges' },
              { label: 'Gallery', id: 'gallery' },
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
                  { label: 'Gallery', id: 'gallery' },
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

      <Hero heroScrollY={heroScrollY} />
      <StatsRibbon />

      <Suspense fallback={<SectionLoader />}>
        <ProblemShowcase />
      </Suspense>

      <VisualUSP />
      <FeaturesGrid />
      <Journey />
      <CET2026Section />

      {/* Dome Gallery Section */}
      <section id="gallery" data-theme="dark" className="pt-24 pb-0 w-full relative bg-[#080808] flex flex-col">
        <div className="text-center relative z-20 mb-12 px-4">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            Explore Your <span className="text-rose-600 italic">Future Campus</span>
          </h2>
        </div>
        <div className="h-[70vh] w-full relative overflow-hidden">
          <Suspense fallback={<SectionLoader />}>
            <DomeGallery
              fit={0.8}
              images={domeImages}
              minRadius={600}
              maxVerticalRotationDeg={5}
              segments={60}
              dragDampening={2}
              grayscale={false}
              openedImageWidth="min(98vw, 1200px)"
              openedImageHeight="min(90vh, 850px)"
              overlayBlurColor="#080808"
            />
          </Suspense>
        </div>
      </section>

      <FinalCTA />

      <Suspense fallback={<div className="h-64 bg-slate-900" />}>
        <Footer />
      </Suspense>
    </div>
  );
}
