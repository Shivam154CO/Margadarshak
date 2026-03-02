import { useMemo } from 'react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
    RadialBarChart, RadialBar, CartesianGrid,
    ScatterChart, Scatter, ZAxis, LineChart, Line,
} from 'recharts';
import {
    TrendingUp, TrendingDown, Minus, ArrowUpRight, Zap, Target, Building, Award,
    DollarSign, GraduationCap, MapPin, BarChart2, Activity, Brain, Shield,
    CheckCircle, Star, Globe, Layers, BookOpen, AlertTriangle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useColleges } from '../context/CollegesContext';
import { computeBI } from './analyticsHelpers';

interface UserProfile {
    id: string; name: string; email: string; state: string; category: string;
    exam_type: string; cet_rank: string; cet_score: string; diploma_rank: string;
    diploma_score: string; preferred_branches: string[]; university_preference: string;
    address: string; receive_updates: boolean; profile_complete: boolean;
    created_at: string; updated_at: string;
}

const C: Record<string, string> = { purple: '#7c3aed', green: '#059669', blue: '#2563eb', amber: '#d97706', red: '#dc2626', cyan: '#0891b2', pink: '#db2777', slate: '#475569' };
const fitColor = (f: string) => f === 'Most Probable' ? C.purple : f === 'Best Fit' ? C.green : f === 'Good Fit' ? C.blue : f === 'Stretch' ? C.amber : C.slate;

const Tip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (<div className="bg-slate-900 text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-xl border border-slate-700">
        {payload.map((p: any, i: number) => <div key={i}>{p.name}: <strong>{typeof p.value === 'number' && p.value % 1 !== 0 ? p.value.toFixed(1) : p.value}</strong></div>)}
    </div>);
};

const Spark = ({ data, color }: { data: number[]; color: string }) => (
    <ResponsiveContainer width="100%" height={32}>
        <AreaChart data={data.map((v, i) => ({ v, i }))} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs><linearGradient id={`s${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} /><stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient></defs>
            <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#s${color.replace('#', '')})`} dot={false} />
        </AreaChart>
    </ResponsiveContainer>
);

const Gauge = ({ value, max, color, label }: { value: number; max: number; color: string; label: string }) => {
    const pct = Math.min(100, (value / Math.max(max, 1)) * 100);
    return (
        <div className="flex flex-col items-center">
            <div className="relative w-28 h-14">
                <ResponsiveContainer width="100%" height={80}>
                    <RadialBarChart cx="50%" cy="100%" innerRadius="78%" outerRadius="100%" startAngle={180} endAngle={0}
                        data={[{ value: pct, fill: color }, { value: 100 - pct, fill: '#f1f5f9' }]}>
                        <RadialBar dataKey="value" cornerRadius={4} />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute bottom-0 w-full text-center"><span className="text-xl font-black" style={{ color }}>{value}</span></div>
            </div>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{label}</p>
        </div>
    );
};

const ProgressBar = ({ pct, color }: { pct: number; color: string }) => (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }} />
    </div>
);

const Section = ({ title, icon: Icon, children, color = '#6366f1' }: { title: string; icon: any; children: React.ReactNode; color?: string }) => (
    <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: color + '18' }}><Icon className="w-4 h-4" style={{ color }} /></div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{title}</h2>
        </div>
        {children}
    </div>
);

const CARD = "bg-white border border-slate-200 rounded-xl p-4 shadow-sm";

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

    const bi = useMemo(() => computeBI(colleges, profile), [colleges, profile]);

    if (!colleges.length || !bi) {
        return (
            <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
                <Navbar activeTab="analytics" />
                <div className="flex-grow max-w-[1440px] mx-auto w-full px-4 py-6">
                    <div className="h-20 bg-slate-800 rounded-2xl mb-5 animate-pulse" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">{Array(8).fill(0).map((_, i) => <div key={i} className="h-28 bg-white rounded-xl border animate-pulse" />)}</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{Array(6).fill(0).map((_, i) => <div key={i} className="h-48 bg-white rounded-xl border animate-pulse" />)}</div>
                </div>
            </div>
        );
    }

    const kpis = [
        { label: 'Most Probable', value: bi.mp, sub: `${bi.avgChanceMP}% avg`, color: C.purple, spark: bi.sparkMP, icon: Zap },
        { label: 'Best Fit', value: bi.bf, sub: `${bi.avgChanceBF}% avg`, color: C.green, spark: bi.sparkBF, icon: Target },
        { label: 'Good Fit', value: bi.gf, sub: `${bi.avgChanceGF}% avg`, color: C.blue, spark: bi.sparkGF, icon: Award },
        { label: 'Stretch', value: bi.st, sub: `${bi.avgChanceST}% avg`, color: C.amber, spark: bi.sparkBF.reverse(), icon: TrendingUp },
        { label: 'Unique Colleges', value: bi.uniqueColleges, sub: `${bi.uniqueCities} cities`, color: C.cyan, spark: bi.sparkGF, icon: Building },
        { label: 'Placement ≥85%', value: bi.highPlacement, sub: 'Top performers', color: C.pink, spark: bi.sparkMP.slice(0, 8), icon: Activity },
        { label: 'Avg Package', value: `${bi.avgPkgAll}L`, sub: 'Across predicted', color: C.slate, spark: bi.sparkBF.slice(0, 8), icon: DollarSign },
        { label: 'Affordable', value: bi.affordable, sub: '<₹1.5L fees', color: C.green, spark: bi.sparkGF.slice(0, 8), icon: GraduationCap },
    ];

    return (
        <div className="min-h-screen bg-[#f0f2f5] flex flex-col font-sans">
            <Navbar activeTab="analytics" />
            <div className="flex-grow max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-5">

                {/* ═══ DARK HEADER ═══ */}
                <div className="bg-slate-900 rounded-2xl px-5 py-4 mb-4 flex flex-wrap items-center gap-5 shadow-lg">
                    <div className="mr-auto">
                        <p className="text-slate-400 text-[10px] uppercase tracking-[0.15em]">Admission Intelligence Dashboard</p>
                        <h1 className="text-white text-lg font-black">{profile?.name?.split(' ')[0]}'s ML Analysis Report</h1>
                    </div>
                    {[{ l: 'Predictions', v: bi.total }, { l: 'Avg Chance', v: `${bi.avgChanceAll}%` }, { l: 'Avg Pkg', v: `${bi.avgPkgAll}L` }, { l: 'Score', v: `${profile?.cet_score || profile?.diploma_score}` }].map(h => (
                        <div key={h.l} className="text-center"><div className="text-white font-black text-xl leading-none">{h.v}</div><div className="text-slate-400 text-[10px] mt-0.5">{h.l}</div></div>
                    ))}
                    <div className="flex items-center gap-1 text-emerald-400 text-[10px] border border-emerald-800 bg-emerald-950/40 rounded-lg px-2.5 py-1.5"><Zap className="w-3 h-3" /> Live ML Data</div>
                </div>

                {/* ═══ KPI TILES ═══ */}
                <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5 mb-4">
                    {kpis.map(k => (
                        <div key={k.label} className="bg-white rounded-xl border border-slate-200 px-3 pt-2.5 pb-0.5 shadow-sm">
                            <div className="flex items-start justify-between mb-0.5"><p className="text-[10px] text-slate-500 font-medium">{k.label}</p><k.icon className="w-3 h-3" style={{ color: k.color }} /></div>
                            <div className="text-xl font-black" style={{ color: k.color }}>{k.value}</div>
                            <p className="text-[10px] text-slate-400 mb-0.5">{k.sub}</p>
                            <Spark data={k.spark} color={k.color} />
                        </div>
                    ))}
                </div>

                {/* ═══ SECTION 1: PREDICTION OVERVIEW ═══ */}
                <Section title="Prediction Overview" icon={Brain} color={C.purple}>
                    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2.5">
                        <div className={`${CARD} col-span-2`}>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Prediction Mix</p>
                            <div className="flex items-center gap-3">
                                <ResponsiveContainer width={90} height={90}>
                                    <PieChart><Pie data={bi.donut} innerRadius={26} outerRadius={40} paddingAngle={2} dataKey="value" strokeWidth={0}>
                                        {bi.donut.map((d, i) => <Cell key={i} fill={d.fill} />)}
                                    </Pie><Tooltip content={<Tip />} /></PieChart>
                                </ResponsiveContainer>
                                <div className="space-y-1">
                                    {bi.donut.map(d => (<div key={d.name} className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: d.fill }} />
                                        <span className="text-[11px] text-slate-600">{d.name}</span>
                                        <span className="text-[11px] font-bold text-slate-800 ml-auto">{d.value}</span>
                                    </div>))}
                                </div>
                            </div>
                        </div>
                        <div className={`${CARD} flex items-center justify-center`}><Gauge value={bi.mp + bi.bf} max={bi.total} color={C.green} label="Strong Match Rate" /></div>
                        <div className={`${CARD} flex items-center justify-center`}><Gauge value={Math.round(bi.avgChanceAll)} max={100} color={C.blue} label="Avg Admission %" /></div>
                        <div className={`${CARD} flex items-center justify-center`}><Gauge value={Math.round(bi.avgPlcAll)} max={100} color={C.pink} label="Avg Placement %" /></div>
                        <div className={`${CARD} flex items-center justify-center`}><Gauge value={Math.round(bi.avgPkgAll)} max={20} color={C.cyan} label="Avg Package (LPA)" /></div>
                    </div>
                </Section>

                {/* ═══ SECTION 2: ADMISSION CHANCE ANALYSIS ═══ */}
                <Section title="Admission Chance Analysis" icon={Target} color={C.green}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <div className={CARD}>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Chance Distribution</p>
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={[
                                    { range: '90-100%', count: bi.total > 0 ? colleges.filter(c => parseFloat(c.admission_chance_percentage?.replace('%', '') || '0') >= 90).length : 0, color: C.purple },
                                    { range: '70-89%', count: colleges.filter(c => { const p = parseFloat(c.admission_chance_percentage?.replace('%', '') || '0'); return p >= 70 && p < 90; }).length, color: C.green },
                                    { range: '50-69%', count: colleges.filter(c => { const p = parseFloat(c.admission_chance_percentage?.replace('%', '') || '0'); return p >= 50 && p < 70; }).length, color: C.blue },
                                    { range: '30-49%', count: colleges.filter(c => { const p = parseFloat(c.admission_chance_percentage?.replace('%', '') || '0'); return p >= 30 && p < 50; }).length, color: C.amber },
                                    { range: '<30%', count: colleges.filter(c => { const p = parseFloat(c.admission_chance_percentage?.replace('%', '') || '0'); return p > 0 && p < 30; }).length, color: C.red },
                                ]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#94a3b8' }} /><YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="count" name="Colleges" radius={[4, 4, 0, 0]}>{[C.purple, C.green, C.blue, C.amber, C.red].map((c, i) => <Cell key={i} fill={c} />)}</Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className={CARD}>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Cumulative Chance Curve</p>
                            <ResponsiveContainer width="100%" height={180}>
                                <LineChart data={bi.chanceLine} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#94a3b8' }} /><YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <Tooltip content={<Tip />} />
                                    <Line type="monotone" dataKey="c" name="Colleges ≥" stroke={C.green} strokeWidth={2.5} dot={{ r: 4, fill: C.green, strokeWidth: 0 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Section>

                {/* ═══ SECTION 3: BRANCH INTELLIGENCE ═══ */}
                <Section title="Branch Intelligence" icon={GraduationCap} color={C.blue}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
                        <div className={`${CARD} lg:col-span-7`}>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Prediction Breakdown by Branch</p>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={bi.branchRows} margin={{ top: 0, right: 10, left: -20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#94a3b8' }} angle={-30} textAnchor="end" interval={0} />
                                    <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} /><Tooltip content={<Tip />} />
                                    <Bar dataKey="mp" name="Most Probable" stackId="a" fill={C.purple} />
                                    <Bar dataKey="bf" name="Best Fit" stackId="a" fill={C.green} />
                                    <Bar dataKey="gf" name="Good Fit" stackId="a" fill={C.blue} />
                                    <Bar dataKey="st" name="Stretch" stackId="a" fill={C.amber} radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className={`${CARD} lg:col-span-5`}>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Branch Performance Table</p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-[11px]">
                                    <thead><tr className="border-b border-slate-100">
                                        {['Branch', 'Count', 'Avg Fees', 'Avg Pkg', 'Plc%'].map(h => <th key={h} className="text-left py-1.5 px-2 text-slate-500 font-bold">{h}</th>)}
                                    </tr></thead>
                                    <tbody>{bi.branchRows.map((r, i) => (
                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60">
                                            <td className="py-1.5 px-2 font-medium text-slate-700 truncate max-w-[100px]">{r.name}</td>
                                            <td className="py-1.5 px-2 font-bold text-slate-800">{r.total}</td>
                                            <td className="py-1.5 px-2 text-slate-600">{r.avgFees > 0 ? `₹${r.avgFees}L` : '—'}</td>
                                            <td className="py-1.5 px-2 text-slate-600">{r.avgPkg > 0 ? `${r.avgPkg}L` : '—'}</td>
                                            <td className="py-1.5 px-2"><span className={`font-bold ${Number(r.avgPlc) >= 80 ? 'text-emerald-600' : Number(r.avgPlc) >= 60 ? 'text-amber-600' : 'text-slate-400'}`}>{r.avgPlc > 0 ? `${r.avgPlc}%` : '—'}</span></td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* ═══ SECTION 4: FINANCIAL INTELLIGENCE ═══ */}
                <Section title="Financial Intelligence" icon={DollarSign} color={C.cyan}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                        <div className={CARD}>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Fee Range Distribution</p>
                            <ResponsiveContainer width="100%" height={160}>
                                <BarChart data={bi.feeBuckets} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f8fafc" />
                                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8' }} /><YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="count" name="Colleges" radius={[4, 4, 0, 0]}>{bi.feeBuckets.map((_, i) => <Cell key={i} fill={[C.green, C.cyan, C.blue, C.purple, C.amber, C.red][i]} />)}</Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className={CARD}>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Package Distribution (LPA)</p>
                            <ResponsiveContainer width="100%" height={160}>
                                <AreaChart data={bi.pkgBuckets} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                    <defs><linearGradient id="pkgG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.purple} stopOpacity={0.3} /><stop offset="95%" stopColor={C.purple} stopOpacity={0} /></linearGradient></defs>
                                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f8fafc" />
                                    <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#94a3b8' }} /><YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                                    <Tooltip content={<Tip />} />
                                    <Area type="monotone" dataKey="n" name="Colleges" stroke={C.purple} fill="url(#pkgG)" strokeWidth={2} dot={{ r: 3, fill: C.purple }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className={CARD}>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">ROI Scatter (Fees vs Package)</p>
                            <ResponsiveContainer width="100%" height={160}>
                                <ScatterChart margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" />
                                    <XAxis type="number" dataKey="x" tick={{ fontSize: 8, fill: '#94a3b8' }} name="Fees(L)" />
                                    <YAxis type="number" dataKey="y" tick={{ fontSize: 8, fill: '#94a3b8' }} name="Pkg(L)" />
                                    <ZAxis type="number" dataKey="z" range={[20, 150]} />
                                    <Tooltip content={<Tip />} />
                                    <Scatter data={bi.scatter} fill={C.blue}>{bi.scatter.map((e, i) => <Cell key={i} fill={fitColor(e.fit)} fillOpacity={0.7} />)}</Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Section>

                {/* ═══ SECTION 5: PLACEMENT INTELLIGENCE ═══ */}
                <Section title="Placement Intelligence" icon={Activity} color={C.pink}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <div className={CARD}>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Placement Rate Distribution</p>
                            <ResponsiveContainer width="100%" height={170}>
                                <BarChart data={bi.plcBuckets} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f8fafc" />
                                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} /><YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <Tooltip content={<Tip />} />
                                    <Bar dataKey="n" name="Colleges" radius={[4, 4, 0, 0]}>{bi.plcBuckets.map((_, i) => <Cell key={i} fill={[C.red, C.amber, C.blue, C.green, C.purple][i]} />)}</Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className={CARD}>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Avg Metrics by ML Category</p>
                            <ResponsiveContainer width="100%" height={170}>
                                <AreaChart data={bi.catTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="cG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.blue} stopOpacity={0.25} /><stop offset="95%" stopColor={C.blue} stopOpacity={0} /></linearGradient>
                                        <linearGradient id="pG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.green} stopOpacity={0.25} /><stop offset="95%" stopColor={C.green} stopOpacity={0} /></linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f8fafc" />
                                    <XAxis dataKey="cat" tick={{ fontSize: 9, fill: '#94a3b8' }} /><YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                                    <Tooltip content={<Tip />} />
                                    <Area type="monotone" dataKey="chance" name="Chance %" stroke={C.blue} fill="url(#cG)" strokeWidth={2} dot={{ r: 3 }} />
                                    <Area type="monotone" dataKey="plc" name="Placement %" stroke={C.green} fill="url(#pG)" strokeWidth={2} dot={{ r: 3 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Section>

                {/* ═══ SECTION 6: GEOGRAPHIC INTELLIGENCE ═══ */}
                <Section title="Geographic Intelligence" icon={MapPin} color={C.blue}>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
                        <div className={`${CARD} lg:col-span-5`}>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Top Cities</p>
                            <div className="space-y-2">{bi.cityRows.slice(0, 8).map((r, i) => (
                                <div key={r.city}>
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-[11px] text-slate-700 font-medium truncate max-w-[100px]">{r.city}</span>
                                        <span className="text-[11px] font-black text-slate-800">{r.count}</span>
                                    </div>
                                    <ProgressBar pct={(r.count / (bi.cityRows[0]?.count || 1)) * 100} color={[C.purple, C.blue, C.green, C.cyan, C.pink, C.amber, C.red, C.slate][i % 8]} />
                                </div>
                            ))}</div>
                        </div>
                        <div className={`${CARD} lg:col-span-4`}>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Top Districts</p>
                            <div className="space-y-2">{bi.distRows.slice(0, 8).map((r, i) => (
                                <div key={r.district}>
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-[11px] text-slate-700 font-medium truncate max-w-[100px]">{r.district}</span>
                                        <span className="text-[11px] font-black text-slate-800">{r.n}</span>
                                    </div>
                                    <ProgressBar pct={(r.n / (bi.distRows[0]?.n || 1)) * 100} color={[C.cyan, C.green, C.blue, C.purple, C.pink, C.amber, C.red, C.slate][i % 8]} />
                                </div>
                            ))}</div>
                        </div>
                        <div className={`${CARD} lg:col-span-3`}>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-3">Institution Breakdown</p>
                            <div className="space-y-4">
                                <div><p className="text-[10px] text-slate-500 mb-1">Autonomous vs Affiliated</p>
                                    <div className="flex gap-2"><div className="flex-1 bg-indigo-50 rounded-lg p-2.5 text-center"><div className="text-lg font-black text-indigo-700">{bi.autonomous}</div><div className="text-[9px] text-slate-500">Autonomous</div></div>
                                        <div className="flex-1 bg-slate-50 rounded-lg p-2.5 text-center"><div className="text-lg font-black text-slate-700">{bi.affiliated}</div><div className="text-[9px] text-slate-500">Affiliated</div></div></div>
                                </div>
                                <div><p className="text-[10px] text-slate-500 mb-1">Hostel Available</p>
                                    <div className="flex items-center gap-2"><div className="text-lg font-black text-emerald-700">{bi.hostelYes}</div><span className="text-[10px] text-slate-400">of {bi.total} colleges</span></div>
                                    <ProgressBar pct={(bi.hostelYes / bi.total) * 100} color={C.green} />
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* ═══ SECTION 7: TOP 10 ML PICKS ═══ */}
                <Section title="Top 10 ML Picks" icon={Star} color={C.amber}>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px]">
                                <thead className="bg-slate-50"><tr>
                                    {['#', 'College', 'Branch', 'City', 'Chance', 'Fees/yr', 'Pkg', 'Plc%', 'Fit'].map(h => (
                                        <th key={h} className="text-left py-2 px-3 text-slate-500 font-bold uppercase text-[10px] whitespace-nowrap">{h}</th>
                                    ))}
                                </tr></thead>
                                <tbody>{bi.top10.map((c, i) => (
                                    <tr key={i} className="border-b border-slate-50 hover:bg-indigo-50/30 transition-colors">
                                        <td className="py-2 px-3 font-bold text-slate-400">{i + 1}</td>
                                        <td className="py-2 px-3 font-semibold text-slate-800 max-w-[180px] truncate">{c.college_name}</td>
                                        <td className="py-2 px-3 text-slate-600">{c.branch}</td>
                                        <td className="py-2 px-3 text-slate-500">{c.city}</td>
                                        <td className="py-2 px-3"><span className="font-bold px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: fitColor(c.is_most_probable ? 'Most Probable' : c.fit || '') + '22', color: fitColor(c.is_most_probable ? 'Most Probable' : c.fit || '') }}>{c.admission_chance_percentage}</span></td>
                                        <td className="py-2 px-3 text-slate-600">{c.fees > 0 ? `₹${(c.fees / 100000).toFixed(1)}L` : '—'}</td>
                                        <td className="py-2 px-3 text-slate-600">{c.average_package_lpa > 0 ? `${c.average_package_lpa}L` : '—'}</td>
                                        <td className="py-2 px-3"><span className={`font-bold ${c.placement_rate >= 85 ? 'text-emerald-600' : c.placement_rate >= 60 ? 'text-amber-600' : 'text-slate-400'}`}>{c.placement_rate || '—'}%</span></td>
                                        <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ backgroundColor: fitColor(c.is_most_probable ? 'Most Probable' : c.fit || '') + '22', color: fitColor(c.is_most_probable ? 'Most Probable' : c.fit || '') }}>{c.is_most_probable ? 'Most Probable' : c.fit}</span></td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    </div>
                </Section>

                {/* ═══ SECTION 8: HIDDEN GEMS ═══ */}
                {bi.gems.length > 0 && (
                    <Section title="Hidden Gems — High ROI Picks" icon={Award} color={C.green}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {bi.gems.map((c, i) => (
                                <div key={i} className={CARD}>
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-xs font-bold text-slate-800 line-clamp-1 mr-2">{c.college_name}</h3>
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 whitespace-nowrap">High ROI</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mb-2"><MapPin className="w-3 h-3" />{c.city} · {c.branch}</p>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-emerald-50 rounded-lg p-1.5"><div className="text-sm font-black text-emerald-700">{c.placement_rate}%</div><div className="text-[8px] text-slate-500">Placement</div></div>
                                        <div className="bg-blue-50 rounded-lg p-1.5"><div className="text-sm font-black text-blue-700">₹{(c.fees / 100000).toFixed(1)}L</div><div className="text-[8px] text-slate-500">Fees/yr</div></div>
                                        <div className="bg-purple-50 rounded-lg p-1.5"><div className="text-sm font-black text-purple-700">{c.admission_chance_percentage}</div><div className="text-[8px] text-slate-500">Chance</div></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* ═══ SECTION 9: STRATEGIC PORTFOLIO ═══ */}
                <Section title="Strategic Portfolio Allocation" icon={Layers} color={C.purple}>
                    <div className={`${CARD} grid grid-cols-1 md:grid-cols-3 gap-4`}>
                        {[
                            { label: 'Safe Picks', count: bi.safe, pct: ((bi.safe / bi.total) * 100).toFixed(0), color: C.green, icon: Shield, desc: 'Most Probable + Best Fit colleges' },
                            { label: 'Moderate', count: bi.moderate, pct: ((bi.moderate / bi.total) * 100).toFixed(0), color: C.blue, icon: Target, desc: 'Good Fit colleges with solid chances' },
                            { label: 'Aspirational', count: bi.ambitious, pct: ((bi.ambitious / bi.total) * 100).toFixed(0), color: C.amber, icon: TrendingUp, desc: 'Stretch colleges worth trying' },
                        ].map(s => (
                            <div key={s.label} className="text-center p-4 rounded-xl" style={{ backgroundColor: s.color + '08' }}>
                                <s.icon className="w-6 h-6 mx-auto mb-2" style={{ color: s.color }} />
                                <div className="text-3xl font-black mb-0.5" style={{ color: s.color }}>{s.count}</div>
                                <div className="text-xs font-bold text-slate-700 mb-0.5">{s.label} ({s.pct}%)</div>
                                <p className="text-[10px] text-slate-400">{s.desc}</p>
                                <div className="mt-2"><ProgressBar pct={Number(s.pct)} color={s.color} /></div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* ═══ SECTION 10: CATEGORY MATRIX ═══ */}
                <Section title="Category Performance Matrix" icon={BarChart2} color={C.slate}>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-[11px]">
                                <thead className="bg-slate-50"><tr>
                                    {['Category', 'Count', 'Share', 'Avg Chance', 'Avg Fees', 'Avg Pkg', 'ROI', 'Signal'].map(h => (
                                        <th key={h} className="text-left py-2 px-3 text-slate-500 font-bold uppercase text-[10px]">{h}</th>
                                    ))}
                                </tr></thead>
                                <tbody>{bi.catTrend.map((r, i) => {
                                    const color = [C.purple, C.green, C.blue, C.amber][i];
                                    const share = ((r.count / bi.total) * 100).toFixed(1);
                                    const roi = r.fees > 0 && r.pkg > 0 ? (r.pkg / r.fees).toFixed(1) : '—';
                                    return (
                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60">
                                            <td className="py-2.5 px-3 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} /><span className="font-semibold text-slate-800">{r.cat}</span></td>
                                            <td className="py-2.5 px-3 font-black text-slate-900">{r.count}</td>
                                            <td className="py-2.5 px-3"><div className="flex items-center gap-1.5"><div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: color }} /></div><span className="text-slate-500">{share}%</span></div></td>
                                            <td className="py-2.5 px-3"><span className="font-bold px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: color + '18', color }}>{r.chance}%</span></td>
                                            <td className="py-2.5 px-3 text-slate-600">{r.fees > 0 ? `₹${r.fees.toFixed(1)}L` : '—'}</td>
                                            <td className="py-2.5 px-3 text-slate-600">{r.pkg > 0 ? `${r.pkg}L` : '—'}</td>
                                            <td className="py-2.5 px-3"><span className={`font-bold ${parseFloat(roi) >= 3 ? 'text-emerald-600' : parseFloat(roi) >= 2 ? 'text-amber-600' : 'text-slate-400'}`}>{roi}{roi !== '—' ? '×' : ''}</span></td>
                                            <td className="py-2.5 px-3"><div className="flex items-center gap-1">{r.chance >= 80 ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : r.chance >= 50 ? <Minus className="w-3 h-3 text-amber-500" /> : <TrendingDown className="w-3 h-3 text-red-400" />}<span className={`text-[10px] font-medium ${r.chance >= 80 ? 'text-emerald-600' : r.chance >= 50 ? 'text-amber-600' : 'text-red-500'}`}>{r.chance >= 80 ? 'Strong' : r.chance >= 50 ? 'Moderate' : 'Low'}</span></div></td>
                                        </tr>
                                    );
                                })}</tbody>
                            </table>
                        </div>
                    </div>
                </Section>

                {/* ═══ SECTION 11: AI ADVISOR SUMMARY ═══ */}
                <Section title="AI Advisor Summary" icon={Brain} color={C.purple}>
                    <div className={`${CARD} space-y-3`}>
                        {[
                            { icon: CheckCircle, color: C.green, text: `You have ${bi.mp + bi.bf} strong matches (${((bi.safe / bi.total) * 100).toFixed(0)}% of predictions) — a solid admission portfolio.` },
                            { icon: GraduationCap, color: C.blue, text: `${bi.branchRows[0]?.name || 'Your top branch'} has the most options (${bi.branchRows[0]?.total || 0} colleges) across all fit categories.` },
                            { icon: MapPin, color: C.cyan, text: `${bi.cityRows[0]?.city || 'Top city'} leads with ${bi.cityRows[0]?.count || 0} predicted matches — consider it your primary hub.` },
                            { icon: DollarSign, color: C.green, text: bi.affordable > 0 ? `${bi.affordable} colleges have fees under ₹1.5L/year — great affordable options available.` : 'Most predicted colleges have fees above ₹1.5L/year.' },
                            { icon: Activity, color: C.pink, text: bi.highPlacement > 0 ? `${bi.highPlacement} colleges have ≥85% placement rate — prioritise these for career outcomes.` : 'Consider looking at placement data more carefully.' },
                            bi.gems.length > 0 ? { icon: Award, color: C.amber, text: `Found ${bi.gems.length} hidden gems — high placement with low fees within your reach.` } : null,
                            { icon: AlertTriangle, color: C.amber, text: `${bi.st} stretch colleges included — apply strategically, don't rely solely on them.` },
                        ].filter(Boolean).map((item, i) => {
                            const I = item!;
                            return (
                                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                                    <I.icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: I.color }} />
                                    <p className="text-xs text-slate-700 leading-relaxed">{I.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </Section>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pb-3">
                    <ArrowUpRight className="w-3 h-3" /> All data from personalised ML predictions · {profile?.exam_type} {new Date().getFullYear()} · {bi.total} colleges analysed
                </div>
            </div>
            <Footer />
        </div>
    );
}
