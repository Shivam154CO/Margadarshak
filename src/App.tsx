import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import './index.css'
import { CollegesProvider } from './context/CollegesContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import ScrollToTop from "./components/ScrollToTop";
import NetworkStatus from "./components/NetworkStatus";
import ErrorBoundary from "./components/ErrorBoundary";

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
const NotFound = lazy(() => import("./pages/NotFound"));

// Scroll Restorer component
const ScrollToTopOnRoute = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Simple loading spinner fallback
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors" role="status" aria-label="Loading page">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent shadow-md"></div>
    <span className="sr-only">Loading…</span>
  </div>
);

// Wrapper component for route transitions
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
          <Route path="/profile-view" element={<PageTransition><ProfileView /></PageTransition>} />
          <Route path="/favorites" element={<PageTransition><Favorites /></PageTransition>} />
          <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/overview" element={<PageTransition><OverviewScreen /></PageTransition>} />
          <Route path="/college-details" element={<PageTransition><CollegeDetails /></PageTransition>} />
          <Route path="/college-map" element={<PageTransition><InteractiveCollegeMap /></PageTransition>} />
          <Route path="/college-explorer" element={<PageTransition><CollegeExplorer /></PageTransition>} />
          <Route path="/compare-college" element={<PageTransition><CollegeComparison /></PageTransition>} />
          <Route path="/cap-generator" element={<PageTransition><CapRoundGenerator /></PageTransition>} />
          <Route path="/data-pipeline" element={<PageTransition><DataPipeline /></PageTransition>} />
          <Route path="/scorecard-ocr" element={<PageTransition><ScorecardOcr /></PageTransition>} />
          <Route path="/help" element={<PageTransition><Help /></PageTransition>} />
          <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
};

// Reusable transition wrapper
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

import { ReactLenis } from 'lenis/react';

export default function App() {
  return (
    <ThemeProvider>
      <ReactLenis root>
        <CollegesProvider>
          <Router>
            {/* Accessibility: Skip to main content link */}
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
    </ThemeProvider>
  );
}
