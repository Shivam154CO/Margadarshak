import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid,
    ScatterChart, Scatter, ZAxis, Radar, RadarChart, 
    PolarGrid, PolarAngleAxis, Cell,
    Treemap, Funnel, FunnelChart, PieChart, Pie, ComposedChart, Line, LabelList,
    RadialBarChart, RadialBar, Legend
} from 'recharts';
import {
    Zap, Target, Building,
    DollarSign, MapPin, 
    Download, Activity, Shield, TrendingUp, Info, Award, Layout, Briefcase, Globe, Layers
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Services & Hooks
import { supabase } from '../lib/supabase';
import { useColleges } from '../context/CollegesContext';
import { fetchUserProfile } from '../services/supabase/users';
import { computeBI } from '../utils/analyticsHelpers';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const C = { 
    purple: '#7c3aed', green: '#10b981', indigo: '#6366f1', amber: '#f59e0b', 
    slate: '#94a3b8', blue: '#3b82f6', emerald: '#059669', cyan: '#06b6d4',
    rose: '#f43f5e', lime: '#84cc16'
};

const Gauge = ({ value, max, color, label }: { value: number; max: number; color: string; label: string }) => {
    const pct = Math.min(100, (value / Math.max(max, 1)) * 100);
    return (
        <div className="flex flex-col items-center py-2 gap-1">
            <span className="text-xl font-black tabular-nums" style={{ color }}>{value}%</span>
            <div className="w-24 h-12 overflow-hidden relative">
                <ResponsiveContainer width="100%" height={48}>
                    <RadialBarChart cx="50%" cy="100%" innerRadius="70%" outerRadius="100%" startAngle={180} endAngle={0}
                        data={[{ value: pct, fill: color }, { name: 'rem', value: 100 - pct, fill: '#f1f5f9' }]}>
                        <RadialBar dataKey="value" cornerRadius={4} />
                    </RadialBarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        </div>
    );
};

const Section = ({ title, icon: Icon, children, color = '#6366f1' }: { title: string; icon: any; children: React.ReactNode; color?: string }) => (
    <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
            <div className={`p-1.5 rounded-lg bg-opacity-10`} style={{ backgroundColor: color }}>
                <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">{title}</h3>
        </div>
        {children}
    </div>
);

const Tip = ({ active, payload }: any) => {
    if (active && payload?.[0]) {
        return (
            <div className="bg-slate-900 text-white p-2 rounded-lg text-[10px] shadow-xl border border-slate-700">
                <p className="font-bold">{payload[0].payload.name || payload[0].payload.city || payload[0].payload.cat || payload[0].payload.district}</p>
                <div className="mt-1 opacity-80">
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
            const { data } = await supabase.from('colleges_2025').select('*').limit(80);
            return data || [];
        },
        enabled: !contextColleges.length
    });

    const activeColleges = contextColleges.length ? contextColleges : (fallbackColleges || []);
    const bi = useMemo(() => computeBI(activeColleges, profile), [activeColleges, profile]);

    const handleDownload = () => {
        if (!bi) return;
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text('Admission Strategy Report', 14, 20);
        doc.setFontSize(12);
        doc.text(`Total Predicted Colleges: ${bi.total}`, 14, 30);
        doc.text(`Average Fees: ₹${bi.avgFeesAll.toFixed(1)}L`, 14, 37);
        doc.text(`Top Potential Package: ₹${bi.avgPkgAll.toFixed(1)}L`, 14, 44);
        
        const tableBody = bi.gems.map(g => [g.college_name, `${g.placement_rate}%`, `₹${((g.fees || 0)/100000).toFixed(1)}L`]);
        (doc as any).autoTable({
            head: [['College Name', 'Placement', 'Fees']],
            body: tableBody,
            startY: 55,
        });
        doc.save('IKIGAI_Strategic_Report.pdf');
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;
    if (!bi) return <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50"><Info className="w-12 h-12 text-slate-300 mb-4" /><p className="text-slate-500 font-bold">Waiting for Admission Predictions...</p><button onClick={() => navigate('/dse-form')} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold">Start Prediction</button></div>;

    const kpis = [
        { label: 'Predicted College Count', value: bi.total, icon: Activity, trend: 'Pool Size', color: C.indigo },
        { label: 'Avg Study Fees', value: `₹${bi.avgFeesAll.toFixed(1)}L`, icon: DollarSign, trend: '+2.4%', color: C.rose },
        { label: 'Yield Package', value: `₹${bi.avgPkgAll.toFixed(1)}L`, icon: Briefcase, trend: 'Top Tier', color: C.emerald },
        { label: 'Admission Safe', value: bi.safe, icon: Shield, trend: 'Probability', color: C.amber },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-black rounded uppercase">Live Intelligence</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">{bi.total} Institutes Matrix</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">BI Strategic Dashboard</h1>
                    </div>
                    <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xl transition-all active:scale-95 group"
                    >
                        <Download className="w-4 h-4" /> SAVE STRATEGY REPORT
                    </button>
                </header>

                {/* KPI Tier */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {kpis.map((k, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm group hover:ring-2 ring-indigo-500 ring-offset-2 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: `${k.color}15` }}><k.icon className="w-5 h-5" style={{ color: k.color }} /></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{k.trend}</span>
                            </div>
                            <div className="text-3xl font-black text-slate-900 tabular-nums">{k.value}</div>
                            <div className="text-[11px] font-bold text-slate-400 uppercase mt-1 tracking-wider">{k.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* 1. Maharashtra Heatmap Grid (Districts) */}
                    <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden">
                        <Section title="Maharashtra District Heatmap (Intensity Matrix)" icon={Globe} color={C.rose}>
                            <p className="text-[11px] text-slate-500 mb-6 font-bold uppercase">District-wise institute concentration across your pool</p>
                            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
                                {bi.mapGrid.map((d, i) => {
                                    const intensity = d.val === 0 ? 'bg-slate-50 text-slate-200' :
                                                      d.val < 3 ? 'bg-rose-50 text-rose-300' :
                                                      d.val < 10 ? 'bg-rose-200 text-rose-600' :
                                                      d.val < 25 ? 'bg-rose-500 text-white' : 'bg-rose-800 text-white';
                                    return (
                                        <div key={i} className={`h-16 rounded-lg flex flex-col items-center justify-center p-1.5 cursor-help transition-all hover:scale-105 active:scale-95 ${intensity}`}>
                                            <span className="text-[11px] font-black uppercase leading-none">{d.id.substring(0, 3)}</span>
                                            <span className="text-[10px] font-bold mt-1">{d.val}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </Section>
                    </div>

                    {/* 2. Original Chance Gauges */}
                    <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <Section title="Strategic Pool Health (Original Gauges)" icon={Activity} color={C.indigo}>
                            <div className="grid grid-cols-2 md:grid-cols-4 items-center">
                                <Gauge label="Admission Safety" value={Math.round((bi.safe / bi.total) * 100)} max={100} color={C.green} />
                                <Gauge label="Portfolio Yield" value={Math.round((bi.avgPkgAll / 12) * 100)} max={100} color={C.blue} />
                                <Gauge label="Choice Reliability" value={85} max={100} color={C.purple} />
                                <Gauge label="Career Velocity" value={92} max={100} color={C.rose} />
                            </div>
                        </Section>
                    </div>

                    {/* 3. Funnel & Univ Split */}
                    <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <Section title="Portfolio Strategic Funnel" icon={Zap} color={C.amber}>
                            <div className="h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <FunnelChart>
                                        <Tooltip />
                                        <Funnel data={[
                                            { value: bi.total, name: 'Total', fill: '#f8fafc' },
                                            { value: bi.safe + bi.moderate, name: 'Qualified', fill: '#e2e8f0' },
                                            { value: bi.safe, name: 'Probable', fill: C.green },
                                            { value: bi.mp, name: 'Goal', fill: C.purple },
                                        ]} dataKey="value">
                                            <LabelList position="right" fill="#64748b" stroke="none" dataKey="name" />
                                        </Funnel>
                                    </FunnelChart>
                                </ResponsiveContainer>
                            </div>
                        </Section>
                    </div>
                    <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <Section title="University Ecosystem Split" icon={Building} color={C.cyan}>
                            <div className="h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={bi.univData} innerRadius={60} outerRadius={80} dataKey="value">
                                            {bi.univData.map((_, i) => <Cell key={i} fill={[C.cyan, C.blue, C.indigo, C.purple, C.rose][i % 5]} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Section>
                    </div>

                    {/* 4. ROI Value Cloud (Scatter) */}
                    <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <Section title="Value Efficiency Frontier" icon={Target} color={C.emerald}>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis type="number" dataKey="x" name="Fees" unit="L" tick={{ fontSize: 10, fontWeight: 700 }} />
                                        <YAxis type="number" dataKey="y" name="Salary" unit="L" tick={{ fontSize: 10, fontWeight: 700 }} />
                                        <ZAxis type="number" dataKey="z" range={[50, 400]} />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<Tip />} />
                                        <Scatter data={bi.scatter || []} fill={C.emerald}>
                                            {bi.scatter?.map((e: any, i: number) => <Cell key={i} fill={e.fit === 'Most Probable' ? C.green : C.emerald} />)}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        </Section>
                    </div>

                    {/* 5. Geospatial Progress Hubs */}
                    <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <Section title="Top 15 Geospatial Hubs" icon={MapPin} color={C.blue}>
                            <div className="space-y-3.5 mt-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {bi.cityRows.map((city, i) => (
                                    <div key={i} className="group">
                                        <div className="flex justify-between text-[10px] font-black uppercase mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                                            <span>{city.city}</span>
                                            <span className="text-slate-300">{( (city.count / bi.total) * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full transition-all duration-1000 group-hover:bg-indigo-600" style={{ width: `${(city.count / bi.total) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </div>

                    {/* 6. Branch Matrix & Experience */}
                    <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <Section title="Branch Potential Matrix" icon={Layout} color={C.indigo}>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={bi.branchRows.slice(0, 6)}>
                                        <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 700 }} />
                                        <YAxis yAxisId="left" orientation="left" stroke={C.indigo} />
                                        <YAxis yAxisId="right" orientation="right" stroke={C.emerald} />
                                        <Tooltip />
                                        <Bar yAxisId="left" dataKey="avgPkg" fill={C.indigo} radius={[4, 4, 0, 0]} barSize={30} />
                                        <Line yAxisId="right" type="monotone" dataKey="avgPlc" stroke={C.emerald} strokeWidth={3} dot={{ r: 4 }} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </Section>
                    </div>
                    <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <Section title="Campus Experience Audit" icon={Shield} color={C.purple}>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={bi.amenityStack} layout="vertical">
                                        <XAxis type="number" domain={[0, 100]} hide />
                                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 800 }} />
                                        <Tooltip cursor={false} />
                                        <Bar dataKey="val" fill={C.purple} radius={[0, 10, 10, 0]} barSize={20}>
                                            {bi.amenityStack.map((_, i) => <Cell key={i} fill={[C.purple, C.indigo, C.blue, C.cyan][i % 4]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Section>
                    </div>

                    {/* Regional & Financial */}
                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <Section title="Affordability Tiering" icon={DollarSign} color={C.emerald}>
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={bi.feeBuckets}>
                                            <XAxis dataKey="label" tick={{ fontSize: 9, fontWeight: 700 }} />
                                            <Bar dataKey="count" fill={C.emerald} radius={[4, 4, 0, 0]} />
                                            <Tooltip />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Section>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <Section title="Market Weightage Distribution" icon={Globe} color={C.blue}>
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <Treemap data={bi.distRows.map(d => ({ name: d.district, size: d.count }))} dataKey="size" fill={C.blue} stroke="#fff">
                                            <Tooltip />
                                        </Treemap>
                                    </ResponsiveContainer>
                                </div>
                            </Section>
                        </div>
                    </div>

                    {/* AI ANALYST & HIDDEN GEMS */}
                    <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16" />
                        <Section title="AI Admission Analyst" icon={Activity} color={C.indigo}>
                            <h2 className="text-2xl font-black text-slate-900 mb-4 max-w-md">Strategy Recommendation</h2>
                            <p className="text-slate-500 font-bold leading-relaxed italic border-l-4 border-indigo-600 pl-4 mb-8">"{bi.insight}"</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase text-slate-400">Security Index</span>
                                    </div>
                                    <div className="text-xl font-black text-slate-900">{Math.round((bi.safe / bi.total) * 100)}% Success</div>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Globe className="w-4 h-4 text-blue-500" />
                                        <span className="text-[10px] font-black uppercase text-slate-400">Diversity Hub</span>
                                    </div>
                                    <div className="text-xl font-black text-slate-900">{bi.uniqueCities} Clusters</div>
                                </div>
                            </div>
                        </Section>
                    </div>

                    {/* HIDDEN GEMS */}
                    <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-8 text-white shadow-2xl">
                        <Section title="High-Value Hidden Gems" icon={Award} color="#fff">
                            <p className="text-[10px] text-white text-opacity-40 font-bold uppercase mb-6 tracking-widest leading-loose">Top 5 Picks (Fees &lt; 1.5L + Placement &gt; 80%)</p>
                            <div className="space-y-4">
                                {bi.gems.map((g, i) => (
                                    <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-white hover:bg-opacity-5 p-3 rounded-xl transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-white bg-opacity-10 flex items-center justify-center font-black text-xs text-indigo-400">{i+1}</div>
                                            <div>
                                                <div className="text-xs font-bold text-white line-clamp-1 truncate max-w-[180px]">{g.college_name}</div>
                                                <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{g.placement_rate}% Record</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-black text-white">₹{((g.fees || 0) / 100000).toFixed(1)}L</div>
                                            <div className="text-[8px] font-bold text-white text-opacity-30 uppercase">Fee Tier</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </div>

                </div>
                
                {/* Final Footer Stats */}
                <div className="mt-12 flex flex-wrap justify-center gap-12 border-t border-slate-200 py-12">
                    <div className="text-center">
                        <div className="text-3xl font-black text-slate-900">{bi.total}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Predicted Colleges</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-black text-slate-900">{bi.autonomous}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Autonomous Leads</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-black text-slate-900">{bi.uniqueCities}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">City Eco-Hubs</div>
                    </div>
                </div>

            </main>
            <Footer />
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
}

const Layers = ({ className }: any) => <Activity className={className} />;
