"use client";

export default function ComplexityMeter({ score }: { score: number }) {
  const normalized = Math.max(0, Math.min(100, score));
  const level = normalized < 35 ? "Basic" : normalized < 70 ? "Intermediate" : "Advanced";
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Complexidade</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-fuchsia-500" style={{ width: `${normalized}%` }} />
      </div>
      <p className="mt-2 text-sm text-gray-200">{normalized}% - {level}</p>
    </div>
  );
}
