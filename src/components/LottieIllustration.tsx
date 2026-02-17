import Lottie from 'lottie-react';
import { useMemo } from 'react';

// Import Lottie JSON files
import collegeIllustration from '../assets/lottie/illustrations/college.json';
import aiBrainIllustration from '../assets/lottie/illustrations/ai-brain.json';
import studentSuccessIllustration from '../assets/lottie/illustrations/student-success.json';
import dataAnalysisIllustration from '../assets/lottie/illustrations/data-analysis.json';
import overwhelmedIllustration from '../assets/lottie/illustrations/overwhelmed.json';
import complexDataIllustration from '../assets/lottie/illustrations/complex-data.json';
import uncertaintyIllustration from '../assets/lottie/illustrations/uncertainty.json';

interface LottieIllustrationProps {
    type: 'college' | 'aiBrain' | 'studentSuccess' | 'dataAnalysis' | 'overwhelmed' | 'complexData' | 'uncertainty';
    size?: number;
    className?: string;
}

export default function LottieIllustration({
    type,
    size = 160,
    className = '',
}: LottieIllustrationProps) {
    const animationData = useMemo(() => {
        switch (type) {
            case 'college':
                return collegeIllustration;
            case 'aiBrain':
                return aiBrainIllustration;
            case 'studentSuccess':
                return studentSuccessIllustration;
            case 'dataAnalysis':
                return dataAnalysisIllustration;
            case 'overwhelmed':
                return overwhelmedIllustration;
            case 'complexData':
                return complexDataIllustration;
            case 'uncertainty':
                return uncertaintyIllustration;
            default:
                return collegeIllustration;
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
                autoplay={true}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
}
