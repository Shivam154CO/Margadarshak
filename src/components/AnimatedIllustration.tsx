import { motion } from 'framer-motion';

interface AnimatedIllustrationProps {
    type: 'college' | 'aiBrain' | 'studentSuccess' | 'dataAnalysis' | 'overwhelmed' | 'complexData' | 'uncertainty';
    size?: number;
    className?: string;
}

export default function AnimatedIllustration({
    type,
    size = 160,
    className = '',
}: AnimatedIllustrationProps) {

    const renderIllustration = () => {
        switch (type) {
            case 'college':
                return (
                    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Main building */}
                        <motion.rect
                            x="60" y="80" width="80" height="80" rx="4"
                            fill="url(#collegeGrad1)"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            style={{ transformOrigin: 'bottom' }}
                        />
                        {/* Roof */}
                        <motion.path
                            d="M50 80L100 50L150 80Z"
                            fill="url(#collegeGrad2)"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        />
                        {/* Windows */}
                        {[0, 1, 2].map((row) =>
                            [0, 1, 2].map((col) => (
                                <motion.rect
                                    key={`${row}-${col}`}
                                    x={75 + col * 20}
                                    y={95 + row * 20}
                                    width="12"
                                    height="12"
                                    rx="2"
                                    fill="#FFF"
                                    opacity="0.9"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5 + (row * 3 + col) * 0.05, duration: 0.3 }}
                                />
                            ))
                        )}
                        {/* Floating books */}
                        <motion.rect
                            x="30" y="60" width="15" height="20" rx="2"
                            fill="#fbbf24"
                            animate={{ y: [60, 55, 60], rotate: [-5, 5, -5] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.rect
                            x="155" y="70" width="15" height="20" rx="2"
                            fill="#8b5cf6"
                            animate={{ y: [70, 65, 70], rotate: [5, -5, 5] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        />
                        <defs>
                            <linearGradient id="collegeGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#1e40af" />
                            </linearGradient>
                            <linearGradient id="collegeGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                    </svg>
                );

            case 'aiBrain':
                return (
                    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Brain outline */}
                        <motion.path
                            d="M100 40C80 40 65 55 65 75C65 80 66 85 68 89C62 92 58 98 58 105C58 115 65 123 75 125C75 130 78 135 82 138C87 141 92 143 100 143C108 143 113 141 118 138C122 135 125 130 125 125C135 123 142 115 142 105C142 98 138 92 132 89C134 85 135 80 135 75C135 55 120 40 100 40Z"
                            fill="url(#brainGrad)"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                        {/* Neural connections */}
                        {[
                            { x1: 75, y1: 70, x2: 90, y2: 85 },
                            { x1: 125, y1: 70, x2: 110, y2: 85 },
                            { x1: 85, y1: 100, x2: 100, y2: 115 },
                            { x1: 115, y1: 100, x2: 100, y2: 115 },
                        ].map((line, i) => (
                            <motion.line
                                key={i}
                                x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                                stroke="#a855f7"
                                strokeWidth="2"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                            />
                        ))}
                        {/* Pulsing nodes */}
                        {[
                            { cx: 75, cy: 70 },
                            { cx: 125, cy: 70 },
                            { cx: 85, cy: 100 },
                            { cx: 115, cy: 100 },
                            { cx: 100, cy: 115 },
                        ].map((node, i) => (
                            <motion.circle
                                key={i}
                                cx={node.cx} cy={node.cy} r="4"
                                fill="#ec4899"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                            />
                        ))}
                        <defs>
                            <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="50%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                    </svg>
                );

            case 'studentSuccess':
                return (
                    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Student body */}
                        <motion.circle
                            cx="100" cy="80" r="25"
                            fill="url(#studentGrad1)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                        />
                        <motion.path
                            d="M100 110C80 110 65 120 65 135V160H135V135C135 120 120 110 100 110Z"
                            fill="url(#studentGrad2)"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        />
                        {/* Graduation cap */}
                        <motion.path
                            d="M70 65L100 55L130 65L100 75L70 65Z"
                            fill="#fbbf24"
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.4 }}
                        />
                        <motion.rect
                            x="128" y="65" width="3" height="20"
                            fill="#fbbf24"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: 0.7, duration: 0.3 }}
                            style={{ transformOrigin: 'top' }}
                        />
                        {/* Success stars */}
                        {[
                            { x: 50, y: 50, delay: 1 },
                            { x: 150, y: 60, delay: 1.2 },
                            { x: 60, y: 120, delay: 1.4 },
                        ].map((star, i) => (
                            <motion.path
                                key={i}
                                d={`M${star.x} ${star.y}L${star.x + 3} ${star.y + 6}L${star.x + 10} ${star.y + 6}L${star.x + 4} ${star.y + 10}L${star.x + 6} ${star.y + 17}L${star.x} ${star.y + 12}L${star.x - 6} ${star.y + 17}L${star.x - 4} ${star.y + 10}L${star.x - 10} ${star.y + 6}L${star.x - 3} ${star.y + 6}Z`}
                                fill="#fbbf24"
                                initial={{ scale: 0, rotate: 0 }}
                                animate={{ scale: 1, rotate: 360 }}
                                transition={{ delay: star.delay, duration: 0.6 }}
                            />
                        ))}
                        <defs>
                            <linearGradient id="studentGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="#d97706" />
                            </linearGradient>
                            <linearGradient id="studentGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#1e40af" />
                            </linearGradient>
                        </defs>
                    </svg>
                );

            case 'dataAnalysis':
                return (
                    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Chart bars */}
                        {[
                            { x: 40, height: 60, delay: 0.1, color: '#10b981' },
                            { x: 70, height: 90, delay: 0.2, color: '#3b82f6' },
                            { x: 100, height: 75, delay: 0.3, color: '#8b5cf6' },
                            { x: 130, height: 110, delay: 0.4, color: '#ec4899' },
                        ].map((bar, i) => (
                            <motion.rect
                                key={i}
                                x={bar.x} y={160 - bar.height} width="20" height={bar.height} rx="4"
                                fill={bar.color}
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ delay: bar.delay, duration: 0.6, ease: "easeOut" }}
                                style={{ transformOrigin: 'bottom' }}
                            />
                        ))}
                        {/* Trend line */}
                        <motion.path
                            d="M50 130L80 100L110 115L140 70"
                            stroke="#fbbf24"
                            strokeWidth="3"
                            strokeLinecap="round"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.8, duration: 1 }}
                        />
                        {/* Data points */}
                        {[
                            { cx: 50, cy: 130 },
                            { cx: 80, cy: 100 },
                            { cx: 110, cy: 115 },
                            { cx: 140, cy: 70 },
                        ].map((point, i) => (
                            <motion.circle
                                key={i}
                                cx={point.cx} cy={point.cy} r="5"
                                fill="#fbbf24"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 1 + i * 0.1, duration: 0.3 }}
                            />
                        ))}
                        {/* Floating numbers */}
                        <motion.text
                            x="145" y="65" fill="#6366f1" fontSize="14" fontWeight="bold"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.5, duration: 0.5 }}
                        >
                            95.7%
                        </motion.text>
                    </svg>
                );

            case 'overwhelmed':
                return (
                    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Person head */}
                        <motion.circle
                            cx="100" cy="100" r="30"
                            fill="url(#overwhelmedGrad)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                        />
                        {/* Stressed expression */}
                        <motion.path
                            d="M90 95C90 95 92 90 95 90C98 90 100 95 100 95"
                            stroke="#1e40af"
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.5, duration: 0.3 }}
                        />
                        <motion.path
                            d="M110 95C110 95 112 90 115 90C118 90 120 95 120 95"
                            stroke="#1e40af"
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.5, duration: 0.3 }}
                        />
                        <motion.path
                            d="M90 115C90 115 95 110 100 110C105 110 110 115 110 115"
                            stroke="#1e40af"
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.6, duration: 0.3 }}
                        />
                        {/* Swirling elements representing confusion */}
                        {[0, 1, 2, 3, 4, 5].map((i) => {
                            const angle = (i * 60) * Math.PI / 180;
                            const radius = 60;
                            const x = 100 + Math.cos(angle) * radius;
                            const y = 100 + Math.sin(angle) * radius;
                            return (
                                <motion.circle
                                    key={i}
                                    cx={x} cy={y} r="8"
                                    fill={i % 2 === 0 ? '#ef4444' : '#f59e0b'}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{
                                        scale: [0, 1, 1, 0],
                                        opacity: [0, 1, 1, 0],
                                        x: [0, Math.cos(angle + Math.PI) * 20],
                                        y: [0, Math.sin(angle + Math.PI) * 20],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                        ease: "easeInOut"
                                    }}
                                />
                            );
                        })}
                        <defs>
                            <linearGradient id="overwhelmedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fbbf24" />
                                <stop offset="100%" stopColor="#f59e0b" />
                            </linearGradient>
                        </defs>
                    </svg>
                );

            case 'complexData':
                return (
                    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Network nodes */}
                        {[
                            { cx: 100, cy: 50, r: 12 },
                            { cx: 60, cy: 100, r: 10 },
                            { cx: 140, cy: 100, r: 10 },
                            { cx: 80, cy: 150, r: 8 },
                            { cx: 120, cy: 150, r: 8 },
                            { cx: 100, cy: 120, r: 15 },
                        ].map((node, i) => (
                            <motion.circle
                                key={i}
                                cx={node.cx} cy={node.cy} r={node.r}
                                fill={`url(#nodeGrad${i})`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.1, duration: 0.4 }}
                            />
                        ))}
                        {/* Connection lines */}
                        {[
                            { x1: 100, y1: 50, x2: 60, y2: 100 },
                            { x1: 100, y1: 50, x2: 140, y2: 100 },
                            { x1: 60, y1: 100, x2: 80, y2: 150 },
                            { x1: 140, y1: 100, x2: 120, y2: 150 },
                            { x1: 60, y1: 100, x2: 100, y2: 120 },
                            { x1: 140, y1: 100, x2: 100, y2: 120 },
                        ].map((line, i) => (
                            <motion.line
                                key={i}
                                x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                                stroke="#8b5cf6"
                                strokeWidth="2"
                                opacity="0.6"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 0.6 + i * 0.05, duration: 0.5 }}
                            />
                        ))}
                        {/* Pulsing effect on center node */}
                        <motion.circle
                            cx="100" cy="120" r="15"
                            initial={{ r: 15, opacity: 0.8 }}
                            animate={{ r: [15, 25, 15], opacity: [0.8, 0, 0.8] }}
                            stroke="#ec4899"
                            strokeWidth="2"
                            fill="none"
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <defs>
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                <linearGradient key={i} id={`nodeGrad${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={i % 2 === 0 ? '#6366f1' : '#8b5cf6'} />
                                    <stop offset="100%" stopColor={i % 2 === 0 ? '#8b5cf6' : '#ec4899'} />
                                </linearGradient>
                            ))}
                        </defs>
                    </svg>
                );

            case 'uncertainty':
                return (
                    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Large question mark */}
                        <motion.path
                            d="M100 60C85 60 75 70 75 85C75 85 75 90 80 95L100 115V125"
                            stroke="url(#uncertaintyGrad)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
                        />
                        <motion.circle
                            cx="100" cy="140" r="8"
                            fill="url(#uncertaintyGrad)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1, duration: 0.3 }}
                        />
                        {/* Floating smaller question marks */}
                        {[
                            { x: 50, y: 80, delay: 1.2, scale: 0.5 },
                            { x: 150, y: 90, delay: 1.4, scale: 0.4 },
                            { x: 60, y: 140, delay: 1.6, scale: 0.45 },
                            { x: 140, y: 130, delay: 1.8, scale: 0.4 },
                        ].map((q, i) => (
                            <motion.g
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{
                                    opacity: [0, 1, 1, 0],
                                    y: [20, 0, 0, -20],
                                }}
                                transition={{
                                    delay: q.delay,
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <path
                                    d={`M${q.x} ${q.y}C${q.x - 5 * q.scale} ${q.y} ${q.x - 8 * q.scale} ${q.y + 3 * q.scale} ${q.x - 8 * q.scale} ${q.y + 8 * q.scale}C${q.x - 8 * q.scale} ${q.y + 8 * q.scale} ${q.x - 8 * q.scale} ${q.y + 10 * q.scale} ${q.x - 6 * q.scale} ${q.y + 12 * q.scale}L${q.x} ${q.y + 18 * q.scale}V${q.y + 22 * q.scale}`}
                                    stroke="#6366f1"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    fill="none"
                                />
                                <circle cx={q.x} cy={q.y + 28 * q.scale} r="2" fill="#6366f1" />
                            </motion.g>
                        ))}
                        <defs>
                            <linearGradient id="uncertaintyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="50%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                    </svg>
                );

            default:
                return null;
        }
    };

    return (
        <div
            className={`inline-block ${className}`}
            style={{ width: size, height: size }}
        >
            {renderIllustration()}
        </div>
    );
}
