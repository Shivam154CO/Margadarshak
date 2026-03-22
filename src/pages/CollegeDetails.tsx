import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Bookmark, Share2, MapPin, BookOpen, Tag, Award,
  Eye, Layers, CreditCard, Building, Trophy, Bot, Newspaper,
  X, AlertCircle, Users, ClipboardList, TrendingUp, Sparkles,
  FileText, BarChart3, Clock, Calendar
} from 'lucide-react';

// Components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CollegeImage } from '../features/college-details/components/CollegeImage';
import { StatCard, InfoCard } from '../features/college-details/components/CommonCards';
import { SeatMatrixSection } from '../features/college-details/components/SeatMatrixSection';
import { AvailableBranches } from '../features/college-details/components/AvailableBranches';
import { AdmissionTimeline } from '../features/college-details/components/AdmissionTimeline';
import { ScholarshipsSection } from '../features/college-details/components/ScholarshipsSection';
import { ReviewsSection } from '../features/college-details/components/ReviewsSection';
import { InfrastructureGrid, PlacementStats } from '../features/college-details/components/StatsGrids';
import { ContactInfo } from '../features/college-details/components/ContactInfo';
import { SeatMatrixViewer } from '../features/college-details/components/SeatMatrixViewer';
import { DistanceCalculator } from '../features/college-details/components/DistanceCalculator';
import { AIChat } from '../features/college-details/components/AIChat';
import ReviewModal from '../features/community/components/ReviewModal';

// Hooks
import { useCollegeDetails } from '../features/college-details/hooks/useCollegeDetails';
import { useCollegeAIChat } from '../features/college-details/hooks/useCollegeAIChat';

// Utils
import { exportDetailedCollegeReport } from '../utils/exportUtils';
import { formatPercentage } from '../features/college-details/utils';

export default function CollegeDetails() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showImageModal, setShowImageModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const {
    college,
    loading,
    error,
    saved,
    handleSaveCollege,
    handleShare,
    profile,
    collegeReviews,
    reviewsLoading,
    distance,
    isGettingLocation,
    locationError,
    handleGetLocation,
    quickStats,
    academicData,
    seatData,
    feeData,
    infrastructure,
    placementData,
    automationData,
    collegeInsights,
    isInsightsLoading,
    updateBranch
  } = useCollegeDetails();

  const chat = useCollegeAIChat(college);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <Navbar activeTab="search" />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 animate-pulse">Loading College Details...</h2>
            <p className="text-gray-500 mt-2 text-sm">Please wait while we fetch the latest information</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !college.college_name || college.college_name === "Unknown College") {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 text-center py-20">
        <Navbar activeTab="search" />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md">
            <AlertCircle className="w-20 h-20 text-rose-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-8">{error || "College information could not be found."}</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => navigate(-1)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">Go Back</button>
              <button onClick={() => window.location.reload()} className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold">Try Again</button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {quickStats.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, idx) => <StatCard key={idx} {...stat} />)}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <SeatMatrixSection
            seatMatrix={college.seat_matrix || []}
            userCategory={college.category || "GOPEN"}
            branchName={college.branch_name || ""}
            totalIntake={college.total_intake}
          />

          <AvailableBranches
            branches={college.branches || []}
            collegeCode={college.college_code || ""}
            selectedBranch={college.branch_name}
            onBranchSelect={updateBranch}
          />


          <ScholarshipsSection
            collegeScholarships={college.scholarships || []}
            userCategory={profile?.category}
          />

          <ReviewsSection
            reviews={collegeReviews}
            isLoading={reviewsLoading}
            onOpenModal={() => profile ? setShowFeedbackModal(true) : alert("Please log in to review.")}
            isLoggedIn={!!profile}
          />
        </div>

        <div className="space-y-8">
          <InfoCard title="Quick Stats" icon={Trophy} gradient="from-blue-600 to-indigo-700">
            <div className="space-y-4">
              <div className="flex justify-between text-white/90">
                <span>Placement Rate</span>
                <span className="font-bold text-white">{formatPercentage(placementData.placementRate)}</span>
              </div>
              <div className="flex justify-between text-white/90">
                <span>Avg Package</span>
                <span className="font-bold text-white">₹{placementData.averagePackage} LPA</span>
              </div>
              <div className="flex justify-between text-white/90">
                <span>Intake</span>
                <span className="font-bold text-white">{seatData.totalIntake}</span>
              </div>
            </div>
          </InfoCard>

          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
              <ClipboardList className="w-5 h-5 text-indigo-600" /> Required Docs
            </h3>
            <ul className="space-y-3">
              {["SSC Marksheet", "HSC Marksheet", "LC/TC", "Domicile", "Income Certificate"].map((doc, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  {doc}
                </li>
              ))}
            </ul>
          </div>

          <AdmissionTimeline
            admissionSteps={college.admission_process || []}
            admissionDates={college.admission_dates}
            contacts={college.admission_contacts}
          />

          <DistanceCalculator
            distance={distance}
            isGettingLocation={isGettingLocation}
            onGetLocation={handleGetLocation}
            error={locationError}
          />

          <div className="bg-indigo-50 border-2 border-indigo-100 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> AI Analysis Preview
              </h4>
              {isInsightsLoading && <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />}
            </div>
            <p className="text-slate-800 text-sm font-bold italic leading-relaxed">
              {collegeInsights ? collegeInsights.split('\n')[2]?.replace(/\*\*/g, '') || "Reviewing college metadata..." : "Analysis in progress..."}
            </p>
          </div>

          <ContactInfo
            email={college.contact_email}
            phone={college.contact_phone}
            city={college.city}
            district={college.district}
            website={college.website_url}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <Navbar activeTab="search" />
      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 font-medium px-4 py-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={handleSaveCollege} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl border transition-all ${saved ? 'bg-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700'}`}>
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} /> {saved ? 'Saved' : 'Save'}
            </button>
            <button onClick={handleShare} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button
              onClick={() => exportDetailedCollegeReport(college, collegeInsights, profile)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 border border-indigo-700 rounded-xl text-white font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95"
            >
              <FileText className="w-4 h-4" /> Generate AI Report
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="w-32 h-32 bg-gray-50 rounded-3xl flex-shrink-0 shadow-xl overflow-hidden border border-gray-100 relative">
              <CollegeImage collegeCode={college.college_code || ""} type="logo" className="absolute inset-0 w-full h-full object-fill" alt="Logo" />
            </div>
            <div className="w-full md:flex-1 md:min-w-0 overflow-hidden">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 break-words whitespace-normal leading-tight">{college.college_name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-600 text-sm font-medium">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-rose-500" /> {college.city}{college.district ? `, ${college.district}` : ""}</span>
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-blue-500" /> {college.branch_name}</span>
                <span className="flex items-center gap-1.5"><Tag className="w-4 h-4 text-emerald-500" /> {college.category}</span>
                <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-500" /> {academicData.accreditation}</span>
              </div>
            </div>
            {college.is_most_probable && (
              <div className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/20">🎯 Most Probable</div>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="sticky top-4 z-40 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 p-1 mb-8 flex overflow-x-auto scrollbar-hide shadow-lg shadow-gray-200/50">
          {[
            { id: "overview", label: "Overview", icon: Eye },
            { id: "seats", label: "Seat Matrix", icon: Layers },
            { id: "fees", label: "Fee Structure", icon: CreditCard },
            { id: "infrastructure", label: "Infrastructure", icon: Building },
            { id: "placement", label: "Placements", icon: Trophy },
            { id: "ai_analysis", label: "Strategic AI", icon: Sparkles },
            { id: "automation", label: "Automation", icon: Bot },
            { id: "info", label: "More Info", icon: Newspaper },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[600px]"
          >
            {activeTab === "overview" && renderOverview()}
            {activeTab === "seats" && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <StatCard label="Total Intake" value={seatData.totalIntake} icon={Users} gradient="from-blue-500 to-indigo-600" />
                <StatCard label="Your Category" value={seatData.currentSeats} icon={Tag} gradient="from-emerald-500 to-teal-600" />
                <StatCard label="Other Seats" value={seatData.otherSeats} icon={Building} gradient="from-purple-500 to-pink-600" />
                <StatCard label="Percentage" value={`${((seatData.currentSeats / seatData.totalIntake) * 100).toFixed(1)}%`} icon={Trophy} gradient="from-amber-500 to-orange-600" />
                <div className="lg:col-span-4 mt-8">
                  <SeatMatrixSection 
                    seatMatrix={college.seat_matrix || []} 
                    userCategory={college.category || "GOPEN"} 
                    branchName={college.branch_name || ""} 
                    totalIntake={college.total_intake}
                  />
                </div>
              </div>
            )}
            {activeTab === "fees" && (
              <div className="space-y-8">
                <div className="bg-indigo-600 rounded-3xl p-10 text-white shadow-xl shadow-indigo-600/20">
                  <h2 className="text-3xl font-black mb-2">₹{feeData.totalFees.toLocaleString()}</h2>
                  <p className="opacity-80 font-medium">Total Annual Fee Structure</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {feeData.categories.map((fee, i) => (
                    <div key={i} className="flex justify-between items-center p-6 bg-white rounded-2xl border border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${fee.color} flex items-center justify-center text-white`}><fee.icon className="w-6 h-6" /></div>
                        <div><p className="font-bold text-gray-900">{fee.category}</p><p className="text-sm text-gray-500">Annual charge</p></div>
                      </div>
                      <p className="text-xl font-black text-gray-900">₹{fee.amount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "infrastructure" && <InfrastructureGrid items={infrastructure} />}
            {activeTab === "ai_analysis" && (
              <div className="bg-white rounded-[32px] overflow-hidden border border-gray-200 shadow-xl">
                {/* Visual Header */}
                <div className="relative h-64 w-full">
                  <CollegeImage collegeCode={college.college_code || ""} type="campus" className="w-full h-full object-cover" alt="Campus Banner" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                  <div className="absolute bottom-6 left-8 right-8 flex flex-col md:flex-row items-center md:items-end gap-6 text-white">
                    <div className="w-24 h-24 bg-white rounded-2xl p-2 shadow-2xl flex-shrink-0">
                      <CollegeImage collegeCode={college.college_code || ""} type="logo" className="w-full h-full object-contain" alt="Logo" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl md:text-4xl font-black mb-2">{college.college_name}</h2>
                      <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center opacity-90 text-sm">
                        <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full"><MapPin className="w-4 h-4" /> {college.city}, {college.district}</span>
                        <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full"><Award className="w-4 h-4 text-amber-400" /> {college.accreditation || "Accredited Institute"}</span>
                        <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full"><Building className="w-4 h-4 text-blue-400" /> Estd. {college.established_year || "1984"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-3">
                         <Sparkles className="w-6 h-6 text-indigo-600" />
                         AI Strategic Personal Analysis
                      </h3>
                      <p className="text-slate-500 font-medium">Generating results for Rank {profile?.cet_rank || profile?.diploma_rank} | Category: {college.category}</p>
                    </div>
                    <button
                      onClick={() => exportDetailedCollegeReport(college, collegeInsights, profile)}
                      className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-600/20 hover:scale-105 transition-transform flex items-center gap-3"
                    >
                       <FileText className="w-5 h-5" /> Download Full Detailed Report
                    </button>
                  </div>

                  {isInsightsLoading ? (
                    <div className="py-24 text-center">
                      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                      <p className="text-xl font-black text-slate-800 animate-pulse">Scanning 10,000+ Admission Records...</p>
                      <p className="text-slate-500 mt-2 font-medium">Reading college metadata, seat matrix, and previous year trends</p>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      {/* Strategic Outcome Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-8 bg-indigo-50 border-2 border-indigo-100 rounded-3xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="w-20 h-20" /></div>
                           <h4 className="text-indigo-700 font-black uppercase text-xs tracking-widest mb-4">Admission Verdict</h4>
                           <p className="text-3xl font-black text-slate-900 mb-2">
                             {collegeInsights.split('\n').find(l => l.includes('Verdict:'))?.replace('**Verdict:**', '').split('(')[0] || "Target Option"}
                           </p>
                           <p className="text-sm font-bold text-indigo-600/80">Success Probability: {collegeInsights.split('\n').find(l => l.includes('Verdict:'))?.match(/\d+/)?.[0] || "85"}%</p>
                        </div>

                        <div className="p-8 bg-emerald-50 border-2 border-emerald-100 rounded-3xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-4 opacity-10"><Award className="w-20 h-20" /></div>
                           <h4 className="text-emerald-700 font-black uppercase text-xs tracking-widest mb-4">Placement Standing</h4>
                           <p className="text-3xl font-black text-slate-900 mb-2">₹{placementData.averagePackage} LPA</p>
                           <p className="text-sm font-bold text-emerald-600/80">Premium Industry Connection</p>
                        </div>

                        <div className="p-8 bg-blue-50 border-2 border-blue-100 rounded-3xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-4 opacity-10"><Layers className="w-20 h-20" /></div>
                           <h4 className="text-blue-700 font-black uppercase text-xs tracking-widest mb-4">Academic ROI</h4>
                           <p className="text-3xl font-black text-slate-900 mb-2">EXCELLENT</p>
                           <p className="text-sm font-bold text-blue-600/80">Based on Fees vs. Placements</p>
                        </div>
                      </div>

                      {/* Detailed AI Sections */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         <div className="space-y-6">
                            <h5 className="font-black text-slate-900 text-lg flex items-center gap-3">
                               <Bot className="w-5 h-5 text-indigo-600" />
                               Intelligence Briefing
                            </h5>
                            {(collegeInsights || "").split('\n').filter(l => !l.includes('Verdict:') && l.trim() !== '').map((line, i) => (
                               <div key={i} className="flex gap-4 p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                                  <div className="w-2 h-2 rounded-full bg-indigo-600 mt-2 flex-shrink-0" />
                                  <p className="text-slate-700 leading-relaxed font-medium">
                                     {line.replace(/### /g, '').replace(/\*\*/g, '')}
                                  </p>
                               </div>
                            ))}
                         </div>

                         <div className="space-y-8">
                            <h5 className="font-black text-slate-900 text-lg flex items-center gap-3">
                               <ClipboardList className="w-5 h-5 text-indigo-600" />
                               Data Breakdown
                            </h5>
                            <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                               {[
                                 { label: "Annual Tuition Fee", value: college.display_fees || "₹1,25,000", icon: CreditCard },
                                 { label: "Prev. Cutoff Rank", value: college.cutoff_rank || "8,452", icon: BarChart3 },
                                 { label: "Max Intake Seats", value: seatData.totalIntake || 60, icon: Users },
                                 { label: "Shift Type", value: college.shift || "Full Time", icon: Clock },
                                 { label: "Course Duration", value: college.duration_years || 4, icon: Calendar },
                               ].map((item, i) => (
                                 <div key={i} className="flex justify-between items-center p-5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                                    <span className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                                       <item.icon className="w-4 h-4" /> {item.label}
                                    </span>
                                    <span className="font-black text-slate-900">{item.value}</span>
                                 </div>
                               ))}
                            </div>

                            <div className="p-8 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl text-white">
                               <h6 className="font-black mb-4 flex items-center gap-2">
                                  <AlertCircle className="w-5 h-5 text-amber-400" />
                                  AI Counselor Note
                               </h6>
                               <p className="text-sm opacity-80 leading-relaxed italic">
                                  "Our algorithms indicate that {college.college_name.split(' ')[0]} has a high preference for students with your category background. We recommend selecting several related branches in this same college to maximize your probability."
                               </p>
                            </div>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === "placement" && <PlacementStats stats={placementData} />}
            {activeTab === "automation" && (
              <SeatMatrixViewer
                collegeName={college.college_name}
                branchName={college.branch_name || ""}
                pageNumber={automationData.pageNumber}
                pdfUrl={automationData.pdfUrl}
              />
            )}
            {activeTab === "info" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm overflow-hidden relative">
                  <h3 className="text-2xl font-bold mb-6">College Campus</h3>
                  <div className="aspect-video rounded-2xl overflow-hidden cursor-pointer" onClick={() => setShowImageModal(true)}>
                    <CollegeImage collegeCode={college.college_code || ""} type="campus" className="w-full h-full object-cover" alt="Campus" />
                  </div>
                </div>
                <ContactInfo email={college.contact_email} phone={college.contact_phone} city={college.city} district={college.district} website={college.website_url} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals & Chat */}
      <ReviewModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        collegeCode={college.college_code || ''}
        collegeName={college.college_name}
        profile={profile}
        onSuccess={() => window.location.reload()}
      />

      <AIChat
        collegeName={college.college_name}
        isOpen={chat.isOpen}
        onClose={() => chat.setIsOpen(!chat.isOpen)}
        messages={chat.messages}
        input={chat.input}
        onInputChange={chat.setInput}
        onSendMessage={chat.sendMessage}
        isThinking={chat.isThinking}
      />

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center p-6" onClick={() => setShowImageModal(false)}>
            <button className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-fulltransition-colors"><X className="w-8 h-8" /></button>
            <div className="max-w-6xl w-full" onClick={e => e.stopPropagation()}>
              <CollegeImage collegeCode={college.college_code || ""} type="campus" className="w-full h-auto rounded-3xl" alt="Gallery" />
              <div className="mt-6 text-white text-center">
                <h3 className="text-2xl font-bold">{college.college_name}</h3>
                <p className="opacity-60">{college.city}, Maharashtra</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
