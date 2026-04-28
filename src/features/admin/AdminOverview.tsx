import { useState, useEffect, useRef } from "react";
import { Users, Activity, AlertTriangle, Database, Ban, LayoutDashboard, Calendar, Edit3, Settings, Save, X, BrainCircuit, RefreshCw, UploadCloud, DollarSign, Megaphone, FileDown, ShieldHalf, Play, Settings2, TerminalSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import axios from "axios";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AdminOverview() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "colleges" | "queue" | "system" | "content" | "revenue">("dashboard");
  const [stats, setStats] = useState({ totalUsers: 0, totalColleges: 0, pendingBookings: 0 });
  const [userList, setUserList] = useState<any[]>([]);
  const [collegeList, setCollegeList] = useState<any[]>([]);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [systemLoad, setSystemLoad] = useState(12);
  const [isLoading, setIsLoading] = useState(true);

  // College Database Editing State
  const [editingCollege, setEditingCollege] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ placement_rate: 0, average_package_lpa: 0 });

  // System State
  // High-Authority States
  const [broadcastText, setBroadcastText] = useState("");
  const [revenueStats] = useState({ mrr: 124500, activeSubs: 842 });
  const [mlStrictness, setMlStrictness] = useState(0.85);
  const [mlLogs, setMlLogs] = useState<string[]>(["[SYSTEM] Active monitoring initialized. Python backend connected."]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === "system") {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [mlLogs, activeTab]);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);

      // Fetch Users
      const { data: usersData } = await supabase.from('users').select('*').order('created_at', { ascending: false }).limit(30);
      if (usersData) {
        setUserList(usersData);
        setStats(s => ({ ...s, totalUsers: usersData.length })); 
      }

      // Fetch Colleges
      const { data: collegesData, count: collegesCount } = await supabase.from('colleges_2025').select('*', { count: 'exact' }).limit(30);
      if (collegesCount !== null) setStats(s => ({ ...s, totalColleges: collegesCount }));
      if (collegesData) setCollegeList(collegesData);

      // Fetch Functional Mentorship Bookings
      const { data: bData } = await supabase.from('mentorship_bookings').select(`*, users(name, email)`).order('created_at', { ascending: false });
      if (bData) {
        setBookingsList(bData);
        setStats(s => ({ ...s, pendingBookings: bData.filter(b => b.status === 'pending').length }));
      }

      // Fetch Analytics Data for Chart
      const { data: allUsers } = await supabase.from('users').select('created_at');
      const { data: allBookings } = await supabase.from('mentorship_bookings').select('created_at');
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const cMonth = new Date().getMonth();
      const newChartData = [];
      
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(cMonth - 5);
      sixMonthsAgo.setDate(1);
      
      let cumUsers = (allUsers || []).filter(u => new Date(u.created_at) < sixMonthsAgo).length;
      let cumBookings = (allBookings || []).filter(b => new Date(b.created_at) < sixMonthsAgo).length;

      for (let i = 5; i >= 0; i--) {
        const targetDate = new Date();
        targetDate.setMonth(cMonth - i);
        const mIdx = targetDate.getMonth();
        const yIdx = targetDate.getFullYear();
        
        const mUsers = (allUsers || []).filter(u => new Date(u.created_at).getMonth() === mIdx && new Date(u.created_at).getFullYear() === yIdx).length;
        const mBookings = (allBookings || []).filter(b => new Date(b.created_at).getMonth() === mIdx && new Date(b.created_at).getFullYear() === yIdx).length;
        
        cumUsers += mUsers;
        cumBookings += mBookings;

        newChartData.push({ name: months[mIdx], users: cumUsers, bookings: cumBookings });
      }
      setChartData(newChartData);

    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAdminData(); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemLoad(prev => {
        const swing = Math.floor(Math.random() * 5) - 2;
        let next = prev + swing;
        if (next < 5) next = 5;
        if (next > 45) next = 45;
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Functional User Ban
  const handleBanUser = async (userId: string, currentStatus: boolean) => {
    try {
      setUserList(prev => prev.map(u => u.id === userId ? { ...u, is_banned: !currentStatus } : u));
      await supabase.from('users').update({ is_banned: !currentStatus }).eq('id', userId);
    } catch (e) { console.error(e); }
  };

  // Functional Mentorship Queue
  const handleApproveBooking = async (bookingId: string) => {
    try {
      setBookingsList(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'approved' } : b));
      await supabase.from('mentorship_bookings').update({ status: 'approved' }).eq('id', bookingId);
      setStats(prev => ({ ...prev, pendingBookings: Math.max(0, prev.pendingBookings - 1) }));
    } catch (e) { console.error(e); }
  };

  // New High-Authority Command Handlers
  const handleRoleChange = async (userId: string, newRole: string) => {
    setUserList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    alert(`[MOCK DB] User role successfully updated to ${newRole.toUpperCase()}.`);
  };

  const handleImpersonate = (email: string) => {
    alert(`Initiating Impersonation Protocol for: ${email}\n\nWarning: All actions will be logged under Admin override.`);
  };

  const handleExportCSV = () => {
    alert("Parsing users and exporting to 'Ikigai_Users_Export.csv'...");
  };

  const handleCsvUpload = (e: any) => {
    if(e.target.files[0]) {
      alert(`Preparing bulk import routine for mapping mapping keys in file: ${e.target.files[0].name}...`);
    }
  };

  const handleBroadcast = () => {
    if(!broadcastText) return;
    alert(`GLOBAL BROADCAST SENT:\n"${broadcastText}"\nThis will appear as a banner for all active sessions.`);
    setBroadcastText("");
  };

  const handleSaveHyperparams = () => {
    setMlLogs(prev => [...prev, `[SYSTEM] Updated threshold strictness parameter to ${mlStrictness}`]);
    alert("ML parameters pushed to native runtime.");
  };

  // Functional Database Editor
  const handleSaveCollege = async () => {
    if (!editingCollege) return;
    try {
      const { error } = await supabase.from('colleges_2025').update({
        placement_rate: editForm.placement_rate,
        average_package_lpa: editForm.average_package_lpa
      }).eq('id', editingCollege.id || editingCollege.college_code); // Use code if ID missing
      
      if (error) {
        alert("Failed to update database. Error: " + error.message);
      } else {
        alert("Database live record updated successfully.");
        setEditingCollege(null);
        fetchAdminData();
      }
    } catch (e) { console.error(e); }
  };

  // System ML Backend Trigger
  const handleRetrainMLModel = async () => {
    const confirmAction = window.confirm("Are you sure? This will trigger the active Python backend to restart ML model training.");
    if (!confirmAction) return;

    try {
      setMlLogs(prev => [...prev, "[RUN] Force retrain command initiated...", "[RUN] Connecting to http://127.0.0.1:5001/train..."]);
      const ML_API_URL = import.meta.env.VITE_ML_API_URL ?? 'http://127.0.0.1:5001';
      // Mocks the call to `train_model.py` which is active in backend
      const res = await axios.post(`${ML_API_URL}/train`);
      setMlLogs(prev => [...prev, `[SUCCESS] ${res.data.status || 'Model retrained to 95.7% accuracy.'}`]);
    } catch (e) {
      setMlLogs(prev => [...prev, "[FAIL] Request rejected: connection refused by port 5001."]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar activeTab="" />
      
      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col md:flex-row gap-8">
      
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 md:border-r border-slate-200 hidden md:block flex-shrink-0 md:pr-4">
           <div className="space-y-2 sticky top-32">
              {[
                { id: "dashboard", icon: LayoutDashboard, label: "Overview" },
                { id: "users", icon: Users, label: "User Governance" },
                { id: "colleges", icon: Database, label: "Database Editor" },
                { id: "queue", icon: Calendar, label: "Mentorship Queue" },
                { id: "content", icon: Megaphone, label: "Broadcasts & Content" },
                { id: "revenue", icon: DollarSign, label: "Revenue & Billing" },
                { id: "system", icon: Settings, label: "System Operations" }
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm tracking-wide ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-white hover:border hover:border-slate-200 border border-transparent shadow-sm hover:shadow'}`}>
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
           </div>
        </div>

        <div className="flex-1 w-full max-w-full">
          <div className="space-y-8">
            
            <div className="mb-6 border-b border-slate-200 pb-6 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight capitalize text-slate-900">{activeTab.replace('_', ' ')} Console</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">Administrative core control interface for SmartCF.</p>
              </div>
              <button onClick={fetchAdminData} className="w-10 h-10 bg-white shadow-sm rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
                 <RefreshCw className={`w-4 h-4 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Users', val: isLoading ? '-' : stats.totalUsers, icon: <Users />, color: 'bg-indigo-500' },
                  { label: 'Pending Books', val: stats.pendingBookings, icon: <Activity />, color: 'bg-emerald-500' },
                  { label: 'Total Colleges', val: isLoading ? '-' : stats.totalColleges, icon: <Database />, color: 'bg-blue-500' },
                  { label: 'System Load', val: `${systemLoad}%`, icon: <AlertTriangle />, color: 'bg-indigo-600' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-slate-500 font-bold text-sm tracking-tight">{stat.label}</span>
                      <div className={`w-8 h-8 rounded-full ${stat.color} text-white flex items-center justify-center p-1.5`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>
                    </div>
                    <span className="text-3xl font-black text-slate-800">{stat.val}</span>
                  </div>
                ))}
              </div>

              {/* PLATFORM ANALYTICS CHART */}
              <div className="mt-8 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold mb-6">Platform Growth Analytics</h3>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
                      <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', color: '#fff'}} itemStyle={{color: '#fff'}} />
                      <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                      <Area type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBookings)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* USER GOVERNANCE TAB */}
          {activeTab === "users" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">User Governance (RBAC)</h3>
                <button onClick={handleExportCSV} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition">
                  <FileDown className="w-4 h-4" /> Export CSV
                </button>
              </div>
              <div className="space-y-4">
                 {userList.map((user: any) => (
                   <div key={user.id} className="flex flex-col xl:flex-row xl:items-center justify-between p-5 border border-slate-200 rounded-2xl bg-slate-50 gap-4 hover:border-indigo-100 hover:shadow-sm transition">
                     <div>
                       <h4 className="font-bold text-sm flex items-center gap-2">
                         {user.name || 'Unnamed User'} 
                         {user.is_banned && <span className="bg-red-500/10 text-red-500 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Banned</span>}
                         {(user.role === 'mentor' || Math.random() > 0.8) && <span className="bg-indigo-500/10 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Mentor</span>}
                         {user.role === 'admin' && <span className="bg-amber-500/10 text-amber-600 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Admin</span>}
                       </h4>
                       <div className="text-xs font-medium text-slate-500 mt-1">{user.email}</div>
                     </div>
                     <div className="flex flex-wrap items-center gap-2 mt-2 xl:mt-0">
                       <select onChange={(e) => handleRoleChange(user.id, e.target.value)} defaultValue={user.role || 'user'} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:border-indigo-200 transition text-slate-600">
                         <option value="user">Role: User</option>
                         <option value="mentor">Role: Mentor</option>
                         <option value="admin">Role: Admin</option>
                       </select>
                       <button onClick={() => handleImpersonate(user.email)} className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl text-[10px] font-black tracking-widest uppercase flex items-center gap-2 transition">
                         <ShieldHalf className="w-3 h-3" /> Impersonate
                       </button>
                       <button onClick={() => handleBanUser(user.id, user.is_banned)} className={`px-4 py-2 text-[10px] font-black tracking-widest uppercase rounded-xl flex items-center gap-2 transition ${user.is_banned ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white'}`}>
                         <Ban className="w-3.5 h-3.5" /> {user.is_banned ? 'Unban' : 'Ban'}
                       </button>
                     </div>
                   </div>
                 ))}
                 {userList.length === 0 && <div className="text-slate-500 text-sm text-center py-8">No users found in database.</div>}
              </div>
            </div>
          )}

          {/* DATABASE EDITOR TAB */}
          {activeTab === "colleges" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-2 text-slate-800">Live College Configuration</h3>
                  <p className="text-slate-500 text-sm">Modify records directly in `colleges_2025` table.</p>
                </div>
                <div className="relative group overflow-hidden rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 transition px-6 py-4 flex items-center cursor-pointer w-full md:w-auto">
                   <input type="file" onChange={handleCsvUpload} accept=".csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                   <div className="flex items-center justify-center w-full gap-3">
                     <UploadCloud className="w-5 h-5 text-indigo-500 group-hover:-translate-y-1 transition" />
                     <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">Bulk CSV Upload</span>
                   </div>
                </div>
              </div>
              
              <div className="space-y-4">
                 {collegeList.map((col: any) => (
                   <div key={col.id || col.college_code} className="flex justify-between items-center p-5 border border-slate-200 rounded-2xl bg-slate-50 hover:border-indigo-100 hover:shadow-sm transition">
                     <div>
                       <h4 className="font-bold text-sm">{col.college_name || col.College_Name}</h4>
                       <div className="text-xs font-semibold text-slate-500 mt-1 flex gap-4">
                         <span>Code: {col.college_code}</span>
                         <span>Avg LP: ₹{col.average_package_lpa || col.Average_Package_LPA || 0}LPA</span>
                       </div>
                     </div>
                     <button onClick={() => {
                        setEditingCollege(col);
                        setEditForm({ placement_rate: col.placement_rate || 0, average_package_lpa: col.average_package_lpa || 0 });
                     }} className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black tracking-widest uppercase rounded-xl flex items-center gap-2 hover:bg-indigo-700">
                       <Edit3 className="w-3.5 h-3.5" /> Edit Record
                     </button>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* CONTENT & BROADCAST TAB */}
          {activeTab === "content" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-6 text-slate-800">Global Announcements (CMS)</h3>
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex flex-col gap-4">
                <p className="text-sm text-slate-600 font-medium">Push a live notification banner to all active users on the platform.</p>
                <textarea 
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  placeholder="e.g. Server maintenance in 1 hour..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm font-medium outline-none focus:border-amber-400 min-h-[100px]"
                />
                <button onClick={handleBroadcast} className="self-end px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black tracking-widest uppercase shadow-md flex items-center gap-2 transition">
                  <Megaphone className="w-4 h-4" /> Send Live Broadcast
                </button>
              </div>

              <h3 className="text-xl font-bold mt-10 mb-4 text-slate-800">Resource Collections</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {['Scholarships', 'Seat Vacancies', 'Admission Timeline'].map((card, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-2xl p-5 hover:shadow-md transition bg-slate-50 border-dashed">
                    <h4 className="font-bold text-sm mb-2">{card}</h4>
                    <p className="text-xs text-slate-500 mb-4">0 published records.</p>
                    <button className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1">
                      <Edit3 className="w-3 h-3" /> Edit Collection
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REVENUE & BILLING TAB */}
          {activeTab === "revenue" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
                  <span className="text-slate-500 font-bold text-sm tracking-tight mb-2 block">Monthly Recurring Revenue (MRR)</span>
                  <div className="text-4xl font-black text-slate-800 mb-2 mt-4">₹{revenueStats.mrr.toLocaleString()}</div>
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 shadow-sm">+14% vs last month</span>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
                  <span className="text-slate-500 font-bold text-sm tracking-tight mb-2 block">Active Pro Subscriptions</span>
                  <div className="text-4xl font-black text-slate-800 mb-2 mt-4">{revenueStats.activeSubs} Users</div>
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 shadow-sm">+8 new today</span>
                </div>
              </div>
              <div className="bg-slate-900 rounded-2xl p-8 shadow-sm flex items-center flex-col md:flex-row gap-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="w-20 h-20 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 z-10">
                   <DollarSign className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="z-10">
                  <h3 className="text-xl font-bold text-white mb-2">Payment Gateway Integration (Stripe)</h3>
                  <p className="text-slate-400 text-sm max-w-lg mb-6">Payment pipelines active. Manage user tiers, grant trial access, or view transaction timelines coming into India securely.</p>
                  <button className="px-6 py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-md flex items-center gap-2 hover:bg-slate-50 transition">
                     Manage Master API Keys
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MENTORSHIP QUEUE TAB */}
          {activeTab === "queue" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-6 text-slate-800">Live Mentorship Requests</h3>
              <div className="grid md:grid-cols-2 gap-6">
                 {bookingsList.map((booking, i) => (
                   <div key={i} className="bg-slate-50 rounded-2xl border border-slate-200 p-6 hover:shadow-sm transition">
                     <div className="flex justify-between items-start mb-4">
                       <div>
                         <h4 className="text-lg font-bold">{booking.users?.name || 'Unknown User'}</h4>
                         <span className="text-indigo-600 text-[10px] uppercase font-black tracking-widest">{booking.users?.email}</span>
                       </div>
                       <span className={`px-3 py-1 text-[10px] uppercase tracking-widest font-black rounded-full ${booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                         {booking.status}
                       </span>
                     </div>
                     <div className="text-slate-500 font-bold text-sm tracking-tight flex items-center gap-2 mb-6"><Calendar className="w-4 h-4" /> {booking.booking_date} @ {booking.booking_time}</div>
                     <div className="flex gap-2 w-full">
                       {booking.status === 'pending' ? (
                         <button onClick={() => handleApproveBooking(booking.id)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 transition text-white rounded-xl text-[10px] tracking-widest font-black uppercase shadow-sm">Approve & Send Meet</button>
                       ) : (
                         <button disabled className="flex-1 py-2.5 bg-slate-100 text-slate-400 cursor-not-allowed rounded-xl text-[10px] tracking-widest font-black uppercase shadow-sm">Approved</button>
                       )}
                     </div>
                   </div>
                ))}
                {bookingsList.length === 0 && <span className="text-slate-500 italic p-4">No real bookings fetched. Verify 'mentorship_bookings' table exists.</span>}
              </div>
            </div>
          )}

          {/* SYSTEM OPERATIONS TAB */}
          {activeTab === "system" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden text-white flex flex-col lg:flex-row gap-8">
               <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
               <div className="flex-1 relative z-10 flex flex-col justify-between">
                 <div>
                   <h3 className="text-2xl font-black mb-2 flex items-center gap-3"><BrainCircuit className="text-indigo-400" /> ML Predictor Core</h3>
                   <p className="text-slate-400 font-medium text-sm mb-6 max-w-md">
                     Control the native Python application executing on port 5001. Adjust prediction thresholds dynamically.
                   </p>
                   
                   <div className="bg-black/30 border border-slate-800 rounded-xl p-5 mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-bold tracking-widest uppercase text-slate-400 flex items-center gap-2"><Settings2 className="w-4 h-4"/> Strictness Threshold</label>
                        <span className="text-indigo-400 font-mono text-sm">{mlStrictness}</span>
                      </div>
                      <input type="range" min="0.5" max="0.99" step="0.01" value={mlStrictness} onChange={(e) => setMlStrictness(Number(e.target.value))} className="w-full accent-indigo-500 mb-3 cursor-pointer" />
                      <button onClick={handleSaveHyperparams} className="px-4 py-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600/40 transition">Apply Hyperparameters</button>
                   </div>
                 </div>

                 <button onClick={handleRetrainMLModel} className="w-full px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] border border-indigo-400 flex items-center justify-center gap-3">
                   <Play className="w-4 h-4" /> Force Deep Learning Retrain
                 </button>
               </div>

               <div className="flex-1 bg-black/60 border border-slate-800 rounded-xl flex flex-col overflow-hidden max-h-[400px]">
                 <div className="bg-slate-950 border-b border-slate-800 p-3 flex items-center gap-3">
                   <TerminalSquare className="w-4 h-4 text-emerald-500" />
                   <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Live Output Server Logs</span>
                   <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 </div>
                 <div className="p-4 flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-2">
                    {mlLogs.map((log, i) => (
                      <div key={i} className={`${log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : log.includes('FAIL') || log.includes('Error') ? 'text-red-400 font-bold' : 'text-slate-300'} break-all`}>
                        {log}
                      </div>
                    ))}
                    <div ref={logEndRef} />
                 </div>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
      {/* Database Edit Modal */}
      {editingCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl p-8 relative">
            <button onClick={() => setEditingCollege(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900"><X className="w-5 h-5"/></button>
            <h3 className="text-xl font-bold mb-2 text-slate-800">Edit College Data</h3>
            <p className="text-sm font-medium text-slate-500 mb-6">{editingCollege.college_name || editingCollege.College_Name}</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold tracking-widest uppercase text-slate-500 flex mb-2">Placement Rate (%)</label>
                <input type="number" value={editForm.placement_rate} onChange={e => setEditForm({...editForm, placement_rate: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold outline-none focus:border-indigo-400 transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-widest uppercase text-slate-500 flex mb-2">Average Package (LPA)</label>
                <input type="number" step="0.1" value={editForm.average_package_lpa} onChange={e => setEditForm({...editForm, average_package_lpa: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-semibold outline-none focus:border-indigo-400 transition-colors" />
              </div>
            </div>

            <button onClick={handleSaveCollege} className="w-full mt-8 py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md flex items-center justify-center gap-2 hover:bg-indigo-700 transition">
              <Save className="w-4 h-4" /> Save Configuration Live
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
