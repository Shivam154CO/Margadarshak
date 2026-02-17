import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SimulatedAIProps {
    steps: string[];
    onComplete: () => void;
    className?: string;
}

export const SimulatedAI: React.FC<SimulatedAIProps> = ({ steps, onComplete, className }) => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (currentStep < steps.length) {
            const timer = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 1200);
            return () => clearTimeout(timer);
        } else {
            onComplete();
        }
    }, [currentStep, steps.length, onComplete]);

    return (
        <div className={`flex flex-col items-center justify-center p-8 space-y-6 ${className}`}>
            <div className="relative w-24 h-24">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4 border-4 border-purple-500/20 border-t-purple-600 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
                </div>
            </div>

            <div className="h-10 flex flex-col items-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-xs font-black uppercase tracking-[0.4em] text-indigo-600 italic text-center"
                    >
                        {steps[currentStep] || "Processing Meta-Data..."}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex space-x-2">
                {steps.map((_, i) => (
                    <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-indigo-600 w-4' : 'bg-gray-200'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};
