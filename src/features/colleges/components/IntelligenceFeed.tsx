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

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'URGENT': return 'text-rose-600 bg-rose-50';
      case 'SCHOLARSHIP': return 'text-emerald-600 bg-emerald-50';
      case 'ACADEMIC': return 'text-blue-600 bg-blue-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

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
    <div className="space-y-10 pb-12">
      <div className="border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Intelligence Feed</h2>
        <p className="text-slate-500 text-sm mt-1">Real-time updates and directives related to {collegeName} and DSE Admissions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Campus News */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Campus Updates</h3>
          <div className="space-y-4">
            {campusNews.map((news, i) => (
              <div
                key={i}
                onClick={() => window.open(news.url, '_blank')}
                className="group cursor-pointer bg-white p-6 border border-slate-100 rounded-2xl hover:border-indigo-100 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${getTypeStyle(news.type)}`}>
                    {news.type}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{news.date}</span>
                </div>
                <h4 className="font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors uppercase text-sm tracking-tight">{news.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">{news.desc}</p>
                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400">{news.source}</span>
                  <span className="text-[10px] font-bold text-indigo-500 group-hover:underline">Read Info</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Central Updates */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Admission Directives</h3>
          <div className="space-y-4">
            {centralNews.map((news, i) => (
              <div
                key={i}
                onClick={() => window.open(news.url, '_blank')}
                className="group cursor-pointer bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:bg-white hover:border-slate-200 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${getTypeStyle(news.type)}`}>
                    {news.type}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{news.date}</span>
                </div>
                <h4 className="font-bold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors uppercase text-sm tracking-tight">{news.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2">{news.desc}</p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{news.source}</span>
                  <span className="text-[10px] font-bold text-rose-500 group-hover:underline">View Source</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <button
          onClick={fetchIntelligence}
          className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors"
        >
          Refresh Intelligence
        </button>
      </div>
    </div>
  );
};
