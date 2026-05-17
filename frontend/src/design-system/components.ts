export const premiumClasses = {
  shell: "relative overflow-hidden",
  card: "rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
  cardHover: "transition-transform duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-[0_18px_60px_rgba(0,0,0,0.42)]",
  button: "rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition-all hover:bg-white/10",
  buttonPrimary: "rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90",
  badge: "rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300",
} as const;

