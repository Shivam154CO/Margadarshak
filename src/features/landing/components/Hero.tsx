import { useNavigate } from "react-router-dom";
import { motion, MotionValue } from "framer-motion";
import ScrollAnimationWrapper from "../../../components/ScrollAnimationWrapper";
import Magnetic from "../../../components/Magnetic";
import clgImgFallback from "@/assets/illustrations/clg.png?w=1200&format=webp&as=src";
import clgImgSrcset from "@/assets/illustrations/clg.png?w=400;800;1200;1600&format=webp&as=srcset";

interface HeroProps {
  heroScrollY: MotionValue<number>;
}

export default function Hero({ heroScrollY }: HeroProps) {
  const navigate = useNavigate();

  return (
    <section id="predictor" data-theme="light" className="relative min-h-screen flex flex-col items-center pt-24 pb-12 md:pt-28 md:pb-20 overflow-hidden bg-[#fafafa]">
      <div className="w-full flex-1 flex flex-col lg:flex-row items-center justify-between">
        {/* Dynamic Background Elements */}
        <div className="absolute top-20 left-1 w-96 h-96 bg-slate-200/40 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-slate-100/40 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-30 w-full lg:w-3/5 px-6 lg:pl-6">
          <ScrollAnimationWrapper animation="slideRight">
            {/* The Glass Content Card */}
            <div className="bg-white/40 backdrop-blur-md border border-slate-200/50 p-6 md:p-14 rounded-[40px] md:rounded-[60px] shadow-sm relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-slate-100/50 blur-2xl rounded-full pointer-events-none" />

              <div className="relative z-10 space-y-8 group-hover:translate-x-2 transition-transform duration-700">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/60 backdrop-blur-2xl border border-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-2">
                  <span className="font-black text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700">
                    Maharashtra's #1 Diploma Portal
                  </span>
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter">
                  Find Your Dream <br />
                  <span className="italic opacity-90 underline decoration-rose-500/30 text-rose-600">Engineering</span> <br />
                  College
                </h1>

                <p className="text-base md:text-xl text-slate-500 font-semibold max-w-lg leading-relaxed tracking-tight">
                  Predict your admission chances with <span className="text-slate-900 underline decoration-rose-500/30">95.7% accuracy</span> specifically for Maharashtra diploma students.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-10 pt-4 w-full">
                  <Magnetic>
                    <motion.button
                      onClick={() => navigate("/signup")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full md:w-auto px-6 py-4 md:px-10 md:py-5 bg-slate-900 text-white rounded-2xl font-extrabold text-lg md:text-xl shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 md:gap-5"
                    >
                      Predict Now <span className="text-xl md:text-2xl text-rose-500">→</span>
                    </motion.button>
                  </Magnetic>
                </div>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>

        {/* The Overlying Asset */}
        <motion.div
          style={{ y: heroScrollY }}
          initial={{ opacity: 1, x: 50 }} // 100% opacity for instant LCP recognition
          animate={{ x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative lg:absolute lg:right-[-28%] lg:top-[15%] lg:-translate-y-1/2 w-full lg:w-[82%] z-40 pointer-events-none mt-10 md:mt-20 lg:mt-0"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-rose-500/5 blur-3xl rounded-full group-hover:scale-105 transition-transform duration-500 pointer-events-none" />
            <img
              srcSet={clgImgSrcset}
              src={clgImgFallback}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
              alt="Engineering Success"
              width="1200"
              height="800"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="w-full h-auto animate-float scale-100 md:scale-110 object-contain will-change-transform transform-gpu"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
