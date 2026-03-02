import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, ShieldAlert, RefreshCcw } from 'lucide-react';

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
                    className="fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 text-center"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
                    >
                        {/* Animated background pulse */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-red-500 animate-pulse" />

                        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <WifiOff className="w-10 h-10 text-red-500 animate-pulse" />
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                            Network Lost
                        </h2>

                        <p className="text-slate-500 font-medium mb-8">
                            It looks like you've been scavenged from the internet. Please check your connection to continue browsing.
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-colors"
                        >
                            <RefreshCcw className="w-5 h-5" />
                            Try Reconnecting
                        </button>

                        <div className="mt-6 flex items-center justify-center gap-2 text-red-500">
                            <ShieldAlert className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Connection Shield Active</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
