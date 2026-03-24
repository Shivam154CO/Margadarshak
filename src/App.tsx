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
const Landing = lazy(() => import("./pages/Landing"));
const Signup = lazy(() => import("@/features/auth/Signup"));
const Login = lazy(() => import("@/features/auth/Login"));
const Profile = lazy(() => import("@/features/profile/Profile"));
const ProfileView = lazy(() => import("@/features/profile/ProfileView"));
const Dashboard = lazy(() => import("@/features/dashboard/Dashboard"));
const CollegeDetails = lazy(() => import("@/features/colleges/CollegeDetails"));
const InteractiveCollegeMap = lazy(() => import("@/features/colleges/CollegeMap"));
const CollegeExplorer = lazy(() => import("@/features/colleges/CollegeSearch"));
const OverviewScreen = lazy(() => import("@/features/dashboard/OverviewScreen"));
const CollegeComparison = lazy(() => import("@/features/colleges/CollegeComparison"));
const Favorites = lazy(() => import("@/features/colleges/Favorites"));
const Analytics = lazy(() => import("@/features/dashboard/Analytics"));
const Help = lazy(() => import("@/features/support/Help"));
const CapRoundGenerator = lazy(() => import("@/features/admission/CapRoundGenerator"));
const DataPipeline = lazy(() => import("@/features/tools/DataPipeline"));
const ScorecardOcr = lazy(() => import("@/features/tools/ScorecardOcr"));
const Community = lazy(() => import("@/features/community/Community"));
const AdmissionTimeline = lazy(() => import("@/features/admission/AdmissionTimeline"));
const DocumentChecklist = lazy(() => import("@/features/admission/DocumentChecklist"));
const SeatVacancy = lazy(() => import("@/features/colleges/SeatVacancy"));
const ScholarshipFinder = lazy(() => import("@/features/tools/ScholarshipFinder"));
const CutoffTrends = lazy(() => import("@/features/colleges/CutoffTrends"));
const PostAdmission = lazy(() => import("@/features/admission/PostAdmission"));
const DseOptionForm = lazy(() => import("@/features/admission/DseOptionForm"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Scroll restorer
const ScrollToTopOnRoute = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// Loading spinner - Premium Boot Experience
const PageLoader = () => (
  <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-slate-900 overflow-hidden" role="status" aria-label="Initialising SmartCF">
    <div className="absolute inset-0 bg-[#020617] opacity-50">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 blur-[120px] rounded-full animate-pulse" />
    </div>
    
    <div className="relative z-10 flex flex-col items-center gap-12">
      <div className="relative">
        <div className="absolute -inset-8 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <div className="h-20 w-20 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="h-10 w-10 border-t-2 border-r-2 border-rose-500 rounded-full animate-spin" />
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-white font-black text-2xl tracking-[0.2em] uppercase"
        >
          Smart<span className="text-rose-500">CF</span>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="flex items-center gap-2"
        >
          <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="h-full w-1/2 bg-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.8)]"
            />
          </div>
          <span className="text-[10px] font-black tracking-[0.3em] text-white/30 uppercase">Initialising System</span>
        </motion.div>
      </div>
    </div>
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
        <Route path={ROUTES.DSE_OPTION_FORM} element={<Protected><DseOptionForm /></Protected>} />
        <Route path={ROUTES.PROFILE} element={<Protected><Profile /></Protected>} />
        <Route path={ROUTES.PROFILE_VIEW} element={<Protected><ProfileView /></Protected>} />
        <Route path={ROUTES.FAVORITES} element={<Protected><Favorites /></Protected>} />
        <Route path={ROUTES.ANALYTICS} element={<Protected><Analytics /></Protected>} />
        <Route path={ROUTES.DASHBOARD} element={<Protected><Dashboard /></Protected>} />
        <Route path={ROUTES.OVERVIEW} element={<Protected><OverviewScreen /></Protected>} />
        <Route path={ROUTES.COLLEGE_DETAILS} element={<Protected><CollegeDetails /></Protected>} />
        <Route path={ROUTES.COLLEGE_BY_CODE} element={<Protected><CollegeDetails /></Protected>} />
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
