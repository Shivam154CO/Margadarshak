import { motion } from 'framer-motion';

interface CSS3DCollegeProps {
    size?: number;
    className?: string;
}

export default function CSS3DCollege({ size = 200, className = '' }: CSS3DCollegeProps) {
    return (
        <div className={`relative ${className}`} style={{ width: size, height: size, perspective: '1000px' }}>
            <motion.div
                className="relative w-full h-full"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{
                    rotateY: [0, 360],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            >
                {/* Main Building */}
                <div
                    className="absolute"
                    style={{
                        width: '60%',
                        height: '80%',
                        left: '20%',
                        top: '10%',
                        transformStyle: 'preserve-3d',
                        transform: 'translateZ(0px)',
                    }}
                >
                    {/* Front Face */}
                    <div
                        className="absolute w-full h-full bg-gradient-to-b from-blue-500 to-blue-700 rounded-t-lg"
                        style={{
                            transform: 'translateZ(30px)',
                            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)',
                        }}
                    >
                        {/* Windows */}
                        {[0, 1, 2].map((row) =>
                            [0, 1, 2].map((col) => (
                                <motion.div
                                    key={`${row}-${col}`}
                                    className="absolute bg-yellow-300 rounded-sm"
                                    style={{
                                        width: '15%',
                                        height: '12%',
                                        left: `${20 + col * 25}%`,
                                        top: `${20 + row * 20}%`,
                                    }}
                                    animate={{
                                        opacity: [0.6, 1, 0.6],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: (row + col) * 0.2,
                                    }}
                                />
                            ))
                        )}
                        {/* Door */}
                        <div
                            className="absolute bg-gradient-to-b from-gray-700 to-gray-900 rounded-t-lg"
                            style={{
                                width: '20%',
                                height: '25%',
                                left: '40%',
                                bottom: '0%',
                            }}
                        />
                    </div>

                    {/* Back Face */}
                    <div
                        className="absolute w-full h-full bg-gradient-to-b from-blue-600 to-blue-800 rounded-t-lg"
                        style={{
                            transform: 'translateZ(-30px) rotateY(180deg)',
                        }}
                    />

                    {/* Left Face */}
                    <div
                        className="absolute h-full bg-gradient-to-b from-blue-400 to-blue-600"
                        style={{
                            width: '60px',
                            left: '0',
                            transform: 'rotateY(-90deg) translateZ(30px)',
                            transformOrigin: 'left',
                        }}
                    />

                    {/* Right Face */}
                    <div
                        className="absolute h-full bg-gradient-to-b from-blue-400 to-blue-600"
                        style={{
                            width: '60px',
                            right: '0',
                            transform: 'rotateY(90deg) translateZ(30px)',
                            transformOrigin: 'right',
                        }}
                    />

                    {/* Roof */}
                    <div
                        className="absolute w-full bg-gradient-to-br from-red-600 to-red-800"
                        style={{
                            height: '20%',
                            top: '-10%',
                            transform: 'rotateX(45deg) translateZ(20px)',
                            transformOrigin: 'bottom',
                            clipPath: 'polygon(0 100%, 50% 0, 100% 100%)',
                        }}
                    />
                </div>

                {/* Columns */}
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="absolute bg-gradient-to-b from-gray-200 to-gray-400"
                        style={{
                            width: '5%',
                            height: '60%',
                            left: `${15 + i * 20}%`,
                            bottom: '10%',
                            transform: `translateZ(35px)`,
                            borderRadius: '2px',
                            boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
                        }}
                    />
                ))}

                {/* Flag */}
                <motion.div
                    className="absolute"
                    style={{
                        width: '2%',
                        height: '25%',
                        left: '49%',
                        top: '-5%',
                        transform: 'translateZ(40px)',
                        background: 'linear-gradient(to bottom, #8B4513, #654321)',
                    }}
                >
                    <motion.div
                        className="absolute bg-gradient-to-r from-orange-500 to-red-500"
                        style={{
                            width: '200%',
                            height: '30%',
                            left: '100%',
                            top: '10%',
                        }}
                        animate={{
                            scaleX: [1, 0.9, 1],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                </motion.div>
            </motion.div>
        </div>
    );
}
