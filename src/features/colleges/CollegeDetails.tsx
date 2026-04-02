import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Bookmark, Share2, Tag,
  Eye, Layers, CreditCard, Building, Trophy, Bot, Newspaper,
  X, AlertCircle, Users, ClipboardList, Sparkles,
  FileText, Globe
} from 'lucide-react';

// Components
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CollegeImage } from '@/features/colleges/components/CollegeImage';
import { StatCard, InfoCard } from '@/features/colleges/components/CommonCards';
import { SeatMatrixSection } from '@/features/colleges/components/SeatMatrixSection';
import { AvailableBranches } from '@/features/colleges/components/AvailableBranches';
import { AdmissionTimeline } from '@/features/colleges/components/AdmissionTimeline';
import { ScholarshipsSection } from '@/features/colleges/components/ScholarshipsSection';
import { ReviewsSection } from '@/features/colleges/components/ReviewsSection';
import { InfrastructureGrid, PlacementStats } from '@/features/colleges/components/StatsGrids';
import { ContactInfo } from '@/features/colleges/components/ContactInfo';
import { SeatMatrixViewer } from '@/features/colleges/components/SeatMatrixViewer';
import { DistanceCalculator } from '@/features/colleges/components/DistanceCalculator';
import { IntelligenceFeed } from '@/features/colleges/components/IntelligenceFeed';
import { AIChat } from '@/features/colleges/components/AIChat';
import ReviewModal from '@/features/community/components/ReviewModal';
import { CollegeHero } from '@/features/colleges/components/CollegeHero';
import { CollegeTabs } from '@/features/colleges/components/CollegeTabs';
import { CollegeAIInsights } from '@/features/colleges/components/CollegeAIInsights';
import { CollegeFees } from '@/features/colleges/components/CollegeFees';

// Hooks
import { useCollegeDetails } from '@/features/colleges/hooks/useCollegeDetails';
import { useCollegeAIChat } from '@/features/colleges/hooks/useCollegeAIChat';

// Utils
import { exportDetailedCollegeReport } from '@/utils/exportUtils';
import { formatPercentage } from '@/features/colleges/utils/utils';

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
            collegeCity={college.city}
            collegeCoords={college.latitude ? { lat: college.latitude, lng: college.longitude! } : undefined}
          />

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                Strategic Evaluation Summary
              </h4>
              {isInsightsLoading && <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />}
            </div>
            <p className="text-slate-900 text-sm font-medium leading-relaxed">
              {collegeInsights ? (collegeInsights.split('\n').find(l => !l.includes('Verdict:')) || "Reviewing college metadata...").replace(/\*\*/g, '').replace(/### /g, '') : "Status: Generating final evaluation..."}
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

        <CollegeHero college={college} academicData={academicData} />

        {/* Tabs Navigation */}
        <CollegeTabs
          tabs={[
            { id: "overview", label: "Overview", icon: Eye },
            { id: "seats", label: "Seat Matrix", icon: Layers },
            { id: "fees", label: "Fee Structure", icon: CreditCard },
            { id: "infrastructure", label: "Infrastructure", icon: Building },
            { id: "placement", label: "Placements", icon: Trophy },
            { id: "ai_analysis", label: "AI Insights", icon: Sparkles },
            { id: "intelligence", label: "News", icon: Globe },
            { id: "automation", label: "Automation", icon: Bot },
            { id: "info", label: "More Info", icon: Newspaper },
          ]}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

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
            {activeTab === "fees" && <CollegeFees feeData={feeData} />}
            {activeTab === "infrastructure" && <InfrastructureGrid items={infrastructure} />}
            {activeTab === "ai_analysis" && (
              <CollegeAIInsights
                college={college}
                collegeInsights={collegeInsights}
                isInsightsLoading={isInsightsLoading}
                profile={profile}
                placementData={placementData}
                seatData={seatData}
              />
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
            {activeTab === "intelligence" && (
              <IntelligenceFeed collegeName={college.college_name} />
            )}
            {activeTab === "info" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm overflow-hidden relative">
                  <h3 className="text-2xl font-bold mb-6">College Campus</h3>
                  <div className="aspect-video rounded-2xl overflow-hidden cursor-pointer" onClick={() => setShowImageModal(true)}>
                    <CollegeImage collegeCode={college.college_code || ""} type="campus" imageOverride={college.image} className="w-full h-full object-cover" alt="Campus" />
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
              <CollegeImage collegeCode={college.college_code || ""} type="campus" imageOverride={college.image} className="w-full h-auto rounded-3xl" alt="Gallery" />
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
