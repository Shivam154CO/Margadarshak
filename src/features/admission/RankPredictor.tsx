import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Award, TrendingUp, Info } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const ML_API_URL = import.meta.env.VITE_ML_API_URL ?? 'http://127.0.0.1:5000';

export default function RankPredictor() {
  const [score, setScore] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ min_rank: number; max_rank: number; predicted_rank: number; message: string } | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(score);
    if (!val || val < 40 || val > 100) {
      setError("Please enter a valid diploma percentage between 40 and 100.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${ML_API_URL}/predict_rank`, { score: val });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to predict rank. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-indigo-100">
      <SEO title="State Rank Predictor | IKIGAI" description="Predict your DSE State Merit Rank based on diploma aggregate score." />
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-4">
            <Calculator className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">State Rank Predictor</h1>
          <p className="text-slate-500 mt-2 max-w-lg mx-auto">
            Input your final diploma aggregate percentage to get an estimated State Merit Rank based on historical CAP round data.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm max-w-2xl mx-auto">
          <form onSubmit={handlePredict} className="space-y-6">
            <div>
              <label htmlFor="score" className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Diploma Aggregate (%)
              </label>
              <div className="relative">
                <input
                  id="score"
                  type="number"
                  step="0.01"
                  autoFocus
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="e.g. 88.50"
                  className="w-full text-2xl font-bold text-slate-900 placeholder:text-slate-300 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 text-rose-700 rounded-xl text-sm font-semibold flex items-center gap-2">
                <Info className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !score}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-indigo-600/20"
            >
              {loading ? "Analyzing Historical Data..." : "Predict Exact Rank"}
            </button>
          </form>
        </div>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8"
            >
              <div className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />
                
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6 text-indigo-400" />
                  Your Estimated Rank Profile
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/20 rounded-2xl p-6 border border-white/5 backdrop-blur-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Optimistic (Best Case)</p>
                    <p className="text-2xl font-bold text-emerald-400">{result.min_rank.toLocaleString()}</p>
                  </div>
                  <div className="bg-indigo-600/20 rounded-2xl p-6 border border-indigo-500/30 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1 relative z-10">Predicted Rank</p>
                    <p className="text-4xl font-black text-white relative z-10">{result.predicted_rank.toLocaleString()}</p>
                  </div>
                  <div className="bg-black/20 rounded-2xl p-6 border border-white/5 backdrop-blur-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conservative (Worst Case)</p>
                    <p className="text-2xl font-bold text-rose-400">{result.max_rank.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <TrendingUp className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">
                    <strong className="text-white">What this means:</strong> Based on the intense competition in Maharashtra state counseling for Direct Second Year Engineering, a score of {parseFloat(score).toFixed(2)}% generally places you within the <span className="text-indigo-300 font-bold">{result.min_rank.toLocaleString()} to {result.max_rank.toLocaleString()}</span> rank bracket. This provides a strong foundation for your CAP round option form.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
