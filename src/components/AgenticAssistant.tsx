import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, X, Activity } from 'lucide-react';

interface Insight {
    id: string;
    text: string;
    type: 'learning' | 'suggestion' | 'alert';
    timestamp: Date;
}

export const AgenticAssistant = ({ darkMode }: { darkMode: boolean, userProfile: any, colleges: any[] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [pulse, setPulse] = useState(false);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [currentThought, setCurrentThought] = useState("Analyzing your profile...");

    useEffect(() => {
        // Simulated "Ongoing Learning" / Agentic Logic
        const interval = setInterval(() => {
            setPulse(true);
            setTimeout(() => setPulse(false), 2000);

            const thoughts = [
                "Scanning Mumbai Hub for probability spikes...",
                "Evaluating ROI on Computer Science branches...",
                "Cross-referencing 2024 cutoff volatility...",
                "Detecting target match in Pune region...",
                "Optimizing your distance-to-campus friction..."
            ];
            setCurrentThought(thoughts[Math.floor(Math.random() * thoughts.length)]);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const generateInsight = () => {
        const newInsight: Insight = {
            id: Math.random().toString(36).substr(2, 9),
            text: "Based on available data, I've found an edge-case opportunity in the upcoming round.",
            type: 'suggestion',
            timestamp: new Date()
        };
        setInsights(prev => [newInsight, ...prev].slice(0, 5));
    };

    return (
        <div className="fixed bottom-10 right-10 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.8, filter: 'blur(20px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 100, scale: 0.8, filter: 'blur(20px)' }}
                        className={`absolute bottom-24 right-0 w-80 rounded-[40px] border overflow-hidden backdrop-blur-3xl p-8 ${darkMode ? 'bg-black/60 border-white/10 shadow-emerald-500/10' : 'bg-white/80 border-black/5 shadow-2xl'
                            } shadow-3xl`}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black tracking-tight">The Sentinel</h4>
                                    <div className="flex items-center space-x-2">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Active Agent</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-black/5 rounded-xl transition-colors">
                                <X className="w-4 h-4 opacity-40" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className={`p-4 rounded-3xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-black/5 border-transparent'}`}>
                                <div className="flex items-center space-x-2 mb-2">
                                    <Activity className="w-3 h-3 text-emerald-500" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">Ongoing Learning</span>
                                </div>
                                <p className="text-xs font-medium leading-relaxed italic opacity-70">
                                    "{currentThought}"
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Insight Feed</div>
                                {insights.length === 0 ? (
                                    <button
                                        onClick={generateInsight}
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-transform"
                                    >
                                        Initialize Agent Sync
                                    </button>
                                ) : (
                                    insights.map(i => (
                                        <motion.div
                                            key={i.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`p-4 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'}`}
                                        >
                                            <p className="text-[11px] font-medium opacity-80">{i.text}</p>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`relative w-16 h-16 rounded-[22px] flex items-center justify-center transition-all ${isOpen ? 'bg-emerald-500 text-white scale-90' : 'bg-white dark:bg-gray-800 shadow-2xl overflow-hidden group'
                    }`}
            >
                <AnimatePresence>
                    {pulse && !isOpen && (
                        <motion.div
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            className="absolute inset-0 bg-emerald-500 rounded-full"
                        />
                    )}
                </AnimatePresence>
                {isOpen ? <X className="w-6 h-6" /> : (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Brain className={`w-7 h-7 ${darkMode ? 'text-emerald-400' : 'text-emerald-500'}`} />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center">
                            <Sparkles className="w-2 h-2 text-white" />
                        </div>
                    </>
                )}
            </motion.button>
        </div>
    );
};
