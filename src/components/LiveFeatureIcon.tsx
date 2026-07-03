import { motion } from "framer-motion";

interface LiveFeatureIconProps {
    type: "brain" | "target" | "college" | "chart" | "student" | "trophy";
    size?: number;
    className?: string;
}

export default function LiveFeatureIcon({
    type,
    size = 48,
    className = "",
}: LiveFeatureIconProps) {
    const renderIcon = () => {
        switch (type) {
            case "brain":
                return (
                    <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Brain Nodes */}
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="12"
                            className="fill-rose-600/20 stroke-rose-600 stroke-2"
                            animate={{ r: [12, 14, 12] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
                            const x = 50 + 30 * Math.cos((angle * Math.PI) / 180);
                            const y = 50 + 30 * Math.sin((angle * Math.PI) / 180);
                            return (
                                <g key={i}>
                                    <motion.line
                                        x1="50"
                                        y1="50"
                                        x2={x}
                                        y2={y}
                                        className="stroke-rose-600/30 stroke-[1.5]"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity, repeatType: "reverse" }}
                                    />
                                    <motion.circle
                                        cx={x}
                                        cy={y}
                                        r="4"
                                        className="fill-rose-600 stroke-rose-600 stroke-1"
                                        animate={{ scale: [1, 1.3, 1] }}
                                        transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                                    />
                                    {/* Energy dot flowing along line */}
                                    <motion.circle
                                        cx="50"
                                        cy="50"
                                        r="2"
                                        className="fill-rose-600"
                                        animate={{
                                            cx: [50, x],
                                            cy: [50, y],
                                            opacity: [0, 1, 0],
                                        }}
                                        transition={{
                                            duration: 2,
                                            delay: i * 0.3,
                                            repeat: Infinity,
                                            ease: "linear",
                                        }}
                                    />
                                </g>
                            );
                        })}
                    </svg>
                );

            case "target":
                return (
                    <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Radar Rings */}
                        {[20, 35, 50].map((r, i) => (
                            <motion.circle
                                key={i}
                                cx="50"
                                cy="50"
                                r={r}
                                className="stroke-rose-600/30 stroke-[1.5]"
                                animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
                                transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                            />
                        ))}
                        {/* Radar Sweep */}
                        <motion.g
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            style={{ originX: "50px", originY: "50px" }}
                        >
                            <line
                                x1="50"
                                y1="50"
                                x2="50"
                                y2="0"
                                className="stroke-rose-600 stroke-2"
                                style={{ strokeLinecap: "round" }}
                            />
                            <path
                                d="M50 0 A50 50 0 0 1 100 50 L50 50 Z"
                                className="fill-rose-600/10"
                            />
                        </motion.g>
                        {/* Blips */}
                        {[
                            { x: 70, y: 30 },
                            { x: 35, y: 75 },
                            { x: 60, y: 65 }
                        ].map((p, i) => (
                            <motion.circle
                                key={i}
                                cx={p.x}
                                cy={p.y}
                                r="3"
                                className="fill-rose-600"
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 4, delay: i * 1.2, repeat: Infinity }}
                            />
                        ))}
                    </svg>
                );

            case "college":
                return (
                    <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Graduation Cap (Stylized) */}
                        <motion.g
                            animate={{ y: [-2, 2, -2] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <path
                                d="M20 40 L50 25 L80 40 L50 55 Z"
                                className="fill-rose-600 stroke-rose-600 stroke-2"
                            />
                            <path
                                d="M30 45 V60 C30 60 50 70 70 60 V45"
                                className="stroke-rose-600 stroke-2"
                                style={{ strokeLinecap: "round", strokeLinejoin: "round" }}
                            />
                            <motion.path
                                d="M80 40 V55"
                                className="stroke-rose-600 stroke-2"
                                animate={{ rotate: [-5, 5, -5] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                style={{ originX: "80px", originY: "40px" }}
                            />
                        </motion.g>
                        {/* Sparkles */}
                        {[
                            { x: 25, y: 25, d: 0 },
                            { x: 75, y: 25, d: 0.5 },
                            { x: 50, y: 75, d: 1 }
                        ].map((s, i) => (
                            <motion.path
                                key={i}
                                d="M50 45 L52 50 L57 50 L53 53 L55 58 L50 55 L45 58 L47 53 L43 50 L48 50 Z"
                                className="fill-rose-500"
                                initial={{ scale: 0, x: s.x - 50, y: s.y - 50 }}
                                animate={{ scale: [0, 0.6, 0], opacity: [0, 1, 0] }}
                                transition={{ duration: 2, delay: s.d, repeat: Infinity }}
                            />
                        ))}
                    </svg>
                );

            case "chart":
                return (
                    <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Grid lines */}
                        <line x1="20" y1="80" x2="80" y2="80" className="stroke-slate-200 stroke-2" />
                        <line x1="20" y1="80" x2="20" y2="20" className="stroke-slate-200 stroke-2" />

                        {/* Animated Bars */}
                        {[
                            { x: 30, h: 40, d: 0 },
                            { x: 45, h: 60, d: 0.2 },
                            { x: 60, h: 35, d: 0.4 },
                            { x: 75, h: 55, d: 0.6 }
                        ].map((bar, i) => (
                            <motion.rect
                                key={i}
                                x={bar.x}
                                y={80 - bar.h}
                                width="8"
                                height={bar.h}
                                className="fill-rose-600/40 stroke-rose-600 stroke-1"
                                initial={{ height: 0, y: 80 }}
                                animate={{ height: [0, bar.h, bar.h * 0.8, bar.h], y: [80, 80 - bar.h, 80 - bar.h * 0.8, 80 - bar.h] }}
                                transition={{ duration: 2, delay: bar.d, repeat: Infinity, repeatDelay: 1 }}
                            />
                        ))}

                        {/* Trending Line */}
                        <motion.path
                            d="M25 70 L40 50 L55 60 L75 30"
                            className="stroke-rose-600 stroke-2"
                            style={{ strokeLinecap: "round", strokeLinejoin: "round" }}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.circle
                            cx="25"
                            cy="70"
                            r="3"
                            className="fill-rose-600"
                            animate={{
                                cx: [25, 40, 55, 75],
                                cy: [70, 50, 60, 30],
                                opacity: [0, 1, 1, 0]
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                    </svg>
                );

            case "student":
                return (
                    <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Person Icon (Stylized) */}
                        <motion.circle
                            cx="50"
                            cy="35"
                            r="12"
                            className="stroke-rose-600 stroke-2"
                            animate={{ y: [-1, 1, -1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.path
                            d="M30 75 C30 60 40 55 50 55 C60 55 70 60 70 75"
                            className="stroke-rose-600 stroke-2"
                            animate={{ opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        {/* Thinking / Idea Spark */}
                        <motion.circle
                            cx="70"
                            cy="25"
                            r="2"
                            className="fill-rose-500"
                            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <motion.path
                            d="M65 35 L75 15"
                            className="stroke-rose-600/30 stroke-1"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </svg>
                );

            case "trophy":
                return (
                    <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Trophy Shape */}
                        <motion.path
                            d="M35 30 H65 V50 C65 65 35 65 35 50 Z"
                            className="fill-rose-600/20 stroke-rose-600 stroke-2"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <path d="M50 63 V75 M40 75 H60" className="stroke-rose-600 stroke-2" />
                        <path d="M35 35 H25 V45 C25 50 35 50 35 50 M65 35 H75 V45 C75 50 65 50 65 50" className="stroke-rose-600 stroke-2" />

                        {/* Shine / Glint */}
                        <motion.rect
                            x="40"
                            y="35"
                            width="4"
                            height="20"
                            className="fill-white/40"
                            animate={{ x: [40, 56, 40], opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </svg>
                );

            default:
                return null;
        }
    };

    return (
        <div
            className={`inline-block ${className}`}
            style={{ width: `${size}px`, height: `${size}px` }}
        >
            {renderIcon()}
        </div>
    );
}
