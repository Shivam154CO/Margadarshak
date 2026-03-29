import { useMemo, useState, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid,
    ScatterChart, Scatter, Cell,
    Treemap, Funnel, FunnelChart, PieChart, Pie, LabelList
} from 'recharts';
import {
    X, MapPin, Building,
    TrendingUp, Info, ArrowRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';

// Services & Hooks
import { supabase } from '@/lib/supabase';
import { useColleges } from '@/context/CollegesContext';
import { fetchUserProfile } from '@/services/supabase/users';
import { computeBI } from '@/utils/analyticsHelpers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ROUTES } from '@/constants/routes';

// UI Constants - CLEAN & SIMPLE (Timeline Style)
const C = {
    indigo: '#4f46e5',
    slate: '#64748b',
    emerald: '#10b981',
    rose: '#f43f5e',
    amber: '#f59e0b',
    blue: '#3b82f6',
    purple: '#7c3aed',
    cyan: '#06b6d4'
};

const Section = memo(({ title, children, border = "border-l-indigo-500" }: { title: string; children: React.ReactNode; border?: string }) => (
    <div className={`bg-white rounded-xl border border-slate-200 border-l-4 ${border} p-6 shadow-sm`}>
        <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
        {children}
    </div>
));

const Metric = memo(({ label, value, sub, border = "border-l-slate-400" }: { label: string; value: string | number; sub?: string; border?: string }) => (
    <div className={`bg-white rounded-xl border border-slate-200 border-l-4 ${border} p-5 shadow-sm`}>
        <div className="text-2xl font-bold text-slate-900 tabular-nums">{value}</div>
        <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{label}</div>
        {sub && <div className="text-[10px] text-slate-400 mt-1">{sub}</div>}
    </div>
));

const Tip = ({ active, payload }: any) => {
    if (active && payload?.[0]) {
        return (
            <div className="bg-white border border-slate-200 p-2 rounded-lg text-[11px] shadow-lg">
                <p className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1">{payload[0].payload.name || payload[0].payload.city || payload[0].payload.cat || payload[0].payload.district}</p>
                <div className="text-slate-500 space-y-0.5">
                    {payload.map((p: any, i: number) => <div key={i}>{p.name || p.dataKey}: {p.value}{p.unit || ''}</div>)}
                </div>
            </div>
        );
    }
    return null;
};

export default function Analytics() {
    const navigate = useNavigate();
    const { colleges: contextColleges } = useColleges();
    const [drill, setDrill] = useState<{ type: string; title: string; data: any[] } | null>(null);

    const { data: profile } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;
            return fetchUserProfile(user.id);
        }
    });

    const { data: fallbackColleges, isLoading } = useQuery({
        queryKey: ['analytics-fallback'],
        queryFn: async () => {
            const { data } = await supabase.from('colleges_2025').select('*').limit(150);
            return data || [];
        },
        enabled: !contextColleges.length,
        staleTime: 1000 * 60 * 60,
    });

    const activeColleges = contextColleges.length ? contextColleges : (fallbackColleges || []);
    const bi = useMemo(() => computeBI(activeColleges, profile), [activeColleges.length, profile]);

    const handleDownload = useCallback(() => {
        if (!bi) return;
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text('Admission Strategic Review', 14, 20);
        const tableBody = bi.gems.map(g => [g.college_name, `${g.placement_rate}%`, `₹${((g.fees || 0) / 100000).toFixed(1)}L`]);
        (doc as any).autoTable({ head: [['College', 'Placement', 'Fees']], body: tableBody, startY: 40 });
        doc.save('IKIGAI_Strategic_Report.pdf');
    }, [bi]);

    if (isLoading && !contextColleges.length) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
    if (!bi || activeColleges.length === 0) return <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50"><Info className="w-12 h-12 text-slate-300 mb-4" /><p className="text-slate-500 font-bold">Waiting for Admission Data...</p><button onClick={() => navigate('/dse-form')} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-sm">Start Prediction</button></div>;

    const openDrill = (type: string, title: string, data: any[]) => {
        setDrill({ type, title, data });
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 antialiased uppercase-headings">
            <Navbar activeTab="analytics" userProfile={profile} />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

                {/* 1. Header (Timeline Style) */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Admission Strategy</h1>
                        <p className="text-sm text-slate-500 mt-1">Deep analytics across {bi.total} predictions and {bi.uniqueCities} city clusters</p>
                    </div>
                    <button onClick={handleDownload} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                        <span>Save Strategy Report</span>
                    </button>
                </div>

                {/* 2. Stats Bar (Simple) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                    <Metric label="Colleges Found" value={bi.total} sub="Total Pool Size" border="border-l-indigo-500" />
                    <Metric label="Admission Safe" value={bi.safe} sub="High Probability" border="border-l-emerald-500" />
                    <Metric label="Avg Study Fees" value={`₹${bi.avgFeesAll.toFixed(1)}L`} sub="Annual Portfolio" border="border-l-rose-500" />
                    <Metric label="Expected Salary" value={`₹${bi.avgPkgAll.toFixed(1)}L`} sub="Average Package" border="border-l-amber-500" />
                </div>

                {/* 3. The Feature Grid (15+ Features) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* F1: Heatmap (Full Names, No Icons) */}
                    <div className="lg:col-span-12">
                        <Section title="Maharashtra District Heatmap" border="border-l-rose-500">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Click on a district to see colleges</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {bi.mapGrid.map((d, i) => {
                                    const intensity = d.val === 0 ? 'bg-slate-50 text-slate-200' : d.val < 5 ? 'bg-indigo-50 text-indigo-400' : d.val < 15 ? 'bg-indigo-100 text-indigo-600' : d.val < 30 ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white';
                                    return (
                                        <button key={i} onClick={() => openDrill('District', d.id, activeColleges.filter(c => c.district?.toLowerCase().includes(d.id.toLowerCase())))}
                                            className={`h-24 rounded-xl flex flex-col items-center justify-center p-4 border border-slate-100 transition-all active:scale-95 ${intensity}`}>
                                            <span className="text-[10px] font-bold uppercase text-center leading-tight mb-1">{d.id}</span>
                                            <span className="text-xl font-bold tabular-nums">{d.val}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </Section>
                    </div>

                    {/* F2: Strategic Success Health */}
                    <div className="lg:col-span-12">
                        <Section title="Admission Health Metrics" border="border-l-emerald-500">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4">
                                {[
                                    { l: "Safety Score", v: bi.safetyScore, c: "text-indigo-600" },
                                    { l: "Placement Index", v: bi.placementIndex, c: "text-emerald-600" },
                                    { l: "Choice Accuracy", v: bi.choiceAccuracy, c: "text-blue-600" },
                                    { l: "Career Growth", v: bi.careerGrowth, c: "text-purple-600" }
                                ].map(s => (
                                    <div key={s.l} className="text-center">
                                        <div className={`text-4xl font-bold mb-1 tabular-nums ${s.c}`}>{s.v}%</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.l}</div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </div>

                    {/* F3: Funnel */}
                    <div className="lg:col-span-6">
                        <Section title="Your Admission Journey" border="border-l-amber-500">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <FunnelChart>
                                        <Funnel 
                                            data={[{ value: bi.total, name: 'Total', fill: '#f8fafc' }, { value: bi.safe + bi.moderate, name: 'Qualified', fill: '#e2e8f0' }, { value: bi.safe, name: 'Probable', fill: '#4f46e5' }]} 
                                            dataKey="value"
                                            onClick={(d) => openDrill('Category', d.name, activeColleges.filter(c => d.name === 'Probable' ? (c.is_most_probable || c.probability_level === "Most Probable") : true))}
                                        >
                                            <LabelList position="right" fill="#64748b" stroke="none" dataKey="name" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }} />
                                        </Funnel>
                                        <Tooltip />
                                    </FunnelChart>
                                </ResponsiveContainer>
                            </div>
                        </Section>
                    </div>

                    {/* F4: University Distribution */}
                    <div className="lg:col-span-6">
                        <Section title="University Ecosystem" border="border-l-cyan-500">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={bi.univData} innerRadius={60} outerRadius={85} dataKey="value" stroke="none" onClick={(d) => openDrill('University', d.name, activeColleges.filter(c => c.university?.includes(d.name)))}>
                                            {bi.univData.map((_, i) => <Cell key={i} fill={[C.indigo, C.purple, C.blue, C.cyan, C.rose][i % 5]} />)}
                                        </Pie>
                                        <Tooltip content={<Tip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Section>
                    </div>

                    {/* F5: Value Cloud (Scatter) */}
                    <div className="lg:col-span-8">
                        <Section title="Fees vs Career Pay" border="border-l-indigo-500">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis type="number" dataKey="x" name="Fees" unit="L" axisLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                        <YAxis type="number" dataKey="y" name="Salary" unit="L" axisLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<Tip />} />
                                        <Scatter data={bi.scatter || []} fill="#4f46e5" onClick={(d) => openDrill('College', d.name, activeColleges.filter(c => c.college_name === d.name))}>
                                            {bi.scatter?.map((e: any, i: number) => <Cell key={i} fill={e.fit === 'Most Probable' ? C.emerald : C.indigo} />)}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        </Section>
                    </div>

                    {/* F6: Top Hubs */}
                    <div className="lg:col-span-4">
                        <Section title="College Cities at a Glance" border="border-l-blue-500">
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {bi.cityRows.map((city, i) => (
                                    <div key={i} onClick={() => openDrill('City', city.city, activeColleges.filter(c => c.city === city.city))} className="group cursor-pointer">
                                        <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase mb-1">
                                            <span>{city.city}</span>
                                            <span>{city.count} Units</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 group-hover:bg-slate-900 transition-all" style={{ width: `${(city.count / bi.total) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </div>

                    {/* F7: Hidden Gems (Strategy Picks) */}
                    <div className="lg:col-span-12">
                        <Section title="Top Picks For You" border="border-l-emerald-600">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                                {bi.gems.slice(0, 5).map((g, i) => (
                                    <div key={i} onClick={() => navigate(ROUTES.COLLEGE_BY_CODE.replace(':code', g.college_code))} className="bg-white border border-slate-200 p-5 rounded-xl hover:border-indigo-500 transition-all cursor-pointer group">
                                        <div className="text-[10px] font-bold text-emerald-600 uppercase mb-3">Goal Choice #{i + 1}</div>
                                        <h4 className="text-sm font-bold text-slate-800 line-clamp-2 h-10 mb-4 group-hover:text-indigo-600 leading-tight uppercase">{g.college_name}</h4>
                                        <div className="flex justify-between border-t border-slate-100 pt-3">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Fees: ₹{((g.fees || 0) / 100000).toFixed(1)}L</span>
                                            <span className="text-[10px] font-bold text-emerald-600 uppercase">{g.placement_rate}% PLC</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </div>

                    {/* F8: Regional Treemap */}
                    <div className="lg:col-span-6">
                        <Section title="Regional Distribution" border="border-l-purple-500">
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <Treemap data={bi.distRows.map(d => ({ name: d.district, size: d.count }))} dataKey="size" fill="#4f46e5" stroke="#fff" onClick={(d) => openDrill('Region', d.name, activeColleges.filter(c => c.district?.includes(d.name)))}>
                                        <Tooltip content={<Tip />} />
                                    </Treemap>
                                </ResponsiveContainer>
                            </div>
                        </Section>
                    </div>

                    {/* F9: Branch Analysis */}
                    <div className="lg:col-span-6">
                        <Section title="Branch Performance Matrix" border="border-l-rose-500">
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={bi.branchRows.slice(0, 6)} onClick={(d) => {
                                        if (d && typeof d.activeLabel === 'string') {
                                            const label = d.activeLabel;
                                            openDrill('Branch', label, activeColleges.filter(c => c.branch?.includes(label) || c.branch_name?.includes(label)));
                                        }
                                    }}>
                                        <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700 }} axisLine={false} />
                                        <YAxis tick={{ fontSize: 9, fontWeight: 700 }} axisLine={false} />
                                        <Tooltip />
                                        <Bar dataKey="avgPkg" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Section>
                    </div>

                    {/* F10: AI Roadmap Review */}
                    <div className="lg:col-span-12">
                        <Section title="AI Counselor Review" border="border-l-slate-900">
                            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-sm font-medium text-slate-700 leading-relaxed italic border-l-4 border-indigo-500 pl-4">"{bi.insight}"</p>
                            </div>
                        </Section>
                    </div>

                </div>

                {/* DRILL-DOWN MODAL (Timeline Style) */}
                <AnimatePresence>
                    {drill && (
                        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white w-full max-w-4xl h-[90vh] sm:h-[80vh] rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden border border-slate-200">

                                <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{drill.title}</h2>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{drill.data.length} MATCHES FOUND</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setDrill(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
                                </div>

                                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-3 bg-slate-50 select-none cursor-default">
                                    {drill.data.slice(0, 100).map((c, i) => (
                                        <div key={i} className="bg-white border border-slate-200 p-5 rounded-xl flex items-center justify-between shadow-sm group hover:border-indigo-400 transition-all">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${c.is_most_probable ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {c.probability_level || (c.is_most_probable ? 'Most Probable' : 'Safe Match')}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{c.college_code}</span>
                                                </div>
                                                <h3 className="text-sm font-bold text-slate-800 leading-tight uppercase group-hover:text-indigo-600 transition-colors truncate">{c.college_name}</h3>
                                                <div className="flex gap-4 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.city}</span>
                                                    <span className="flex items-center gap-1"><Building className="w-3 h-3" /> {c.university || 'Affiliated'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 flex-shrink-0">
                                                <div className="text-right">
                                                    <div className="text-base font-bold text-slate-900 tabular-nums">₹{((c.fees || 0) / 100000).toFixed(1)}L</div>
                                                    <div className="text-[9px] font-bold text-slate-400 uppercase">Avg Fees</div>
                                                </div>
                                                <button onClick={() => navigate(ROUTES.COLLEGE_BY_CODE.replace(':code', c.college_code))} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"><ArrowRight className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                    {drill.data.length > 100 && (
                                        <div className="py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Showing top 100 matches</div>
                                    )}
                                </div>

                                <div className="p-4 border-t border-slate-200 bg-white text-center flex-shrink-0">
                                    <button onClick={() => setDrill(null)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest">Back to Admission Strategy</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Final Footer Stats */}
                <div className="mt-16 flex flex-wrap justify-center gap-16 border-t border-slate-200 py-16">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-slate-900 tabular-nums">{bi.total}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Predicted Matches</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-slate-900 tabular-nums">{bi.autonomous}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Autonomous Hubs</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-slate-900 tabular-nums">{bi.uniqueCities}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Geo Clusters</div>
                    </div>
                </div>

            </main>
            <Footer />
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                
                @media (max-width: 640px) {
                    .custom-scrollbar::-webkit-scrollbar { width: 0px; }
                }
            `}} />
        </div>
    );
}
