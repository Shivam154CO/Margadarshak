import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import {
    Clock, AlertTriangle,
    CheckCircle2, Timer, ExternalLink, Filter, Download,
    CalendarDays, Bookmark, ArrowRight, Zap, Info
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface TimelineEvent {
    id: string;
    title: string;
    description: string;
    date: string;
    endDate?: string;
    category: "cap-round" | "document" | "fee" | "result" | "counseling" | "reporting";
    status: "upcoming" | "active" | "completed" | "urgent";
    important: boolean;
    link?: string;
    tips?: string[];
}

const TIMELINE_EVENTS: TimelineEvent[] = [
    {
        id: "reg-open",
        title: "Online Registration Opens",
        description: "DTE Maharashtra online registration portal opens for new admissions. Complete your registration early to avoid last-minute issues.",
        date: "2026-03-15",
        endDate: "2026-04-15",
        category: "counseling",
        status: "upcoming",
        important: true,
        link: "https://dte.maharashtra.gov.in",
        tips: ["Keep your mobile number and email handy", "Upload passport-size photo in JPEG format", "Note down your registration ID safely"]
    },
    {
        id: "doc-verify-1",
        title: "Document Verification Window – Phase 1",
        description: "First round of document verification at Facilitation Centres (FCs). Carry original documents along with photocopies.",
        date: "2026-04-20",
        endDate: "2026-05-05",
        category: "document",
        status: "upcoming",
        important: true,
        tips: ["Carry ALL original documents", "Keep 3 sets of photocopies", "Reach FC before 10 AM to avoid queues", "Save verification receipt carefully"]
    },
    {
        id: "cap-round-1",
        title: "CAP Round 1 – Preference List Submission",
        description: "Fill and lock your choice list for the first round of Centralized Admission Process. Choose wisely — sequence matters!",
        date: "2026-05-15",
        endDate: "2026-05-25",
        category: "cap-round",
        status: "upcoming",
        important: true,
        tips: ["Use the Ikigai CAP Generator for optimal ordering", "Don't leave your Safe colleges out", "Lock choices before deadline — no extension given"]
    },
    {
        id: "cap-result-1",
        title: "CAP Round 1 – Allotment Result",
        description: "First round allotment results declared. Check your allotment status on the DTE portal.",
        date: "2026-06-01",
        category: "result",
        status: "upcoming",
        important: true,
        link: "https://dte.maharashtra.gov.in",
        tips: ["Options: Accept & Freeze, Accept & Float (for upgrade), or Reject", "If satisfied, choose 'Accept & Freeze' to confirm your seat"]
    },
    {
        id: "fee-1",
        title: "CAP Round 1 – Fee Payment Deadline",
        description: "Pay the admission fee for your allotted college to confirm your seat. Missing this means automatic cancellation.",
        date: "2026-06-05",
        category: "fee",
        status: "upcoming",
        important: true,
        tips: ["Keep ₹50,000–₹1,00,000 ready depending on college", "Pay via online banking for instant confirmation", "Save the fee receipt — you'll need it at reporting"]
    },
    {
        id: "cap-round-2",
        title: "CAP Round 2 – Preference List Update",
        description: "Update your choices for the second round. Students who chose 'Accept & Float' can get upgraded seats.",
        date: "2026-06-10",
        endDate: "2026-06-15",
        category: "cap-round",
        status: "upcoming",
        important: false,
        tips: ["Review vacancy positions from Round 1", "Add colleges that had cancellations"]
    },
    {
        id: "cap-result-2",
        title: "CAP Round 2 – Allotment Result",
        description: "Second round allotment results. Check for upgrades or new allotments.",
        date: "2026-06-20",
        category: "result",
        status: "upcoming",
        important: false
    },
    {
        id: "fee-2",
        title: "CAP Round 2 – Fee Payment Deadline",
        description: "Fee payment deadline for Round 2 allotment. Existing seat holders who got upgraded must pay differential fees.",
        date: "2026-06-25",
        category: "fee",
        status: "upcoming",
        important: false
    },
    {
        id: "cap-round-3",
        title: "CAP Round 3 – Final Round",
        description: "Last regular CAP round. This is your final chance for seat allotment through the regular process.",
        date: "2026-06-28",
        endDate: "2026-07-02",
        category: "cap-round",
        status: "upcoming",
        important: true
    },
    {
        id: "cap-result-3",
        title: "CAP Round 3 – Final Allotment",
        description: "Final round results declared.",
        date: "2026-07-05",
        category: "result",
        status: "upcoming",
        important: false
    },
    {
        id: "vacancy-round",
        title: "Vacancy / Spot Round Registration",
        description: "Special round for unfilled seats. Open to all eligible candidates who didn't get a seat in regular rounds.",
        date: "2026-07-10",
        endDate: "2026-07-15",
        category: "cap-round",
        status: "upcoming",
        important: true,
        tips: ["New registration may be required", "First come, first served for some seats", "Check DTE portal for participating colleges"]
    },
    {
        id: "reporting",
        title: "Physical Reporting to College",
        description: "Report to your allotted college with all original documents for final admission confirmation.",
        date: "2026-07-15",
        endDate: "2026-07-25",
        category: "reporting",
        status: "upcoming",
        important: true,
        tips: ["Carry ALL original documents", "Carry demand draft or online payment receipt", "Submit passport photos, migration certificate", "Collect student ID card and timetable"]
    },
];

const categoryConfig: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
    "cap-round": { color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200", icon: Zap, label: "CAP Round" },
    "document": { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Bookmark, label: "Documents" },
    "fee": { color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", icon: AlertTriangle, label: "Fee Payment" },
    "result": { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2, label: "Result" },
    "counseling": { color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", icon: CalendarDays, label: "Registration" },
    "reporting": { color: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-200", icon: ArrowRight, label: "Reporting" },
};

function getCountdown(dateStr: string) {
    const target = new Date(dateStr).getTime();
    const now = Date.now();
    const diff = target - now;
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days, hours, minutes, total: diff };
}

function generateGoogleCalUrl(event: TimelineEvent) {
    const start = event.date.replace(/-/g, "");
    const end = event.endDate ? event.endDate.replace(/-/g, "") : start;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&sf=true&output=xml`;
}

export default function AdmissionTimeline() {
    const [filter, setFilter] = useState<string>("all");
    const [, setTick] = useState(0);
    const [dbEvents, setDbEvents] = useState<TimelineEvent[]>([]);

    const { data: profile } = useQuery<any>({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return null;
            const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
            return data;
        },
        staleTime: 1000 * 60 * 10,
    });

    // Fetch initial events and subscribe to real-time updates
    useEffect(() => {
        const fetchEvents = async () => {
            const { data, error } = await supabase
                .from('timeline_events')
                .select('*')
                .order('date', { ascending: true });
            
            if (error && (error as any).code === 'PGRST116') {
                // Table doesn't exist, we'll use fallbacks (already handled in useMemo)
                return;
            }

            if (data && !error) {
                setDbEvents(data);
            }
        };

        fetchEvents();

        const channel = supabase
            .channel('timeline-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'timeline_events' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setDbEvents(prev => [...prev, payload.new as TimelineEvent].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
                } else if (payload.eventType === 'UPDATE') {
                    setDbEvents(prev => prev.map(e => e.id === payload.new.id ? payload.new as TimelineEvent : e));
                } else if (payload.eventType === 'DELETE') {
                    setDbEvents(prev => prev.filter(e => e.id === payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Live countdown ticker
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 60000);
        return () => clearInterval(interval);
    }, []);

    const events = useMemo(() => {
        const now = Date.now();
        const baseEvents = dbEvents.length > 0 ? dbEvents : TIMELINE_EVENTS;
        return baseEvents.map(e => {
            const start = new Date(e.date).getTime();
            const end = e.endDate ? new Date(e.endDate).getTime() : start + 86400000;
            let status = e.status;
            if (now > end) status = "completed";
            else if (now >= start && now <= end) status = "active";
            else if (start - now < 3 * 86400000) status = "urgent";
            else status = "upcoming";
            return { ...e, status } as TimelineEvent;
        });
    }, [dbEvents]);

    const filtered = useMemo(() => {
        if (filter === "all") return events;
        return events.filter(e => e.category === filter);
    }, [events, filter]);

    const nextEvent = events.find(e => e.status === "urgent" || e.status === "upcoming");
    const activeEvents = events.filter(e => e.status === "active");
    const completedCount = events.filter(e => e.status === "completed").length;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar activeTab="timeline" userProfile={profile} />
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Admission Timeline</h1>
                    <p className="text-sm text-slate-500 mt-1">Track every deadline in the Maharashtra admission process</p>
                </div>

                {/* Stats Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                    {[
                        { label: "Total Events", value: events.length, color: "border-l-slate-400" },
                        { label: "Completed", value: completedCount, color: "border-l-emerald-500" },
                        { label: "Active Now", value: activeEvents.length, color: "border-l-blue-500" },
                        { label: "Upcoming", value: events.length - completedCount - activeEvents.length, color: "border-l-amber-500" },
                    ].map(s => (
                        <div key={s.label} className={`bg-white rounded-xl border border-slate-200 border-l-4 ${s.color} p-4 shadow-sm`}>
                            <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                            <div className="text-xs font-semibold text-slate-500 mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Next Up Banner */}
                {nextEvent && (() => {
                    const cd = getCountdown(nextEvent.date);
                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 bg-white rounded-xl border border-slate-200 border-l-4 border-l-indigo-500 p-6 shadow-sm"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <Timer className="w-4 h-4 text-indigo-600" />
                                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Next Deadline</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">{nextEvent.title}</h3>
                            <p className="text-slate-500 text-sm mb-4">{nextEvent.description}</p>
                            {cd && (
                                <div className="flex items-center gap-4 flex-wrap">
                                    {[
                                        { val: cd.days, label: "Days" },
                                        { val: cd.hours, label: "Hours" },
                                        { val: cd.minutes, label: "Min" },
                                    ].map(t => (
                                        <div key={t.label} className="text-center">
                                            <div className="text-3xl font-black text-slate-800 tabular-nums">{t.val}</div>
                                            <div className="text-xs uppercase tracking-wider text-slate-400">{t.label}</div>
                                        </div>
                                    ))}
                                    <div className="ml-auto flex gap-2 flex-wrap">
                                        <a
                                            href={generateGoogleCalUrl(nextEvent)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-semibold text-white transition-colors shadow-sm"
                                        >
                                            <CalendarDays className="w-4 h-4" /> Add to Calendar
                                        </a>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    );
                })()}

                {/* Filter Bar */}
                <div className="flex items-center gap-2 mb-6 flex-wrap">
                    <Filter className="w-4 h-4 text-slate-400" />
                    {[{ id: "all", label: "All" }, ...Object.entries(categoryConfig).map(([id, cfg]) => ({ id, label: cfg.label }))].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f.id ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Timeline */}
                <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
                    <div className="space-y-4">
                        <AnimatePresence>
                            {filtered.map((event, idx) => {
                                const cfg = categoryConfig[event.category];
                                const cd = getCountdown(event.date);
                                const IconComp = cfg.icon;
                                const isCompleted = event.status === "completed";
                                const isActive = event.status === "active";
                                const isUrgent = event.status === "urgent";

                                return (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`relative pl-14 ${isCompleted ? "opacity-60" : ""}`}
                                    >
                                        {/* Dot */}
                                        <div className={`absolute left-4 top-5 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 ${isCompleted ? "bg-emerald-500 border-emerald-500" :
                                            isActive ? "bg-blue-500 border-blue-500 animate-pulse" :
                                                isUrgent ? "bg-red-500 border-red-500 animate-pulse" :
                                                    "bg-white border-slate-300"
                                            }`}>
                                            {isCompleted && <CheckCircle2 className="w-3 h-3 text-white" />}
                                        </div>

                                        {/* Card */}
                                        <div className={`bg-white rounded-xl border shadow-sm p-5 transition-all hover:shadow-md ${isActive ? "border-blue-300 ring-1 ring-blue-100" :
                                            isUrgent ? "border-red-300 ring-1 ring-red-100" :
                                                "border-slate-200"
                                            }`}>
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                                                        <IconComp className="w-3 h-3" /> {cfg.label}
                                                    </span>
                                                    {event.important && <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-md text-xs font-bold">Important</span>}
                                                    {isActive && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-xs font-bold animate-pulse">LIVE NOW</span>}
                                                    {isUrgent && <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-md text-xs font-bold">URGENT</span>}
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-xs font-bold text-slate-600">
                                                        {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                    </div>
                                                    {event.endDate && (
                                                        <div className="text-xs text-slate-400">
                                                            → {new Date(event.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <h4 className={`font-bold text-lg mb-1 ${isCompleted ? "text-slate-500 line-through" : "text-slate-900"}`}>{event.title}</h4>
                                            <p className="text-sm text-slate-500 mb-3">{event.description}</p>

                                            {/* Countdown */}
                                            {cd && !isCompleted && (
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {cd.days > 0 ? `${cd.days}d ${cd.hours}h remaining` : `${cd.hours}h ${cd.minutes}m remaining`}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Tips */}
                                            {event.tips && event.tips.length > 0 && !isCompleted && (
                                                <div className="bg-slate-50 rounded-lg p-3 mb-3 border border-slate-100">
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        <Info className="w-3.5 h-3.5 text-slate-500" />
                                                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tips</span>
                                                    </div>
                                                    <ul className="space-y-1">
                                                        {event.tips.map((tip, i) => (
                                                            <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                                                <span className="text-indigo-500 mt-0.5">•</span> {tip}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <a
                                                    href={generateGoogleCalUrl(event)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100"
                                                >
                                                    <Download className="w-3 h-3" /> Calendar
                                                </a>
                                                {event.link && (
                                                    <a
                                                        href={event.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                                                    >
                                                        <ExternalLink className="w-3 h-3" /> Visit Portal
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
