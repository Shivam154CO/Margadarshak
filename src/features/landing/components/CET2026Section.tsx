export default function CET2026Section() {
  return (
    <section className="py-16 md:py-24 px-4 md:px-6 relative bg-white" data-theme="light">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center space-y-8 md:space-y-12">
          <h2 className="text-4xl md:text-7xl lg:text-[100px] font-black text-slate-900 tracking-tighter leading-none">
            CET 2026 <br /> <span className="italic text-rose-600">Live Soon.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {[
              { label: "Predictor", value: "95.7%", sub: "Precision Ready" },
              { label: "Institutions", value: "340+", sub: "Official Data" },
              { label: "Status", value: "Optimizing", sub: "Final Testing" }
            ].map((stat, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-[24px] p-6 lg:p-8">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">{stat.label}</div>
                <div className="text-3xl font-extrabold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
