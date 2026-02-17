import { useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface ThreeDCardProps {
    children: ReactNode;
    className?: string;
    glowColor?: string;
    intensity?: number;
}

export default function ThreeDCard({
    children,
    className = '',
    glowColor = 'rgba(99, 102, 241, 0.3)',
    intensity = 15,
}: ThreeDCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Use MotionValues to track rotation without triggering React re-renders
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    const rotateX = useTransform(mouseY, (val) => (val / 20) * -intensity);
    const rotateY = useTransform(mouseX, (val) => (val / 20) * intensity);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        x.set(e.clientX - centerX);
        y.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            className={`relative ${className}`}
            style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
                rotateX,
                rotateY,
            }}
            animate={{
                scale: isHovered ? 1.05 : 1,
            }}
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
            }}
        >
            {/* Glow effect */}
            <motion.div
                className="absolute -inset-1 rounded-2xl blur-xl"
                style={{
                    background: glowColor,
                    opacity: isHovered ? 0.6 : 0,
                    transition: 'opacity 0.3s ease',
                }}
            />

            {/* Card content */}
            <div
                className="relative"
                style={{
                    transform: 'translateZ(20px)',
                }}
            >
                {children}
            </div>
        </motion.div>
    );
}
