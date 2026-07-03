import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Bookmark, Share2, Tag,
  Eye, Layers, CreditCard, Building, Trophy, Bot, Newspaper,
  X, AlertCircle, Users, Sparkles,
  FileText, Globe
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Components
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CollegeImage } from '@/features/colleges/components/CollegeImage';
import { StatCard } from '@/features/colleges/components/CommonCards';
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
      <div className="min-h-screen flex flex-col bg-slate-50">
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
      <div className="min-h-screen flex flex-col bg-slate-50 text-center py-20">
        <Navbar activeTab="search" />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md">
            <AlertCircle className="w-20 h-20 text-slate-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-8">{error || "College information could not be found."}</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => navigate(-1)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">Go Back</button>
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
      {/* Quick Stats Grid */}
      {quickStats.length > 0 && (
        <div className="flex flex-wrap gap-4 w-full">
          {quickStats.map((stat, idx) => (
            <div 
              key={idx} 
              className="flex-1 min-w-[200px]"
            >
              <StatCard {...stat} />
            </div>
          ))}
        </div>
      )}

      {/* Main Content Grid: Seat info and branch info taking main stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
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
        </div>

        <div className="space-y-8">
          {/* Small Stats for a quick contextual read */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Avg Package</p>
                <p className="text-lg font-bold text-slate-900">₹{placementData.averagePackage} LPA</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Placement Rate</p>
                <p className="text-lg font-bold text-slate-900">{formatPercentage(placementData.placementRate)}</p>
              </div>
            </div>
          </div>
          
          <ScholarshipsSection
            collegeScholarships={college.scholarships || []}
            userCategory={profile?.category}
          />

          <ReviewsSection
            reviews={collegeReviews}
            isLoading={reviewsLoading}
            currentUserId={profile?.id}
            onOpenModal={() => profile ? setShowFeedbackModal(true) : alert("Please log in to review.")}
            onEditReview={() => alert("Edit functionality is currently being refined. Feel free to delete and submit a new review!")}
            onDeleteReview={async (id) => {
              if (window.confirm("Are you sure you want to delete your review?")) {
                const { error } = await supabase.from('college_reviews').delete().eq('id', id);
                if (!error) window.location.reload();
              }
            }}
          />
        </div>
      </div>

      {/* Admission Timeline takes full width for better readability of steps */}
      <div className="pt-8 border-t border-slate-200">
         <AdmissionTimeline
            admissionSteps={college.admission_process || []}
            admissionDates={college.admission_dates}
            contacts={college.admission_contacts}
          />
      </div>

      {/* Location and Contact Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-slate-200">
        <DistanceCalculator
          distance={distance}
          isGettingLocation={isGettingLocation}
          onGetLocation={handleGetLocation}
          error={locationError}
          collegeCity={college.city}
          collegeCoords={college.latitude ? { lat: college.latitude, lng: college.longitude! } : undefined}
        />
        <ContactInfo
          email={college.contact_email}
          phone={college.contact_phone}
          city={college.city}
          district={college.district}
          website={college.website_url}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar activeTab="search" />
      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 font-medium px-4 py-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={handleSaveCollege} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl border transition-all ${saved ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
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
                <StatCard label="Total Intake" value={seatData.totalIntake} icon={Users} />
                <StatCard label="Your Category" value={seatData.currentSeats} icon={Tag} />
                <StatCard label="Other Seats" value={seatData.otherSeats} icon={Building} />
                <StatCard label="Percentage" value={`${((seatData.currentSeats / seatData.totalIntake) * 100).toFixed(1)}%`} icon={Trophy} />
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
        profile={profile || null}
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
