import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import './index.css'
import { CollegesProvider } from './context/CollegesContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Components
import ScrollToTop from "./components/ScrollToTop";
import NetworkStatus from "./components/NetworkStatus";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load all pages for maximum performance (Code Splitting)
const Landing = lazy(() => import("./pages/Landing"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const Profile = lazy(() => import("./pages/Profile"));
const ProfileView = lazy(() => import("./pages/ProfileView"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CollegeDetails = lazy(() => import("./pages/CollegeDetails"));
const InteractiveCollegeMap = lazy(() => import("./pages/CollegeMap"));
const CollegeExplorer = lazy(() => import("./pages/CollegeSearch"));
const OverviewScreen = lazy(() => import("./pages/OverviewScreen"));
const CollegeComparison = lazy(() => import("./pages/CollegeComparison"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Help = lazy(() => import("./pages/Help"));
const CapRoundGenerator = lazy(() => import("./pages/CapRoundGenerator"));
const DataPipeline = lazy(() => import("./pages/DataPipeline"));
const ScorecardOcr = lazy(() => import("./pages/ScorecardOcr"));
const Community = lazy(() => import("./pages/Community"));
const AdmissionTimeline = lazy(() => import("./pages/AdmissionTimeline"));
const DocumentChecklist = lazy(() => import("./pages/DocumentChecklist"));
const SeatVacancy = lazy(() => import("./pages/SeatVacancy"));
const ScholarshipFinder = lazy(() => import("./pages/ScholarshipFinder"));
const CutoffTrends = lazy(() => import("./pages/CutoffTrends"));
const PostAdmission = lazy(() => import("./pages/PostAdmission"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Scroll restorer
const ScrollToTopOnRoute = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// Loading spinner
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors" role="status" aria-label="Loading page">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent shadow-md"></div>
    <span className="sr-only">Loading…</span>
  </div>
);

// Page transition wrapper
const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className="w-full min-h-screen flex flex-col"
  >
    {children}
  </motion.div>
);

// Protected page transition wrapper
const Protected = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <PageTransition>{children}</PageTransition>
  </ProtectedRoute>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* ── Public Routes ─────────────────────────────────────── */}
          <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/help" element={<PageTransition><Help /></PageTransition>} />
          <Route path="/community" element={<PageTransition><Community /></PageTransition>} />

          {/* ── Protected Routes ──────────────────────────────────── */}
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/profile-view" element={<Protected><ProfileView /></Protected>} />
          <Route path="/favorites" element={<Protected><Favorites /></Protected>} />
          <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/overview" element={<Protected><OverviewScreen /></Protected>} />
          <Route path="/college-details" element={<Protected><CollegeDetails /></Protected>} />
          <Route path="/college-map" element={<Protected><InteractiveCollegeMap /></Protected>} />
          <Route path="/college-explorer" element={<Protected><CollegeExplorer /></Protected>} />
          <Route path="/compare-college" element={<Protected><CollegeComparison /></Protected>} />
          <Route path="/cap-generator" element={<Protected><CapRoundGenerator /></Protected>} />
          <Route path="/data-pipeline" element={<Protected><DataPipeline /></Protected>} />
          <Route path="/scorecard-ocr" element={<Protected><ScorecardOcr /></Protected>} />
          <Route path="/admission-timeline" element={<Protected><AdmissionTimeline /></Protected>} />
          <Route path="/documents" element={<Protected><DocumentChecklist /></Protected>} />
          <Route path="/seat-vacancy" element={<Protected><SeatVacancy /></Protected>} />
          <Route path="/scholarships" element={<Protected><ScholarshipFinder /></Protected>} />
          <Route path="/cutoff-trends" element={<Protected><CutoffTrends /></Protected>} />
          <Route path="/post-admission" element={<Protected><PostAdmission /></Protected>} />

          {/* ── 404 ───────────────────────────────────────────────── */}
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
};

import { ReactLenis } from 'lenis/react';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ReactLenis root>
          <CollegesProvider>
            <Router>
              {/* Accessibility: Skip to main content */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none"
              >
                Skip to main content
              </a>
              <ScrollToTopOnRoute />
              <NetworkStatus />
              <ScrollToTop />
              <Suspense fallback={<PageLoader />}>
                <main id="main-content">
                  <AnimatedRoutes />
                </main>
              </Suspense>
            </Router>
          </CollegesProvider>
        </ReactLenis>
      </ToastProvider>
    </ThemeProvider>
  );
}
