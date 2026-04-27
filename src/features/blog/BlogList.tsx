import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import SEO from "../../components/SEO";

export default function BlogList() {
  const articles = [
    { slug: "top-10-pune-colleges", title: "Top 10 Engineering Colleges in Pune (2026)", excerpt: "Discover the best colleges in the Oxford of the East based on actual placement data.", date: "April 24, 2026" },
    { slug: "mht-cet-vs-jee", title: "MHT-CET vs JEE Mains: What should MH students focus on?", excerpt: "A deep dive into the syllabus, difficulty, and admission quotas for Maharashtra state students.", date: "April 20, 2026" },
    { slug: "dse-admission-guide", title: "Direct Second Year (DSE) Admission Guide", excerpt: "Everything you need to know about the Diploma to Degree pathway in Maharashtra.", date: "April 15, 2026" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pt-24 pb-20 px-6">
      <SEO title="Admissions Blog | SmartCF" description="Latest news, guides, and tips for engineering admissions." />
      
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="space-y-4">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">The SmartCF <span className="text-indigo-600">Journal.</span></h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium max-w-2xl">Expert insights, admission hacks, and deep dives into the Maharashtra engineering ecosystem.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <Link key={article.slug} to={`/blog/${article.slug}`} className="group bg-white dark:bg-slate-900 rounded-[30px] p-8 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl transition-all block">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-4 block">{article.date}</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{article.title}</h2>
              <p className="text-slate-600 dark:text-slate-400 font-medium mb-6">{article.excerpt}</p>
              <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-widest uppercase">
                Read Article <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
