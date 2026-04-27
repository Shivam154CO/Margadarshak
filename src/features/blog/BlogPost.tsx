import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEO from "../../components/SEO";

export default function BlogPost() {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans pt-24 pb-20 px-6">
      <SEO title={`${slug?.replace(/-/g, ' ').toUpperCase()} | SmartCF`} description="Expert insights for engineering admissions." />
      
      <article className="max-w-3xl mx-auto space-y-10">
        <Link to="/blog" className="inline-flex items-center text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold text-sm uppercase tracking-widest transition">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Journal
        </Link>
        
        <div className="space-y-6">
          <span className="text-sm font-bold text-indigo-600 tracking-widest uppercase">Admission Guide</span>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight capitalize">
            {slug?.replace(/-/g, ' ')}
          </h1>
          <div className="flex items-center gap-4 text-slate-500 font-medium pt-4 border-t border-slate-100 dark:border-white/10">
            <span>By SmartCF Editorial</span>
            <span>•</span>
            <span>5 min read</span>
          </div>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-p:font-medium prose-p:text-slate-600 dark:prose-p:text-slate-400">
          <p>This is a placeholder for the article content. In a production environment, this would be fetched from a headless CMS like Sanity, Strapi, or loaded via MDX files to ensure optimal SEO performance.</p>
          <h2>The Main Challenge</h2>
          <p>Navigating the DTE Maharashtra admission process can be incredibly stressful for students and parents alike. Relying on outdated PDFs leads to sub-optimal college choices.</p>
          <h2>The Solution</h2>
          <p>Using predictive AI models, an admission seeker can accurately forecast their chances round-by-round, ensuring they craft the perfect option form.</p>
        </div>
      </article>
    </div>
  );
}
