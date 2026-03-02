import { useState } from "react";
import {
    Database, RefreshCw, CheckCircle,
    AlertCircle, FileText, Activity, Server, Clock
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function DataPipeline() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState("Just now");
    const handleManualSync = () => {
        setIsSyncing(true);
        // Simulate background sync with DTE
        setTimeout(() => {
            setIsSyncing(false);
            setLastSync("Just now");
        }, 4500);
    };

    const syncLogs = [
        { time: "10:45 AM", status: "success", text: "Successfully parsed 2024 Cutoff PDF (Cap Round 1)" },
        { time: "10:42 AM", status: "success", text: "Downloaded DTE Source PDF (7MB)" },
        { time: "10:40 AM", status: "info", text: "Cron triggered: Daily Source Check" },
        { time: "Yesterday, 3:00 PM", status: "success", text: "Weights recalculated and cached to Redis" },
        { time: "Yesterday, 2:55 PM", status: "success", text: "Pushed 13,601 updated rows to Supabase" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar activeTab="automation" />

            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                            <Database className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Zero-Maintenance Pipeline</h1>
                            <p className="text-lg text-gray-600 mt-1">Automated DTE/CET Cell Data Ingestion & OCR parsing.</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

                {/* Top Dash */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                                <Server className="w-4 h-4 text-emerald-500" /> System Status
                            </div>
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                        </div>
                        <div className="text-3xl font-black text-gray-900">Active</div>
                        <p className="text-sm text-gray-600 mt-1">All ingestion workers online</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                            <Database className="w-4 h-4 text-indigo-500" /> Supabase DB
                        </div>
                        <div className="text-3xl font-black text-gray-900">13,601</div>
                        <p className="text-sm text-gray-600 mt-1">Total Cleaned Records Indexed</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                                <Clock className="w-4 h-4 text-orange-500" /> Last Sync
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{lastSync}</div>
                        </div>
                        <button
                            onClick={handleManualSync}
                            disabled={isSyncing}
                            className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 rounded-xl transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Syncing with DTE...' : 'Trigger Sync'}
                        </button>
                    </div>
                </div>

                {/* Action Center */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-slate-50">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-indigo-600" /> Execution Logs
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-100 p-2">
                                {syncLogs.map((log, i) => (
                                    <div key={i} className="px-4 py-3 min-h-[60px] flex items-center gap-4 hover:bg-gray-50 rounded-lg">
                                        {log.status === 'success' ? (
                                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                        ) : log.status === 'info' ? (
                                            <Activity className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{log.text}</p>
                                            <p className="text-xs text-gray-500">{log.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-lg p-6 text-white text-sm">
                            <h3 className="font-bold text-lg mb-4 text-white flex items-center gap-2">
                                <FileText className="w-5 h-5" /> Pipeline Architecture
                            </h3>
                            <p className="opacity-80 mb-4">
                                This architecture ensures zero manual maintenance when the state releases new documents.
                            </p>
                            <ol className="space-y-4">
                                <li className="flex gap-3">
                                    <div className="bg-indigo-700 h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">1</div>
                                    <span className="opacity-90">Cron job pinges the official DTE/CET Cell Maharashtra website daily for newly published PDF links.</span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="bg-indigo-700 h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">2</div>
                                    <span className="opacity-90">Downloads the raw PDF files.</span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="bg-indigo-700 h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">3</div>
                                    <span className="opacity-90"><code className="bg-slate-800 px-1 rounded">tabula-py</code> triggers OCR text reconstruction to parse the raw cutoff tables into structured CSV.</span>
                                </li>
                                <li className="flex gap-3">
                                    <div className="bg-indigo-700 h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">4</div>
                                    <span className="opacity-90">Cleans the data and commits an UPSERT operation to Supabase, making it instantly available for the prediction API.</span>
                                </li>
                            </ol>
                        </div>
                    </div>

                </div>

            </main>
            <Footer />
        </div>
    );
}
