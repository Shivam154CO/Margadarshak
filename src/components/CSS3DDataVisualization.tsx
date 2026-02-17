import { motion } from 'framer-motion';

interface CSS3DDataVisualizationProps {
    size?: number;
    className?: string;
}

export default function CSS3DDataVisualization({
    size = 200,
    className = ''
}: CSS3DDataVisualizationProps) {
    const bars = [
        { height: 40, color: 'from-green-400 to-green-600', delay: 0 },
        { height: 65, color: 'from-blue-400 to-blue-600', delay: 0.1 },
        { height: 85, color: 'from-purple-400 to-purple-600', delay: 0.2 },
        { height: 55, color: 'from-pink-400 to-pink-600', delay: 0.3 },
    ];

    return (
        <div
            className={`relative ${className}`}
            style={{ width: size, height: size, perspective: '800px' }}
        >
            <motion.div
                className="relative w-full h-full flex items-end justify-around gap-4 px-8"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{
                    rotateY: [0, 15, 0, -15, 0],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                {bars.map((bar, index) => (
                    <motion.div
                        key={index}
                        className="relative flex-1"
                        style={{
                            transformStyle: 'preserve-3d',
                            height: `${bar.height}%`,
                        }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{
                            delay: bar.delay,
                            duration: 0.8,
                            type: 'spring',
                            stiffness: 100,
                        }}
                    >
                        {/* Front Face */}
                        <div
                            className={`absolute w-full h-full bg-gradient-to-t ${bar.color} rounded-t-lg`}
                            style={{
                                transform: 'translateZ(15px)',
                                boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.2)',
                            }}
                        />

                        {/* Top Face */}
                        <div
                            className={`absolute w-full bg-gradient-to-br ${bar.color.replace('to-', 'to-opacity-80 ')}`}
                            style={{
                                height: '30px',
                                top: 0,
                                transform: 'rotateX(90deg) translateZ(15px)',
                                transformOrigin: 'top',
                                opacity: 0.9,
                            }}
                        />

                        {/* Right Face */}
                        <div
                            className={`absolute h-full bg-gradient-to-t ${bar.color.replace('400', '500').replace('600', '700')}`}
                            style={{
                                width: '30px',
                                right: 0,
                                transform: 'rotateY(90deg) translateZ(15px)',
                                transformOrigin: 'right',
                                opacity: 0.7,
                            }}
                        />

                        {/* Animated Glow */}
                        <motion.div
                            className={`absolute inset-0 bg-gradient-to-t ${bar.color} rounded-t-lg blur-md`}
                            style={{
                                transform: 'translateZ(14px)',
                            }}
                            animate={{
                                opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: bar.delay,
                            }}
                        />

                        {/* Value Label */}
                        <motion.div
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm bg-gray-900/80 px-2 py-1 rounded"
                            style={{
                                transform: 'translateZ(20px) translateX(-50%)',
                            }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: bar.delay + 0.5,
                                duration: 0.5,
                            }}
                        >
                            {bar.height}%
                        </motion.div>
                    </motion.div>
                ))}

                {/* Grid Lines */}
                {[0, 25, 50, 75, 100].map((percent) => (
                    <div
                        key={percent}
                        className="absolute left-0 right-0 border-t border-gray-300/30"
                        style={{
                            bottom: `${percent}%`,
                            transform: 'translateZ(-10px)',
                        }}
                    />
                ))}

                {/* Connecting Line */}
                <motion.svg
                    className="absolute inset-0"
                    style={{
                        transform: 'translateZ(20px)',
                    }}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                        delay: 0.5,
                        duration: 1.5,
                        ease: 'easeInOut',
                    }}
                >
                    <motion.path
                        d={`M ${size * 0.15} ${size * (1 - bars[0].height / 100)} 
                L ${size * 0.38} ${size * (1 - bars[1].height / 100)} 
                L ${size * 0.62} ${size * (1 - bars[2].height / 100)} 
                L ${size * 0.85} ${size * (1 - bars[3].height / 100)}`}
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="33%" stopColor="#3b82f6" />
                            <stop offset="66%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                    </defs>
                </motion.svg>

                {/* Data Points */}
                {bars.map((bar, index) => (
                    <motion.div
                        key={`point-${index}`}
                        className="absolute w-3 h-3 bg-white rounded-full shadow-lg"
                        style={{
                            left: `${15 + index * 23.3}%`,
                            bottom: `${bar.height}%`,
                            transform: 'translateZ(22px) translate(-50%, 50%)',
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{
                            delay: bar.delay + 1,
                            duration: 2,
                            repeat: Infinity,
                        }}
                    />
                ))}
            </motion.div>
        </div>
    );
}
