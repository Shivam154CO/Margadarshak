import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ScrollAnimationWrapper from "../../../components/ScrollAnimationWrapper";

export default function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-40 px-6 text-center bg-[#050505]" data-theme="dark">
      <div className="max-w-4xl mx-auto space-y-10 md:space-y-16">
        <ScrollAnimationWrapper animation="slideUp">
          <h2 className="text-4xl md:text-9xl font-extrabold text-white tracking-tighter leading-[0.85]">
            Secure Your <br /> <span className="italic text-rose-600">Future Today</span>
          </h2>
          <div className="pt-16 space-y-10">
            <motion.button
              onClick={() => navigate("/signup")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-6 md:px-24 md:py-8 bg-white text-slate-950 rounded-full font-extrabold text-xl md:text-3xl shadow-3xl hover:bg-rose-600 hover:text-white transition-all"
            >
              Sign Up Now →
            </motion.button>
            <p className="text-white font-extrabold text-xs capitalize tracking-[0.5em]">Join 52,000+ Diploma Aspirants</p>
          </div>
        </ScrollAnimationWrapper>
      </div>
    </section>
  );
}
