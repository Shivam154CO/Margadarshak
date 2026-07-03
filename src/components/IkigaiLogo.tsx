import { motion } from 'framer-motion';

interface IkigaiLogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showText?: boolean;
    className?: string;
    lightText?: boolean;
}

export default function IkigaiLogo({
    size = 'md',
    showText = true,
    className = '',
    lightText = false
}: IkigaiLogoProps) {
    const sizes = {
        sm: { icon: 48, text: 'text-2xl', spacing: 'gap-3', sub: 'text-[10px]' },
        md: { icon: 60, text: 'text-3xl', spacing: 'gap-3.5', sub: 'text-[11px]' },
        lg: { icon: 84, text: 'text-5xl', spacing: 'gap-4.5', sub: 'text-sm' },
        xl: { icon: 128, text: 'text-7xl', spacing: 'gap-6', sub: 'text-lg' }
    };

    const s = sizes[size];
    const textColorClass = lightText ? 'text-white' : 'text-slate-900';
    const subTextColorClass = lightText ? 'text-indigo-300' : 'text-slate-500';

    return (
        <div className={`flex items-center ${s.spacing} ${className}`}>

            {/* Custom Engineered Geometric Logo Mark */}
            <div className="relative flex-shrink-0 group" style={{ width: s.icon, height: s.icon }}>

                {/* Background ambient glow */}
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full group-hover:bg-indigo-500/30 transition-all duration-500" />

                <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">

                    {/* Left Volume: Student Academic Profile Data */}
                    <path
                        d="M15 42 L50 60 L50 92 L15 74 Z"
                        fill="url(#leftDataStream)"
                        className="group-hover:opacity-90 transition-opacity"
                    />

                    {/* Right Volume: Global College & Cutoff Data */}
                    <path
                        d="M50 60 L85 42 L85 74 L50 92 Z"
                        fill="url(#rightDataStream)"
                        className="group-hover:opacity-90 transition-opacity"
                    />

                    {/* Elevated Intelligence Plane: The AI Engine combining both worlds */}
                    <motion.path
                        initial={{ y: 0 }}
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        d="M50 12 L85 30 L50 48 L15 30 Z"
                        fill="url(#aiPredictorPlane)"
                    />

                    {/* Active Processing Link (Vertical Energy Beam) */}
                    <path
                        d="M50 48 L50 60"
                        stroke="url(#energyBeam)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        className="opacity-70 group-hover:opacity-100 transition-opacity"
                    />

                    {/* The Prediction "Sweet Spot" (Exact College Match) */}
                    <motion.g
                        initial={{ y: 0 }}
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <circle cx="50" cy="30" r="4.5" fill="#ffffff" />
                        <circle cx="50" cy="30" r="10" fill="#ffffff" opacity="0.4" />

                        {/* Radar Ping Effect */}
                        <motion.circle
                            cx="50" cy="30" r="4.5"
                            initial={{ r: 4.5, opacity: 0.8 }}
                            animate={{ r: [4.5, 18], opacity: [0.8, 0] }}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                        />
                    </motion.g>

                    <defs>
                        {/* Deep structural blue representing the student's foundation */}
                        <linearGradient id="leftDataStream" x1="15" y1="42" x2="50" y2="92" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#4f46e5" /> {/* Indigo 600 */}
                            <stop offset="1" stopColor="#1e1b4b" /> {/* Indigo 950 */}
                        </linearGradient>

                        {/* Vibrant purple representing the complex, vast college dataset */}
                        <linearGradient id="rightDataStream" x1="50" y1="60" x2="85" y2="92" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#9333ea" /> {/* Purple 600 */}
                            <stop offset="1" stopColor="#3b0764" /> {/* Purple 950 */}
                        </linearGradient>

                        {/* High-energy gradient representing the predictive ML capability */}
                        <linearGradient id="aiPredictorPlane" x1="15" y1="30" x2="85" y2="30" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#ec4899" /> {/* Pink 500 */}
                            <stop offset="0.5" stopColor="#8b5cf6" /> {/* Violet 500 */}
                            <stop offset="1" stopColor="#3b82f6" /> {/* Blue 500 */}
                        </linearGradient>

                        {/* Processing energy beam */}
                        <linearGradient id="energyBeam" x1="50" y1="48" x2="50" y2="60" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#ffffff" />
                            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Premium Typography Configuration */}
            {showText && (
                <div className="flex flex-col justify-center translate-y-0.5">
                    <span className={`${s.text} font-black ${textColorClass} tracking-tighter leading-[0.85]`}>
                        Ikigai
                    </span>
                    <span className={`${s.sub} font-bold ${subTextColorClass} uppercase tracking-[0.25em] mt-1 leading-none`}>
                        Prediction Engine
                    </span>
                </div>
            )}

        </div>
    );
}
