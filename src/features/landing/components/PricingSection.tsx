import { motion } from "framer-motion";
import { CheckCircle2, Star, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PricingSection() {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-20 md:py-32 px-6 bg-slate-50 dark:bg-[#0a0a0a] relative overflow-hidden contain-content" data-theme="dark">
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="text-center mb-16 space-y-4 max-w-2xl mx-auto relative z-10">
        <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
          Invest in your <span className="text-indigo-600 dark:text-indigo-400 italic">Future.</span>
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-lg text-slate-600 dark:text-slate-400 font-medium">
          Ditch the confusing PDFs. Get AI-powered predictions, personalized counseling, and direct admission pathways.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full relative z-10">
        {/* Free Plan */}
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-white dark:bg-white/[0.03] rounded-[40px] p-8 md:p-12 border border-slate-200 dark:border-white/10 shadow-xl flex flex-col backdrop-blur-2xl">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Basic Explorer</h3>
            <div className="text-4xl font-black text-slate-900 dark:text-white">Free<span className="text-lg text-slate-500 font-medium tracking-normal">/forever</span></div>
          </div>
          <div className="space-y-4 flex-1 mb-10">
            {['Access to 340+ Colleges', 'Basic College Details Search', 'Standard Seat Matrix view', 'Community Forum Access'].map((feature, i) => (
              <div key={i} className="flex gap-3 items-center text-slate-700 dark:text-slate-300 font-medium">
                <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/signup")} className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-bold text-sm tracking-widest uppercase hover:bg-slate-200 dark:hover:bg-white/10 transition">Get Started</button>
        </motion.div>

        {/* Pro Plan */}
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-indigo-900 to-indigo-600 rounded-[40px] p-8 md:p-12 border border-indigo-400/30 shadow-2xl relative flex flex-col overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-3xl rounded-full" />
          <div className="absolute top-0 right-0 p-8">
            <Star className="w-12 h-12 text-yellow-400/30" />
          </div>
          <div className="mb-8 relative z-10">
            <div className="inline-block px-3 py-1 bg-indigo-500/30 text-indigo-100 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-indigo-400/30">Most Popular</div>
            <h3 className="text-2xl font-bold text-white mb-2">SmartCF Pro</h3>
            <div className="text-4xl font-black text-white">₹999<span className="text-lg text-indigo-200 font-medium tracking-normal">/season</span></div>
          </div>
          <div className="space-y-4 flex-1 mb-10 relative z-10">
            {['Unlimited AI Rank Predictions', '1-on-1 Mentorship Booking', 'Real-Time CAP Round Updates', 'Advanced Scholarship Matcher', 'Priority Support Helpdesk'].map((feature, i) => (
              <div key={i} className="flex gap-3 items-center text-indigo-50 font-medium">
                <Shield className="w-5 h-5 text-indigo-300" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/pricing")} className="relative z-10 w-full py-4 rounded-2xl bg-white text-indigo-900 font-bold text-sm tracking-widest uppercase hover:bg-indigo-50 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition transform hover:-translate-y-1">Upgrade to Pro</button>
        </motion.div>
      </div>
    </section>
  );
}
