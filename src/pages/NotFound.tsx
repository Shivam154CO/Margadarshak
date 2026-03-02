import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Ghost } from "lucide-react";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-100 rounded-full blur-[100px] opacity-60" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-100 rounded-full blur-[100px] opacity-60" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg w-full text-center relative z-10"
            >
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="mb-8 flex justify-center"
                >
                    <div className="p-8 bg-white rounded-[40px] shadow-2xl border border-slate-100 relative">
                        <Ghost className="w-32 h-32 text-indigo-500" />
                        <div className="absolute -top-4 -right-4 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                            404 ERROR
                        </div>
                    </div>
                </motion.div>

                <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">
                    Page Not Found
                </h1>

                <p className="text-lg text-slate-600 mb-10 leading-relaxed font-medium">
                    The page you're looking for was scavenged or never existed in our database.
                    Let's get you back on track!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate("/")}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold shadow-sm hover:bg-slate-50 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </button>
                </div>

                <div className="mt-16 pt-8 border-t border-slate-200/60">
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                        SmartCF • Advanced Engine
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
