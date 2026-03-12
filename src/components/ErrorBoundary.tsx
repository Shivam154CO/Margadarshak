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
                <div className="min-h-[400px] w-full flex items-center justify-center p-6 bg-slate-50/50 backdrop-blur-sm">
                    <div className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-2xl border border-rose-100 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500" />

                        <img src={NetworkErrorImg} alt="Network Error" className="w-40 h-40 mx-auto mb-6 opacity-90" />

                        <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                            System Scavenge Failure
                        </h2>

                        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                            Our advanced engine hit a checksum error while processing this segment. The data may be temporarily scavenged.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-95"
                            >
                                <RefreshCcw className="w-5 h-5" />
                                Retry Process
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
                            >
                                <Home className="w-5 h-5" />
                                Return to Core
                            </button>
                        </div>

                        {import.meta.env.DEV && (
                            <details className="mt-8 text-left bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-auto max-h-40">
                                <summary className="text-xs font-black text-slate-400 uppercase cursor-pointer">Terminal Log</summary>
                                <code className="text-[10px] text-rose-600 block mt-2 whitespace-pre-wrap">
                                    {this.state.error?.toString()}
                                </code>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
