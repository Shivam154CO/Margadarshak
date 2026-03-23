import { useState } from "react";
import { motion } from "framer-motion";
import {
    Database, RefreshCw, CheckCircle,
    AlertCircle, FileText, Activity, Server, Clock,
    Zap, Terminal, Cpu, Globe
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar activeTab="data-pipeline" />

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Header Section - Admission Timeline Style */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Data Pipeline Control</h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium italic">Automated DTE Maharashtra Data Ingestion & Normalization Engine</p>
                </div>

                {/* Top Dash - Admission Timeline Stats Style */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                <Server className="w-3.5 h-3.5 text-emerald-500" /> System Status
                            </div>
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 tabular-nums">Online</div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Ingestion Workers Healthy</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-indigo-500">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                            <Database className="w-3.5 h-3.5 text-indigo-500" /> Supabase Master
                        </div>
                        <div className="text-2xl font-bold text-slate-900 tabular-nums">13,601</div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">Total Indexed Records</p>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-amber-500 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                                <Clock className="w-3.5 h-3.5 text-amber-500" /> Last Auto-Sync
                            </div>
                            <div className="text-2xl font-bold text-slate-900 tabular-nums">{lastSync}</div>
                        </div>
                        <button
                            onClick={handleManualSync}
                            disabled={isSyncing}
                            className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-white text-indigo-700 border border-indigo-100 font-bold py-2 text-xs rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Processing...' : 'Manual Sync'}
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Execution Logs - Admission Timeline List Style */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                                    <Terminal className="w-4 h-4 text-indigo-600" /> Deployment Logs
                                </h3>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Stream</span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {syncLogs.map((log, i) => (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors"
                                    >
                                        <div className={`p-2 rounded-lg ${
                                            log.status === 'success' ? 'bg-emerald-50 text-emerald-600' :
                                            log.status === 'info' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            {log.status === 'success' ? <CheckCircle className="w-4 h-4" /> :
                                             log.status === 'info' ? <Activity className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">{log.text}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{log.time}</div>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <div className="text-[10px] font-bold text-indigo-500/70 uppercase tracking-wider">Process V2.1</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Additional Minimal Info Card */}
                        <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-xl shadow-indigo-100 flex items-center justify-between overflow-hidden relative group">
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <Cpu className="w-48 h-48" />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-lg font-bold mb-1">Compute Resources</h4>
                                <p className="text-indigo-100 text-sm font-medium">Auto-scaling group active across 3 availability zones.</p>
                            </div>
                            <div className="relative z-10 hidden sm:block">
                                <Globe className="w-10 h-10 text-indigo-200 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Right Side Column */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4 text-sm uppercase tracking-wider">
                                <Zap className="w-4 h-4 text-indigo-600" /> Control Protocols
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { label: "Official Source Scraper", desc: "Monitors official DTE portal for new PDF links daily.", step: "01" },
                                    { label: "Raw PDF Extractor", desc: "Downloads and stores source documents in Supabase Storage.", step: "02" },
                                    { label: "OCR Text Reconstruction", desc: "Structured parsing of cutoff tables via specialized engine.", step: "03" },
                                    { label: "Supabase Upsert", desc: "Atomic commits to the master college database.", step: "04" },
                                ].map((item) => (
                                    <div key={item.step} className="flex gap-4 group">
                                        <div className="text-xs font-black text-indigo-200 group-hover:text-indigo-500 transition-colors pt-1">{item.step}</div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">{item.label}</div>
                                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-xl p-6 text-white text-xs border border-slate-800 shadow-2xl">
                            <div className="flex items-center gap-2 mb-4 text-indigo-400 font-bold uppercase tracking-[0.2em]">
                                <FileText className="w-3.5 h-3.5" /> Dev Technical Tip
                            </div>
                            <p className="opacity-70 leading-relaxed font-medium">
                                The pipeline architecture ensures zero manual maintenance. When the state releases new documents, 
                                <code className="bg-slate-800 text-indigo-300 px-1 mx-1 rounded whitespace-nowrap">tabula-py</code> triggers 
                                automatically to process the influx into structured CSV formats.
                            </p>
                        </div>
                    </div>

                </div>

            </main>
            <Footer />
        </div>
    );
}
