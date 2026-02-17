import Lottie from 'lottie-react';
import { useMemo } from 'react';

// Import Lottie JSON files
import brainAnimation from '../assets/lottie/icons/brain.json';
import collegeAnimation from '../assets/lottie/icons/college.json';
import chartAnimation from '../assets/lottie/icons/chart.json';
import studentAnimation from '../assets/lottie/icons/student.json';
import trophyAnimation from '../assets/lottie/icons/trophy.json';
import rocketAnimation from '../assets/lottie/icons/rocket.json';
import targetAnimation from '../assets/lottie/icons/target.json';

interface LottieIconProps {
    type: 'brain' | 'college' | 'chart' | 'student' | 'trophy' | 'rocket' | 'target';
    size?: number;
    className?: string;
    animate?: boolean;
}

export default function LottieIcon({
    type,
    size = 64,
    className = '',
    animate = true,
}: LottieIconProps) {
    const animationData = useMemo(() => {
        switch (type) {
            case 'brain':
                return brainAnimation;
            case 'college':
                return collegeAnimation;
            case 'chart':
                return chartAnimation;
            case 'student':
                return studentAnimation;
            case 'trophy':
                return trophyAnimation;
            case 'rocket':
                return rocketAnimation;
            case 'target':
                return targetAnimation;
            default:
                return brainAnimation;
        }
    }, [type]);

    return (
        <div
            className={`inline-block ${className}`}
            style={{ width: `${size}px`, height: `${size}px` }}
        >
            <Lottie
                animationData={animationData}
                loop={true}
                autoplay={animate}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
}
