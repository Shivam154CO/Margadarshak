import { motion } from "framer-motion";
import ScrollAnimationWrapper from "../../../components/ScrollAnimationWrapper";
import LiveFeatureIcon from "../../../components/LiveFeatureIcon";

export default function VisualUSP() {
  return (
    <section className="py-20 md:py-40 px-6 bg-[#080808] relative overflow-hidden contain-content" data-theme="dark">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-rose-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <ScrollAnimationWrapper animation="slideUp" className="text-center mb-32">
          <h2 className="text-4xl md:text-8xl font-black text-white/95 tracking-tighter leading-none mb-8">
            Precision Powered by <br />
            <span className="bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent italic">Real Data</span>
          </h2>
        </ScrollAnimationWrapper>

        <div className="grid lg:grid-cols-12 gap-10">
          <ScrollAnimationWrapper animation="scale" className="lg:col-span-6">
            <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-3xl border border-white/10 rounded-[40px] md:rounded-[60px] p-6 md:p-14 h-full relative group overflow-hidden">
              <div className="relative z-10 space-y-10">
                <div className="space-y-6">
                  <h3 className="text-4xl font-extrabold text-white tracking-tight">Branch-Wise <br /> Performance.</h3>
                  <p className="text-lg text-white/60 font-medium leading-relaxed">
                    Compare Computer, IT, and Mechanical cutoffs across all 340+ colleges instantly. No more manual PDF hunting.
                  </p>
                </div>

                <div className="bg-white/5 rounded-[30px] md:rounded-[40px] border border-white/10 p-5 md:p-8 space-y-6 shadow-2xl transition-transform duration-700">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div className="text-xs font-black text-white px-3 py-1 bg-white/10 rounded-md uppercase tracking-widest">COEP, Pune</div>
                    <div className="text-[10px] font-black text-rose-500 tracking-[0.2em] uppercase">Smart Match</div>
                  </div>
                  {[
                    { b: "Computer Engineering", p: "99.2%" },
                    { b: "Information Technology", p: "98.5%" },
                    { b: "Mechanical Engineering", p: "94.2%" }
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-white/60">{item.b}</span>
                        <span className="text-white">{item.p}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: item.p }}
                          transition={{ duration: 1, delay: i * 0.2 }}
                          className="h-full bg-rose-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper animation="scale" delay={0.2} className="lg:col-span-6">
            <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-3xl border border-white/10 rounded-[40px] md:rounded-[60px] p-6 md:p-14 h-full relative group overflow-hidden">
              <div className="relative z-10 space-y-10">
                <div className="space-y-6">
                  <h3 className="text-4xl font-extrabold text-white tracking-tight">Category-Wise <br /> Seat Matrix.</h3>
                  <p className="text-lg text-white/60 font-medium leading-relaxed">
                    Deep-dive into specific seat distribution for <span className="text-white">OPEN, SC, OBC, EWS, NTA, and SEBC</span> categories.
                  </p>
                </div>

                <div className="bg-[#0a0a0a] rounded-[30px] md:rounded-[40px] border border-white/10 p-5 md:p-8 space-y-6 shadow-2xl transition-transform duration-700">
                  <div className="grid grid-cols-2 gap-3 pb-2">
                    {[
                      { label: 'NTA', count: 2, color: 'bg-rose-500', p: '11%' },
                      { label: 'OPEN', count: 2, color: 'bg-rose-500', p: '44%' },
                      { label: 'SC', count: 1, color: 'bg-rose-400', p: '11%' },
                      { label: 'OBC', count: 1, color: 'bg-orange-400', p: '22%' },
                      { label: 'SEBC', count: 1, color: 'bg-orange-400', p: '11%' },
                      { label: 'EWS', count: 2, color: 'bg-rose-600', p: '11%' },
                    ].map((item, i) => (
                      <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-white/40 tracking-widest">{item.label}</span>
                          <span className="text-[10px] font-black text-white">{item.count}</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: item.p }}
                            className={`h-full ${item.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper animation="scale" delay={0.2} className="lg:col-span-4">
            <div className="bg-rose-900 rounded-[40px] md:rounded-[60px] p-8 md:p-16 h-full flex flex-col justify-between text-white relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-3xl rounded-full" />
              <div className="relative z-10 space-y-6">
                <h3 className="text-4xl font-black tracking-tight leading-none">The 2026 <br /> Standard</h3>
                <div className="text-7xl md:text-[150px] font-black tracking-tighter leading-none opacity-20 group-hover:opacity-100 transition-opacity duration-700">95.7%</div>
                <p className="text-lg font-bold text-white/80">Prediction precision that eliminates the "Maybe" from your admission journey.</p>
              </div>
            </div>
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper animation="slideUp" delay={0.3} className="lg:col-span-4">
            <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-3xl border border-white/10 rounded-[40px] md:rounded-[60px] p-8 md:p-12 h-full relative group">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-rose-500/20 rounded-2xl flex items-center justify-center border border-rose-500/30">
                  <LiveFeatureIcon type="brain" size={44} />
                </div>
                <h3 className="text-2xl font-bold text-white">AI Virtual Assistance</h3>
                <p className="text-white/60 text-sm leading-relaxed">24/7 dedicated AI support to answer every doubt about your admission.</p>
              </div>
            </div>
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper animation="slideUp" delay={0.5} className="lg:col-span-4">
            <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-3xl border border-white/10 rounded-[40px] md:rounded-[60px] p-8 md:p-12 h-full relative group">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                  <LiveFeatureIcon type="chart" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white">Placement Stats</h3>
                <p className="text-white/60 text-sm leading-relaxed">Access real-time placement data, average packages, and top recruiter lists.</p>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </div>
    </section>
  );
}
