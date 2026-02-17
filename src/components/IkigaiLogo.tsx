import { motion } from 'framer-motion';

interface IkigaiLogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    className?: string;
}

export default function IkigaiLogo({ size = 'md', showText = true, className = '' }: IkigaiLogoProps) {
    const sizes = {
        sm: { icon: 24, text: 'text-xl' },
        md: { icon: 32, text: 'text-2xl' },
        lg: { icon: 48, text: 'text-4xl' }
    };

    const iconSize = sizes[size].icon;
    const textSize = sizes[size].text;

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Ikigai Symbol - 4 overlapping circles */}
            <div className="relative" style={{ width: `${iconSize}px`, height: `${iconSize}px` }}>
                <svg width={iconSize} height={iconSize} viewBox="0 0 100 100" fill="none">
                    {/* Top circle */}
                    <circle cx="50" cy="35" r="20" fill="url(#gradient1)" opacity="0.7" />
                    {/* Right circle */}
                    <circle cx="65" cy="50" r="20" fill="url(#gradient2)" opacity="0.7" />
                    {/* Bottom circle */}
                    <circle cx="50" cy="65" r="20" fill="url(#gradient3)" opacity="0.7" />
                    {/* Left circle */}
                    <circle cx="35" cy="50" r="20" fill="url(#gradient4)" opacity="0.7" />

                    {/* Center dot representing the sweet spot */}
                    <circle cx="50" cy="50" r="8" fill="white" />
                    <circle cx="50" cy="50" r="6" fill="url(#gradientCenter)" />

                    <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                        <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ec4899" />
                            <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                        <linearGradient id="gradientCenter" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="50%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Text */}
            {showText && (
                <motion.span
                    className={`${textSize} font-['Outfit'] font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    IKIGAI
                </motion.span>
            )}
        </div>
    );
}
