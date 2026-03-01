import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
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

// Simple loading spinner fallback
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-md"></div>
  </div>
);

export default function App() {
  return (
    <CollegesProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile-view" element={<ProfileView />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/overview" element={<OverviewScreen />} />
            <Route path="/college-details" element={<CollegeDetails />} />
            <Route path="/college-map" element={<InteractiveCollegeMap />} />
            <Route path="/college-explorer" element={<CollegeExplorer />} />
            <Route path="/compare-college" element={<CollegeComparison />} />
            <Route path="/cap-generator" element={<CapRoundGenerator />} />
            <Route path="/data-pipeline" element={<DataPipeline />} />
            <Route path="/scorecard-ocr" element={<ScorecardOcr />} />
            <Route path="/help" element={<Help />} />
          </Routes>
        </Suspense>
      </Router>
    </CollegesProvider>
  );
}
