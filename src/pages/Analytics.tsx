import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, RadialBarChart, RadialBar, CartesianGrid,
} from 'recharts';
import {
    TrendingUp, Zap, Target, Building,
    DollarSign, MapPin, Activity, Shield, GraduationCap
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Services & Hooks
import { supabase } from '../lib/supabase';
import { useColleges } from '../context/CollegesContext';
import { fetchUserProfile } from '../services/supabase/users';
import { predictAdmission } from '../services/ml-api/predictions';

// Utils & Constants
import { computeBI } from '../utils/analyticsHelpers';
import { ROUTES } from '../constants/routes';
import { ML_API_FALLBACK_URL } from '../constants/app';
import type { College } from '../types/college';

// Shared Components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ML_API_FALLBACK = ML_API_FALLBACK_URL;

const C: Record<string, string> = { 
    purple: '#7c3aed', 
    green: '#059669', 
    blue: '#2563eb', 
    amber: '#d97706', 
    red: '#dc2626', 
    cyan: '#0891b2', 
    pink: '#db2777', 
    slate: '#475569' 
};

const Tip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-900 text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-xl border border-slate-700">
            {payload.map((p: any, i: number) => (
                <div key={i}>{p.name}: <strong>{typeof p.value === 'number' && p.value % 1 !== 0 ? p.value.toFixed(1) : p.value}</strong></div>
            ))}
        </div>
    );
};

const Gauge = ({ value, max, color, label }: { value: number; max: number; color: string; label: string }) => {
    const pct = Math.min(100, (value / Math.max(max, 1)) * 100);
    return (
        <div className="flex flex-col items-center py-3 gap-2">
            <span className="text-2xl font-black" style={{ color }}>{value}</span>
            <div className="w-32 h-16 overflow-hidden">
                <ResponsiveContainer width="100%" height={64}>
                    <RadialBarChart cx="50%" cy="100%" innerRadius="70%" outerRadius="100%" startAngle={180} endAngle={0}
                        data={[{ value: pct, fill: color }, { name: 'rem', value: 100 - pct, fill: '#e2e8f0' }]}>
                        <RadialBar dataKey="value" cornerRadius={4} />
                    </RadialBarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs font-semibold text-slate-500">{label}</p>
        </div>
    );
};

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
    const navigate = useNavigate();
    const { colleges } = useColleges();
    
    const { data: profile } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate(ROUTES.LOGIN);
                throw new Error('No session');
            }
            return fetchUserProfile(session.user.id);
        },
    });

    const predictionsQuery = useQuery({
        queryKey: ['predictions', profile?.id],
        queryFn: async () => {
            try {
                if (!profile) return [];
                const requestData = {
                    score: profile.exam_type === "CET" ? parseFloat(profile.cet_score || "0") : parseFloat(profile.diploma_score || "0"),
                    rank: profile.exam_type === "CET" ? parseFloat(profile.cet_rank || "0") : parseFloat(profile.diploma_rank || "0"),
                    category: profile.category as any,
                    branches: profile.preferred_branches,
                    limit: 100,
                };
                const data = await predictAdmission(requestData);
                return data.colleges || [];
            } catch (err) {
                const { data } = await supabase.from('colleges_2025').select('*').limit(50);
                return (data || []) as College[];
            }
        },
        enabled: !!profile && colleges.length === 0,
    });

    const activeColleges = (colleges.length > 0 ? colleges : (predictionsQuery.data || [])) as College[];

    const bi = useMemo(() => computeBI(activeColleges, profile), [activeColleges, profile]);

    const kpis = useMemo(() => {
        if (!bi) return [];
        return [
            { label: 'Market Reach', value: `${bi.total}`, trend: '+12%', trendUp: true, icon: Building },
            { label: 'Avg Probable', value: `${bi.mp}`, trend: 'Stable', trendUp: false, icon: Zap },
            { label: 'Avg Pkg', value: `${bi.avgPkgAll}L`, trend: '+4.2L', trendUp: true, icon: GraduationCap },
            { label: 'Best ROI', value: `${bi.avgFeesAll}L`, trend: 'Median', trendUp: false, icon: DollarSign },
        ];
    }, [bi]);

    if (!profile || predictionsQuery.isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Zap className="w-10 h-10 animate-pulse text-indigo-600 mx-auto mb-4" />
                    <p className="text-slate-600 font-bold tracking-tight">AI ANALYTICS ENGINE BOOTING...</p>
                </div>
            </div>
        );
    }

    if (!bi) return null;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans leading-relaxed">
            <Navbar activeTab="analytics" userProfile={profile} />

            <main className="max-w-[1400px] mx-auto px-4 py-8">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-4 h-4 text-indigo-600" />
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Ikigai Command Center</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Advanced Analytics</h1>
                        <p className="text-slate-500 font-medium text-sm mt-1">Real-time admission intelligence & market trends</p>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex flex-col items-end px-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Analysis Pool</span>
                            <span className="text-sm font-black text-slate-800">{activeColleges.length} Colleges</span>
                        </div>
                        <div className="h-8 w-px bg-slate-200" />
                        <button 
                            onClick={() => window.print()}
                            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all shadow-lg flex items-center gap-2"
                        >
                            <Activity className="w-3.5 h-3.5" />
                            EXPORT REPORT
                        </button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {kpis.map((k, i) => (
                        <div key={i} className={`${CARD} flex flex-col justify-between group hover:border-indigo-400 transition-all`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                                    <k.icon className="w-4 h-4 text-slate-600 group-hover:text-indigo-600" />
                                </div>
                                <div className={`flex items-center gap-0.5 text-xs font-bold ${k.trendUp ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {k.trendUp && <TrendingUp className="w-3.5 h-3.5" />}
                                    {k.trend}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{k.label}</h3>
                                <div className="text-2xl font-black text-slate-900">{k.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Primary Intelligence Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    
                    {/* Admission Strength */}
                    <div className={`${CARD} lg:col-span-1`}>
                        <Section title="Admission Strength" icon={Target} color={C.purple}>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <Gauge value={bi.mp} max={activeColleges.length} color={C.purple} label="Most Probable" />
                                <Gauge value={bi.bf} max={activeColleges.length} color={C.green} label="Best Fit" />
                            </div>
                            <div className="space-y-4 mt-4">
                                {bi.donut.map((f, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-[11px] font-black uppercase mb-1.5">
                                            <span>{f.name}</span>
                                            <span style={{ color: f.fill }}>{f.value} Colleges</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                            <div className="h-full" style={{ width: `${(f.value / activeColleges.length) * 100}%`, backgroundColor: f.fill }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </div>

                    {/* Salary & ROI Trends */}
                    <div className={`${CARD} lg:col-span-2 flex flex-col`}>
                        <Section title="Market Value & ROI Analytics" icon={DollarSign} color={C.green}>
                            <div className="flex-grow min-h-[300px] mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={bi.catTrend}>
                                        <defs>
                                            <linearGradient id="colorPkg" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={C.green} stopOpacity={0.3} /><stop offset="95%" stopColor={C.green} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="cat" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} />
                                        <Tooltip content={<Tip />} />
                                        <Area type="monotone" dataKey="pkg" stroke={C.green} strokeWidth={3} fillOpacity={1} fill="url(#colorPkg)" name="Avg Package (LPA)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-4 gap-4 border-t border-slate-100 pt-5 mt-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Fees</p>
                                    <p className="text-lg font-black text-slate-800">₹{bi.avgFeesAll.toFixed(1)}L</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Yield</p>
                                    <p className="text-lg font-black text-emerald-600">₹{bi.avgPkgAll.toFixed(1)}L</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">High Yield</p>
                                    <p className="text-lg font-black text-indigo-600">{bi.avgPlcAll.toFixed(0)}%</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Gems</p>
                                    <p className="text-lg font-black text-amber-600">{bi.gems.length}</p>
                                </div>
                            </div>
                        </Section>
                    </div>
                </div>

                {/* Secondary Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Branch Density */}
                    <div className={CARD}>
                        <Section title="Domain Demand Analytics" icon={Layers} color={C.blue}>
                            <div className="h-[280px] mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={bi.branchRows} layout="vertical" margin={{ left: 40 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#475569' }} width={80} />
                                        <Tooltip content={<Tip />} />
                                        <Bar dataKey="total" fill={C.blue} radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Section>
                    </div>

                    {/* Regional Mapping */}
                    <div className={CARD}>
                        <Section title="Geospatial Hub Analysis" icon={MapPin} color={C.cyan}>
                            <div className="space-y-5 mt-6">
                                {bi.cityRows.slice(0, 5).map((city, i) => (
                                    <div key={i} className="group">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                                                <span className="text-xs font-black text-slate-700 uppercase">{city.city}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase px-2 py-0.5 rounded bg-slate-50 border border-slate-100 group-hover:bg-cyan-50 group-hover:border-cyan-100 transition-colors">
                                                {city.count} Research Centers
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(city.count / activeColleges.length) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

const Layers = (props: any) => (
    <Activity {...props} />
);
