import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
    ScatterChart,
    Scatter,
    ZAxis
} from 'recharts';
import Lottie from 'lottie-react';
import {
    Target,
    ArrowUpRight,
    BarChart3,
    PieChart as PieChartIcon,
    Search,
    Brain,
    Users,
    DollarSign,
    MapPin
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useColleges, type College } from '../context/CollegesContext';
import aiBrainAnimation from '../assets/lottie/illustrations/ai-brain.json';

// --- Interfaces ---
interface UserProfile {
    id: string;
    name: string;
    email: string;
    state: string;
    category: string;
    exam_type: string;
    cet_rank: string;
    cet_score: string;
    diploma_rank: string;
    diploma_score: string;
    preferred_branches: string[];
    university_preference: string;
    address: string;
    receive_updates: boolean;
    profile_complete: boolean;
    created_at: string;
    updated_at: string;
}

// --- Animation Variants ---
const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100 }
    }
};

export default function Analytics() {
    const { colleges, setColleges } = useColleges();
    const [loading, setLoading] = useState(false);
    const activeTab = 'market'; // Placeholder if not using state for now
    // const [activeTab, setActiveTab] = useState<'market' | 'favorites'>('market');

    // --- Fetch Colleges if empty ---
    useEffect(() => {
        if (colleges.length === 0) {
            setLoading(true);
            const fetchColleges = async () => {
                try {
                    const { data, error } = await supabase
                        .from('colleges_2025')
                        .select('*');

                    if (error) {
                        console.error('Error fetching colleges:', error);
                    } else if (data) {
                        setColleges(data as College[]);
                    }
                } catch (err) {
                    console.error('Unexpected error:', err);
                } finally {
                    setLoading(false);
                }
            };
            fetchColleges();
        }
    }, [colleges.length, setColleges]);

    // --- Data Fetching ---
    const { data: profile } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No session");
            const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
            return data as UserProfile;
        }
    });

    const savedColleges = useMemo(() => {
        // const saved = localStorage.getItem('favoriteColleges');
        // return saved ? JSON.parse(saved) : [];
        return []; // Not used in this version yet
    }, []);

    // --- Deep Analysis Logic ---
    const insights = useMemo(() => {
        if (!colleges.length || !profile) return null;

        const userScore = parseFloat(profile.cet_score) || 0;
        const preferredBranches = profile.preferred_branches || [];

        // 1. Market Reachability
        // Categorize ALL colleges based on user score
        let safeCount = 0;
        let moderateCount = 0;
        let ambitiousCount = 0;
        let totalSeatsReach = 0;

        colleges.forEach(c => {
            // Use cutoff_percentile if available, else simplified check
            const cutoff = c.cutoff_percentile || 0;
            if (cutoff === 0) return;

            const diff = userScore - cutoff;
            if (diff >= 5) {
                safeCount++;
                totalSeatsReach += (c.seats || 60);
            } else if (diff >= -2 && diff < 5) {
                moderateCount++;
                totalSeatsReach += (c.seats || 60);
            } else {
                ambitiousCount++;
            }
        });

        // 2. Branch Opportunities (Market Wide)
        // Count colleges offering preferred branches
        const branchAvailability = preferredBranches.map(branch => {
            const collegesWithBranch = colleges.filter(c =>
                (c.branch || '').toLowerCase().includes(branch.toLowerCase()) ||
                (c.branch_name || '').toLowerCase().includes(branch.toLowerCase())
            );

            const reachableInBranch = collegesWithBranch.filter(c => (userScore - (c.cutoff_percentile || 0)) >= -2).length;

            return {
                name: branch,
                total: collegesWithBranch.length,
                reachable: reachableInBranch,
                full: branch
            };
        });

        // 3. ROI Gems (Hidden Gems)
        // High Placement (>85%), Reasonable Fees, and Reachable
        const hiddenGems = colleges
            .filter(c =>
                (c.placement_rate >= 85) &&
                (userScore - (c.cutoff_percentile || 0) >= -5) && // Slightly ambitious or safe
                (c.fees < 150000) // Affordable-ish
            )
            .sort((a, b) => b.placement_rate - a.placement_rate)
            .slice(0, 5);

        // 4. Competition Heatmap Data (Mocked logic for specific cities)
        const cities = ['Pune', 'Mumbai', 'Nagpur', 'Nashik', 'Aurangabad'];
        const cityData = cities.map(city => {
            const cityColleges = colleges.filter(c => c.city === city);
            const avgCutoff = cityColleges.reduce((acc, c) => acc + (c.cutoff_percentile || 0), 0) / (cityColleges.length || 1);
            const opportunities = cityColleges.filter(c => (userScore - (c.cutoff_percentile || 0)) >= 0).length;
            return {
                city,
                avgCutoff: parseFloat(avgCutoff.toFixed(2)),
                opportunities,
                total: cityColleges.length
            };
        });

        // 5. Scatter Data: Fees vs Package (ROI)
        const roiData = colleges
            .filter(c => c.fees > 0 && c.average_package_lpa > 0)
            .map(c => ({
                x: c.fees / 100000, // Fees in Lakhs
                y: c.average_package_lpa, // Package in LPA
                z: c.placement_rate || 50, // Bubble size = placement rate
                name: c.college_name,
                isReachable: (userScore - (c.cutoff_percentile || 0)) >= -2
            }))
            // Filter to keep chart readable - maybe just reachable ones + top tier
            .filter(c => c.isReachable || c.y > 10)
            .slice(0, 50); // Limit points

        return {
            marketReach: [
                { name: 'Safe', value: safeCount, color: '#10b981' },
                { name: 'Moderate', value: moderateCount, color: '#f59e0b' },
                { name: 'Ambitious', value: ambitiousCount, color: '#ef4444' }
            ],
            totalSeatsReach,
            branchAvailability,
            hiddenGems,
            cityData,
            roiData,
            totalColleges: colleges.length
        };
    }, [colleges, profile]);

    if (!colleges.length || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-indigo-600 font-medium animate-pulse">Analyzing Market Data...</p>
                </div>
            </div>
        );
    }

    const cardClass = "bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl rounded-3xl p-6 relative overflow-hidden group hover:shadow-2xl hover:bg-white/90 transition-all duration-300";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex flex-col font-sans">
            <Navbar activeTab='analytics' userProfile={profile} />

            <motion.div
                className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* === Header Section === */}
                <motion.div variants={itemVariants} className="mb-10 flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-6 md:mb-0">
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
                            Market Intelligence
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Deep dive analysis of <span className="font-semibold text-gray-900">{insights?.totalColleges} colleges</span> based on your score of <span className="font-bold text-indigo-600">{profile?.cet_score || 'N/A'}</span>.
                        </p>
                    </div>
                    {/* Tab Switcher - Could be added here later */}
                    <div className="hidden md:block w-32 h-32 opacity-90">
                        <Lottie animationData={aiBrainAnimation} loop={true} />
                    </div>
                </motion.div>

                {insights && (
                    <>
                        {/* === Market Overview Grid === */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            <motion.div variants={itemVariants} className={cardClass}>
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><Target size={20} /></div>
                                    <span className="text-sm font-bold text-gray-500 uppercase">Market Reach</span>
                                </div>
                                <div className="text-3xl font-bold text-gray-800">
                                    {insights.marketReach[0].value + insights.marketReach[1].value}
                                </div>
                                <p className="text-xs text-green-600 mt-1">Colleges within your range</p>
                            </motion.div>

                            <motion.div variants={itemVariants} className={cardClass}>
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Users size={20} /></div>
                                    <span className="text-sm font-bold text-gray-500 uppercase">Seat Availability</span>
                                </div>
                                <div className="text-3xl font-bold text-gray-800">
                                    {(insights.totalSeatsReach / 1000).toFixed(1)}k+
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Total estimated seats</p>
                            </motion.div>

                            <motion.div variants={itemVariants} className={cardClass}>
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><Search size={20} /></div>
                                    <span className="text-sm font-bold text-gray-500 uppercase">Hidden Gems</span>
                                </div>
                                <div className="text-3xl font-bold text-gray-800">
                                    {insights.hiddenGems.length}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">High ROI & Reachable</p>
                            </motion.div>

                            <motion.div variants={itemVariants} className={cardClass}>
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><MapPin size={20} /></div>
                                    <span className="text-sm font-bold text-gray-500 uppercase">Top Hub</span>
                                </div>
                                <div className="text-3xl font-bold text-gray-800">
                                    {insights.cityData.sort((a, b) => b.opportunities - a.opportunities)[0]?.city || 'N/A'}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Most opportunities for you</p>
                            </motion.div>
                        </div>

                        {/* === Deep Dive Charts === */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

                            {/* Reachability Pie Chart */}
                            <motion.div variants={itemVariants} className={`${cardClass} lg:col-span-4`}>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <PieChartIcon className="w-5 h-5 mr-2 text-indigo-500" /> Market Segmentation
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={insights.marketReach}
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {insights.marketReach.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Branch Opportunity Bar Chart */}
                            <motion.div variants={itemVariants} className={`${cardClass} lg:col-span-8`}>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                    <BarChart3 className="w-5 h-5 mr-2 text-purple-500" /> Branch-wise Opportunities
                                </h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={insights.branchAvailability} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                            <YAxis />
                                            <Tooltip
                                                cursor={{ fill: '#f3f4f6' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value: any, name: any) => {
                                                    if (name === 'reachable') return [value, 'Reachable Colleges'];
                                                    if (name === 'total') return [value, 'Total Colleges'];
                                                    return [value, name];
                                                }}
                                            />
                                            <Legend />
                                            <Bar dataKey="total" name="Total Colleges" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="reachable" name="Reachable for You" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        </div>

                        {/* === ROI Scatter Chart === */}
                        <motion.div variants={itemVariants} className={`${cardClass} mb-8`}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                    <DollarSign className="w-5 h-5 mr-2 text-emerald-500" /> ROI Analysis (Fees vs Package)
                                </h3>
                                <div className="text-xs text-gray-500">
                                    Bubble Size = Placement Rate • Blue = Reachable • Grey = Ambitious
                                </div>
                            </div>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis type="number" dataKey="x" name="Fees" unit="L" label={{ value: 'Annual Fees (Lakhs)', position: 'bottom', offset: 0 }} />
                                        <YAxis type="number" dataKey="y" name="Package" unit=" LPA" label={{ value: 'Avg Package (LPA)', angle: -90, position: 'insideLeft' }} />
                                        <ZAxis type="number" dataKey="z" range={[50, 400]} name="Placement Rate" unit="%" />
                                        <Tooltip
                                            cursor={{ strokeDasharray: '3 3' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Scatter name="Colleges" data={insights.roiData} fill="#8884d8">
                                            {insights.roiData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.isReachable ? '#3b82f6' : '#94a3b8'} fillOpacity={0.7} />
                                            ))}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* === Hidden Gems Section === */}
                        <motion.div variants={itemVariants} className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Brain className="w-8 h-8 mr-3 text-pink-500" /> AI Recommended "Hidden Gems"
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {insights.hiddenGems.map((college, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-50 hover:shadow-xl transition-all relative overflow-hidden"
                                        whileHover={{ y: -5 }}
                                    >
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-pink-500/10 to-transparent rounded-bl-3xl"></div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{college.college_name}</h3>
                                        <div className="text-sm text-gray-500 mb-4 flex items-center"><MapPin size={14} className="mr-1" /> {college.city}</div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-green-50 p-2 rounded-lg">
                                                <div className="text-xs text-green-700 font-semibold uppercase">Placement</div>
                                                <div className="text-lg font-bold text-green-800">{college.placement_rate}%</div>
                                            </div>
                                            <div className="bg-blue-50 p-2 rounded-lg">
                                                <div className="text-xs text-blue-700 font-semibold uppercase">Avg Pkg</div>
                                                <div className="text-lg font-bold text-blue-800">₹{college.average_package_lpa}L</div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-sm">
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">Fees: ₹{(college.fees / 100000).toFixed(1)}L</span>
                                            <button className="text-indigo-600 font-semibold hover:text-indigo-800 flex items-center">
                                                View <ArrowUpRight size={16} className="ml-1" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </motion.div>
            <Footer />
        </div>
    );
}
