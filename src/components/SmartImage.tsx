import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from './Skeleton';

interface SmartImageProps {
    src: string;
    alt: string;
    className?: string;
    fallbackText?: string;
}

export default function SmartImage({ src, alt, className = "", fallbackText }: SmartImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10"
                    >
                        <Skeleton className="w-full h-full" />
                    </motion.div>
                )}
            </AnimatePresence>

            {!hasError ? (
                <motion.img
                    src={src}
                    alt={alt}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{
                        opacity: isLoading ? 0 : 1,
                        scale: isLoading ? 1.1 : 1
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setHasError(true);
                    }}
                    className={`w-full h-full object-cover ${isLoading ? 'invisible' : 'visible'}`}
                />
            ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center p-4 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                        {fallbackText || alt}
                    </span>
                </div>
            )}
        </div>
    );
}
