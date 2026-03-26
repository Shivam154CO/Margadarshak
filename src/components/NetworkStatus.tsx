import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw } from 'lucide-react';
import ConnectionLostImg from '../assets/Connection-lost.svg';

export default function NetworkStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] bg-white flex items-center justify-center p-6 text-center"
                >
                    <div className="max-w-md w-full relative">
                        {/* Animated background pulse */}
                        <div className="absolute -top-10 left-0 w-full h-1.5 bg-red-500 animate-pulse rounded-full" />

                        <img src={ConnectionLostImg} alt="Connection lost" className="w-48 h-48 mx-auto mb-8 opacity-90 animate-pulse" />

                        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">
                            Network Lost
                        </h2>

                        <p className="text-slate-500 font-medium text-lg mb-10 leading-relaxed">
                            It looks like you've been disconnected from the internet. Please check your connection to continue browsing.
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200"
                        >
                            <RefreshCcw className="w-6 h-6" />
                            Try Reconnecting
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
