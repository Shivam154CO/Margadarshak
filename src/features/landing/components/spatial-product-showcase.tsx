import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
    ChevronRight,
    School,
    Brain,
    TrendingDown,
    AlertTriangle,
    Search,
    FileText,
    BarChart3,
    type LucideIcon,
} from 'lucide-react';

// Illustrations
import chaosMain from '../../../assets/illustrations/mw.jpg';

import overloadMain from '../../../assets/problem-complex-data.png';

import uncertaintyMain from '../../../assets/illustrations/problem-uncertainty.png';

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
    illustration: string;
    orbitImages: string[];
}

const PROBLEM_DATA: Record<ProblemId, ProblemData> = {
    chaos: {
        id: 'chaos',
        label: 'Choice Chaos',
        title: 'Too Many Colleges.',
        description:
            'With over 340 colleges and 2,000+ branches across Maharashtra, picking just one is a nightmare. Every diploma student faces decision paralysis.',
        colors: {
            gradient: 'from-slate-100 to-slate-200',
            glow: 'bg-rose-500',
            ring: 'border-l-rose-500/50',
            barColor: 'bg-rose-600',
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
        icons: [],
        illustration: chaosMain,
        orbitImages: [],
    },
    overload: {
        id: 'overload',
        label: 'Data Overload',
        title: 'Complex Data Overload.',
        description:
            'Searching through hundreds of pages of PDF cutoffs manually is slow, boring, and leads to costly mistakes that can ruin your admission.',
        colors: {
            gradient: 'from-slate-100 to-slate-200',
            glow: 'bg-rose-500',
            ring: 'border-l-rose-500/50',
            barColor: 'bg-rose-600',
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
        icons: [],
        illustration: overloadMain,
        orbitImages: [],
    },
    uncertainty: {
        id: 'uncertainty',
        label: 'Yearly Shifts',
        title: 'Uncertain Yearly Changes.',
        description:
            'Cutoffs change every year. Relying on old ranks is risky and can lead to you losing your dream seat to someone with a lower rank.',
        colors: {
            gradient: 'from-slate-100 to-slate-200',
            glow: 'bg-rose-500',
            ring: 'border-l-rose-500/50',
            barColor: 'bg-rose-600',
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
        icons: [],
        illustration: uncertaintyMain,
        orbitImages: [],
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
                        ? 'radial-gradient(circle at 20% 50%, rgba(225, 29, 72, 0.03), transparent 55%)'
                        : activeId === 'overload'
                            ? 'radial-gradient(circle at 50% 40%, rgba(225, 29, 72, 0.03), transparent 55%)'
                            : 'radial-gradient(circle at 80% 50%, rgba(225, 29, 72, 0.03), transparent 55%)',
            }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
        />
    </div>
);

/** Animated icon-based visual instead of a static image */
const ProblemVisual = ({ data, index }: { data: ProblemData; index: number }) => {
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
            <div className="relative h-72 w-72 md:h-[400px] md:w-[400px] rounded-full border border-slate-100 shadow-2xl flex items-center justify-center bg-white/10">
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
                            {/* Central Illustration */}
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                                className="w-56 h-56 md:w-80 md:h-80 rounded-full bg-white flex items-center justify-center shadow-[0_30px_100px_rgba(0,0,0,0.08)] border border-slate-100/50"
                            >
                                <img
                                    src={data.illustration}
                                    alt={data.title}
                                    className="w-full h-full object-contain p-6 hover:scale-105 transition-transform duration-700"
                                    loading="eager"
                                />
                            </motion.div>

                            {/* Orbiting Secondary Image */}
                            {data.orbitImages[0] && (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                                    className="absolute w-full h-full"
                                    style={{ transformOrigin: 'center center' }}
                                >
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-white border border-slate-100 flex items-center justify-center shadow-xl overflow-hidden p-3">
                                        <img
                                            src={data.orbitImages[0]}
                                            alt="detail"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* Orbiting Tertiary Image */}
                            {data.orbitImages[1] && (
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                                    className="absolute w-[140%] h-[140%]"
                                    style={{ transformOrigin: 'center center' }}
                                >
                                    <div className="absolute bottom-0 right-0 w-16 h-16 md:w-24 md:h-24 rounded-full bg-white border border-slate-50 flex items-center justify-center shadow-2xl overflow-hidden p-2">
                                        <img
                                            src={data.orbitImages[1]}
                                            alt="secondary detail"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </motion.div>
                            )}

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
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm backdrop-blur">
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
            <motion.h2
                variants={ANIMATIONS.item}
                className="text-3xl md:text-6xl font-black tracking-tighter mb-4 text-slate-900 leading-none"
            >
                {data.title}
            </motion.h2>
            <motion.p
                variants={ANIMATIONS.item}
                className={`text-slate-500 text-lg font-medium mb-10 max-w-sm leading-relaxed ${isEven ? 'ml-auto' : 'mr-auto'}`}
            >
                {data.description}
            </motion.p>

            {/* Metrics Grid */}
            <motion.div
                variants={ANIMATIONS.item}
                className="w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)]"
            >
                {data.metrics.map((metric, idx) => (
                    <div key={metric.label} className="group">
                        <div
                            className={`flex items-center justify-between mb-3 text-sm font-bold ${flexDirClass}`}
                        >
                            <div
                                className={`flex items-center gap-2 ${metric.value > 50 ? 'text-slate-900' : 'text-slate-600'}`}
                            >
                                <metric.icon size={18} className="text-rose-500" /> <span>{metric.label}</span>
                            </div>
                            <span className="font-mono text-xs text-rose-500 bg-rose-50 px-2 py-0.5 rounded">
                                {metric.value}%
                            </span>
                        </div>
                        <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${metric.value}%` }}
                                transition={{ duration: 1, delay: 0.4 + idx * 0.15 }}
                                className={`absolute top-0 bottom-0 ${barPositionClass} shadow-[0_0_10px_rgba(225,29,72,0.3)]`}
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
                className={`mt-10 flex items-center gap-4 text-slate-400 ${flexDirClass}`}
            >
                <span className="text-4xl font-black text-slate-950 tracking-tighter">
                    {data.stats.statValue}
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
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
                className="flex items-center gap-1 p-1.5 rounded-full bg-slate-100/50 border border-slate-200 shadow-lg backdrop-blur-sm"
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
                                className="absolute inset-0 rounded-full bg-slate-950 shadow-xl"
                                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                            />
                        )}
                        <span
                            className={`relative z-10 transition-colors duration-300 text-xs md:text-sm whitespace-nowrap ${activeId === opt.id ? 'text-white font-bold' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {opt.label}
                        </span>
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
        <div className="relative w-full bg-white text-slate-900 overflow-hidden py-20 md:py-32" data-theme="light">
            <BackgroundGradient activeId={activeProblem} />

            {/* Section Header */}
            <div className="relative z-10 text-center mb-16 md:mb-24 px-6">

                <h2 className="text-4xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none">
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
