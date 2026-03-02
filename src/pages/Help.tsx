import { useState } from "react";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  Phone,
  MessageCircle,
  BookOpen,
  Target,
  BarChart3,
  Star,
  Sparkles,
  Layers,
  MessageSquare,
  Send,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface GuideItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  steps: string[];
  category: string;
}

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      return data;
    }
  });

  const faqItems: FAQItem[] = [
    {
      id: "getting-started",
      question: "How do I get started with Ikigai?",
      answer: "To get started, create an account and complete your profile with your exam details, preferred branches, and other preferences. Our AI will then analyze your profile and provide personalized college recommendations based on your scores and choices.",
      category: "getting-started",
    },
    {
      id: "profile-setup",
      question: "How do I set up my profile correctly?",
      answer: "Go to the Profile page and fill in your CET/Diploma exam details, category, preferred branches, and location preferences. Make sure all required fields are completed for accurate predictions.",
      category: "profile",
    },
    {
      id: "predictions",
      question: "How are admission predictions calculated?",
      answer: "Our AI model analyzes historical admission data, your exam scores, category, and branch preferences to predict admission chances. The predictions are categorized as Most Probable, Best Fit, Good Fit, Stretch, or Unlikely Fit.",
      category: "predictions",
    },
    {
      id: "saving-colleges",
      question: "How do I save colleges for later?",
      answer: "Click the bookmark icon on any college card to save it to your favorites. You can view all saved colleges in the Favorites section.",
      category: "features",
    },
    {
      id: "college-details",
      question: "What information is available in college details?",
      answer: "College details include admission requirements, fees, placement statistics, campus facilities, contact information, and more. You can also view campus images and location maps.",
      category: "features",
    },
    {
      id: "comparison",
      question: "How do I compare colleges?",
      answer: "Use the Compare College feature to select multiple colleges and compare them side-by-side based on fees, placements, rankings, and other criteria.",
      category: "features",
    },
    {
      id: "map-view",
      question: "How does the College Map work?",
      answer: "The College Map shows all colleges on an interactive map. You can filter by location, branch, and other criteria to find colleges in specific areas.",
      category: "features",
    },
    {
      id: "data-accuracy",
      question: "How accurate are the predictions?",
      answer: "Our predictions are based on historical data and machine learning models. While we strive for accuracy, actual admission results may vary based on various factors including competition and policy changes.",
      category: "predictions",
    },
    {
      id: "update-profile",
      question: "Can I update my profile after getting predictions?",
      answer: "Yes, you can update your profile anytime. Changes to your exam scores or preferences will trigger new predictions to be generated.",
      category: "profile",
    },
    {
      id: "contact-support",
      question: "How do I contact support?",
      answer: "You can contact our support team through the contact form below, or reach out via email at support@ikigai.edu. We're here to help!",
      category: "support",
    },
  ];

  const guideItems: GuideItem[] = [
    {
      id: "profile-guide",
      title: "Setting Up Your Profile",
      description: "Learn how to create a complete profile for accurate predictions",
      icon: User,
      category: "getting-started",
      steps: [
        "Click on 'Update Profile' from the dashboard",
        "Fill in your exam type (CET or Diploma)",
        "Enter your rank/score and category",
        "Select your preferred engineering branches",
        "Add location preferences if any",
        "Save your profile to get predictions",
      ],
    },
    {
      id: "prediction-guide",
      title: "Understanding Predictions",
      description: "How to interpret your college recommendations",
      icon: Target,
      category: "predictions",
      steps: [
        "Predictions are categorized by admission chance",
        "Most Probable: Highest chance of admission",
        "Best Fit: Strong match with good chances",
        "Good Fit: Solid option with reasonable chances",
        "Stretch: Backup option with lower chances",
        "Check admission percentage and match score",
      ],
    },
    {
      id: "college-search",
      title: "Advanced College Search",
      description: "Find colleges using filters and search options",
      icon: Search,
      category: "features",
      steps: [
        "Use the search bar to find colleges by name or city",
        "Apply filters for branch, fees, placement rate",
        "Sort by admission chance or fees",
        "Save interesting colleges to favorites",
        "Compare multiple colleges side-by-side",
      ],
    },
    {
      id: "comparison-guide",
      title: "College Comparison",
      description: "Compare colleges to make informed decisions",
      icon: BarChart3,
      category: "features",
      steps: [
        "Select colleges from search or dashboard",
        "Add them to comparison list",
        "View side-by-side comparison",
        "Compare fees, placements, rankings",
        "Check admission requirements",
      ],
    },
  ];

  const categories: { id: string; label: string; icon: LucideIcon }[] = [
    { id: "all", label: "All Topics", icon: BookOpen },
    { id: "getting-started", label: "Getting Started", icon: Sparkles },
    { id: "profile", label: "Profile Setup", icon: User },
    { id: "predictions", label: "Predictions", icon: Target },
    { id: "features", label: "Features", icon: Layers },
    { id: "support", label: "Support", icon: MessageCircle },
  ];

  const filteredFAQs = faqItems.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch = searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredGuides = guideItems.filter((guide) => {
    const matchesCategory = activeCategory === "all" || guide.category === activeCategory;
    const matchesSearch = searchQuery === "" ||
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar activeTab="help" userProfile={profile} />

      {/* ===== Main Content ===== */}
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {/* ===== Header ===== */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
                    Help & Support Center
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Find answers, guides, and get the help you need
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== Search Bar ===== */}
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search help topics, FAQs, guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 w-full bg-white border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm hover:shadow-md text-lg"
            />
          </div>
        </div>

        {/* ===== Category Filters ===== */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${activeCategory === category.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-slate-50 border border-slate-200"
                  }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ===== Content Grid ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ===== FAQs Section ===== */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center shadow-sm">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h3>
              </div>

              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-gray-200/50 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900">{faq.question}</span>
                      {expandedFAQ === faq.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600">No FAQs found matching your search.</p>
                </div>
              )}
            </div>
          </div>

          {/* ===== Sidebar ===== */}
          <div className="space-y-6">
            {/* ===== Quick Guides ===== */}
            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Quick Guides</h3>
              </div>

              <div className="space-y-4">
                {filteredGuides.map((guide) => (
                  <div
                    key={guide.id}
                    className="border border-gray-200/50 rounded-2xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                        <guide.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{guide.title}</h4>
                        <p className="text-sm text-gray-600">{guide.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {guide.steps.slice(0, 3).map((step, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-7 h-7 bg-indigo-100 rounded-md flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-indigo-700 font-bold">{index + 1}</span>
                          </div>
                          <p className="text-sm text-gray-600">{step}</p>
                        </div>
                      ))}
                      {guide.steps.length > 3 && (
                        <p className="text-sm text-indigo-600 font-medium ml-7">
                          +{guide.steps.length - 3} more steps...
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== Contact Support ===== */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Need More Help?</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Support</p>
                    <p className="text-xs text-gray-600">support@ikigai.edu</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone Support</p>
                    <p className="text-xs text-gray-600">+91 1800-XXX-XXXX</p>
                  </div>
                </div>

                <button
                  className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-sm flex items-center justify-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Contact Support</span>
                </button>
              </div>
            </div>

            {/* ===== Popular Topics ===== */}
            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Popular Topics</h3>
              </div>

              <div className="space-y-3">
                {[
                  "How predictions work",
                  "Profile setup guide",
                  "College comparison",
                  "Understanding admission chances",
                  "Saving favorite colleges",
                ].map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-indigo-700 font-bold">{index + 1}</span>
                    </div>
                    <span className="text-sm text-gray-700">{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Footer CTA ===== */}
      <div className="mt-auto bg-slate-800 rounded-2xl p-8 text-center text-white shadow-xl mx-4 sm:mx-6 lg:mx-8 mb-8">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-2">Still Need Help?</h3>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you navigate your college admission journey.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="bg-white text-slate-800 px-8 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl inline-flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Start Live Chat</span>
            </button>
            <button className="border border-white/30 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all inline-flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Send Email</span>
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
