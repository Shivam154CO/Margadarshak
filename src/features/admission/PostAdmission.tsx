import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import {
    CheckCircle2, Circle, Clock,
    CreditCard, Building, BookOpen,
    FileText, Users, AlertTriangle, Star, ChevronDown,
    ChevronUp, Shield, ExternalLink, Info
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface LifecyclePhase {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    icon: any;
    color: string;
    bg: string;
    border: string;
    timeframe: string;
    tasks: LifecycleTask[];
}

interface LifecycleTask {
    id: string;
    title: string;
    description: string;
    deadline?: string;
    tips?: string;
    link?: string;
    urgent?: boolean;
}

const LIFECYCLE_PHASES: LifecyclePhase[] = [
    {
        id: "fee-payment",
        title: "Fee Payment & Financial Setup",
        subtitle: "Secure your seat",
        description: "Pay admission fees, apply for scholarships, and set up your finances for the academic year.",
        icon: CreditCard,
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        timeframe: "Within 3 days of allotment",
        tasks: [
            { id: "pay-admission-fee", title: "Pay Admission Fee", description: "Pay the tuition fee + development fee to the allotted college. Keep the receipt safely.", deadline: "Within 48 hours of allotment", tips: "Pay online for instant confirmation. Carry printed receipt to college.", urgent: true },
            { id: "apply-scholarship", title: "Apply for Scholarships on MahaDBT", description: "Register and apply on the MahaDBT portal for freeship / fee concession / scholarships.", deadline: "Within 60 days of admission", tips: "Many students miss the MahaDBT deadline. Apply within the first week!", link: "https://mahadbtmahait.gov.in" },
            { id: "education-loan", title: "Apply for Education Loan (if needed)", description: "Visit bank with admission letter, fee structure, and financial documents for loan application.", tips: "SBI, BOB, and Bank of Maharashtra have special student loan schemes." },
            { id: "caution-deposit", title: "Pay Caution/Security Deposit", description: "Some colleges charge a refundable caution deposit for labs, library, etc." },
        ],
    },
    {
        id: "physical-reporting",
        title: "Physical Reporting to College",
        subtitle: "Confirm your admission",
        description: "Report to the allotted college with all original documents for verification and final admission.",
        icon: Building,
        color: "text-indigo-700",
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        timeframe: "As per DTE schedule",
        tasks: [
            { id: "carry-originals", title: "Carry ALL Original Documents", description: "SSC marksheet, HSC/Diploma marksheet, CET/entrance score card, TC, LC, Migration Certificate, Caste certificate, Domicile, Aadhaar, photos.", urgent: true, tips: "Make 3 sets of photocopies. Originals will be kept by college." },
            { id: "fee-receipt", title: "Carry Fee Payment Receipt", description: "Printed receipt of online fee payment or demand draft.", urgent: true },
            { id: "anti-ragging", title: "Submit Anti-Ragging Affidavit", description: "Both student and parent must fill the AICTE anti-ragging affidavit online and submit printout.", link: "https://antiragging.in", tips: "Fill BEFORE reporting day. Both student and parent versions needed." },
            { id: "medical-fitness", title: "Get Medical Fitness Certificate", description: "Some colleges require a medical fitness certificate from a registered medical practitioner.", tips: "Get this from any MBBS doctor. Costs ₹100-200." },
            { id: "passport-photos", title: "Carry Passport-Size Photos", description: "At least 10 passport-size photos with white background.", tips: "Some colleges require specific size. Carry both stamp-size and passport-size." },
        ],
    },
    {
        id: "campus-setup",
        title: "Campus Life Setup",
        subtitle: "Get settled in",
        description: "Set up your campus life — hostel, transport, library, student ID, and more.",
        icon: BookOpen,
        color: "text-purple-700",
        bg: "bg-purple-50",
        border: "border-purple-200",
        timeframe: "First 2 weeks",
        tasks: [
            { id: "student-id", title: "Collect Student ID Card", description: "Get your official student ID from the college office. This is required for exams, library, and campus access." },
            { id: "hostel-apply", title: "Apply for Hostel (if needed)", description: "Submit hostel application form with required deposit. Hostel allotment is often first-come-first-served!", tips: "Apply on Day 1 of reporting. Popular colleges run out of hostel rooms fast." },
            { id: "transport", title: "Register for College Bus / Get Bus Pass", description: "If commuting, register for college bus service or get a government bus pass for students.", tips: "MSRTC student bus pass gives 50% discount. Apply at MSRTC depot." },
            { id: "library-card", title: "Get Library Card / Portal Access", description: "Register for library access and online learning portals provided by the college." },
            { id: "lab-induction", title: "Attend Lab Safety Induction", description: "Mandatory lab safety session usually held in the first week.", tips: "Don't skip this — some colleges won't allow lab access without completing induction." },
        ],
    },
    {
        id: "orientation",
        title: "Orientation & Academics",
        subtitle: "Start strong",
        description: "Attend orientation programs and understand the academic structure.",
        icon: Users,
        color: "text-cyan-700",
        bg: "bg-cyan-50",
        border: "border-cyan-200",
        timeframe: "First month",
        tasks: [
            { id: "orientation", title: "Attend College Orientation Program", description: "Meet faculty, understand college rules, syllabus structure, and examination patterns." },
            { id: "timetable", title: "Collect Timetable & Syllabus", description: "Get your class timetable, exam schedule, and detailed syllabus for each subject." },
            { id: "mentor-allotment", title: "Know Your Faculty Mentor", description: "You'll be assigned a faculty mentor for guidance throughout the year. Note their name, cabin number, and contact." },
            { id: "clubs", title: "Explore Student Clubs & Committees", description: "Join technical clubs (coding, robotics), cultural committees, and sports teams for wholesome development.", tips: "Clubs like ACM/GDSC/IEEE are great for resume-building and networking." },
            { id: "study-groups", title: "Form Study Groups", description: "Connect with classmates and seniors. Form study groups for difficult subjects." },
        ],
    },
    {
        id: "ragging-safety",
        title: "Safety & Anti-Ragging",
        subtitle: "Know your rights",
        description: "Understand anti-ragging policies, emergency contacts, and your rights as a student.",
        icon: Shield,
        color: "text-red-700",
        bg: "bg-red-50",
        border: "border-red-200",
        timeframe: "Always",
        tasks: [
            { id: "anti-ragging-helpline", title: "Save Anti-Ragging Helpline", description: "National Anti-Ragging Helpline: 1800-180-5522 (toll-free). Also save your college's internal cell number.", tips: "Report any incident immediately. All calls are confidential.", urgent: true },
            { id: "womens-cell", title: "Know Women's Grievance Cell", description: "Locate the Internal Complaints Committee (ICC) / Women's Grievance Cell at your college." },
            { id: "emergency-contacts", title: "Save Emergency Numbers", description: "College admin office, HOD, student welfare officer, nearest police station, ambulance." },
            { id: "ragging-awareness", title: "Attend Anti-Ragging Awareness Session", description: "Mandatory session in the first week. Ragging in any form is a criminal offense." },
        ],
    },
    {
        id: "semester-prep",
        title: "Semester Exam Preparation",
        subtitle: "Plan ahead",
        description: "Prepare for your first semester exams with proper planning.",
        icon: FileText,
        color: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
        timeframe: "Month 2–4",
        tasks: [
            { id: "exam-form", title: "Fill Exam Form Online", description: "Submit university exam form before the deadline. Late forms attract penalty fees.", tips: "SPPU/MSBTE exam forms usually open 45 days before exams." },
            { id: "internals", title: "Track Internal Assessment Marks", description: "Attend practicals, submit assignments on time, and maintain minimum attendance (75%).", tips: "Shortage of attendance can lead to ATKT. Track it weekly." },
            { id: "previous-papers", title: "Solve Previous Year Papers", description: "Practice last 5 years' question papers. Pattern and marking scheme understanding is crucial." },
            { id: "hall-ticket", title: "Download Hall Ticket", description: "Download and print your exam hall ticket from the university portal." },
        ],
    },
];

export default function PostAdmission() {
    const [completed, setCompleted] = useState<Record<string, boolean>>({});
    const [expandedPhase, setExpandedPhase] = useState<string | null>("fee-payment");

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

    // Load/save from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("ikigai-post-admission");
            if (saved) setCompleted(JSON.parse(saved));
        } catch { }
    }, []);

    useEffect(() => {
        localStorage.setItem("ikigai-post-admission", JSON.stringify(completed));
    }, [completed]);

    const toggle = (id: string) => {
        setCompleted(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const totalTasks = LIFECYCLE_PHASES.reduce((s, p) => s + p.tasks.length, 0);
    const totalCompleted = Object.values(completed).filter(Boolean).length;
    const progress = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar activeTab="post-admission" userProfile={profile} />
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Post-Admission Guide</h1>
                    <p className="text-sm text-slate-500 mt-1">Everything you need to do after getting your seat</p>
                </div>

                {/* Progress Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-slate-800">Your Post-Admission Progress</h3>
                        <span className="text-sm font-bold text-indigo-600">{totalCompleted} / {totalTasks} tasks</span>
                    </div>
                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden mb-3">
                        <motion.div
                            className="h-full bg-indigo-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                        <span className="text-slate-500">{progress}% Complete</span>
                        <span className="flex items-center gap-1 text-amber-600 font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {LIFECYCLE_PHASES.reduce((s, p) => s + p.tasks.filter(t => t.urgent && !completed[t.id]).length, 0)} urgent tasks remaining
                        </span>
                    </div>
                </motion.div>

                {/* Phases */}
                <div className="space-y-4">
                    {LIFECYCLE_PHASES.map((phase, pidx) => {
                        const Icon = phase.icon;
                        const phaseChecked = phase.tasks.filter(t => completed[t.id]).length;
                        const isComplete = phaseChecked === phase.tasks.length;
                        const isExpanded = expandedPhase === phase.id;

                        return (
                            <motion.div
                                key={phase.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: pidx * 0.05 }}
                                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${isComplete ? "border-emerald-200" : "border-slate-200"
                                    }`}
                            >
                                {/* Phase Header */}
                                <button
                                    onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                                    className="w-full flex items-center gap-4 p-5 hover:bg-slate-50/50 transition-colors"
                                >
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isComplete ? "bg-emerald-100" : phase.bg
                                        }`}>
                                        {isComplete ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                        ) : (
                                            <Icon className={`w-5 h-5 ${phase.color}`} />
                                        )}
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className={`font-bold text-base ${isComplete ? "text-emerald-700" : "text-slate-800"}`}>{phase.title}</h3>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${phase.bg} ${phase.color} border ${phase.border}`}>{phase.subtitle}</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {phase.timeframe}</span>
                                            <span className="text-xs font-semibold text-slate-500">{phaseChecked}/{phase.tasks.length} done</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <div className="w-12 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                                            <div
                                                className={`h-full rounded-full ${isComplete ? "bg-emerald-500" : "bg-indigo-500"}`}
                                                style={{ width: `${phase.tasks.length > 0 ? (phaseChecked / phase.tasks.length) * 100 : 0}%` }}
                                            />
                                        </div>
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </div>
                                </button>

                                {/* Tasks */}
                                {isExpanded && (
                                    <div className="border-t border-slate-100 px-5 py-2 divide-y divide-slate-50">
                                        {/* Phase Description */}
                                        <div className="py-3">
                                            <p className="text-sm text-slate-500">{phase.description}</p>
                                        </div>
                                        {phase.tasks.map(task => {
                                            const isDone = !!completed[task.id];
                                            return (
                                                <div
                                                    key={task.id}
                                                    className={`flex items-start gap-3 py-3 cursor-pointer hover:bg-slate-50/50 px-1 rounded-lg transition-colors ${isDone ? "opacity-60" : ""}`}
                                                    onClick={() => toggle(task.id)}
                                                >
                                                    <div className="mt-0.5 flex-shrink-0">
                                                        {isDone ? (
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                        ) : (
                                                            <Circle className="w-5 h-5 text-slate-300" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                                            <span className={`font-semibold text-sm ${isDone ? "line-through text-slate-400" : "text-slate-800"}`}>
                                                                {task.title}
                                                            </span>
                                                            {task.urgent && !isDone && (
                                                                <span className="px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded text-[10px] font-bold">URGENT</span>
                                                            )}
                                                            {task.deadline && (
                                                                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5">
                                                                    <Clock className="w-2.5 h-2.5" /> {task.deadline}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500">{task.description}</p>
                                                        {task.tips && (
                                                            <div className="flex items-start gap-1.5 mt-1.5 bg-blue-50 rounded-lg p-2 border border-blue-100">
                                                                <Info className="w-3 h-3 text-blue-500 flex-shrink-0 mt-0.5" />
                                                                <span className="text-xs text-blue-700">{task.tips}</span>
                                                            </div>
                                                        )}
                                                        {task.link && (
                                                            <a
                                                                href={task.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={e => e.stopPropagation()}
                                                                className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                                                            >
                                                                <ExternalLink className="w-3 h-3" /> Open Portal
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Completion Banner */}
                {progress === 100 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white text-center shadow-xl"
                    >
                        <Star className="w-12 h-12 mx-auto mb-3 text-yellow-300" />
                        <h3 className="text-2xl font-black mb-2">You're All Set!</h3>
                        <p className="text-white/80 text-sm max-w-md mx-auto">Congratulations! You've completed all post-admission tasks. Focus on your studies and enjoy your engineering journey!</p>
                    </motion.div>
                )}
            </main>
            <Footer />
        </div>
    );
}
