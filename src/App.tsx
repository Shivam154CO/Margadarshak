import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { motion } from "framer-motion";
import { ReactLenis } from 'lenis/react';

// Styling
import './index.css';

// Context & Providers
import { CollegesProvider } from './context/CollegesContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Shared Components
import ScrollToTop from "./components/ScrollToTop";
import NetworkStatus from "./components/NetworkStatus";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";

// Constants
import { ROUTES } from "./constants/routes";

// Lazy Pages
// Pages
import Landing from "./pages/Landing";
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

const Protected = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <PageTransition>{children}</PageTransition>
  </ProtectedRoute>
);

const AnimatedRoutes = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.HOME} element={<PageTransition><Landing /></PageTransition>} />
        <Route path={ROUTES.SIGNUP} element={<PageTransition><Signup /></PageTransition>} />
        <Route path={ROUTES.LOGIN} element={<PageTransition><Login /></PageTransition>} />
        <Route path={ROUTES.HELP} element={<PageTransition><Help /></PageTransition>} />
        <Route path={ROUTES.COMMUNITY} element={<PageTransition><Community /></PageTransition>} />

        {/* Protected Routes */}
        <Route path={ROUTES.PROFILE} element={<Protected><Profile /></Protected>} />
        <Route path={ROUTES.PROFILE_VIEW} element={<Protected><ProfileView /></Protected>} />
        <Route path={ROUTES.FAVORITES} element={<Protected><Favorites /></Protected>} />
        <Route path={ROUTES.ANALYTICS} element={<Protected><Analytics /></Protected>} />
        <Route path={ROUTES.DASHBOARD} element={<Protected><Dashboard /></Protected>} />
        <Route path={ROUTES.OVERVIEW} element={<Protected><OverviewScreen /></Protected>} />
        <Route path={ROUTES.COLLEGE_DETAILS} element={<Protected><CollegeDetails /></Protected>} />
        <Route path={ROUTES.COLLEGE_MAP} element={<Protected><InteractiveCollegeMap /></Protected>} />
        <Route path={ROUTES.COLLEGE_EXPLORER} element={<Protected><CollegeExplorer /></Protected>} />
        <Route path={ROUTES.COLLEGE_COMPARISON} element={<Protected><CollegeComparison /></Protected>} />
        <Route path={ROUTES.CAP_ROUND_GENERATOR} element={<Protected><CapRoundGenerator /></Protected>} />
        <Route path={ROUTES.DATA_PIPELINE} element={<Protected><DataPipeline /></Protected>} />
        <Route path={ROUTES.SCORECARD_OCR} element={<Protected><ScorecardOcr /></Protected>} />
        <Route path={ROUTES.ADMISSION_TIMELINE} element={<Protected><AdmissionTimeline /></Protected>} />
        <Route path={ROUTES.DOCUMENT_CHECKLIST} element={<Protected><DocumentChecklist /></Protected>} />
        <Route path={ROUTES.SEAT_VACANCY} element={<Protected><SeatVacancy /></Protected>} />
        <Route path={ROUTES.SCHOLARSHIP_FINDER} element={<Protected><ScholarshipFinder /></Protected>} />
        <Route path={ROUTES.CUTOFF_TRENDS} element={<Protected><CutoffTrends /></Protected>} />
        <Route path={ROUTES.POST_ADMISSION} element={<Protected><PostAdmission /></Protected>} />

        {/* 404 */}
        <Route path={ROUTES.NOT_FOUND} element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </ErrorBoundary>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ReactLenis root>
          <CollegesProvider>
            <Router>
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
