import { motion } from 'framer-motion';

interface CSS3DStudentProps {
    size?: number;
    className?: string;
}

export default function CSS3DStudent({ size = 200, className = '' }: CSS3DStudentProps) {
    return (
        <div
            className={`relative ${className}`}
            style={{ width: size, height: size, perspective: '1000px' }}
        >
            <motion.div
                className="relative w-full h-full"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{
                    y: [0, -10, 0],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                {/* Graduation Cap */}
                <motion.div
                    className="absolute"
                    style={{
                        width: '50%',
                        height: '8%',
                        left: '25%',
                        top: '15%',
                        transformStyle: 'preserve-3d',
                    }}
                    animate={{
                        rotateZ: [-5, 5, -5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    {/* Cap Top */}
                    <div
                        className="absolute w-full h-full bg-gradient-to-br from-gray-800 to-gray-900"
                        style={{
                            transform: 'translateZ(10px)',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                        }}
                    />
                    <div
                        className="absolute w-full h-full bg-gradient-to-br from-gray-700 to-gray-800"
                        style={{
                            transform: 'rotateX(90deg) translateZ(5px)',
                            transformOrigin: 'bottom',
                        }}
                    />

                    {/* Tassel */}
                    <motion.div
                        className="absolute bg-yellow-500"
                        style={{
                            width: '3%',
                            height: '40px',
                            left: '95%',
                            top: '50%',
                            transform: 'translateZ(12px)',
                        }}
                        animate={{
                            rotateZ: [0, 15, -15, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    >
                        <div
                            className="absolute w-4 h-4 bg-yellow-400 rounded-full"
                            style={{
                                bottom: '-8px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                            }}
                        />
                    </motion.div>
                </motion.div>

                {/* Head */}
                <div
                    className="absolute bg-gradient-to-br from-amber-200 to-amber-300 rounded-full"
                    style={{
                        width: '35%',
                        height: '35%',
                        left: '32.5%',
                        top: '20%',
                        transform: 'translateZ(5px)',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                    }}
                >
                    {/* Eyes */}
                    <div
                        className="absolute w-2 h-2 bg-gray-800 rounded-full"
                        style={{ left: '30%', top: '40%' }}
                    />
                    <div
                        className="absolute w-2 h-2 bg-gray-800 rounded-full"
                        style={{ right: '30%', top: '40%' }}
                    />

                    {/* Smile */}
                    <div
                        className="absolute border-b-2 border-gray-800 rounded-full"
                        style={{
                            width: '40%',
                            height: '20%',
                            left: '30%',
                            top: '55%',
                        }}
                    />
                </div>

                {/* Body */}
                <div
                    className="absolute"
                    style={{
                        width: '40%',
                        height: '35%',
                        left: '30%',
                        top: '50%',
                        transformStyle: 'preserve-3d',
                    }}
                >
                    {/* Torso - Front */}
                    <div
                        className="absolute w-full h-full bg-gradient-to-b from-blue-500 to-blue-700 rounded-t-lg"
                        style={{
                            transform: 'translateZ(8px)',
                        }}
                    />

                    {/* Torso - Sides */}
                    <div
                        className="absolute h-full bg-gradient-to-b from-blue-600 to-blue-800"
                        style={{
                            width: '16px',
                            left: 0,
                            transform: 'rotateY(-90deg) translateZ(8px)',
                            transformOrigin: 'left',
                        }}
                    />
                    <div
                        className="absolute h-full bg-gradient-to-b from-blue-600 to-blue-800"
                        style={{
                            width: '16px',
                            right: 0,
                            transform: 'rotateY(90deg) translateZ(8px)',
                            transformOrigin: 'right',
                        }}
                    />
                </div>

                {/* Arms */}
                <motion.div
                    className="absolute bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"
                    style={{
                        width: '8%',
                        height: '25%',
                        left: '20%',
                        top: '52%',
                        transform: 'translateZ(5px)',
                    }}
                    animate={{
                        rotateZ: [0, -15, 0],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"
                    style={{
                        width: '8%',
                        height: '25%',
                        right: '20%',
                        top: '52%',
                        transform: 'translateZ(5px)',
                    }}
                    animate={{
                        rotateZ: [0, 15, 0],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.2,
                    }}
                />

                {/* Book */}
                <motion.div
                    className="absolute"
                    style={{
                        width: '25%',
                        height: '18%',
                        left: '37.5%',
                        top: '70%',
                        transformStyle: 'preserve-3d',
                    }}
                    animate={{
                        rotateY: [0, 10, 0, -10, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                >
                    <div
                        className="absolute w-full h-full bg-gradient-to-br from-red-500 to-red-700"
                        style={{
                            transform: 'translateZ(6px)',
                            borderRadius: '2px',
                        }}
                    />
                    <div
                        className="absolute w-full h-full bg-gradient-to-br from-red-600 to-red-800"
                        style={{
                            transform: 'rotateY(90deg) translateZ(6px)',
                            transformOrigin: 'right',
                            width: '12px',
                        }}
                    />
                </motion.div>

                {/* Success Stars */}
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="absolute text-yellow-400 text-2xl"
                        style={{
                            left: `${20 + i * 30}%`,
                            top: `${10 + i * 5}%`,
                            transform: 'translateZ(15px)',
                        }}
                        animate={{
                            scale: [0, 1, 0],
                            rotate: [0, 180, 360],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                        }}
                    >
                        ⭐
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
