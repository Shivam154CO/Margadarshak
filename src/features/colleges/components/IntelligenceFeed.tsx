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
      <div className="py-12 text-center">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Updating Feed</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center border border-slate-100 rounded-xl">
        <p className="text-slate-500 text-sm">{error}</p>
        <button
          onClick={fetchIntelligence}
          className="mt-4 text-xs font-bold text-slate-900 hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white my-8">
      <div className="space-y-10">
        <div className="flex items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Intelligence Feed</h2>
            <p className="text-slate-500 text-sm mt-1">Updates for {collegeName}</p>
          </div>
          <button
            onClick={fetchIntelligence}
            className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
          >
             Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Campus News */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Campus Updates</h3>
            
            {campusNews.length === 0 ? (
               <p className="text-slate-400 text-sm italic">No recent updates.</p>
            ) : (
              <div className="space-y-8">
                {campusNews.map((news, i) => (
                  <div
                    key={i}
                    onClick={() => window.open(news.url, '_blank')}
                    className="group cursor-pointer block"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {news.type}
                      </span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full" />
                      <span className="text-[10px] font-medium text-slate-400">{news.date}</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {news.title}
                    </h4>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed line-clamp-2">{news.desc}</p>
                    <div className="mt-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
                      {news.source}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Central Updates */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">State Directives</h3>
            
            {centralNews.length === 0 ? (
               <p className="text-slate-400 text-sm italic">No recent directives.</p>
            ) : (
              <div className="space-y-8">
                {centralNews.map((news, i) => (
                  <div
                    key={i}
                    onClick={() => window.open(news.url, '_blank')}
                    className="group cursor-pointer block"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {news.type}
                      </span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full" />
                      <span className="text-[10px] font-medium text-slate-400">{news.date}</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors leading-snug">
                      {news.title}
                    </h4>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed line-clamp-2">{news.desc}</p>
                    <div className="mt-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-rose-600 transition-colors">
                      {news.source}
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
