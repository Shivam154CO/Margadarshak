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
                <div className="w-full h-screen flex items-center justify-center bg-white text-center animate-in fade-in duration-500">
                    <div className="max-w-full w-cover relative">
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
                                onClick={() => window.location.href = '/dashboard'}
                                className="flex-1 py-5 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95"
                            >
                                <Home className="w-6 h-6" />
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
