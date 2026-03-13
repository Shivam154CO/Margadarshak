import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, memo } from "react";

/**
 * LiveCastePreview: Simulates switching between different categories 
 * and showing how cutoffs shift instantly.
 */
export const LiveCastePreview = memo(function LiveCastePreview() {
    const categories = ["OPEN", "OBC", "SC", "ST", "VJNT"];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % categories.length);
        }, 2500);
        return () => clearInterval(timer);
    }, []);

    const data = {
        OPEN: { rank: 1045, color: "bg-slate-900", percent: 92 },
        OBC: { rank: 2150, color: "bg-rose-600", percent: 75 },
        SC: { rank: 5400, color: "bg-rose-500", percent: 45 },
        ST: { rank: 8900, color: "bg-rose-400", percent: 25 },
        VJNT: { rank: 3200, color: "bg-rose-700", percent: 60 },
    };

    const current = data[categories[index] as keyof typeof data];

    return (
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-slate-100 font-sans will-change-transform">
            <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={cat}
                            animate={{
                                scale: i === index ? 1.05 : 1,
                                opacity: i === index ? 1 : 0.4,
                                backgroundColor: i === index ? "#e11d48" : "#f1f5f9",
                                color: i === index ? "#ffffff" : "#64748b",
                            }}
                            className="px-3 py-1 rounded-full text-[10px] font-bold transition-colors"
                        >
                            {cat}
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Current Cutoff</span>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={categories[index]}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-4xl font-black text-slate-900"
                            >
                                {current.rank.toLocaleString()}
                                <span className="text-sm font-bold text-slate-400 ml-1">Rank</span>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <motion.div
                        animate={{ rotate: index * 72 }}
                        className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center"
                    >
                        <div className="w-4 h-4 rounded-full border-2 border-rose-600 border-t-transparent animate-spin" />
                    </motion.div>
                </div>

                <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${current.percent}%`, backgroundColor: "#e11d48" }}
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(225,29,72,0.3)]"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Availability</div>
                        <motion.div
                            key={index}
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            className="text-lg font-black text-slate-900"
                        >
                            {index === 0 ? "85%" : index === 1 ? "92%" : "98%"}
                        </motion.div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Shift</div>
                        <div className="text-lg font-black text-rose-600">+{index * 4}%</div>
                    </div>
                </div>
            </div>
        </div>
    );
});

/**
 * LiveMatchSimulator: Simulates real-time college matching 
 * based on user scores.
 */
export const LiveMatchSimulator = memo(function LiveMatchSimulator() {
    const colleges = [
        { name: "DYPCOE Pune", branch: "Comp Sci", status: "MATCHED", color: "text-emerald-500", bg: "bg-emerald-50" },
        { name: "VJTI Mumbai", branch: "IT Engineering", status: "RISKY", color: "text-rose-500", bg: "bg-rose-50" },
        { name: "PICT Pune", branch: "Electronics", status: "MATCHED", color: "text-emerald-500", bg: "bg-emerald-50" },
        { name: "SPIT Mumbai", branch: "Data Science", status: "SEARCHING", color: "text-slate-400", bg: "bg-slate-50" },
        { name: "WCE Sangli", branch: "Mechanical", status: "MATCHED", color: "text-emerald-500", bg: "bg-emerald-50" },
    ];

    return (
        <div className="w-full max-w-sm h-80 overflow-hidden relative group font-sans will-change-transform">
            <motion.div
                animate={{ y: [0, -400] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="space-y-4"
            >
                {[...colleges, ...colleges].map((college, i) => (
                    <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-lg flex items-center justify-between gap-4">
                        <div className="space-y-1 flex-1 min-w-0">
                            <div className="text-sm font-black text-slate-900 leading-none truncate">{college.name}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{college.branch}</div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl ${college.bg} ${college.color} text-[10px] font-black tracking-widest`}>
                            {college.status === "SEARCHING" ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse" />
                                    SCANNING
                                </div>
                            ) : college.status}
                        </div>
                    </div>
                ))}
            </motion.div>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white via-transparent to-white" />
        </div>
    );
});

/**
 * LiveTrendPulse: Visualizes yearly volatility and shifts.
 */
export const LiveTrendPulse = memo(function LiveTrendPulse() {
    const colleges = [
        { name: "VJTI Mumbai", rate: "98.2%", package: "12.5 LPA" },
        { name: "DYPCOE Pune", rate: "88.5%", package: "6.2 LPA" },
        { name: "PICT Pune", rate: "94.8%", package: "9.8 LPA" }
    ];
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setIdx(p => (p + 1) % colleges.length), 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full max-w-sm bg-slate-900 rounded-3xl p-8 shadow-2xl overflow-hidden relative font-sans will-change-transform border border-white/20">
            <div className="absolute top-0 right-0 p-4">
                <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                            className="w-1 h-1 rounded-full bg-rose-500"
                        />
                    ))}
                </div>
            </div>

            <div className="mb-8">
                <div className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-2">Placement Analytics</div>
                <AnimatePresence mode="wait">
                    <motion.h4
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="text-2xl font-black text-white leading-tight"
                    >
                        {colleges[idx].name} <br /> <span className="text-rose-500 italic">Statistics</span>
                    </motion.h4>
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Placement Rate</div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={idx}
                            initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                            className="text-3xl font-black text-white"
                        >
                            {colleges[idx].rate}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <div className="space-y-1">
                    <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Avg Package</div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={idx}
                            initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                            className="text-xl font-black text-rose-500"
                        >
                            {colleges[idx].package}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="relative h-16 flex items-end gap-1 overflow-hidden opacity-30">
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ height: [`${20 + Math.random() * 80}%`, `${20 + Math.random() * 80}%`] }}
                        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                        className="flex-1 bg-rose-500 rounded-t-sm"
                    />
                ))}
            </div>
        </div>
    );
});

/**
 * LiveAIAssistant: Simulates an AI chat interface.
 */
export const LiveAIAssistant = memo(function LiveAIAssistant() {
    const [messages, setMessages] = useState([
        { text: "Can I get COEP with 98.2%?", type: "user" },
        { text: "Analysing... Based on 2025 data, your chances are High (94%).", type: "ai" }
    ]);

    useEffect(() => {
        const chat = [
            { text: "What about OBC category?", type: "user" },
            { text: "For OBC, the cutoff for CS at COEP was 1045 rank.", type: "ai" },
            { text: "Applying scholarship?", type: "user" },
            { text: "Yes, TFWS and EBC are applicable for this college.", type: "ai" }
        ];
        let i = 0;
        const interval = setInterval(() => {
            setMessages(prev => {
                const next = [...prev, chat[i % chat.length]];
                return next.length > 3 ? next.slice(1) : next;
            });
            i++;
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-slate-100 font-sans space-y-4 will-change-transform">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-50">
                <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                </div>
                <div>
                    <div className="text-xs font-black text-slate-900">Virtual Assistant</div>
                    <div className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Online Now</div>
                </div>
            </div>
            <div className="space-y-3 h-32 overflow-hidden flex flex-col justify-end">
                <AnimatePresence initial={false}>
                    {messages.map((m, idx) => (
                        <motion.div
                            key={idx + m.text}
                            initial={{ opacity: 0, x: m.type === 'user' ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`max-w-[80%] p-3 rounded-2xl text-[10px] font-bold ${m.type === 'user'
                                ? 'bg-slate-100 text-slate-600 self-end rounded-tr-none'
                                : 'bg-rose-50 text-rose-600 self-start rounded-tl-none border border-rose-100'
                                }`}
                        >
                            {m.text}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            <div className="pt-2">
                <div className="w-full h-8 bg-slate-50 rounded-xl flex items-center px-4">
                    <div className="text-[10px] text-slate-300 font-bold">Ask anything...</div>
                </div>
            </div>
        </div>
    );
});

/**
 * LiveDistanceTracker: Simulates route and travel time tracking.
 */
export const LiveDistanceTracker = memo(function LiveDistanceTracker() {
    return (
        <div className="w-full max-w-sm bg-slate-50 rounded-3xl p-6 shadow-xl border border-slate-100 font-sans relative overflow-hidden will-change-transform">
            <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-6 gap-2 rotate-12 scale-150">
                    {Array.from({ length: 36 }).map((_, i) => (
                        <div key={i} className="h-10 w-10 border border-slate-900 rounded-lg" />
                    ))}
                </div>
            </div>
            <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Travel Insights</div>
                        <div className="text-2xl font-black text-slate-900">12.4 Km</div>
                    </div>
                    <div className="px-3 py-1 bg-rose-500 text-white rounded-full text-[10px] font-black shadow-lg">FASTEST</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                        <div className="flex-1 h-1 bg-slate-100 rounded-full relative overflow-hidden">
                            <motion.div
                                animate={{ left: ["0%", "100%"] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute top-0 w-8 h-full bg-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.5)]"
                            />
                        </div>
                        <div className="w-2 h-2 bg-rose-500 rounded-sm rotate-45" />
                    </div>
                    <div className="flex justify-between">
                        <div className="space-y-1">
                            <div className="text-[8px] font-bold text-slate-400 uppercase">Home</div>
                            <div className="text-[10px] font-black text-slate-900">Dadar, Mumbai</div>
                        </div>
                        <div className="text-right space-y-1">
                            <div className="text-[8px] font-bold text-slate-400 uppercase">College</div>
                            <div className="text-[10px] font-black text-slate-900">VJTI, Matunga</div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1 p-3 bg-white rounded-2xl border border-slate-100 flex items-center justify-between">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-xs font-black text-slate-900">18 Mins</div>
                    </div>
                    <div className="flex-1 p-3 bg-white rounded-2xl border border-slate-100 flex items-center justify-between">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <div className="text-xs font-black text-slate-900">Bus, Train</div>
                    </div>
                </div>
            </div>
        </div>
    );
});

/**
 * LiveScholarshipGuide: Simulates a document/checklist for scholarships.
 */
export const LiveScholarshipGuide = memo(function LiveScholarshipGuide() {
    const steps = [
        { label: "Post-Matric Category", status: "DONE" },
        { label: "EBC Form Submission", status: "PENDING" },
        { label: "Income Certificate", status: "DONE" },
        { label: "Hostel Allowance", status: "WAITING" },
    ];

    return (
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl border border-slate-100 font-sans space-y-6 will-change-transform">
            <div className="flex items-center justify-between">
                <div className="text-xs font-black text-slate-900 uppercase tracking-widest">Scholarship Tracker</div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[10px] font-black">Post Matric</div>
            </div>

            <div className="space-y-3">
                {steps.map((step, i) => (
                    <motion.div
                        key={step.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${step.status === 'DONE' ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                {step.status === 'DONE' && (
                                    <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-[10px] font-bold text-slate-600">{step.label}</span>
                        </div>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${step.status === 'DONE' ? 'bg-emerald-50 text-emerald-600' :
                            step.status === 'PENDING' ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-400'
                            }`}>
                            {step.status}
                        </span>
                    </motion.div>
                ))}
            </div>

            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                <div className="text-[9px] font-black text-rose-600 uppercase mb-1">Fee Benefit</div>
                <div className="text-xl font-black text-rose-700">₹45,000 <span className="text-[10px] font-bold">/ Year</span></div>
            </div>
        </div>
    );
});
