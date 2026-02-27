import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send } from "lucide-react";
import type { College } from "../../types/college";
import { getAIResponse } from "../../utils/aiAssistant";

interface AIHelpBotProps {
    college: College;
}

export const AIHelpBot: React.FC<AIHelpBotProps> = ({ college }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
        { role: 'assistant', content: `Hi! I'm your AI guide for ${college.college_name}. Ask me anything about admissions, placements, or campus life!` }
    ]);
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isThinking]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isThinking) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput("");
        setIsThinking(true);

        setTimeout(() => {
            const aiResponse = getAIResponse(userMsg, college);
            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
            setIsThinking(false);
        }, 1000);
    };

    return (
        <>
            <div className="fixed bottom-8 right-8 z-50">
                <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center text-white border-2 border-white/20 relative group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <Bot className="w-8 h-8 relative z-10" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                </motion.button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 100, x: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 100, x: 50 }}
                        className="fixed bottom-28 right-8 z-[60] w-[400px] h-[600px] bg-white rounded-[2.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] border border-slate-100 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <Bot className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-widest">College AI Assistant</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-bold text-white/70">Online & ready to help</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X className="w-5 h-5" /></button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium shadow-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isThinking && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-slate-100 shadow-sm flex gap-1">
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-indigo-400 rounded-full" />
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-purple-400 rounded-full" />
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-indigo-400 rounded-full" />
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-6 bg-white border-t border-slate-100">
                            <form onSubmit={handleSend} className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask me about placements, fees..."
                                    className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-700"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isThinking}
                                    className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-none">
                                {['Placements', 'Hostel Fee', 'Admission', 'Courses'].map(suggest => (
                                    <button
                                        key={suggest}
                                        type="button"
                                        onClick={() => setInput(`Tell me about ${suggest}`)}
                                        className="whitespace-nowrap px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase tracking-tighter hover:bg-slate-200 transition-all"
                                    >
                                        {suggest}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

