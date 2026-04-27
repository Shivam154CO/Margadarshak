import React, { useState, useEffect } from 'react';

interface NewsItem {
  title: string;
  source: string;
  date: string;
  type: 'NEWS' | 'BLOG' | 'URGENT' | 'ACADEMIC' | 'SCHOLARSHIP';
  desc: string;
  url: string;
}

interface IntelligenceFeedProps {
  collegeName: string;
}

const ML_API_URL = import.meta.env.VITE_ML_API_URL ?? 'http://127.0.0.1:5001';

export const IntelligenceFeed: React.FC<IntelligenceFeedProps> = ({ collegeName }) => {
  const [campusNews, setCampusNews] = useState<NewsItem[]>([]);
  const [centralNews, setCentralNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntelligence = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${ML_API_URL}/college_intelligence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          college_name: collegeName,
          exam_type: 'DSE',
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch intelligence');

      const data = await response.json();
      setCampusNews(data.campus || []);
      setCentralNews(data.central || []);
    } catch (err: any) {
      console.error('Error fetching intelligence:', err);
      setError('Failed to load real-time intelligence.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelligence();
  }, [collegeName]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">Scanning Intelligence Sources...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center bg-rose-50 rounded-3xl border border-rose-100">
        <p className="text-rose-600 text-sm font-bold">{error}</p>
        <button
          onClick={fetchIntelligence}
          className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
        >
          Retry Scan
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-6 lg:p-10 my-6 overflow-hidden relative shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-slate-800">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 space-y-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Intelligence Feed
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </h2>
            <p className="text-slate-400 font-medium text-sm mt-1">Real-time institutional directives for {collegeName}.</p>
          </div>
          <button
            onClick={fetchIntelligence}
            className="px-6 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
          >
             Refresh Feed
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Campus News */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
               <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Campus Specific</span>
            </div>
            
            {campusNews.length === 0 ? (
               <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
                 <p className="text-slate-400 text-sm font-medium">No recent isolated campus updates.</p>
               </div>
            ) : (
              <div className="space-y-4">
                {campusNews.map((news, i) => (
                  <div
                    key={i}
                    onClick={() => window.open(news.url, '_blank')}
                    className="group cursor-pointer bg-white/5 p-6 md:p-8 border border-white/10 rounded-3xl hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border ${
                        news.type === 'URGENT' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 
                        news.type === 'SCHOLARSHIP' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 
                        'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      }`}>
                        {news.type}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-900/50 px-2.5 py-1 rounded-md">{news.date}</span>
                    </div>
                    <h4 className="font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors text-base md:text-lg tracking-tight leading-snug">{news.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium line-clamp-3">{news.desc}</p>
                    <div className="mt-5 pt-5 border-t border-white/10 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{news.source}</span>
                      <span className="text-[10px] font-bold text-indigo-400 group-hover:underline">Read Directive  &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Central Updates */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
               <span className="text-xs font-black text-rose-400 uppercase tracking-widest">State Directives</span>
            </div>
            
            {centralNews.length === 0 ? (
               <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
                 <p className="text-slate-400 text-sm font-medium">No recent central admission directives.</p>
               </div>
            ) : (
              <div className="space-y-4">
                {centralNews.map((news, i) => (
                  <div
                    key={i}
                    onClick={() => window.open(news.url, '_blank')}
                    className="group cursor-pointer bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-3xl p-6 md:p-8 hover:border-rose-500/30 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border border-slate-700 bg-slate-800 text-slate-300`}>
                        {news.type}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-black/30 px-2.5 py-1 rounded-md">{news.date}</span>
                    </div>
                    <h4 className="font-bold text-white mb-3 group-hover:text-rose-400 transition-colors text-base md:text-lg tracking-tight leading-snug">{news.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium line-clamp-3">{news.desc}</p>
                    <div className="mt-5 pt-5 border-t border-white/10 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{news.source}</span>
                      <span className="text-[10px] font-bold text-rose-400 group-hover:underline">View Source &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
