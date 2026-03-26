import { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCcw, Home } from "lucide-react";
import NetworkErrorImg from "../assets/Network-error.svg";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 z-[10000] w-full flex items-center justify-center p-8 bg-white text-center animate-in fade-in duration-500">
                    <div className="max-w-xl w-full relative">
                        <div className="absolute -top-10 left-0 w-full h-1.5 bg-rose-500 rounded-full" />

                        <img src={NetworkErrorImg} alt="Network Error" className="w-56 h-56 mx-auto mb-10 opacity-90" />

                        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">
                            System Failure
                        </h2>

                        <p className="text-slate-500 font-medium text-lg mb-12 leading-relaxed max-w-lg mx-auto">
                            There is something wrong with our system. Please try again later.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95 shadow-xl shadow-slate-200"
                            >
                                <RefreshCcw className="w-6 h-6" />
                                Retry
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex-1 py-5 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95"
                            >
                                <Home className="w-6 h-6" />
                                Return to Core
                            </button>
                        </div>

                        {import.meta.env.DEV && (
                            <div className="mt-12 text-left bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Terminal Error Log</span>
                                <div className="max-h-40 overflow-auto custom-scrollbar">
                                    <code className="text-[11px] text-rose-600 font-mono block leading-relaxed">
                                        {this.state.error?.toString()}
                                    </code>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
