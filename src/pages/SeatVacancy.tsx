import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { useQuery } from "@tanstack/react-query";
import {
    RefreshCw, TrendingUp, Minus, Search,
    AlertCircle, Bell, BellOff, MapPin,
    Activity, Zap
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface SeatData {
    college_code: string;
    college_name: string;
    city: string;
    branch: string;
    branch_code: string;
    total_seats: number;
    filled_round1: number;
    filled_round2: number;
    filled_round3: number;
    current_vacant: number;
    cancellations: number;
    status: "filling-fast" | "seats-available" | "almost-full" | "fully-filled";
    cutoff_rank: number;
    fees: number;
}

// Simulated seat vacancy data based on real college dataset
function generateSeatData(colleges: any[]): SeatData[] {
    if (!colleges.length) return [];
    const uniqueMap = new Map<string, SeatData>();

    colleges.forEach((c: any) => {
        const key = `${c.college_code}-${c.branch_code || c.branch}`;
        if (uniqueMap.has(key)) return;

        const totalSeats = c.seats || c.total_intake || Math.floor(Math.random() * 60 + 30);
        const fillRate1 = 0.4 + Math.random() * 0.3;
        const fillRate2 = fillRate1 + 0.1 + Math.random() * 0.15;
        const fillRate3 = fillRate2 + 0.05 + Math.random() * 0.1;
        const filled1 = Math.floor(totalSeats * fillRate1);
        const filled2 = Math.min(totalSeats, Math.floor(totalSeats * fillRate2));
        const filled3 = Math.min(totalSeats, Math.floor(totalSeats * fillRate3));
        const cancellations = Math.floor(Math.random() * Math.max(1, filled3 * 0.15));
        const currentVacant = Math.max(0, totalSeats - filled3 + cancellations);

        let status: SeatData["status"] = "seats-available";
        const fillPct = (totalSeats - currentVacant) / totalSeats;
        if (fillPct >= 1) status = "fully-filled";
        else if (fillPct >= 0.9) status = "almost-full";
        else if (fillPct >= 0.7) status = "filling-fast";

        uniqueMap.set(key, {
            college_code: c.college_code,
            college_name: c.college_name,
            city: c.city,
            branch: c.branch_name || c.branch,
            branch_code: c.branch_code || "",
            total_seats: totalSeats,
            filled_round1: filled1,
            filled_round2: filled2,
            filled_round3: filled3,
            current_vacant: currentVacant,
            cancellations,
            status,
            cutoff_rank: c.cutoff_rank || 0,
            fees: c.fees || c.Fees || 0,
        });
    });

    return Array.from(uniqueMap.values()).sort((a, b) => b.current_vacant - a.current_vacant);
}

const statusConfig = {
    "seats-available": { label: "Seats Available", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: TrendingUp },
    "filling-fast": { label: "Filling Fast", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Activity },
    "almost-full": { label: "Almost Full", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", icon: AlertCircle },
    "fully-filled": { label: "No Vacancy", color: "text-red-700", bg: "bg-red-50", border: "border-red-200", icon: Minus },
};

export default function SeatVacancy() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [branchFilter, setBranchFilter] = useState<string>("all");
    const [watchlist, setWatchlist] = useState<Record<string, boolean>>({});

    const { data: profile } = useQuery<any>({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return null;
            const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
            return data;
        },
        staleTime: 1000 * 60 * 10,
    });

    // Load watchlist from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem("ikigai-seat-watchlist");
            if (saved) setWatchlist(JSON.parse(saved));
        } catch { }
    }, []);

    useEffect(() => {
        localStorage.setItem("ikigai-seat-watchlist", JSON.stringify(watchlist));
    }, [watchlist]);

    // Fetch colleges from Supabase and subscribe to updates
    const { data: rawColleges = [], isLoading, refetch } = useQuery({
        queryKey: ['allCollegesForVacancy'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('colleges')
                .select('college_code, college_name, city, branch, branch_name, branch_code, seats, total_intake, cutoff_rank, fees, Fees')
                .limit(500);
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 30,
    });

    useEffect(() => {
        const channel = supabase
            .channel('seat-vacancy-updates')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'colleges' }, () => {
                refetch();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [refetch]);

    const seatData = useMemo(() => generateSeatData(rawColleges), [rawColleges]);

    const branches = useMemo(() => {
        const set = new Set(seatData.map(s => s.branch));
        return Array.from(set).sort();
    }, [seatData]);

    const filtered = useMemo(() => {
        return seatData.filter(s => {
            if (statusFilter !== "all" && s.status !== statusFilter) return false;
            if (branchFilter !== "all" && s.branch !== branchFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                if (!s.college_name.toLowerCase().includes(q) && !s.city.toLowerCase().includes(q) && !s.branch.toLowerCase().includes(q)) return false;
            }
            return true;
        });
    }, [seatData, statusFilter, branchFilter, search]);

    const stats = useMemo(() => {
        const totalVacant = seatData.reduce((s, d) => s + d.current_vacant, 0);
        const totalCancellations = seatData.reduce((s, d) => s + d.cancellations, 0);
        const withVacancy = seatData.filter(d => d.current_vacant > 0).length;
        return { totalVacant, totalCancellations, withVacancy, total: seatData.length };
    }, [seatData]);

    const toggleWatch = (key: string) => {
        setWatchlist(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar activeTab="vacancy" userProfile={profile} />
            <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Seat Vacancy Tracker</h1>
                    <p className="text-sm text-slate-500 mt-1">Monitor vacant seats after each CAP round & cancellations</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                    {[
                        { label: "Total Vacant Seats", value: stats.totalVacant, color: "border-l-emerald-500", icon: <TrendingUp className="w-4 h-4 text-emerald-500" /> },
                        { label: "Cancellation Openings", value: stats.totalCancellations, color: "border-l-blue-500", icon: <RefreshCw className="w-4 h-4 text-blue-500" /> },
                        { label: "Colleges with Vacancy", value: stats.withVacancy, color: "border-l-purple-500", icon: <Zap className="w-4 h-4 text-purple-500" /> },
                        { label: "Total Tracked", value: stats.total, color: "border-l-slate-400", icon: <Activity className="w-4 h-4 text-slate-400" /> },
                    ].map(s => (
                        <div key={s.label} className={`bg-white rounded-xl border border-slate-200 border-l-4 ${s.color} p-4 shadow-sm`}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-slate-500">{s.label}</span>
                                {s.icon}
                            </div>
                            <div className="text-2xl font-bold text-slate-800">{s.value.toLocaleString()}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search college, city, or branch..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                            <option value="all">All Status</option>
                            <option value="seats-available">Seats Available</option>
                            <option value="filling-fast">Filling Fast</option>
                            <option value="almost-full">Almost Full</option>
                            <option value="fully-filled">No Vacancy</option>
                        </select>
                        <select
                            value={branchFilter}
                            onChange={e => setBranchFilter(e.target.value)}
                            className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        >
                            <option value="all">All Branches</option>
                            {branches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                </div>

                {/* Results count */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-500">{filtered.length} entries found</span>
                </div>

                {/* Table */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                        <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-700 mb-1">No results found</h3>
                        <p className="text-sm text-slate-400">Try adjusting your filters or search query</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.slice(0, 50).map((seat, idx) => {
                            const cfg = statusConfig[seat.status];
                            const StatusIcon = cfg.icon;
                            const key = `${seat.college_code}-${seat.branch}`;
                            const isWatched = !!watchlist[key];
                            const fillPct = Math.round(((seat.total_seats - seat.current_vacant) / seat.total_seats) * 100);

                            return (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                        {/* Left: Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{seat.college_code}</span>
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                                                    <StatusIcon className="w-3 h-3" /> {cfg.label}
                                                </span>
                                                {seat.cancellations > 0 && (
                                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                                        +{seat.cancellations} cancellations
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{seat.college_name}</h4>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{seat.city}</span>
                                                <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{seat.branch}</span>
                                            </div>
                                        </div>

                                        {/* Middle: Seat Fill Bar */}
                                        <div className="w-full lg:w-48 flex-shrink-0">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-slate-500">Filled</span>
                                                <span className="font-bold text-slate-700">{fillPct}%</span>
                                            </div>
                                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${fillPct >= 95 ? "bg-red-500" : fillPct >= 80 ? "bg-amber-500" : "bg-emerald-500"
                                                        }`}
                                                    style={{ width: `${fillPct}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-1 text-xs">
                                                <span className="text-slate-400">{seat.total_seats - seat.current_vacant} filled</span>
                                                <span className="font-bold text-emerald-600">{seat.current_vacant} vacant</span>
                                            </div>
                                        </div>

                                        {/* Right: Stats + Actions */}
                                        <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
                                            <div className="text-center">
                                                <div className="text-lg font-black text-emerald-600">{seat.current_vacant}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase">Vacant</div>
                                            </div>
                                            {seat.cutoff_rank > 0 && (
                                                <div className="text-center hidden sm:block">
                                                    <div className="text-sm font-bold text-slate-700">{seat.cutoff_rank}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Cutoff</div>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => toggleWatch(key)}
                                                className={`p-2 rounded-lg border transition-all ${isWatched ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100"
                                                    }`}
                                                title={isWatched ? "Remove from watchlist" : "Add to watchlist"}
                                            >
                                                {isWatched ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
