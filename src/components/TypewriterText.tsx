import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
    texts: string[];
    speed?: number;
    deleteSpeed?: number;
    delayBetween?: number;
    className?: string;
    cursorClassName?: string;
    loop?: boolean;
}

export default function TypewriterText({
    texts,
    speed = 100,
    deleteSpeed = 50,
    delayBetween = 2000,
    className = '',
    cursorClassName = '',
    loop = true,
}: TypewriterTextProps) {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        const fullText = texts[currentTextIndex];

        const timeout = setTimeout(
            () => {
                if (!isDeleting) {
                    // Typing
                    if (currentText.length < fullText.length) {
                        setCurrentText(fullText.substring(0, currentText.length + 1));
                    } else {
                        // Finished typing, wait then start deleting
                        setTimeout(() => setIsDeleting(true), delayBetween);
                    }
                } else {
                    // Deleting
                    if (currentText.length > 0) {
                        setCurrentText(fullText.substring(0, currentText.length - 1));
                    } else {
                        // Finished deleting, move to next text
                        setIsDeleting(false);
                        if (loop || currentTextIndex < texts.length - 1) {
                            setCurrentTextIndex((prev) => (prev + 1) % texts.length);
                        }
                    }
                }
            },
            isDeleting ? deleteSpeed : speed
        );

        return () => clearTimeout(timeout);
    }, [currentText, isDeleting, currentTextIndex, texts, speed, deleteSpeed, delayBetween, loop]);

    // Cursor blink effect
    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 530);

        return () => clearInterval(cursorInterval);
    }, []);

    return (
        <span className={className}>
            {currentText}
            <motion.span
                className={`inline-block ${cursorClassName}`}
                animate={{ opacity: showCursor ? 1 : 0 }}
                transition={{ duration: 0 }}
            >
                |
            </motion.span>
        </span>
    );
}
