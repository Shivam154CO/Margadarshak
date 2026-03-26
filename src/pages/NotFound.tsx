import { useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-white font-sans p-8 text-center animate-in fade-in duration-500">
            <div className="w-full max-w-xl relative">
                <div className="absolute -top-12 left-0 w-full h-1 bg-indigo-500/20 rounded-full" />
                
                {/* Header */}
                <div className="mb-12">
                    <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                        System Status: 404_NOT_FOUND
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter mb-6 leading-tight">
                        Path Not Found
                    </h1>
                    <p className="text-slate-500 text-lg sm:text-xl leading-relaxed font-medium max-w-md mx-auto">
                        The requested URL was not found on our servers. It might have been moved, deleted, or never existed.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex-1 h-16 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-100"
                    >
                        Return to Dashboard
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="flex-1 h-16 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg transition-all active:scale-95"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
