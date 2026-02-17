import { motion } from 'framer-motion';

interface AnimatedIconProps {
    type: 'brain' | 'college' | 'chart' | 'student' | 'trophy' | 'rocket' | 'target';
    size?: number;
    className?: string;
    animate?: boolean;
}

export default function AnimatedIcon({
    type,
    size = 64,
    className = '',
    animate = true,
}: AnimatedIconProps) {
    const iconVariants = {
        initial: { scale: 0, rotate: -180 },
        animate: {
            scale: 1,
            rotate: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 260,
                damping: 20,
            },
        },
        hover: {
            scale: 1.1,
            rotate: 5,
            transition: {
                type: 'spring' as const,
                stiffness: 400,
                damping: 10,
            },
        },
    };

    const pulseVariants = {
        animate: {
            scale: [1, 1.05, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut' as const,
            },
        },
    };

    const renderIcon = () => {
        switch (type) {
            case 'brain':
                return (
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <motion.path
                            d="M32 8C24 8 18 14 18 22C18 24 18.5 26 19.5 27.5C17 29 15 32 15 35.5C15 40 18 44 22 45.5C22 48 23 50 25 51.5C27 53 29.5 54 32 54C34.5 54 37 53 39 51.5C41 50 42 48 42 45.5C46 44 49 40 49 35.5C49 32 47 29 44.5 27.5C45.5 26 46 24 46 22C46 14 40 8 32 8Z"
                            fill="url(#brainGradient)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: 'easeInOut' }}
                        />
                        <motion.circle
                            cx="28"
                            cy="25"
                            r="2"
                            fill="white"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <motion.circle
                            cx="36"
                            cy="25"
                            r="2"
                            fill="white"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <defs>
                            <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                    </svg>
                );

            case 'college':
                return (
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <motion.path
                            d="M32 10L8 22V28L32 40L56 28V22L32 10Z"
                            fill="url(#collegeGradient1)"
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        />
                        <motion.rect
                            x="14"
                            y="30"
                            width="8"
                            height="18"
                            fill="url(#collegeGradient2)"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                            style={{ transformOrigin: 'bottom' }}
                        />
                        <motion.rect
                            x="28"
                            y="30"
                            width="8"
                            height="18"
                            fill="url(#collegeGradient2)"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: 0.4, duration: 0.4 }}
                            style={{ transformOrigin: 'bottom' }}
                        />
                        <motion.rect
                            x="42"
                            y="30"
                            width="8"
                            height="18"
                            fill="url(#collegeGradient2)"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: 0.5, duration: 0.4 }}
                            style={{ transformOrigin: 'bottom' }}
                        />
                        <defs>
                            <linearGradient id="collegeGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#06b6d4" />
                            </linearGradient>
                            <linearGradient id="collegeGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#1e40af" />
                            </linearGradient>
                        </defs>
                    </svg>
                );

            case 'chart':
                return (
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <motion.rect
                            x="10"
                            y="35"
                            width="10"
                            height="20"
                            rx="2"
                            fill="url(#chartGradient1)"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            style={{ transformOrigin: 'bottom' }}
                        />
                        <motion.rect
                            x="24"
                            y="25"
                            width="10"
                            height="30"
                            rx="2"
                            fill="url(#chartGradient2)"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            style={{ transformOrigin: 'bottom' }}
                        />
                        <motion.rect
                            x="38"
                            y="15"
                            width="10"
                            height="40"
                            rx="2"
                            fill="url(#chartGradient3)"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            style={{ transformOrigin: 'bottom' }}
                        />
                        <motion.path
                            d="M15 40L29 30L43 20"
                            stroke="#fbbf24"
                            strokeWidth="2"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                        />
                        <defs>
                            <linearGradient id="chartGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#059669" />
                            </linearGradient>
                            <linearGradient id="chartGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#1e40af" />
                            </linearGradient>
                            <linearGradient id="chartGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#6d28d9" />
                            </linearGradient>
                        </defs>
                    </svg>
                );

            case 'student':
                return (
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <motion.circle
                            cx="32"
                            cy="20"
                            r="8"
                            fill="url(#studentGradient1)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.4 }}
                        />
                        <motion.path
                            d="M32 30C22 30 14 35 14 42V50H50V42C50 35 42 30 32 30Z"
                            fill="url(#studentGradient2)"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        />
                        <motion.path
                            d="M20 15L32 10L44 15L32 20L20 15Z"
                            fill="#fbbf24"
                            initial={{ y: -5, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.4 }}
                        />
                        <defs>
                            <linearGradient id="studentGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#f59e0b" />
                                <stop offset="100%" stopColor="#d97706" />
                            </linearGradient>
                            <linearGradient id="studentGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#1e40af" />
                            </linearGradient>
                        </defs>
                    </svg>
                );

            case 'trophy':
                return (
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <motion.path
                            d="M20 12H44V28C44 34 38 40 32 40C26 40 20 34 20 28V12Z"
                            fill="url(#trophyGradient)"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ duration: 0.5 }}
                            style={{ transformOrigin: 'top' }}
                        />
                        <motion.rect
                            x="28"
                            y="40"
                            width="8"
                            height="8"
                            fill="#fbbf24"
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                        />
                        <motion.rect
                            x="22"
                            y="48"
                            width="20"
                            height="4"
                            rx="2"
                            fill="#fbbf24"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.5, duration: 0.3 }}
                        />
                        <motion.path
                            d="M44 12H50C52 12 54 14 54 18C54 22 52 24 50 24H44"
                            stroke="#fbbf24"
                            strokeWidth="2"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.6, duration: 0.4 }}
                        />
                        <motion.path
                            d="M20 12H14C12 12 10 14 10 18C10 22 12 24 14 24H20"
                            stroke="#fbbf24"
                            strokeWidth="2"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.6, duration: 0.4 }}
                        />
                        <defs>
                            <linearGradient id="trophyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#fbbf24" />
                                <stop offset="100%" stopColor="#f59e0b" />
                            </linearGradient>
                        </defs>
                    </svg>
                );

            case 'rocket':
                return (
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <motion.path
                            d="M32 8L38 28L48 34L38 40L32 56L26 40L16 34L26 28L32 8Z"
                            fill="url(#rocketGradient)"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6 }}
                        />
                        <motion.circle
                            cx="32"
                            cy="24"
                            r="4"
                            fill="white"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4, duration: 0.3 }}
                        />
                        <motion.path
                            d="M20 40C18 42 16 44 16 48"
                            stroke="#ef4444"
                            strokeWidth="2"
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.4 }}
                        />
                        <motion.path
                            d="M44 40C46 42 48 44 48 48"
                            stroke="#ef4444"
                            strokeWidth="2"
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.4 }}
                        />
                        <defs>
                            <linearGradient id="rocketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="50%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                        </defs>
                    </svg>
                );

            case 'target':
                return (
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <motion.circle
                            cx="32"
                            cy="32"
                            r="24"
                            stroke="url(#targetGradient1)"
                            strokeWidth="2"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1 }}
                        />
                        <motion.circle
                            cx="32"
                            cy="32"
                            r="16"
                            stroke="url(#targetGradient2)"
                            strokeWidth="2"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        />
                        <motion.circle
                            cx="32"
                            cy="32"
                            r="8"
                            fill="url(#targetGradient3)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        />
                        <motion.path
                            d="M32 8V24M32 40V56M8 32H24M40 32H56"
                            stroke="#ef4444"
                            strokeWidth="2"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                        />
                        <defs>
                            <linearGradient id="targetGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#06b6d4" />
                            </linearGradient>
                            <linearGradient id="targetGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                            <linearGradient id="targetGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#ef4444" />
                                <stop offset="100%" stopColor="#dc2626" />
                            </linearGradient>
                        </defs>
                    </svg>
                );

            default:
                return null;
        }
    };

    return (
        <motion.div
            className={`inline-block ${className}`}
            style={{ width: size, height: size }}
            variants={iconVariants}
            initial={animate ? 'initial' : undefined}
            animate={animate ? 'animate' : undefined}
            whileHover="hover"
        >
            <motion.div variants={pulseVariants} animate={animate ? 'animate' : undefined}>
                {renderIcon()}
            </motion.div>
        </motion.div>
    );
}
