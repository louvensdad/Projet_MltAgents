"use client";

export default function CostEstimate({ complexity }: { complexity: number }) {
  const tier = complexity < 35 ? "Low" : complexity < 70 ? "Medium" : "High";
  const estimate = complexity < 35 ? "$" : complexity < 70 ? "$$" : "$$$";
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Custo Operacional</p>
      <p className="mt-2 text-sm text-gray-200">{tier} ({estimate})</p>
    </div>
  );
}
