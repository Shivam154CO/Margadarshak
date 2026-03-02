import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
    ScatterChart, Scatter, ZAxis,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    AreaChart, Area,
} from 'recharts';
import {
    Target, TrendingUp, Award, MapPin, BarChart3,
    PieChart as PieChartIcon, DollarSign, Zap, CheckCircle,
    Building, GraduationCap, ArrowUpRight, Brain
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useColleges } from '../context/CollegesContext';

interface UserProfile {
    id: string; name: string; email: string; state: string; category: string;
    exam_type: string; cet_rank: string; cet_score: string; diploma_rank: string;
    diploma_score: string; preferred_branches: string[]; university_preference: string;
    address: string; receive_updates: boolean; profile_complete: boolean;
    created_at: string; updated_at: string;
}

const COLORS = { mostProbable: '#7c3aed', bestFit: '#059669', goodFit: '#2563eb', stretch: '#d97706', unlikely: '#dc2626' };
const CHART_COLORS = ['#7c3aed', '#059669', '#2563eb', '#d97706', '#dc2626', '#0891b2', '#db2777'];

const fadeUp: any = { hidden: { y: 24, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 80 } } };
const stagger: any = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const CARD = "bg-white border border-slate-200 rounded-2xl p-6 shadow-sm";

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-200 shadow-lg rounded-xl px-4 py-3 text-sm">
            {label && <p className="font-semibold text-slate-700 mb-1">{label}</p>}
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color || p.fill }} className="font-medium">
                    {p.name}: <span className="text-slate-900">{p.value}</span>
                </p>
            ))}
        </div>
    );
};

export default function Analytics() {
    const { colleges } = useColleges();

    const { data: profile } = useQuery<UserProfile>({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No session');
            const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
            return data as UserProfile;
        },
        staleTime: 1000 * 60 * 5,
    });

    // ─── All analytics computed from ML-predicted colleges ───────────────────
    const data = useMemo(() => {
        if (!colleges.length) return null;

        const predicted = colleges.filter(c => c.probability_level || c.fit);

        // 1. Prediction Distribution (donut)
        const dist = [
            { name: 'Most Probable', value: predicted.filter(c => c.is_most_probable || c.probability_level === 'Most Probable').length, color: COLORS.mostProbable },
            { name: 'Best Fit', value: predicted.filter(c => !c.is_most_probable && (c.fit === 'Best Fit' || c.probability_level === 'Best Fit')).length, color: COLORS.bestFit },
            { name: 'Good Fit', value: predicted.filter(c => c.fit === 'Good Fit' || c.probability_level === 'Good Fit').length, color: COLORS.goodFit },
            { name: 'Stretch', value: predicted.filter(c => c.fit === 'Stretch' || c.probability_level === 'Stretch').length, color: COLORS.stretch },
        ].filter(d => d.value > 0);

        // 2. Branch-wise breakdown
        const branchMap: Record<string, { mostProbable: number; bestFit: number; goodFit: number; stretch: number; total: number }> = {};
        predicted.forEach(c => {
            const b = c.branch || c.branch_name || 'Other';
            if (!branchMap[b]) branchMap[b] = { mostProbable: 0, bestFit: 0, goodFit: 0, stretch: 0, total: 0 };
            branchMap[b].total++;
            if (c.is_most_probable || c.probability_level === 'Most Probable') branchMap[b].mostProbable++;
            else if (c.fit === 'Best Fit' || c.probability_level === 'Best Fit') branchMap[b].bestFit++;
            else if (c.fit === 'Good Fit' || c.probability_level === 'Good Fit') branchMap[b].goodFit++;
            else if (c.fit === 'Stretch' || c.probability_level === 'Stretch') branchMap[b].stretch++;
        });
        const branchData = Object.entries(branchMap)
            .map(([name, v]) => ({ name, ...v }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 8);

        // 3. City-wise opportunities bar
        const cityMap: Record<string, number> = {};
        predicted.forEach(c => { const city = c.city || 'Unknown'; cityMap[city] = (cityMap[city] || 0) + 1; });
        const cityData = Object.entries(cityMap)
            .map(([city, count]) => ({ city, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // 4. Fees vs Package scatter (ROI)
        const roiData = predicted
            .filter(c => c.fees > 0 && c.average_package_lpa > 0)
            .map(c => ({
                x: parseFloat((c.fees / 100000).toFixed(2)),
                y: parseFloat((c.average_package_lpa).toFixed(2)),
                z: c.placement_rate || 50,
                name: c.college_name,
                fit: c.is_most_probable ? 'Most Probable' : (c.fit || c.probability_level || 'Unknown'),
            }))
            .slice(0, 60);

        // 5. Admission chance distribution (histogram buckets)
        const buckets = [
            { range: '90-100%', count: 0, color: COLORS.mostProbable },
            { range: '70-89%', count: 0, color: COLORS.bestFit },
            { range: '50-69%', count: 0, color: COLORS.goodFit },
            { range: '30-49%', count: 0, color: COLORS.stretch },
            { range: '0-29%', count: 0, color: COLORS.unlikely },
        ];
        predicted.forEach(c => {
            const pct = parseFloat(c.admission_chance_percentage?.replace('%', '') || '0');
            if (pct >= 90) buckets[0].count++;
            else if (pct >= 70) buckets[1].count++;
            else if (pct >= 50) buckets[2].count++;
            else if (pct >= 30) buckets[3].count++;
            else buckets[4].count++;
        });

        // 6. Radar — branch radar for user's preferred branches
        const preferredBranches = profile?.preferred_branches || [];
        const radarData = preferredBranches.slice(0, 6).map(branch => {
            const matches = predicted.filter(c =>
                (c.branch || '').toLowerCase().includes(branch.toLowerCase()) ||
                (c.branch_name || '').toLowerCase().includes(branch.toLowerCase())
            );
            const strong = matches.filter(c => c.is_most_probable || c.fit === 'Best Fit' || c.probability_level === 'Most Probable' || c.probability_level === 'Best Fit');
            return { branch: branch.length > 10 ? branch.slice(0, 10) + '..' : branch, matches: matches.length, strong: strong.length };
        });

        // 7. Avg admission chance per fit category (gauge-like area)
        const trendData = ['Most Probable', 'Best Fit', 'Good Fit', 'Stretch'].map(cat => {
            const group = predicted.filter(c => {
                if (cat === 'Most Probable') return c.is_most_probable || c.probability_level === 'Most Probable';
                return c.fit === cat || c.probability_level === cat;
            });
            const avg = group.length ? group.reduce((s, c) => s + parseFloat(c.admission_chance_percentage?.replace('%', '') || '0'), 0) / group.length : 0;
            const avgFees = group.length ? group.reduce((s, c) => s + (c.fees || 0), 0) / group.length / 100000 : 0;
            const avgPkg = group.length ? group.reduce((s, c) => s + (c.average_package_lpa || 0), 0) / group.length : 0;
            return { cat, count: group.length, avgChance: parseFloat(avg.toFixed(1)), avgFees: parseFloat(avgFees.toFixed(1)), avgPkg: parseFloat(avgPkg.toFixed(1)) };
        });

        // 8. KPI numbers
        const totalPredicted = predicted.length;
        const avgChance = predicted.length ? (predicted.reduce((s, c) => s + parseFloat(c.admission_chance_percentage?.replace('%', '') || '0'), 0) / predicted.length).toFixed(1) : '0';
        const uniqueColleges = new Set(predicted.map(c => c.college_code)).size;
        const topCity = cityData[0]?.city || '—';
        const highROI = roiData.filter(c => c.y / c.x > 3).length;

        return { dist, branchData, cityData, roiData, buckets, radarData, trendData, totalPredicted, avgChance, uniqueColleges, topCity, highROI };
    }, [colleges, profile]);

    // ─── Loading skeleton ─────────────────────────────────────────────────────
    if (!colleges.length || !data) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar activeTab="analytics" />
                <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-10 animate-pulse">
                        <div className="h-10 bg-gray-200 rounded w-64 mb-3"></div>
                        <div className="h-5 bg-gray-100 rounded w-80"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 animate-pulse">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                                <div className="h-9 bg-gray-200 rounded w-16 mb-2"></div>
                                <div className="h-3 bg-gray-100 rounded w-20"></div>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
                                <div className="h-52 bg-gray-100 rounded-xl"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ─── KPI cards ────────────────────────────────────────────────────────────
    const kpis = [
        { label: 'Total Predictions', value: data.totalPredicted, sub: 'ML-matched colleges', icon: Brain, color: 'indigo' },
        { label: 'Avg Admission Chance', value: `${data.avgChance}%`, sub: 'Across all predictions', icon: Target, color: 'emerald' },
        { label: 'Unique Colleges', value: data.uniqueColleges, sub: 'Distinct institutions', icon: Building, color: 'violet' },
        { label: 'High ROI Picks', value: data.highROI, sub: 'Package > 3× Fees', icon: TrendingUp, color: 'amber' },
    ];

    const colorMap: Record<string, string> = {
        indigo: 'bg-indigo-100 text-indigo-600',
        emerald: 'bg-emerald-100 text-emerald-600',
        violet: 'bg-violet-100 text-violet-600',
        amber: 'bg-amber-100 text-amber-600',
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar activeTab="analytics" />

            <motion.div
                className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8"
                variants={stagger} initial="hidden" animate="visible"
            >
                {/* ── Header ── */}
                <motion.div variants={fadeUp} className="mb-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-1">Admission Intelligence</h1>
                            <p className="text-slate-500">
                                AI-analysed report for <span className="font-semibold text-slate-700">{profile?.name?.split(' ')[0] || 'you'}</span>
                                {' · '}<span className="font-semibold text-indigo-600">{data.totalPredicted} predictions</span>
                                {' · '}{profile?.exam_type} score <span className="font-semibold text-slate-700">{profile?.cet_score || profile?.diploma_score}</span>
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 border border-slate-200 bg-white rounded-xl px-4 py-2 shadow-sm">
                            <Zap className="w-3.5 h-3.5 text-indigo-500" />
                            Live from ML engine
                        </div>
                    </div>
                </motion.div>

                {/* ── KPI Strip ── */}
                <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {kpis.map((k) => (
                        <div key={k.label} className={`${CARD} flex flex-col`}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`p-2 rounded-lg ${colorMap[k.color]}`}>
                                    <k.icon className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{k.label}</span>
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mb-1">{k.value}</div>
                            <p className="text-xs text-slate-400">{k.sub}</p>
                        </div>
                    ))}
                </motion.div>

                {/* ── Row 1: Donut + Admission Chance Histogram ── */}
                <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">

                    {/* Prediction Donut */}
                    <div className={`${CARD} lg:col-span-4`}>
                        <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                            <PieChartIcon className="w-4 h-4 text-indigo-500" /> Prediction Distribution
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">How your matches are classified by ML</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={data.dist} innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                    {data.dist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" iconSize={8} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Admission Chance Histogram */}
                    <div className={`${CARD} lg:col-span-8`}>
                        <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-violet-500" /> Admission Chance Distribution
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">Number of colleges per admission probability band</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={data.buckets} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" name="Colleges" radius={[6, 6, 0, 0]}>
                                    {data.buckets.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* ── Row 2: Branch Stacked Bar ── */}
                <motion.div variants={fadeUp} className={`${CARD} mb-6`}>
                    <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-500" /> Branch-wise Prediction Breakdown
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">Stacked by ML classification across all predicted branches</p>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data.branchData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-25} textAnchor="end" interval={0} />
                            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" iconSize={8} />
                            <Bar dataKey="mostProbable" name="Most Probable" stackId="a" fill={COLORS.mostProbable} />
                            <Bar dataKey="bestFit" name="Best Fit" stackId="a" fill={COLORS.bestFit} />
                            <Bar dataKey="goodFit" name="Good Fit" stackId="a" fill={COLORS.goodFit} />
                            <Bar dataKey="stretch" name="Stretch" stackId="a" fill={COLORS.stretch} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* ── Row 3: City Bar + Radar ── */}
                <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">

                    {/* City Opportunities */}
                    <div className={`${CARD} lg:col-span-7`}>
                        <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500" /> Top Cities by Predicted Matches
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">Cities with the most ML-approved college options</p>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={data.cityData} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis type="category" dataKey="city" tick={{ fontSize: 11, fill: '#64748b' }} width={60} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" name="Matches" fill="#6366f1" radius={[0, 6, 6, 0]}>
                                    {data.cityData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Branch Radar */}
                    {data.radarData.length >= 3 && (
                        <div className={`${CARD} lg:col-span-5`}>
                            <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                                <Target className="w-4 h-4 text-purple-500" /> Your Branch Strength Radar
                            </h3>
                            <p className="text-xs text-slate-400 mb-2">Preferred branches vs strong matches</p>
                            <ResponsiveContainer width="100%" height={240}>
                                <RadarChart cx="50%" cy="50%" outerRadius={85} data={data.radarData}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="branch" tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <PolarRadiusAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                                    <Radar name="All Matches" dataKey="matches" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
                                    <Radar name="Strong Matches" dataKey="strong" stroke="#059669" fill="#059669" fillOpacity={0.25} />
                                    <Legend iconType="circle" iconSize={8} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </motion.div>

                {/* ── Row 4: Avg metrics by category area chart ── */}
                <motion.div variants={fadeUp} className={`${CARD} mb-6`}>
                    <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" /> Avg Admission Chance, Fees & Package by Prediction Category
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">Comparative overview across all ML-classified groups</p>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={data.trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorChance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorPkg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} /><stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="cat" tick={{ fontSize: 11, fill: '#64748b' }} />
                            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" iconSize={8} />
                            <Area yAxisId="left" type="monotone" dataKey="avgChance" name="Avg Chance (%)" stroke="#6366f1" fill="url(#colorChance)" strokeWidth={2} dot={{ r: 4 }} />
                            <Area yAxisId="right" type="monotone" dataKey="avgPkg" name="Avg Package (LPA)" stroke="#059669" fill="url(#colorPkg)" strokeWidth={2} dot={{ r: 4 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* ── Row 5: Fees vs Package Scatter ── */}
                <motion.div variants={fadeUp} className={`${CARD} mb-6`}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-emerald-500" /> ROI Map — Annual Fees vs Average Package
                            </h3>
                            <p className="text-xs text-slate-400">Bubble size = placement rate. Values from ML-matched colleges only.</p>
                        </div>
                        <div className="flex gap-4 mt-3 sm:mt-0 text-xs">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span> Most Probable</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Best Fit</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Stretch</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <ScatterChart margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis type="number" dataKey="x" name="Fees" unit="L" label={{ value: 'Annual Fees (Lakhs)', position: 'bottom', offset: 0, fontSize: 11, fill: '#94a3b8' }} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <YAxis type="number" dataKey="y" name="Package" unit=" LPA" label={{ value: 'Avg Package (LPA)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                            <ZAxis type="number" dataKey="z" range={[40, 300]} name="Placement %" unit="%" />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                content={({ active, payload }) => {
                                    if (!active || !payload?.length) return null;
                                    const d = payload[0].payload;
                                    return (
                                        <div className="bg-white border border-slate-200 shadow-lg rounded-xl p-3 text-sm max-w-xs">
                                            <p className="font-semibold text-slate-800 text-xs mb-1 line-clamp-1">{d.name}</p>
                                            <p className="text-slate-500">Fees: <strong className="text-slate-800">₹{d.x}L/yr</strong></p>
                                            <p className="text-slate-500">Pkg: <strong className="text-slate-800">{d.y} LPA</strong></p>
                                            <p className="text-slate-500">Placement: <strong className="text-slate-800">{d.z}%</strong></p>
                                            <span className="mt-1 inline-block text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">{d.fit}</span>
                                        </div>
                                    );
                                }}
                            />
                            <Scatter name="Predicted Colleges" data={data.roiData} fill="#6366f1">
                                {data.roiData.map((entry, i) => {
                                    const c = entry.fit === 'Most Probable' ? '#7c3aed' : entry.fit === 'Best Fit' ? '#059669' : entry.fit === 'Stretch' ? '#d97706' : '#2563eb';
                                    return <Cell key={i} fill={c} fillOpacity={0.75} />;
                                })}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* ── Row 6: Per-category summary table ── */}
                <motion.div variants={fadeUp} className={`${CARD} mb-8`}>
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-indigo-500" /> Category Performance Summary
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="text-left py-3 px-4 text-slate-500 font-semibold">Category</th>
                                    <th className="text-right py-3 px-4 text-slate-500 font-semibold">Colleges</th>
                                    <th className="text-right py-3 px-4 text-slate-500 font-semibold">Avg Chance</th>
                                    <th className="text-right py-3 px-4 text-slate-500 font-semibold">Avg Fees (L/yr)</th>
                                    <th className="text-right py-3 px-4 text-slate-500 font-semibold">Avg Pkg (LPA)</th>
                                    <th className="text-right py-3 px-4 text-slate-500 font-semibold">ROI Ratio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.trendData.map((row, i) => {
                                    const dotColor = [COLORS.mostProbable, COLORS.bestFit, COLORS.goodFit, COLORS.stretch][i] || '#94a3b8';
                                    const roi = row.avgFees > 0 ? (row.avgPkg / row.avgFees).toFixed(1) : '—';
                                    return (
                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-4">
                                                <span className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }}></span>
                                                    <span className="font-medium text-slate-800">{row.cat}</span>
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right font-semibold text-slate-700">{row.count}</td>
                                            <td className="py-3 px-4 text-right">
                                                <span className="font-semibold" style={{ color: dotColor }}>{row.avgChance}%</span>
                                            </td>
                                            <td className="py-3 px-4 text-right text-slate-600">₹{row.avgFees}L</td>
                                            <td className="py-3 px-4 text-right text-slate-600">{row.avgPkg} LPA</td>
                                            <td className="py-3 px-4 text-right">
                                                <span className={`font-bold ${parseFloat(roi) >= 3 ? 'text-emerald-600' : parseFloat(roi) >= 2 ? 'text-amber-600' : 'text-slate-500'}`}>{roi}×</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* ── Bottom note ── */}
                <motion.div variants={fadeUp} className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    All data sourced from your personalised ML predictions · Scores and cutoffs based on {profile?.exam_type} {new Date().getFullYear()}
                </motion.div>
            </motion.div>

            <Footer />
        </div>
    );
}
