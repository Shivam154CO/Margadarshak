import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rect' | 'circle';
    width?: string | number;
    height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
    className = "",
    variant = 'rect',
    width,
    height
}) => {
    const baseClass = "relative overflow-hidden bg-slate-200/60";
    const variantClass = variant === 'circle' ? 'rounded-full' : 'rounded-xl';

    return (
        <div
            className={`${baseClass} ${variantClass} ${className}`}
            style={{ width, height }}
        >
            {/* The Shimmer Gradient */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent shadow-[0_0_40px_rgba(255,255,255,0.2)]" />
        </div>
    );
};

export default Skeleton;
