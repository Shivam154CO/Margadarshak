import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

interface ScrollAnimationWrapperProps {
    children: ReactNode;
    animation?: 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'rotate';
    delay?: number;
    duration?: number;
    className?: string;
    once?: boolean;
}

const variants = {
    fade: {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    },
    slideUp: {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
    },
    slideDown: {
        hidden: { opacity: 0, y: -50 },
        visible: { opacity: 1, y: 0 },
    },
    slideLeft: {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0 },
    },
    slideRight: {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0 },
    },
    scale: {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
    },
    rotate: {
        hidden: { opacity: 0, rotate: -10, scale: 0.9 },
        visible: { opacity: 1, rotate: 0, scale: 1 },
    },
};

export default function ScrollAnimationWrapper({
    children,
    animation = 'fade',
    delay = 0,
    duration = 0.6,
    className = '',
    once = true,
}: ScrollAnimationWrapperProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, amount: 0.2 });
    const controls = useAnimation();

    useEffect(() => {
        if (isInView) {
            controls.start('visible');
        } else if (!once) {
            controls.start('hidden');
        }
    }, [isInView, controls, once]);

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={variants[animation]}
            transition={{
                duration,
                delay,
                ease: [0.23, 1, 0.32, 1], // Quintic easing for smoother entrance
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
