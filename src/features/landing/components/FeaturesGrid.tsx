import { useMemo } from "react";
import ScrollAnimationWrapper from "../../../components/ScrollAnimationWrapper";
import { LiveCastePreview, LiveMatchSimulator, LiveTrendPulse, LiveAIAssistant, LiveDistanceTracker, LiveScholarshipGuide } from "../../../components/LiveFeatureShowcase";

export default function FeaturesGrid() {
  const features = useMemo(() => [
    { title: "Caste-Wise Seats", desc: "Instantly see how ranking shifts based on your category and seat availability.", showcase: "caste", badge: "Real-Time" },
    { title: "AI Assistant", desc: "Expert guidance for your legal and technical admission doubts, available 24/7.", showcase: "ai", badge: "AI Powered" },
    { title: "Distance Tracker", desc: "Calculate exact travel times from your home to any college campus in Maharashtra.", showcase: "distance", badge: "Maps API" },
    { title: "Scholarship Guide", desc: "Unlock fee benefits like Post-Matric and TFWS with our automated checklist.", showcase: "scholarship", badge: "Official Data" },
    { title: "Trend Pulse", desc: "Analyze placement statistics and median packages for every college branch.", showcase: "trend", badge: "Live Feed" },
    { title: "Precision Match", desc: "Our neural engine predicts your best college match with 95.7% accuracy.", showcase: "match", badge: "95.7% Accurate" },
  ] as const, []);

  return (
    <section id="features" data-theme="light" className="py-20 md:py-40 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <ScrollAnimationWrapper animation="slideUp">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-4xl md:text-7xl font-extrabold text-slate-900 tracking-tighter leading-none mb-4">Powerful Features <br /> <span className="bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent italic text-4xl md:text-7xl">Simple to Use</span></h2>
          </div>
        </ScrollAnimationWrapper>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx: number) => (
            <ScrollAnimationWrapper key={idx} animation="scale" delay={idx * 0.05}>
              <div className="group bg-gradient-to-br from-white to-slate-50/50 rounded-[50px] p-8 border border-slate-100 hover:border-rose-100 shadow-sm transition-all duration-700 h-full flex flex-col items-center text-center space-y-6">
                <div className="w-full">
                  <div className="bg-white/40 rounded-[35px] p-2 border border-white/60 overflow-hidden shadow-inner flex justify-center items-center h-[220px]">
                    <div className="scale-[0.7] origin-center w-full flex justify-center">
                      {feature.showcase === "caste" && <LiveCastePreview />}
                      {feature.showcase === "ai" && <LiveAIAssistant />}
                      {feature.showcase === "distance" && <LiveDistanceTracker />}
                      {feature.showcase === "scholarship" && <LiveScholarshipGuide />}
                      {feature.showcase === "trend" && <LiveTrendPulse />}
                      {feature.showcase === "match" && <LiveMatchSimulator />}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-rose-600 transition-colors uppercase">{feature.title}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[220px] mx-auto opacity-80">{feature.desc}</p>
                </div>
              </div>
            </ScrollAnimationWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
