import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './index.css'
import { CollegesProvider } from './context/CollegesContext';
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ProfileView from "./pages/ProfileView";
import Dashboard from "./pages/Dashboard";
import CollegeDetails from "./pages/CollegeDetails";
import InteractiveCollegeMap from "./pages/CollegeMap";
import CollegeExplorer from "./pages/CollegeSearch";
import OverviewScreen from "./pages/OverviewScreen";
import CollegeComparison from "./pages/CollegeComparison";
import Favorites from "./pages/Favorites";
import Analytics from "./pages/Analytics";
import Help from "./pages/Help";

export default function App() {
  return (
    <CollegesProvider>
      <Router>
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
          <Route path="/help" element={<Help />} />
        </Routes>
      </Router>
    </CollegesProvider>
  );
}
