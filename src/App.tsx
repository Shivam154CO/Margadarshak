import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AnimatePresence, motion } from "framer-motion";
import './index.css'
import { CollegesProvider } from './context/CollegesContext';

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

// Simple loading spinner fallback
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-md"></div>
  </div>
);

// Wrapper component for route transitions
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
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
      </Routes>
    </AnimatePresence>
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

export default function App() {
  return (
    <CollegesProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <AnimatedRoutes />
        </Suspense>
      </Router>
    </CollegesProvider>
  );
}
