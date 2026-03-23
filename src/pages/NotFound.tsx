import { useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6 sm:p-12">
            <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center">
                {/* Header */}
                <div className="mb-8">
                    <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-bold uppercase tracking-widest mb-4">
                        Error Code: 404
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        Page Not Found
                    </h1>
                    <p className="text-slate-500 text-base leading-relaxed font-medium">
                        The requested URL was not found on our servers. It might have been moved, deleted, or never existed.
                    </p>
                </div>

                {/* Action Buttons - Minimal/System UI Style */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full h-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-sm"
                    >
                        Return to Dashboard
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        className="w-full h-12 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold transition-all"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
