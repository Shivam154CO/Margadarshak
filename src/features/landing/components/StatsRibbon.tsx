import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function StatsRibbon() {
  // Optimized Animated counters using Framer Motion springs
  const collegesCount = useMotionValue(0);
  const studentsCount = useMotionValue(0);
  const accuracyCount = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 100 };
  const collegesSpring = useSpring(collegesCount, springConfig);
  const studentsSpring = useSpring(studentsCount, springConfig);
  const accuracySpring = useSpring(accuracyCount, springConfig);

  const collegesDisplay = useTransform(collegesSpring, (v) => Math.floor(v));
  const studentsDisplay = useTransform(studentsSpring, (v) => Math.floor(v).toLocaleString());
  const accuracyDisplay = useTransform(accuracySpring, (v) => v.toFixed(1));

  useEffect(() => {
    collegesCount.set(340);
    studentsCount.set(13600);
    accuracyCount.set(95.7);
  }, [collegesCount, studentsCount, accuracyCount]);

  return (
    <section id="colleges" data-theme="light" className="relative z-50 -mt-10 mb-12 md:mb-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto bg-gray-900 rounded-[40px] md:rounded-[60px] p-6 md:p-10 shadow-3xl border border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          <div className="space-y-1">
            <div className="text-3xl md:text-5xl font-extrabold text-rose-600 tracking-tighter">
              <motion.span>{collegesDisplay}</motion.span>+
            </div>
            <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.4em]">Integrated Colleges</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl md:text-5xl font-extrabold text-white tracking-tighter">
              <motion.span>{studentsDisplay}</motion.span>+
            </div>
            <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.4em]">Real Time Data</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl md:text-5xl font-extrabold text-rose-600 tracking-tighter">
              <motion.span>{accuracyDisplay}</motion.span>%
            </div>
            <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.4em]">Model Precision</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl md:text-5xl font-extrabold text-white tracking-tighter">Live</div>
            <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.4em]">Diploma DATA 2025 & 2026</div>
          </div>
        </div>
      </div>
    </section>
  );
}
