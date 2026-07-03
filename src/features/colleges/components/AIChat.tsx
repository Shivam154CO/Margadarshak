import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  isThinking: boolean;
  collegeName: string;
}

export const AIChat: React.FC<AIChatProps> = ({
  isOpen,
  onClose,
  messages,
  input,
  onInputChange,
  onSendMessage,
  isThinking,
  collegeName,
}) => {
  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={onClose}
          className="w-14 h-14 bg-indigo-600 rounded-full border border-indigo-700 shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Bot className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] z-50"
          >
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 p-4 text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">AI Assistant</h3>
                    <p className="text-[11px] text-slate-400">Ask me about {collegeName}</p>
                  </div>
                </div>
              </div>

              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-xl text-sm ${message.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-900'
                        }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isThinking && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 p-3 rounded-xl">
                      <div className="flex items-center space-x-2">
                        <span className="flex space-x-1">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full opacity-60"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full opacity-30"></span>
                        </span>
                        <span className="text-xs text-slate-500 font-medium">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {messages.length === 1 && !isThinking && (
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Admission requirements?",
                      "About fees",
                      "Placement stats",
                      "Facilities"
                    ].map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => onInputChange(suggestion)}
                        className="text-[11px] bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 border-t border-slate-100 bg-white">
                <form onSubmit={onSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => onInputChange(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                    disabled={isThinking}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isThinking}
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
