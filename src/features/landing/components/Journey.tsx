import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ScrollAnimationWrapper from "../../../components/ScrollAnimationWrapper";

export default function Journey() {
  const navigate = useNavigate();
  const journeySteps = useMemo(() => [
    { title: "Enter Your Diploma Rank", description: "Share your rank and category details." },
    { title: "Pick Preferred Branches", description: "Select branches you're interested in." },
    { title: "Get Your College List", description: "Instantly see colleges you can get into." },
    { title: "Make Informed Choice", description: "Lock your future with confidence." },
  ], []);

  return (
    <section id="how-it-works" className="relative bg-black py-32 md:py-48 overflow-hidden contain-content" data-theme="dark">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <ScrollAnimationWrapper animation="slideUp" className="text-center mb-32">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
            Your Journey <span className="text-rose-600 italic">Redefined</span>
          </h2>
        </ScrollAnimationWrapper>

        <div className="relative">
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-rose-600/0 via-rose-600/40 to-rose-600/0 hidden md:block" />
          <div className="space-y-24 md:space-y-40">
            {journeySteps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <ScrollAnimationWrapper
                  key={index}
                  animation={isEven ? "slideRight" : "slideLeft"}
                  className={`relative flex flex-col md:flex-row items-center gap-12 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className="absolute left-8 md:left-1/2 top-0 -translate-x-1/2 z-20 hidden md:flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-slate-950 border-2 border-rose-600 shadow-[0_0_15px_rgba(225,29,72,0.5)]" />
                  </div>

                  <div className="w-full md:w-[45%] group">
                    <div className="relative p-8 md:p-10 rounded-[30px] bg-white/[0.03] border border-white/10 backdrop-blur-xl transition-all duration-500 hover:border-rose-500/30 hover:bg-white/[0.05]">
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight group-hover:text-rose-500">
                        {step.title}
                      </h3>
                      <p className="text-sm md:text-base text-white/40 font-medium leading-relaxed mb-8">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="w-full md:w-[40%] flex justify-center">
                  </div>
                </ScrollAnimationWrapper>
              );
            })}
          </div>
        </div>

        <ScrollAnimationWrapper animation="scale" className="mt-40 text-center">
          <div className="p-10 md:p-20 rounded-[40px] md:rounded-[60px] bg-gradient-to-br from-rose-600 to-rose-700 text-white relative overflow-hidden">
            <div className="relative z-10 space-y-8">
              <h3 className="text-4xl md:text-5xl font-black tracking-tight leading-none italic uppercase">Ready to <br /> Own Your Future?</h3>
              <button
                onClick={() => navigate("/signup")}
                className="px-8 py-4 bg-white text-rose-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all transform hover:scale-105"
              >
                Start Prediction →
              </button>
            </div>
          </div>
        </ScrollAnimationWrapper>
      </div>
    </section>
  );
}
