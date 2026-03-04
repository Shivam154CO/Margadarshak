import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
    GraduationCap,
    FileStack,
    TrendingDown,
    ChevronRight,
    School,
    Brain,
    BarChart3,
    AlertTriangle,
    Search,
    FileText,
    type LucideIcon,
} from 'lucide-react';

// =========================================
// 1. CONFIGURATION & DATA TYPES
// =========================================

export type ProblemId = 'chaos' | 'overload' | 'uncertainty';

export interface ProblemMetric {
    label: string;
    value: number; // 0-100
    icon: LucideIcon;
}

export interface ProblemData {
    id: ProblemId;
    label: string;
    tag: string;
    title: string;
    description: string;
    colors: {
        gradient: string;
        glow: string;
        ring: string;
        barColor: string;
    };
    stats: {
        statusLabel: string;
        statValue: string;
        statLabel: string;
    };
    metrics: ProblemMetric[];
    icons: LucideIcon[];
}

const PROBLEM_DATA: Record<ProblemId, ProblemData> = {
    chaos: {
        id: 'chaos',
        label: 'Choice Chaos',
        tag: 'Problem #01',
        title: 'Too Many Colleges.',
        description:
            'With over 340 colleges and 2,000+ branches across Maharashtra, picking just one is a nightmare. Every diploma student faces decision paralysis.',
        colors: {
            gradient: 'from-rose-600 to-red-900',
            glow: 'bg-rose-500',
            ring: 'border-l-rose-500/50',
            barColor: 'bg-rose-500',
        },
        stats: {
            statusLabel: 'Overwhelming',
            statValue: '340+',
            statLabel: 'Choice Combinations',
        },
        metrics: [
            { label: 'Confusion', value: 92, icon: Brain },
            { label: 'Colleges', value: 85, icon: School },
        ],
        icons: [GraduationCap, School, Brain],
    },
    overload: {
        id: 'overload',
        label: 'Data Overload',
        tag: 'Problem #02',
        title: 'Complex Data Overload.',
        description:
            'Searching through hundreds of pages of PDF cutoffs manually is slow, boring, and leads to costly mistakes that can ruin your admission.',
        colors: {
            gradient: 'from-amber-600 to-orange-900',
            glow: 'bg-amber-500',
            ring: 'border-l-amber-500/50',
            barColor: 'bg-amber-500',
        },
        stats: {
            statusLabel: 'Critical',
            statValue: '500+',
            statLabel: 'Pages of Raw Data',
        },
        metrics: [
            { label: 'Manual Effort', value: 96, icon: FileText },
            { label: 'Error Rate', value: 78, icon: Search },
        ],
        icons: [FileStack, FileText, Search],
    },
    uncertainty: {
        id: 'uncertainty',
        label: 'Yearly Shifts',
        tag: 'Problem #03',
        title: 'Uncertain Yearly Changes.',
        description:
            'Cutoffs change every year. Relying on old ranks is risky and can lead to you losing your dream seat to someone with a lower rank.',
        colors: {
            gradient: 'from-violet-600 to-purple-900',
            glow: 'bg-violet-500',
            ring: 'border-l-violet-500/50',
            barColor: 'bg-violet-500',
        },
        stats: {
            statusLabel: 'Unpredictable',
            statValue: '20%',
            statLabel: 'Average Yearly Shift',
        },
        metrics: [
            { label: 'Volatility', value: 88, icon: TrendingDown },
            { label: 'Risk Factor', value: 74, icon: AlertTriangle },
        ],
        icons: [BarChart3, TrendingDown, AlertTriangle],
    },
};

const PROBLEM_ORDER: ProblemId[] = ['chaos', 'overload', 'uncertainty'];

// =========================================
// 2. ANIMATION VARIANTS
// =========================================

const ANIMATIONS = {
    container: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.1 },
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.2 },
        },
    },
    item: {
        hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
        },
        exit: { opacity: 0, y: -10, filter: 'blur(5px)' },
    },
    visual: (index: number): Variants => ({
        initial: {
            opacity: 0,
            scale: 1.5,
            filter: 'blur(15px)',
            rotate: index === 0 ? -30 : index === 1 ? 0 : 30,
            x: index === 0 ? -80 : index === 2 ? 80 : 0,
        },
        animate: {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            rotate: 0,
            x: 0,
            transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
        },
        exit: {
            opacity: 0,
            scale: 0.6,
            filter: 'blur(20px)',
            transition: { duration: 0.25 },
        },
    }),
};

// =========================================
// 3. SUB-COMPONENTS
// =========================================

const BackgroundGradient = ({ activeId }: { activeId: ProblemId }) => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
            animate={{
                background:
                    activeId === 'chaos'
                        ? 'radial-gradient(circle at 20% 50%, rgba(225, 29, 72, 0.12), transparent 55%)'
                        : activeId === 'overload'
                            ? 'radial-gradient(circle at 50% 40%, rgba(245, 158, 11, 0.12), transparent 55%)'
                            : 'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.12), transparent 55%)',
            }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
        />
    </div>
);

/** Animated icon-based visual instead of a static image */
const ProblemVisual = ({ data, index }: { data: ProblemData; index: number }) => {
    const MainIcon = data.icons[0];
    const SecondaryIcon = data.icons[1];
    const TertiaryIcon = data.icons[2];

    return (
        <motion.div layout="position" className="relative group shrink-0">
            {/* Animated Rings */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className={`absolute inset-[-20%] rounded-full border border-dashed border-white/10 ${data.colors.ring}`}
            />
            <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${data.colors.gradient} blur-2xl opacity-40`}
            />

            {/* Visual Container */}
            <div className="relative h-72 w-72 md:h-[400px] md:w-[400px] rounded-full border border-white/5 shadow-2xl flex items-center justify-center overflow-hidden bg-black/20 backdrop-blur-sm">
                <motion.div
                    animate={{ y: [-8, 8, -8] }}
                    transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                    className="relative z-10 w-full h-full flex items-center justify-center"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={data.id}
                            variants={ANIMATIONS.visual(index)}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="relative flex items-center justify-center"
                        >
                            {/* Central Icon */}
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                                className={`w-28 h-28 md:w-36 md:h-36 rounded-[32px] bg-gradient-to-br ${data.colors.gradient} flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.4)]`}
                            >
                                <MainIcon className="w-14 h-14 md:w-20 md:h-20 text-white drop-shadow-lg" strokeWidth={1.5} />
                            </motion.div>

                            {/* Orbiting Secondary Icon */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                                className="absolute w-full h-full"
                                style={{ transformOrigin: 'center center' }}
                            >
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                                    <SecondaryIcon className="w-6 h-6 md:w-7 md:h-7 text-white/80" strokeWidth={1.5} />
                                </div>
                            </motion.div>

                            {/* Orbiting Tertiary Icon (reverse) */}
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                                className="absolute w-[140%] h-[140%]"
                                style={{ transformOrigin: 'center center' }}
                            >
                                <div className="absolute bottom-0 right-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
                                    <TertiaryIcon className="w-5 h-5 md:w-6 md:h-6 text-white/60" strokeWidth={1.5} />
                                </div>
                            </motion.div>

                            {/* Floating Particles */}
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        y: [0, -20, 0],
                                        x: [0, Math.sin(i * 1.2) * 15, 0],
                                        opacity: [0.3, 0.8, 0.3],
                                    }}
                                    transition={{
                                        duration: 3 + i * 0.5,
                                        repeat: Infinity,
                                        delay: i * 0.4,
                                    }}
                                    className={`absolute w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${data.colors.glow} blur-[1px]`}
                                    style={{
                                        top: `${20 + i * 15}%`,
                                        left: `${10 + i * 18}%`,
                                    }}
                                />
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Status Label */}
            <motion.div
                layout="position"
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500 bg-zinc-950/80 px-4 py-2 rounded-full border border-white/5 backdrop-blur">
                    <span className={`h-1.5 w-1.5 rounded-full ${data.colors.glow} animate-pulse`} />
                    {data.stats.statusLabel}
                </div>
            </motion.div>
        </motion.div>
    );
};

const ProblemDetails = ({
    data,
    isEven,
}: {
    data: ProblemData;
    isEven: boolean;
}) => {
    const alignClass = isEven ? 'items-end text-right' : 'items-start text-left';
    const flexDirClass = isEven ? 'flex-row-reverse' : 'flex-row';
    const barPositionClass = isEven
        ? `right-0 ${data.colors.barColor}`
        : `left-0 ${data.colors.barColor}`;

    return (
        <motion.div
            variants={ANIMATIONS.container}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`flex flex-col ${alignClass}`}
        >
            <motion.div
                variants={ANIMATIONS.item}
                className="inline-flex items-center px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-rose-400 font-extrabold text-[10px] uppercase tracking-widest mb-4"
            >
                {data.tag}
            </motion.div>
            <motion.h2
                variants={ANIMATIONS.item}
                className="text-3xl md:text-5xl font-extrabold tracking-tighter mb-3 text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 leading-tight"
            >
                {data.title}
            </motion.h2>
            <motion.p
                variants={ANIMATIONS.item}
                className={`text-zinc-400 mb-8 max-w-sm leading-relaxed ${isEven ? 'ml-auto' : 'mr-auto'}`}
            >
                {data.description}
            </motion.p>

            {/* Metrics Grid */}
            <motion.div
                variants={ANIMATIONS.item}
                className="w-full space-y-6 bg-zinc-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-sm"
            >
                {data.metrics.map((metric, idx) => (
                    <div key={metric.label} className="group">
                        <div
                            className={`flex items-center justify-between mb-3 text-sm ${flexDirClass}`}
                        >
                            <div
                                className={`flex items-center gap-2 ${metric.value > 50 ? 'text-zinc-200' : 'text-zinc-400'}`}
                            >
                                <metric.icon size={16} /> <span>{metric.label}</span>
                            </div>
                            <span className="font-mono text-xs text-zinc-500">
                                {metric.value}%
                            </span>
                        </div>
                        <div className="relative h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${metric.value}%` }}
                                transition={{ duration: 1, delay: 0.4 + idx * 0.15 }}
                                className={`absolute top-0 bottom-0 ${barPositionClass} opacity-80`}
                            />
                        </div>
                    </div>
                ))}

                <div className={`pt-4 flex ${isEven ? 'justify-end' : 'justify-start'}`}>
                    <button
                        type="button"
                        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-white transition-colors group"
                    >
                        <BarChart3 size={14} /> See Impact
                        <ChevronRight
                            size={14}
                            className="group-hover:translate-x-1 transition-transform"
                        />
                    </button>
                </div>
            </motion.div>

            {/* Stat */}
            <motion.div
                variants={ANIMATIONS.item}
                className={`mt-6 flex items-center gap-3 text-zinc-500 ${flexDirClass}`}
            >
                <span className="text-2xl font-extrabold text-white">
                    {data.stats.statValue}
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest">
                    {data.stats.statLabel}
                </span>
            </motion.div>
        </motion.div>
    );
};

const Switcher = ({
    activeId,
    onToggle,
}: {
    activeId: ProblemId;
    onToggle: (id: ProblemId) => void;
}) => {
    const options = PROBLEM_ORDER.map((id) => ({
        id,
        label: PROBLEM_DATA[id].label,
    }));

    return (
        <div className="flex justify-center mt-16 md:mt-20">
            <motion.div
                layout
                className="flex items-center gap-1 p-1.5 rounded-full bg-zinc-900/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/5"
            >
                {options.map((opt) => (
                    <motion.button
                        key={opt.id}
                        onClick={() => onToggle(opt.id)}
                        whileTap={{ scale: 0.96 }}
                        className="relative px-4 md:px-6 h-12 rounded-full flex items-center justify-center text-sm font-medium focus:outline-none"
                    >
                        {activeId === opt.id && (
                            <motion.div
                                layoutId="problem-surface"
                                className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-white/5 shadow-inner"
                                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                            />
                        )}
                        <span
                            className={`relative z-10 transition-colors duration-300 text-xs md:text-sm whitespace-nowrap ${activeId === opt.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            {opt.label}
                        </span>
                        {activeId === opt.id && (
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute -bottom-1 h-1 w-6 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                            />
                        )}
                    </motion.button>
                ))}
            </motion.div>
        </div>
    );
};

// =========================================
// 4. MAIN COMPONENT
// =========================================

export default function ProblemShowcase() {
    const [activeProblem, setActiveProblem] = useState<ProblemId>('chaos');

    const currentData = PROBLEM_DATA[activeProblem];
    const activeIndex = PROBLEM_ORDER.indexOf(activeProblem);
    const isEven = activeIndex % 2 === 1;

    return (
        <div className="relative w-full bg-[#050505] text-zinc-100 overflow-hidden py-20 md:py-32" data-theme="dark">
            <BackgroundGradient activeId={activeProblem} />

            {/* Section Header */}
            <div className="relative z-10 text-center mb-16 md:mb-24 px-6">
                <div className="inline-flex items-center px-4 py-1.5 bg-rose-900/20 border border-rose-900/30 rounded-full text-rose-400 font-extrabold text-[10px] uppercase tracking-[0.4em] mb-6">
                    The Diploma Struggle
                </div>
                <h2 className="text-4xl md:text-7xl font-black text-white/95 tracking-tighter leading-none">
                    Why Students{' '}
                    <span className="bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent italic">
                        Fail.
                    </span>
                </h2>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full px-6 max-w-7xl mx-auto">
                <motion.div
                    layout
                    transition={{ type: 'spring', bounce: 0, duration: 0.9 }}
                    className={`flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 lg:gap-36 w-full ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'
                        }`}
                >
                    {/* Visual */}
                    <ProblemVisual data={currentData} index={activeIndex} />

                    {/* Details */}
                    <motion.div layout="position" className="w-full max-w-md">
                        <AnimatePresence mode="wait">
                            <ProblemDetails
                                key={activeProblem}
                                data={currentData}
                                isEven={isEven}
                            />
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            </div>

            {/* Switcher */}
            <Switcher activeId={activeProblem} onToggle={setActiveProblem} />
        </div>
    );
}
