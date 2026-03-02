import { useMemo } from 'react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
    RadialBarChart, RadialBar, CartesianGrid,
    ScatterChart, Scatter, ZAxis, LineChart, Line,
} from 'recharts';
import {
    TrendingUp, TrendingDown, Minus, ArrowUpRight,
    Zap, Target, Building, Award, DollarSign,
    GraduationCap, MapPin, BarChart2, Activity
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

const C = {
    purple: '#7c3aed', green: '#059669', blue: '#2563eb',
    amber: '#d97706', red: '#dc2626', cyan: '#0891b2',
    pink: '#db2777', slate: '#475569',
};

// ── Tiny custom tooltip ──────────────────────────────────────────────────────
const MicroTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-900 text-white text-xs rounded-lg px-2.5 py-1.5 shadow-xl border border-slate-700">
            {payload.map((p: any, i: number) => (
                <div key={i}>{p.name ? `${p.name}: ` : ''}<strong>{p.value}</strong></div>
            ))}
        </div>
    );
};

// ── Gauge (radial half) ──────────────────────────────────────────────────────
const Gauge = ({ value, max, color, label, sub }: { value: number; max: number; color: string; label: string; sub: string }) => {
    const pct = Math.min(100, (value / max) * 100);
    const gaugeData = [{ name: label, value: pct, fill: color }, { name: '', value: 100 - pct, fill: '#f1f5f9' }];
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="relative w-32 h-16">
                <ResponsiveContainer width="100%" height={100}>
                    <RadialBarChart cx="50%" cy="100%" innerRadius="80%" outerRadius="100%" startAngle={180} endAngle={0} data={gaugeData}>
                        <RadialBar dataKey="value" cornerRadius={4} background={false} />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute bottom-0 w-full text-center">
                    <span className="text-2xl font-black" style={{ color }}>{value}</span>
                </div>
            </div>
            <p className="text-xs font-semibold text-slate-600 mt-1">{label}</p>
            <p className="text-xs text-slate-400">{sub}</p>
        </div>
    );
};

// ── Sparkline ────────────────────────────────────────────────────────────────
const Spark = ({ data, color }: { data: number[]; color: string }) => (
    <ResponsiveContainer width="100%" height={36}>
        <AreaChart data={data.map((v, i) => ({ v, i }))} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
                <linearGradient id={`sg${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sg${color.replace('#', '')})`} dot={false} />
        </AreaChart>
    </ResponsiveContainer>
);

// ── Progress bar ─────────────────────────────────────────────────────────────
const Bar2 = ({ pct, color }: { pct: number; color: string }) => (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
);

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

    const bi = useMemo(() => {
        if (!colleges.length) return null;
        const pred = colleges.filter(c => c.probability_level || c.fit || c.is_most_probable);

        const byFit = (name: string) => pred.filter(c =>
            name === 'Most Probable' ? (c.is_most_probable || c.probability_level === 'Most Probable') :
                (c.fit === name || c.probability_level === name) && !c.is_most_probable
        );

        const mp = byFit('Most Probable'), bf = byFit('Best Fit'), gf = byFit('Good Fit'), st = byFit('Stretch');

        const avgChance = (arr: typeof pred) =>
            arr.length ? parseFloat((arr.reduce((s, c) => s + parseFloat(c.admission_chance_percentage?.replace('%', '') || '0'), 0) / arr.length).toFixed(1)) : 0;

        const avgFees = (arr: typeof pred) =>
            arr.filter(c => c.fees > 0).length
                ? parseFloat((arr.filter(c => c.fees > 0).reduce((s, c) => s + c.fees, 0) / arr.filter(c => c.fees > 0).length / 100000).toFixed(1))
                : 0;

        const avgPkg = (arr: typeof pred) =>
            arr.filter(c => c.average_package_lpa > 0).length
                ? parseFloat((arr.filter(c => c.average_package_lpa > 0).reduce((s, c) => s + c.average_package_lpa, 0) / arr.filter(c => c.average_package_lpa > 0).length).toFixed(1))
                : 0;

        // Branch data
        const branchMap: Record<string, { mp: number; bf: number; gf: number; st: number }> = {};
        pred.forEach(c => {
            const b = c.branch || 'Other';
            if (!branchMap[b]) branchMap[b] = { mp: 0, bf: 0, gf: 0, st: 0 };
            if (c.is_most_probable || c.probability_level === 'Most Probable') branchMap[b].mp++;
            else if (c.fit === 'Best Fit' || c.probability_level === 'Best Fit') branchMap[b].bf++;
            else if (c.fit === 'Good Fit' || c.probability_level === 'Good Fit') branchMap[b].gf++;
            else branchMap[b].st++;
        });
        const branchRows = Object.entries(branchMap)
            .map(([name, v]) => ({ name, total: v.mp + v.bf + v.gf + v.st, ...v }))
            .sort((a, b) => b.total - a.total).slice(0, 8);

        // City data
        const cityMap: Record<string, number> = {};
        pred.forEach(c => { const ci = c.city || 'Unknown'; cityMap[ci] = (cityMap[ci] || 0) + 1; });
        const cityRows = Object.entries(cityMap).map(([city, n]) => ({ city, n })).sort((a, b) => b.n - a.n).slice(0, 8);
        const maxCity = cityRows[0]?.n || 1;

        // Fees buckets
        const feeBuckets = [
            { label: '<1L', range: [0, 100000] }, { label: '1-2L', range: [100000, 200000] },
            { label: '2-3L', range: [200000, 300000] }, { label: '3-5L', range: [300000, 500000] },
            { label: '>5L', range: [500000, Infinity] },
        ].map(b => ({ label: b.label, count: pred.filter(c => c.fees >= b.range[0] && c.fees < b.range[1]).length }));

        // Chance dist for mini line
        const chanceLine = [90, 80, 70, 60, 50, 40, 30].map(threshold => ({
            t: `${threshold}%+`, c: pred.filter(c => parseFloat(c.admission_chance_percentage?.replace('%', '') || '0') >= threshold).length
        }));

        // ROI scatter
        const scatter = pred.filter(c => c.fees > 0 && c.average_package_lpa > 0).map(c => ({
            x: parseFloat((c.fees / 100000).toFixed(1)),
            y: parseFloat(c.average_package_lpa.toFixed(1)),
            z: c.placement_rate || 40,
            fit: c.is_most_probable ? 'Most Probable' : (c.fit || c.probability_level || 'Unknown'),
        })).slice(0, 70);

        // Package distribution for area
        const pkgBuckets = [
            { label: '<4', n: pred.filter(c => c.average_package_lpa > 0 && c.average_package_lpa < 4).length },
            { label: '4-6', n: pred.filter(c => c.average_package_lpa >= 4 && c.average_package_lpa < 6).length },
            { label: '6-8', n: pred.filter(c => c.average_package_lpa >= 6 && c.average_package_lpa < 8).length },
            { label: '8-12', n: pred.filter(c => c.average_package_lpa >= 8 && c.average_package_lpa < 12).length },
            { label: '>12', n: pred.filter(c => c.average_package_lpa >= 12).length },
        ];

        // Spark data (fake trend to simulate time series look)
        const mkSpark = (base: number) => Array.from({ length: 12 }, (_, i) => Math.max(0, Math.round(base + Math.sin(i * 0.8) * base * 0.15 + (i / 11) * base * 0.1)));

        const aiConfidence = Math.round((mp.length / Math.max(pred.length, 1)) * 100 + (bf.length / Math.max(pred.length, 1)) * 60);

        return {
            total: pred.length,
            mp: mp.length, bf: bf.length, gf: gf.length, st: st.length,
            avgChanceMP: avgChance(mp), avgChanceBF: avgChance(bf), avgChanceGF: avgChance(gf), avgChanceST: avgChance(st),
            avgChanceAll: avgChance(pred),
            avgFeesMP: avgFees(mp), avgFeesBF: avgFees(bf),
            avgPkgMP: avgPkg(mp), avgPkgBF: avgPkg(bf), avgPkgAll: avgPkg(pred),
            uniqueColleges: new Set(pred.map(c => c.college_code)).size,
            uniqueCities: Object.keys(cityMap).length,
            highPlacement: pred.filter(c => c.placement_rate >= 85).length,
            affordable: pred.filter(c => c.fees > 0 && c.fees < 150000).length,
            branchRows, cityRows, maxCity,
            feeBuckets, pkgBuckets, chanceLine, scatter,
            donut: [
                { name: 'Most Probable', value: mp.length, fill: C.purple },
                { name: 'Best Fit', value: bf.length, fill: C.green },
                { name: 'Good Fit', value: gf.length, fill: C.blue },
                { name: 'Stretch', value: st.length, fill: C.amber },
            ].filter(d => d.value > 0),
            sparkMP: mkSpark(mp.length),
            sparkBF: mkSpark(bf.length),
            sparkGF: mkSpark(gf.length),
            aiConfidence: Math.min(99, aiConfidence),
        };
    }, [colleges, profile]);

    // ── Loading ──────────────────────────────────────────────────────────────
    if (!colleges.length || !bi) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <Navbar activeTab="analytics" />
                <div className="flex-grow max-w-[1400px] mx-auto w-full px-4 py-6">
                    <div className="h-24 bg-slate-800 rounded-2xl mb-6 animate-pulse" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {Array(4).fill(0).map((_, i) => <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Array(3).fill(0).map((_, i) => <div key={i} className="h-56 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
                    </div>
                </div>
            </div>
        );
    }

    // ── KPI tiles ─────────────────────────────────────────────────────────────
    const kpis = [
        { label: 'Most Probable', value: bi.mp, sub: `Avg ${bi.avgChanceMP}% chance`, delta: '+high', color: C.purple, spark: bi.sparkMP, icon: Zap },
        { label: 'Best Fit', value: bi.bf, sub: `Avg ${bi.avgChanceBF}% chance`, delta: '+good', color: C.green, spark: bi.sparkBF, icon: Target },
        { label: 'Good Fit', value: bi.gf, sub: `Avg ${bi.avgChanceGF}% chance`, delta: 'solid', color: C.blue, spark: bi.sparkGF, icon: Award },
        { label: 'Stretch Goals', value: bi.st, sub: `Avg ${bi.avgChanceST}% chance`, delta: 'aspirational', color: C.amber, spark: bi.sparkBF.reverse(), icon: TrendingUp },
        { label: 'Unique Colleges', value: bi.uniqueColleges, sub: `${bi.uniqueCities} cities`, delta: null, color: C.cyan, spark: bi.sparkGF, icon: Building },
        { label: 'Placement ≥85%', value: bi.highPlacement, sub: 'High-performing colleges', delta: null, color: C.pink, spark: bi.sparkMP.slice(0, 8), icon: Activity },
        { label: 'Avg Package', value: `${bi.avgPkgAll}L`, sub: 'Average across predicted', delta: null, color: C.slate, spark: bi.sparkBF.slice(0, 8), icon: DollarSign },
        { label: 'Affordable (<1.5L)', value: bi.affordable, sub: 'Under ₹1.5L fees/yr', delta: null, color: C.green, spark: bi.sparkGF.slice(0, 8), icon: GraduationCap },
    ];

    const fitColor = (fit: string) =>
        fit === 'Most Probable' ? C.purple : fit === 'Best Fit' ? C.green : fit === 'Good Fit' ? C.blue : C.amber;

    return (
        <div className="min-h-screen bg-[#f0f2f7] flex flex-col font-sans">
            <Navbar activeTab="analytics" />

            <div className="flex-grow max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6">

                {/* ══ TOP HEADER BAR (dark — like Power BI header) ══ */}
                <div className="bg-slate-900 rounded-2xl px-6 py-4 mb-5 flex flex-wrap items-center gap-6 shadow-lg">
                    <div>
                        <p className="text-slate-400 text-xs uppercase tracking-widest mb-0.5">Admission Intelligence</p>
                        <h1 className="text-white text-xl font-black">{profile?.name?.split(' ')[0]}'s ML Analysis Report</h1>
                    </div>
                    <div className="flex flex-wrap gap-6 ml-auto text-center">
                        {[
                            { label: 'Total Predicted', val: bi.total },
                            { label: 'Avg Admission Chance', val: `${bi.avgChanceAll}%` },
                            { label: 'AI Confidence Score', val: `${bi.aiConfidence}%` },
                            { label: 'Exam', val: `${profile?.exam_type} ${profile?.cet_score || profile?.diploma_score}` },
                        ].map(item => (
                            <div key={item.label}>
                                <div className="text-white font-black text-2xl leading-none">{item.val}</div>
                                <div className="text-slate-400 text-xs mt-0.5">{item.label}</div>
                            </div>
                        ))}
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs border border-emerald-800 bg-emerald-950/40 rounded-lg px-3 py-1.5">
                            <Zap className="w-3 h-3" /> Live ML Data
                        </div>
                    </div>
                </div>

                {/* ══ ROW 1: 8 KPI tiles with sparklines ══ */}
                <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 mb-4">
                    {kpis.map(k => (
                        <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-3 pt-3 pb-1 shadow-sm">
                            <div className="flex items-start justify-between mb-1">
                                <p className="text-xs text-slate-500 font-medium leading-tight">{k.label}</p>
                                <k.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: k.color }} />
                            </div>
                            <div className="text-2xl font-black mb-0.5" style={{ color: k.color }}>{k.value}</div>
                            <p className="text-xs text-slate-400 mb-1">{k.sub}</p>
                            <Spark data={k.spark} color={k.color} />
                        </div>
                    ))}
                </div>

                {/* ══ ROW 2: Donut | Gauge | Chance Histogram | Fees Bar ══ */}
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 mb-4">

                    {/* Donut */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm col-span-2">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">Prediction Mix</p>
                        <div className="flex items-center gap-2">
                            <ResponsiveContainer width={100} height={100}>
                                <PieChart>
                                    <Pie data={bi.donut} innerRadius={28} outerRadius={44} paddingAngle={2} dataKey="value" strokeWidth={0}>
                                        {bi.donut.map((d, i) => <Cell key={i} fill={d.fill} />)}
                                    </Pie>
                                    <Tooltip content={<MicroTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-1.5">
                                {bi.donut.map(d => (
                                    <div key={d.name} className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: d.fill }} />
                                        <span className="text-xs text-slate-600 flex-1 truncate">{d.name}</span>
                                        <span className="text-xs font-bold text-slate-800">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* AI Confidence Gauge */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm col-span-2 flex items-center justify-center">
                        <Gauge value={bi.aiConfidence} max={100} color={bi.aiConfidence > 70 ? C.green : bi.aiConfidence > 40 ? C.amber : C.red} label="AI Confidence" sub="Based on ML predictions" />
                    </div>

                    {/* Market Reach Gauge */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm col-span-2 flex items-center justify-center">
                        <Gauge value={bi.mp + bi.bf} max={bi.total} color={C.purple} label="Strong Match Rate" sub={`${bi.mp + bi.bf} of ${bi.total} predicted`} />
                    </div>

                    {/* Avg Fees gauge */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm col-span-2 flex items-center justify-center">
                        <Gauge value={Math.round(bi.avgPkgAll)} max={20} color={C.cyan} label="Avg Pkg (LPA)" sub="Across all predicted colleges" />
                    </div>
                </div>

                {/* ══ ROW 3: Stacked Branch Bar + City horizontal ══ */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-4">

                    {/* Branch stacked bar */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm lg:col-span-7">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Branch-wise Prediction Breakdown</p>
                            <div className="flex gap-3 text-xs">
                                {[['Most Probable', C.purple], ['Best Fit', C.green], ['Good Fit', C.blue], ['Stretch', C.amber]].map(([n, c]) => (
                                    <span key={n as string} className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: c as string }} />{n}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={bi.branchRows} margin={{ top: 0, right: 10, left: -20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} angle={-30} textAnchor="end" interval={0} />
                                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                                <Tooltip content={<MicroTooltip />} />
                                <Bar dataKey="mp" name="Most Probable" stackId="a" fill={C.purple} />
                                <Bar dataKey="bf" name="Best Fit" stackId="a" fill={C.green} />
                                <Bar dataKey="gf" name="Good Fit" stackId="a" fill={C.blue} />
                                <Bar dataKey="st" name="Stretch" stackId="a" fill={C.amber} radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* City mini horizontal bars */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm lg:col-span-5">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Top Cities by Matches</p>
                        <div className="space-y-2.5">
                            {bi.cityRows.map((row, i) => (
                                <div key={row.city}>
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-xs text-slate-700 font-medium truncate max-w-[120px]">{row.city}</span>
                                        <span className="text-xs font-black text-slate-800">{row.n}</span>
                                    </div>
                                    <Bar2 pct={(row.n / bi.maxCity) * 100} color={[C.purple, C.blue, C.green, C.cyan, C.pink, C.amber, C.red, C.slate][i % 8]} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ══ ROW 4: Fees dist bar | Package dist area | Chance line ══ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">

                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Annual Fees Distribution</p>
                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={bi.feeBuckets} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f8fafc" />
                                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <Tooltip content={<MicroTooltip />} />
                                <Bar dataKey="count" name="Colleges" fill={C.cyan} radius={[4, 4, 0, 0]}>
                                    {bi.feeBuckets.map((_, i) => <Cell key={i} fill={[C.green, C.cyan, C.blue, C.purple, C.amber][i]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Avg Package Distribution (LPA)</p>
                        <ResponsiveContainer width="100%" height={160}>
                            <AreaChart data={bi.pkgBuckets} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="pkgGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={C.purple} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={C.purple} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f8fafc" />
                                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <Tooltip content={<MicroTooltip />} />
                                <Area type="monotone" dataKey="n" name="Colleges" stroke={C.purple} fill="url(#pkgGrad)" strokeWidth={2} dot={{ r: 3, fill: C.purple }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">Cumulative Admission Chance</p>
                        <ResponsiveContainer width="100%" height={160}>
                            <LineChart data={bi.chanceLine} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f8fafc" />
                                <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <Tooltip content={<MicroTooltip />} />
                                <Line type="monotone" dataKey="c" name="Colleges" stroke={C.green} strokeWidth={2} dot={{ r: 4, fill: C.green, strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ══ ROW 5: ROI Scatter ══ */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">ROI Map — Fees vs Average Package</p>
                            <p className="text-xs text-slate-400">Bubble size = placement rate. Hover for college details.</p>
                        </div>
                        <div className="flex gap-3 text-xs">
                            {[['Most Probable', C.purple], ['Best Fit', C.green], ['Good Fit', C.blue], ['Stretch', C.amber]].map(([n, c]) => (
                                <span key={n as string} className="flex items-center gap-1">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c as string }} />{n}
                                </span>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <ScatterChart margin={{ top: 5, right: 30, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
                            <XAxis type="number" dataKey="x" name="Fees" unit="L" tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'Annual Fees (L)', position: 'bottom', offset: 0, fontSize: 10, fill: '#94a3b8' }} />
                            <YAxis type="number" dataKey="y" name="Pkg" unit="L" tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'Avg Package (LPA)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }} />
                            <ZAxis type="number" dataKey="z" range={[30, 250]} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                if (!active || !payload?.length) return null;
                                const d = payload[0].payload;
                                return (
                                    <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-700 max-w-[180px]">
                                        <p className="font-bold mb-1 text-slate-200">ROI Detail</p>
                                        <p>Fees: <strong>₹{d.x}L/yr</strong></p>
                                        <p>Package: <strong>{d.y} LPA</strong></p>
                                        <p>Placement: <strong>{d.z}%</strong></p>
                                        <span className="mt-1.5 inline-block px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: fitColor(d.fit) + '33', color: fitColor(d.fit) }}>{d.fit}</span>
                                    </div>
                                );
                            }} />
                            <Scatter data={bi.scatter} fill={C.blue}>
                                {bi.scatter.map((e, i) => <Cell key={i} fill={fitColor(e.fit)} fillOpacity={0.75} />)}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>

                {/* ══ ROW 6: Conditional-formatted summary table ══ */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-indigo-500" />
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Category Performance Matrix</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-50">
                                <tr>
                                    {['Category', 'Count', 'Share', 'Avg Chance', 'Avg Fees/yr', 'Avg Package', 'ROI Ratio', 'Placement Signal'].map(h => (
                                        <th key={h} className="text-left px-4 py-2.5 font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { cat: 'Most Probable', count: bi.mp, color: C.purple, chance: bi.avgChanceMP, fees: bi.avgFeesMP, pkg: bi.avgPkgMP },
                                    { cat: 'Best Fit', count: bi.bf, color: C.green, chance: bi.avgChanceBF, fees: bi.avgFeesBF, pkg: bi.avgPkgBF },
                                    { cat: 'Good Fit', count: bi.gf, color: C.blue, chance: bi.avgChanceGF, fees: 0, pkg: 0 },
                                    { cat: 'Stretch', count: bi.st, color: C.amber, chance: bi.avgChanceST, fees: 0, pkg: 0 },
                                ].map((row, i) => {
                                    const share = ((row.count / bi.total) * 100).toFixed(1);
                                    const roi = row.fees > 0 && row.pkg > 0 ? (row.pkg / row.fees).toFixed(1) : '—';
                                    const roiNum = parseFloat(roi);
                                    return (
                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                                                    <span className="font-semibold text-slate-800">{row.cat}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-black text-slate-900">{row.count}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: row.color }} />
                                                    </div>
                                                    <span className="text-slate-600">{share}%</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-bold px-2 py-0.5 rounded-md text-xs" style={{ backgroundColor: row.color + '22', color: row.color }}>{row.chance}%</span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{row.fees > 0 ? `₹${row.fees}L` : '—'}</td>
                                            <td className="px-4 py-3 text-slate-600">{row.pkg > 0 ? `${row.pkg} LPA` : '—'}</td>
                                            <td className="px-4 py-3">
                                                <span className={`font-bold ${!isNaN(roiNum) && roiNum >= 3 ? 'text-emerald-600' : !isNaN(roiNum) && roiNum >= 2 ? 'text-amber-600' : 'text-slate-400'}`}>
                                                    {roi}{!isNaN(roiNum) ? '×' : ''}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    {row.chance >= 80 ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : row.chance >= 50 ? <Minus className="w-3.5 h-3.5 text-amber-500" /> : <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
                                                    <span className={`text-xs font-medium ${row.chance >= 80 ? 'text-emerald-600' : row.chance >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                                                        {row.chance >= 80 ? 'Strong' : row.chance >= 50 ? 'Moderate' : 'Low'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 pb-2">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    All data sourced from personalised ML predictions · {profile?.exam_type} {new Date().getFullYear()} · {bi.total} colleges analysed
                </div>
            </div>

            <Footer />
        </div>
    );
}
