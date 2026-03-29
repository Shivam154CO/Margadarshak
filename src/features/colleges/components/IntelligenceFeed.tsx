import React from 'react';

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

export const IntelligenceFeed: React.FC<IntelligenceFeedProps> = ({ collegeName }) => {
  const campusNews: NewsItem[] = [
    {
      title: `Expansion of AI Intake at ${collegeName.split(' ')[0]}`,
      source: "HT Education News",
      date: "2 days ago",
      type: "NEWS",
      desc: "University Senate approves doubling of seats in Computer and AI branches for upcoming session.",
      url: "https://www.hindustantimes.com/education"
    },
    {
      title: "Industry Tie-ups: New Tech Hub Inauguration",
      source: "Pune Mirror: Tech",
      date: "1 week ago",
      type: "BLOG",
      desc: "The institution inaugurates a state-of-the-art incubation center for emerging technologies in the region.",
      url: "https://punemirror.com"
    },
    {
      title: "Student Experience: The Real Vibe of Campus",
      source: "Student Community Blog",
      date: "3 weeks ago",
      type: "BLOG",
      desc: "An unfiltered look at life on campus, hostel facilities, and the upcoming cultural festival preparations.",
      url: "https://studentblog.org"
    }
  ];

  const centralNews: NewsItem[] = [
    {
      title: "DSE 2024-25: Revised Final Merit List Released",
      source: "CET Cell Portal",
      date: "Real-Time",
      type: "URGENT",
      desc: "The State Common Entrance Test Cell has published the updated final merit list for Direct Second Year Engineering.",
      url: "https://fe2024.mahacet.org"
    },
    {
      title: "Bridge Course Notification for Diploma Students",
      source: "MSBTE / DTE",
      date: "4 days ago",
      type: "ACADEMIC",
      desc: "New guidelines for mandatory bridge courses in Mathematics and Applied Sciences for DSE admissions.",
      url: "https://dte.maharashtra.gov.in"
    },
    {
      title: "DSE Fee Waiver: EWS/EBC Eligibility Update",
      source: "MahaDBT Support",
      date: "1 week ago",
      type: "SCHOLARSHIP",
      desc: "Important clarification on fee reimbursement for diploma candidates moving into third-year degree programs.",
      url: "https://mahadbt.maharashtra.gov.in"
    }
  ];

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'URGENT': return 'text-rose-600 bg-rose-50';
      case 'SCHOLARSHIP': return 'text-emerald-600 bg-emerald-50';
      case 'ACADEMIC': return 'text-blue-600 bg-blue-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-10 pb-12">
      <div className="border-b border-slate-100 pb-6">
        <h2 className="text-2xl font-bold text-slate-900">Intelligence Feed</h2>
        <p className="text-slate-500 text-sm mt-1">Updates and announcements related to {collegeName}.</p>
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
        <button className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors">
          Refresh Intelligence
        </button>
      </div>
    </div>
  );
};
