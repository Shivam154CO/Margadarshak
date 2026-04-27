import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ScrollAnimationWrapper from "../../../components/ScrollAnimationWrapper";
import { Trophy, GitPullRequest, Building2, ShieldCheck } from "lucide-react";

export default function Journey() {
  const navigate = useNavigate();

  const journeySteps = useMemo(() => [
    { title: "Profile Analysis", description: "Share your rank and category details.", icon: Trophy },
    { title: "Branch Selection", description: "Select branches you're interested in.", icon: GitPullRequest },
    { title: "College Matching", description: "Instantly see colleges you can get into.", icon: Building2 },
    { title: "Secure Admission", description: "Lock your future with confidence.", icon: ShieldCheck },
  ], []);

  return (
    <section id="how-it-works" className="relative bg-black py-16 md:py-20 overflow-hidden contain-content" data-theme="dark">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <ScrollAnimationWrapper animation="slideUp" className="text-center mb-16 md:mb-24">
          <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-6">
            Your Journey <span className="text-rose-600 italic">Redefined</span>
          </h2>
          <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto">
            From entering your rank to securing your admission — everything is perfectly calculated. Nothing left to chance.
          </p>
        </ScrollAnimationWrapper>

        <div className="relative">
          {/* Continuous dashed line for large screens */}
          <div className="hidden lg:block absolute top-[48px] left-[10%] right-[10%] h-px border-t-[2px] border-dashed border-white/10 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-6 relative z-10">
            {journeySteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <ScrollAnimationWrapper
                  key={index}
                  animation="slideUp"
                  className="flex flex-col items-center text-center relative group"
                >
                  {/* Icon container matching the reference card style */}
                  <div className="w-24 h-24 mb-10 relative flex items-center justify-center">
                    {/* The glassy card backing */}
                    <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-[28px] shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-10px_rgba(225,29,72,0.3)] group-hover:border-rose-500/30" />

                    {/* Icon */}
                    <Icon className="w-8 h-8 text-white transition-all duration-500 group-hover:text-rose-400 group-hover:scale-110 relative z-10" />

                    {/* Small plus or decorative element */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-0 group-hover:scale-100 shadow-lg border border-white/10 z-20">
                      <div className="w-2.5 h-px bg-white absolute" />
                      <div className="h-2.5 w-px bg-white absolute" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                      Step 0{index + 1}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-rose-400 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-[220px]">
                      {step.description}
                    </p>
                  </div>
                </ScrollAnimationWrapper>
              );
            })}
          </div>

          {/* Then connector matching the bottom part of the image */}
          <div className="hidden lg:flex flex-col items-center justify-center mt-20 relative">
            <div className="w-px h-16 border-l-[2px] border-dashed border-white/10 absolute -top-16" />
            <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-full z-10 relative">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Then</span>
            </div>
            <div className="w-px h-16 border-l-[2px] border-dashed border-white/10 absolute -bottom-16" />
          </div>
        </div>

        {/* Final Automated Outcome after THEN */}
        <ScrollAnimationWrapper animation="slideUp" className="mt-8 lg:mt-24 max-w-4xl mx-auto relative z-20">
          <div className="bg-gradient-to-b from-white/10 to-transparent p-[1px] rounded-[40px] shadow-[0_20px_50px_-12px_rgba(79,70,229,0.2)]">
            <div className="bg-black/60 backdrop-blur-3xl rounded-[40px] p-8 md:p-12 border border-white/5 flex flex-col md:flex-row items-center gap-10 md:gap-16 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/20 blur-[100px] pointer-events-none rounded-full translate-x-1/3 -translate-y-1/3" />

              <div className="flex-1 relative z-10 text-center md:text-left">
                <h3 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tighter leading-tight">
                  Auto-Generated <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">CAP Option Form</span>
                </h3>
                <p className="text-slate-400 font-medium leading-relaxed">
                  The machine learning model cross-references historical cutoffs and predicts your best fit. Get a polished, ready-to-use DSE Option form PDF instantly. No manual typing required.
                </p>
              </div>

              <div className="w-full md:w-auto flex justify-center relative z-10">
                <div className="w-56 h-72 bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl relative flex flex-col overflow-hidden group-hover:-translate-y-2 transition-transform duration-500">
                  {/* Decorative mockup of a pdf page */}
                  <div className="h-6 bg-slate-800/80 border-b border-slate-700 flex items-center px-4 gap-1.5">
                    <div className="w-2 h-2 bg-rose-500 rounded-full" />
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  </div>
                  <div className="p-5 space-y-4 pt-8">
                    <div className="h-2.5 w-3/4 bg-white/10 rounded-full overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    </div>
                    <div className="h-2 w-1/2 bg-white/5 rounded-full" />
                    <div className="space-y-3 mt-8">
                      <div className="h-10 bg-indigo-500/20 border border-indigo-500/30 rounded-lg flex items-center px-3 gap-2">
                        <div className="h-3 w-3 rounded-full bg-indigo-400/50" />
                        <div className="h-1.5 w-20 bg-indigo-400/50 rounded" />
                      </div>
                      <div className="h-8 bg-white/5 border border-white/10 rounded-lg flex items-center px-3">
                        <div className="h-1.5 w-32 bg-white/20 rounded" />
                      </div>
                      <div className="h-8 bg-white/5 border border-white/10 rounded-lg flex items-center px-3">
                        <div className="h-1.5 w-16 bg-white/20 rounded" />
                      </div>
                      <div className="h-8 bg-white/5 border border-white/10 rounded-lg flex items-center px-3">
                        <div className="h-1.5 w-24 bg-white/20 rounded" />
                      </div>
                    </div>
                  </div>
                  {/* PDF stamp */}
                  <div className="absolute bottom-5 right-5 w-12 h-12 bg-rose-600/20 rounded-full border border-rose-500/30 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">PDF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollAnimationWrapper>

        <ScrollAnimationWrapper animation="scale" className="mt-20 lg:mt-32 text-center relative z-20">
          <div className="p-10 md:p-16 rounded-[40px] md:rounded-[60px] bg-gradient-to-br from-slate-900 to-black border border-white/10 text-white relative overflow-hidden shadow-2xl group">
            {/* Glossy background effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 group-hover:bg-rose-600/20 transition-all duration-700" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4" />

            <div className="relative z-10 space-y-8 flex flex-col items-center justify-center">
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none">Ready to <span className="italic text-rose-500">Own Your Future?</span></h3>
              <p className="text-slate-400 font-medium max-w-lg mb-4">Join thousands of students who skipped the guesswork and secured admission in their dream colleges.</p>
              <button
                onClick={() => navigate("/signup")}
                className="px-8 py-4 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(225,29,72,0.4)]"
              >
                Start Prediction Matrix &rarr;
              </button>
            </div>
          </div>
        </ScrollAnimationWrapper>
      </div>
    </section>
  );
}
